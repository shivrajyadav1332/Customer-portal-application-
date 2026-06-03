// Mock API Responses for Smart Gate Monitoring System
// These examples show the expected data format for all smart gate APIs

export const MOCK_GATE_SIGNALS = {
    entrySignal: 'GREEN',
    exitSignal: 'RED',
    lastUpdated: '2026-05-27T10:25:30'
};

export const MOCK_BARRIER_STATUS = {
    entryBarrier: 'OPEN',
    exitBarrier: 'CLOSED',
    lastUpdated: '2026-05-27T10:25:35'
};

export const MOCK_ANPR_LATEST = {
    latest: {
        licensePlate: 'MH12AB1234',
        detectionTime: '2026-05-27T10:22:45',
        gateLocation: 'ENTRY',
        detectionStatus: 'DETECTED',
        confidence: 0.98,
        imagePath: '/images/anpr/anpr_20260527_102245.jpg'
    },
    detectionHistory: [
        {
            licensePlate: 'MH12AB1234',
            detectionTime: '2026-05-27T10:22:45',
            gateLocation: 'ENTRY',
            detectionStatus: 'DETECTED',
            confidence: 0.98,
            imagePath: '/images/anpr/anpr_20260527_102245.jpg'
        },
        {
            licensePlate: 'KA01BC5678',
            detectionTime: '2026-05-27T10:20:15',
            gateLocation: 'ENTRY',
            detectionStatus: 'RECOGNIZED',
            confidence: 0.95,
            imagePath: '/images/anpr/anpr_20260527_102015.jpg'
        },
        {
            licensePlate: 'DL08EF9012',
            detectionTime: '2026-05-27T10:18:30',
            gateLocation: 'EXIT',
            detectionStatus: 'RECOGNIZED',
            confidence: 0.92,
            imagePath: '/images/anpr/anpr_20260527_101830.jpg'
        }
    ]
};

export const MOCK_CAMERAS = {
    cameras: [
        {
            cameraId: 'CAM001',
            name: 'Entry Gate Camera',
            location: 'ENTRY',
            status: 'ONLINE',
            lastSnapshot: null, // Would be base64 encoded image
            snapshotTimestamp: '2026-05-27T10:25:00',
            rtspUrl: 'rtsp://192.168.1.100/stream1'
        },
        {
            cameraId: 'CAM002',
            name: 'Exit Gate Camera',
            location: 'EXIT',
            status: 'ONLINE',
            lastSnapshot: null,
            snapshotTimestamp: '2026-05-27T10:24:55',
            rtspUrl: 'rtsp://192.168.1.100/stream2'
        }
    ]
};

export const MOCK_WEIGHBRIDGE_DATA = {
    currentWeight: 25000,
    grossWeight: 35000,
    tareWeight: 10000,
    netWeight: 25000,
    unit: 'KG',
    lastUpdated: '2026-05-27T10:24:30',
    status: 'WEIGHING'
};

export const MOCK_CURRENT_VEHICLE = {
    vehicleNumber: 'MH12AB1234',
    driverName: 'Raj Kumar',
    material: 'Clinker',
    status: 'INSIDE_PLANT',
    entryTime: '2026-05-27T10:20:00',
    currentWeight: 25000,
    vehicleType: 'Tipper',
    driverId: 'DRV00123'
};

export const MOCK_LED_MESSAGE = {
    message: 'WELCOME MH12AB1234 PROCEED TO WEIGHBRIDGE',
    displayTime: '2026-05-27T10:22:00',
    lastUpdated: '2026-05-27T10:25:15',
    scrolling: true
};

export const MOCK_RECENT_ACTIVITIES = {
    activities: [
        {
            id: 'LOG001',
            timestamp: '2026-05-27T10:25:30',
            activityType: 'WEIGHING_COMPLETED',
            description: 'Vehicle MH12AB1234 weighing completed successfully',
            vehicleNumber: 'MH12AB1234',
            status: 'SUCCESS'
        },
        {
            id: 'LOG002',
            timestamp: '2026-05-27T10:24:00',
            activityType: 'WEIGHING_STARTED',
            description: 'Vehicle MH12AB1234 entered weighbridge',
            vehicleNumber: 'MH12AB1234',
            status: 'SUCCESS'
        },
        {
            id: 'LOG003',
            timestamp: '2026-05-27T10:22:45',
            activityType: 'ANPR_DETECTED',
            description: 'ANPR detected vehicle MH12AB1234 at entry gate',
            vehicleNumber: 'MH12AB1234',
            status: 'SUCCESS'
        },
        {
            id: 'LOG004',
            timestamp: '2026-05-27T10:22:00',
            activityType: 'BARRIER_OPENED',
            description: 'Entry barrier opened for vehicle MH12AB1234',
            vehicleNumber: 'MH12AB1234',
            status: 'SUCCESS'
        },
        {
            id: 'LOG005',
            timestamp: '2026-05-27T10:20:00',
            activityType: 'VEHICLE_ENTERED',
            description: 'Vehicle MH12AB1234 entered the gate',
            vehicleNumber: 'MH12AB1234',
            status: 'SUCCESS'
        },
        {
            id: 'LOG006',
            timestamp: '2026-05-27T10:18:30',
            activityType: 'VEHICLE_EXITED',
            description: 'Vehicle KA01BC5678 exited the gate',
            vehicleNumber: 'KA01BC5678',
            status: 'SUCCESS'
        },
        {
            id: 'LOG007',
            timestamp: '2026-05-27T10:16:00',
            activityType: 'BARRIER_CLOSED',
            description: 'Exit barrier closed after vehicle exit',
            vehicleNumber: 'KA01BC5678',
            status: 'SUCCESS'
        },
        {
            id: 'LOG008',
            timestamp: '2026-05-27T10:15:30',
            activityType: 'WEIGHING_COMPLETED',
            description: 'Vehicle KA01BC5678 weighing completed',
            vehicleNumber: 'KA01BC5678',
            status: 'SUCCESS'
        }
    ]
};

// Testing utilities
export function generateMockGateSignal() {
    const signals = ['RED', 'GREEN', 'YELLOW'];
    return {
        entrySignal: signals[Math.floor(Math.random() * signals.length)],
        exitSignal: signals[Math.floor(Math.random() * signals.length)],
        lastUpdated: new Date().toISOString()
    };
}

export function generateMockWeighbridgeData() {
    const currentWeight = Math.floor(Math.random() * 50000) + 5000;
    const tareWeight = Math.floor(Math.random() * 10000) + 1000;
    return {
        currentWeight,
        grossWeight: currentWeight + tareWeight,
        tareWeight,
        netWeight: currentWeight,
        unit: 'KG',
        lastUpdated: new Date().toISOString(),
        status: ['IDLE', 'WEIGHING', 'READY'][Math.floor(Math.random() * 3)]
    };
}

export function generateMockANPRDetection() {
    const plates = ['MH12AB1234', 'KA01BC5678', 'DL08EF9012', 'GJ45HI3456'];
    const locations = ['ENTRY', 'EXIT'];
    const statuses = ['DETECTED', 'RECOGNIZED', 'FAILED'];

    return {
        licensePlate: plates[Math.floor(Math.random() * plates.length)],
        detectionTime: new Date().toISOString(),
        gateLocation: locations[Math.floor(Math.random() * locations.length)],
        detectionStatus: statuses[Math.floor(Math.random() * statuses.length)],
        confidence: Math.random() * 0.3 + 0.7
    };
}
