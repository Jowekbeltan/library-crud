const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE user
router.post('/', (req, res) => {
  const { name, email } = req.body;  // Changed from full_name to name
  db.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',  // Fixed table and column names
    [name, email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, name, email });
    }
  );
});

// READ all users
router.get('/', (req, res) => {
  db.query('SELECT * FROM users', (err, rows) => {  // Fixed table name
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

module.exports = router;