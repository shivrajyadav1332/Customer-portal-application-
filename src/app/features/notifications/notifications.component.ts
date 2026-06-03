import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationManagementService } from '../../core/services/notification-management.service';
import { Notification, NotificationPreferences } from '../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
    FormsModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationManagementService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  notifications: Notification[] = [];
  preferences: NotificationPreferences | null = null;
  isLoading = true;
  unreadCount = 0;

  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;

  displayedColumns = ['title', 'message', 'type', 'createdAt', 'actions'];

  ngOnInit(): void {
    this.loadNotifications();
    this.loadPreferences();
    this.subscribeToUnreadCount();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getNotifications(this.pageNumber, this.pageSize)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.notifications = data.data;
          this.totalCount = data.total;
          this.unreadCount = data.unread;
          this.isLoading = false;
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('Error loading notifications:', err);
          this.isLoading = false;
          this.cdr.markForCheck();
        }
      });
  }

  loadPreferences(): void {
    this.notificationService.getPreferences()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.preferences = data;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('Error loading preferences:', err)
      });
  }

  subscribeToUnreadCount(): void {
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe((count) => {
        this.unreadCount = count;
        this.cdr.markForCheck();
      });
  }

  markAsRead(notification: Notification): void {
    this.notificationService.markAsRead(notification.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  deleteNotification(id: string): void {
    this.notificationService.deleteNotification(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  clearAll(): void {
    this.notificationService.clearAllNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadNotifications();
      });
  }

  updatePreferences(): void {
    if (this.preferences) {
      this.notificationService.updatePreferences(this.preferences)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.cdr.markForCheck();
        });
    }
  }

  onPageChange(event: PageEvent): void {
    this.pageNumber = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadNotifications();
  }
}
