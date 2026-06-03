import { Component, inject, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';
import { NotificationManagementService } from '../core/services/notification-management.service';
import { UserInfo } from '../core/models/auth.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  private authService = inject(AuthService);
  private notificationService = inject(NotificationManagementService);
  private router = inject(Router);

  currentUser: UserInfo | null = null;
  unreadNotificationCount = 0;

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadNotificationCount = count;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  goToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
