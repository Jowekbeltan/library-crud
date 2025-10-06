const express = require('express');
const router = express.Router();
const db = require('../db');
const notificationService = require('../services/notificationService');

// GET all notifications (admin)
router.get('/', (req, res) => {
    const sql = `
        SELECT n.*, u.name as user_name, b.title as book_title
        FROM notifications n
        JOIN users u ON n.user_id = u.id
        JOIN books b ON n.book_id = b.id
        ORDER BY n.sent_at DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// GET user's notifications
router.get('/user/:userId', (req, res) => {
    const { userId } = req.params;
    
    const sql = `
        SELECT n.*, b.title as book_title
        FROM notifications n
        JOIN books b ON n.book_id = b.id
        WHERE n.user_id = ?
        ORDER BY n.sent_at DESC
        LIMIT 50
    `;
    
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

// Send manual notification
router.post('/send', async (req, res) => {
    const { userId, bookId, type } = req.body;
    
    try {
        const result = await notificationService.sendManualNotification(userId, bookId, type);
        
        if (result.success) {
            res.json({ message: 'Notification sent successfully', result });
        } else {
            res.status(500).json({ error: 'Failed to send notification', details: result.error });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get notification statistics
router.get('/stats', (req, res) => {
    const sql = `
        SELECT 
            type,
            status,
            COUNT(*) as count,
            DATE(sent_at) as date
        FROM notifications 
        WHERE sent_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        GROUP BY type, status, DATE(sent_at)
        ORDER BY date DESC
    `;
    
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        res.json(results);
    });
});

module.exports = router;