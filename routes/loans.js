const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE Loan (User borrows a book)
router.post('/', (req, res) => {
  const { user_id, book_id, loan_date, due_date } = req.body;
  db.query(
    'INSERT INTO Loans (user_id, book_id, loan_date, due_date) VALUES (?, ?, ?, ?)',
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
    `SELECT l.loan_id, u.full_name AS user, b.title AS book, l.loan_date, l.due_date, l.return_date
     FROM Loans l
     JOIN Users u ON l.user_id = u.user_id
     JOIN Books b ON l.book_id = b.book_id`,
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
    'UPDATE Loans SET return_date=? WHERE loan_id=?',
    [return_date, id],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: 'Book returned' });
    }
  );
});

// DELETE Loan (remove record)
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM Loans WHERE loan_id=?', [id], (err, result) => {
    if (err) return res.status(500).json(err);
    res.json({ message: 'Loan deleted' });
  });
});

module.exports = router;
