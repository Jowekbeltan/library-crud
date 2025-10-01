const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE Reservation
router.post('/', (req, res) => {
  const { user_id, book_id, reservation_date } = req.body;
  db.query(
    'INSERT INTO reservations (user_id, book_id, reservation_date) VALUES (?, ?, ?)',
    [user_id, book_id, reservation_date],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, user_id, book_id, reservation_date, status: 'active' });
    }
  );
});

// READ All Reservations
router.get('/', (req, res) => {
  db.query(
    `SELECT r.id, u.name AS user, b.title AS book, r.reservation_date, r.status
     FROM reservations r
     JOIN users u ON r.user_id = u.id
     JOIN books b ON r.book_id = b.id`,  // Fixed all column and table names
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// UPDATE Reservation
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  db.query(
    'UPDATE reservations SET status=? WHERE id=?',  // Fixed column name
    [status, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Reservation updated' });
    }
  );
});

// DELETE Reservation
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM reservations WHERE id=?', [id], (err, result) => {  // Fixed column name
    if (err) return res.status(500).json(err);
    res.json({ message: 'Reservation deleted' });
  });
});

module.exports = router;