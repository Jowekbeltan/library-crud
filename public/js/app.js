// Library Management System - Complete Interactive Version

// Data Storage
let libraryData = {
    books: [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', status: 'available' },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'available' },
        { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', status: 'borrowed' },
        { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', status: 'available' },
        { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769174', status: 'available' }
    ],
    users: [
        { id: 1, name: 'John Smith', email: 'john@email.com', phone: '555-0101', joined: '2024-01-15' },
        { id: 2, name: 'Sarah Johnson', email: 'sarah@email.com', phone: '555-0102', joined: '2024-02-20' },
        { id: 3, name: 'Mike Brown', email: 'mike@email.com', phone: '555-0103', joined: '2024-03-10' }
    ],
    loans: [
        { id: 1, bookId: 3, userId: 1, bookTitle: '1984', userName: 'John Smith', loanDate: '2024-03-01', dueDate: '2024-03-15', status: 'active' }
    ],
    reservations: [
        { id: 1, bookId: 5, userId: 2, bookTitle: 'The Catcher in the Rye', userName: 'Sarah Johnson', reservationDate: '2024-03-12', status: 'active' }
    ],
    currentUser: { id: 1, name: 'Lib', username: 'library_', email: 'adm@library.com' }
};

// Navigation System
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    document.getElementById(sectionId).classList.add('active');
    
    // Activate corresponding nav button
    const buttonMap = {
        'dashboard-section': '📊 Dashboard',
        'books-section': '📚 Books',
        'users-section': '👥 Users',
        'loans-section': '📖 Loans',
        'reservations-section': '📅 Reservations',
        'profile-section': '👤 Profile'
    };
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        if (btn.textContent === buttonMap[sectionId]) {
            btn.classList.add('active');
        }
    });
    
    // Load section data
    loadSectionData(sectionId);
}

function loadSectionData(sectionId) {
    switch(sectionId) {
        case 'dashboard-section':
            loadDashboard();
            break;
        case 'books-section':
            loadBooks();
            break;
        case 'users-section':
            loadUsers();
            break;
        case 'loans-section':
            loadLoans();
            break;
        case 'reservations-section':
            loadReservations();
            break;
        case 'profile-section':
            loadProfile();
            break;
    }
}

// Dashboard Functions
function loadDashboard() {
    updateDashboardStats();
    displayAvailableBooks();
    displayRecentReservations();
    displayRecentUsers();
}

function updateDashboardStats() {
    const books = libraryData.books;
    const users = libraryData.users;
    const loans = libraryData.loans;
    const reservations = libraryData.reservations;
    
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

function displayAvailableBooks() {
    const container = document.getElementById('available-books-list');
    const availableBooks = libraryData.books
        .filter(book => book.status === 'available')
        .slice(0, 10);
    
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

function displayRecentReservations() {
    const container = document.getElementById('reservations-list');
    const recentReservations = libraryData.reservations
        .filter(res => res.status === 'active')
        .slice(0, 10);
    
    if (recentReservations.length === 0) {
        container.innerHTML = '<p class="mini-card">No active reservations</p>';
        return;
    }
    
    container.innerHTML = recentReservations.map(reservation => `
        <div class="mini-card">
            <h4>${reservation.bookTitle}</h4>
            <p><strong>User:</strong> ${reservation.userName}</p>
            <p><strong>Date:</strong> ${new Date(reservation.reservationDate).toLocaleDateString()}</p>
            <span class="status-badge status-reserved">Reserved</span>
        </div>
    `).join('');
}

function displayRecentUsers() {
    const container = document.getElementById('recent-users-list');
    const recentUsers = libraryData.users
        .sort((a, b) => new Date(b.joined) - new Date(a.joined))
        .slice(0, 10);
    
    if (recentUsers.length === 0) {
        container.innerHTML = '<p class="mini-card">No users</p>';
        return;
    }
    
    container.innerHTML = recentUsers.map(user => `
        <div class="mini-card">
            <h4>${user.name}</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Joined:</strong> ${new Date(user.joined).toLocaleDateString()}</p>
        </div>
    `).join('');
}

// Books Management
function loadBooks() {
    displayBooks();
    updateBooksCount();
}

function displayBooks() {
    const booksList = document.getElementById('books-list');
    const books = libraryData.books;
    
    booksList.innerHTML = books.map(book => `
        <div class="card">
            <h4>${book.title}</h4>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
            <p><strong>Status:</strong> 
                <span class="status-${book.status}">${book.status.charAt(0).toUpperCase() + book.status.slice(1)}</span>
            </p>
            <p><strong>ID:</strong> ${book.id}</p>
            <div class="card-actions">
                <button class="delete" onclick="deleteBook(${book.id})">Delete</button>
                ${book.status === 'available' ? `<button onclick="borrowBook(${book.id})">Borrow</button>` : ''}
                ${book.status === 'available' ? `<button onclick="reserveBook(${book.id})">Reserve</button>` : ''}
            </div>
        </div>
    `).join('');
}

function updateBooksCount() {
    document.getElementById('books-count').textContent = libraryData.books.length;
}

// Add Book
document.getElementById('add-book-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('isbn').value.trim();
    
    if (!title || !author) {
        alert('Please enter both title and author');
        return;
    }
    
    const newBook = {
        id: Math.max(...libraryData.books.map(b => b.id)) + 1,
        title,
        author,
        isbn: isbn || null,
        status: 'available'
    };
    
    libraryData.books.push(newBook);
    document.getElementById('add-book-form').reset();
    loadBooks();
    loadDashboard();
    
    showNotification('Book added successfully!', 'success');
});

function deleteBook(bookId) {
    if (confirm('Are you sure you want to delete this book?')) {
        libraryData.books = libraryData.books.filter(book => book.id !== bookId);
        loadBooks();
        loadDashboard();
        showNotification('Book deleted successfully!', 'success');
    }
}

function borrowBook(bookId) {
    const book = libraryData.books.find(b => b.id === bookId);
    if (book) {
        book.status = 'borrowed';
        
        const newLoan = {
            id: Math.max(...libraryData.loans.map(l => l.id), 0) + 1,
            bookId: book.id,
            userId: libraryData.currentUser.id,
            bookTitle: book.title,
            userName: libraryData.currentUser.name,
            loanDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'active'
        };
        
        libraryData.loans.push(newLoan);
        loadBooks();
        loadDashboard();
        showNotification(`Book "${book.title}" borrowed successfully!`, 'success');
    }
}

function reserveBook(bookId) {
    const book = libraryData.books.find(b => b.id === bookId);
    if (book) {
        const newReservation = {
            id: Math.max(...libraryData.reservations.map(r => r.id), 0) + 1,
            bookId: book.id,
            userId: libraryData.currentUser.id,
            bookTitle: book.title,
            userName: libraryData.currentUser.name,
            reservationDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        
        libraryData.reservations.push(newReservation);
        loadBooks();
        loadDashboard();
        showNotification(`Book "${book.title}" reserved successfully!`, 'success');
    }
}

// Search Functionality
function handleSearch(event) {
    if (event.key === 'Enter') {
        const query = event.target.value.trim().toLowerCase();
        if (query) {
            searchBooks(query);
        }
    }
}

function searchBooks(query) {
    const filteredBooks = libraryData.books.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        (book.isbn && book.isbn.includes(query))
    );
    
    const booksList = document.getElementById('books-list');
    booksList.innerHTML = filteredBooks.map(book => `
        <div class="card">
            <h4>${book.title}</h4>
            <p><strong>Author:</strong> ${book.author}</p>
            <p><strong>ISBN:</strong> ${book.isbn || 'N/A'}</p>
            <p><strong>Status:</strong> 
                <span class="status-${book.status}">${book.status.charAt(0).toUpperCase() + book.status.slice(1)}</span>
            </p>
        </div>
    `).join('');
    
    document.getElementById('books-count').textContent = filteredBooks.length;
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    loadBooks();
}

// Users Management
function loadUsers() {
    displayUsers();
    updateUsersCount();
}

function displayUsers() {
    const usersList = document.getElementById('users-list');
    const users = libraryData.users;
    
    usersList.innerHTML = users.map(user => `
        <div class="card">
            <h4>${user.name}</h4>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone || 'N/A'}</p>
            <p><strong>Member since:</strong> ${new Date(user.joined).toLocaleDateString()}</p>
            <div class="card-actions">
                <button class="delete" onclick="deleteUser(${user.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

function updateUsersCount() {
    document.getElementById('users-count').textContent = libraryData.users.length;
}

// Add User
document.getElementById('add-user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('user-name').value.trim();
    const email = document.getElementById('user-email').value.trim();
    const phone = document.getElementById('user-phone').value.trim();
    
    if (!name || !email) {
        alert('Please enter both name and email');
        return;
    }
    
    const newUser = {
        id: Math.max(...libraryData.users.map(u => u.id)) + 1,
        name,
        email,
        phone: phone || null,
        joined: new Date().toISOString().split('T')[0]
    };
    
    libraryData.users.push(newUser);
    document.getElementById('add-user-form').reset();
    loadUsers();
    loadDashboard();
    
    showNotification('User added successfully!', 'success');
});

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        libraryData.users = libraryData.users.filter(user => user.id !== userId);
        loadUsers();
        loadDashboard();
        showNotification('User deleted successfully!', 'success');
    }
}

// Loans Management
function loadLoans() {
    displayLoans();
    updateLoansDropdowns();
    updateLoansCount();
}

function displayLoans() {
    const loansList = document.getElementById('loans-list');
    const activeLoans = libraryData.loans.filter(loan => loan.status === 'active');
    
    loansList.innerHTML = activeLoans.map(loan => `
        <div class="card">
            <h4>${loan.bookTitle}</h4>
            <p><strong>Borrowed by:</strong> ${loan.userName}</p>
            <p><strong>Loan Date:</strong> ${new Date(loan.loanDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> ${new Date(loan.dueDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status-borrowed">Active</span></p>
            <div class="card-actions">
                <button onclick="returnBook(${loan.id})">Return Book</button>
            </div>
        </div>
    `).join('');
}

function updateLoansCount() {
    const activeLoans = libraryData.loans.filter(loan => loan.status === 'active');
    document.getElementById('loans-count').textContent = activeLoans.length;
}

function updateLoansDropdowns() {
    const bookSelect = document.getElementById('loan-book');
    const userSelect = document.getElementById('loan-user');
    
    // Update books dropdown
    bookSelect.innerHTML = '<option value="">Select Book</option>';
    libraryData.books
        .filter(book => book.status === 'available')
        .forEach(book => {
            bookSelect.innerHTML += `<option value="${book.id}">${book.title} by ${book.author}</option>`;
        });
    
    // Update users dropdown
    userSelect.innerHTML = '<option value="">Select User</option>';
    libraryData.users.forEach(user => {
        userSelect.innerHTML += `<option value="${user.id}">${user.name}</option>`;
    });
}

// Add Loan
document.getElementById('add-loan-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const bookId = parseInt(document.getElementById('loan-book').value);
    const userId = parseInt(document.getElementById('loan-user').value);
    const days = parseInt(document.getElementById('loan-days').value);
    
    if (!bookId || !userId) {
        alert('Please select both book and user');
        return;
    }
    
    const book = libraryData.books.find(b => b.id === bookId);
    const user = libraryData.users.find(u => u.id === userId);
    
    if (book && user) {
        book.status = 'borrowed';
        
        const newLoan = {
            id: Math.max(...libraryData.loans.map(l => l.id), 0) + 1,
            bookId: book.id,
            userId: user.id,
            bookTitle: book.title,
            userName: user.name,
            loanDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status: 'active'
        };
        
        libraryData.loans.push(newLoan);
        document.getElementById('add-loan-form').reset();
        loadLoans();
        loadBooks();
        loadDashboard();
        
        showNotification(`Book "${book.title}" loaned to ${user.name}!`, 'success');
    }
});

function returnBook(loanId) {
    const loan = libraryData.loans.find(l => l.id === loanId);
    if (loan) {
        const book = libraryData.books.find(b => b.id === loan.bookId);
        if (book) {
            book.status = 'available';
        }
        loan.status = 'returned';
        loadLoans();
        loadBooks();
        loadDashboard();
        showNotification('Book returned successfully!', 'success');
    }
}

// Reservations Management
function loadReservations() {
    displayReservations();
    updateReservationsDropdowns();
    updateReservationsCount();
}

function displayReservations() {
    const reservationsList = document.getElementById('reservations-list');
    const activeReservations = libraryData.reservations.filter(res => res.status === 'active');
    
    reservationsList.innerHTML = activeReservations.map(reservation => `
        <div class="card">
            <h4>${reservation.bookTitle}</h4>
            <p><strong>Reserved by:</strong> ${reservation.userName}</p>
            <p><strong>Reservation Date:</strong> ${new Date(reservation.reservationDate).toLocaleDateString()}</p>
            <p><strong>Status:</strong> <span class="status-reserved">Active</span></p>
            <div class="card-actions">
                <button onclick="cancelReservation(${reservation.id})">Cancel Reservation</button>
                <button onclick="fulfillReservation(${reservation.id})">Fulfill</button>
            </div>
        </div>
    `).join('');
}

function updateReservationsCount() {
    const activeReservations = libraryData.reservations.filter(res => res.status === 'active');
    document.getElementById('reservations-count').textContent = activeReservations.length;
}

function updateReservationsDropdowns() {
    const bookSelect = document.getElementById('reservation-book');
    const userSelect = document.getElementById('reservation-user');
    
    // Update books dropdown
    bookSelect.innerHTML = '<option value="">Select Book</option>';
    libraryData.books
        .filter(book => book.status === 'available')
        .forEach(book => {
            bookSelect.innerHTML += `<option value="${book.id}">${book.title} by ${book.author}</option>`;
        });
    
    // Update users dropdown
    userSelect.innerHTML = '<option value="">Select User</option>';
    libraryData.users.forEach(user => {
        userSelect.innerHTML += `<option value="${user.id}">${user.name}</option>`;
    });
}

// Add Reservation
document.getElementById('add-reservation-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const bookId = parseInt(document.getElementById('reservation-book').value);
    const userId = parseInt(document.getElementById('reservation-user').value);
    
    if (!bookId || !userId) {
        alert('Please select both book and user');
        return;
    }
    
    const book = libraryData.books.find(b => b.id === bookId);
    const user = libraryData.users.find(u => u.id === userId);
    
    if (book && user) {
        const newReservation = {
            id: Math.max(...libraryData.reservations.map(r => r.id), 0) + 1,
            bookId: book.id,
            userId: user.id,
            bookTitle: book.title,
            userName: user.name,
            reservationDate: new Date().toISOString().split('T')[0],
            status: 'active'
        };
        
        libraryData.reservations.push(newReservation);
        document.getElementById('add-reservation-form').reset();
        loadReservations();
        loadDashboard();
        
        showNotification(`Book "${book.title}" reserved for ${user.name}!`, 'success');
    }
});

function cancelReservation(reservationId) {
    const reservation = libraryData.reservations.find(r => r.id === reservationId);
    if (reservation) {
        reservation.status = 'cancelled';
        loadReservations();
        loadDashboard();
        showNotification('Reservation cancelled!', 'success');
    }
}

function fulfillReservation(reservationId) {
    const reservation = libraryData.reservations.find(r => r.id === reservationId);
    if (reservation) {
        const book = libraryData.books.find(b => b.id === reservation.bookId);
        if (book) {
            book.status = 'borrowed';
            
            const newLoan = {
                id: Math.max(...libraryData.loans.map(l => l.id), 0) + 1,
                bookId: book.id,
                userId: reservation.userId,
                bookTitle: book.title,
                userName: reservation.userName,
                loanDate: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                status: 'active'
            };
            
            libraryData.loans.push(newLoan);
            reservation.status = 'fulfilled';
            loadReservations();
            loadLoans();
            loadBooks();
            loadDashboard();
            
            showNotification('Reservation fulfilled and book loaned!', 'success');
        }
    }
}

// Profile Management
function loadProfile() {
    displayProfileInfo();
    displayUserActivity();
}

function displayProfileInfo() {
    const user = libraryData.currentUser;
    document.getElementById('profile-name').textContent = user.name;
    document.getElementById('profile-username').textContent = '@' + user.username;
    document.getElementById('profile-email').textContent = user.email;
    
    // Update form fields
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-username').value = user.username;
    document.getElementById('edit-email').value = user.email;
    
    // Calculate user stats
    const userLoans = libraryData.loans.filter(loan => loan.userId === user.id);
    const userReservations = libraryData.reservations.filter(res => res.userId === user.id && res.status === 'active');
    
    document.getElementById('books-borrowed').textContent = userLoans.length;
    document.getElementById('active-reservations').textContent = userReservations.length;
}

function displayUserActivity() {
    const activityContainer = document.getElementById('user-activity');
    const user = libraryData.currentUser;
    
    const userLoans = libraryData.loans.filter(loan => loan.userId === user.id);
    const userReservations = libraryData.reservations.filter(res => res.userId === user.id);
    
    const activities = [
        ...userLoans.map(loan => ({
            type: 'loan',
            title: `Borrowed "${loan.bookTitle}"`,
            date: loan.loanDate,
            recent: isRecent(loan.loanDate)
        })),
        ...userReservations.map(res => ({
            type: 'reservation', 
            title: `Reserved "${res.bookTitle}"`,
            date: res.reservationDate,
            recent: isRecent(res.reservationDate)
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
     .slice(0, 10);
    
    if (activities.length === 0) {
        activityContainer.innerHTML = '<p class="activity-item">No recent activity</p>';
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

// Profile Picture Management
function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select an image file', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image must be less than 5MB', 'error');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-picture').src = e.target.result;
            // Save to localStorage
            localStorage.setItem('profilePicture', e.target.result);
            showNotification('Profile picture updated successfully!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

function removeProfilePicture() {
    if (confirm('Are you sure you want to remove your profile picture?')) {
        const defaultAvatar = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'120\' height=\'120\' viewBox=\'0 0 120 120\'%3E%3Ccircle cx=\'60\' cy=\'60\' r=\'60\' fill=\'%233498db\'/%3E%3Ccircle cx=\'60\' cy=\'45\' r=\'25\' fill=\'white\'/%3E%3Cpath d=\'M30 120 Q60 90 90 120 Z\' fill=\'white\'/%3E%3C/svg%3E';
        document.getElementById('profile-picture').src = defaultAvatar;
        localStorage.removeItem('profilePicture');
        document.getElementById('profile-picture-input').value = '';
        showNotification('Profile picture removed successfully!', 'success');
    }
}

// Edit Profile Form
document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value.trim();
    const username = document.getElementById('edit-username').value.trim();
    
    // Basic validation
    if (!name || !username) {
        showNotification('Please fill in all fields', 'error');
        return;
    }
    
    if (username.length < 3) {
        showNotification('Username must be at least 3 characters long', 'error');
        return;
    }
    
    // Update current user data
    libraryData.currentUser.name = name;
    libraryData.currentUser.username = username;
    
    // Update UI
    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-username').textContent = '@' + username;
    
    showNotification('Profile updated successfully!', 'success');
});

// Utility Functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Library Management System initialized!');
    
    // Load profile picture from localStorage
    const savedPicture = localStorage.getItem('profilePicture');
    if (savedPicture) {
        document.getElementById('profile-picture').src = savedPicture;
    }
    
    // Handle profile picture upload
    document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureUpload);
    
    // Load initial data
    loadDashboard();
    
    // Set up section switching
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const sectionMap = {
                '📊 Dashboard': 'dashboard-section',
                '📚 Books': 'books-section',
                '👥 Users': 'users-section',
                '📖 Loans': 'loans-section',
                '📅 Reservations': 'reservations-section',
                '👤 Profile': 'profile-section'
            };
            
            const sectionId = sectionMap[this.textContent];
            if (sectionId) {
                showSection(sectionId);
            }
        });
    });
});

// Make functions globally available
window.showSection = showSection;
window.handleSearch = handleSearch;
window.clearSearch = clearSearch;
window.deleteBook = deleteBook;
window.borrowBook = borrowBook;
window.reserveBook = reserveBook;
window.deleteUser = deleteUser;
window.returnBook = returnBook;
window.cancelReservation = cancelReservation;
window.fulfillReservation = fulfillReservation;
window.removeProfilePicture = removeProfilePicture;