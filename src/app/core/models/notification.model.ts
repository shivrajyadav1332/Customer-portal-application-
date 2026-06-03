export interface Notification {
  id: string;
  customerId: string;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  vehicleId?: string;
  vehicleNumber?: string;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
}

export enum NotificationType {
  VehicleArrived = 'VehicleArrived',
  VehicleProcessed = 'VehicleProcessed',
  VehicleExited = 'VehicleExited',
  WeightCaptured = 'WeightCaptured',
  SystemAlert = 'SystemAlert',
  MaintenanceAlert = 'MaintenanceAlert'
}

export enum NotificationStatus {
  Unread = 'Unread',
  Read = 'Read',
  Archived = 'Archived'
}

export interface NotificationPreferences {
  vehicleArrivedEnabled: boolean;
  vehicleExitedEnabled: boolean;
  weightCapturedEnabled: boolean;
  systemAlertsEnabled: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}
