export interface DashboardKPI {
  totalVehicles: number;
  vehiclesInside: number;
  vehiclesExitedToday: number;
  pendingVehicles: number;
  todaysTotalWeight: number;
  averageVehicleWeight: number;
}

export interface VehicleEntryExitTrend {
  date: Date;
  entries: number;
  exits: number;
}

export interface DailyWeightTrend {
  date: Date;
  totalWeight: number;
  averageWeight: number;
  vehicleCount: number;
}

export interface VehicleStatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface MonthlyVehicleStatistics {
  month: string;
  totalVehicles: number;
  totalWeight: number;
  averageWeight: number;
}

export interface RecentVehicleActivity {
  id: string;
  vehicleNumber: string;
  driverName: string;
  entryTime: Date;
  exitTime?: Date;
  status: string;
  netWeight: number;
}

export interface WeighbridgeTransaction {
  id: string;
  vehicleNumber: string;
  grossWeight: number;
  tareWeight: number;
  netWeight: number;
  ticketNumber: string;
  transactionDate: Date;
}

// Aliases for backward compatibility
export type VehicleActivity = RecentVehicleActivity;
export type Transaction = WeighbridgeTransaction;

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  priority?: 'low' | 'medium' | 'high';
  read?: boolean;
  timestamp: Date;
}

export interface DashboardSummary {
  totalVehicles: number;
  vehicleEntries: number;
  vehicleExits: number;
  pendingApprovals: number;
  totalWeight: number;
  todayWeight: number;
}

export interface ChartDataset {
  label: string;
  data: number[];
  borderColor?: string;
  backgroundColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface ChartConfig {
  labels: string[];
  datasets: ChartDataset[];
}

export interface VehicleTrendData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface WeightTrendData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface VehicleStatusChartData {
  labels: string[];
  data: number[];
  colors: string[];
}

export interface MonthlyStats {
  month: string;
  entries: number;
  exits: number;
  weight?: number;
}

export interface EnhancedDashboardData {
  summary: DashboardSummary;
  recentActivities: VehicleActivity[];
  transactions: Transaction[];
  notifications: DashboardNotification[];
  vehicleTrend: VehicleTrendData;
  weightTrend: WeightTrendData;
  vehicleStatus: VehicleStatusChartData;
  monthlyStatistics: MonthlyStats[];
}

export interface DashboardData {
  kpi: DashboardKPI;
  entryExitTrend: VehicleEntryExitTrend[];
  weightTrend: DailyWeightTrend[];
  statusDistribution: VehicleStatusDistribution[];
  monthlyStats: MonthlyVehicleStatistics[];
  recentActivities: RecentVehicleActivity[];
  weighbridgeTransactions: WeighbridgeTransaction[];
  // Enhanced dashboard support
  summary?: DashboardSummary;
  transactions?: Transaction[];
  notifications?: Notification[];
  vehicleTrend?: VehicleTrendData;
  vehicleStatus?: VehicleStatusChartData;
  monthlyStatistics?: MonthlyStats[];
}
