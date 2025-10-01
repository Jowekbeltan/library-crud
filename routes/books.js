const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE Book
router.post('/', (req, res) => {
    const { title, author, isbn } = req.body;  // Changed to match table
    db.query(
        'INSERT INTO books (title, author, isbn) VALUES (?, ?, ?)',  // Updated query
        [title, author, isbn],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId, title, author, isbn });
        }
    );
});

// READ ALL Books
router.get('/', (req, res) => {
    db.query('SELECT * FROM books', (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

// SEARCH Books - ADD THIS TO YOUR EXISTING books.js
router.get('/search', (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q}%`;
    const sql = `
        SELECT * FROM books 
        WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?
        ORDER BY title
    `;
    
    db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Search error:', err);
            return res.status(500).json({ error: 'Database search error' });
        }
        res.json(results);
    });
});
// READ Single Book
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM books WHERE id=?', [id], (err, rows) => {
        if (err) return res.status(500).json(err);
        if (rows.length === 0) return res.status(404).json({ message: 'Book not found' });
        res.json(rows[0]);
    });
});

// UPDATE Book
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, isbn } = req.body;  // Changed to match table
    db.query(
        'UPDATE books SET title=?, author=?, isbn=? WHERE id=?',  // Updated query
        [title, author, isbn, id],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: 'Book updated' });
        }
    );
});

// DELETE Book
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM books WHERE id=?', [id], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Book deleted' });
    });
});

module.exports = router;