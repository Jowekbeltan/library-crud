const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');
const path = require('path');


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

// GET all users
router.get('/', (req, res) => {
    db.query('SELECT id, name, username, email, profile_picture, created_at FROM users', (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(rows);
    });
});

// GET single user by ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.query('SELECT id, name, username, email, profile_picture, created_at FROM users WHERE id = ?', [id], (err, rows) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(rows[0]);
    });
});

// UPDATE user profile (name, username)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { name, username } = req.body;

    // Validate input
    if (!name || !username) {
        return res.status(400).json({ error: 'Name and username are required' });
    }

    // Check if username is already taken by another user
    db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        
        if (results.length > 0) {
            return res.status(400).json({ error: 'Username already taken' });
        }

        // Update user
        db.query('UPDATE users SET name = ?, username = ? WHERE id = ?', 
            [name, username, id], 
            (err, result) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.json({ message: 'Profile updated successfully' });
            }
        );
    });
});

// UPDATE user profile picture
router.put('/:id/profile-picture', upload.single('profile_picture'), (req, res) => {
    const { id } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct the file path relative to public folder
    const profilePicturePath = '/uploads/profiles/' + req.file.filename;

    // Update user's profile picture in database
    db.query('UPDATE users SET profile_picture = ? WHERE id = ?', 
        [profilePicturePath, id], 
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to update profile picture' });
            }
            
            res.json({ 
                message: 'Profile picture updated successfully',
                profile_picture: profilePicturePath 
            });
        }
    );
});

// DELETE user profile picture
router.delete('/:id/profile-picture', (req, res) => {
    const { id } = req.params;

    // Set profile_picture to NULL in database
    db.query('UPDATE users SET profile_picture = NULL WHERE id = ?', 
        [id], 
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Profile picture removed successfully' });
        }
    );
});

module.exports = router;