const express = require('express');
const router = express.Router();
const db = require('../db');
const barcodeService = require('../services/barcodeService');

// Generate QR code for a book
router.get('/book/:id/qr', async (req, res) => {
    try {
        const { id } = req.params;
        const { width = 200, height = 200 } = req.query;
        
        const [books] = await db.promise().query('SELECT * FROM books WHERE id = ?', [id]);
        
        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        const book = books[0];
        const qrCode = await barcodeService.generateQRCode(book, { width: parseInt(width), height: parseInt(height) });
        
        // Return as image
        const base64Data = qrCode.replace(/^data:image\/png;base64,/, "");
        const imgBuffer = Buffer.from(base64Data, 'base64');
        
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imgBuffer.length
        });
        res.end(imgBuffer);
        
    } catch (error) {
        console.error('QR code generation error:', error);
        res.status(500).json({ error: 'Failed to generate QR code' });
    }
});

// Generate barcode for ISBN
router.get('/barcode/:isbn', async (req, res) => {
    try {
        const { isbn } = req.params;
        const { width = 300, height = 100 } = req.query;
        
        if (!isbn) {
            return res.status(400).json({ error: 'ISBN required' });
        }
        
        const barcode = await barcodeService.generateBarcode(isbn, { 
            width: parseInt(width), 
            height: parseInt(height) 
        });
        
        const base64Data = barcode.replace(/^data:image\/png;base64,/, "");
        const imgBuffer = Buffer.from(base64Data, 'base64');
        
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': imgBuffer.length
        });
        res.end(imgBuffer);
        
    } catch (error) {
        console.error('Barcode generation error:', error);
        res.status(500).json({ error: 'Failed to generate barcode' });
    }
});

// Get book label (QR + Barcode)
router.get('/book/:id/label', async (req, res) => {
    try {
        const { id } = req.params;
        
        const [books] = await db.promise().query('SELECT * FROM books WHERE id = ?', [id]);
        
        if (books.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        
        const book = books[0];
        const label = await barcodeService.generateBookLabel(book);
        
        res.json(label);
        
    } catch (error) {
        console.error('Book label generation error:', error);
        res.status(500).json({ error: 'Failed to generate book label' });
    }
});

// Bulk generate labels for multiple books
router.post('/bulk-labels', async (req, res) => {
    try {
        const { bookIds } = req.body;
        
        if (!bookIds || !Array.isArray(bookIds)) {
            return res.status(400).json({ error: 'Book IDs array required' });
        }
        
        const placeholders = bookIds.map(() => '?').join(',');
        const [books] = await db.promise().query(`SELECT * FROM books WHERE id IN (${placeholders})`, bookIds);
        
        const labels = [];
        for (const book of books) {
            try {
                const label = await barcodeService.generateBookLabel(book);
                labels.push(label);
            } catch (error) {
                console.error(`Failed to generate label for book ${book.id}:`, error);
                labels.push({ error: `Failed to generate label for ${book.title}`, bookId: book.id });
            }
        }
        
        res.json({ labels, total: labels.length });
        
    } catch (error) {
        console.error('Bulk label generation error:', error);
        res.status(500).json({ error: 'Failed to generate bulk labels' });
    }
});

module.exports = router;