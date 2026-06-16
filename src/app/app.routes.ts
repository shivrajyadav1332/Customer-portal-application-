import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login.component';
import { SignupComponent } from './features/auth/signup.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DashboardEnhancedComponent } from './features/dashboard/dashboard-enhanced.component';
import { DashboardModernComponent } from './features/dashboard/dashboard-modern.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardModernComponent },
      { path: 'dashboard-classic', component: DashboardEnhancedComponent },
      { path: 'dashboard-legacy', component: DashboardComponent },
      { path: 'vehicles', loadComponent: () => import('./features/vehicles/vehicles.component').then(m => m.VehiclesComponent) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'weights', redirectTo: 'reports', pathMatch: 'full' },
      { path: 'live-monitoring', loadComponent: () => import('./features/live-monitoring/live-monitoring.component').then(m => m.LiveMonitoringComponent) },
      { path: 'analytics', loadComponent: () => import('./features/analytics/analytics.component').then(m => m.AnalyticsComponent) },
      { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
      { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
      { path: 'settings', loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent) }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
