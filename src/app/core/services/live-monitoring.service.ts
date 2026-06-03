import { Injectable } from '@angular/core';
import { Observable, of, interval } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface LiveVehicleUpdate {
  vehicleId: string;
  vehicleNumber: string;
  status: string;
  location: string;
  temperature?: number;
  humidity?: number;
  gpsLocation: { latitude: number; longitude: number };
  speed: number;
  lastUpdate: Date;
}

export interface GateEvent {
  id: string;
  eventType: 'Entry' | 'Exit';
  vehicleNumber: string;
  timestamp: Date;
  gateNumber: string;
  anprStatus: 'Success' | 'Failed' | 'Manual';
}

export interface SystemHealth {
  gateStatus: { gate1: boolean; gate2: boolean };
  weighbridgeStatus: boolean;
  anprStatus: boolean;
  networkStatus: boolean;
  systemUptime: number;
  totalVehiclesProcessed: number;
}

@Injectable({
  providedIn: 'root'
})
export class LiveMonitoringService {

  private mockLiveUpdates: LiveVehicleUpdate[] = [
    {
      vehicleId: 'v-001',
      vehicleNumber: 'HR-26-AB-1234',
      status: 'Exited',
      location: 'Exit Gate',
      temperature: 28,
      humidity: 65,
      gpsLocation: { latitude: 28.5355, longitude: 77.3910 },
      speed: 0,
      lastUpdate: new Date(Date.now() - 2 * 60 * 1000)
    },
    {
      vehicleId: 'v-002',
      vehicleNumber: 'DL-01-CD-5678',
      status: 'On Weighbridge',
      location: 'Weighbridge Zone',
      temperature: 32,
      humidity: 55,
      gpsLocation: { latitude: 28.5350, longitude: 77.3905 },
      speed: 5,
      lastUpdate: new Date(Date.now() - 30 * 1000)
    },
    {
      vehicleId: 'v-003',
      vehicleNumber: 'MH-02-EF-9012',
      status: 'Entered',
      location: 'Entry Queue',
      temperature: 26,
      humidity: 70,
      gpsLocation: { latitude: 28.5360, longitude: 77.3915 },
      speed: 2,
      lastUpdate: new Date(Date.now() - 15 * 1000)
    },
    {
      vehicleId: 'v-004',
      vehicleNumber: 'KA-03-GH-3456',
      status: 'Exited',
      location: 'Exit Lane',
      temperature: 30,
      humidity: 60,
      gpsLocation: { latitude: 28.5345, longitude: 77.3900 },
      speed: 20,
      lastUpdate: new Date(Date.now() - 5 * 60 * 1000)
    },
    {
      vehicleId: 'v-005',
      vehicleNumber: 'GJ-04-IJ-7890',
      status: 'Weighed',
      location: 'Weighbridge Exit',
      temperature: 29,
      humidity: 62,
      gpsLocation: { latitude: 28.5352, longitude: 77.3908 },
      speed: 8,
      lastUpdate: new Date()
    }
  ];

  private mockGateEvents: GateEvent[] = [
    {
      id: 'ge-001',
      eventType: 'Entry',
      vehicleNumber: 'HR-26-AB-1234',
      timestamp: new Date(Date.now() - 120 * 60 * 1000),
      gateNumber: 'Gate-1',
      anprStatus: 'Success'
    },
    {
      id: 'ge-002',
      eventType: 'Exit',
      vehicleNumber: 'DL-01-CD-5678',
      timestamp: new Date(Date.now() - 60 * 60 * 1000),
      gateNumber: 'Gate-2',
      anprStatus: 'Success'
    },
    {
      id: 'ge-003',
      eventType: 'Entry',
      vehicleNumber: 'MH-02-EF-9012',
      timestamp: new Date(Date.now() - 20 * 60 * 1000),
      gateNumber: 'Gate-1',
      anprStatus: 'Success'
    },
    {
      id: 'ge-004',
      eventType: 'Exit',
      vehicleNumber: 'KA-03-GH-3456',
      timestamp: new Date(Date.now() - 90 * 60 * 1000),
      gateNumber: 'Gate-2',
      anprStatus: 'Manual'
    },
    {
      id: 'ge-005',
      eventType: 'Entry',
      vehicleNumber: 'GJ-04-IJ-7890',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      gateNumber: 'Gate-1',
      anprStatus: 'Success'
    }
  ];

  getLiveUpdates(): Observable<LiveVehicleUpdate[]> {
    return of(this.mockLiveUpdates).pipe(delay(300));
  }

  getLiveUpdatesByStatus(status: string): Observable<LiveVehicleUpdate[]> {
    const filtered = this.mockLiveUpdates.filter(u => u.status === status);
    return of(filtered).pipe(delay(300));
  }

  getVehicleRealtime(vehicleId: string): Observable<LiveVehicleUpdate> {
    const vehicle = this.mockLiveUpdates.find(u => u.vehicleId === vehicleId);
    return of(vehicle || this.mockLiveUpdates[0]).pipe(delay(200));
  }

  // Simulate continuous updates (real-time)
  subscribeToLiveUpdates(): Observable<LiveVehicleUpdate[]> {
    return interval(2000).pipe(
      map(() => {
        // Simulate updates by modifying mock data slightly
        return this.mockLiveUpdates.map(u => ({
          ...u,
          speed: Math.max(0, u.speed + (Math.random() - 0.5) * 10),
          temperature: 25 + Math.random() * 10,
          humidity: 50 + Math.random() * 30,
          lastUpdate: new Date()
        }));
      })
    );
  }

  getGateEvents(pageNumber: number = 1, pageSize: number = 10): Observable<{
    data: GateEvent[];
    total: number;
    pageNumber: number;
  }> {
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedData = this.mockGateEvents.slice(startIndex, startIndex + pageSize);
    
    return of({
      data: paginatedData,
      total: this.mockGateEvents.length,
      pageNumber
    }).pipe(delay(300));
  }

  getGateEventsByType(eventType: 'Entry' | 'Exit'): Observable<GateEvent[]> {
    const events = this.mockGateEvents.filter(e => e.eventType === eventType);
    return of(events).pipe(delay(300));
  }

  getRecentGateEvents(limit: number = 10): Observable<GateEvent[]> {
    const sorted = [...this.mockGateEvents].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return of(sorted.slice(0, limit)).pipe(delay(300));
  }

  getSystemHealth(): Observable<SystemHealth> {
    const health: SystemHealth = {
      gateStatus: { gate1: true, gate2: true },
      weighbridgeStatus: true,
      anprStatus: true,
      networkStatus: true,
      systemUptime: 99.8,
      totalVehiclesProcessed: this.mockLiveUpdates.length
    };
    return of(health).pipe(delay(300));
  }

  getSystemAlerts(): Observable<Array<{ severity: string; message: string; timestamp: Date }>> {
    const alerts = [
      { severity: 'warning', message: 'Gate 1 camera needs cleaning', timestamp: new Date(Date.now() - 30 * 60 * 1000) },
      { severity: 'info', message: 'System backup completed successfully', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) }
    ];
    return of(alerts).pipe(delay(300));
  }

  getHeatmapData(): Observable<Array<{ x: number; y: number; value: number }>> {
    const heatmapData = [
      { x: 0, y: 0, value: 25 },
      { x: 10, y: 10, value: 30 },
      { x: 20, y: 20, value: 35 },
      { x: 30, y: 30, value: 28 },
      { x: 40, y: 40, value: 32 }
    ];
    return of(heatmapData).pipe(delay(300));
  }
}
