import { Injectable, inject, DestroyRef } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { LiveVehicleUpdate } from '../models/vehicle.model';
import { Notification } from '../models/notification.model';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  
  private hubConnection: signalR.HubConnection | null = null;
  private connectionSubject = new BehaviorSubject<boolean>(false);
  public isConnected$ = this.connectionSubject.asObservable();

  private liveVehicleUpdateSubject = new BehaviorSubject<LiveVehicleUpdate | null>(null);
  public liveVehicleUpdate$ = this.liveVehicleUpdateSubject.asObservable();

  private notificationSubject = new BehaviorSubject<Notification | null>(null);
  public notification$ = this.notificationSubject.asObservable();

  private liveLogsSubject = new BehaviorSubject<any[]>([]);
  public liveLogs$ = this.liveLogsSubject.asObservable();

  startConnection(): Observable<void> {
    return new Observable(observer => {
      // Mock SignalR - just complete immediately without connecting
      console.log('SignalR connection disabled (using mock mode)');
      observer.next();
      observer.complete();
    });
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop()
        .then(() => {
          console.log('SignalR connection stopped');
          this.hubConnection = null;
          this.connectionSubject.next(false);
        })
        .catch((error: any) => {
          console.error('Error stopping SignalR connection:', error);
          this.hubConnection = null;
          this.connectionSubject.next(false);
        });
    }
  }

  private setupEventListeners(): void {
    if (!this.hubConnection) {
      console.warn('Hub connection not initialized for event listeners');
      return;
    }

    // Remove existing listeners to avoid duplicates
    this.hubConnection.off('VehicleUpdated');
    this.hubConnection.off('NotificationReceived');
    this.hubConnection.off('LiveLogAdded');
    this.hubConnection.off('BarrierStatusChanged');
    this.hubConnection.off('WeightUpdated');

    // Vehicle Update Event
    this.hubConnection.on('VehicleUpdated', (update: LiveVehicleUpdate) => {
      try {
        console.log('Vehicle updated:', update);
        this.liveVehicleUpdateSubject.next(update);
      } catch (error: any) {
        console.error('Error processing VehicleUpdated event:', error);
      }
    });

    // Notification Event
    this.hubConnection.on('NotificationReceived', (notification: Notification) => {
      try {
        console.log('Notification received:', notification);
        this.notificationSubject.next(notification);
      } catch (error: any) {
        console.error('Error processing NotificationReceived event:', error);
      }
    });

    // Live Log Event
    this.hubConnection.on('LiveLogAdded', (logs: any[]) => {
      try {
        console.log('Live logs received:', logs);
        this.liveLogsSubject.next(logs);
      } catch (error: any) {
        console.error('Error processing LiveLogAdded event:', error);
      }
    });

    // Barrier Status Event
    this.hubConnection.on('BarrierStatusChanged', (data: any) => {
      try {
        console.log('Barrier status changed:', data);
      } catch (error: any) {
        console.error('Error processing BarrierStatusChanged event:', error);
      }
    });

    // Weight Update Event
    this.hubConnection.on('WeightUpdated', (data: any) => {
      try {
        console.log('Weight updated:', data);
      } catch (error: any) {
        console.error('Error processing WeightUpdated event:', error);
      }
    });
  }

  joinVehicleGroup(vehicleId: string): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject(new Error('Hub connection not established'));
    }
    
    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return Promise.reject(new Error('Hub connection is not connected'));
    }

    try {
      return this.hubConnection.invoke('JoinVehicleGroup', vehicleId)
        .then(() => console.log(`Joined vehicle group: ${vehicleId}`))
        .catch((error: any) => {
          console.error(`Error joining vehicle group ${vehicleId}:`, error);
          throw error;
        });
    } catch (error: any) {
      console.error('Error in joinVehicleGroup:', error);
      return Promise.reject(error);
    }
  }

  leaveVehicleGroup(vehicleId: string): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject(new Error('Hub connection not established'));
    }

    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return Promise.reject(new Error('Hub connection is not connected'));
    }

    try {
      return this.hubConnection.invoke('LeaveVehicleGroup', vehicleId)
        .then(() => console.log(`Left vehicle group: ${vehicleId}`))
        .catch((error: any) => {
          console.error(`Error leaving vehicle group ${vehicleId}:`, error);
          throw error;
        });
    } catch (error: any) {
      console.error('Error in leaveVehicleGroup:', error);
      return Promise.reject(error);
    }
  }

  joinLiveMonitoring(): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject(new Error('Hub connection not established'));
    }

    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return Promise.reject(new Error('Hub connection is not connected'));
    }

    try {
      return this.hubConnection.invoke('JoinLiveMonitoring')
        .then(() => console.log('Joined live monitoring'))
        .catch((error: any) => {
          console.error('Error joining live monitoring:', error);
          throw error;
        });
    } catch (error: any) {
      console.error('Error in joinLiveMonitoring:', error);
      return Promise.reject(error);
    }
  }

  leaveLiveMonitoring(): Promise<void> {
    if (!this.hubConnection) {
      return Promise.reject(new Error('Hub connection not established'));
    }

    if (this.hubConnection.state !== signalR.HubConnectionState.Connected) {
      return Promise.reject(new Error('Hub connection is not connected'));
    }

    try {
      return this.hubConnection.invoke('LeaveLiveMonitoring')
        .then(() => console.log('Left live monitoring'))
        .catch((error: any) => {
          console.error('Error leaving live monitoring:', error);
          throw error;
        });
    } catch (error: any) {
      console.error('Error in leaveLiveMonitoring:', error);
      return Promise.reject(error);
    }
  }

  /**
   * Check if hub connection is currently established and connected
   */
  isConnected(): boolean {
    return this.hubConnection?.state === signalR.HubConnectionState.Connected;
  }

  /**
   * Get the current hub connection state
   */
  getConnectionState(): signalR.HubConnectionState | null {
    return this.hubConnection?.state ?? null;
  }

  /**
   * Dispose of the SignalR service and cleanup resources
   */
  dispose(): void {
    this.stopConnection();
    this.liveVehicleUpdateSubject.complete();
    this.notificationSubject.complete();
    this.liveLogsSubject.complete();
    this.connectionSubject.complete();
  }
}
