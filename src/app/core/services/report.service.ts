import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WeighbridgeReport, ReportFilter } from '../models/report.model';
import { PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/reports`;

  getWeighbridgeReports(filter: ReportFilter): Observable<PaginatedResponse<WeighbridgeReport>> {
    let params = new HttpParams();
    
    if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom.toISOString());
    if (filter.dateTo) params = params.set('dateTo', filter.dateTo.toISOString());
    if (filter.vehicleNumber) params = params.set('vehicleNumber', filter.vehicleNumber);
    if (filter.ticketNumber) params = params.set('ticketNumber', filter.ticketNumber);
    if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<PaginatedResponse<WeighbridgeReport>>(`${this.apiUrl}/weighbridge`, { params });
  }

  getReportById(id: string): Observable<WeighbridgeReport> {
    return this.http.get<WeighbridgeReport>(`${this.apiUrl}/${id}`);
  }

  exportToPDF(reportData: any, filename: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/pdf`, reportData, { 
      responseType: 'blob' 
    });
  }

  exportToExcel(reportData: any, filename: string): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/export/excel`, reportData, { 
      responseType: 'blob' 
    });
  }

  getPrintSlip(reportId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${reportId}/print-slip`);
  }

  getAnalyticsReport(customerId: string, startDate: Date, endDate: Date): Observable<any> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    return this.http.get(`${this.apiUrl}/analytics`, { params });
  }
}
