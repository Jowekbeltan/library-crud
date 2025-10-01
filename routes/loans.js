const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE Loan
router.post('/', (req, res) => {
  const { user_id, book_id, loan_date, due_date } = req.body;
  db.query(
    'INSERT INTO loans (user_id, book_id, loan_date, due_date) VALUES (?, ?, ?, ?)',
    [user_id, book_id, loan_date, due_date],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, user_id, book_id, loan_date, due_date });
    }
  );
});

// READ All Loans
router.get('/', (req, res) => {
  db.query(
    `SELECT l.id, u.name AS user, b.title AS book, l.loan_date, l.due_date, l.return_date, l.status
     FROM loans l
     JOIN users u ON l.user_id = u.id
     JOIN books b ON l.book_id = b.id`,  // Fixed all column and table names
    (err, rows) => {
      if (err) return res.status(500).json(err);
      res.json(rows);
    }
  );
});

// UPDATE Loan (mark book as returned)
router.put('/:id/return', (req, res) => {
  const { id } = req.params;
  const { return_date } = req.body;
  db.query(
    'UPDATE loans SET return_date=?, status="returned" WHERE id=?',  // Fixed column names
    [return_date, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Book returned' });
    }
  );
});

// DELETE Loan
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM loans WHERE id=?', [id], (err, result) => {  // Fixed column name
    if (err) return res.status(500).json(err);
    res.json({ message: 'Loan deleted' });
  });
});

module.exports = router;