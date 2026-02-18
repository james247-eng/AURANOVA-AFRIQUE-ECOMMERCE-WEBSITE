/* ==========================================
   ADMIN SHARED UTILITIES & COMMON FUNCTIONS
   ========================================== */

/* Initialize Firebase for admin pages */
document.addEventListener('DOMContentLoaded', function() {
    // Ensure Firebase config is loaded
    if (!window.firebaseApp) {
        console.error('Firebase not initialized. Check if firebaseConfig.js is loaded.');
    }
    
    // Initialize common admin utilities
    initAdminUtilities();
});

/* Common Admin Utilities */
function initAdminUtilities() {
    // Initialize sidebar
    initSidebar();
    
    // Initialize logout button
    initLogout();
}

/* SIDEBAR TOGGLE */
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
        
        // Close sidebar on navigation
        sidebar.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', () => {
                sidebar.classList.remove('active');
            });
        });
    }
}

/* LOGOUT FUNCTIONALITY */
function initLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function() {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    // Firebase logout
                    if (window.firebaseApp?.auth) {
                        await window.firebaseApp.auth.signOut();
                    }
                    
                    // Clear localStorage
                    localStorage.removeItem('admin_user');
                    localStorage.removeItem('user_auth');
                    
                    // Redirect to login
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = 'login.html';
                }
            }
        });
    }
}

/* Export utilities */
window.adminUtils = {
    initAdminUtilities
};
