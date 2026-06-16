# Customer Portal Backend - SQLite Setup Guide

## Prerequisites
- Node.js 14+ and npm installed
- SQLite3 installed (optional - npm package includes it)

## Installation & Setup

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

This will install:
- `express` - Web framework
- `sqlite3` - Database
- `cors` - Cross-origin support
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `body-parser` - Request parsing

### Step 2: Start the Backend Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm install -g nodemon
npm run dev
```

The server will:
1. Create `customerportal.db` SQLite database
2. Create the `customers` table
3. Insert 4 default users with hashed passwords
4. Start listening on `http://localhost:3000`

### Step 3: Default Login Credentials

The following users are automatically created:

| Username | Password | Role |
|----------|----------|------|
| customer1 | Customer@123 | customer |
| customer2 | Customer@123 | customer |
| customer3 | Customer@123 | customer |
| shivrajyadav1395 | Customer@123 | admin |

**Note:** All passwords are hashed using bcryptjs with 10 salt rounds.

## API Endpoints

### POST `/api/login`

Login endpoint with SQLite database validation.

**Request:**
```json
{
  "username": "customer1",
  "password": "Customer@123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "refresh-eyJhbGciOiJIUzI1NiIs...",
  "expiresIn": 86400,
  "user": {
    "id": "1",
    "username": "customer1",
    "email": "customer1@gmail.com",
    "firstName": "John",
    "lastName": "Smith",
    "customerId": "cust-001",
    "customerName": "John Smith",
    "role": "customer",
    "permissions": ["view_dashboard", "view_vehicles", "view_reports"],
    "isActive": true
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### POST `/api/forgot-password`

Password reset endpoint (mock implementation).

**Request:**
```json
{
  "email": "customer1@gmail.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "If the email exists, a reset link has been sent"
}
```

### GET `/api/health`

Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Database Schema

### customers table

```sql
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  customer_id TEXT,
  customer_name TEXT,
  role TEXT DEFAULT 'customer',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Features

✅ **SQLite Database** - Lightweight, file-based database  
✅ **Password Hashing** - bcryptjs for secure password storage  
✅ **JWT Authentication** - Token-based authentication  
✅ **CORS Enabled** - Configured for localhost:4200  
✅ **Error Handling** - Comprehensive error responses  
✅ **Auto-Initialization** - Database and tables created automatically  

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:4200` (Angular development server)

Modify the CORS settings in `server.js` if you need to add more origins:

```javascript
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:3000'],
  credentials: true
}));
```

## Troubleshooting

### Database file not created
- Check write permissions in the backend directory
- Ensure the backend folder path is accessible

### Port 3000 already in use
- Change the PORT in `server.js`: `const PORT = process.env.PORT || 3000;`
- Or kill the process using port 3000

### CORS errors
- Ensure the Angular app is running on http://localhost:4200
- Check the CORS configuration in server.js

### Login fails with "Invalid credentials"
- Verify the username exists in the database
- Check that the password is correct
- Ensure the user account is active (is_active = 1)

## Production Security Recommendations

⚠️ **IMPORTANT:** Never use this setup in production without:

1. **Use environment variables** for sensitive data:
```javascript
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;
```

2. **Add authentication middleware** for protected routes:
```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false });
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid token' });
  }
};
```

3. **Use HTTPS** in production

4. **Implement rate limiting** to prevent brute-force attacks

5. **Validate and sanitize** all user inputs

6. **Use a proper database** like PostgreSQL for production

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Start backend: `npm start`
3. ✅ Test login in Angular application
4. ✅ Verify database is created in backend folder
5. ✅ Check browser console for errors
