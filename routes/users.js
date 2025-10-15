const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');
const supabase = require('../config/supabase');

// CREATE user
router.post('/', (req, res) => {
  const { name, email } = req.body;
  db.query(
    'INSERT INTO users (name, email) VALUES (?, ?)',
    [name, email],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ id: result.insertId, name, email });
    }
  );
});

// READ all users
router.get('/', (req, res) => {
  db.query('SELECT id, name, username, email, profile_picture, created_at FROM users', (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// GET single user by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  db.query(
    'SELECT id, name, username, email, profile_picture, created_at FROM users WHERE id = ?',
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      if (rows.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(rows[0]);
    }
  );
});

// UPDATE user profile info
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { name, username } = req.body;

  if (!name || !username) {
    return res.status(400).json({ error: 'Name and username are required' });
  }

  db.query('SELECT id FROM users WHERE username = ? AND id != ?', [username, id], (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (results.length > 0) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    db.query('UPDATE users SET name = ?, username = ? WHERE id = ?', [name, username, id], (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Profile updated successfully' });
    });
  });
});

// ✅ UPDATE user profile picture — SUPABASE VERSION
router.put('/:id/profile-picture', upload.single('profile_picture'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Unique filename for Supabase
    const fileName = `profiles/${Date.now()}-${req.file.originalname}`;

    // Upload to Supabase bucket (must exist, e.g. "uploads")
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to upload image to Supabase' });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(fileName);
    const imageUrl = publicUrlData.publicUrl;

    // Save image URL in MySQL
    db.query('UPDATE users SET profile_picture = ? WHERE id = ?', [imageUrl, id], (err) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Failed to update profile picture' });
      }

      res.json({
        message: 'Profile picture updated successfully',
        profile_picture: imageUrl,
      });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE user profile picture
router.delete('/:id/profile-picture', (req, res) => {
  const { id } = req.params;
  db.query('UPDATE users SET profile_picture = NULL WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Profile picture removed successfully' });
  });
});

module.exports = router;
