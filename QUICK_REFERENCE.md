# Smart Gate Monitoring System - Quick Reference Guide

## 📚 Documentation Files Overview

| File | Purpose | Key Info |
|------|---------|----------|
| **SMART_GATE_MONITORING_README.md** | Main overview & quick start | Complete implementation summary |
| **SMART_GATE_IMPLEMENTATION.md** | Detailed feature documentation | 8 widgets specs, polling details, DB schema |
| **API_INTEGRATION_GUIDE.md** | Backend integration guide | Endpoint specs, code examples (Node.js/Python) |
| **DASHBOARD_LAYOUT_VISUAL.md** | Visual layout reference | Responsive breakpoints, data flow, hierarchy |
| **smart-gate.mock.ts** | Mock data utilities | Test data generation, mock implementations |

## 🚀 5-Minute Quick Start

### Step 1: Update API URLs
```bash
# File: src/app/core/services/gate-monitor.service.ts
# Find: private apiUrl = 'http://localhost:3000/api/gate';
# Update to your backend URL
```

### Step 2: Start Services
```typescript
// Already integrated in dashboard.component.ts
// Services start automatically on dashboard load
```

### Step 3: Run Application
```bash
npm start
# Dashboard opens at http://localhost:4200
```

### Step 4: Test with Mock Data
```typescript
// View mock data structure:
import { MOCK_GATE_SIGNALS } from './core/models/smart-gate.mock';
```

## 🔑 Key Service Methods

### GateMonitorService
```typescript
// Start all polling
startRealTimeMonitoring(): void

// Get current status
getGateSignals(): Observable<GateSignal>
getBarrierStatus(): Observable<BarrierStatus>
getWeighbridgeData(): Observable<WeighbridgeData>
getCurrentVehicle(): Observable<CurrentVehicle>
getLEDMessage(): Observable<LEDMessage>
getCameraList(): Observable<CameraList>

// Control operations
openEntryBarrier(): Observable<any>
closeEntryBarrier(): Observable<any>
openExitBarrier(): Observable<any>
closeExitBarrier(): Observable<any>
updateLEDMessage(message: string): Observable<any>
captureSnapshot(cameraId: string): Observable<any>

// Observable subjects (subscribe directly)
gateSignal$: BehaviorSubject<GateSignal>
barrierStatus$: BehaviorSubject<BarrierStatus>
weighbridge$: BehaviorSubject<WeighbridgeData>
currentVehicle$: BehaviorSubject<CurrentVehicle>
ledMessage$: BehaviorSubject<LEDMessage>
cameras$: BehaviorSubject<CameraList>
```

### ANPRService
```typescript
// Start monitoring
startMonitoring(): void

// Get ANPR data
getLatestDetection(): Observable<ANPRLatest>
getDetectionHistory(limit: number): Observable<ANPRDetection[]>
searchByPlate(licensePlate: string): Observable<ANPRDetection[]>
getDetectionsForDateRange(startDate: Date, endDate: Date): Observable<ANPRDetection[]>

// Observable subject
latestDetection$: BehaviorSubject<ANPRLatest>
```

### ActivityLogService
```typescript
// Start monitoring
startMonitoring(): void

// Get activities
getRecentActivities(limit: number): Observable<GateActivity[]>
getActivitiesByVehicle(vehicleNumber: string): Observable<GateActivity[]>
getActivitiesForDateRange(startDate: Date, endDate: Date): Observable<GateActivity[]>

// Observable subject
recentActivitiesSubject: BehaviorSubject<RecentActivities>
```

## 📡 API Endpoint Checklist

### Essential Endpoints (Start Here)
- [ ] `GET /api/gate/signals` - Gate signal status
- [ ] `GET /api/gate/barriers` - Barrier status
- [ ] `GET /api/gate/weighbridge/current` - Weight data
- [ ] `GET /api/anpr/latest` - Latest ANPR detection
- [ ] `GET /api/logs/recent?limit=10` - Recent activities

### Control Endpoints
- [ ] `POST /api/gate/barriers/entry/open`
- [ ] `POST /api/gate/barriers/entry/close`
- [ ] `POST /api/gate/led-message` - Update LED message
- [ ] `POST /api/cameras/{id}/snapshot` - Capture snapshot

### Full Endpoint List
```
GET  /api/gate/signals
GET  /api/gate/barriers
GET  /api/gate/weighbridge/current
GET  /api/gate/current-vehicle
GET  /api/gate/led-message
GET  /api/gate/cameras
GET  /api/anpr/latest
GET  /api/logs/recent
GET  /api/logs/vehicle/{vehicleId}
GET  /api/logs/date-range
POST /api/gate/barriers/entry/open
POST /api/gate/barriers/entry/close
POST /api/gate/barriers/exit/open
POST /api/gate/barriers/exit/close
POST /api/gate/led-message
POST /api/cameras/{cameraId}/snapshot
```

## 🎨 Data Model Quick Reference

### GateSignal
```typescript
{
  entrySignal: 'RED' | 'GREEN' | 'YELLOW',
  exitSignal: 'RED' | 'GREEN' | 'YELLOW',
  lastUpdated: Date
}
```

### BarrierStatus
```typescript
{
  entryBarrier: 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING',
  exitBarrier: 'OPEN' | 'CLOSED' | 'OPENING' | 'CLOSING'
}
```

### WeighbridgeData
```typescript
{
  currentWeight: number,
  grossWeight: number,
  tareWeight: number,
  netWeight: number,
  unit: 'KG' | 'MT',
  status: 'READY' | 'WEIGHING' | 'ERROR',
  lastUpdated: Date
}
```

### ANPRDetection
```typescript
{
  licensePlate: string,
  detectionTime: Date,
  gateLocation: 'ENTRY' | 'EXIT',
  detectionStatus: 'DETECTED' | 'RECOGNIZED' | 'FAILED',
  confidence: number, // 0-100
  imagePath?: string
}
```

### CurrentVehicle
```typescript
{
  vehicleNumber: string,
  driverName: string,
  material: string,
  status: 'INSIDE_PLANT' | 'EXITED' | 'PENDING',
  entryTime: Date,
  currentWeight?: number,
  driverId?: string
}
```

### GateActivity
```typescript
{
  id: string,
  timestamp: Date,
  activityType: 'ENTERED' | 'ANPR' | 'BARRIER' | 'WEIGHING' | 'EXITED',
  description: string,
  vehicleNumber?: string,
  status: 'SUCCESS' | 'FAILED' | 'PENDING'
}
```

## 🎯 Polling Intervals Reference

| Component | Interval | Reason |
|-----------|----------|--------|
| Weighbridge | 1s | Most critical, frequent updates |
| Gate Signals | 2s | Traffic light status |
| Barriers | 2s | Barrier movement |
| Current Vehicle | 2s | Active vehicle tracking |
| ANPR | 3s | Vehicle detection |
| LED Display | 3s | Message updates |
| Cameras | 5s | Snapshot refresh |
| Activities | 5s | Activity logging |

## 💻 Component File Structure

### Each Widget Component Has 3 Files
```
component-name/
├── component-name.component.ts      # Logic & services
├── component-name.component.html    # Template & bindings
└── component-name.component.scss    # Styling & responsive
```

### All 8 Widgets
```
smart-gate-widgets/
├── signal-monitor/
├── barrier-monitor/
├── anpr-monitor/
├── camera-monitor/
├── weighbridge-monitor/
├── current-vehicle/
├── led-display/
├── activity-log/
├── index.ts                    # Public API exports
└── smart-gate-widgets.scss     # Shared styles
```

## 🔄 Real-Time Data Flow

```
1. Component subscribes to Observable
   → example: signal$: Observable<GateSignal>

2. Service polls endpoint periodically
   → getGateSignals().pipe(interval(2000))

3. Data flows through BehaviorSubject
   → this.gateSignalSubject.next(data)

4. Component receives update
   → template displays with async pipe

5. Component cleans up on destroy
   → takeUntil(destroy$) pattern
```

## 🛠️ Common Customizations

### Change Polling Interval
```typescript
// In service file, find interval(milliseconds)
return interval(2000).pipe( // Change 2000 to desired interval
  switchMap(() => this.getGateSignals()),
  // ...
);
```

### Update API Base URL
```typescript
// In each service file
private apiUrl = 'https://your-api.com/api/endpoint';
```

### Disable a Component
```typescript
// In dashboard.component.html
<!-- Comment out the component tag -->
<!-- <app-signal-monitor></app-signal-monitor> -->
```

### Change Color Scheme
```typescript
// In smart-gate-widgets.scss
// Update color variables
$primary-color: #your-color;
$success-color: #your-color;
// ...
```

## 📊 Responsive Breakpoints

```typescript
// Desktop (1200px+)
grid-template-columns: repeat(3, 1fr)

// Tablet (768px - 1199px)
grid-template-columns: repeat(2, 1fr)

// Mobile (<768px)
grid-template-columns: 1fr
```

## ✅ Verification Checklist

- [ ] All 8 components visible on dashboard
- [ ] Components are responsive at different screen sizes
- [ ] Real-time polling working (check Network tab)
- [ ] No console errors
- [ ] Services initialized in dashboard.component.ts
- [ ] API URLs pointing to correct backend
- [ ] Mock data displays when API is unavailable
- [ ] Status indicators updating in real-time

## 🐛 Troubleshooting Quick Tips

| Issue | Solution |
|-------|----------|
| Components not showing | Check if smart gate section CSS display property |
| No real-time updates | Verify API endpoints are accessible |
| CORS errors | Configure CORS on backend server |
| Slow performance | Reduce polling intervals or check network |
| High memory usage | Ensure takeUntil pattern is used correctly |
| Mock data not showing | Import mock from smart-gate.mock.ts |
| TypeScript errors | Run `ng build` to check compilation |

## 🌐 Environment Configuration

### Development
```typescript
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};
```

### Production
```typescript
// environment.prod.ts
export const environment = {
  apiUrl: 'https://api.production.com/api'
};
```

## 📱 Testing Commands

```bash
# Run application
npm start

# Run tests
npm test

# Build for production
npm run build

# Lint code
npm run lint

# Check types
npm run tsc
```

## 🔐 Security Notes

- [ ] CORS configured for production domain
- [ ] Authentication tokens in Authorization header
- [ ] API endpoints use HTTPS in production
- [ ] Input validation implemented
- [ ] Error handling prevents info leaks
- [ ] No sensitive data in console logs

## 📖 Additional Resources

- **Angular**: https://angular.io/
- **Material**: https://material.angular.io/
- **RxJS**: https://rxjs.dev/
- **TypeScript**: https://www.typescriptlang.org/

## 🎓 Learning Path

1. Read SMART_GATE_MONITORING_README.md (5 min)
2. Review DASHBOARD_LAYOUT_VISUAL.md (5 min)
3. Skim SMART_GATE_IMPLEMENTATION.md (10 min)
4. Read API_INTEGRATION_GUIDE.md (15 min)
5. Implement first endpoint (30 min)
6. Test with mock data (10 min)
7. Deploy and monitor (ongoing)

## 🚨 Critical Paths

### Must Complete
1. ✓ Frontend implementation (DONE)
2. → Backend API endpoints (YOUR TURN)
3. → Database schema (YOUR TURN)
4. → Connect frontend to backend
5. → Test end-to-end
6. → Deploy to production

### Optional Enhancements
- WebSocket real-time updates
- Historical analytics
- Alert notifications
- Video playback
- Export functionality

---

**Last Updated**: May 27, 2026
**Version**: 1.0.0
**Status**: Ready for Backend Integration
