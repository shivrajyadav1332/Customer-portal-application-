// Gate Signal Status
export interface GateSignal {
    entrySignal: 'RED' | 'GREEN' | 'YELLOW';
    exitSignal: 'RED' | 'GREEN' | 'YELLOW';
    lastUpdated: string;
}

// Barrier Status
export interface BarrierStatus {
    entryBarrier: 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING';
    exitBarrier: 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING';
    lastUpdated: string;
}

// ANPR Detection
export interface ANPRDetection {
    licensePlate: string;
    detectionTime: string;
    gateLocation: 'ENTRY' | 'EXIT';
    detectionStatus: 'DETECTED' | 'RECOGNIZED' | 'FAILED';
    confidence: number;
    imagePath?: string;
}

// ANPR Latest
export interface ANPRLatest {
    latest: ANPRDetection;
    detectionHistory: ANPRDetection[];
}

// Camera Status
export interface CameraStatus {
    cameraId: string;
    name: string;
    location: 'ENTRY' | 'EXIT';
    status: 'ONLINE' | 'OFFLINE' | 'ERROR';
    lastSnapshot?: string;
    snapshotTimestamp?: string;
    rtspUrl?: string;
}

// Camera List
export interface CameraList {
    cameras: CameraStatus[];
}

// Weighbridge Data
export interface WeighbridgeData {
    currentWeight: number;
    grossWeight: number;
    tareWeight: number;
    netWeight: number;
    unit: 'KG' | 'TON';
    lastUpdated: string;
    status: 'IDLE' | 'WEIGHING' | 'READY';
}

// Current Vehicle Information
export interface CurrentVehicle {
    vehicleNumber: string;
    driverName: string;
    material: string;
    status: 'ENTERED' | 'INSIDE_PLANT' | 'EXITING' | 'EXITED';
    entryTime: string;
    currentWeight: number;
    vehicleType?: string;
    driverId?: string;
}

// LED Message
export interface LEDMessage {
    message: string;
    displayTime: string;
    lastUpdated: string;
    scrolling: boolean;
}

// Gate Activity Log
export interface GateActivity {
    id: string;
    timestamp: string;
    activityType: 'VEHICLE_ENTERED' | 'ANPR_DETECTED' | 'BARRIER_OPENED' | 'BARRIER_CLOSED' | 'WEIGHING_STARTED' | 'WEIGHING_COMPLETED' | 'VEHICLE_EXITED' | 'ERROR';
    description: string;
    vehicleNumber?: string;
    status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

// Recent Activities
export interface RecentActivities {
    activities: GateActivity[];
}

// Overall Smart Gate Status
export interface SmartGateStatus {
    gateSignal: GateSignal;
    barrierStatus: BarrierStatus;
    currentWeighbridge: WeighbridgeData;
    currentVehicle: CurrentVehicle | null;
    ledMessage: LEDMessage;
    anprLatest: ANPRDetection | null;
    cameras: CameraStatus[];
    recentActivities: GateActivity[];
}
