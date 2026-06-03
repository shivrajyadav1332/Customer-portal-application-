export interface WeighbridgeReport {
  id: string;
  vehicleNumber: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  ticketNumber: string;
  transactionDate: Date;
  driverName: string;
  vehicleType: string;
}

export interface ReportFilter {
  dateFrom: Date;
  dateTo: Date;
  vehicleNumber?: string;
  ticketNumber?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface ExportRequest {
  format: 'pdf' | 'excel' | 'print';
  reportType: 'weighbridge' | 'vehicle-tracking' | 'analytics';
  data: any[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface PrintSlipData {
  ticketNumber: string;
  vehicleNumber: string;
  driverName: string;
  vehicleType: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  transactionDate: Date;
  operator: string;
}
