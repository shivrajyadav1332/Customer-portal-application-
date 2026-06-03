import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface AnalyticsData {
  totalVehicles: number;
  totalWeight: number;
  averageWeightPerVehicle: number;
  peakHours: Array<{ hour: number; vehicleCount: number }>;
  vehicleTypeDistribution: Array<{ type: string; count: number }>;
  dailyTrend: Array<{ date: string; vehicles: number; weight: number }>;
  hourlyDistribution: Array<{ hour: number; count: number }>;
  topDrivers: Array<{ name: string; trips: number; totalWeight: number }>;
  vehicleUtilization: Array<{ vehicleNumber: string; tripCount: number; totalWeight: number; efficiency: number }>;
  costAnalysis: { totalCost: number; costPerVehicle: number; costPerKg: number };
}

export interface ComparisonMetrics {
  currentMonth: number;
  previousMonth: number;
  changePercentage: number;
  trend: 'up' | 'down' | 'stable';
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {

  private mockAnalyticsData: AnalyticsData = {
    totalVehicles: 125,
    totalWeight: 1250000,
    averageWeightPerVehicle: 10000,
    peakHours: [
      { hour: 6, vehicleCount: 15 },
      { hour: 7, vehicleCount: 28 },
      { hour: 8, vehicleCount: 32 },
      { hour: 9, vehicleCount: 25 },
      { hour: 10, vehicleCount: 20 },
      { hour: 11, vehicleCount: 18 },
      { hour: 12, vehicleCount: 12 },
      { hour: 14, vehicleCount: 16 },
      { hour: 15, vehicleCount: 22 },
      { hour: 16, vehicleCount: 30 }
    ],
    vehicleTypeDistribution: [
      { type: 'Heavy Truck', count: 45 },
      { type: 'Medium Truck', count: 35 },
      { type: 'Light Truck', count: 25 },
      { type: 'Tanker', count: 15 },
      { type: 'Others', count: 5 }
    ],
    dailyTrend: [
      { date: '2026-05-15', vehicles: 98, weight: 980000 },
      { date: '2026-05-16', vehicles: 105, weight: 1050000 },
      { date: '2026-05-17', vehicles: 112, weight: 1120000 },
      { date: '2026-05-18', vehicles: 95, weight: 950000 },
      { date: '2026-05-19', vehicles: 118, weight: 1180000 },
      { date: '2026-05-20', vehicles: 125, weight: 1250000 },
      { date: '2026-05-21', vehicles: 110, weight: 1100000 }
    ],
    hourlyDistribution: [
      { hour: 1, count: 2 }, { hour: 2, count: 1 }, { hour: 3, count: 0 },
      { hour: 4, count: 0 }, { hour: 5, count: 3 }, { hour: 6, count: 15 },
      { hour: 7, count: 28 }, { hour: 8, count: 32 }, { hour: 9, count: 25 },
      { hour: 10, count: 20 }, { hour: 11, count: 18 }, { hour: 12, count: 12 },
      { hour: 13, count: 8 }, { hour: 14, count: 16 }, { hour: 15, count: 22 },
      { hour: 16, count: 30 }, { hour: 17, count: 28 }, { hour: 18, count: 25 },
      { hour: 19, count: 15 }, { hour: 20, count: 10 }, { hour: 21, count: 5 },
      { hour: 22, count: 3 }, { hour: 23, count: 1 }, { hour: 24, count: 0 }
    ],
    topDrivers: [
      { name: 'Rajesh Kumar', trips: 15, totalWeight: 150000 },
      { name: 'Vikram Singh', trips: 12, totalWeight: 96000 },
      { name: 'Priya Sharma', trips: 11, totalWeight: 115500 },
      { name: 'Anil Patel', trips: 10, totalWeight: 60000 },
      { name: 'Suresh Verma', trips: 9, totalWeight: 108000 }
    ],
    vehicleUtilization: [
      { vehicleNumber: 'HR-26-AB-1234', tripCount: 8, totalWeight: 80000, efficiency: 92 },
      { vehicleNumber: 'DL-01-CD-5678', tripCount: 7, totalWeight: 56000, efficiency: 85 },
      { vehicleNumber: 'MH-02-EF-9012', tripCount: 6, totalWeight: 36000, efficiency: 78 },
      { vehicleNumber: 'KA-03-GH-3456', tripCount: 5, totalWeight: 60000, efficiency: 88 },
      { vehicleNumber: 'GJ-04-IJ-7890', tripCount: 7, totalWeight: 73500, efficiency: 90 }
    ],
    costAnalysis: {
      totalCost: 125000,
      costPerVehicle: 1000,
      costPerKg: 0.1
    }
  };

  getAnalytics(): Observable<AnalyticsData> {
    return of(this.mockAnalyticsData).pipe(delay(500));
  }

  getDailyTrend(days: number = 7): Observable<Array<{ date: string; vehicles: number; weight: number }>> {
    const trend = this.mockAnalyticsData.dailyTrend.slice(-days);
    return of(trend).pipe(delay(400));
  }

  getPeakHours(): Observable<Array<{ hour: number; vehicleCount: number }>> {
    return of(this.mockAnalyticsData.peakHours).pipe(delay(300));
  }

  getHourlyDistribution(): Observable<Array<{ hour: number; count: number }>> {
    return of(this.mockAnalyticsData.hourlyDistribution).pipe(delay(300));
  }

  getVehicleTypeDistribution(): Observable<Array<{ type: string; count: number }>> {
    return of(this.mockAnalyticsData.vehicleTypeDistribution).pipe(delay(300));
  }

  getTopDrivers(limit: number = 5): Observable<Array<{ name: string; trips: number; totalWeight: number }>> {
    const topDrivers = this.mockAnalyticsData.topDrivers.slice(0, limit);
    return of(topDrivers).pipe(delay(300));
  }

  getVehicleUtilization(): Observable<Array<{ vehicleNumber: string; tripCount: number; totalWeight: number; efficiency: number }>> {
    return of(this.mockAnalyticsData.vehicleUtilization).pipe(delay(300));
  }

  getCostAnalysis(): Observable<{ totalCost: number; costPerVehicle: number; costPerKg: number }> {
    return of(this.mockAnalyticsData.costAnalysis).pipe(delay(300));
  }

  getComparisonMetrics(metric: string): Observable<ComparisonMetrics> {
    const metrics: ComparisonMetrics = {
      currentMonth: 2850,
      previousMonth: 2560,
      changePercentage: 11.3,
      trend: 'up'
    };
    return of(metrics).pipe(delay(300));
  }

  generateReport(reportType: string, format: string): Observable<Blob> {
    const mockData = JSON.stringify(this.mockAnalyticsData);
    const blob = new Blob([mockData], { type: 'application/json' });
    return of(blob).pipe(delay(500));
  }

  getMonthlyComparison(): Observable<Array<{ month: string; vehicles: number; weight: number }>> {
    const months = [
      { month: 'January', vehicles: 2100, weight: 21000000 },
      { month: 'February', vehicles: 2250, weight: 22500000 },
      { month: 'March', vehicles: 2400, weight: 24000000 },
      { month: 'April', vehicles: 2350, weight: 23500000 },
      { month: 'May', vehicles: 2600, weight: 26000000 }
    ];
    return of(months).pipe(delay(300));
  }

  getWeightDistribution(): Observable<Array<{ range: string; count: number }>> {
    const distribution = [
      { range: '0-5 ton', count: 15 },
      { range: '5-10 ton', count: 28 },
      { range: '10-15 ton', count: 38 },
      { range: '15-20 ton', count: 32 },
      { range: '20+ ton', count: 12 }
    ];
    return of(distribution).pipe(delay(300));
  }

  getCustomReport(startDate: Date, endDate: Date, filters: any): Observable<any> {
    const report = {
      dateRange: { startDate, endDate },
      filters,
      data: this.mockAnalyticsData,
      generatedAt: new Date()
    };
    return of(report).pipe(delay(600));
  }
}
