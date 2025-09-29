const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE Reservation
router.post('/', (req, res) => {
  const { user_id, book_id, reservation_date } = req.body;
  db.query(
    'INSERT INTO Reservations (user_id, book_id, reservation_date, status) VALUES (?, ?, ?, ?)',
    [user_id, book_id, reservation_date, 'Pending'],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, user_id, book_id, reservation_date, status: 'Pending' });
    }
  );
});

// READ All Reservations
router.get('/', (req, res) => {
  db.query(
    `SELECT r.reservation_id, u.full_name AS user, b.title AS book, r.reservation_date, r.status
     FROM Reservations r
     JOIN Users u ON r.user_id = u.user_id
     JOIN Books b ON r.book_id = b.book_id`,
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// UPDATE Reservation (change status)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // Pending, Fulfilled, Cancelled
  db.query(
    'UPDATE Reservations SET status=? WHERE reservation_id=?',
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
  db.query('DELETE FROM Reservations WHERE reservation_id=?', [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Reservation deleted' });
  });
});

module.exports = router;
