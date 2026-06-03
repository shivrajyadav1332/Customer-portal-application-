import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DashboardEnhancedComponent } from './features/dashboard/dashboard-enhanced.component';
import { DashboardModernComponent } from './features/dashboard/dashboard-modern.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent
  },
  {
    path: 'dashboard',
    component: DashboardModernComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard-classic',
    component: DashboardEnhancedComponent,
    canActivate: [authGuard]
  },
  {
    path: 'dashboard-legacy',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'vehicles',
    canActivate: [authGuard],
    loadComponent: () => import('./features/vehicles/vehicles.component').then(m => m.VehiclesComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  {
    path: 'live-monitoring',
    canActivate: [authGuard],
    loadComponent: () => import('./features/live-monitoring/live-monitoring.component').then(m => m.LiveMonitoringComponent)
  },
  {
    path: 'analytics',
    canActivate: [authGuard],
    loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent)
  },
  {
    path: 'notifications',
    canActivate: [authGuard],
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
