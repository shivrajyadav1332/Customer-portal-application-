import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  designation: string;
  customerId: string;
  customerName: string;
  profileImage?: string;
  joinDate: Date;
  lastLoginDate: Date;
  isActive: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

export interface SecuritySettings {
  twoFactorAuthEnabled: boolean;
  lastPasswordChange: Date;
  passwordExpiryDays: number;
  activeSessionsCount: number;
  loginAttempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private mockProfile: UserProfile = {
    id: 'u-001',
    username: 'testuser',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@smartgate.com',
    phone: '+91-9876543210',
    role: 'Customer Admin',
    department: 'Operations',
    designation: 'Operations Manager',
    customerId: 'cust-001',
    customerName: 'ABC Logistics Pvt Ltd',
    profileImage: 'https://via.placeholder.com/150?text=RK',
    joinDate: new Date('2024-01-15'),
    lastLoginDate: new Date(),
    isActive: true
  };

  private mockActivityLogs: ActivityLog[] = [
    {
      id: 'al-001',
      action: 'Login',
      description: 'User logged in successfully',
      timestamp: new Date(),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'al-002',
      action: 'View Dashboard',
      description: 'Accessed dashboard',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'al-003',
      action: 'Export Report',
      description: 'Exported weighbridge report',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'al-004',
      action: 'Update Settings',
      description: 'Updated notification preferences',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    },
    {
      id: 'al-005',
      action: 'View Analytics',
      description: 'Viewed analytics dashboard',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
    }
  ];

  private mockSecuritySettings: SecuritySettings = {
    twoFactorAuthEnabled: false,
    lastPasswordChange: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    passwordExpiryDays: 60,
    activeSessionsCount: 1,
    loginAttempts: 0
  };

  getProfile(): Observable<UserProfile> {
    return of(this.mockProfile).pipe(delay(300));
  }

  updateProfile(profile: Partial<UserProfile>): Observable<UserProfile> {
    this.mockProfile = { ...this.mockProfile, ...profile };
    return of(this.mockProfile).pipe(delay(500));
  }

  updateProfileImage(imageFile: File): Observable<{ success: boolean; imageUrl: string }> {
    const mockImageUrl = 'https://via.placeholder.com/150?text=' + this.mockProfile.firstName.charAt(0) + this.mockProfile.lastName.charAt(0);
    return of({
      success: true,
      imageUrl: mockImageUrl
    }).pipe(delay(600));
  }

  changePassword(oldPassword: string, newPassword: string): Observable<{ success: boolean; message: string }> {
    if (oldPassword === 'password123') {
      this.mockSecuritySettings.lastPasswordChange = new Date();
      return of({
        success: true,
        message: 'Password changed successfully'
      }).pipe(delay(500));
    }
    return of({
      success: false,
      message: 'Old password is incorrect'
    }).pipe(delay(500));
  }

  getActivityLogs(pageNumber: number = 1, pageSize: number = 10): Observable<{
    data: ActivityLog[];
    total: number;
    pageNumber: number;
  }> {
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedData = this.mockActivityLogs.slice(startIndex, startIndex + pageSize);
    
    return of({
      data: paginatedData,
      total: this.mockActivityLogs.length,
      pageNumber
    }).pipe(delay(400));
  }

  getActivityLogsByAction(action: string): Observable<ActivityLog[]> {
    const logs = this.mockActivityLogs.filter(log => log.action === action);
    return of(logs).pipe(delay(300));
  }

  getRecentActivityLogs(limit: number = 5): Observable<ActivityLog[]> {
    return of(this.mockActivityLogs.slice(0, limit)).pipe(delay(300));
  }

  getSecuritySettings(): Observable<SecuritySettings> {
    return of(this.mockSecuritySettings).pipe(delay(300));
  }

  enableTwoFactorAuth(): Observable<{ success: boolean; qrCode: string }> {
    this.mockSecuritySettings.twoFactorAuthEnabled = true;
    return of({
      success: true,
      qrCode: 'https://via.placeholder.com/200?text=QR+Code'
    }).pipe(delay(400));
  }

  disableTwoFactorAuth(): Observable<{ success: boolean }> {
    this.mockSecuritySettings.twoFactorAuthEnabled = false;
    return of({ success: true }).pipe(delay(300));
  }

  getSessions(): Observable<Array<{
    id: string;
    deviceType: string;
    browser: string;
    lastActive: Date;
    ipAddress: string;
    isCurrent: boolean;
  }>> {
    const sessions = [
      {
        id: 's-001',
        deviceType: 'Desktop',
        browser: 'Chrome',
        lastActive: new Date(),
        ipAddress: '192.168.1.100',
        isCurrent: true
      },
      {
        id: 's-002',
        deviceType: 'Mobile',
        browser: 'Safari',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
        ipAddress: '192.168.1.101',
        isCurrent: false
      }
    ];
    return of(sessions).pipe(delay(300));
  }

  logoutSession(sessionId: string): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(300));
  }

  logoutAllSessions(): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(300));
  }

  exportProfileData(): Observable<Blob> {
    const profileData = JSON.stringify(this.mockProfile, null, 2);
    const blob = new Blob([profileData], { type: 'application/json' });
    return of(blob).pipe(delay(500));
  }

  deleteAccount(): Observable<{ success: boolean }> {
    return of({ success: true }).pipe(delay(500));
  }
}
