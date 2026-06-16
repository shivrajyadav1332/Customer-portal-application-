const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:4200', 'http://localhost:58747', 'http://localhost:5200', 'http://localhost:5201', 'http://localhost:5202'],
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Signup endpoint
app.post('/api/signup', (req, res) => {
  const { username, password, email, firstName, lastName } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters'
    });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const customerId = `cust-${Date.now()}`;
  const customerName = [firstName, lastName].filter(Boolean).join(' ') || username;

  const sql = `
    INSERT INTO customers
    (username, email, password, first_name, last_name, customer_id, customer_name, role)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'customer')
  `;

  db.run(
    sql,
    [username, email, hashedPassword, firstName || '', lastName || '', customerId, customerName],
    function (err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({
            success: false,
            message: 'Username or email already exists'
          });
        }
        console.error('Database error:', err);
        return res.status(500).json({
          success: false,
          message: 'Server error'
        });
      }

      const user = {
        id: this.lastID.toString(),
        username,
        email,
        firstName: firstName || '',
        lastName: lastName || '',
        customerId,
        customerName,
        role: 'customer',
        permissions: ['view_dashboard', 'view_vehicles', 'view_reports'],
        isActive: true
      };

      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        success: true,
        message: 'Signup successful',
        token,
        refreshToken: 'refresh-' + token,
        expiresIn: 86400,
        user
      });
    }
  );
});

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required'
    });
  }

  // Query database
  const sql = `SELECT * FROM customers WHERE username = ?`;

  db.get(sql, [username], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }

    if (!row) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Compare passwords
    const passwordMatch = bcrypt.compareSync(password, row.password);

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (row.is_active === 0) {
      return res.status(403).json({
        success: false,
        message: 'User account is inactive'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare user response (exclude password)
    const user = {
      id: row.id.toString(),
      username: row.username,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      customerId: row.customer_id,
      customerName: row.customer_name,
      role: row.role,
      permissions: row.role === 'admin' ? ['*'] : ['view_dashboard', 'view_vehicles', 'view_reports'],
      isActive: row.is_active === 1
    };

    return res.json({
      success: true,
      message: 'Login successful',
      token: token,
      refreshToken: 'refresh-' + token,
      expiresIn: 86400,
      user: user
    });
  });
});

// Forgot password endpoint (mock)
app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  // Check if email exists
  const sql = `SELECT * FROM customers WHERE email = ?`;

  db.get(sql, [email], (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({
        success: false,
        message: 'Server error'
      });
    }

    // Always return success for security (don't reveal if email exists)
    return res.json({
      success: true,
      message: 'If the email exists, a reset link has been sent'
    });
  });
});

// Dashboard KPI endpoint
app.get('/api/dashboard', (req, res) => {
  const today = new Date().toISOString().split('T')[0];

  db.get('SELECT COUNT(*) as total FROM vehicles', (err, totalRow) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });

    db.get(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'INSIDE'`, (err2, insideRow) => {
      db.get(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'PENDING'`, (err3, pendingRow) => {
        db.get(`SELECT COUNT(*) as count FROM vehicles WHERE status = 'EXITED' AND date(exit_time) = date('now')`, (err4, exitedRow) => {
          db.get(`SELECT COALESCE(SUM(net_weight), 0) as weight FROM weight_records WHERE date(recorded_at) = date('now')`, (err5, weightRow) => {
            db.all('SELECT * FROM vehicles ORDER BY entry_time DESC LIMIT 10', (err6, vehicles) => {
              db.all('SELECT * FROM weight_records ORDER BY recorded_at DESC LIMIT 10', (err7, weights) => {
                const inside = insideRow?.count || 0;
                const pending = pendingRow?.count || 0;
                const exited = exitedRow?.count || 0;

                res.json({
                  success: true,
                  summary: {
                    totalVehicles: totalRow?.total || 0,
                    vehicleEntries: totalRow?.total || 0,
                    vehicleExits: exited,
                    pendingApprovals: pending,
                    totalWeight: weightRow?.weight || 0,
                    todayWeight: weightRow?.weight || 0,
                    vehiclesInside: inside,
                    vehiclesExitedToday: exited,
                    pendingVehicles: pending,
                    todaysTotalWeight: weightRow?.weight || 0
                  },
                  recentActivities: (vehicles || []).map((v) => ({
                    id: v.id.toString(),
                    vehicleNumber: v.plate_number,
                    driverName: v.driver_name || '—',
                    entryTime: v.entry_time,
                    exitTime: v.exit_time,
                    status: v.status === 'INSIDE' ? 'Inside' : v.status === 'EXITED' ? 'Exited' : 'Pending',
                    netWeight: v.current_weight || 0
                  })),
                  transactions: (weights || []).map((w) => ({
                    id: w.id.toString(),
                    vehicleNumber: w.plate_number,
                    grossWeight: w.gross_weight,
                    tareWeight: w.tare_weight,
                    netWeight: w.net_weight,
                    ticketNumber: w.ticket_number,
                    transactionDate: w.recorded_at
                  })),
                  vehicleStatus: {
                    labels: ['Inside', 'Exited', 'Pending'],
                    data: [inside, exited, pending],
                    colors: ['#2f4fb5', '#4caf50', '#ff9800']
                  },
                  vehicleTrend: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                      { label: 'Vehicle Entries', data: [42, 48, 45, 55, 52, 38, 41], borderColor: '#2f4fb5', backgroundColor: 'rgba(47,79,181,0.08)', borderWidth: 3, fill: true },
                      { label: 'Vehicle Exits', data: [38, 44, 40, 50, 48, 35, 39], borderColor: '#4caf50', backgroundColor: 'rgba(76,175,80,0.08)', borderWidth: 3, fill: true }
                    ]
                  },
                  weightTrend: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                      { label: 'Daily Weight (Tons)', data: [480, 510, 495, 520, 505, 460, 490], borderColor: '#ff9800', backgroundColor: 'rgba(255,152,0,0.1)', borderWidth: 3, fill: true }
                    ]
                  },
                  liveStatus: getLiveStatus(vehicles || [])
                });
              });
            });
          });
        });
      });
    });
  });
});

function getLiveStatus(vehicles) {
  const current = vehicles.find((v) => v.status === 'INSIDE' || v.status === 'PENDING') || vehicles[0];
  if (!current) {
    return { currentTruck: '—', currentWeight: 0, entryBarrier: 'CLOSED', exitBarrier: 'CLOSED', vehicleStatus: 'Idle' };
  }
  return {
    currentTruck: current.plate_number,
    currentWeight: current.current_weight,
    entryBarrier: current.entry_barrier,
    exitBarrier: current.exit_barrier,
    vehicleStatus: current.status
  };
}

// Vehicle tracking endpoint
app.get('/api/vehicles', (req, res) => {
  db.all('SELECT * FROM vehicles ORDER BY entry_time DESC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({
      success: true,
      data: (rows || []).map((v) => ({
        id: v.id.toString(),
        vehicleNumber: v.plate_number,
        plateNumber: v.plate_number,
        driverName: v.driver_name,
        status: v.status,
        entryTime: v.entry_time,
        exitTime: v.exit_time,
        currentWeight: v.current_weight
      })),
      total: rows?.length || 0
    });
  });
});

// Weight reports endpoint
app.get('/api/reports/weights', (req, res) => {
  db.all('SELECT * FROM weight_records ORDER BY recorded_at DESC', (err, rows) => {
    if (err) return res.status(500).json({ success: false, message: 'Server error' });
    res.json({
      success: true,
      data: (rows || []).map((w) => ({
        id: w.id.toString(),
        vehicleNumber: w.plate_number,
        grossWeight: w.gross_weight,
        tareWeight: w.tare_weight,
        netWeight: w.net_weight,
        ticketNumber: w.ticket_number,
        transactionDate: w.recorded_at
      }))
    });
  });
});

// Live monitoring endpoint
app.get('/api/monitoring/live', (req, res) => {
  db.get(`SELECT * FROM vehicles WHERE status IN ('INSIDE', 'PENDING') ORDER BY entry_time DESC LIMIT 1`, (err, current) => {
    db.all(`SELECT * FROM vehicles WHERE status = 'INSIDE'`, (err2, inside) => {
      res.json({
        success: true,
        currentTruck: current?.plate_number || '—',
        currentWeight: current?.current_weight || 0,
        entryBarrier: current?.entry_barrier || 'CLOSED',
        exitBarrier: current?.exit_barrier || 'CLOSED',
        vehicleStatus: current?.status || 'Idle',
        vehiclesInside: inside?.length || 0
      });
    });
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:4200`);
});
