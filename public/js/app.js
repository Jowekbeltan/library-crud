// Authentication state
let currentUser = null;
let authToken = null;

// Show/hide welcome page and main app
function toggleAppViews() {
    const welcomePage = document.getElementById('welcome-page');
    const mainApp = document.getElementById('main-app');
    
    if (currentUser) {
        // User is logged in - show main app
        welcomePage.style.display = 'none';
        mainApp.style.display = 'block';
        updateUIForAuth();
        loadDashboard();
    } else {
        // User is not logged in - show welcome page
        welcomePage.style.display = 'flex';
        mainApp.style.display = 'none';
    }
}

// Check if user is logged in on page load
function checkAuthStatus() {
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        authToken = savedToken;
        currentUser = JSON.parse(savedUser);
        toggleAppViews();
    } else {
        toggleAppViews();
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
            closeModals();
            toggleAppViews();
            // Use simple alert for now
            alert('Welcome back, ' + currentUser.name + '!');
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
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
            alert('Account created successfully! Please sign in.');
            showLogin();
        } else {
            alert(data.error);
        }
    } catch (error) {
        console.error('Signup error:', error);
        alert('Signup failed. Please try again.');
    }
}

function logout() {
    if (confirm('Are you sure you want to sign out?')) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        authToken = null;
        currentUser = null;
        toggleAppViews();
        alert('You have been signed out successfully.');
    }
}

// Modal functions
function showLogin() {
    document.getElementById('loginModal').style.display = 'block';
    document.getElementById('signupModal').style.display = 'none';
}

function showSignup() {
    document.getElementById('signupModal').style.display = 'block';
    document.getElementById('loginModal').style.display = 'none';
}

function closeModals() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('signupModal').style.display = 'none';
}

// Update UI when user is authenticated
function updateUIForAuth() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-info').style.display = 'block';
    } else {
        document.getElementById('user-info').style.display = 'none';
    }
}

// Authentication headers
function getAuthHeaders() {
    if (!authToken) {
        console.warn('No auth token available');
        return {
            'Content-Type': 'application/json'
        };
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
    };
}

// Event listeners for auth forms
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

// Close modals when clicking X or outside
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', closeModals);
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        closeModals();
    }
});

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});

// Dashboard Functions - SINGLE VERSION
async function loadDashboard() {
    if (!authToken) {
        console.log('No auth token - user not logged in');
        showLogin();
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
        document.getElementById('available-books-list').innerHTML = 
            `<p class="mini-card" style="color: red;">Error: ${error.message}</p>`;
    }
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

// Books Management - SINGLE VERSION
async function loadBooks() {
    if (!authToken) {
        console.log('Not authenticated, skipping books load');
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

// Add Book Form Handler - FIXED VERSION
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
            loadBooks(); // Reload the books list
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
        const response = await fetch('/users', {
            headers: getAuthHeaders()
        });
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
        const response = await fetch('/loans', {
            headers: getAuthHeaders()
        });
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
        const response = await fetch('/reservations', {
            headers: getAuthHeaders()
        });
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

// Profile Functions
async function loadProfile() {
    if (!currentUser) return;
    
    try {
        document.getElementById('profile-name').textContent = currentUser.name;
        document.getElementById('profile-email').textContent = currentUser.email;
        document.getElementById('member-since').textContent = 'Recently';
        
        const [loans, reservations] = await Promise.all([
            fetch('/loans', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/reservations', { headers: getAuthHeaders() }).then(r => r.json())
        ]);
        
        const userLoans = loans.filter(loan => loan.user === currentUser.name);
        const userReservations = reservations.filter(res => res.user === currentUser.name);
        const activeReservations = userReservations.filter(res => res.status === 'active');
        
        document.getElementById('books-borrowed').textContent = userLoans.length;
        document.getElementById('active-reservations').textContent = activeReservations.length;
        
        displayUserActivity(userLoans, userReservations);
        
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

function displayUserActivity(loans, reservations) {
    const activityContainer = document.getElementById('user-activity');
    
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
     .slice(0, 10);
    
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
}

// Search functionality
async function searchBooks(query) {
    try {
        const response = await fetch(`/books/search?q=${encodeURIComponent(query)}`, {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const books = await response.json();
            // You'll need to implement displaySearchResults function
            console.log('Search results:', books);
        }
    } catch (error) {
        console.error('Search error:', error);
    }
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

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
});
// Profile Section Functionality
function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profile-picture').src = e.target.result;
            // Save to localStorage or send to server
            localStorage.setItem('profilePicture', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

function removeProfilePicture() {
    const defaultAvatar = '/images/default-avatar.png';
    document.getElementById('profile-picture').src = defaultAvatar;
    localStorage.removeItem('profilePicture');
    // Reset file input
    document.getElementById('profile-picture-input').value = '';
}

// Initialize profile form
document.addEventListener('DOMContentLoaded', function() {
    // Load profile picture from localStorage
    const savedPicture = localStorage.getItem('profilePicture');
    if (savedPicture) {
        document.getElementById('profile-picture').src = savedPicture;
    }
    
    // Handle profile picture upload
    document.getElementById('profile-picture-input').addEventListener('change', handleProfilePictureUpload);
    
    // Handle profile form submission
    document.getElementById('edit-profile-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileChanges();
    });
});

function saveProfileChanges() {
    const name = document.getElementById('edit-name').value;
    const username = document.getElementById('edit-username').value;
    
    // Update profile display
    document.getElementById('profile-name').textContent = name;
    document.getElementById('profile-username').textContent = '@' + username;
    
    // Show success message
    alert('Profile updated successfully!');
    
    // In a real app, you would send this to your backend
    console.log('Profile saved:', { name, username });
}
// Appearance Settings Functions
let currentPreferences = null;

async function loadAppearanceSettings() {
    if (!currentUser) return;
    
    try {
        const response = await fetch(`/preferences/${currentUser.id}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load preferences');
        }
        
        currentPreferences = await response.json();
        updateAppearanceUI(currentPreferences);
        
    } catch (error) {
        console.error('Error loading appearance settings:', error);
        showMessage('Error loading appearance settings', 'error');
    }
}

function updateAppearanceUI(preferences) {
    // Update theme selection
    const themeRadios = document.querySelectorAll('input[name="theme"]');
    themeRadios.forEach(radio => {
        radio.checked = radio.value === preferences.theme;
    });
    
    // Update wallpaper display
    updateWallpaperDisplay(preferences.background_wallpaper);
    
    // Apply current theme to body
    document.body.className = preferences.theme + '-theme';
}

function updateWallpaperDisplay(wallpaperPath) {
    const wallpaperImg = document.getElementById('wallpaper-image');
    const defaultWallpaper = document.getElementById('default-wallpaper');
    
    if (wallpaperPath) {
        wallpaperImg.src = wallpaperPath;
        wallpaperImg.style.display = 'block';
        defaultWallpaper.style.display = 'none';
        
        // Apply wallpaper to background
        applyWallpaperToBackground(wallpaperPath);
    } else {
        wallpaperImg.style.display = 'none';
        defaultWallpaper.style.display = 'flex';
        
        // Apply default background
        applyDefaultBackground();
    }
}

function applyWallpaperToBackground(wallpaperPath) {
    document.body.style.backgroundImage = `url('${wallpaperPath}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
}

function applyDefaultBackground() {
    document.body.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
}

// Theme change handler
document.querySelectorAll('input[name="theme"]').forEach(radio => {
    radio.addEventListener('change', async function() {
        if (!currentUser || !currentPreferences) return;
        
        const theme = this.value;
        
        try {
            const response = await fetch(`/preferences/${currentUser.id}/theme`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ theme })
            });
            
            const result = await response.json();
            
            if (response.ok) {
                currentPreferences.theme = theme;
                document.body.className = theme + '-theme';
                showMessage('Theme updated successfully!', 'success');
            } else {
                showMessage('Error: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Theme update error:', error);
            showMessage('Failed to update theme', 'error');
        }
    });
});

// Wallpaper upload handler
document.getElementById('wallpaper-input').addEventListener('change', async function(e) {
    if (e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    
    // Validate file
    if (file.size > 10 * 1024 * 1024) {
        showMessage('File size must be less than 10MB', 'error');
        return;
    }
    
    if (!file.type.startsWith('image/')) {
        showMessage('Please select an image file', 'error');
        return;
    }
    
    await uploadWallpaper(file);
});

async function uploadWallpaper(file) {
    const formData = new FormData();
    formData.append('wallpaper', file);
    
    try {
        const response = await fetch(`/preferences/${currentUser.id}/wallpaper`, {
            method: 'PUT',
            body: formData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentPreferences.background_wallpaper = result.background_wallpaper;
            updateWallpaperDisplay(result.background_wallpaper);
            showMessage('Wallpaper updated successfully!', 'success');
        } else {
            showMessage('Error: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Wallpaper upload error:', error);
        showMessage('Failed to upload wallpaper', 'error');
    }
}

// Reset wallpaper function
async function resetWallpaper() {
    if (!confirm('Reset to default wallpaper?')) return;
    
    try {
        const response = await fetch(`/preferences/${currentUser.id}/wallpaper`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        const result = await response.json();
        
        if (response.ok) {
            currentPreferences.background_wallpaper = null;
            updateWallpaperDisplay(null);
            showMessage('Wallpaper reset to default!', 'success');
        } else {
            showMessage('Error: ' + result.error, 'error');
        }
    } catch (error) {
        console.error('Wallpaper reset error:', error);
        showMessage('Failed to reset wallpaper', 'error');
    }
}

// Predefined wallpaper selection
document.querySelectorAll('.wallpaper-option').forEach(option => {
    option.addEventListener('click', function() {
        const wallpaperPath = this.getAttribute('data-wallpaper');
        // For predefined wallpapers, you might want to store them in your uploads folder
        // or handle them differently since they're not user-uploaded
        showMessage('Predefined wallpapers need to be implemented with actual image files', 'info');
    });
});

// Update loadSectionData to include appearance
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
        case 'appearance':
            loadAppearanceSettings();
            break;
    }
}

// Load user preferences when app starts
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Load preferences after a short delay to ensure user is loaded
    setTimeout(() => {
        if (currentUser) {
            loadAppearanceSettings();
        }
    }, 1000);
});
// Temporary: Manual navigation test
function testNavigation() {
    console.log('=== NAVIGATION TEST ===');
    
    // Test clicking each section manually
    const sections = [
        { name: 'books', button: 'Books' },
        { name: 'users', button: 'Users' },
        { name: 'loans', button: 'Loans' },
        { name: 'reservations', button: 'Reservations' },
        { name: 'profile', button: 'Profile' },
        { name: 'appearance', button: 'Appearance' }
    ];
    
    sections.forEach(section => {
        console.log(`Testing: ${section.name}`);
        showSection(section.name);
    });
}
// Navigation System
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active class from all buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error('Section not found:', sectionName + '-section');
        return;
    }
    
    // Activate the clicked button
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load data for the section
    loadSectionData(sectionName);
}

// Load data based on section
function loadSectionData(section) {
    console.log('Loading data for section:', section);
    
    if (!currentUser) {
        console.log('No user logged in, skipping data load');
        return;
    }
    
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
        case 'appearance':
            loadAppearanceSettings();
            break;
        default:
            console.log('Unknown section:', section);
    }
}

// Update the toggleAppViews function to set up initial navigation
function toggleAppViews() {
    const welcomePage = document.getElementById('welcome-page');
    const mainApp = document.getElementById('main-app');
    
    if (currentUser) {
        // User is logged in - show main app
        welcomePage.style.display = 'none';
        mainApp.style.display = 'block';
        updateUIForAuth();
        
        // Set up initial navigation - show dashboard by default
        setTimeout(() => {
            showSection('dashboard');
        }, 100);
    } else {
        // User is not logged in - show welcome page
        welcomePage.style.display = 'flex';
        mainApp.style.display = 'none';
    }
}
// Enhanced Books Functions
let currentFilters = {
    category: '',
    genre: '',
    year: '',
    search: '',
    sortBy: 'title',
    sortOrder: 'ASC'
};

async function loadBooks() {
    if (!currentUser) return;
    
    try {
        // Build query string from filters
        const queryParams = new URLSearchParams();
        Object.keys(currentFilters).forEach(key => {
            if (currentFilters[key]) {
                queryParams.append(key, currentFilters[key]);
            }
        });
        
        const response = await fetch(`/books?${queryParams}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) throw new Error('Failed to load books');
        
        const books = await response.json();
        displayBooks(books);
        
        // Record view for analytics (optional)
        books.forEach(book => {
            fetch(`/books/${book.id}/view`, { 
                method: 'POST',
                headers: getAuthHeaders() 
            }).catch(console.error);
        });
        
    } catch (error) {
        console.error('Error loading books:', error);
    }
}

function displayBooks(books) {
    const booksList = document.getElementById('books-list');
    const booksCount = document.getElementById('books-count');
    
    booksCount.textContent = books.length;
    booksList.innerHTML = '';
    
    if (books.length === 0) {
        booksList.innerHTML = '<p class="no-books">No books found matching your criteria.</p>';
        return;
    }
    
    books.forEach(book => {
        const tags = book.tags ? (typeof book.tags === 'string' ? JSON.parse(book.tags) : book.tags) : [];
        
        booksList.innerHTML += `
            <div class="book-card">
                <img src="${book.cover_image || '/images/default-book-cover.png'}" 
                     alt="${book.title}" 
                     class="book-cover"
                     onerror="this.src='/images/default-book-cover.png'">
                <div class="book-details">
                    <h4>${book.title}</h4>
                    <p><strong>Author:</strong> ${book.author}</p>
                    
                    <div class="book-meta">
                        ${book.category ? `<span>📚 ${book.category}</span>` : ''}
                        ${book.genre ? `<span>🏷️ ${book.genre}</span>` : ''}
                        ${book.published_year ? `<span>📅 ${book.published_year}</span>` : ''}
                        <span class="status-${book.status}">${book.status}</span>
                    </div>
                    
                    ${book.isbn ? `<p><strong>ISBN:</strong> ${book.isbn}</p>` : ''}
                    
                    ${tags.length > 0 ? `
                        <div class="book-tags">
                            ${tags.map(tag => `<span class="book-tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="book-stats">
                        <div class="book-stat">👁️ ${book.views_count || 0} views</div>
                        <div class="book-stat">📖 ${book.borrow_count || 0} borrows</div>
                    </div>
                    
                    <p><strong>Added:</strong> ${new Date(book.created_at).toLocaleDateString()}</p>
                    
                    <div class="card-actions">
                        <button class="delete" onclick="deleteBook(${book.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// Filter Functions
async function loadFilterOptions() {
    try {
        const [categories, genres, years] = await Promise.all([
            fetch('/books/categories', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/books/genres', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/books/years', { headers: getAuthHeaders() }).then(r => r.json())
        ]);
        
        populateSelect('category-filter', categories);
        populateSelect('genre-filter', genres);
        populateSelect('year-filter', years);
        
    } catch (error) {
        console.error('Error loading filter options:', error);
    }
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    // Keep the first option (All)
    const firstOption = select.options[0];
    select.innerHTML = '';
    select.appendChild(firstOption);
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

function applyFilters() {
    currentFilters = {
        category: document.getElementById('category-filter').value,
        genre: document.getElementById('genre-filter').value,
        year: document.getElementById('year-filter').value,
        search: currentFilters.search, // Keep existing search
        sortBy: document.getElementById('sort-by').value,
        sortOrder: document.getElementById('sort-order').value
    };
    
    loadBooks();
}

function clearFilters() {
    document.getElementById('category-filter').value = '';
    document.getElementById('genre-filter').value = '';
    document.getElementById('year-filter').value = '';
    document.getElementById('sort-by').value = 'title';
    document.getElementById('sort-order').value = 'ASC';
    
    currentFilters = {
        category: '',
        genre: '',
        year: '',
        search: '',
        sortBy: 'title',
        sortOrder: 'ASC'
    };
    
    loadBooks();
}

// Enhanced Add Book Form
document.getElementById('add-book-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value.trim());
    formData.append('author', document.getElementById('author').value.trim());
    formData.append('category', document.getElementById('category').value.trim());
    formData.append('genre', document.getElementById('genre').value.trim());
    formData.append('published_year', document.getElementById('published_year').value);
    formData.append('isbn', document.getElementById('isbn').value.trim());
    formData.append('tags', document.getElementById('tags').value.trim());
    
    const coverImage = document.getElementById('cover_image').files[0];
    if (coverImage) {
        formData.append('cover_image', coverImage);
    }
    
    try {
        const response = await fetch('/books', {
            method: 'POST',
            body: formData
            // Note: Don't set Content-Type for FormData
        });
        
        const result = await response.json();
        
        if (response.ok) {
            document.getElementById('add-book-form').reset();
            alert('Book added successfully!');
            loadBooks();
            loadFilterOptions(); // Reload filters in case new categories were added
        } else {
            alert('Error adding book: ' + (result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error: Could not connect to server');
    }
});

// Update search to use new filtering
function handleSearch(event) {
    if (event.key === 'Enter') {
        currentFilters.search = event.target.value.trim();
        loadBooks();
    }
}

function clearSearch() {
    document.getElementById('search-input').value = '';
    currentFilters.search = '';
    loadBooks();
}

// Load filter options when books section is shown
function loadSectionData(section) {
    switch(section) {
        case 'books':
            loadBooks();
            loadFilterOptions();
            break;
        // ... other cases remain the same
    }
}
// Analytics Functions
async function loadAnalytics() {
    try {
        const [popularBooks, categories] = await Promise.all([
            fetch('/books/analytics/popular?limit=6', { headers: getAuthHeaders() }).then(r => r.json()),
            fetch('/books/categories', { headers: getAuthHeaders() }).then(r => r.json())
        ]);
        
        displayPopularBooks(popularBooks);
        updateQuickStats(popularBooks, categories);
        
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function displayPopularBooks(books) {
    const container = document.getElementById('popular-books');
    
    if (books.length === 0) {
        container.innerHTML = '<p>No analytics data available yet.</p>';
        return;
    }
    
    container.innerHTML = books.map(book => `
        <div class="popular-book">
            <img src="${book.cover_image || '/images/default-book-cover.png'}" 
                 alt="${book.title}" 
                 class="popular-book-cover"
                 onerror="this.src='/images/default-book-cover.png'">
            <div class="popular-book-details">
                <h4>${book.title}</h4>
                <p><strong>Author:</strong> ${book.author}</p>
                <div class="popular-book-stats">
                    <span>👁️ ${book.views_count} views</span>
                    <span>📖 ${book.borrow_count} borrows</span>
                </div>
            </div>
        </div>
    `).join('');
}

function updateQuickStats(books, categories) {
    if (books.length > 0) {
        const mostViewed = books[0];
        document.getElementById('most-viewed-count').textContent = mostViewed.views_count;
        document.getElementById('most-viewed-book').textContent = mostViewed.title;
        
        const mostBorrowed = [...books].sort((a, b) => b.borrow_count - a.borrow_count)[0];
        document.getElementById('most-borrowed-count').textContent = mostBorrowed.borrow_count;
        document.getElementById('most-borrowed-book').textContent = mostBorrowed.title;
    }
    
    document.getElementById('total-categories').textContent = categories.length;
}

// Update loadSectionData
function loadSectionData(section) {
    switch(section) {
        case 'analytics':
            loadAnalytics();
            break;
        // ... other cases
    }
}
// Sidebar Navigation Functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.toggle('open');
    overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
    
    // Prevent body scroll when sidebar is open
    document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    
    sidebar.classList.remove('open');
    overlay.style.display = 'none';
    document.body.style.overflow = '';
}

// Close sidebar when clicking outside or pressing Escape
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const hamburger = document.querySelector('.hamburger-menu');
    
    if (!sidebar.contains(event.target) && !hamburger.contains(event.target) && sidebar.classList.contains('open')) {
        closeSidebar();
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeSidebar();
    }
});

// Update showSection to handle both desktop and mobile navigation
function showSection(sectionName) {
    console.log('Showing section:', sectionName);
    
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 1024) {
        closeSidebar();
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
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    } else {
        console.error('Section not found:', sectionName + '-section');
        return;
    }
    
    // Activate the clicked button (for desktop navigation)
    if (event && event.target.classList.contains('nav-btn')) {
        event.target.classList.add('active');
    }
    
    // Load data for the section
    loadSectionData(sectionName);
}

// Update UI for auth to include user dropdown
function updateUIForAuth() {
    if (currentUser) {
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('user-info').style.display = 'block';
        
        // Show appropriate navigation based on screen size
        if (window.innerWidth > 1024) {
            document.querySelector('.top-nav').style.display = 'flex';
        }
    } else {
        document.getElementById('user-info').style.display = 'none';
        document.querySelector('.top-nav').style.display = 'none';
    }
}

// Handle window resize
window.addEventListener('resize', function() {
    const topNav = document.querySelector('.top-nav');
    if (window.innerWidth > 1024 && currentUser) {
        topNav.style.display = 'flex';
    } else {
        topNav.style.display = 'none';
    }
});

// Update navigation when section loads
function loadSectionData(section) {
    console.log('Loading data for section:', section);
    
    if (!currentUser) {
        console.log('No user logged in, skipping data load');
        return;
    }
    
    // Update active states for both desktop and mobile
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section
    const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(btn => 
        btn.textContent.toLowerCase().includes(section)
    );
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    const activeLink = Array.from(document.querySelectorAll('.nav-link')).find(link => 
        link.textContent.toLowerCase().includes(section)
    );
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Load section data
    switch(section) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'books':
            loadBooks();
            loadFilterOptions();
            break;
        case 'analytics':
            loadAnalytics();
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
        case 'appearance':
            loadAppearanceSettings();
            break;
        default:
            console.log('Unknown section:', section);
    }
}

