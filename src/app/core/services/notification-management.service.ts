import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Notification, NotificationType, NotificationStatus, NotificationPreferences } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationManagementService {

  private unreadCountSubject = new BehaviorSubject<number>(5);
  unreadCount$ = this.unreadCountSubject.asObservable();

  private mockNotifications: Notification[] = [
    {
      id: 'n-001',
      customerId: 'cust-001',
      title: 'Vehicle Arrived',
      message: 'Vehicle HR-26-AB-1234 has arrived at the gate',
      type: NotificationType.VehicleArrived,
      status: NotificationStatus.Unread,
      vehicleId: 'v-001',
      vehicleNumber: 'HR-26-AB-1234',
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
      actionUrl: '/vehicle-tracking/v-001'
    },
    {
      id: 'n-002',
      customerId: 'cust-001',
      title: 'Weight Captured',
      message: 'Vehicle DL-01-CD-5678 weight captured: Gross 12000kg, Net 8000kg',
      type: NotificationType.WeightCaptured,
      status: NotificationStatus.Unread,
      vehicleId: 'v-002',
      vehicleNumber: 'DL-01-CD-5678',
      createdAt: new Date(Date.now() - 15 * 60 * 1000),
      actionUrl: '/weighbridge'
    },
    {
      id: 'n-003',
      customerId: 'cust-001',
      title: 'Vehicle Exited',
      message: 'Vehicle KA-03-GH-3456 has exited the facility',
      type: NotificationType.VehicleExited,
      status: NotificationStatus.Read,
      vehicleId: 'v-004',
      vehicleNumber: 'KA-03-GH-3456',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 50 * 60 * 1000),
      actionUrl: '/vehicle-tracking/v-004'
    },
    {
      id: 'n-004',
      customerId: 'cust-001',
      title: 'System Alert',
      message: 'Gate 1 camera needs attention - poor image quality detected',
      type: NotificationType.SystemAlert,
      status: NotificationStatus.Unread,
      createdAt: new Date(Date.now() - 30 * 60 * 1000),
      actionUrl: '/live-monitoring'
    },
    {
      id: 'n-005',
      customerId: 'cust-001',
      title: 'Vehicle Processed',
      message: 'Vehicle MH-02-EF-9012 processing completed. Ready for exit.',
      type: NotificationType.VehicleProcessed,
      status: NotificationStatus.Unread,
      vehicleId: 'v-003',
      vehicleNumber: 'MH-02-EF-9012',
      createdAt: new Date(Date.now() - 20 * 60 * 1000),
      actionUrl: '/vehicle-tracking/v-003'
    },
    {
      id: 'n-006',
      customerId: 'cust-001',
      title: 'Maintenance Alert',
      message: 'Weighbridge calibration due in 5 days. Schedule maintenance.',
      type: NotificationType.MaintenanceAlert,
      status: NotificationStatus.Read,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      readAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      actionUrl: '/settings'
    }
  ];

  private mockPreferences: NotificationPreferences = {
    vehicleArrivedEnabled: true,
    vehicleExitedEnabled: true,
    weightCapturedEnabled: true,
    systemAlertsEnabled: true,
    emailNotifications: true,
    pushNotifications: true
  };

  getNotifications(pageNumber: number = 1, pageSize: number = 10): Observable<{
    data: Notification[];
    total: number;
    unread: number;
  }> {
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedData = this.mockNotifications.slice(startIndex, startIndex + pageSize);
    const unreadCount = this.mockNotifications.filter(n => n.status === NotificationStatus.Unread).length;
    
    return of({
      data: paginatedData,
      total: this.mockNotifications.length,
      unread: unreadCount
    }).pipe(delay(400));
  }

  getUnreadNotifications(): Observable<Notification[]> {
    const unread = this.mockNotifications.filter(n => n.status === NotificationStatus.Unread);
    return of(unread).pipe(delay(300));
  }

  getNotificationById(id: string): Observable<Notification> {
    const notification = this.mockNotifications.find(n => n.id === id);
    return of(notification || this.mockNotifications[0]).pipe(delay(200));
  }

  markAsRead(id: string): Observable<{ success: boolean }> {
    const notification = this.mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.status = NotificationStatus.Read;
      notification.readAt = new Date();
      const unreadCount = this.mockNotifications.filter(n => n.status === NotificationStatus.Unread).length;
      this.unreadCountSubject.next(unreadCount);
    }
    return of({ success: true }).pipe(delay(200));
  }

  markAllAsRead(): Observable<{ success: boolean }> {
    this.mockNotifications.forEach(n => {
      if (n.status === NotificationStatus.Unread) {
        n.status = NotificationStatus.Read;
        n.readAt = new Date();
      }
    });
    this.unreadCountSubject.next(0);
    return of({ success: true }).pipe(delay(300));
  }

  deleteNotification(id: string): Observable<{ success: boolean }> {
    const index = this.mockNotifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.mockNotifications.splice(index, 1);
    }
    return of({ success: true }).pipe(delay(200));
  }

  clearAllNotifications(): Observable<{ success: boolean }> {
    this.mockNotifications = [];
    this.unreadCountSubject.next(0);
    return of({ success: true }).pipe(delay(300));
  }

  archiveNotification(id: string): Observable<{ success: boolean }> {
    const notification = this.mockNotifications.find(n => n.id === id);
    if (notification) {
      notification.status = NotificationStatus.Archived;
    }
    return of({ success: true }).pipe(delay(200));
  }

  getNotificationsByType(type: NotificationType): Observable<Notification[]> {
    const filtered = this.mockNotifications.filter(n => n.type === type);
    return of(filtered).pipe(delay(300));
  }

  getPreferences(): Observable<NotificationPreferences> {
    return of(this.mockPreferences).pipe(delay(300));
  }

  updatePreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    this.mockPreferences = { ...this.mockPreferences, ...preferences };
    return of(this.mockPreferences).pipe(delay(300));
  }

  getUnreadCount(): Observable<number> {
    const count = this.mockNotifications.filter(n => n.status === NotificationStatus.Unread).length;
    this.unreadCountSubject.next(count);
    return of(count).pipe(delay(200));
  }
}
