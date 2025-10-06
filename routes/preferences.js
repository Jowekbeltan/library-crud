const express = require('express');
const router = express.Router();
const db = require('../db');
const upload = require('../middleware/upload');
const path = require('path');

// GET user preferences
router.get('/:user_id', (req, res) => {
    const { user_id } = req.params;
    
    db.query('SELECT * FROM user_preferences WHERE user_id = ?', [user_id], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        
        if (results.length === 0) {
            // Create default preferences if none exist
            const defaultPrefs = {
                user_id: parseInt(user_id),
                background_wallpaper: null,
                theme: 'light'
            };
            
            db.query('INSERT INTO user_preferences SET ?', defaultPrefs, (err, result) => {
                if (err) return res.status(500).json({ error: 'Database error' });
                res.json({ ...defaultPrefs, id: result.insertId });
            });
        } else {
            res.json(results[0]);
        }
    });
});

// UPDATE background wallpaper
router.put('/:user_id/wallpaper', upload.single('wallpaper'), (req, res) => {
    const { user_id } = req.params;
    
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const wallpaperPath = '/uploads/wallpapers/' + req.file.filename;

    db.query('UPDATE user_preferences SET background_wallpaper = ? WHERE user_id = ?', 
        [wallpaperPath, user_id], 
        (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Failed to update wallpaper' });
            }
            
            res.json({ 
                message: 'Wallpaper updated successfully',
                background_wallpaper: wallpaperPath 
            });
        }
    );
});

// UPDATE theme (light/dark)
router.put('/:user_id/theme', (req, res) => {
    const { user_id } = req.params;
    const { theme } = req.body;

    if (!['light', 'dark'].includes(theme)) {
        return res.status(400).json({ error: 'Theme must be light or dark' });
    }

    db.query('UPDATE user_preferences SET theme = ? WHERE user_id = ?', 
        [theme, user_id], 
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Theme updated successfully', theme });
        }
    );
});

// RESET to default wallpaper
router.delete('/:user_id/wallpaper', (req, res) => {
    const { user_id } = req.params;

    db.query('UPDATE user_preferences SET background_wallpaper = NULL WHERE user_id = ?', 
        [user_id], 
        (err, result) => {
            if (err) return res.status(500).json({ error: 'Database error' });
            res.json({ message: 'Wallpaper reset to default' });
        }
    );
});

module.exports = router;