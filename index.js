const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

// Import routes
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const booksRoutes = require('./routes/books');
const loansRoutes = require('./routes/loans');
const reservationsRoutes = require('./routes/reservations');

// ALL ROUTES PUBLIC - NO AUTHENTICATION
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/books', booksRoutes);
app.use('/loans', loansRoutes);
app.use('/reservations', reservationsRoutes);

// Public homepage
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:3000`));