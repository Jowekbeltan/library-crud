const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE user
router.post('/', (req, res) => {
  const { full_name, email, phone, role } = req.body;
  db.query(
    'INSERT INTO Users (full_name, email, phone, role) VALUES (?, ?, ?, ?)',
    [full_name, email, phone, role],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, full_name, email, phone, role });
    }
  );
});

// READ all users
router.get('/', (req, res) => {
  db.query('SELECT * FROM Users', (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

module.exports = router;
