const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const app = express();

app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static('public'));

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { validateBook } = require('./middleware/validation');

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const booksRoutes = require('./routes/books');
const loansRoutes = require('./routes/loans');
const reservationsRoutes = require('./routes/reservations');

// Public routes (no authentication needed)
app.use('/auth', authRoutes);

// Protected routes (require authentication)
app.use('/users', authenticateToken, usersRoutes);
app.use('/books', authenticateToken, booksRoutes); // Add validateBook if you want validation on all book routes
app.use('/loans', authenticateToken, loansRoutes);
app.use('/reservations', authenticateToken, reservationsRoutes);

// Public homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));