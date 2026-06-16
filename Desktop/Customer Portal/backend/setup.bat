@echo off
REM Customer Portal Backend Setup Script for Windows

echo.
echo ======================================
echo Customer Portal Backend Setup
echo ======================================
echo.

echo [1/3] Installing Node.js dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: Failed to install dependencies
    exit /b 1
)

echo.
echo [2/3] Dependencies installed successfully!
echo.

echo [3/3] Starting backend server...
echo.
echo ======================================
echo Backend Server Starting
echo ======================================
echo.
echo Server will be available at: http://localhost:3000
echo.
echo Default Login Credentials:
echo - Username: customer1, Password: Customer@123
echo - Username: customer2, Password: Customer@123
echo - Username: customer3, Password: Customer@123
echo - Username: shivrajyadav1395, Password: Customer@123
echo.
echo Press Ctrl+C to stop the server
echo.
echo ======================================
echo.

call npm start
