# ASP.NET Core 9 - Complete API Reference

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.yourdomain.com/api
```

## Authentication Header
All protected endpoints require:
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

---

## Authentication Service (`AuthService.cs`)

```csharp
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _authService.AuthenticateAsync(
                request.Username, 
                request.Password);

            if (!result.Success)
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid username or password",
                    StatusCode = 401
                });

            return Ok(new ApiResponse<LoginResponseDto>
            {
                Success = true,
                Message = "Login successful",
                Data = result.Data,
                StatusCode = 200
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "An error occurred during login",
                StatusCode = 500
            });
        }
    }

    [AllowAnonymous]
    [HttpPost("refresh-token")]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto request)
    {
        try
        {
            var result = await _authService.RefreshTokenAsync(request.RefreshToken);
            
            if (!result.Success)
                return Unauthorized(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Invalid refresh token",
                    StatusCode = 401
                });

            return Ok(new ApiResponse<LoginResponseDto>
            {
                Success = true,
                Message = "Token refreshed successfully",
                Data = result.Data,
                StatusCode = 200
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Token refresh error");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "An error occurred during token refresh",
                StatusCode = 500
            });
        }
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        try
        {
            var result = await _authService.ChangePasswordAsync(
                userId, 
                request.CurrentPassword, 
                request.NewPassword);

            if (!result.Success)
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = result.Message,
                    StatusCode = 400
                });

            return Ok(new ApiResponse<object>
            {
                Success = true,
                Message = "Password changed successfully",
                StatusCode = 200
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Password change error");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "An error occurred",
                StatusCode = 500
            });
        }
    }
}
```

### AuthService Implementation

```csharp
public interface IAuthService
{
    Task<ServiceResult<LoginResponseDto>> AuthenticateAsync(string username, string password);
    Task<ServiceResult<LoginResponseDto>> RefreshTokenAsync(string refreshToken);
    Task<ServiceResult<bool>> ChangePasswordAsync(string userId, string currentPassword, string newPassword);
    Task<ServiceResult<bool>> LogoutAsync(string userId);
}

public class AuthService : IAuthService
{
    private readonly UserManager<User> _userManager;
    private readonly ITokenService _tokenService;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthService> _logger;

    public async Task<ServiceResult<LoginResponseDto>> AuthenticateAsync(
        string username, 
        string password)
    {
        var user = await _userManager.FindByNameAsync(username);
        
        if (user == null || !user.IsActive)
            return new ServiceResult<LoginResponseDto>
            {
                Success = false,
                Message = "User not found or inactive"
            };

        var passwordValid = await _userManager.CheckPasswordAsync(user, password);
        
        if (!passwordValid)
            return new ServiceResult<LoginResponseDto>
            {
                Success = false,
                Message = "Invalid password"
            };

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
        user.LastLogin = DateTime.UtcNow;

        await _userManager.UpdateAsync(user);

        var response = new LoginResponseDto
        {
            Token = accessToken,
            RefreshToken = refreshToken,
            ExpiresIn = 3600,
            User = new UserInfoDto
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                CustomerId = user.CustomerId.ToString(),
                CustomerName = user.Customer?.CompanyName,
                Role = user.Role?.Name,
                Permissions = user.Role?.Permissions?.Select(p => p.Name).ToList()
            }
        };

        return new ServiceResult<LoginResponseDto>
        {
            Success = true,
            Data = response
        };
    }

    public async Task<ServiceResult<LoginResponseDto>> RefreshTokenAsync(string refreshToken)
    {
        var user = await _userManager.Users
            .Include(u => u.Role)
            .Include(u => u.Customer)
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

        if (user == null || user.RefreshTokenExpiry < DateTime.UtcNow)
            return new ServiceResult<LoginResponseDto>
            {
                Success = false,
                Message = "Invalid or expired refresh token"
            };

        var newAccessToken = _tokenService.GenerateAccessToken(user);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        await _userManager.UpdateAsync(user);

        var response = new LoginResponseDto
        {
            Token = newAccessToken,
            RefreshToken = newRefreshToken,
            ExpiresIn = 3600,
            User = new UserInfoDto
            {
                Id = user.Id,
                Username = user.UserName,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                CustomerId = user.CustomerId.ToString(),
                CustomerName = user.Customer?.CompanyName,
                Role = user.Role?.Name
            }
        };

        return new ServiceResult<LoginResponseDto>
        {
            Success = true,
            Data = response
        };
    }

    public async Task<ServiceResult<bool>> ChangePasswordAsync(
        string userId, 
        string currentPassword, 
        string newPassword)
    {
        var user = await _userManager.FindByIdAsync(userId);
        
        if (user == null)
            return new ServiceResult<bool>
            {
                Success = false,
                Message = "User not found"
            };

        var result = await _userManager.ChangePasswordAsync(user, currentPassword, newPassword);
        
        return new ServiceResult<bool>
        {
            Success = result.Succeeded,
            Message = result.Succeeded ? "Password changed successfully" : "Password change failed",
            Data = result.Succeeded
        };
    }
}
```

---

## Dashboard Service (`DashboardService.cs`)

```csharp
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;
    private readonly ILogger<DashboardController> _logger;

    [HttpGet("{customerId}")]
    public async Task<IActionResult> GetDashboardData(string customerId)
    {
        try
        {
            var data = await _dashboardService.GetDashboardDataAsync(customerId);
            
            return Ok(new ApiResponse<DashboardDataDto>
            {
                Success = true,
                Message = "Dashboard data retrieved successfully",
                Data = data,
                StatusCode = 200
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving dashboard data");
            return StatusCode(500, new ApiResponse<object>
            {
                Success = false,
                Message = "An error occurred",
                StatusCode = 500
            });
        }
    }

    [HttpGet("{customerId}/kpi")]
    public async Task<IActionResult> GetKPI(string customerId)
    {
        var kpi = await _dashboardService.GetKPIAsync(customerId);
        
        return Ok(new ApiResponse<DashboardKPIDto>
        {
            Success = true,
            Data = kpi,
            StatusCode = 200
        });
    }

    [HttpGet("{customerId}/entry-exit-trend")]
    public async Task<IActionResult> GetEntryExitTrend(
        string customerId, 
        [FromQuery] int days = 30)
    {
        var trend = await _dashboardService.GetEntryExitTrendAsync(customerId, days);
        
        return Ok(new ApiResponse<List<EntryExitTrendDto>>
        {
            Success = true,
            Data = trend,
            StatusCode = 200
        });
    }

    [HttpGet("{customerId}/weight-trend")]
    public async Task<IActionResult> GetWeightTrend(
        string customerId, 
        [FromQuery] int days = 30)
    {
        var trend = await _dashboardService.GetWeightTrendAsync(customerId, days);
        
        return Ok(new ApiResponse<List<WeightTrendDto>>
        {
            Success = true,
            Data = trend,
            StatusCode = 200
        });
    }

    [HttpGet("{customerId}/status-distribution")]
    public async Task<IActionResult> GetStatusDistribution(string customerId)
    {
        var distribution = await _dashboardService.GetVehicleStatusDistributionAsync(customerId);
        
        return Ok(new ApiResponse<List<StatusDistributionDto>>
        {
            Success = true,
            Data = distribution,
            StatusCode = 200
        });
    }

    [HttpGet("{customerId}/monthly-statistics")]
    public async Task<IActionResult> GetMonthlyStatistics(
        string customerId,
        [FromQuery] int year,
        [FromQuery] int month)
    {
        var stats = await _dashboardService.GetMonthlyStatisticsAsync(customerId, year, month);
        
        return Ok(new ApiResponse<MonthlyStatisticsDto>
        {
            Success = true,
            Data = stats,
            StatusCode = 200
        });
    }
}
```

### DashboardService Implementation

```csharp
public interface IDashboardService
{
    Task<DashboardDataDto> GetDashboardDataAsync(string customerId);
    Task<DashboardKPIDto> GetKPIAsync(string customerId);
    Task<List<EntryExitTrendDto>> GetEntryExitTrendAsync(string customerId, int days);
    Task<List<WeightTrendDto>> GetWeightTrendAsync(string customerId, int days);
    Task<List<StatusDistributionDto>> GetVehicleStatusDistributionAsync(string customerId);
    Task<MonthlyStatisticsDto> GetMonthlyStatisticsAsync(string customerId, int year, int month);
}

public class DashboardService : IDashboardService
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IWeightRecordRepository _weightRecordRepository;
    private readonly ILogger<DashboardService> _logger;

    public async Task<DashboardDataDto> GetDashboardDataAsync(string customerId)
    {
        var customerId_Guid = Guid.Parse(customerId);

        var kpi = await GetKPIAsync(customerId);
        var entryExitTrend = await GetEntryExitTrendAsync(customerId, 30);
        var weightTrend = await GetWeightTrendAsync(customerId, 30);
        var statusDistribution = await GetVehicleStatusDistributionAsync(customerId);
        var monthlyStats = await GetMonthlyStatisticsAsync(customerId, DateTime.UtcNow.Year, DateTime.UtcNow.Month);
        
        var recentActivities = await _vehicleRepository.GetRecentActivitiesAsync(customerId_Guid, 10);
        var weighbridgeTransactions = await _weightRecordRepository.GetRecentTransactionsAsync(customerId_Guid, 10);

        return new DashboardDataDto
        {
            KPI = kpi,
            EntryExitTrend = entryExitTrend,
            WeightTrend = weightTrend,
            StatusDistribution = statusDistribution,
            MonthlyStatistics = new List<MonthlyStatisticsDto> { monthlyStats },
            RecentActivities = recentActivities,
            WeighbridgeTransactions = weighbridgeTransactions
        };
    }

    public async Task<DashboardKPIDto> GetKPIAsync(string customerId)
    {
        var customerId_Guid = Guid.Parse(customerId);
        var today = DateTime.UtcNow.Date;

        var totalVehicles = await _vehicleRepository.CountAsync(
            v => v.CustomerId == customerId_Guid && v.CreatedAt.Date == today);

        var vehiclesInside = await _vehicleRepository.CountAsync(
            v => v.CustomerId == customerId_Guid && v.Status == VehicleStatus.Entered);

        var vehiclesExitedToday = await _vehicleRepository.CountAsync(
            v => v.CustomerId == customerId_Guid && 
                 v.Status == VehicleStatus.Exited && 
                 v.ExitTime.Value.Date == today);

        var pendingVehicles = await _vehicleRepository.CountAsync(
            v => v.CustomerId == customerId_Guid && v.Status == VehicleStatus.Pending);

        var todaysTotalWeight = await _weightRecordRepository.GetSumAsync(
            w => w.Vehicle.CustomerId == customerId_Guid && 
                 w.RecordedAt.Date == today,
            w => w.NetWeight);

        var averageWeight = await _vehicleRepository.GetAverageAsync(
            v => v.CustomerId == customerId_Guid && v.CreatedAt.Date == today,
            v => v.NetWeight);

        return new DashboardKPIDto
        {
            TotalVehicles = totalVehicles,
            VehiclesInside = vehiclesInside,
            VehiclesExitedToday = vehiclesExitedToday,
            PendingVehicles = pendingVehicles,
            TodaysTotalWeight = todaysTotalWeight,
            AverageVehicleWeight = averageWeight
        };
    }

    public async Task<List<EntryExitTrendDto>> GetEntryExitTrendAsync(string customerId, int days)
    {
        var customerId_Guid = Guid.Parse(customerId);
        var startDate = DateTime.UtcNow.AddDays(-days).Date;

        var trend = await _vehicleRepository.GetGroupedAsync(
            v => v.CustomerId == customerId_Guid && v.CreatedAt.Date >= startDate,
            v => v.CreatedAt.Date,
            g => new EntryExitTrendDto
            {
                Date = g.Key,
                Entries = g.Count(v => v.EntryTime.HasValue),
                Exits = g.Count(v => v.ExitTime.HasValue)
            });

        return trend.ToList();
    }

    // Similar implementations for other methods...
}
```

---

## Data Transfer Objects (DTOs)

```csharp
namespace CustomerPortalAPI.Models.DTOs
{
    // Auth DTOs
    public class LoginRequestDto
    {
        [Required]
        public string Username { get; set; }
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; }
        
        public bool RememberMe { get; set; }
    }

    public class LoginResponseDto
    {
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public int ExpiresIn { get; set; }
        public UserInfoDto User { get; set; }
    }

    public class UserInfoDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string CustomerId { get; set; }
        public string CustomerName { get; set; }
        public string Role { get; set; }
        public List<string> Permissions { get; set; }
        public bool IsActive { get; set; }
    }

    // Dashboard DTOs
    public class DashboardKPIDto
    {
        public int TotalVehicles { get; set; }
        public int VehiclesInside { get; set; }
        public int VehiclesExitedToday { get; set; }
        public int PendingVehicles { get; set; }
        public decimal TodaysTotalWeight { get; set; }
        public decimal AverageVehicleWeight { get; set; }
    }

    public class VehicleDto
    {
        public string Id { get; set; }
        public string VehicleNumber { get; set; }
        public string VehicleType { get; set; }
        public string DriverName { get; set; }
        public string DriverPhone { get; set; }
        public DateTime EntryTime { get; set; }
        public DateTime? ExitTime { get; set; }
        public string Status { get; set; }
        public decimal CurrentWeight { get; set; }
        public decimal GrossWeight { get; set; }
        public decimal TareWeight { get; set; }
        public decimal NetWeight { get; set; }
        public string CurrentLocation { get; set; }
    }

    // Pagination
    public class PaginatedResponseDto<T>
    {
        public List<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (TotalCount + PageSize - 1) / PageSize;
        public bool HasNextPage => PageNumber < TotalPages;
        public bool HasPreviousPage => PageNumber > 1;
    }

    // Generic API Response
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T Data { get; set; }
        public List<ApiError> Errors { get; set; }
        public int StatusCode { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    public class ApiError
    {
        public string Code { get; set; }
        public string Message { get; set; }
        public string Field { get; set; }
        public string Details { get; set; }
    }
}
```

---

## Program.cs Configuration

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Identity
builder.Services.AddIdentity<User, Role>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireNonAlphanumeric = true;
    options.SignIn.RequireConfirmedEmail = false;
})
.AddEntityFrameworkStores<ApplicationDbContext>()
.AddDefaultTokenProviders();

// Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"])),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDashboardService, DashboardService>();
builder.Services.AddScoped<IVehicleService, VehicleService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Repositories
builder.Services.AddScoped<IVehicleRepository, VehicleRepository>();
builder.Services.AddScoped<IWeightRecordRepository, WeightRecordRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// SignalR
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SignalR Hub
app.MapHub<LiveMonitoringHub>("/live-monitoring-hub");

app.Run();
```

---

**This completes the comprehensive API reference for the Customer Portal Backend.**
