import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-kpi-card',
    standalone: true,
    imports: [CommonModule, MatCardModule, MatIconModule],
    templateUrl: './kpi-card.component.html',
    styleUrls: ['./kpi-card.component.scss']
})
export class KPICardComponent {
    @Input() title: string = '';
    @Input() value: string | number | null = 0;
    @Input() icon: string = 'dashboard';
    @Input() unit?: string;
    @Input() trend?: number;
    @Input() trendIcon?: string = 'trending_up';
}
