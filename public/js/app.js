// Library Management System with Fixed Authentication

// Data Storage with User Accounts
let libraryData = {
    users: [
        { 
            id: 1, 
            name: 'Lib', 
            email: 'adm', 
            password: 'admin', 
            role: 'admin',
            phone: '555-0001', 
            joined: '2024-01-01',
            profilePicture: null
        },
        { 
            id: 2, 
            name: 'Library Admin', 
            email: 'admin@library.com', 
            password: 'admin123', 
            role: 'admin',
            phone: '555-0002', 
            joined: '2024-02-01',
            profilePicture: null
        },
        { 
            id: 3, 
            name: 'Librarian User', 
            email: 'librarian@library.com', 
            password: 'lib123', 
            role: 'librarian',
            phone: '555-0003', 
            joined: '2024-03-01',
            profilePicture: null
        },
        { 
            id: 4, 
            name: 'Regular User', 
            email: 'user@library.com', 
            password: 'user123', 
            role: 'user',
            phone: '555-0004', 
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
            userId: 4, 
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
            userId: 4, 
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
    console.log('Available users:', libraryData.users.map(u => ({ email: u.email, password: u.password })));
    checkAuthStatus();
    setupEventListeners();
});

// Authentication Functions
function checkAuthStatus() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            isLoggedIn = true;
            updateUIForAuth();
            loadDashboard();
            console.log('Auto-login successful for:', currentUser.email);
        } catch (error) {
            console.error('Error parsing saved user:', error);
            localStorage.removeItem('currentUser');
            showLogin();
        }
    } else {
        console.log('No saved user found, showing login');
        showLogin();
    }
}

function login(email, password) {
    console.log('Login attempt:', { email, password });
    
    // Trim and validate inputs
    email = email.trim().toLowerCase();
    password = password.trim();
    
    if (!email || !password) {
        showNotification('Please enter both email and password!', 'error');
        return false;
    }
    
    const user = libraryData.users.find(u => 
        u.email.toLowerCase() === email && u.password === password
    );
    
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
        console.log('Login successful for:', user.email);
        return true;
    } else {
        console.log('Login failed - no user found with these credentials');
        showNotification('Invalid email or password! Please try again.', 'error');
        return false;
    }
}

function signup(name, email, password, role) {
    // Validate inputs
    name = name.trim();
    email = email.trim().toLowerCase();
    password = password.trim();
    
    if (!name || !email || !password) {
        showNotification('Please fill in all fields!', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showNotification('Password must be at least 6 characters long!', 'error');
        return;
    }
    
    // Check if email already exists
    if (libraryData.users.find(u => u.email.toLowerCase() === email)) {
        showNotification('Email already registered! Please use a different email.', 'error');
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
    console.log('New user created:', newUser.email);
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
        console.log('User logged out');
    }
}

function updateUIForAuth() {
    const userInfo = document.getElementById('user-info');
    const guestInfo = document.getElementById('guest-info');
    const nav = document.querySelector('nav');
    
    if (isLoggedIn && currentUser) {
        userInfo.style.display = 'flex';
        guestInfo.style.display = 'none';
        nav.style.display = 'flex';
        document.getElementById('user-name').textContent = currentUser.name;
        
        // Add role-based class to body
        document.body.className = `logged-in role-${currentUser.role}`;
        
        console.log('UI updated for logged-in user:', currentUser.email);
        
    } else {
        userInfo.style.display = 'none';
        guestInfo.style.display = 'block';
        nav.style.display = 'none';
        document.body.className = '';
        
        console.log('UI updated for guest user');
    }
}

// Modal Functions
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
    console.log('Login modal shown');
}

function showSignup() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'block';
    console.log('Signup modal shown');
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    console.log('Login modal closed');
}

function closeSignupModal() {
    document.getElementById('signupModal').style.display = 'none';
    console.log('Signup modal closed');
}

function fillDemoCredentials(email, password) {
    document.getElementById('login-email').value = email;
    document.getElementById('login-password').value = password;
    console.log('Demo credentials filled:', email);
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
    
    console.log('All event listeners set up successfully');
}

// Navigation System
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
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
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

// Basic Dashboard Function (You can expand this)
function loadDashboard() {
    console.log('Loading dashboard for user:', currentUser.email);
    // Add your dashboard loading logic here
    showNotification('Dashboard loaded successfully!', 'success');
}

// Basic Profile Function
function loadProfile() {
    if (!currentUser) return;
    
    console.log('Loading profile for user:', currentUser.email);
    
    // Update profile display
    document.getElementById('profile-name').textContent = currentUser.name;
    document.getElementById('profile-username').textContent = '@' + (currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, ''));
    document.getElementById('profile-email').textContent = currentUser.email;
    
    // Update form fields
    document.getElementById('edit-name').value = currentUser.name;
    document.getElementById('edit-username').value = currentUser.username || currentUser.name.toLowerCase().replace(/\s+/g, '');
    document.getElementById('edit-email').value = currentUser.email;
    
    showNotification('Profile loaded successfully!', 'success');
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
    
    /* Debug info styles */
    .debug-info {
        position: fixed;
        bottom: 10px;
        left: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 9999;
    }
`;
document.head.appendChild(style);

// Debug function to show current state
function showDebugInfo() {
    const debugDiv = document.createElement('div');
    debugDiv.className = 'debug-info';
    debugDiv.innerHTML = `
        <strong>Debug Info:</strong><br>
        Logged in: ${isLoggedIn}<br>
        User: ${currentUser ? currentUser.email : 'None'}<br>
        Users in system: ${libraryData.users.length}
    `;
    document.body.appendChild(debugDiv);
}

// Make functions globally available
window.showSection = showSection;
window.showLogin = showLogin;
window.showSignup = showSignup;
window.closeLoginModal = closeLoginModal;
window.closeSignupModal = closeSignupModal;
window.fillDemoCredentials = fillDemoCredentials;
window.logout = logout;
window.removeProfilePicture = removeProfilePicture;

// Show debug info (remove in production)
// showDebugInfo();

console.log('Available login credentials:');
console.log('1. Email: adm, Password: admin (Your account)');
console.log('2. Email: admin@library.com, Password: admin123');
console.log('3. Email: librarian@library.com, Password: lib123');
console.log('4. Email: user@library.com, Password: user123');