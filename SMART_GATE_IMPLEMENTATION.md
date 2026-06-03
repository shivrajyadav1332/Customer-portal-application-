# Smart Gate Monitoring System - Implementation Guide

## Overview

The Smart Gate Monitoring System is an advanced, real-time dashboard extension for the Angular Customer Portal that enables comprehensive monitoring of gate operations, vehicle movement, weighbridge transactions, ANPR detections, camera status, boom barriers, and LED messages.

## Architecture

### Components Structure

```
smart-gate-widgets/
├── signal-monitor/
│   ├── signal-monitor.component.ts
│   ├── signal-monitor.component.html
│   └── signal-monitor.component.scss
├── barrier-monitor/
├── anpr-monitor/
├── camera-monitor/
├── weighbridge-monitor/
├── current-vehicle/
├── led-display/
├── activity-log/
└── smart-gate-widgets.scss (shared styles)
```

### Services Architecture

```
Services:
├── gate-monitor.service.ts      # Main gate operations
├── anpr.service.ts              # ANPR detection monitoring
└── activity-log.service.ts      # Activity logging
```

### Data Models

All smart gate models are defined in `core/models/smart-gate.model.ts`

## Features

### 1. Gate Signal Monitoring

**Component**: `SignalMonitorComponent`

Displays real-time gate signal status with traffic light-style indicators.

**API Endpoint**: `GET /api/gate/signals`

**Response**:
```json
{
  "entrySignal": "RED",
  "exitSignal": "GREEN",
  "lastUpdated": "2026-05-26T10:20:00"
}
```

**Signal Values**: RED | GREEN | YELLOW

**Update Frequency**: 2 seconds (configurable)

### 2. Boom Barrier Monitoring

**Component**: `BarrierMonitorComponent`

Controls and monitors boom barriers for entry and exit gates.

**API Endpoint**: `GET /api/gate/barriers`

**Response**:
```json
{
  "entryBarrier": "OPEN",
  "exitBarrier": "CLOSED"
}
```

**Barrier Status**: OPEN | CLOSED | OPENING | CLOSING

**Control Endpoints**:
- `POST /api/gate/barriers/entry/open`
- `POST /api/gate/barriers/entry/close`
- `POST /api/gate/barriers/exit/open`
- `POST /api/gate/barriers/exit/close`

### 3. ANPR Vehicle Detection

**Component**: `ANPRMonitorComponent`

Tracks automatic number plate recognition detections.

**API Endpoint**: `GET /api/anpr/latest`

**Response**:
```json
{
  "latest": {
    "licensePlate": "MH12AB1234",
    "detectionTime": "2026-05-26T10:22:00",
    "gateLocation": "ENTRY",
    "detectionStatus": "DETECTED",
    "confidence": 0.95,
    "imagePath": "/images/anpr/12345.jpg"
  },
  "detectionHistory": []
}
```

**Additional Endpoints**:
- `GET /api/anpr/history?limit=20` - Detection history
- `GET /api/anpr/search?plate=MH12AB1234` - Search by plate
- `GET /api/anpr/range?start=date&end=date` - Date range search

### 4. Live Camera Monitoring

**Component**: `CameraMonitorComponent`

Displays live camera snapshots and status.

**API Endpoint**: `GET /api/cameras`

**Response**:
```json
{
  "cameras": [
    {
      "cameraId": "CAM001",
      "name": "Entry Gate Camera",
      "location": "ENTRY",
      "status": "ONLINE",
      "lastSnapshot": "data:image/jpeg;base64,...",
      "snapshotTimestamp": "2026-05-26T10:25:00",
      "rtspUrl": "rtsp://192.168.1.100/stream1"
    }
  ]
}
```

**Camera Operations**:
- `POST /api/cameras/{cameraId}/snapshot` - Capture snapshot
- `GET /api/cameras/{cameraId}/snapshot` - Get snapshot image

**Camera Status**: ONLINE | OFFLINE | ERROR

### 5. Live Weighbridge Monitoring

**Component**: `WeighbridgeMonitorComponent`

Real-time weighbridge data with progress indicators.

**API Endpoint**: `GET /api/gate/weighbridge/current`

**Response**:
```json
{
  "currentWeight": 25000,
  "grossWeight": 35000,
  "tareWeight": 10000,
  "netWeight": 25000,
  "unit": "KG",
  "lastUpdated": "2026-05-26T10:24:00",
  "status": "IDLE"
}
```

**Weight Status**: IDLE | WEIGHING | READY

### 6. Current Vehicle Status

**Component**: `CurrentVehicleComponent`

Displays information about the currently active vehicle.

**API Endpoint**: `GET /api/gate/current-vehicle`

**Response**:
```json
{
  "vehicleNumber": "MH12AB1234",
  "driverName": "Raj Kumar",
  "material": "Clinker",
  "status": "INSIDE_PLANT",
  "entryTime": "2026-05-26T10:20:00",
  "currentWeight": 25000,
  "vehicleType": "Tipper",
  "driverId": "DRV001"
}
```

**Vehicle Status**: ENTERED | INSIDE_PLANT | EXITING | EXITED

### 7. LED Display Monitoring

**Component**: `LEDDisplayComponent`

Monitor and control LED message displays.

**API Endpoint**: `GET /api/gate/led-message`

**Response**:
```json
{
  "message": "WELCOME MH12AB1234 PROCEED TO WEIGHBRIDGE",
  "displayTime": "2026-05-26T10:25:00",
  "lastUpdated": "2026-05-26T10:25:00",
  "scrolling": true
}
```

**Update Endpoint**:
- `POST /api/gate/led-message` - Update LED message

**Update Payload**:
```json
{
  "message": "Your custom message here"
}
```

### 8. Recent Gate Activities

**Component**: `ActivityLogComponent`

Timeline-based activity logging.

**API Endpoint**: `GET /api/logs/recent?limit=10`

**Response**:
```json
{
  "activities": [
    {
      "id": "LOG001",
      "timestamp": "2026-05-26T10:25:00",
      "activityType": "VEHICLE_ENTERED",
      "description": "Vehicle MH12AB1234 entered the gate",
      "vehicleNumber": "MH12AB1234",
      "status": "SUCCESS"
    }
  ]
}
```

**Activity Types**:
- VEHICLE_ENTERED
- ANPR_DETECTED
- BARRIER_OPENED
- BARRIER_CLOSED
- WEIGHING_STARTED
- WEIGHING_COMPLETED
- VEHICLE_EXITED
- ERROR

**Activity Status**: SUCCESS | PENDING | FAILED

**Additional Endpoints**:
- `GET /api/logs/vehicle/{vehicleNumber}` - By vehicle
- `GET /api/logs/range?start=date&end=date` - Date range

## Real-Time Data Updates

All components use RxJS polling to update data at configurable intervals:

| Component | Poll Interval | Service |
|-----------|--------------|---------|
| Gate Signal | 2 seconds | GateMonitorService |
| Barrier Status | 2 seconds | GateMonitorService |
| Weighbridge | 1 second | GateMonitorService |
| Current Vehicle | 2 seconds | GateMonitorService |
| LED Message | 3 seconds | GateMonitorService |
| Cameras | 5 seconds | GateMonitorService |
| ANPR | 3 seconds | ANPRService |
| Activities | 5 seconds | ActivityLogService |

## Responsive Layout

### Desktop (1200px+)
- Row 1: 3 columns (Signal, Barrier, ANPR)
- Row 2: 2 columns (Cameras full-width, LED)
- Row 3: 2 columns (Current Vehicle, Weighbridge)
- Row 4: Full-width (Activity Log)

### Tablet (768px - 1199px)
- Row 1: 2 columns
- Row 2: Full-width responsive
- Row 3: Full-width responsive
- Row 4: Full-width (Activity Log)

### Mobile (<768px)
- All rows: Single column
- Full-width responsive layout

## Styling

### Color Scheme

```scss
$primary-color: #1976d2       // Primary actions
$secondary-color: #00acc1     // Secondary elements
$success-color: #43a047       // Success status
$warning-color: #fb8c00       // Warning status
$danger-color: #e53935        // Danger/error status
$background-color: #f4f6f9    // Background
```

### Card Styling

- Border-radius: 8px
- Box shadow: 0 2px 8px rgba(0,0,0,0.08)
- Hover effect: 0 4px 16px rgba(0,0,0,0.12)

## Service Usage

### Starting Real-Time Monitoring

```typescript
// In dashboard component
ngOnInit() {
  this.gateMonitorService.startRealTimeMonitoring();
  this.anprService.startMonitoring();
  this.activityLogService.startMonitoring();
}
```

### Subscribing to Data

```typescript
// Subscribe to gate signals
this.gateMonitorService.gateSignal$.subscribe(signal => {
  console.log('Gate Signal:', signal);
});

// Subscribe to barrier status
this.gateMonitorService.barrierStatus$.subscribe(status => {
  console.log('Barrier Status:', status);
});

// Subscribe to weighbridge data
this.gateMonitorService.weighbridge$.subscribe(data => {
  console.log('Weighbridge Data:', data);
});
```

## Backend API Integration

### Base URL Configuration

Update the API base URL in services if needed:

```typescript
private apiUrl = '/api/gate';  // GateMonitorService
private apiUrl = '/api/anpr';  // ANPRService
private apiUrl = '/api/logs';  // ActivityLogService
```

### Error Handling

All services include error handling with console logging:

```typescript
catchError(error => {
  console.error('Error:', error);
  return of(null);
})
```

### Authentication

Services use the existing HttpClient with interceptors configured in `app.config.ts`

## Database Tables (SQLite)

Required database tables for backend:

```sql
-- Gate Signals
CREATE TABLE signal_status (
  id INTEGER PRIMARY KEY,
  entry_signal TEXT,
  exit_signal TEXT,
  updated_at TIMESTAMP
);

-- Barriers
CREATE TABLE barrier_status (
  id INTEGER PRIMARY KEY,
  entry_barrier TEXT,
  exit_barrier TEXT,
  updated_at TIMESTAMP
);

-- Weighbridge
CREATE TABLE weighbridge_transactions (
  id INTEGER PRIMARY KEY,
  current_weight REAL,
  gross_weight REAL,
  tare_weight REAL,
  net_weight REAL,
  status TEXT,
  created_at TIMESTAMP
);

-- ANPR Logs
CREATE TABLE anpr_logs (
  id INTEGER PRIMARY KEY,
  license_plate TEXT,
  detection_time TIMESTAMP,
  gate_location TEXT,
  detection_status TEXT,
  confidence REAL,
  image_path TEXT
);

-- Camera Status
CREATE TABLE camera_status (
  id INTEGER PRIMARY KEY,
  camera_id TEXT,
  name TEXT,
  location TEXT,
  status TEXT,
  last_snapshot BLOB,
  snapshot_timestamp TIMESTAMP
);

-- Vehicle Entries
CREATE TABLE vehicle_entries (
  id INTEGER PRIMARY KEY,
  vehicle_number TEXT,
  driver_name TEXT,
  material TEXT,
  status TEXT,
  entry_time TIMESTAMP,
  current_weight REAL
);

-- Gate Logs
CREATE TABLE gate_logs (
  id INTEGER PRIMARY KEY,
  timestamp TIMESTAMP,
  activity_type TEXT,
  description TEXT,
  vehicle_number TEXT,
  status TEXT
);

-- LED Messages
CREATE TABLE led_messages (
  id INTEGER PRIMARY KEY,
  message TEXT,
  displayed_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id INTEGER PRIMARY KEY,
  type TEXT,
  message TEXT,
  created_at TIMESTAMP
);
```

## Performance Considerations

1. **Polling Intervals**: Adjust polling intervals in services based on server capacity
2. **Data Caching**: Services maintain BehaviorSubjects for cached data
3. **Memory Management**: All subscriptions use `takeUntil` with destroy$ subject
4. **Image Optimization**: Camera snapshots should be compressed for faster delivery

## Common Issues and Solutions

### Issue: Components not receiving data
**Solution**: Ensure services' `startMonitoring()` or `startRealTimeMonitoring()` is called in dashboard `ngOnInit()`

### Issue: Real-time updates not working
**Solution**: Verify API endpoints are correctly configured and returning data

### Issue: Memory leaks
**Solution**: All components use `takeUntil(this.destroy$)` pattern to unsubscribe on destroy

### Issue: Camera images not loading
**Solution**: Verify CORS headers are set correctly on server for image endpoints

## Future Enhancements

1. WebSocket integration for real-time data instead of polling
2. Historical data analytics and trends
3. Alert notifications for gate events
4. Video playback from camera archives
5. Export functionality for reports
6. Custom dashboard layouts
7. User role-based permissions
8. Mobile app integration

## Support and Maintenance

For issues or feature requests, refer to:
- Component documentation in component files
- Service API documentation
- Backend API specifications
- Database schema documentation
