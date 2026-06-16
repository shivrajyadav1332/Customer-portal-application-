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

  // SCADA Journey Event Stream
  private journeySubject = new BehaviorSubject<{ eventName: string; payload: any } | null>(null);
  public journey$ = this.journeySubject.asObservable();

  startConnection(): Observable<void> {
    return new Observable(observer => {
      if (this.hubConnection) {
        observer.next();
        observer.complete();
        return;
      }

      const hubUrl = `${environment.signalRUrl}/hub/vehicle`;
      console.log(`Connecting to SCADA Hub at: ${hubUrl}`);

      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(hubUrl)
        .withAutomaticReconnect()
        .build();

      this.hubConnection.start()
        .then(() => {
          console.log('SignalR connection established successfully');
          this.connectionSubject.next(true);
          this.setupEventListeners();
          observer.next();
          observer.complete();
        })
        .catch((error: any) => {
          console.error('Error starting SignalR connection:', error);
          this.connectionSubject.next(false);
          // Proceed anyway to allow local mock triggers/simulators on the dashboard
          observer.next();
          observer.complete();
        });
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
    const events = [
      'VehicleUpdated', 'NotificationReceived', 'LiveLogAdded', 'BarrierStatusChanged', 'WeightUpdated',
      'VehicleDetected', 'ANPRScanned', 'EntryBarrierOpened', 'TruckEnteredWeighbridge', 'WeightCaptured',
      'ExitBarrierOpened', 'TruckExited', 'ProcessCompleted',
      'ReceiveSystemStatus', 'SystemStateChanged', 'DeviceEvent', 'EntryBarrierChanged', 'ExitBarrierChanged',
      'EntrySignalChanged', 'ExitSignalChanged', 'OnScaleChanged', 'VehicleProcessed'
    ];
    for (const event of events) {
      this.hubConnection.off(event);
    }

    // 1. Specific journey events (emitted directly by future components)
    this.hubConnection.on('VehicleDetected', (payload: any) => {
      console.log('SignalR Event: VehicleDetected', payload);
      this.journeySubject.next({ eventName: 'VehicleDetected', payload });
    });

    this.hubConnection.on('ANPRScanned', (payload: any) => {
      console.log('SignalR Event: ANPRScanned', payload);
      this.journeySubject.next({ eventName: 'ANPRScanned', payload });
    });

    this.hubConnection.on('EntryBarrierOpened', (payload: any) => {
      console.log('SignalR Event: EntryBarrierOpened', payload);
      this.journeySubject.next({ eventName: 'EntryBarrierOpened', payload });
    });

    this.hubConnection.on('TruckEnteredWeighbridge', (payload: any) => {
      console.log('SignalR Event: TruckEnteredWeighbridge', payload);
      this.journeySubject.next({ eventName: 'TruckEnteredWeighbridge', payload });
    });

    this.hubConnection.on('WeightCaptured', (payload: any) => {
      console.log('SignalR Event: WeightCaptured', payload);
      this.journeySubject.next({ eventName: 'WeightCaptured', payload });
    });

    this.hubConnection.on('ExitBarrierOpened', (payload: any) => {
      console.log('SignalR Event: ExitBarrierOpened', payload);
      this.journeySubject.next({ eventName: 'ExitBarrierOpened', payload });
    });

    this.hubConnection.on('TruckExited', (payload: any) => {
      console.log('SignalR Event: TruckExited', payload);
      this.journeySubject.next({ eventName: 'TruckExited', payload });
    });

    this.hubConnection.on('ProcessCompleted', (payload: any) => {
      console.log('SignalR Event: ProcessCompleted', payload);
      this.journeySubject.next({ eventName: 'ProcessCompleted', payload });
    });

    // 2. SCADA standard status updates (emitted by C# backend)
    this.hubConnection.on('ReceiveSystemStatus', (payload: any) => {
      console.log('SignalR SCADA ReceiveSystemStatus:', payload);
      this.mapScadaStateToJourney(payload);
    });

    this.hubConnection.on('SystemStateChanged', (payload: any) => {
      console.log('SignalR SCADA SystemStateChanged:', payload);
      this.mapScadaStateToJourney(payload);
    });

    this.hubConnection.on('DeviceEvent', (payload: any) => {
      console.log('SignalR SCADA DeviceEvent:', payload);
      const ev = (payload.event || payload.eventName || '').toUpperCase();
      if (ev === 'VEHICLE_ENTRY') {
        this.journeySubject.next({ eventName: 'VehicleDetected', payload });
      } else if (ev === 'WEIGHING') {
        this.journeySubject.next({ eventName: 'TruckEnteredWeighbridge', payload });
      } else if (ev === 'WEIGH_COMPLETE') {
        this.journeySubject.next({ eventName: 'WeightCaptured', payload: { weight: payload.weight || 27500 } });
      } else if (ev === 'EXIT_OPEN') {
        this.journeySubject.next({ eventName: 'ExitBarrierOpened', payload });
      } else if (ev === 'EXIT_CLOSE') {
        this.journeySubject.next({ eventName: 'TruckExited', payload });
        this.journeySubject.next({ eventName: 'ProcessCompleted', payload });
      }
    });

    this.hubConnection.on('OnScaleChanged', (val: any) => {
      console.log('SignalR SCADA OnScaleChanged:', val);
      if (val) {
        this.journeySubject.next({ eventName: 'TruckEnteredWeighbridge', payload: { onScale: true } });
      }
    });

    this.hubConnection.on('VehicleProcessed', (payload: any) => {
      console.log('SignalR SCADA VehicleProcessed:', payload);
      if (payload.status === 'ACCEPTED') {
        this.journeySubject.next({ eventName: 'VehicleDetected', payload });
        this.journeySubject.next({ eventName: 'ANPRScanned', payload });
      }
    });

    // Legacy handlers
    this.hubConnection.on('VehicleUpdated', (update: LiveVehicleUpdate) => {
      try {
        this.liveVehicleUpdateSubject.next(update);
      } catch (error: any) {
        console.error('Error processing VehicleUpdated event:', error);
      }
    });

    this.hubConnection.on('NotificationReceived', (notification: Notification) => {
      try {
        this.notificationSubject.next(notification);
      } catch (error: any) {
        console.error('Error processing NotificationReceived event:', error);
      }
    });

    this.hubConnection.on('LiveLogAdded', (logs: any[]) => {
      try {
        this.liveLogsSubject.next(logs);
      } catch (error: any) {
        console.error('Error processing LiveLogAdded event:', error);
      }
    });

    this.hubConnection.on('BarrierStatusChanged', (data: any) => {
      try {
        console.log('Barrier status changed:', data);
      } catch (error: any) {
        console.error('Error processing BarrierStatusChanged event:', error);
      }
    });

    this.hubConnection.on('WeightUpdated', (data: any) => {
      try {
        console.log('Weight updated:', data);
      } catch (error: any) {
        console.error('Error processing WeightUpdated event:', error);
      }
    });
  }

  private mapScadaStateToJourney(payload: any): void {
    if (!payload) return;
    const stage = (payload.stage || '').toUpperCase();
    const plate = payload.currentTruckPlate || payload.plate || '';
    const weight = payload.currentWeight || payload.weight || 0;

    if (payload.ledMessage) {
      this.journeySubject.next({ eventName: 'AudioAnnouncement', payload: { announcement: payload.ledMessage, timestamp: new Date() } });
    }

    if (stage === 'ENTRY' || stage === 'VEHICLE_ENTRY') {
      this.journeySubject.next({ eventName: 'VehicleDetected', payload: { plate, time: new Date() } });
      this.journeySubject.next({ eventName: 'ANPRScanned', payload: { plate, status: 'Verified' } });
      if (payload.entryBarrier === 'OPEN') {
        this.journeySubject.next({ eventName: 'EntryBarrierOpened', payload: { barrier: 'OPEN', signal: 'GREEN' } });
      }
    } else if (stage === 'WEIGHING') {
      this.journeySubject.next({ eventName: 'TruckEnteredWeighbridge', payload: { location: 'Weighbridge' } });
    } else if (stage === 'WEIGHT_CALCULATED' || stage === 'WEIGH_COMPLETE') {
      this.journeySubject.next({ eventName: 'WeightCaptured', payload: { weight, timestamp: new Date() } });
    } else if (stage === 'EXIT' || stage === 'EXIT_OPEN') {
      this.journeySubject.next({ eventName: 'ExitBarrierOpened', payload: { barrier: 'OPEN', signal: 'GREEN' } });
    } else if (stage === 'IDLE' || stage === 'READY') {
      this.journeySubject.next({ eventName: 'TruckExited', payload: { exitTime: new Date() } });
      this.journeySubject.next({ eventName: 'ProcessCompleted', payload: {} });
    }
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
