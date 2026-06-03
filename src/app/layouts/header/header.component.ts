import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        CommonModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        MatDividerModule
    ],
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    logout(): void {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}
