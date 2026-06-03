import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { WeighbridgeReport } from '../models/report.model';
import { PaginatedResponse } from '../models/api-response.model';

export interface WeighbridgeStats {
  totalWeighing: number;
  totalGrossWeight: number;
  totalNetWeight: number;
  averageGrossWeight: number;
  averageNetWeight: number;
  todayTransactions: number;
}

@Injectable({
  providedIn: 'root'
})
export class WeighbridgeService {
  
  private mockReports: WeighbridgeReport[] = [
    {
      id: 'wr-001',
      vehicleNumber: 'HR-26-AB-1234',
      grossWeight: 15000,
      tareWeight: 5000,
      netWeight: 10000,
      ticketNumber: 'T-2026-0501',
      transactionDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      driverName: 'Rajesh Kumar',
      vehicleType: 'Heavy Truck'
    },
    {
      id: 'wr-002',
      vehicleNumber: 'DL-01-CD-5678',
      grossWeight: 12000,
      tareWeight: 4000,
      netWeight: 8000,
      ticketNumber: 'T-2026-0502',
      transactionDate: new Date(Date.now() - 45 * 60 * 1000),
      driverName: 'Vikram Singh',
      vehicleType: 'Medium Truck'
    },
    {
      id: 'wr-003',
      vehicleNumber: 'MH-02-EF-9012',
      grossWeight: 9000,
      tareWeight: 3000,
      netWeight: 6000,
      ticketNumber: 'T-2026-0503',
      transactionDate: new Date(Date.now() - 120 * 60 * 1000),
      driverName: 'Anil Patel',
      vehicleType: 'Light Truck'
    },
    {
      id: 'wr-004',
      vehicleNumber: 'KA-03-GH-3456',
      grossWeight: 18000,
      tareWeight: 6000,
      netWeight: 12000,
      ticketNumber: 'T-2026-0504',
      transactionDate: new Date(Date.now() - 90 * 60 * 1000),
      driverName: 'Suresh Verma',
      vehicleType: 'Tanker'
    },
    {
      id: 'wr-005',
      vehicleNumber: 'GJ-04-IJ-7890',
      grossWeight: 16000,
      tareWeight: 5500,
      netWeight: 10500,
      ticketNumber: 'T-2026-0505',
      transactionDate: new Date(Date.now() - 10 * 60 * 1000),
      driverName: 'Priya Sharma',
      vehicleType: 'Heavy Truck'
    },
    {
      id: 'wr-006',
      vehicleNumber: 'UP-05-KL-2345',
      grossWeight: 11000,
      tareWeight: 3500,
      netWeight: 7500,
      ticketNumber: 'T-2026-0506',
      transactionDate: new Date(Date.now() - 180 * 60 * 1000),
      driverName: 'Manoj Singh',
      vehicleType: 'Medium Truck'
    },
    {
      id: 'wr-007',
      vehicleNumber: 'PB-06-MN-6789',
      grossWeight: 14000,
      tareWeight: 4500,
      netWeight: 9500,
      ticketNumber: 'T-2026-0507',
      transactionDate: new Date(Date.now() - 240 * 60 * 1000),
      driverName: 'Harpreet Kaur',
      vehicleType: 'Heavy Truck'
    }
  ];

  getReports(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<WeighbridgeReport>> {
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedData = this.mockReports.slice(startIndex, startIndex + pageSize);
    
    const response: PaginatedResponse<WeighbridgeReport> = {
      data: paginatedData,
      pageNumber,
      pageSize,
      totalCount: this.mockReports.length,
      totalPages: Math.ceil(this.mockReports.length / pageSize)
    };
    
    return of(response).pipe(delay(500));
  }

  getReportById(id: string): Observable<WeighbridgeReport> {
    const report = this.mockReports.find(r => r.id === id);
    return of(report || this.mockReports[0]).pipe(delay(300));
  }

  getReportsByVehicle(vehicleNumber: string): Observable<WeighbridgeReport[]> {
    const reports = this.mockReports.filter(r => r.vehicleNumber === vehicleNumber);
    return of(reports).pipe(delay(300));
  }

  getReportsByDateRange(startDate: Date, endDate: Date): Observable<WeighbridgeReport[]> {
    const reports = this.mockReports.filter(r =>
      r.transactionDate >= startDate && r.transactionDate <= endDate
    );
    return of(reports).pipe(delay(400));
  }

  getTodayReports(): Observable<WeighbridgeReport[]> {
    return of(this.mockReports).pipe(delay(400));
  }

  getWeighbridgeStats(): Observable<WeighbridgeStats> {
    const stats: WeighbridgeStats = {
      totalWeighing: this.mockReports.length,
      totalGrossWeight: this.mockReports.reduce((sum, r) => sum + r.grossWeight, 0),
      totalNetWeight: this.mockReports.reduce((sum, r) => sum + r.netWeight, 0),
      averageGrossWeight: Math.round(
        this.mockReports.reduce((sum, r) => sum + r.grossWeight, 0) / this.mockReports.length
      ),
      averageNetWeight: Math.round(
        this.mockReports.reduce((sum, r) => sum + r.netWeight, 0) / this.mockReports.length
      ),
      todayTransactions: this.mockReports.length
    };
    return of(stats).pipe(delay(300));
  }

  searchReports(query: string): Observable<WeighbridgeReport[]> {
    const results = this.mockReports.filter(r =>
      r.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
      r.ticketNumber.toLowerCase().includes(query.toLowerCase()) ||
      r.driverName.toLowerCase().includes(query.toLowerCase())
    );
    return of(results).pipe(delay(300));
  }

  exportReports(format: 'pdf' | 'excel' | 'csv'): Observable<Blob> {
    const csvData = this.mockReports.map(r => 
      `${r.ticketNumber},${r.vehicleNumber},${r.driverName},${r.vehicleType},${r.grossWeight},${r.tareWeight},${r.netWeight},${r.transactionDate.toISOString()}`
    ).join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    return of(blob).pipe(delay(500));
  }
}
