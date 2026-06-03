import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WeighbridgeService } from '../../core/services/weighbridge.service';
import { WeighbridgeReport } from '../../core/models/report.model';
import { PaginatedResponse } from '../../core/models/api-response.model';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent implements OnInit, OnDestroy {
  private weighbridgeService = inject(WeighbridgeService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  reports: WeighbridgeReport[] = [];
  isLoading = true;
  searchQuery = '';
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  displayedColumns = ['ticketNumber', 'vehicleNumber', 'driverName', 'vehicleType', 'grossWeight', 'tareWeight', 'netWeight', 'transactionDate', 'actions'];

  weighbridgeStats = {
    totalWeighing: 0,
    totalGrossWeight: 0,
    totalNetWeight: 0,
    averageGrossWeight: 0,
    averageNetWeight: 0
  };

  ngOnInit(): void {
    this.loadReports();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReports(): void {
    this.isLoading = true;
    if (this.searchQuery) {
      this.weighbridgeService.searchReports(this.searchQuery)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.reports = data;
            this.totalCount = data.length;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error loading reports:', err);
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.weighbridgeService.getReports(this.pageNumber, this.pageSize)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: PaginatedResponse<WeighbridgeReport>) => {
            this.reports = data.data;
            this.totalCount = data.totalCount;
            this.totalPages = data.totalPages;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error loading reports:', err);
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  loadStats(): void {
    this.weighbridgeService.getWeighbridgeStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.weighbridgeStats = data;
        this.cdr.markForCheck();
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadReports();
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadReports();
  }

  exportReports(format: 'pdf' | 'excel' | 'csv'): void {
    this.weighbridgeService.exportReports(format)
      .pipe(takeUntil(this.destroy$))
      .subscribe((blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `weighbridge-report.${format}`;
        link.click();
      });
  }

  printSlip(report: WeighbridgeReport): void {
    console.log('Printing slip for:', report);
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.pageNumber = 1;
    this.loadReports();
  }
}
