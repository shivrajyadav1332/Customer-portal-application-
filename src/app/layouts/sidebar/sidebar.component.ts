import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface MenuItem {
    label: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [
        CommonModule,
        RouterModule,
        MatListModule,
        MatIconModule,
        MatButtonModule
    ],
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
    currentRoute: string = '';

    menuItems: MenuItem[] = [
        { label: 'Dashboard', icon: 'dashboard', route: '/dashboard' },
        { label: 'Vehicles', icon: 'local_shipping', route: '/vehicles' },
        { label: 'Weight Reports', icon: 'scale', route: '/reports' },
        { label: 'Live Monitoring', icon: 'monitor_heart', route: '/live-monitoring' },
        { label: 'Reports', icon: 'assessment', route: '/analytics' },
        { label: 'Profile', icon: 'person', route: '/profile' }
    ];

    constructor(private router: Router) {
        this.currentRoute = this.router.url;
    }

    isActive(route: string): boolean {
        return this.router.url.includes(route);
    }

    navigate(route: string): void {
        this.router.navigate([route]);
        this.currentRoute = route;
    }
}
