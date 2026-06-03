import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AnalyticsService, AnalyticsData } from '../../core/services/analytics.service';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatGridListModule, MatTableModule, MatProgressSpinnerModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  private analyticsService = inject(AnalyticsService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  analyticsData: AnalyticsData | null = null;
  isLoading = true;

  displayedColumnsVehicles = ['vehicleNumber', 'tripCount', 'totalWeight', 'efficiency'];
  displayedColumnsDrivers = ['name', 'trips', 'totalWeight'];

  ngOnInit(): void {
    this.loadAnalytics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalytics(): void {
    this.isLoading = true;
    this.analyticsService.getAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.analyticsData = data;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading analytics:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  exportReport(format: string): void {
    console.log('Exporting analytics report as', format);
  }
}
