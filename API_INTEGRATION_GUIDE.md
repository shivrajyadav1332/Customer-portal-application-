# Smart Gate API Integration Guide

## Quick Start

This guide provides comprehensive instructions for integrating the Smart Gate Monitoring System with your backend API.

## 1. Base API Configuration

Update the service files to point to your backend API:

### GateMonitorService
```typescript
// src/app/core/services/gate-monitor.service.ts
private apiUrl = 'https://your-api.com/api/gate'; // Update this URL
```

### ANPRService
```typescript
// src/app/core/services/anpr.service.ts
private apiUrl = 'https://your-api.com/api/anpr'; // Update this URL
```

### ActivityLogService
```typescript
// src/app/core/services/activity-log.service.ts
private apiUrl = 'https://your-api.com/api/logs'; // Update this URL
```

## 2. API Endpoints Implementation

### Gate Signal Monitoring

**Endpoint**: `GET /api/gate/signals`

**Implementation Example (Node.js/Express)**:
```javascript
app.get('/api/gate/signals', (req, res) => {
  const gateSignals = db.query('SELECT entry_signal, exit_signal, updated_at FROM signal_status ORDER BY updated_at DESC LIMIT 1');
  res.json({
    entrySignal: gateSignals[0].entry_signal,
    exitSignal: gateSignals[0].exit_signal,
    lastUpdated: gateSignals[0].updated_at
  });
});
```

**Implementation Example (Python/Flask)**:
```python
@app.route('/api/gate/signals', methods=['GET'])
def get_gate_signals():
    signal = db.session.query(SignalStatus).order_by(SignalStatus.updated_at.desc()).first()
    return jsonify({
        'entrySignal': signal.entry_signal,
        'exitSignal': signal.exit_signal,
        'lastUpdated': signal.updated_at.isoformat()
    })
```

### Barrier Status

**Endpoint**: `GET /api/gate/barriers`

**Implementation Example**:
```javascript
app.get('/api/gate/barriers', (req, res) => {
  const barriers = db.query('SELECT entry_barrier, exit_barrier FROM barrier_status ORDER BY updated_at DESC LIMIT 1');
  res.json({
    entryBarrier: barriers[0].entry_barrier,
    exitBarrier: barriers[0].exit_barrier
  });
});

app.post('/api/gate/barriers/entry/open', (req, res) => {
  // Call hardware API to open barrier
  hardwareController.openBarrier('ENTRY');
  db.query('UPDATE barrier_status SET entry_barrier = ?, updated_at = NOW()', ['OPEN']);
  res.json({ entryBarrier: 'OPEN' });
});
```

### Weighbridge Monitoring

**Endpoint**: `GET /api/gate/weighbridge/current`

**Implementation Example**:
```javascript
app.get('/api/gate/weighbridge/current', (req, res) => {
  const weight = weighbridgeDevice.getCurrentWeight();
  res.json({
    currentWeight: weight.current,
    grossWeight: weight.gross,
    tareWeight: weight.tare,
    netWeight: weight.net,
    unit: 'KG',
    lastUpdated: new Date().toISOString(),
    status: weight.status
  });
});
```

### ANPR Detection

**Endpoint**: `GET /api/anpr/latest`

**Implementation Example**:
```javascript
app.get('/api/anpr/latest', (req, res) => {
  const latest = db.query('SELECT * FROM anpr_logs ORDER BY detection_time DESC LIMIT 1');
  const history = db.query('SELECT * FROM anpr_logs ORDER BY detection_time DESC LIMIT 20');
  
  res.json({
    latest: {
      licensePlate: latest[0].license_plate,
      detectionTime: latest[0].detection_time,
      gateLocation: latest[0].gate_location,
      detectionStatus: latest[0].detection_status,
      confidence: latest[0].confidence,
      imagePath: latest[0].image_path
    },
    detectionHistory: history.map(h => ({
      licensePlate: h.license_plate,
      detectionTime: h.detection_time,
      gateLocation: h.gate_location,
      detectionStatus: h.detection_status,
      confidence: h.confidence
    }))
  });
});
```

### Camera Snapshots

**Endpoint**: `GET /api/cameras`

**Implementation Example**:
```javascript
app.get('/api/cameras', (req, res) => {
  const cameras = db.query('SELECT camera_id, name, location, status, snapshot_timestamp, rtsp_url FROM camera_status');
  
  res.json({
    cameras: cameras.map(cam => ({
      cameraId: cam.camera_id,
      name: cam.name,
      location: cam.location,
      status: cam.status,
      lastSnapshot: null, // Load from file system if needed
      snapshotTimestamp: cam.snapshot_timestamp,
      rtspUrl: cam.rtsp_url
    }))
  });
});

app.post('/api/cameras/:cameraId/snapshot', (req, res) => {
  const cameraId = req.params.cameraId;
  const snapshot = cameraDevice.captureSnapshot(cameraId);
  // Save snapshot to file system or storage
  res.json({ success: true, timestamp: new Date().toISOString() });
});
```

### LED Message Display

**Endpoint**: `GET /api/gate/led-message`

**Implementation Example**:
```javascript
app.get('/api/gate/led-message', (req, res) => {
  const message = db.query('SELECT message, displayed_at, updated_at FROM led_messages ORDER BY updated_at DESC LIMIT 1');
  res.json({
    message: message[0].message,
    displayTime: message[0].displayed_at,
    lastUpdated: message[0].updated_at,
    scrolling: true
  });
});

app.post('/api/gate/led-message', (req, res) => {
  const { message } = req.body;
  ledController.displayMessage(message);
  db.query('INSERT INTO led_messages (message, displayed_at, updated_at) VALUES (?, NOW(), NOW())', [message]);
  res.json({
    message: message,
    displayTime: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    scrolling: true
  });
});
```

### Current Vehicle Status

**Endpoint**: `GET /api/gate/current-vehicle`

**Implementation Example**:
```javascript
app.get('/api/gate/current-vehicle', (req, res) => {
  const vehicle = db.query(`
    SELECT v.vehicle_number, v.driver_name, v.material, v.status, v.entry_time, w.current_weight
    FROM vehicle_entries v
    LEFT JOIN weighbridge_transactions w ON v.id = w.vehicle_id
    WHERE v.status = 'INSIDE_PLANT'
    ORDER BY v.entry_time DESC LIMIT 1
  `);
  
  if (!vehicle.length) {
    return res.json(null);
  }
  
  res.json({
    vehicleNumber: vehicle[0].vehicle_number,
    driverName: vehicle[0].driver_name,
    material: vehicle[0].material,
    status: vehicle[0].status,
    entryTime: vehicle[0].entry_time,
    currentWeight: vehicle[0].current_weight
  });
});
```

### Recent Activities

**Endpoint**: `GET /api/logs/recent?limit=10`

**Implementation Example**:
```javascript
app.get('/api/logs/recent', (req, res) => {
  const limit = req.query.limit || 10;
  const activities = db.query('SELECT * FROM gate_logs ORDER BY timestamp DESC LIMIT ?', [limit]);
  
  res.json({
    activities: activities.map(a => ({
      id: a.id,
      timestamp: a.timestamp,
      activityType: a.activity_type,
      description: a.description,
      vehicleNumber: a.vehicle_number,
      status: a.status
    }))
  });
});
```

## 3. Error Handling

All services include error handling. To customize error handling, update the services:

```typescript
// Example: Custom error handling in gate-monitor.service.ts
getGateSignals(): Observable<GateSignal> {
  return this.http.get<GateSignal>(`${this.apiUrl}/signals`).pipe(
    catchError(error => {
      if (error.status === 404) {
        console.error('Gate signals endpoint not found');
      } else if (error.status === 500) {
        console.error('Server error');
      }
      return of(null);
    })
  );
}
```

## 4. Authentication

The services use the existing HTTP client which includes interceptors. Update the auth interceptor to add tokens:

```typescript
// src/app/core/interceptors/auth.interceptor.ts
export function authInterceptor(req: HttpRequest<any>, next: HttpHandlerFn) {
  const token = localStorage.getItem('authToken');
  
  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }
  
  return next(req);
}
```

## 5. CORS Configuration

Ensure your backend allows CORS requests:

**Node.js/Express Example**:
```javascript
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

**Python/Flask Example**:
```python
from flask_cors import CORS
CORS(app, origins=['http://localhost:4200'], supports_credentials=True)
```

## 6. Testing with Mock Data

Use mock data for testing before connecting to real APIs:

```typescript
// In dashboard.component.ts
import { MOCK_GATE_SIGNALS, MOCK_WEIGHBRIDGE_DATA } from '../../core/models/smart-gate.mock';

// For testing:
// this.gateMonitorService.gateSignal$.next(MOCK_GATE_SIGNALS);
```

## 7. Performance Optimization

### Reduce Polling Frequency

Update polling intervals based on server capacity:

```typescript
// In gate-monitor.service.ts
private pollGateSignals() {
  return interval(5000).pipe( // Changed from 2000 to 5000ms
    switchMap(() => this.getGateSignals()),
    // ...
  );
}
```

### Implement Caching

Add request caching to reduce API calls:

```typescript
private gateSignalsCache: GateSignal | null = null;
private cacheExpiry = 0;

getGateSignals(): Observable<GateSignal> {
  if (this.gateSignalsCache && Date.now() < this.cacheExpiry) {
    return of(this.gateSignalsCache);
  }
  
  return this.http.get<GateSignal>(`${this.apiUrl}/signals`).pipe(
    tap(data => {
      this.gateSignalsCache = data;
      this.cacheExpiry = Date.now() + 5000; // 5 second cache
    })
  );
}
```

## 8. WebSocket Integration (Optional)

For real-time updates, consider WebSocket instead of polling:

```typescript
// Example WebSocket implementation
import { webSocket } from 'rxjs/webSocket';

private socket$ = webSocket('wss://your-api.com/ws/gate-monitor');

getRealtimeGateSignals(): Observable<GateSignal> {
  return this.socket$.pipe(
    filter(msg => msg.type === 'GATE_SIGNAL'),
    map(msg => msg.data)
  );
}
```

## 9. Deployment Checklist

- [ ] Update API URLs for production
- [ ] Configure CORS for production domain
- [ ] Set up SSL/TLS certificates
- [ ] Configure authentication tokens
- [ ] Test all endpoints
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up database backups
- [ ] Test error handling
- [ ] Configure rate limiting

## 10. Troubleshooting

### Issue: 404 Not Found
**Solution**: Verify API endpoints are correctly configured and match backend routes

### Issue: CORS errors
**Solution**: Configure CORS headers on backend server

### Issue: Slow data updates
**Solution**: Increase polling intervals or switch to WebSocket

### Issue: Memory leaks
**Solution**: Ensure all subscriptions are unsubscribed using `takeUntil`

### Issue: Authentication errors
**Solution**: Verify token is being sent in Authorization header

## Support

For additional support, refer to:
- Angular documentation: https://angular.io/
- RxJS documentation: https://rxjs.dev/
- Material Design: https://material.angular.io/
