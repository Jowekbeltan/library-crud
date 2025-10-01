// Navigation
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section and activate button
    document.getElementById(sectionName + '-section').classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the section
    loadSectionData(sectionName);
}

// Load data based on section
function loadSectionData(section) {
    switch(section) {
        case 'books':
            loadBooks();
            break;
        case 'users':
            loadUsers();
            break;
        case 'loans':
            loadLoans();
            break;
        case 'reservations':
            loadReservations();
            break;
    }
}

// Books Management
async function loadBooks() {
    try {
        const response = await fetch('/books');
        const books = await response.json();
        
        const booksList = document.getElementById('books-list');
        const booksCount = document.getElementById('books-count');
        
        booksCount.textContent = books.length;
        booksList.innerHTML = '';
        
        books.forEach(book => {
            booksList.innerHTML += `
                <div class="card">
                    <h4>${book.title}</h4>
                    <p><strong>Author:</strong> ${book.author}</p>
                    <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
                    <p><strong>Status:</strong> 
                        <span class="status-${book.status}">${book.status}</span>
                    </p>
                    <p><strong>Added:</strong> ${new Date(book.created_at).toLocaleDateString()}</p>
                    <div class="card-actions">
                        <button class="delete" onclick="deleteBook(${book.id})">Delete</button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Add Book Form Handler
document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const isbn = document.getElementById('isbn').value;
    
    try {
        const response = await fetch('/books', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: title,
                author: author,
                isbn: isbn
            })
        });
        
        if (response.ok) {
            // Clear form
            document.getElementById('add-book-form').reset();
            // Reload books
            loadBooks();
        } else {
            alert('Error adding book');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding book');
    }
});

// Delete Book
async function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        try {
            const response = await fetch(`/books/${bookId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                loadBooks(); // Reload the list
            } else {
                alert('Error deleting book');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting book');
        }
    }
}

// Users Management
async function loadUsers() {
    try {
        const response = await fetch('/users');
        const users = await response.json();
        
        const usersList = document.getElementById('users-list');
        usersList.innerHTML = '';
        
        users.forEach(user => {
            usersList.innerHTML += `
                <div class="card">
                    <h4>${user.name}</h4>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Member since:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Loans Management
async function loadLoans() {
    try {
        const response = await fetch('/loans');
        const loans = await response.json();
        
        const loansList = document.getElementById('loans-list');
        loansList.innerHTML = '';
        
        loans.forEach(loan => {
            loansList.innerHTML += `
                <div class="card">
                    <h4>${loan.book} - ${loan.user}</h4>
                    <p><strong>Loan Date:</strong> ${new Date(loan.loan_date).toLocaleDateString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(loan.due_date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${loan.status}</p>
                    ${loan.return_date ? 
                        `<p><strong>Returned:</strong> ${new Date(loan.return_date).toLocaleDateString()}</p>` : 
                        `<button onclick="returnBook(${loan.id})">Mark Returned</button>`
                    }
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading loans:', error);
    }
}

// Reservations Management
async function loadReservations() {
    try {
        const response = await fetch('/reservations');
        const reservations = await response.json();
        
        const reservationsList = document.getElementById('reservations-list');
        reservationsList.innerHTML = '';
        
        reservations.forEach(reservation => {
            reservationsList.innerHTML += `
                <div class="card">
                    <h4>${reservation.book} - ${reservation.user}</h4>
                    <p><strong>Reservation Date:</strong> ${new Date(reservation.reservation_date).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> ${reservation.status}</p>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error loading reservations:', error);
    }
}

// Return Book Function
async function returnBook(loanId) {
    try {
        const response = await fetch(`/loans/${loanId}/return`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                return_date: new Date().toISOString().split('T')[0]
            })
        });
        
        if (response.ok) {
            loadLoans(); // Reload loans
        }
    } catch (error) {
        console.error('Error returning book:', error);
    }
}

// Load books when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
});
// Authentication state
let currentUser = null;
let authToken = null;

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Authentication functions
async function login(email, password) {
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.token;
            currentUser = data.user;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateUIForAuth();
            closeModals();
            loadBooks();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed');
    }
}

async function signup(name, email, password) {
    try {
        const response = await fetch('/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Account created successfully! Please login.');
            showLogin();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed');
    }
}

function checkAuthStatus() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUIForAuth();
        loadBooks();
    } else {
        showLogin();
    }
}

function updateUIForAuth() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-info').style.display = 'block';
        // Show management sections
        document.querySelector('nav').style.display = 'flex';
    } else {
        document.getElementById('user-info').style.display = 'none';
        document.querySelector('nav').style.display = 'none';
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    updateUIForAuth();
    showLogin();
}

// Modal functions
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showSignup() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'block';
}

function closeModals() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'none';
}

// Search functionality
async function searchBooks(query) {
    try {
        const response = await fetch(`/books/search?q=${encodeURIComponent(query)}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            const books = await response.json();
            displaySearchResults(books);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

// Update your existing API calls to include authentication headers
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

// Update all your fetch calls to use getAuthHeaders()
// Example for loadBooks:
async function loadBooks() {
    if (!authToken) return;
    
    try {
        const response = await fetch('/books', {
            headers: getAuthHeaders()
        });
        // ... rest of your existing loadBooks code
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

// Add event listeners for login/signup forms
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    await login(email, password);
});

document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    await signup(name, email, password);
});

// Close modals when clicking X
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModals);
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModals();
    }
});
// Dashboard Functions
async function loadDashboard() {
    if (!authToken) return;
    
    try {
        // Load all data in parallel for better performance
        const [books, users, loans, reservations] = await Promise.all([
            fetch('/books', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/users', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/loans', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/reservations', { headers: getAuthHeaders() }).then(r => r.json())
        ]);
        
        updateDashboardStats(books, users, loans, reservations);
        displayAvailableBooks(books);
        displayRecentReservations(reservations);
        displayRecentUsers(users);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateDashboardStats(books, users, loans, reservations) {
    // Calculate statistics
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.status === 'available').length;
    const borrowedBooks = books.filter(book => book.status === 'borrowed').length;
    const totalUsers = users.length;
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    const totalReservations = reservations.length;
    
    // Update stat cards
    document.getElementById('total-books').textContent = totalBooks;
    document.getElementById('available-books').textContent = availableBooks;
    document.getElementById('borrowed-books').textContent = borrowedBooks;
    document.getElementById('total-users').textContent = totalUsers;
    document.getElementById('active-loans').textContent = activeLoans;
    document.getElementById('total-reservations').textContent = totalReservations;
}

function displayAvailableBooks(books) {
    const container = document.getElementById('available-books-list');
    const availableBooks = books
        .filter(book => book.status === 'available')
        .slice(0, 50); // Show latest 50 available books
    
    if (availableBooks.length === 0) {
        container.innerHTML = '<p class="mini-card">No available books</p>';
        return;
    }
    
    container.innerHTML = availableBooks.map(book => `
        <div class="mini-card">
            <h4>${book.title}</h4>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
            <span class="status-badge status-available">Available</span>
        </div>
    `).join('');
}

function displayRecentReservations(reservations) {
    const container = document.getElementById('reservations-list');
    const recentReservations = reservations
        .slice(0, 10) // Show latest 10 reservations
    
    if (recentReservations.length === 0) {
        container.innerHTML = '<p class="mini-card">No reservations</p>';
        return;
    }
    
    container.innerHTML = recentReservations.map(reservation => `
        <div class="mini-card">
            <h4>${reservation.book}</h4>
            <p><strong>User:</strong> ${reservation.user}</p>
            <p><strong>Date:</strong> ${new Date(reservation.reservation_date).toLocaleDateString()}</p>
            <span class="status-badge status-reserved">${reservation.status}</span>
        </div>
    `).join('');
}

function displayRecentUsers(users) {
    const container = document.getElementById('recent-users-list');
    const recentUsers = users
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 10); // Show latest 10 users
    
    if (recentUsers.length === 0) {
        container.innerHTML = '<p class="mini-card">No users</p>';
        return;
    }
    
    container.innerHTML = recentUsers.map(user => `
        <div class="mini-card">
            <h4>${user.name}</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Joined:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// Update the showSection function to handle dashboard
function showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section and activate button
    document.getElementById(sectionName + '-section').classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the section
    loadSectionData(sectionName);
}

// Update loadSectionData to include dashboard
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'books':
            loadBooks();
            break;
        case 'users':
            loadUsers();
            break;
        case 'loans':
            loadLoans();
            break;
        case 'reservations':
            loadReservations();
            break;
    }
}

// Update the DOMContentLoaded to start with dashboard
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    // Load dashboard by default when authenticated
    if (currentUser) {
        loadDashboard();
    }
});
// Dashboard Functions - DEBUG VERSION
async function loadDashboard() {
    if (!authToken) {
        console.log('No auth token - user not logged in');
        showLogin();
        return;
    }
    
    console.log('Loading dashboard with token:', authToken.substring(0, 20) + '...');
    
    try {
        // Test each endpoint individually to see which one fails
        console.log('Testing /books endpoint...');
        const booksResponse = await fetch('/books', { 
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Books response status:', booksResponse.status);
        
        if (!booksResponse.ok) {
            throw new Error(`Books API failed: ${booksResponse.status} ${booksResponse.statusText}`);
        }
        
        const books = await booksResponse.json();
        console.log('Books loaded:', books.length, 'books');
        
        // Test users endpoint
        console.log('Testing /users endpoint...');
        const usersResponse = await fetch('/users', { 
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('Users response status:', usersResponse.status);
        
        if (!usersResponse.ok) {
            throw new Error(`Users API failed: ${usersResponse.status} ${usersResponse.statusText}`);
        }
        
        const users = await usersResponse.json();
        console.log('Users loaded:', users.length, 'users');

        // Test loans endpoint
        console.log('Testing /loans endpoint...');
        const loansResponse = await fetch('/loans', { 
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        const loans = loansResponse.ok ? await loansResponse.json() : [];
        console.log('Loans loaded:', loans.length, 'loans');

        // Test reservations endpoint  
        console.log('Testing /reservations endpoint...');
        const reservationsResponse = await fetch('/reservations', { 
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });
        const reservations = reservationsResponse.ok ? await reservationsResponse.json() : [];
        console.log('Reservations loaded:', reservations.length, 'reservations');

        // Update dashboard with the data we successfully loaded
        updateDashboardStats(books, users, loans, reservations);
        displayAvailableBooks(books);
        displayRecentReservations(reservations);
        displayRecentUsers(users);
        
    } catch (error) {
        console.error('Dashboard loading error:', error);
        document.getElementById('available-books-list').innerHTML = 
            `<p class="mini-card" style="color: red;">Error: ${error.message}</p>`;
    }
}
// Profile Functions
async function loadProfile() {
    if (!currentUser) return;
    
    try {
        // Update basic profile info
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('member-since').textContent = 'Recently'; // You can enhance this with actual user data
        
        // Load user-specific data
        const [loans, reservations] = await Promise.all([
            fetch('/loans', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/reservations', { headers: getAuthHeaders() }).then(r => r.json())
        ]);
        
        // Calculate user stats
        const userLoans = loans.filter(loan => loan.user === currentUser.name);
        const userReservations = reservations.filter(res => res.user === currentUser.name);
        const activeReservations = userReservations.filter(res => res.status === 'active');
        
        document.getElementById('books-borrowed').textContent = userLoans.length;
        document.getElementById('active-reservations').textContent = activeReservations.length;
        
        // Display recent activity
        displayUserActivity(userLoans, userReservations);
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function displayUserActivity(loans, reservations) {
    const activityContainer = document.getElementById('user-activity');
    
    // Combine and sort activities by date
    const activities = [
        ...loans.map(loan => ({
            type: 'loan',
            title: `Borrowed "${loan.book}"`,
            date: loan.loan_date,
            recent: isRecent(loan.loan_date)
        })),
        ...reservations.map(res => ({
            type: 'reservation', 
            title: `Reserved "${res.book}"`,
            date: res.reservation_date,
            recent: isRecent(res.reservation_date)
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
     .slice(0, 10); // Show latest 10 activities
    
    if (activities.length === 0) {
        activityContainer.innerHTML = '<p>No recent activity</p>';
        return;
    }
    
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item ${activity.recent ? 'recent' : 'old'}">
            <h4>${activity.title}</h4>
            <p>${new Date(activity.date).toLocaleDateString()} • ${activity.type === 'loan' ? '📖 Loan' : '📅 Reservation'}</p>
        </div>
    `).join('');
}

function isRecent(dateString) {
    const activityDate = new Date(dateString);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return activityDate > sevenDaysAgo;
}

function changePassword() {
    alert('Password change feature coming soon!');
    // You can implement a password change modal here
}

// Update loadSectionData to include profile
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'books':
            loadBooks();
            break;
        case 'users':
            loadUsers();
            break;
        case 'loans':
            loadLoans();
            break;
        case 'reservations':
            loadReservations();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}