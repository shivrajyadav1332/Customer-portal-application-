import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { 
  Vehicle, 
  VehicleFilter, 
  VehicleTrackingDTO, 
  LiveVehicleUpdate 
} from '../models/vehicle.model';
import { PaginatedResponse } from '../models/api-response.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vehicles`;

  getVehicles(filter: VehicleFilter): Observable<PaginatedResponse<VehicleTrackingDTO>> {
    let params = new HttpParams();
    
    if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom.toISOString());
    if (filter.dateTo) params = params.set('dateTo', filter.dateTo.toISOString());
    if (filter.vehicleNumber) params = params.set('vehicleNumber', filter.vehicleNumber);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.pageNumber) params = params.set('pageNumber', filter.pageNumber.toString());
    if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());

    return this.http.get<PaginatedResponse<VehicleTrackingDTO>>(this.apiUrl, { params });
  }

  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  getTodayVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/today/all`);
  }

  getInsideVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/inside/all`);
  }

  getVehicleHistory(vehicleNumber: string): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.apiUrl}/history/${vehicleNumber}`);
  }

  exportVehicleData(startDate: Date, endDate: Date): Observable<Blob> {
    let params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());
    
    return this.http.get(`${this.apiUrl}/export`, { 
      params, 
      responseType: 'blob' 
    });
  }
}
