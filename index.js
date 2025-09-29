const express = require('express');
const bodyParser = require('body-parser');
const app = express();

app.use(bodyParser.json());

// Routes
const usersRoutes = require('./routes/users');
const booksRoutes = require('./routes/books');
const loansRoutes = require('./routes/loans');
const reservationsRoutes = require('./routes/reservations');

app.use('/users', usersRoutes);
app.use('/books', booksRoutes);
app.use('/loans', loansRoutes);
app.use('/reservations', reservationsRoutes);

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
