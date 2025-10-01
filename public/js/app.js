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