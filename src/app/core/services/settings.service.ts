import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface ApplicationSettings {
  companyName: string;
  logoUrl: string;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  maxUploadSize: number;
  sessionTimeout: number;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  notificationFrequency: 'instant' | 'hourly' | 'daily';
  quietHoursStart: string;
  quietHoursEnd: string;
}

export interface SecuritySettings {
  passwordMinLength: number;
  passwordRequireUpperCase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChar: boolean;
  passwordExpiryDays: number;
  maxLoginAttempts: number;
  lockoutDurationMinutes: number;
  enableTwoFactorAuth: boolean;
}

export interface APISettings {
  apiKey: string;
  apiSecret: string;
  rateLimitPerMinute: number;
  enableWebhooks: boolean;
  webhookUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  private mockAppSettings: ApplicationSettings = {
    companyName: 'Smart Gate System',
    logoUrl: 'assets/logo.png',
    theme: 'light',
    language: 'en',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24-hour',
    currency: 'INR',
    maxUploadSize: 100,
    sessionTimeout: 60
  };

  private mockNotificationSettings: NotificationSettings = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    notificationFrequency: 'instant',
    quietHoursStart: '22:00',
    quietHoursEnd: '08:00'
  };

  private mockSecuritySettings: SecuritySettings = {
    passwordMinLength: 8,
    passwordRequireUpperCase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChar: true,
    passwordExpiryDays: 90,
    maxLoginAttempts: 5,
    lockoutDurationMinutes: 15,
    enableTwoFactorAuth: false
  };

  private mockAPISettings: APISettings = {
    apiKey: 'sk_test_abc123xyz789',
    apiSecret: '***hidden***',
    rateLimitPerMinute: 100,
    enableWebhooks: true,
    webhookUrl: 'https://yourdomain.com/webhooks'
  };

  getApplicationSettings(): Observable<ApplicationSettings> {
    return of(this.mockAppSettings).pipe(delay(300));
  }

  updateApplicationSettings(settings: Partial<ApplicationSettings>): Observable<ApplicationSettings> {
    this.mockAppSettings = { ...this.mockAppSettings, ...settings };
    return of(this.mockAppSettings).pipe(delay(400));
  }

  getNotificationSettings(): Observable<NotificationSettings> {
    return of(this.mockNotificationSettings).pipe(delay(300));
  }

  updateNotificationSettings(settings: Partial<NotificationSettings>): Observable<NotificationSettings> {
    this.mockNotificationSettings = { ...this.mockNotificationSettings, ...settings };
    return of(this.mockNotificationSettings).pipe(delay(400));
  }

  getSecuritySettings(): Observable<SecuritySettings> {
    return of(this.mockSecuritySettings).pipe(delay(300));
  }

  updateSecuritySettings(settings: Partial<SecuritySettings>): Observable<SecuritySettings> {
    this.mockSecuritySettings = { ...this.mockSecuritySettings, ...settings };
    return of(this.mockSecuritySettings).pipe(delay(400));
  }

  getAPISettings(): Observable<APISettings> {
    return of(this.mockAPISettings).pipe(delay(300));
  }

  updateAPISettings(settings: Partial<APISettings>): Observable<APISettings> {
    this.mockAPISettings = { ...this.mockAPISettings, ...settings };
    return of(this.mockAPISettings).pipe(delay(400));
  }

  generateNewAPIKey(): Observable<{ apiKey: string; apiSecret: string }> {
    const newKey = 'sk_test_' + Math.random().toString(36).substring(2, 15);
    const newSecret = 'secret_' + Math.random().toString(36).substring(2, 15);
    this.mockAPISettings.apiKey = newKey;
    this.mockAPISettings.apiSecret = newSecret;
    
    return of({
      apiKey: newKey,
      apiSecret: newSecret
    }).pipe(delay(500));
  }

  testWebhook(): Observable<{ success: boolean; statusCode: number; responseTime: number }> {
    return of({
      success: true,
      statusCode: 200,
      responseTime: 234
    }).pipe(delay(1000));
  }

  getSystemInfo(): Observable<{
    version: string;
    environment: string;
    lastUpdated: Date;
    serverStatus: string;
    uptime: string;
  }> {
    return of({
      version: '2.0.1',
      environment: 'production',
      lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      serverStatus: 'Healthy',
      uptime: '45 days 12 hours'
    }).pipe(delay(300));
  }

  getBackupSettings(): Observable<{
    backupEnabled: boolean;
    backupFrequency: string;
    lastBackup: Date;
    nextBackup: Date;
    backupLocation: string;
  }> {
    return of({
      backupEnabled: true,
      backupFrequency: 'Daily at 02:00 AM',
      lastBackup: new Date(Date.now() - 24 * 60 * 60 * 1000),
      nextBackup: new Date(Date.now() + 24 * 60 * 60 * 1000),
      backupLocation: 'AWS S3 Bucket'
    }).pipe(delay(300));
  }

  createManualBackup(): Observable<{ success: boolean; backupId: string; size: string }> {
    return of({
      success: true,
      backupId: 'backup_' + Date.now(),
      size: '2.3 GB'
    }).pipe(delay(1000));
  }

  restoreBackup(backupId: string): Observable<{ success: boolean; message: string }> {
    return of({
      success: true,
      message: 'Backup restoration initiated. System will restart shortly.'
    }).pipe(delay(1500));
  }

  getMaintenanceSchedule(): Observable<Array<{
    id: string;
    type: string;
    scheduledDate: Date;
    estimatedDuration: number;
    description: string;
  }>> {
    const schedule = [
      {
        id: 'maint-001',
        type: 'System Update',
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedDuration: 2,
        description: 'Regular system updates and security patches'
      },
      {
        id: 'maint-002',
        type: 'Database Optimization',
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        estimatedDuration: 1,
        description: 'Database indexing and optimization'
      }
    ];
    return of(schedule).pipe(delay(300));
  }

  getLogs(logType: string, pageNumber: number = 1, pageSize: number = 10): Observable<{
    data: Array<{ timestamp: Date; level: string; message: string }>;
    total: number;
  }> {
    const logs = [
      { timestamp: new Date(), level: 'INFO', message: 'System started' },
      { timestamp: new Date(Date.now() - 60 * 1000), level: 'INFO', message: 'User login successful' },
      { timestamp: new Date(Date.now() - 120 * 1000), level: 'WARNING', message: 'High memory usage detected' }
    ];
    
    return of({
      data: logs,
      total: logs.length
    }).pipe(delay(300));
  }

  exportSettings(): Observable<Blob> {
    const settings = {
      application: this.mockAppSettings,
      notification: this.mockNotificationSettings,
      security: this.mockSecuritySettings
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    return of(blob).pipe(delay(500));
  }

  resetToDefaults(): Observable<{ success: boolean; message: string }> {
    return of({
      success: true,
      message: 'All settings have been reset to default values'
    }).pipe(delay(1000));
  }
}
