// Root route - Add this before your other routes
app.get('/', (req, res) => {
    res.send(`
        <h1>Library CRUD API</h1>
        <p>Server is running successfully! 🎉</p>
        <h2>Available Routes:</h2>
        <ul>
            <li><a href="/books">/books</a> - Books API (GET, POST, PUT, DELETE)</li>
            <li><a href="/users">/users</a> - Users API</li>
            <li><a href="/loans">/loans</a> - Loans API</li>
            <li><a href="/reservations">/reservations</a> - Reservations API</li>
        </ul>
        <h3>Test Books API:</h3>
        <p>Visit <a href="/books">/books</a> to see all books</p>
    `);
});