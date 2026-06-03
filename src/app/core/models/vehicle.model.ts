export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  driverName: string;
  driverPhone: string;
  entryTime: Date;
  exitTime?: Date;
  status: VehicleStatus;
  currentWeight: number;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  currentLocation: string;
  entryBarrierStatus: boolean;
  exitBarrierStatus: boolean;
  entryAnprImage?: string;
  exitAnprImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum VehicleStatus {
  Pending = 'Pending',
  Entered = 'Entered',
  OnWeighbridge = 'OnWeighbridge',
  Weighed = 'Weighed',
  ReadyToExit = 'ReadyToExit',
  Exited = 'Exited',
  Failed = 'Failed'
}

export interface VehicleFilter {
  dateFrom?: Date;
  dateTo?: Date;
  vehicleNumber?: string;
  status?: VehicleStatus;
  pageNumber?: number;
  pageSize?: number;
}

export interface VehicleTrackingDTO {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  driverName: string;
  entryTime: Date;
  exitTime?: Date;
  status: VehicleStatus;
  currentWeight: number;
  currentLocation: string;
}

export interface LiveVehicleUpdate {
  vehicleId: string;
  status: VehicleStatus;
  currentWeight: number;
  currentLocation: string;
  timestamp: Date;
  entryBarrierStatus: boolean;
  exitBarrierStatus: boolean;
}
