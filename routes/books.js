const express = require('express');
const router = express.Router();
const db = require('../db');
const { uploadBookCover } = require('../middleware/upload');

// GET all books with filtering
router.get('/', (req, res) => {
    const { category, genre, year, search, sortBy = 'title', sortOrder = 'ASC' } = req.query;
    
    let sql = `
        SELECT b.*, 
               COALESCE(ba.views_count, 0) as views_count,
               COALESCE(ba.borrow_count, 0) as borrow_count
        FROM books b
        LEFT JOIN book_analytics ba ON b.id = ba.book_id
        WHERE 1=1
    `;
    const params = [];

    // Add filters
    if (category) {
        sql += ' AND b.category = ?';
        params.push(category);
    }
    if (genre) {
        sql += ' AND b.genre = ?';
        params.push(genre);
    }
    if (year) {
        sql += ' AND b.published_year = ?';
        params.push(year);
    }
    if (search) {
        sql += ' AND (b.title LIKE ? OR b.author LIKE ? OR b.isbn LIKE ?)';
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
    }

    // Add sorting
    const validSortColumns = ['title', 'author', 'published_year', 'created_at', 'views_count', 'borrow_count'];
    const validSortOrders = ['ASC', 'DESC'];
    
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'title';
    const order = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
    
    sql += ` ORDER BY ${sortColumn} ${order}`;

    db.query(sql, params, (err, rows) => {
        if (err) {
            console.error('Error fetching books:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// GET book categories (for filter dropdown)
router.get('/categories', (req, res) => {
    db.query('SELECT DISTINCT category FROM books WHERE category IS NOT NULL ORDER BY category', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results.map(row => row.category));
    });
});

// GET book genres
router.get('/genres', (req, res) => {
    db.query('SELECT DISTINCT genre FROM books WHERE genre IS NOT NULL ORDER BY genre', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results.map(row => row.genre));
    });
});

// GET publication years
router.get('/years', (req, res) => {
    db.query('SELECT DISTINCT published_year FROM books WHERE published_year IS NOT NULL ORDER BY published_year DESC', (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results.map(row => row.published_year));
    });
});

// CREATE Book with enhanced fields
router.post('/', uploadBookCover.single('cover_image'), (req, res) => {
    const { title, author, category, genre, published_year, isbn, tags } = req.body;
    
    // Validation
    if (!title || !author) {
        return res.status(400).json({ error: 'Title and author are required' });
    }

    const coverImagePath = req.file ? '/uploads/book-covers/' + req.file.filename : null;
    
    // Parse tags if provided
    let tagsArray = [];
    if (tags) {
        try {
            tagsArray = JSON.parse(tags);
        } catch (e) {
            tagsArray = tags.split(',').map(tag => tag.trim());
        }
    }

    const sql = `
        INSERT INTO books (title, author, category, genre, published_year, isbn, cover_image, tags, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, "available")
    `;
    
    db.query(sql, [
        title, author, category || 'General', genre, published_year, 
        isbn || null, coverImagePath, JSON.stringify(tagsArray)
    ], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Failed to add book' });
        }
        
        // Create analytics entry
        db.query('INSERT INTO book_analytics (book_id) VALUES (?)', [result.insertId]);
        
        res.json({ 
            message: 'Book added successfully',
            id: result.insertId,
            title, author, category, genre, published_year, isbn,
            cover_image: coverImagePath,
            tags: tagsArray,
            status: 'available'
        });
    });
});

// UPDATE Book with enhanced fields
router.put('/:id', uploadBookCover.single('cover_image'), (req, res) => {
    const { id } = req.params;
    const { title, author, category, genre, published_year, isbn, tags, status } = req.body;
    
    // Get current book to preserve cover image if not updating
    db.query('SELECT cover_image FROM books WHERE id = ?', [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        const currentCover = results[0].cover_image;
        const coverImagePath = req.file ? '/uploads/book-covers/' + req.file.filename : currentCover;
        
        // Parse tags
        let tagsArray = [];
        if (tags) {
            try {
                tagsArray = JSON.parse(tags);
            } catch (e) {
                tagsArray = tags.split(',').map(tag => tag.trim());
            }
        }
        
        const sql = `
            UPDATE books 
            SET title=?, author=?, category=?, genre=?, published_year=?, isbn=?, cover_image=?, tags=?, status=?
            WHERE id=?
        `;
        
        db.query(sql, [
            title, author, category, genre, published_year, isbn, 
            coverImagePath, JSON.stringify(tagsArray), status, id
        ], (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Book updated successfully' });
        });
    });
});

// Record book view (for analytics)
router.post('/:id/view', (req, res) => {
    const { id } = req.params;
    
    db.query(`
        INSERT INTO book_analytics (book_id, views_count, borrow_count) 
        VALUES (?, 1, 0) 
        ON DUPLICATE KEY UPDATE views_count = views_count + 1
    `, [id], (err, result) => {
        if (err) console.error('Analytics error:', err);
        res.json({ message: 'View recorded' });
    });
});

// GET book analytics
router.get('/analytics/popular', (req, res) => {
    const { limit = 10 } = req.query;
    
    db.query(`
        SELECT b.*, ba.views_count, ba.borrow_count
        FROM books b
        JOIN book_analytics ba ON b.id = ba.book_id
        ORDER BY ba.views_count DESC
        LIMIT ?
    `, [parseInt(limit)], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});
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