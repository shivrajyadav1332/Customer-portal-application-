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
import { MatBadgeModule } from '@angular/material/badge';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { VehicleTrackingService } from '../../core/services/vehicle-tracking.service';
import { Vehicle, VehicleStatus } from '../../core/models/vehicle.model';
import { PaginatedResponse } from '../../core/models/api-response.model';

@Component({
  selector: 'app-vehicles',
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
    MatBadgeModule
  ],
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehiclesComponent implements OnInit, OnDestroy {
  private vehicleTrackingService = inject(VehicleTrackingService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  vehicles: Vehicle[] = [];
  isLoading = true;
  searchQuery = '';
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  displayedColumns = ['vehicleNumber', 'vehicleType', 'driverName', 'entryTime', 'status', 'currentWeight', 'actions'];
  statusFilters = Object.values(VehicleStatus);
  selectedStatus: string | null = null;

  vehicleStats = {
    total: 0,
    inside: 0,
    exited: 0,
    onWeighbridge: 0
  };

  ngOnInit(): void {
    this.loadVehicles();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadVehicles(): void {
    this.isLoading = true;
    if (this.selectedStatus) {
      this.vehicleTrackingService.getVehiclesByStatus(this.selectedStatus as VehicleStatus)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.vehicles = data;
            this.totalCount = data.length;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error loading vehicles:', err);
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    } else if (this.searchQuery) {
      this.vehicleTrackingService.searchVehicles(this.searchQuery)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data) => {
            this.vehicles = data;
            this.totalCount = data.length;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error searching vehicles:', err);
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      this.vehicleTrackingService.getVehicles(this.pageNumber, this.pageSize)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (data: PaginatedResponse<Vehicle>) => {
            this.vehicles = data.data;
            this.totalCount = data.totalCount;
            this.totalPages = data.totalPages;
            this.isLoading = false;
            this.cdr.markForCheck();
          },
          error: (err) => {
            console.error('Error loading vehicles:', err);
            this.isLoading = false;
            this.cdr.markForCheck();
          }
        });
    }
  }

  loadStats(): void {
    this.vehicleTrackingService.getTodayVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.vehicleStats.total = data.length;
        this.vehicleStats.inside = data.filter(v => v.status !== VehicleStatus.Exited).length;
        this.vehicleStats.exited = data.filter(v => v.status === VehicleStatus.Exited).length;
        this.vehicleStats.onWeighbridge = data.filter(v => v.status === VehicleStatus.OnWeighbridge).length;
        this.cdr.markForCheck();
      });
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadVehicles();
  }

  onSearch(): void {
    this.pageNumber = 1;
    this.loadVehicles();
  }

  filterByStatus(status: string | null): void {
    this.selectedStatus = status === this.selectedStatus ? null : status;
    this.pageNumber = 1;
    this.loadVehicles();
  }

  getStatusColor(status: VehicleStatus): string {
    const colors: Record<VehicleStatus, string> = {
      [VehicleStatus.Pending]: 'info',
      [VehicleStatus.Entered]: 'accent',
      [VehicleStatus.OnWeighbridge]: 'warn',
      [VehicleStatus.Weighed]: 'primary',
      [VehicleStatus.ReadyToExit]: 'accent',
      [VehicleStatus.Exited]: 'success',
      [VehicleStatus.Failed]: 'error'
    };
    return colors[status] || 'info';
  }

  viewDetails(vehicle: Vehicle): void {
    console.log('View details for:', vehicle);
  }

  exportData(): void {
    console.log('Exporting vehicle tracking data');
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.selectedStatus = null;
    this.pageNumber = 1;
    this.loadVehicles();
  }
}
