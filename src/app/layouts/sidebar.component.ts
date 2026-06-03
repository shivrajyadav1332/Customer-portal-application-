import { Component, OnInit, ViewChild, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { AuthService } from '../core/services/auth.service';

const SIDEBAR_IMPORTS = [
  CommonModule,
  RouterLink,
  RouterLinkActive,
  MatSidenavModule,
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatDividerModule
];

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  @ViewChild('sidenav') sidenav!: MatSidenav;

  private router = inject(Router);
  private authService = inject(AuthService);

  isOpen = true;
  menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
    { label: 'Vehicle Tracking', icon: 'local_shipping', route: '/vehicles' },
    { label: 'Weighbridge Reports', icon: 'assessment', route: '/reports' },
    { label: 'Live Monitoring', icon: 'monitor_heart', route: '/live-monitoring' },
    { label: 'Analytics', icon: 'analytics', route: '/analytics' },
    { label: 'Notifications', icon: 'notifications', route: '/notifications' },
    { label: 'Profile', icon: 'person', route: '/profile' },
    { label: 'Settings', icon: 'settings', route: '/settings' }
  ];

  ngOnInit(): void {
    // Initialize sidebar state
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
