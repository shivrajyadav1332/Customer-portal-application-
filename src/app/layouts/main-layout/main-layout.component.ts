import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <app-header></app-header>
    <app-sidebar></app-sidebar>
    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .main-content {
      margin-left: 220px;
      margin-top: 60px;
      min-height: calc(100vh - 60px);
      background-color: #efefef;
      transition: margin-left 0.3s ease;
    }

    @media (max-width: 1024px) {
      .main-content { margin-left: 72px; }
    }

    @media (max-width: 768px) {
      .main-content { margin-left: 0; }
    }
  `]
})
export class MainLayoutComponent {}
