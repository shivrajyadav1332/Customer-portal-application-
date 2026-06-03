# Enterprise Architecture Diagram - Smart Gate Customer Portal

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          INTERNET / PUBLIC NETWORK                              │
└──────────────────────────────┬──────────────────────────────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  CloudFlare CDN     │
                    │ (DNS, DDoS, Cache)  │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        │           ┌──────────▼──────────┐           │
        │           │  Azure Load Balancer│           │
        │           │  (SSL/TLS)          │           │
        │           └──────────┬──────────┘           │
        │                      │                      │
    ┌───▼────────┐   ┌────────▼────────┐   ┌────────▼────┐
    │   Frontend  │   │   Backend       │   │  SignalR    │
    │   App 1     │   │   API Server 1  │   │  Server 1   │
    │ (Nginx)     │   │   (Kestrel)     │   │             │
    └───┬────────┘   └────────┬────────┘   └────────┬────┘
        │                    │                      │
    ┌───▼────────┐   ┌────────▼────────┐   ┌────────▼────┐
    │   Frontend  │   │   Backend       │   │  SignalR    │
    │   App 2     │   │   API Server 2  │   │  Server 2   │
    │ (Nginx)     │   │   (Kestrel)     │   │             │
    └───┬────────┘   └────────┬────────┘   └────────┬────┘
        │                    │                      │
    ┌───▼────────┐   ┌────────▼────────┐   ┌────────▼────┐
    │   Frontend  │   │   Backend       │   │  SignalR    │
    │   App 3     │   │   API Server 3  │   │  Server 3   │
    │ (Nginx)     │   │   (Kestrel)     │   │             │
    └───┬────────┘   └────────┬────────┘   └────────┬────┘
        │                    │                      │
        │              ┌─────▼─────┐                │
        │              │  API GW    │                │
        │              │(Rate Limit)│                │
        │              └─────┬─────┘                │
        │                    │                      │
        └────────┬───────────┼──────────────────────┘
                 │           │
        ┌────────▼───────────▼────────┐
        │    Service Bus / Message    │
        │    Queue (Azure Service Bus)│
        └────────┬────────────────────┘
                 │
    ┌────────────┼────────────────┬────────────┐
    │            │                │            │
┌───▼────┐  ┌────▼──────┐  ┌─────▼──────┐ ┌──▼──────┐
│ SQL DB │  │ Redis Cache│  │ Azure Log  │ │KeyVault │
│ Server │  │  (Session, │  │ Analytics  │ │(Secrets)│
│        │  │  API Cache)│  │            │ │         │
└────────┘  └────────────┘  └────────────┘ └─────────┘
```

---

## Frontend Architecture (SPA)

```
┌─────────────────────────────────────────────────────────┐
│                    Angular 21 SPA                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           App Component (Root)                  │   │
│  │  - Routing                                      │   │
│  │  - SignalR Connection Management                │   │
│  │  - Global State                                 │   │
│  └────────────┬────────────────────────────────────┘   │
│               │                                         │
│     ┌─────────┴─────────┐                               │
│     │                   │                               │
│ ┌───▼─────────┐   ┌────▼──────────┐                   │
│ │   Navbar    │   │   Sidebar      │                   │
│ │ Component   │   │  Component     │                   │
│ └─────────────┘   └────────────────┘                   │
│     │                                                   │
│     │              ┌──────────────────────────────┐    │
│     └─────────────▶│  Feature Modules             │    │
│                    │  - Dashboard                 │    │
│                    │  - Vehicles                  │    │
│                    │  - Reports                   │    │
│                    │  - Live Monitoring           │    │
│                    │  - Analytics                 │    │
│                    │  - Notifications             │    │
│                    │  - Profile                   │    │
│                    └──────────────────────────────┘    │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │           Services & State                      │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  Core Services                           │  │   │
│  │  │  - AuthService                           │  │   │
│  │  │  - DashboardService                      │  │   │
│  │  │  - VehicleService                        │  │   │
│  │  │  - ReportService                         │  │   │
│  │  │  - NotificationService                   │  │   │
│  │  │  - SignalRService                        │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────┐  │   │
│  │  │  Interceptors & Guards                   │  │   │
│  │  │  - AuthGuard                             │  │   │
│  │  │  - AuthInterceptor                       │  │   │
│  │  │  - ErrorInterceptor                      │  │   │
│  │  └──────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Backend API Architecture

```
┌────────────────────────────────────────────────────────────┐
│              ASP.NET Core 9 Web API                        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ HTTP Request Processing Pipeline                     │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │ 1. CORS Middleware                                  │ │
│  │ 2. Authentication Middleware (JWT)                  │ │
│  │ 3. Authorization Middleware                         │ │
│  │ 4. Custom Exception Handling Middleware             │ │
│  └──────────────────────────────────────────────────────┘ │
│                        │                                    │
│  ┌─────────────────────▼──────────────────────────────┐   │
│  │            Route Handlers                          │   │
│  ├────────────────────────────────────────────────────┤   │
│  │  ┌──────────────────────────────────────────────┐  │   │
│  │  │ Controllers                                  │  │   │
│  │  │ ├── AuthController                           │  │   │
│  │  │ ├── DashboardController                      │  │   │
│  │  │ ├── VehicleController                        │  │   │
│  │  │ ├── ReportController                         │  │   │
│  │  │ ├── NotificationController                   │  │   │
│  │  │ └── UserController                           │  │   │
│  │  └──────────────────────────────────────────────┘  │   │
│  │                   │                                 │   │
│  │  ┌────────────────▼──────────────────────────────┐ │   │
│  │  │ Services (Business Logic)                     │ │   │
│  │  │ ├── AuthService                               │ │   │
│  │  │ ├── DashboardService                          │ │   │
│  │  │ ├── VehicleService                            │ │   │
│  │  │ ├── ReportService                             │ │   │
│  │  │ └── NotificationService                       │ │   │
│  │  └────────────────┬───────────────────────────────┘ │   │
│  │                   │                                 │   │
│  │  ┌────────────────▼──────────────────────────────┐ │   │
│  │  │ Repositories (Data Access)                   │ │   │
│  │  │ ├── IVehicleRepository                        │ │   │
│  │  │ ├── IWeightRecordRepository                   │ │   │
│  │  │ ├── INotificationRepository                   │ │   │
│  │  │ └── IUserRepository                           │ │   │
│  │  └──────────────────────────────────────────────┘ │   │
│  └────────────────────────────────────────────────────┘   │
│                        │                                    │
│  ┌─────────────────────▼──────────────────────────────┐   │
│  │ Entity Framework Core                              │   │
│  │ (ORM - Object Relational Mapping)                  │   │
│  └─────────────────────┬──────────────────────────────┘   │
│                        │                                    │
└────────────────────────┼────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │   SQL Server DB     │
              │   (Azure SQL)       │
              └─────────────────────┘
```

---

## Real-Time Communication (SignalR)

```
┌─────────────────────────────────────────────────────────┐
│                  SignalR Hub                            │
│               (LiveMonitoringHub)                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Events sent from Frontend:                            │
│  ┌───────────────────────────────────────────────────┐│
│  │ - JoinLiveMonitoring()                            ││
│  │ - LeaveLiveMonitoring()                           ││
│  │ - JoinVehicleGroup(vehicleId)                     ││
│  │ - LeaveVehicleGroup(vehicleId)                    ││
│  └───────────────────────────────────────────────────┘│
│                        │                               │
│                        ▼                               │
│  ┌───────────────────────────────────────────────────┐│
│  │  Hub Methods                                      ││
│  │  ├── Handle incoming connections                 ││
│  │  ├── Add clients to groups                        ││
│  │  ├── Remove clients from groups                   ││
│  │  └── Route events to correct clients              ││
│  └───────────────────────────────────────────────────┘│
│                        │                               │
│                        ▼                               │
│  ┌───────────────────────────────────────────────────┐│
│  │ Events sent to Frontend:                          ││
│  │ - VehicleUpdated (status, weight, location)       ││
│  │ - NotificationReceived (new notifications)        ││
│  │ - LiveLogAdded (system logs)                      ││
│  │ - BarrierStatusChanged (entry/exit barriers)      ││
│  │ - WeightUpdated (real-time weight)                ││
│  └───────────────────────────────────────────────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Database Schema Relationships

```
┌──────────────┐          ┌──────────────┐
│  Customers   │◄────────┤  Users       │
│              │1        │              │
├──────────────┤      ┌──┤├──────────────┤
│Id (PK)       │      │  │Id (PK)       │
│CompanyName   │      │  │Username      │
│Email         │      │  │Email         │
│Phone         │      │  │PasswordHash  │
│Address       │      │  │CustomerId(FK)│
│              │      │  │RoleId (FK)   │
└──────────────┘      │  └──────────────┘
        ▲             │
        │             │
        │        ┌────┴───────┐
        │        │            │
        │   ┌────▼────┐  ┌────▼──────┐
        │   │  Roles  │  │ Vehicles  │
        │   │         │  │           │
        │   ├─────────┤  ├───────────┤
        │   │Id (PK)  │  │Id (PK)    │
        │   │Name     │  │VehicleNum │
        │   │         │  │Status     │
        │   └─────────┘  │CustomerId │
        │                └─────┬─────┘
        │                      │
        │                      │1
        │                      │
        │     ┌────────────────┼────────────┐
        │     │                │            │
        │  ┌──▼──────────┐ ┌───▼───────┐ ┌─▼────────────┐
        │  │WeightRecords│ │VehicleLogs│ │Notifications│
        │  │             │ │           │ │             │
        └──┤CustomerId   │ │VehicleId  │ │CustomerId   │
           │VehicleId    │ │           │ │VehicleId    │
           │GrossWeight  │ │EventType  │ │Title/Message│
           │NetWeight    │ │Date       │ │Type         │
           └─────────────┘ └───────────┘ └─────────────┘
```

---

## Authentication & Authorization Flow

```
┌──────────────┐
│   User       │
│   Browser    │
└──────┬───────┘
       │
       │ 1. POST /api/auth/login
       │    {username, password}
       │
       ▼
┌────────────────────────────────────────┐
│    Backend - AuthController            │
├────────────────────────────────────────┤
│ 1. Validate credentials                │
│ 2. Check user is active                │
│ 3. Verify password (BCrypt)            │
│ 4. Generate JWT Token + RefreshToken   │
│ 5. Save RefreshToken to DB             │
└────┬───────────────────────────────────┘
     │
     │ 2. Return LoginResponse
     │    {accessToken, refreshToken,
     │     expiresIn: 3600, user}
     │
     ▼
┌──────────────────────────────────────────┐
│    Browser LocalStorage                  │
├──────────────────────────────────────────┤
│ authToken: JWT Token                     │
│ refreshToken: Refresh Token              │
│ currentUser: User Info                   │
│ tokenExpiry: Expiration Time             │
└──────────────────────────────────────────┘
     │
     │ 3. Add to Request Headers
     │    Authorization: Bearer <JWT>
     │
     ▼
┌──────────────────────────────────────────┐
│    Any Protected API Request             │
├──────────────────────────────────────────┤
│ 1. AuthInterceptor adds JWT to header    │
│ 2. Backend validates JWT signature       │
│ 3. Extract user claims from JWT          │
│ 4. Verify user permissions               │
│ 5. Execute request                       │
└──────────────────────────────────────────┘

Token Refresh Flow:
     │ 401 Response (Token Expired)
     │
     ├─ POST /api/auth/refresh-token
     │  {refreshToken}
     │
     ├─ Generate new JWT
     ├─ Retry original request
     │
     └─ Continue processing
```

---

## Deployment Architecture - Azure

```
┌────────────────────────────────────────────────────────────┐
│                        Azure Subscription                  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Resource Group: customer-portal-rg                 │ │
│  ├──────────────────────────────────────────────────────┤ │
│  │                                                      │ │
│  │  ┌─────────────────────────────────────────────┐   │ │
│  │  │  Azure Container Registry                    │   │ │
│  │  │  - Frontend image (Angular + Nginx)         │   │ │
│  │  │  - Backend image (ASP.NET Core)             │   │ │
│  │  └─────────────────────────────────────────────┘   │ │
│  │                        │                            │ │
│  │  ┌────────────────────▼──────────────────────┐   │ │
│  │  │  App Service Plan                          │   │ │
│  │  │  (Tier: P1V2 or Higher for Production)    │   │ │
│  │  └────┬───────────────────────────────┬──────┘   │ │
│  │       │                               │           │ │
│  │  ┌────▼──────────────────┐  ┌────────▼───────┐ │ │
│  │  │  Frontend Web App      │  │  Backend API   │ │ │
│  │  │  - Container Instance  │  │  - Container   │ │ │
│  │  │  - Always On           │  │  - Autoscale   │ │ │
│  │  └────────────────────────┘  └────────────────┘ │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │  Azure SQL Database                      │   │ │
│  │  │  - Tier: Business Critical              │   │ │
│  │  │  - Geo-redundancy enabled                │   │ │
│  │  │  - Automated backups                     │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │  Azure Cache for Redis                   │   │ │
│  │  │  - Standard (C1 or Premium P1)          │   │ │
│  │  │  - Session storage                      │   │ │
│  │  │  - API response caching                 │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │  Azure Key Vault                         │   │ │
│  │  │  - JWT Secret Keys                      │   │ │
│  │  │  - Database Connection Strings          │   │ │
│  │  │  - API Keys                             │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │  Application Insights                    │   │ │
│  │  │  - Performance monitoring                │   │ │
│  │  │  - Exception tracking                    │   │ │
│  │  │  - Custom metrics                        │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  │                                                  │ │
│  │  ┌──────────────────────────────────────────┐   │ │
│  │  │  Azure Service Bus                       │   │ │
│  │  │  - Message queuing                       │   │ │
│  │  │  - Notification distribution             │   │ │
│  │  └──────────────────────────────────────────┘   │ │
│  └──────────────────────────────────────────────────┘ │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## CI/CD Pipeline (GitHub Actions)

```
┌─────────────────────────────────────────────────────┐
│           GitHub Actions Workflow                   │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Trigger: Push to main, Pull Request               │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  1. Build & Test Job                        │   │
│  │     - npm install & ng build                │   │
│  │     - Run unit tests                        │   │
│  │     - dotnet build backend                  │   │
│  │     - Run backend tests                     │   │
│  └─────────────────────────────────────────────┘   │
│                        │                            │
│  ┌─────────────────────▼─────────────────────────┐ │
│  │  2. Containerization Job                      │ │
│  │     - Build Docker images                    │ │
│  │     - Push to ACR                            │ │
│  └─────────────────────────────────────────────┘   │
│                        │                            │
│  ┌─────────────────────▼─────────────────────────┐ │
│  │  3. Deployment Job (if main branch)           │ │
│  │     - Deploy to staging                      │ │
│  │     - Run integration tests                  │ │
│  │     - Deploy to production                   │ │
│  └─────────────────────────────────────────────┘   │
│                        │                            │
│  ┌─────────────────────▼─────────────────────────┐ │
│  │  4. Monitoring & Notification                 │ │
│  │     - Send deployment status                 │ │
│  │     - Alert on failures                      │ │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Data Flow - Dashboard

```
1. User Navigates to Dashboard
   └─> Dashboard Component OnInit()

2. Load Dashboard Data
   └─> DashboardService.getDashboardData(customerId)
       └─> GET /api/dashboard/{customerId}

3. Backend Processing
   └─> DashboardController.GetDashboardData()
       └─> DashboardService.GetDashboardDataAsync()
           └─> Query Database via Repositories
               ├─> GetKPI() - Summary metrics
               ├─> GetEntryExitTrend() - Last 30 days
               ├─> GetWeightTrend() - Weight analysis
               ├─> GetStatusDistribution() - Vehicle status
               ├─> GetMonthlyStatistics() - Monthly data
               └─> GetRecentActivities() - Recent transactions

4. Return Response
   └─> JSON Response with DashboardDataDto

5. Frontend Processing
   └─> Component receives data
       └─> Initialize Charts with data
       └─> Populate KPI cards
       └─> Display tables
       └─> Mark as loaded

6. Real-Time Updates (SignalR)
   └─> Backend sends VehicleUpdated event
       └─> SignalRService receives update
       └─> DashboardService updates live data
       └─> Component updates UI reactively
```

---

## Mobile Responsiveness

```
Desktop (> 1200px)
┌────────────────────────────────────────┐
│ Sidebar (250px)  │  Main Content       │
│                  │  3-column layout    │
│                  │  - KPI Cards        │
│                  │  - Charts           │
│                  │  - Tables           │
└────────────────────────────────────────┘

Tablet (768px - 1200px)
┌──────────────────────┐
│ Navbar               │
├──────────────────────┤
│ Sidebar (collapse)   │
│ Main Content 2-col   │
│ - KPI Cards          │
│ - Charts             │
└──────────────────────┘

Mobile (< 768px)
┌──────────────────────┐
│ Navbar (hamburger)   │
├──────────────────────┤
│ Drawer Navigation    │
│ Main Content 1-col   │
│ - KPI Cards (stack)  │
│ - Charts (full width)│
│ - Scrollable table   │
└──────────────────────┘
```

---

**This architecture ensures:**
- ✅ High availability & scalability
- ✅ Enterprise security  
- ✅ Real-time communication
- ✅ Professional UI/UX
- ✅ Comprehensive monitoring
- ✅ Automated deployment
- ✅ Disaster recovery
- ✅ Performance optimization
