# Smart Gate Monitoring System - Troubleshooting & Debugging Guide

## 🔍 Debug Mode Activation

### Enable Verbose Logging

```typescript
// In any service file, add at the top:
const DEBUG = true;

// Use in methods:
if (DEBUG) {
  console.log('Service initialized', { 
    apiUrl: this.apiUrl,
    timestamp: new Date()
  });
}
```

### Browser DevTools Setup

```javascript
// In browser console to monitor real-time updates:
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Filter by 'XHR' to see API calls
// 4. Check Headers for Authorization token
// 5. Check Response for actual data structure
```

## 🚫 Common Issues & Solutions

### Issue 1: Components Not Showing

**Symptoms**:
- Smart gate widgets not visible on dashboard
- Only KPI cards and existing dashboard showing

**Debug Steps**:
```bash
# 1. Check browser console
# Press F12 → Console tab → Look for errors

# 2. Verify imports
# Check: src/app/features/dashboard/dashboard.component.ts
# Ensure all 8 components imported

# 3. Check HTML template
# Verify: smart-gate-section div exists
# Verify: All 8 component tags present

# 4. Check CSS display
# In dashboard.component.scss
# Verify: .smart-gate-section is not display:none
```

**Solutions**:
```typescript
// Option 1: Verify imports in dashboard.component.ts
import { SignalMonitorComponent } from './smart-gate-widgets/signal-monitor/signal-monitor.component';
// ... import all 8 components

// Option 2: Verify template usage
<section class="smart-gate-section">
  <h2>Smart Gate Operations</h2>
  <div class="smart-gate-grid">
    <app-signal-monitor></app-signal-monitor>
    <!-- ... all 8 components -->
  </div>
</section>

// Option 3: Check CSS
.smart-gate-section {
  display: block; // NOT none!
  margin: 20px 0;
}
```

### Issue 2: Real-Time Updates Not Working

**Symptoms**:
- Data displayed but not updating in real-time
- Polling appears to be working (no errors) but no visible changes

**Debug Steps**:
```typescript
// 1. Check if polling is started
// In dashboard.component.ts ngOnInit:
console.log('Polling started');
this.gateMonitorService.startRealTimeMonitoring();

// 2. Monitor Observable updates
// Subscribe and log:
this.gateMonitorService.gateSignal$.subscribe(signal => {
  console.log('Signal updated:', signal, new Date());
});

// 3. Check Network tab
// F12 → Network → XHR
// Verify requests every 2 seconds to /api/gate/signals

// 4. Check Response data format
// Compare with expected interface in smart-gate.model.ts
```

**Solutions**:
```typescript
// Option 1: Verify polling is running
export class GateMonitorService {
  startRealTimeMonitoring() {
    console.log('[GateMonitor] Starting real-time monitoring');
    this.pollGateSignals();
    this.pollBarrierStatus();
    this.pollWeighbridge();
    // ... other polls
    console.log('[GateMonitor] All polling streams started');
  }
}

// Option 2: Fix async pipe in template
// OLD (not working):
{{ gateSignal }}

// NEW (working with async pipe):
{{ (gateSignal$ | async)?.entrySignal }}

// Option 3: Add explicit change detection
import { ChangeDetectorRef } from '@angular/core';

constructor(
  private gateMonitorService: GateMonitorService,
  private cdr: ChangeDetectorRef
) {}

ngOnInit() {
  this.gateMonitorService.gateSignal$.subscribe(signal => {
    this.signal = signal;
    this.cdr.markForCheck(); // Force update
  });
}
```

### Issue 3: 404 Not Found Errors

**Symptoms**:
- Network tab shows 404 responses
- Console errors: "GET /api/gate/signals 404"

**Debug Steps**:
```bash
# 1. Check API URL configuration
# grep -n "apiUrl" src/app/core/services/*.ts

# 2. Verify backend is running
# Try in browser: http://localhost:3000/api/gate/signals
# Should show actual data (not 404)

# 3. Check endpoint naming
# Verify your backend route names match exactly:
# /api/gate/signals (not /api/gateSignals)

# 4. Check CORS headers
# F12 → Network → Click on request
# Look in Response Headers for CORS settings
```

**Solutions**:
```typescript
// Solution 1: Update API URL
// In gate-monitor.service.ts
private apiUrl = 'http://localhost:3000/api/gate'; // Update port/domain

// Solution 2: Create environment-based URL
// environment.ts
export const environment = {
  apiUrl: 'http://localhost:3000/api'
};

// environment.prod.ts
export const environment = {
  apiUrl: 'https://api.production.com/api'
};

// In service:
import { environment } from '../../../../environments/environment';
private apiUrl = environment.apiUrl + '/gate';

// Solution 3: Handle 404 gracefully
getGateSignals(): Observable<GateSignal> {
  return this.http.get<GateSignal>(`${this.apiUrl}/signals`).pipe(
    catchError(error => {
      if (error.status === 404) {
        console.error('Gate signals endpoint not found:', `${this.apiUrl}/signals`);
      }
      return of(null); // Return null on error
    })
  );
}
```

### Issue 4: CORS Errors

**Symptoms**:
- Console error: "Access to XMLHttpRequest blocked by CORS policy"
- Network tab shows request but no response

**Debug Steps**:
```bash
# 1. Check CORS headers
# F12 → Network → Click failing request
# Headers → Response Headers
# Look for: Access-Control-Allow-Origin

# 2. Verify backend has CORS enabled
# Check if backend app has CORS middleware

# 3. Check if credentials are needed
# Authorization headers require credentials: true
```

**Solutions**:
```typescript
// Solution 1: Backend CORS configuration (Node.js)
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:4200', // Your Angular app
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Solution 2: Backend CORS configuration (Python)
from flask_cors import CORS
CORS(app, resources={
  r"/api/*": {
    "origins": ["http://localhost:4200"],
    "supports_credentials": True
  }
});

// Solution 3: Update Angular HTTP client for credentials
// In gate-monitor.service.ts
this.http.get(url, {
  withCredentials: true // Include credentials
});
```

### Issue 5: Memory Leaks / High Memory Usage

**Symptoms**:
- Browser gets slower over time
- Chrome DevTools shows increasing memory usage
- Warning: "memory leak detected"

**Debug Steps**:
```typescript
// 1. Check for unsubscribed observables
// In console, search for:
// "takeUntil" or "unsubscribe"

// 2. Monitor subscriptions
// Chrome DevTools → Memory → Heap Snapshots
// Look for Observable objects not being garbage collected

// 3. Verify component cleanup
// Every component should have:
private destroy$ = new Subject<void>();

ngOnDestroy() {
  this.destroy$.next();
  this.destroy$.complete();
}
```

**Solutions**:
```typescript
// Solution 1: Proper subscription cleanup
export class SignalMonitorComponent {
  private destroy$ = new Subject<void>();

  constructor(private gateMonitorService: GateMonitorService) {}

  ngOnInit() {
    this.gateMonitorService.gateSignal$
      .pipe(takeUntil(this.destroy$))
      .subscribe(signal => {
        this.signal = signal;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// Solution 2: Use OnPush change detection
@Component({
  selector: 'app-signal-monitor',
  templateUrl: './signal-monitor.component.html',
  styleUrls: ['./signal-monitor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class SignalMonitorComponent {
  // ...
}

// Solution 3: Reduce polling frequency
// In gate-monitor.service.ts
return interval(5000) // Increase from 2000 to 5000ms
  .pipe(switchMap(() => this.getGateSignals()))
```

### Issue 6: Type Errors in Template

**Symptoms**:
- Angular compiler error: "Property 'X' does not exist"
- Property undefined warnings

**Debug Steps**:
```bash
# 1. Check TypeScript strict mode
# tsconfig.json: strict: true

# 2. Run type check
ng build  # This will show all type errors

# 3. Check component class properties
# Verify property is declared in component.ts
```

**Solutions**:
```typescript
// Solution 1: Declare properties with types
export class SignalMonitorComponent {
  signal$: Observable<GateSignal>;
  signal: GateSignal | null = null;

  constructor(private gateMonitorService: GateMonitorService) {
    this.signal$ = this.gateMonitorService.gateSignal$;
  }
}

// Solution 2: Use safe navigation operator
// In template:
{{ (signal$ | async)?.entrySignal }}  // Safe
// NOT: {{ signal.entrySignal }}       // Unsafe

// Solution 3: Add null checks
*ngIf="(signal$ | async) as signal"
  <p>{{ signal.entrySignal }}</p>
</div>
```

### Issue 7: Responsive Layout Not Working

**Symptoms**:
- Layout looks good on desktop, broken on mobile
- Components overlapping or too wide on small screens
- Text too small/large

**Debug Steps**:
```bash
# 1. Check viewport meta tag
# index.html should have:
<meta name="viewport" content="width=device-width, initial-scale=1">

# 2. Test responsive design
# F12 → Toggle device toolbar (Ctrl+Shift+M)
# Test at 320px, 768px, 1024px

# 3. Check media queries
# Inspect element and look for applied CSS
```

**Solutions**:
```scss
// Solution 1: Fix grid responsiveness
.smart-gate-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
  
  // Override at breakpoints
  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

// Solution 2: Fix text sizes
.card-title {
  font-size: 18px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 14px;
  }
}

// Solution 3: Test with real devices
// Use Chrome remote debugging
// Or use online tools: responsively.app
```

### Issue 8: API Returns Wrong Data Format

**Symptoms**:
- Components show null/undefined
- Template displays [object Object]
- Data doesn't match expected interface

**Debug Steps**:
```typescript
// 1. Log raw API response
this.http.get(url).subscribe(response => {
  console.log('Raw response:', response);
  console.log('Expected keys:', ['entrySignal', 'exitSignal']);
  console.log('Actual keys:', Object.keys(response));
});

// 2. Compare with interface
// Expected:
interface GateSignal {
  entrySignal: string;
  exitSignal: string;
  lastUpdated: Date;
}

// Actual from API might be:
{
  entry_signal: 'RED',  // Snake_case instead of camelCase
  exit_signal: 'GREEN'
}

// 3. Check timestamp format
// Expected: ISO string or Date
// Actual: Milliseconds since epoch?
```

**Solutions**:
```typescript
// Solution 1: Transform API response
getGateSignals(): Observable<GateSignal> {
  return this.http.get<any>(`${this.apiUrl}/signals`).pipe(
    map(response => ({
      entrySignal: response.entry_signal,  // Transform snake_case
      exitSignal: response.exit_signal,
      lastUpdated: new Date(response.updated_at)
    })),
    catchError(error => {
      console.error('Error:', error);
      return of(null);
    })
  );
}

// Solution 2: Create adapter service
import { GateSignalAdapter } from './adapters/gate-signal.adapter';

getGateSignals(): Observable<GateSignal> {
  return this.http.get<any>(`${this.apiUrl}/signals`).pipe(
    map(response => GateSignalAdapter.adapt(response))
  );
}

// Solution 3: Update API response format
// Tell backend to return camelCase instead of snake_case
// Implement in backend: models/response.model or similar
```

### Issue 9: Slow Performance / Jank

**Symptoms**:
- Dashboard feels slow to update
- Scrolling is janky
- High CPU usage

**Debug Steps**:
```bash
# 1. Check performance timeline
# F12 → Performance → Record → Interact → Stop

# 2. Check for forced reflows
# DevTools → Rendering → Paint flashing

# 3. Profile component rendering
# ng.probe(el).componentInstance
```

**Solutions**:
```typescript
// Solution 1: Use OnPush change detection
@Component({
  // ...
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignalMonitorComponent {
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.gateMonitorService.gateSignal$
      .subscribe(signal => {
        this.signal = signal;
        this.cdr.markForCheck(); // Only update when needed
      });
  }
}

// Solution 2: Reduce polling frequency
// In service:
interval(5000) // Increase from 2000

// Solution 3: Use trackBy in *ngFor
<div *ngFor="let activity of activities; trackBy: trackByActivityId">
  {{ activity.description }}
</div>

trackByActivityId(index: number, activity: GateActivity) {
  return activity.id;
}

// Solution 4: Optimize Angular Material
// Only import needed modules:
import { MatCardModule } from '@angular/material/card';
// NOT: MatModule (everything)
```

### Issue 10: Barrel Export Errors

**Symptoms**:
- Import errors: "Cannot find module"
- "X not found in index.ts"

**Debug Steps**:
```bash
# 1. Check index.ts files exist
ls src/app/core/services/index.ts
ls src/app/core/models/index.ts
ls src/app/features/dashboard/smart-gate-widgets/index.ts

# 2. Check exports
cat src/app/core/services/index.ts
# Should show: export * from './gate-monitor.service'
```

**Solutions**:
```typescript
// Solution 1: Create/verify index.ts files
// src/app/core/services/index.ts
export * from './gate-monitor.service';
export * from './anpr.service';
export * from './activity-log.service';

// src/app/core/models/index.ts
export * from './smart-gate.model';
export * from './smart-gate.mock';

// src/app/features/dashboard/smart-gate-widgets/index.ts
export * from './signal-monitor/signal-monitor.component';
export * from './barrier-monitor/barrier-monitor.component';
// ... all 8 components
```

## 🧪 Testing Strategies

### Unit Test Template
```typescript
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GateMonitorService } from './gate-monitor.service';

describe('GateMonitorService', () => {
  let service: GateMonitorService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GateMonitorService]
    });
    service = TestBed.inject(GateMonitorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch gate signals', (done) => {
    service.getGateSignals().subscribe(signal => {
      expect(signal.entrySignal).toBe('GREEN');
      done();
    });

    const req = httpMock.expectOne('http://localhost:3000/api/gate/signals');
    expect(req.request.method).toBe('GET');
    req.flush({ entrySignal: 'GREEN', exitSignal: 'RED' });
  });
});
```

### Integration Test Template
```typescript
it('should update signal in real-time', (done) => {
  service.startRealTimeMonitoring();
  
  let updateCount = 0;
  service.gateSignal$.subscribe(() => {
    updateCount++;
    if (updateCount >= 2) {
      expect(updateCount).toBeGreaterThanOrEqual(2);
      done();
    }
  });
});
```

## 📊 Performance Profiling

### Chrome DevTools Analysis
```javascript
// In console:
// 1. Check memory usage
performance.memory.usedJSHeapSize / 1000000  // MB

// 2. Measure API response time
console.time('api-call');
// ... make API call
console.timeEnd('api-call');

// 3. Monitor network
// DevTools → Network → Sort by time
```

## 🔐 Security Debugging

### Check Security Headers
```bash
# In browser console:
// Check for Authorization header
localStorage.getItem('authToken')

// Check CORS settings
// F12 → Network → Request headers → Authorization
```

## 📝 Logging Best Practices

```typescript
// Good logging
console.log('[GateMonitorService] Polling started', { interval: 2000 });

// Log data updates
console.log('[SignalMonitor] Signal updated', { 
  entrySignal: signal.entrySignal,
  timestamp: new Date().toISOString()
});

// Log errors
console.error('[GateMonitorService] API Error', {
  status: error.status,
  message: error.message,
  url: error.url
});
```

## 🆘 Getting Help

1. Check this guide first
2. Review console errors (F12 → Console)
3. Check Network tab (F12 → Network)
4. Search documentation files
5. Review code comments
6. Ask ChatGPT/Stack Overflow
7. Contact backend team

---

**Last Updated**: May 27, 2026
**Version**: 1.0.0
**Difficulty**: Beginner to Intermediate
