# Smart Gate Monitoring Dashboard Layout

## Desktop View (1200px+)

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        CUSTOMER PORTAL DASHBOARD                                    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ ┌────────────┐ │
│  │   Total     │  │   Inside    │  │   Exited    │  │  Pending    │ │   Total    │ │
│  │  Vehicles   │  │   Plant     │  │   Today     │  │  Vehicles   │ │   Weight   │ │
│  │     45      │  │     12      │  │     28      │  │     5       │ │  1250 kg   │ │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘ └────────────┘ │
│                                    KPI CARDS SECTION                                │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                     🔧 SMART GATE OPERATIONS                                       │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────────────────┐ ┌──────────────────────────┐ ┌─────────────────────┐ │
│  │   Gate Signal Status     │ │  Barrier Monitoring      │ │   ANPR Detection    │ │
│  │                          │ │                          │ │                     │ │
│  │  Entry: 🟢 GREEN        │ │ Entry: ⬆️ OPEN          │ │  Plate: MH12AB1234 │ │
│  │  Exit:  🔴 RED          │ │ Exit: ⬇️ CLOSED         │ │  Time: 10:22 AM     │ │
│  │                          │ │  [Open] [Close]         │ │  Status: ✓ Detected │ │
│  │  Updated: 10:25:30      │ │                          │ │  Confidence: 98%    │ │
│  └──────────────────────────┘ └──────────────────────────┘ └─────────────────────┘ │
│                               ROW 1: 3 COLUMNS                                     │
│                                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐ ┌─────────────┐ │
│  │              Live Camera Monitoring                          │ │  LED Board  │ │
│  │                                                              │ │             │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │ │  ┌───────┐  │ │
│  │  │ Entry    │  │  Exit    │  │ Reserved │  │ Reserved │   │ │  │ WELL  │  │ │
│  │  │ Camera   │  │ Camera   │  │  Camera  │  │  Camera  │   │ │  │ COME  │  │ │
│  │  │ 🟢 ONLINE│  │ 🟢 ONLINE│  │ 🔴 OFF   │  │ 🔴 OFF   │   │ │  │ MH... │  │ │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │ │  └───────┘  │ │
│  └──────────────────────────────────────────────────────────────┘ └─────────────┘ │
│                        ROW 2: 2 COLUMNS                                            │
│                                                                                     │
│  ┌──────────────────────────┐  ┌───────────────────────────────────────┐          │
│  │  Current Vehicle Status  │  │   Weighbridge Monitoring              │          │
│  │                          │  │                                       │          │
│  │  Plate: MH12AB1234      │  │   Current Weight: 25000 kg             │          │
│  │  Driver: Raj Kumar       │  │   ████████░░░░░░░░░░░░░  50%        │          │
│  │  Material: Clinker       │  │   Gross: 35000 | Tare: 10000         │          │
│  │  Status: ⏱️ INSIDE PLANT │  │   Status: ⊕ WEIGHING                │          │
│  │  Entry: 10:20 AM         │  │   Updated: 10:24:30                 │          │
│  │  Weight: 25000 kg        │  │                                       │          │
│  └──────────────────────────┘  └───────────────────────────────────────┘          │
│                        ROW 3: 2 COLUMNS                                            │
│                                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────────────┐  │
│  │                      Recent Gate Activities                               │  │
│  │                                                                            │  │
│  │  ●→ 10:25 ✓ Weighing Completed        Vehicle: MH12AB1234             │  │
│  │    ●→ 10:24 ✓ Weighing Started         Vehicle: MH12AB1234             │  │
│  │      ●→ 10:22 ✓ ANPR Detected         Vehicle: MH12AB1234             │  │
│  │        ●→ 10:22 ✓ Barrier Opened       Vehicle: MH12AB1234             │  │
│  │          ●→ 10:20 ✓ Vehicle Entered    Vehicle: MH12AB1234             │  │
│  └─────────────────────────────────────────────────────────────────────────┘  │
│                        ROW 4: FULL WIDTH                                        │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────┐                       │
│  │ Vehicle Entry vs Exit    │  │  Daily Weight Trend      │                       │
│  │      CHART               │  │       CHART              │                       │
│  └──────────────────────────┘  └──────────────────────────┘                       │
│                                                                                     │
│  ┌──────────────────────────┐  ┌──────────────────────────┐                       │
│  │ Vehicle Status Dist.     │  │  Monthly Statistics      │                       │
│  │       CHART              │  │       CHART              │                       │
│  └──────────────────────────┘  └──────────────────────────┘                       │
│                                                                                     │
│                           CHARTS SECTION                                          │
│                                                                                     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│  [Recent Vehicle Activity Tab] [Recent Weighbridge Tab]  |         [Refresh 🔄]   │
│  Recent Vehicle Activity Table...                                                 │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Tablet View (768px - 1199px)

```
┌────────────────────────────────────┐
│     CUSTOMER PORTAL DASHBOARD      │
├────────────────────────────────────┤
│   KPI CARDS (Responsive Grid)      │
├────────────────────────────────────┤
│   🔧 SMART GATE OPERATIONS         │
├────────────────────────────────────┤
│                                    │
│  ┌──────────────────────────────┐  │
│  │   Gate Signal Status         │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Barrier Monitoring          │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   ANPR Detection             │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │   Live Camera Monitoring     │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  LED Display Monitoring      │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Current Vehicle Status      │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │ Weighbridge Monitoring       │  │
│  └──────────────────────────────┘  │
│                                    │
│  ┌──────────────────────────────┐  │
│  │  Recent Gate Activities      │  │
│  └──────────────────────────────┘  │
│                                    │
├────────────────────────────────────┤
│   Charts & Tables Section          │
└────────────────────────────────────┘
```

## Mobile View (<768px)

```
┌──────────────────────────┐
│   CUSTOMER PORTAL        │
│       DASHBOARD          │
├──────────────────────────┤
│  KPI Cards (Single Col)  │
├──────────────────────────┤
│ 🔧 SMART GATE OPERATIONS│
├──────────────────────────┤
│                          │
│ ┌────────────────────┐   │
│ │ Gate Signal Status │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Barrier Monitoring │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ ANPR Detection     │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Live Cameras       │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ LED Display        │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Current Vehicle    │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Weighbridge        │   │
│ └────────────────────┘   │
│                          │
│ ┌────────────────────┐   │
│ │ Recent Activities  │   │
│ └────────────────────┘   │
│                          │
├──────────────────────────┤
│ Charts & Tables          │
└──────────────────────────┘
```

## Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                    Backend API Server                           │
├────────────────────────────────────────────────────────────────┤
│  /api/gate/signals  /api/gate/barriers  /api/anpr/latest  │
│  /api/cameras  /api/weighbridge/current  /api/logs/recent  │
└────────┬───────────────────────────────────────────────────────┘
         │
         │ HTTP Polling (2-5 second intervals)
         │
┌────────▼───────────────────────────────────────────────────────┐
│                    Angular Services                            │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌─────────────┐ ┌───────────────┐ │
│  │ GateMonitorService   │  │ANPRService  │ │ActivityLogSvc │ │
│  │ (Real-time polling)  │  │(ANPR Data)  │ │(Activities)   │ │
│  └──────────────────────┘  └─────────────┘ └───────────────┘ │
└────────┬───────────────────────────────────────────────────────┘
         │
         │ BehaviorSubject Observables
         │
┌────────▼───────────────────────────────────────────────────────┐
│                  Dashboard Component                           │
├────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐  │
│  │         Smart Gate Widgets Container                    │  │
│  ├─────────────────────────────────────────────────────────┤  │
│  │ Signal │ Barrier │ ANPR │ Camera │ Weighbridge │ Vehicle│ │
│  │ LED    │ Activity Log                                   │  │
│  └─────────────────────────────────────────────────────────┘  │
└────────┬───────────────────────────────────────────────────────┘
         │
         │ Subscribe to Observables
         │
┌────────▼───────────────────────────────────────────────────────┐
│                    User Interface                              │
├────────────────────────────────────────────────────────────────┤
│  Real-time Visual Indicators & Controls                        │
│  - Live Signal Indicators                                      │
│  - Barrier Control Buttons                                     │
│  - Vehicle & Weight Data                                       │
│  - Activity Timeline                                           │
└────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
DashboardComponent
│
├── KPI Cards Section
│   ├── Total Vehicles
│   ├── Inside Plant
│   ├── Exited Today
│   ├── Pending Vehicles
│   ├── Total Weight
│   └── Average Weight
│
├── Smart Gate Monitoring Section
│   │
│   ├── Row 1 (3 columns)
│   │   ├── SignalMonitorComponent
│   │   ├── BarrierMonitorComponent
│   │   └── ANPRMonitorComponent
│   │
│   ├── Row 2 (2 columns)
│   │   ├── CameraMonitorComponent
│   │   └── LEDDisplayComponent
│   │
│   ├── Row 3 (2 columns)
│   │   ├── CurrentVehicleComponent
│   │   └── WeighbridgeMonitorComponent
│   │
│   └── Row 4 (Full width)
│       └── ActivityLogComponent
│
├── Charts Section
│   ├── Entry vs Exit Trend
│   ├── Daily Weight Trend
│   ├── Status Distribution
│   └── Monthly Statistics
│
└── Tables Section
    ├── Recent Vehicle Activity
    └── Recent Weighbridge Transactions
```

## Polling Intervals Timeline

```
TIME: 0s────1s────2s────3s────4s────5s────6s────7s────8s────9s────10s
      │     │     │     │     │     │     │     │     │     │     │
W(1s) │●●●●●●●●●●│●●●●●●●●●●│●●●●●●●●●●│
      │     │     │     │     │     │     │     │     │     │     │
G(2s) │●●●●●│●●●●●│●●●●●│●●●●●│●●●●●│
      │     │     │     │     │     │     │     │     │     │     │
B(2s) │●●●●●│●●●●●│●●●●●│●●●●●│●●●●●│
      │     │     │     │     │     │     │     │     │     │     │
A(3s) │●●●●●●●│●●●●●●●│●●●●●●●│●●●●●●●│
      │     │     │     │     │     │     │     │     │     │     │
L(3s) │●●●●●●●│●●●●●●●│●●●●●●●│●●●●●●●│
      │     │     │     │     │     │     │     │     │     │     │
C(5s) │●●●●●●●●●●│●●●●●●●●●●│●●●●●●●●●●│

Legend:
W = Weighbridge (1s)
G = Gate Signals (2s)
B = Barriers (2s)
A = ANPR (3s)
L = LED Display (3s)
C = Cameras (5s)
● = Poll Attempt
```

---

This layout visualization helps understand the responsive grid system and data flow through the Smart Gate Monitoring System.
