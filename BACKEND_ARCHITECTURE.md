# Customer Portal - Complete Architecture & Backend Documentation

## Project Overview

This is an enterprise-level Customer Portal application for a Smart Gate System. The application provides real-time monitoring, analytics, and management of vehicle tracking, weighbridge operations, and facility management.

---

## Technology Stack

### Frontend
- **Angular 21** - Modern standalone components
- **Angular Material** - Professional UI components
- **Bootstrap 5** - Responsive grid system
- **Chart.js** - Data visualization
- **SignalR Client** - Real-time communication
- **RxJS** - Reactive programming
- **TypeScript 5.9** - Type-safe development

### Backend
- **ASP.NET Core 9** - Modern .NET framework
- **Entity Framework Core** - ORM
- **SignalR** - Real-time bidirectional communication
- **SQL Server** - Enterprise database
- **JWT Authentication** - Secure token-based auth
- **Dependency Injection** - Built-in DI container

### Database
- **SQL Server 2019+** - Enterprise database
- **Entity Framework Core** - Database abstraction layer

---

## Frontend Architecture

### Project Structure

```
src/
├── app/
│   ├── core/
│   │   ├── guards/              # Route guards
│   │   │   └── auth.guard.ts
│   │   ├── interceptors/        # HTTP interceptors
│   │   │   ├── auth.interceptor.ts
│   │   │   └── error.interceptor.ts
│   │   ├── models/              # TypeScript interfaces
│   │   │   ├── auth.model.ts
│   │   │   ├── vehicle.model.ts
│   │   │   ├── dashboard.model.ts
│   │   │   └── ...
│   │   └── services/            # Core services
│   │       ├── auth.service.ts
│   │       ├── dashboard.service.ts
│   │       ├── vehicle.service.ts
│   │       ├── signalr.service.ts
│   │       └── ...
│   ├── features/                # Feature modules
│   │   ├── auth/
│   │   │   └── login.component.ts
│   │   ├── dashboard/
│   │   │   ├── dashboard.component.ts
│   │   │   ├── dashboard.component.html
│   │   │   └── dashboard.component.scss
│   │   ├── vehicles/
│   │   ├── reports/
│   │   ├── live-monitoring/
│   │   ├── analytics/
│   │   ├── notifications/
│   │   └── profile/
│   ├── shared/                  # Shared components
│   │   ├── components/
│   │   ├── directives/
│   │   └── pipes/
│   ├── layouts/                 # Layout components
│   │   ├── navbar.component.ts
│   │   └── sidebar.component.ts
│   ├── app.ts                   # Root component
│   └── app.routes.ts            # Routing configuration
├── assets/                      # Static assets
├── environments/                # Environment configs
└── styles.scss                  # Global styles
```

### Key Services

#### AuthService
Handles authentication, JWT token management, and user state.

```typescript
// Login flow
login(credentials) -> Observable<LoginResponse>
logout() -> void
refreshToken() -> Observable<LoginResponse>
getCurrentUser() -> UserInfo | null
isAuthenticated() -> boolean
```

#### DashboardService
Fetches KPI data, charts, and statistical information.

```typescript
getDashboardData(customerId) -> Observable<DashboardData>
getKPI(customerId) -> Observable<DashboardKPI>
getEntryExitTrend(customerId, days) -> Observable<any[]>
getWeightTrend(customerId, days) -> Observable<any[]>
```

#### VehicleService
Manages vehicle tracking and history.

```typescript
getVehicles(filter) -> Observable<PaginatedResponse<VehicleTrackingDTO>>
getVehicleById(id) -> Observable<Vehicle>
getTodayVehicles() -> Observable<Vehicle[]>
getInsideVehicles() -> Observable<Vehicle[]>
```

#### SignalRService
Handles real-time communication using SignalR.

```typescript
startConnection() -> Observable<void>
joinVehicleGroup(vehicleId) -> Promise<void>
joinLiveMonitoring() -> Promise<void>
// Subscribes to events:
liveVehicleUpdate$: Observable<LiveVehicleUpdate>
notification$: Observable<Notification>
liveLogs$: Observable<any[]>
```

### Authentication Flow

```
1. User enters credentials on Login page
2. AuthService calls POST /api/auth/login
3. Backend validates and returns JWT token
4. Token stored in localStorage
5. AuthInterceptor adds token to all HTTP requests
6. On 401 response, AuthInterceptor attempts token refresh
7. User redirected to dashboard on successful login
```

### Guards & Interceptors

**AuthGuard**
- Protects routes requiring authentication
- Redirects unauthenticated users to login
- Stores attempted URL for post-login redirect

**AuthInterceptor**
- Adds JWT token to request headers
- Handles token refresh automatically
- Manages multiple concurrent requests during refresh

**ErrorInterceptor**
- Catches HTTP errors
- Displays user-friendly error messages
- Logs errors for debugging

---

## Backend Architecture

### ASP.NET Core Project Structure

```csharp
CustomerPortalAPI/
├── Controllers/
│   ├── AuthController.cs
│   ├── DashboardController.cs
│   ├── VehicleController.cs
│   ├── ReportController.cs
│   └── NotificationController.cs
├── Services/
│   ├── AuthService.cs
│   ├── DashboardService.cs
│   ├── VehicleService.cs
│   ├── ReportService.cs
│   └── NotificationService.cs
├── Repositories/
│   ├── IRepository.cs
│   ├── VehicleRepository.cs
│   ├── WeightRecordRepository.cs
│   └── ...
├── Models/
│   ├── DTOs/
│   │   ├── LoginRequestDto.cs
│   │   ├── LoginResponseDto.cs
│   │   ├── VehicleDto.cs
│   │   └── ...
│   ├── Entities/
│   │   ├── Vehicle.cs
│   │   ├── WeightRecord.cs
│   │   ├── User.cs
│   │   └── ...
├── Data/
│   ├── ApplicationDbContext.cs
│   ├── Migrations/
│   └── Seeders/
├── Hubs/
│   └── LiveMonitoringHub.cs
├── Middleware/
│   ├── ErrorHandlingMiddleware.cs
│   └── JwtMiddleware.cs
├── Program.cs
└── appsettings.json
```

### API Endpoints

#### Authentication
```
POST   /api/auth/login              - User login
POST   /api/auth/refresh-token      - Refresh JWT token
POST   /api/auth/logout             - User logout
POST   /api/auth/forgot-password    - Initiate password reset
POST   /api/auth/reset-password     - Reset password with token
```

#### Dashboard
```
GET    /api/dashboard/{customerId}              - Get complete dashboard data
GET    /api/dashboard/{customerId}/kpi          - Get KPI metrics
GET    /api/dashboard/{customerId}/entry-exit-trend       - Entry/exit trend
GET    /api/dashboard/{customerId}/weight-trend           - Weight trend
GET    /api/dashboard/{customerId}/status-distribution    - Vehicle status distribution
GET    /api/dashboard/{customerId}/monthly-statistics     - Monthly statistics
```

#### Vehicles
```
GET    /api/vehicles                           - Get paginated vehicles
GET    /api/vehicles/{id}                      - Get vehicle details
GET    /api/vehicles/today/all                 - Get today's vehicles
GET    /api/vehicles/inside/all                - Get vehicles currently inside
GET    /api/vehicles/history/{vehicleNumber}   - Get vehicle history
GET    /api/vehicles/export                    - Export vehicle data
```

#### Reports
```
GET    /api/reports/weighbridge                - Get weighbridge reports
GET    /api/reports/{id}                       - Get report details
GET    /api/reports/{id}/print-slip            - Get print slip data
POST   /api/reports/export/pdf                 - Export to PDF
POST   /api/reports/export/excel               - Export to Excel
GET    /api/reports/analytics                  - Get analytics report
```

#### Notifications
```
GET    /api/notifications                      - Get paginated notifications
GET    /api/notifications/unread               - Get unread notifications
PUT    /api/notifications/{id}/read            - Mark notification as read
PUT    /api/notifications/mark-all-read        - Mark all as read
DELETE /api/notifications/{id}                 - Delete notification
GET    /api/notifications/preferences/{customerId}        - Get preferences
PUT    /api/notifications/preferences/{customerId}        - Update preferences
```

#### Users/Profile
```
GET    /api/users/{userId}                      - Get user profile
PUT    /api/users/{userId}/profile              - Update user profile
GET    /api/users/{customerId}/customer-profile - Get customer profile
PUT    /api/users/{customerId}/customer-profile - Update customer profile
POST   /api/users/{userId}/upload-profile-image - Upload profile image
PUT    /api/users/{userId}/change-password      - Change password
```

---

## ASP.NET Core Controllers

### AuthController

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly ILogger<AuthController> _logger;

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        try
        {
            var response = await _authService.LoginAsync(request);
            return Ok(new ApiResponse<LoginResponseDto> 
            { 
                Success = true,
                Message = "Login successful",
                Data = response
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login failed");
            return Unauthorized(new ApiResponse<object> 
            { 
                Success = false,
                Message = "Invalid credentials"
            });
        }
    }

    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        var response = await _authService.RefreshTokenAsync(request.RefreshToken);
        return Ok(new ApiResponse<LoginResponseDto> 
        { 
            Success = true,
            Data = response
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        // Invalidate token
        return Ok(new ApiResponse<object> 
        { 
            Success = true,
            Message = "Logout successful"
        });
    }
}
```

### DashboardController

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly DashboardService _dashboardService;

    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetDashboardData(string customerId)
    {
        var data = await _dashboardService.GetDashboardDataAsync(customerId);
        return Ok(new ApiResponse<DashboardDataDto> 
        { 
            Success = true,
            Data = data
        });
    }

    [HttpGet("{customerId}/kpi")]
    public async Task<IActionResult> GetKPI(string customerId)
    {
        var kpi = await _dashboardService.GetKPIAsync(customerId);
        return Ok(new ApiResponse<DashboardKPIDto> 
        { 
            Success = true,
            Data = kpi
        });
    }

    [HttpGet("{customerId}/entry-exit-trend")]
    public async Task<IActionResult> GetEntryExitTrend(string customerId, [FromQuery] int days = 30)
    {
        var trend = await _dashboardService.GetEntryExitTrendAsync(customerId, days);
        return Ok(new ApiResponse<object> 
        { 
            Success = true,
            Data = trend
        });
    }
}
```

### VehicleController

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class VehicleController : ControllerBase
{
    private readonly VehicleService _vehicleService;

    [HttpGet]
    public async Task<IActionResult> GetVehicles(
        [FromQuery] VehicleFilterDto filter,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var result = await _vehicleService.GetVehiclesAsync(filter, pageNumber, pageSize);
        return Ok(new ApiResponse<PaginatedResponseDto<VehicleDto>> 
        { 
            Success = true,
            Data = result
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetVehicle(string id)
    {
        var vehicle = await _vehicleService.GetVehicleByIdAsync(id);
        if (vehicle == null)
            return NotFound();

        return Ok(new ApiResponse<VehicleDto> 
        { 
            Success = true,
            Data = vehicle
        });
    }

    [HttpGet("today/all")]
    public async Task<IActionResult> GetTodayVehicles()
    {
        var vehicles = await _vehicleService.GetTodayVehiclesAsync();
        return Ok(new ApiResponse<List<VehicleDto>> 
        { 
            Success = true,
            Data = vehicles
        });
    }

    [HttpGet("export")]
    public async Task<IActionResult> ExportVehicles(
        [FromQuery] DateTime startDate,
        [FromQuery] DateTime endDate)
    {
        var fileContent = await _vehicleService.ExportVehiclesAsync(startDate, endDate);
        return File(fileContent, 
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "vehicles_export.xlsx");
    }
}
```

### LiveMonitoringHub (SignalR Hub)

```csharp
[Authorize]
public class LiveMonitoringHub : Hub
{
    private readonly NotificationService _notificationService;

    public async Task JoinLiveMonitoring()
    {
        var customerId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await Groups.AddToGroupAsync(Context.ConnectionId, $"customer-{customerId}");
    }

    public async Task LeaveLiveMonitoring()
    {
        var customerId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"customer-{customerId}");
    }

    public async Task JoinVehicleGroup(string vehicleId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"vehicle-{vehicleId}");
    }

    public async Task LeaveVehicleGroup(string vehicleId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"vehicle-{vehicleId}");
    }

    // Called from backend services to push updates
    public async Task SendVehicleUpdate(LiveVehicleUpdateDto update)
    {
        await Clients.Group($"vehicle-{update.VehicleId}")
            .SendAsync("VehicleUpdated", update);
    }

    public async Task SendNotification(NotificationDto notification)
    {
        await Clients.Group($"customer-{notification.CustomerId}")
            .SendAsync("NotificationReceived", notification);
    }

    public async Task SendLiveLog(object log)
    {
        await Clients.All.SendAsync("LiveLogAdded", log);
    }
}
```

---

## Database Design

### SQL Schema

```sql
-- Users Table
CREATE TABLE Users (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Username NVARCHAR(50) NOT NULL UNIQUE,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(MAX) NOT NULL,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    PhoneNumber NVARCHAR(20),
    ProfileImage NVARCHAR(MAX),
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    RoleId UNIQUEIDENTIFIER NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME,
    LastLogin DATETIME,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id)
);

-- Customers Table
CREATE TABLE Customers (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CompanyName NVARCHAR(255) NOT NULL,
    ContactPerson NVARCHAR(255),
    Email NVARCHAR(255),
    PhoneNumber NVARCHAR(20),
    Address NVARCHAR(255),
    City NVARCHAR(100),
    State NVARCHAR(100),
    ZipCode NVARCHAR(20),
    Country NVARCHAR(100),
    TaxId NVARCHAR(50),
    IndustryType NVARCHAR(100),
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME
);

-- Vehicles Table
CREATE TABLE Vehicles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VehicleNumber NVARCHAR(50) NOT NULL,
    VehicleType NVARCHAR(50),
    DriverName NVARCHAR(100),
    DriverPhone NVARCHAR(20),
    EntryTime DATETIME,
    ExitTime DATETIME,
    Status NVARCHAR(50),
    CurrentWeight DECIMAL(10,2),
    GrossWeight DECIMAL(10,2),
    TareWeight DECIMAL(10,2),
    NetWeight DECIMAL(10,2),
    CurrentLocation NVARCHAR(255),
    EntryBarrierStatus BIT,
    ExitBarrierStatus BIT,
    EntryAnprImageUrl NVARCHAR(MAX),
    ExitAnprImageUrl NVARCHAR(MAX),
    CustomerId UNIQUEIDENTIFIER,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    UpdatedAt DATETIME,
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    INDEX IDX_Vehicle_Status (Status),
    INDEX IDX_Vehicle_Date (CreatedAt)
);

-- WeightRecords Table
CREATE TABLE WeightRecords (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VehicleId UNIQUEIDENTIFIER NOT NULL,
    GrossWeight DECIMAL(10,2),
    TareWeight DECIMAL(10,2),
    NetWeight DECIMAL(10,2),
    TicketNumber NVARCHAR(50),
    OperatorId UNIQUEIDENTIFIER,
    RecordedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id),
    FOREIGN KEY (OperatorId) REFERENCES Users(Id),
    INDEX IDX_WeightRecord_Vehicle (VehicleId),
    INDEX IDX_WeightRecord_Date (RecordedAt)
);

-- VehicleLogs Table
CREATE TABLE VehicleLogs (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    VehicleId UNIQUEIDENTIFIER NOT NULL,
    EventType NVARCHAR(100),
    Description NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id),
    INDEX IDX_Log_Vehicle (VehicleId),
    INDEX IDX_Log_Date (CreatedAt)
);

-- Notifications Table
CREATE TABLE Notifications (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    CustomerId UNIQUEIDENTIFIER NOT NULL,
    Title NVARCHAR(255),
    Message NVARCHAR(MAX),
    Type NVARCHAR(50),
    Status NVARCHAR(50),
    VehicleId UNIQUEIDENTIFIER,
    ActionUrl NVARCHAR(MAX),
    IsRead BIT DEFAULT 0,
    ReadAt DATETIME,
    CreatedAt DATETIME DEFAULT GETUTCDATE(),
    FOREIGN KEY (CustomerId) REFERENCES Customers(Id),
    FOREIGN KEY (VehicleId) REFERENCES Vehicles(Id),
    INDEX IDX_Notification_Customer (CustomerId),
    INDEX IDX_Notification_Status (Status)
);

-- Roles Table
CREATE TABLE Roles (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(50) NOT NULL UNIQUE,
    Description NVARCHAR(255)
);

-- Permissions Table
CREATE TABLE Permissions (
    Id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(255),
    Code NVARCHAR(50)
);

-- RolePermissions Table
CREATE TABLE RolePermissions (
    RoleId UNIQUEIDENTIFIER NOT NULL,
    PermissionId UNIQUEIDENTIFIER NOT NULL,
    PRIMARY KEY (RoleId, PermissionId),
    FOREIGN KEY (RoleId) REFERENCES Roles(Id),
    FOREIGN KEY (PermissionId) REFERENCES Permissions(Id)
);
```

### Entity Models (EF Core)

```csharp
public class Vehicle
{
    public Guid Id { get; set; }
    public string VehicleNumber { get; set; }
    public string VehicleType { get; set; }
    public string DriverName { get; set; }
    public string DriverPhone { get; set; }
    public DateTime? EntryTime { get; set; }
    public DateTime? ExitTime { get; set; }
    public VehicleStatus Status { get; set; }
    public decimal CurrentWeight { get; set; }
    public decimal GrossWeight { get; set; }
    public decimal TareWeight { get; set; }
    public decimal NetWeight { get; set; }
    public string CurrentLocation { get; set; }
    public bool EntryBarrierStatus { get; set; }
    public bool ExitBarrierStatus { get; set; }
    public string EntryAnprImageUrl { get; set; }
    public string ExitAnprImageUrl { get; set; }
    public Guid CustomerId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }

    // Navigation properties
    public Customer Customer { get; set; }
    public ICollection<WeightRecord> WeightRecords { get; set; }
    public ICollection<VehicleLog> Logs { get; set; }
}

public class WeightRecord
{
    public Guid Id { get; set; }
    public Guid VehicleId { get; set; }
    public decimal GrossWeight { get; set; }
    public decimal TareWeight { get; set; }
    public decimal NetWeight { get; set; }
    public string TicketNumber { get; set; }
    public Guid? OperatorId { get; set; }
    public DateTime RecordedAt { get; set; }

    // Navigation properties
    public Vehicle Vehicle { get; set; }
    public User Operator { get; set; }
}

public class Notification
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public string Title { get; set; }
    public string Message { get; set; }
    public NotificationType Type { get; set; }
    public NotificationStatus Status { get; set; }
    public Guid? VehicleId { get; set; }
    public string ActionUrl { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public DateTime CreatedAt { get; set; }

    // Navigation properties
    public Customer Customer { get; set; }
    public Vehicle Vehicle { get; set; }
}
```

---

## Deployment & DevOps

### Docker Support

```dockerfile
# Frontend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:latest
COPY --from=builder /app/dist/customer-portal /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS builder
WORKDIR /src
COPY ["CustomerPortalAPI.csproj", "."]
RUN dotnet restore "CustomerPortalAPI.csproj"
COPY . .
RUN dotnet build "CustomerPortalAPI.csproj" -c Release -o /app/build

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=builder /app/build .
EXPOSE 5000
ENTRYPOINT ["dotnet", "CustomerPortalAPI.dll"]
```

---

## Security Best Practices

1. **JWT Authentication** - Stateless, token-based authentication
2. **Password Hashing** - Use bcrypt or Argon2 for password hashing
3. **HTTPS Only** - All communications encrypted
4. **CORS Configuration** - Restrict allowed origins
5. **SQL Injection Prevention** - Parameterized queries with EF Core
6. **XSS Protection** - Angular sanitization, CSP headers
7. **Role-Based Access Control** - Fine-grained permissions
8. **Audit Logging** - Track all critical operations
9. **Rate Limiting** - Prevent abuse and DDoS attacks
10. **Input Validation** - Server-side validation for all inputs

---

## Performance Optimization

1. **Lazy Loading** - Load feature modules on demand
2. **Change Detection** - Use OnPush strategy
3. **Virtual Scrolling** - Handle large lists efficiently
4. **Database Indexing** - Optimize frequently queried columns
5. **Caching** - Implement Redis caching for frequently accessed data
6. **Pagination** - Limit data returned per request
7. **Compression** - Enable gzip compression
8. **CDN** - Serve static assets from CDN
9. **API Rate Limiting** - Prevent resource exhaustion
10. **Query Optimization** - Use select specific fields only

---

## Monitoring & Logging

1. **Application Insights** - Monitor application performance
2. **Structured Logging** - Use Serilog for structured logs
3. **Error Tracking** - Implement Sentry or similar
4. **Health Checks** - Monitor API health
5. **Database Monitoring** - Track query performance
6. **User Analytics** - Track user behavior
7. **Real-time Alerts** - Alert on critical errors

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CDN / CloudFlare                 │
└────────────────────┬────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼──────────┐     ┌───────▼──────────┐
│  Frontend (ng)   │     │  Backend (ASP)   │
│  - Nginx         │     │  - Load Balancer │
│  - Static Assets │     │  - API Servers   │
│  - SPA           │     │  - SignalR       │
└──────────────────┘     └────────┬─────────┘
                                  │
                        ┌─────────┴──────────┐
                        │                    │
                   ┌────▼────┐        ┌─────▼──┐
                   │ SQL Srv │        │ Cache  │
                   │Database │        │ Redis  │
                   └─────────┘        └────────┘
```

---

## Setup Instructions

### Frontend Setup
```bash
npm install
npm install @angular/material @angular/cdk chart.js ng2-charts ngx-toastr
npm install @microsoft/signalr
npm install bootstrap
npm run build
```

### Backend Setup
```bash
dotnet new webapi -n CustomerPortalAPI
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.AspNetCore.SignalR
dotnet add package System.IdentityModel.Tokens.Jwt
dotnet add package BCrypt.Net-Core
dotnet ef migrations add InitialCreate
dotnet ef database update
```

---

## Next Steps

1. **Implement remaining components** - Vehicle tracking, Reports, Analytics, Notifications, Profile
2. **Add comprehensive error handling**
3. **Implement notification preferences**
4. **Add export functionality** (PDF, Excel)
5. **Implement real-time updates** via SignalR
6. **Add unit and integration tests**
7. **Setup CI/CD pipeline**
8. **Deploy to Azure** (App Service, Container Registry, SQL Database)
9. **Monitor and optimize performance**
10. **Add analytics and reporting**

---

## API Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "errors": null,
  "statusCode": 200,
  "timestamp": "2024-05-22T10:30:00Z"
}
```

---

**Version**: 1.0.0  
**Last Updated**: May 22, 2024  
**Author**: Senior Full Stack Architect
