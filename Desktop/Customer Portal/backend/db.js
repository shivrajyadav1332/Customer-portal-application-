const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in the backend directory
const dbPath = path.join(__dirname, 'customerportal.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

function initializeDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS customers (
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
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plate_number TEXT NOT NULL,
        driver_name TEXT,
        status TEXT DEFAULT 'PENDING',
        entry_time TEXT NOT NULL,
        exit_time TEXT,
        current_weight REAL DEFAULT 0,
        entry_barrier TEXT DEFAULT 'CLOSED',
        exit_barrier TEXT DEFAULT 'CLOSED',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS weight_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vehicle_id INTEGER,
        plate_number TEXT NOT NULL,
        gross_weight REAL NOT NULL,
        tare_weight REAL NOT NULL,
        net_weight REAL NOT NULL,
        ticket_number TEXT,
        recorded_at TEXT NOT NULL,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
      )
    `, (err) => {
      if (err) {
        console.error('Error creating operational tables:', err);
      } else {
        console.log('Operational tables ready');
        insertDefaultUsers();
        insertDefaultVehicles();
      }
    });
  });
}

function insertDefaultVehicles() {
  db.get('SELECT COUNT(*) as count FROM vehicles', (err, row) => {
    if (err || row.count > 0) return;

    const now = new Date();
    const hoursAgo = (h) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

    const vehicles = [
      ['ABC-1234', 'Ahmed Al-Rashid', 'INSIDE', hoursAgo(1), null, 28500, 'OPEN', 'CLOSED'],
      ['XYZ-5678', 'Mohammed Hassan', 'EXITED', hoursAgo(4), hoursAgo(3), 31200, 'CLOSED', 'CLOSED'],
      ['KSA-9012', 'Faisal Al-Otaibi', 'PENDING', hoursAgo(0.25), null, 0, 'CLOSED', 'CLOSED'],
      ['YCC-3456', 'Omar Al-Zahrani', 'EXITED', hoursAgo(6), hoursAgo(5), 27800, 'CLOSED', 'CLOSED'],
      ['DEF-7890', 'Khalid Al-Mutairi', 'INSIDE', hoursAgo(2), null, 30100, 'OPEN', 'CLOSED'],
      ['GHI-2468', 'Saeed Al-Ghamdi', 'EXITED', hoursAgo(8), hoursAgo(7), 26500, 'CLOSED', 'CLOSED'],
      ['JKL-1357', 'Yousef Al-Harbi', 'PENDING', hoursAgo(0.1), null, 0, 'CLOSED', 'CLOSED'],
      ['MNO-8642', 'Turki Al-Shehri', 'EXITED', hoursAgo(10), hoursAgo(9), 29400, 'CLOSED', 'CLOSED']
    ];

    const stmt = db.prepare(`
      INSERT INTO vehicles (plate_number, driver_name, status, entry_time, exit_time, current_weight, entry_barrier, exit_barrier)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    vehicles.forEach((v) => stmt.run(...v));
    stmt.finalize(() => {
      const weights = [
        [2, 'XYZ-5678', 42000, 10800, 31200, 'WS-1001', hoursAgo(3)],
        [4, 'YCC-3456', 38500, 10700, 27800, 'WS-1002', hoursAgo(5)],
        [6, 'GHI-2468', 37200, 10700, 26500, 'WS-1003', hoursAgo(7)],
        [8, 'MNO-8642', 40100, 10700, 29400, 'WS-1004', hoursAgo(9)],
        [1, 'ABC-1234', 39200, 10700, 28500, 'WS-1005', hoursAgo(0.5)],
        [5, 'DEF-7890', 40800, 10700, 30100, 'WS-1006', hoursAgo(1.5)]
      ];

      const wStmt = db.prepare(`
        INSERT INTO weight_records (vehicle_id, plate_number, gross_weight, tare_weight, net_weight, ticket_number, recorded_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      weights.forEach((w) => wStmt.run(...w));
      wStmt.finalize();
      console.log('Default vehicle and weight data inserted');
    });
  });
}

function insertDefaultUsers() {
  // Check if users already exist
  db.get('SELECT COUNT(*) as count FROM customers', (err, row) => {
    if (err) {
      console.error('Error checking customers:', err);
      return;
    }

    if (row.count === 0) {
      console.log('Inserting default users...');

      const bcrypt = require('bcryptjs');
      const password = 'Customer@123';
      const hashedPassword = bcrypt.hashSync(password, 10);

      const users = [
        {
          username: 'customer1',
          email: 'customer1@gmail.com',
          password: hashedPassword,
          first_name: 'John',
          last_name: 'Smith',
          customer_id: 'cust-001',
          customer_name: 'John Smith',
          role: 'customer'
        },
        {
          username: 'customer2',
          email: 'customer2@gmail.com',
          password: hashedPassword,
          first_name: 'David',
          last_name: 'Miller',
          customer_id: 'cust-002',
          customer_name: 'David Miller',
          role: 'customer'
        },
        {
          username: 'customer3',
          email: 'customer3@gmail.com',
          password: hashedPassword,
          first_name: 'James',
          last_name: 'Wilson',
          customer_id: 'cust-003',
          customer_name: 'James Wilson',
          role: 'customer'
        },
        {
          username: 'shivrajyadav1395',
          email: 'shivraj@example.com',
          password: hashedPassword,
          first_name: 'Shivraj',
          last_name: 'Yadav',
          customer_id: 'cust-shivraj',
          customer_name: 'Shivraj Yadav',
          role: 'admin'
        }
      ];

      const insertStmt = db.prepare(`
        INSERT INTO customers
        (username, email, password, first_name, last_name, customer_id, customer_name, role)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      users.forEach((user) => {
        insertStmt.run(
          user.username,
          user.email,
          user.password,
          user.first_name,
          user.last_name,
          user.customer_id,
          user.customer_name,
          user.role,
          (err) => {
            if (err) {
              console.error('Error inserting user:', err);
            } else {
              console.log(`User ${user.username} inserted successfully`);
            }
          }
        );
      });

      insertStmt.finalize();
    } else {
      console.log('Users already exist in database');
    }
  });
}

module.exports = db;
