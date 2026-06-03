import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { SignalRService } from './core/services/signalr.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  private router = inject(Router);

  isAuthenticated = false;

  ngOnInit(): void {
    this.authService.isAuthenticated$.subscribe(authenticated => {
      this.isAuthenticated = authenticated;

      if (authenticated) {
        this.initializeSignalR();
      }
    });

    // Redirect to login if not authenticated
    if (!this.authService.isAuthenticated() && this.router.url !== '/login') {
      this.router.navigate(['/login']);
    }
  }

  private initializeSignalR(): void {
    this.signalRService.startConnection()
      .subscribe({
        next: () => {
          console.log('SignalR connected');
          this.signalRService.joinLiveMonitoring().catch(err =>
            console.error('Error joining live monitoring:', err)
          );
        },
        error: (error) => {
          console.error('SignalR connection error:', error);
        }
      });
  }
}
