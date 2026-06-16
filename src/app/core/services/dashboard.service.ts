import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, delay, map } from 'rxjs/operators';
import {
  DashboardData,
  DashboardKPI,
  EnhancedDashboardData,
  DashboardNotification,
  MonthlyStats
} from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

export interface LiveTruckStatus {
  currentTruck: string;
  currentWeight: number;
  entryBarrier: string;
  exitBarrier: string;
  vehicleStatus: string;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDashboardData(): Observable<EnhancedDashboardData> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`).pipe(
      map((response) => ({
        summary: {
          totalVehicles: response.summary?.totalVehicles ?? 0,
          vehicleEntries: response.summary?.vehicleEntries ?? 0,
          vehicleExits: response.summary?.vehiclesExitedToday ?? 0,
          pendingApprovals: response.summary?.pendingVehicles ?? 0,
          totalWeight: response.summary?.todaysTotalWeight ?? 0,
          todayWeight: response.summary?.todaysTotalWeight ?? 0
        },
        recentActivities: response.recentActivities ?? [],
        transactions: response.transactions ?? [],
        notifications: [],
        vehicleTrend: response.vehicleTrend,
        weightTrend: response.weightTrend,
        vehicleStatus: response.vehicleStatus,
        monthlyStatistics: [],
        liveStatus: response.liveStatus
      })),
      catchError(() => this.getMockDashboardData())
    );
  }

  getLiveStatus(): Observable<LiveTruckStatus> {
    return this.http.get<any>(`${this.apiUrl}/monitoring/live`).pipe(
      map((response) => ({
        currentTruck: response.currentTruck,
        currentWeight: response.currentWeight,
        entryBarrier: response.entryBarrier,
        exitBarrier: response.exitBarrier,
        vehicleStatus: response.vehicleStatus
      })),
      catchError(() => of({
        currentTruck: 'ABC-1234',
        currentWeight: 28500,
        entryBarrier: 'OPEN',
        exitBarrier: 'CLOSED',
        vehicleStatus: 'INSIDE'
      }))
    );
  }

  private getMockDashboardData(): Observable<EnhancedDashboardData> {
    const mockData: EnhancedDashboardData = {
      summary: {
        totalVehicles: 245,
        vehicleEntries: 89,
        vehicleExits: 76,
        pendingApprovals: 18,
        totalWeight: 1320000,
        todayWeight: 250000
      },
      recentActivities: [
        {
          id: '1',
          vehicleNumber: 'HR-26-AB-1234',
          driverName: 'Rajesh Kumar',
          entryTime: new Date(Date.now() - 15 * 60 * 1000),
          exitTime: new Date(Date.now() - 10 * 60 * 1000),
          status: 'Exited',
          netWeight: 5600
        },
        {
          id: '2',
          vehicleNumber: 'DL-01-CD-5678',
          driverName: 'Amit Singh',
          entryTime: new Date(Date.now() - 30 * 60 * 1000),
          status: 'Inside',
          netWeight: 6200
        },
        {
          id: '3',
          vehicleNumber: 'MH-02-EF-9012',
          driverName: 'Priya Patel',
          entryTime: new Date(Date.now() - 45 * 60 * 1000),
          exitTime: new Date(Date.now() - 40 * 60 * 1000),
          status: 'Exited',
          netWeight: 5100
        },
        {
          id: '4',
          vehicleNumber: 'GJ-01-AB-3456',
          driverName: 'Vikram Desai',
          entryTime: new Date(Date.now() - 60 * 60 * 1000),
          status: 'Inside',
          netWeight: 5900
        },
        {
          id: '5',
          vehicleNumber: 'TN-01-CD-7890',
          driverName: 'Ramesh N',
          entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
          exitTime: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
          status: 'Exited',
          netWeight: 5450
        }
      ],
      transactions: [
        {
          id: '1',
          vehicleNumber: 'HR-26-AB-1234',
          grossWeight: 15000,
          tareWeight: 9400,
          netWeight: 5600,
          ticketNumber: 'TKT-001',
          transactionDate: new Date(Date.now() - 10 * 60 * 1000)
        },
        {
          id: '2',
          vehicleNumber: 'MH-02-EF-9012',
          grossWeight: 12500,
          tareWeight: 7400,
          netWeight: 5100,
          ticketNumber: 'TKT-002',
          transactionDate: new Date(Date.now() - 40 * 60 * 1000)
        },
        {
          id: '3',
          vehicleNumber: 'GJ-01-AB-3456',
          grossWeight: 14500,
          tareWeight: 8600,
          netWeight: 5900,
          ticketNumber: 'TKT-003',
          transactionDate: new Date(Date.now() - 60 * 60 * 1000)
        },
        {
          id: '4',
          vehicleNumber: 'DL-01-CD-5678',
          grossWeight: 15200,
          tareWeight: 9000,
          netWeight: 6200,
          ticketNumber: 'TKT-004',
          transactionDate: new Date(Date.now() - 3 * 60 * 60 * 1000)
        }
      ],
      notifications: [
        {
          id: '1',
          title: 'Vehicle Entry Alert',
          message: 'Vehicle HR-26-AB-1234 has successfully entered',
          type: 'success',
          priority: 'high',
          read: false,
          timestamp: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Weight Measurement Complete',
          message: 'Vehicle MH-02-EF-9012 weight: 5100 kg',
          type: 'info',
          priority: 'medium',
          read: false,
          timestamp: new Date(Date.now() - 15 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Pending Approval',
          message: 'Vehicle GJ-01-AB-3456 is awaiting approval',
          type: 'warning',
          priority: 'high',
          read: true,
          timestamp: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: '4',
          title: 'Exit Alert',
          message: 'Vehicle TN-01-CD-7890 has exited the plant',
          type: 'success',
          priority: 'medium',
          read: true,
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
        },
        {
          id: '5',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on 2024-01-15 at 2:00 AM',
          type: 'info',
          priority: 'low',
          read: true,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      ],
      vehicleTrend: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Vehicle Entries',
            data: [45, 52, 48, 61, 55, 42, 38],
            borderColor: '#1976d2',
            backgroundColor: 'rgba(25, 118, 210, 0.1)',
            borderWidth: 2,
            fill: true
          },
          {
            label: 'Vehicle Exits',
            data: [42, 48, 44, 58, 52, 39, 35],
            borderColor: '#00acc1',
            backgroundColor: 'rgba(0, 172, 193, 0.1)',
            borderWidth: 2,
            fill: true
          }
        ]
      },
      weightTrend: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Total Weight (MT)',
            data: [245, 268, 241, 315, 287, 203, 178],
            borderColor: '#43a047',
            backgroundColor: 'rgba(67, 160, 71, 0.2)',
            borderWidth: 2,
            fill: true
          }
        ]
      },
      vehicleStatus: {
        labels: ['Active', 'Pending', 'Exited', 'Maintenance'],
        data: [45, 18, 156, 26],
        colors: ['#1976d2', '#ff9800', '#43a047', '#e53935']
      },
      monthlyStatistics: [
        { month: 'Jan', entries: 1240, exits: 1195, weight: 6750 },
        { month: 'Feb', entries: 1180, exits: 1165, weight: 6420 },
        { month: 'Mar', entries: 1320, exits: 1298, weight: 7150 },
        { month: 'Apr', entries: 1410, exits: 1385, weight: 7680 },
        { month: 'May', entries: 1290, exits: 1275, weight: 7020 }
      ]
    };
    return of(mockData).pipe(delay(800));
  }

  getLegacyDashboardData(customerId: string): Observable<DashboardData> {
    const mockData: DashboardData = {
      kpi: {
        totalVehicles: 45,
        vehiclesInside: 12,
        vehiclesExitedToday: 34,
        pendingVehicles: 8,
        todaysTotalWeight: 250000,
        averageVehicleWeight: 5348
      },
      entryExitTrend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        entries: Math.floor(Math.random() * 50) + 20,
        exits: Math.floor(Math.random() * 50) + 20
      })),
      weightTrend: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000),
        totalWeight: Math.floor(Math.random() * 500000) + 200000,
        averageWeight: 5348,
        vehicleCount: Math.floor(Math.random() * 50) + 20
      })),
      statusDistribution: [
        { status: 'Pending', count: 8, percentage: 18 },
        { status: 'Entered', count: 12, percentage: 27 },
        { status: 'Exited', count: 25, percentage: 55 }
      ],
      monthlyStats: [
        { month: 'Jan', totalVehicles: 120, totalWeight: 650000, averageWeight: 5417 },
        { month: 'Feb', totalVehicles: 140, totalWeight: 750000, averageWeight: 5357 },
        { month: 'Mar', totalVehicles: 160, totalWeight: 850000, averageWeight: 5313 }
      ],
      recentActivities: [
        { id: '1', vehicleNumber: 'HR-26-AB-1234', driverName: 'Rajesh Kumar', entryTime: new Date(Date.now() - 15 * 60 * 1000), exitTime: new Date(Date.now() - 10 * 60 * 1000), status: 'Exited', netWeight: 5600 },
        { id: '2', vehicleNumber: 'DL-01-CD-5678', driverName: 'Amit Singh', entryTime: new Date(Date.now() - 30 * 60 * 1000), status: 'Inside', netWeight: 6200 },
        { id: '3', vehicleNumber: 'MH-02-EF-9012', driverName: 'Priya Patel', entryTime: new Date(Date.now() - 45 * 60 * 1000), exitTime: new Date(Date.now() - 40 * 60 * 1000), status: 'Exited', netWeight: 5100 }
      ],
      weighbridgeTransactions: [
        { id: '1', vehicleNumber: 'HR-26-AB-1234', grossWeight: 15000, tareWeight: 9400, netWeight: 5600, ticketNumber: 'TKT-001', transactionDate: new Date(Date.now() - 10 * 60 * 1000) },
        { id: '2', vehicleNumber: 'MH-02-EF-9012', grossWeight: 12500, tareWeight: 7400, netWeight: 5100, ticketNumber: 'TKT-002', transactionDate: new Date(Date.now() - 40 * 60 * 1000) }
      ]
    };
    return of(mockData).pipe(delay(500));
  }

  getKPI(customerId: string): Observable<DashboardKPI> {
    const mockKPI: DashboardKPI = {
      totalVehicles: 45,
      vehiclesInside: 12,
      vehiclesExitedToday: 34,
      pendingVehicles: 8,
      todaysTotalWeight: 250000,
      averageVehicleWeight: 5348
    };
    return of(mockKPI).pipe(delay(300));
  }

  getMonthlyStatistics(customerId: string, year: number, month: number): Observable<any> {
    const mockStats = {
      month: month,
      year: year,
      totalVehicles: 1250,
      totalWeight: 6750000,
      totalTransactions: 5000,
      averageVehiclesPerDay: 40
    };
    return of(mockStats).pipe(delay(400));
  }

  getEntryExitTrend(customerId: string, days: number = 30): Observable<any[]> {
    const mockTrend = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      entries: Math.floor(Math.random() * 50) + 20,
      exits: Math.floor(Math.random() * 50) + 20
    }));
    return of(mockTrend).pipe(delay(500));
  }

  getWeightTrend(customerId: string, days: number = 30): Observable<any[]> {
    const mockTrend = Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
      weight: Math.floor(Math.random() * 500000) + 200000
    }));
    return of(mockTrend).pipe(delay(500));
  }

  getVehicleStatusDistribution(customerId: string): Observable<any[]> {
    const mockDistribution = [
      { status: 'Pending', count: 8, color: '#FF9800' },
      { status: 'Entered', count: 12, color: '#4CAF50' },
      { status: 'OnWeighbridge', count: 5, color: '#2196F3' },
      { status: 'Weighed', count: 15, color: '#8BC34A' },
      { status: 'Exited', count: 5, color: '#F44336' }
    ];
    return of(mockDistribution).pipe(delay(300));
  }
}

