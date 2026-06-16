import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserInfo } from '../../core/models/auth.model';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule,
        MatBadgeModule,
        MatTooltipModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
    companyName = 'Yanbu Cement';
    currentUser: UserInfo | null = null;
    notificationCount = 3;

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.currentUser = this.authService.getCurrentUser();
        this.authService.currentUser$.subscribe(user => this.currentUser = user);
    }

    get customerName(): string {
        return this.currentUser?.customerName || this.currentUser?.username || 'Customer';
    }

    goToProfile(): void {
        this.router.navigate(['/profile']);
    }

    goToNotifications(): void {
        this.router.navigate(['/notifications']);
    }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
