const express = require('express');
const router = express.Router();
const db = require('../db');

// CREATE Book - FIXED VERSION
router.post('/', (req, res) => {
    console.log('Received book data:', req.body); // Debug log
    
    const { title, author, isbn } = req.body;
    
    // Basic validation
    if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }

    const sql = 'INSERT INTO books (title, author, isbn, status) VALUES (?, ?, ?, "available")';
    
    db.query(sql, [title, author, isbn || null], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to add book to database' });
        }
        
        console.log('Book added successfully, ID:', result.insertId);
        res.json({ 
            message: 'Book added successfully',
            id: result.insertId, 
            title, 
            author, 
            isbn,
            status: 'available'
        });
    });
});

// SEARCH Books
router.get('/search', (req, res) => {
    const { q } = req.query;
    
    if (!q || q.trim() === '') {
        return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = `%${q}%`;
    const sql = 'SELECT * FROM books WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ? ORDER BY title';
    
    db.query(sql, [searchTerm, searchTerm, searchTerm], (err, results) => {
        if (err) {
            console.error('Search error:', err);
            return res.status(500).json({ error: 'Database search error' });
        }
        res.json(results);
    });
});

// READ ALL Books
router.get('/', (req, res) => {
    db.query('SELECT * FROM books ORDER BY title', (err, rows) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// READ Single Book
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT * FROM books WHERE id = ?', [id], (err, rows) => {
        if (err) {
            console.error('Error fetching book:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(rows[0]);
    });
});

// UPDATE Book
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { title, author, isbn, status } = req.body;
    db.query(
        'UPDATE books SET title=?, author=?, isbn=?, status=? WHERE id=?',
        [title, author, isbn, status, id],
        (err, result) => {
            if (err) {
                console.error('Error updating book:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            res.json({ message: 'Book updated successfully' });
        }
    );
});

// DELETE Book
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM books WHERE id=?', [id], (err, result) => {
        if (err) {
            console.error('Error deleting book:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json({ message: 'Book deleted successfully' });
    });
});

module.exports = router;