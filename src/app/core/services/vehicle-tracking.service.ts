import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Vehicle, VehicleStatus } from '../models/vehicle.model';
import { PaginatedResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class VehicleTrackingService {
  
  private mockVehicles: Vehicle[] = [
    {
      id: 'v-001',
      vehicleNumber: 'HR-26-AB-1234',
      vehicleType: 'Heavy Truck',
      driverName: 'Rajesh Kumar',
      driverPhone: '+91-9876543210',
      entryTime: new Date(Date.now() - 2 * 60 * 60 * 1000),
      exitTime: new Date(Date.now() - 30 * 60 * 1000),
      status: VehicleStatus.Exited,
      currentWeight: 0,
      grossWeight: 15000,
      tareWeight: 5000,
      netWeight: 10000,
      currentLocation: 'Exit Gate',
      entryBarrierStatus: true,
      exitBarrierStatus: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'v-002',
      vehicleNumber: 'DL-01-CD-5678',
      vehicleType: 'Medium Truck',
      driverName: 'Vikram Singh',
      driverPhone: '+91-8765432109',
      entryTime: new Date(Date.now() - 45 * 60 * 1000),
      status: VehicleStatus.OnWeighbridge,
      currentWeight: 12000,
      grossWeight: 12000,
      tareWeight: 4000,
      netWeight: 8000,
      currentLocation: 'Weighbridge',
      entryBarrierStatus: true,
      exitBarrierStatus: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'v-003',
      vehicleNumber: 'MH-02-EF-9012',
      vehicleType: 'Light Truck',
      driverName: 'Anil Patel',
      driverPhone: '+91-7654321098',
      entryTime: new Date(Date.now() - 20 * 60 * 1000),
      status: VehicleStatus.Entered,
      currentWeight: 0,
      grossWeight: 0,
      tareWeight: 0,
      netWeight: 0,
      currentLocation: 'Entry Queue',
      entryBarrierStatus: true,
      exitBarrierStatus: false,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'v-004',
      vehicleNumber: 'KA-03-GH-3456',
      vehicleType: 'Tanker',
      driverName: 'Suresh Verma',
      driverPhone: '+91-6543210987',
      entryTime: new Date(Date.now() - 90 * 60 * 1000),
      exitTime: new Date(Date.now() - 20 * 60 * 1000),
      status: VehicleStatus.Exited,
      currentWeight: 0,
      grossWeight: 18000,
      tareWeight: 6000,
      netWeight: 12000,
      currentLocation: 'Exit Gate',
      entryBarrierStatus: true,
      exitBarrierStatus: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: 'v-005',
      vehicleNumber: 'GJ-04-IJ-7890',
      vehicleType: 'Heavy Truck',
      driverName: 'Priya Sharma',
      driverPhone: '+91-5432109876',
      entryTime: new Date(Date.now() - 10 * 60 * 1000),
      status: VehicleStatus.Weighed,
      currentWeight: 0,
      grossWeight: 16000,
      tareWeight: 5500,
      netWeight: 10500,
      currentLocation: 'Weighbridge Exit',
      entryBarrierStatus: true,
      exitBarrierStatus: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  getVehicles(pageNumber: number = 1, pageSize: number = 10): Observable<PaginatedResponse<Vehicle>> {
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedData = this.mockVehicles.slice(startIndex, startIndex + pageSize);
    
    const response: PaginatedResponse<Vehicle> = {
      data: paginatedData,
      pageNumber,
      pageSize,
      totalCount: this.mockVehicles.length,
      totalPages: Math.ceil(this.mockVehicles.length / pageSize)
    };
    
    return of(response).pipe(delay(500));
  }

  getVehicleById(id: string): Observable<Vehicle> {
    const vehicle = this.mockVehicles.find(v => v.id === id);
    return of(vehicle || this.mockVehicles[0]).pipe(delay(300));
  }

  getTodayVehicles(): Observable<Vehicle[]> {
    return of(this.mockVehicles).pipe(delay(400));
  }

  getInsideVehicles(): Observable<Vehicle[]> {
    const inside = this.mockVehicles.filter(v => 
      v.status !== VehicleStatus.Exited && v.status !== VehicleStatus.Failed
    );
    return of(inside).pipe(delay(400));
  }

  getExitedVehicles(): Observable<Vehicle[]> {
    const exited = this.mockVehicles.filter(v => v.status === VehicleStatus.Exited);
    return of(exited).pipe(delay(400));
  }

  getVehicleHistory(vehicleNumber: string): Observable<Vehicle[]> {
    const history = this.mockVehicles.filter(v => v.vehicleNumber === vehicleNumber);
    return of(history).pipe(delay(300));
  }

  getVehiclesByStatus(status: VehicleStatus): Observable<Vehicle[]> {
    const filtered = this.mockVehicles.filter(v => v.status === status);
    return of(filtered).pipe(delay(300));
  }

  searchVehicles(query: string): Observable<Vehicle[]> {
    const results = this.mockVehicles.filter(v =>
      v.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
      v.driverName.toLowerCase().includes(query.toLowerCase())
    );
    return of(results).pipe(delay(300));
  }
}
