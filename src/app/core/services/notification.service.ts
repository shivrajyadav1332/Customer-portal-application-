import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Notification, NotificationPreferences } from '../models/notification.model';
import { PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/notifications`;

  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  getNotifications(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Notification>> {
    let params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<PaginatedResponse<Notification>>(this.apiUrl, { params });
  }

  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/mark-all-read`, {}).pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
      })
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  getNotificationPreferences(customerId: string): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/preferences/${customerId}`);
  }

  updateNotificationPreferences(customerId: string, preferences: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.apiUrl}/preferences/${customerId}`, preferences);
  }

  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }
}
