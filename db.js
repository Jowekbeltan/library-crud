const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'John*8878',
  database: process.env.DB_NAME || 'library_management',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed: ', err);
    return;
  }
  console.log('Database connected successfully');
  connection.release();
});

module.exports = pool.promise(); // Use promise-based for async/await