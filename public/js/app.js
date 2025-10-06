// Library Management System with Authentication

// Data Storage with User Accounts
let libraryData = {
    users: [
        { 
            id: 1, 
            name: 'Admin User', 
            email: 'admin@library.com', 
            password: 'admin123', 
            role: 'admin',
            phone: '555-0001', 
            joined: '2024-01-01',
            profilePicture: null
        },
        { 
            id: 2, 
            name: 'Librarian User', 
            email: 'librarian@library.com', 
            password: 'lib123', 
            role: 'librarian',
            phone: '555-0002', 
            joined: '2024-02-01',
            profilePicture: null
        },
        { 
            id: 3, 
            name: 'Regular User', 
            email: 'user@library.com', 
            password: 'user123', 
            role: 'user',
            phone: '555-0003', 
            joined: '2024-03-01',
            profilePicture: null
        }
    ],
    books: [
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '9780743273565', status: 'available', addedBy: 1 },
        { id: 2, title: 'To Kill a Mockingbird', author: 'Harper Lee', isbn: '9780061120084', status: 'available', addedBy: 1 },
        { id: 3, title: '1984', author: 'George Orwell', isbn: '9780451524935', status: 'borrowed', addedBy: 2 },
        { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen', isbn: '9780141439518', status: 'available', addedBy: 2 },
        { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', isbn: '9780316769174', status: 'available', addedBy: 1 }
    ],
    loans: [
        { 
            id: 1, 
            bookId: 3, 
            userId: 3, 
            bookTitle: '1984', 
            userName: 'Regular User', 
            loanDate: '2024-03-01', 
            dueDate: '2024-03-15', 
            status: 'active',
            processedBy: 2
        }
    ],
    reservations: [
        { 
            id: 1, 
            bookId: 5, 
            userId: 3, 
            bookTitle: 'The Catcher in the Rye', 
            userName: 'Regular User', 
            reservationDate: '2024-03-12', 
            status: 'active',
            processedBy: 2
        }
    ]
};

// Authentication State
let currentUser = null;
let isLoggedIn = false;

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Library Management System initialized!');
    checkAuthStatus();
    setupEventListeners();
});

// Authentication Functions
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        isLoggedIn = true;
        updateUIForAuth();
        loadDashboard();
    } else {
        showLogin();
    }
}

function login(email, password) {
    const user = libraryData.users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = { ...user };
        isLoggedIn = true;
        
        // Don't store password in localStorage for security
        const userForStorage = { ...user };
        delete userForStorage.password;
        
        localStorage.setItem('currentUser', JSON.stringify(userForStorage));
        updateUIForAuth();
        closeLoginModal();
        loadDashboard();
        
        showNotification(`Welcome back, ${user.name}!`, 'success');
        return true;
    } else {
        showNotification('Invalid email or password!', 'error');
        return false;
    }
}

function signup(name, email, password, role) {
    // Check if email already exists
    if (libraryData.users.find(u => u.email === email)) {
        showNotification('Email already registered!', 'error');
        return false;
    }
    
    const newUser = {
        id: Math.max(...libraryData.users.map(u => u.id)) + 1,
        name,
        email,
        password,
        role: role || 'user',
        phone: '',
        joined: new Date().toISOString().split('T')[0],
        profilePicture: null
    };
    
    libraryData.users.push(newUser);
    
    // Auto-login after signup
    currentUser = { ...newUser };
    isLoggedIn = true;
    
    const userForStorage = { ...newUser };
    delete userForStorage.password;
    
    localStorage.setItem('currentUser', JSON.stringify(userForStorage));
    updateUIForAuth();
    closeSignupModal();
    loadDashboard();
    
    showNotification(`Account created successfully! Welcome, ${name}!`, 'success');
    return true;
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        currentUser = null;
        isLoggedIn = false;
        localStorage.removeItem('currentUser');
        updateUIForAuth();
        showLogin();
        showNotification('You have been logged out successfully!', 'info');
    }
}

function updateUIForAuth() {
    const userInfo = document.getElementById('user-info');
    const guestInfo = document.getElementById('guest-info');
    const nav = document.querySelector('nav');
    const container = document.querySelector('.container');
    
    if (isLoggedIn && currentUser) {
        userInfo.style.display = 'flex';
        guestInfo.style.display = 'none';
        nav.style.display = 'flex';
        document.getElementById('user-name').textContent = currentUser.name;
        
        // Add role-based class to body
        document.body.className = `logged-in role-${currentUser.role}`;
        
        // Update profile section with current user data
        updateProfileDisplay();
        
    } else {
        userInfo.style.display = 'none';
        guestInfo.style.display = 'block';
        nav.style.display = 'none';
        document.body.className = '';
        
        // Show login modal if not on login page
        if (!window.location.hash.includes('login')) {
            showLogin();
        }
    }
}

// Modal Functions
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
}

function showSignup() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'block';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
}

function fillDemoCredentials(email, password) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
}

// Event Listeners Setup
function setupEventListeners() {
    // Login form
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        login(email, password);
    });
    
    // Signup form
    document.getElementById('signup-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const name = document.getElementById('signup-name').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const role = document.getElementById('signup-role').value;
        
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters long!', 'error');
            return;
        }
        
        signup(name, email, password, role);
    });
    
    // Modal close events
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            closeLoginModal();
            closeSignupModal();
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeLoginModal();
            closeSignupModal();
        }
    });
    
    // Profile picture upload
    const profilePictureInput = document.getElementById('profile-picture-input');
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', handleProfilePictureUpload);
    }
}

// Navigation System (Updated with Auth Check)
function showSection(sectionId) {
    if (!isLoggedIn) {
        showNotification('Please login to access this section!', 'error');
        showLogin();
        return;
    }
    
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
        'profile-section': '👤 Profile',
        'database-section': '📊 Database'
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
    if (!isLoggedIn) return;
    
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
        case 'database-section':
            loadDatabaseView();
            break;
    }
}

// Role-based Access Control
function checkPermission(requiredRole) {
    if (!isLoggedIn) return false;
    
    const roleHierarchy = {
        'user': 1,
        'librarian': 2,
        'admin': 3
    };
    
    return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole];
}

function showPermissionError() {
    showNotification('You do not have permission to perform this action!', 'error');
}

// Updated Book Management with Permissions
document.getElementById('add-book-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (!checkPermission('librarian')) {
        showPermissionError();
        return;
    }
    
    const title = document.getElementById('title').value.trim();
    const author = document.getElementById('author').value.trim();
    const isbn = document.getElementById('isbn').value.trim();
    
    if (!title || !author) {
        showNotification('Please enter both title and author', 'error');
        return;
    }
    
    const newBook = {
        id: Math.max(...libraryData.books.map(b => b.id)) + 1,
        title,
        author,
        isbn: isbn || null,
        status: 'available',
        addedBy: currentUser.id
    };
    
    libraryData.books.push(newBook);
    document.getElementById('add-book-form').reset();
    loadBooks();
    loadDashboard();
    
    showNotification('Book added successfully!', 'success');
});

function deleteBook(bookId) {
    if (!checkPermission('librarian')) {
        showPermissionError();
        return;
    }
    
    if (confirm('Are you sure you want to delete this book?')) {
        libraryData.books = libraryData.books.filter(book => book.id !== bookId);
        loadBooks();
        loadDashboard();
        showNotification('Book deleted successfully!', 'success');
    }
}

// Updated Profile Management
function updateProfileDisplay() {
    if (!currentUser) return;
    
    const profileName = document.getElementById('profile-name');
    const profileUsername = document.getElementById('profile-username');
    const profileEmail = document.getElementById('profile-email');
    
    if (profileName) profileName.textContent = currentUser.name;
    if (profileUsername) profileUsername.textContent = '@' + (currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''));
    if (profileEmail) profileEmail.textContent = currentUser.email;
    
    // Update form fields
    const editName = document.getElementById('edit-name');
    const editUsername = document.getElementById('edit-username');
    const editEmail = document.getElementById('edit-email');
    
    if (editName) editName.value = currentUser.name;
    if (editUsername) editUsername.value = currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '');
    if (editEmail) editEmail.value = currentUser.email;
}

// Profile Form Handler
document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('edit-name').value.trim();
    const username = document.getElementById('edit-username').value.trim();
    
    if (!name) {
        showNotification('Please enter your name', 'error');
        return;
    }
    
    // Update current user data
    currentUser.name = name;
    currentUser.username = username;
    
    // Update in libraryData
    const userIndex = libraryData.users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
        libraryData.users[userIndex].name = name;
        libraryData.users[userIndex].username = username;
    }
    
    // Update localStorage
    const userForStorage = { ...currentUser };
    delete userForStorage.password;
    localStorage.setItem('currentUser', JSON.stringify(userForStorage));
    
    // Update UI
    updateUIForAuth();
    showNotification('Profile updated successfully!', 'success');
});

// Utility Functions
function showNotification(message, type = 'info') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(notification => {
        notification.remove();
    });
    
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
        max-width: 300px;
    `;
    
    // Set background color based on type
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
    };
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
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
    
    .role-admin .stat-card { border-left: 4px solid #e74c3c; }
    .role-librarian .stat-card { border-left: 4px solid #f39c12; }
    .role-user .stat-card { border-left: 4px solid #27ae60; }
`;
document.head.appendChild(style);

// Make functions globally available
window.showSection = showSection;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.closeLoginModal = closeLoginModal;
window.closeSignupModal = closeSignupModal;
window.fillDemoCredentials = fillDemoCredentials;
window.logout = logout;

// Include all your existing functions for books, users, loans, reservations, etc.
// (Keep all the existing functionality from the previous implementation)