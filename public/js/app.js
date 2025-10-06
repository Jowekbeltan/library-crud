// Authentication state
let currentUser = null;
let authToken = null;

// Navigation - UPDATED VERSION
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
    const sectionId = sectionName.includes('-section') ? sectionName : sectionName + '-section';
    document.getElementById(sectionId).classList.add('active');
    
    // Find and activate the correct nav button
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        if (btn.textContent.includes(getButtonText(sectionName))) {
            btn.classList.add('active');
        }
    });
    
    // Load data for the section
    loadSectionData(sectionName.replace('-section', ''));
}

// Helper function to match button text
function getButtonText(sectionName) {
    const buttonMap = {
        'dashboard': '📊 Dashboard',
        'books': '📚 Books', 
        'users': '👥 Users',
        'loans': '📖 Loans',
        'reservations': '📅 Reservations',
        'profile': '👤 Profile'
    };
    return buttonMap[sectionName] || sectionName;
}

// Load data based on section
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
            loadDashboard();
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

// Auto-login without token - UPDATED VERSION
function checkAuthStatus() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        updateUIForAuth();
        loadDashboard();
    } else {
        // Demo auto-login with profile data
        currentUser = { 
            name: 'Lib', 
            email: 'adm',
            username: 'library_',
            id: 1 
        };
        updateUIForAuth();
        loadDashboard();
        
        // Pre-fill profile form with user data
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-username').value = currentUser.username;
        document.getElementById('edit-email').value = currentUser.email;
    }
}

function updateUIForAuth() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-info').style.display = 'block';
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

// No authentication required
function getAuthHeaders() {
    return {
        'Content-Type': 'application/json'
        // No Authorization header
    };
}

// Dashboard Functions
async function loadDashboard() {
    if (!authToken) {
        console.log('No auth token - using demo data');
        // Load demo data instead
        loadDemoDashboard();
        return;
    }
    
    console.log('Loading dashboard...');
    
    try {
        // Load all data
        const [books, users, loans, reservations] = await Promise.all([
            fetch('/books', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/users', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/loans', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/reservations', { headers: getAuthHeaders() }).then(r => r.json())
        ]);
        
        console.log('Dashboard data loaded:', { 
            books: books.length, 
            users: users.length, 
            loans: loans.length, 
            reservations: reservations.length 
        });
        
        updateDashboardStats(books, users, loans, reservations);
        displayAvailableBooks(books);
        displayRecentReservations(reservations);
        displayRecentUsers(users);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Fallback to demo data
        loadDemoDashboard();
    }
}

// Demo dashboard data
function loadDemoDashboard() {
    console.log('Loading demo dashboard data...');
    
    // Mock data
    const demoBooks = [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', status: 'available' },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'available' },
        { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', status: 'borrowed' },
        { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', status: 'available' }
    ];
    
    const demoUsers = [
        { id: 1, name: 'John Smith', email: 'john@email.com', created_at: '2024-01-15' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', created_at: '2024-02-20' },
        { id: 3, name: 'Mike Brown', email: 'mike@email.com', created_at: '2024-03-10' }
    ];
    
    const demoLoans = [
        { id: 1, book: '1984', user: 'John Smith', loan_date: '2024-03-01', due_date: '2024-03-15', status: 'active' }
    ];
    
    const demoReservations = [
        { id: 1, book: 'The Catcher in the Rye', user: 'Sarah Johnson', reservation_date: '2024-03-12', status: 'active' }
    ];
    
    updateDashboardStats(demoBooks, demoUsers, demoLoans, demoReservations);
    displayAvailableBooks(demoBooks);
    displayRecentReservations(demoReservations);
    displayRecentUsers(demoUsers);
}

function updateDashboardStats(books, users, loans, reservations) {
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.status === 'available').length;
    const borrowedBooks = books.filter(book => book.status === 'borrowed').length;
    const totalUsers = users.length;
    const activeLoans = loans.filter(loan => loan.status === 'active').length;
    const totalReservations = reservations.length;
    
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
        .slice(0, 50);
    
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
    const recentReservations = reservations.slice(0, 10);
    
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
        .slice(0, 10);
    
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

// Books Management
async function loadBooks() {
    if (!authToken) {
        console.log('Not authenticated, loading demo books');
        loadDemoBooks();
        return;
    }
    
    try {
        const response = await fetch('/books', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`Failed to load books: ${response.status}`);
        }
        
        const books = await response.json();
        displayBooks(books);
        
    } catch (error) {
        console.error('Error loading books:', error);
        loadDemoBooks();
    }
}

function loadDemoBooks() {
    const demoBooks = [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', status: 'available', created_at: '2024-01-15' },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'available', created_at: '2024-01-20' },
        { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', status: 'borrowed', created_at: '2024-02-01' },
        { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', status: 'available', created_at: '2024-02-15' },
        { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769174', status: 'available', created_at: '2024-03-01' }
    ];
    
    displayBooks(demoBooks);
}

function displayBooks(books) {
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
}

// Add Book Form Handler
document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('isbn').value.trim();
    
    if (!title || !author) {
        alert('Please enter both title and author');
        return;
    }
    
    console.log('Adding book:', { title, author, isbn });
    
    if (!authToken) {
        // Demo mode - just reload books to show the form was submitted
        alert('Book added successfully! (Demo mode)');
        document.getElementById('add-book-form').reset();
        loadBooks();
        return;
    }
    
    try {
        const response = await fetch('/books', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title: title,
                author: author,
                isbn: isbn || null
            })
        });
        
        const result = await response.json();
        console.log('Server response:', result);
        
        if (response.ok) {
            document.getElementById('add-book-form').reset();
            alert('Book added successfully!');
            loadBooks();
        } else {
            alert('Error adding book: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error: Could not connect to server');
    }
});

// Delete Book
async function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        if (!authToken) {
            // Demo mode
            alert('Book deleted successfully! (Demo mode)');
            loadBooks();
            return;
        }
        
        try {
            const response = await fetch(`/books/${bookId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            });
            
            if (response.ok) {
                loadBooks();
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
        if (!authToken) {
            loadDemoUsers();
            return;
        }
        
        const response = await fetch('/users', {
            headers: getAuthHeaders()
        });
        const users = await response.json();
        displayUsers(users);
        
    } catch (error) {
        console.error('Error loading users:', error);
        loadDemoUsers();
    }
}

function loadDemoUsers() {
    const demoUsers = [
        { id: 1, name: 'John Smith', email: 'john@email.com', created_at: '2024-01-15' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', created_at: '2024-02-20' },
        { id: 3, name: 'Mike Brown', email: 'mike@email.com', created_at: '2024-03-10' },
        { id: 4, name: 'Emily Davis', email: 'emily@email.com', created_at: '2024-03-12' }
    ];
    
    displayUsers(demoUsers);
}

function displayUsers(users) {
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
}

// Loans Management
async function loadLoans() {
    try {
        if (!authToken) {
            loadDemoLoans();
            return;
        }
        
        const response = await fetch('/loans', {
            headers: getAuthHeaders()
        });
        const loans = await response.json();
        displayLoans(loans);
        
    } catch (error) {
        console.error('Error loading loans:', error);
        loadDemoLoans();
    }
}

function loadDemoLoans() {
    const demoLoans = [
        { id: 1, book: '1984', user: 'John Smith', loan_date: '2024-03-01', due_date: '2024-03-15', status: 'active' },
        { id: 2, book: 'The Great Gatsby', user: 'Sarah Johnson', loan_date: '2024-02-20', due_date: '2024-03-05', status: 'returned', return_date: '2024-03-04' }
    ];
    
    displayLoans(demoLoans);
}

function displayLoans(loans) {
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
}

// Reservations Management
async function loadReservations() {
    try {
        if (!authToken) {
            loadDemoReservations();
            return;
        }
        
        const response = await fetch('/reservations', {
            headers: getAuthHeaders()
        });
        const reservations = await response.json();
        displayReservations(reservations);
        
    } catch (error) {
        console.error('Error loading reservations:', error);
        loadDemoReservations();
    }
}

function loadDemoReservations() {
    const demoReservations = [
        { id: 1, book: 'The Catcher in the Rye', user: 'Sarah Johnson', reservation_date: '2024-03-12', status: 'active' },
        { id: 2, book: 'Pride and Prejudice', user: 'Mike Brown', reservation_date: '2024-03-10', status: 'completed' }
    ];
    
    displayReservations(demoReservations);
}

function displayReservations(reservations) {
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
}

// Return Book Function
async function returnBook(loanId) {
    if (!authToken) {
        // Demo mode
        alert('Book returned successfully! (Demo mode)');
        loadLoans();
        return;
    }
    
    try {
        const response = await fetch(`/loans/${loanId}/return`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                return_date: new Date().toISOString().split('T')[0]
            })
        });
        
        if (response.ok) {
            loadLoans();
        }
    } catch (error) {
        console.error('Error returning book:', error);
    }
}

// Profile Functions - UPDATED VERSION
async function loadProfile() {
    if (!currentUser) return;
    
    try {
        // Update profile display with current user data
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-username').textContent = '@' + currentUser.username;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('member-since').textContent = new Date().toLocaleDateString();
        
        // Update form fields
        document.getElementById('edit-name').value = currentUser.name;
        document.getElementById('edit-username').value = currentUser.username;
        document.getElementById('edit-email').value = currentUser.email;
        
        // Load user stats (mock data for demo)
        document.getElementById('books-borrowed').textContent = '12';
        document.getElementById('active-reservations').textContent = '3';
        
        // Display mock activity
        displayMockActivity();
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

// Mock activity data for demo
function displayMockActivity() {
    const activities = [
        { type: 'loan', title: 'Borrowed "The Great Gatsby"', date: new Date(), recent: true },
        { type: 'reservation', title: 'Reserved "To Kill a Mockingbird"', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), recent: true },
        { type: 'loan', title: 'Returned "1984"', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), recent: false }
    ];
    
    const activityContainer = document.getElementById('user-activity');
    activityContainer.innerHTML = activities.map(activity => `
        <div class="activity-item ${activity.recent ? 'recent' : 'old'}">
            <h4>${activity.title}</h4>
            <p>${activity.date.toLocaleDateString()} • ${activity.type === 'loan' ? '📖 Loan' : '📅 Reservation'}</p>
        </div>
    `).join('');
}

function isRecent(dateString) {
    const activityDate = new Date(dateString);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return activityDate > sevenDaysAgo;
}

// Profile Picture Functions - UPDATED VERSION
function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image must be less than 5MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-picture').src = e.target.result;
            // Save to localStorage
            localStorage.setItem('profilePicture', e.target.result);
            alert('Profile picture updated successfully!');
        };
        reader.readAsDataURL(file);
    }
}

function removeProfilePicture() {
    if (confirm('Are you sure you want to remove your profile picture?')) {
        const defaultAvatar = '/images/default-avatar.png';
        document.getElementById('profile-picture').src = defaultAvatar;
        localStorage.removeItem('profilePicture');
        document.getElementById('profile-picture-input').value = '';
        alert('Profile picture removed successfully!');
    }
}

// Profile Form Handler - UPDATED VERSION
document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value;
    const username = document.getElementById('edit-username').value;
    
    // Basic validation
    if (!name.trim() || !username.trim()) {
        alert('Please fill in all fields');
        return;
    }
    
    if (username.length < 3) {
        alert('Username must be at least 3 characters long');
        return;
    }
    
    // Update current user data
    currentUser.name = name;
    currentUser.username = username;
    
    // Update UI
    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-username').textContent = '@' + username;
    document.getElementById('user-name').textContent = name;
    
    // Update localStorage
    localStorage.setItem('user', JSON.stringify(currentUser));
    
    // Show success message
    alert('Profile updated successfully!');
    
    console.log('Profile saved:', { name, username });
});

// Search functionality
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim();
        if (query) {
            searchBooks(query);
        }
    }
}

async function searchBooks(query) {
    try {
        if (!authToken) {
            // Demo search
            alert(`Searching for: ${query} (Demo mode)`);
            return;
        }
        
        const response = await fetch(`/books/search?q=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const books = await response.json();
            console.log('Search results:', books);
            // You can implement displaySearchResults function here
        }
    } catch (error) {
        console.error('Search error:', error);
    }
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    loadBooks();
}

// Event listeners
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

document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModals);
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModals();
    }
});

// Initialize app - UPDATED VERSION
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Load profile picture from localStorage
    const savedPicture = localStorage.getItem('profilePicture');
    if (savedPicture) {
        document.getElementById('profile-picture').src = savedPicture;
    }
    
    // Handle profile picture upload
    document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureUpload);
});