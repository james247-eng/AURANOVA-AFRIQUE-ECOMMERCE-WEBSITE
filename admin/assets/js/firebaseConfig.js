/* ==========================================
   FIREBASE CONFIGURATION
   ========================================== */

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDqlJVoPREhrySrlIxRJWHJUC47iVEyV5Q",
    authDomain: "new-project-form-ee68c.firebaseapp.com",
    projectId: "new-project-form-ee68c",
    storageBucket: "new-project-form-ee68c.firebasestorage.app",
    messagingSenderId: "691717190873",
    appId: "1:691717190873:web:106a42a9e9bad4b725fac8"
};


// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence()
    .catch((err) => {
        if (err.code === 'failed-precondition') {
            console.warn('Persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
            console.warn('Persistence not available');
        }
    });

/* ==========================================
   CLOUDINARY CONFIGURATION
   ========================================== */

const CLOUDINARY_CONFIG = {
    cloudName: 'YOUR_CLOUD_NAME',
    uploadPreset: 'YOUR_UPLOAD_PRESET', // Create unsigned preset in Cloudinary dashboard
    apiKey: 'YOUR_API_KEY' // Optional, only needed for signed uploads
};

/* ==========================================
   GLOBAL HELPERS
   ========================================== */

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="material-icons">${
            type === 'success' ? 'check_circle' : 
            type === 'error' ? 'error' : 
            type === 'warning' ? 'warning' : 'info'
        }</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Format currency
function formatPrice(amount) {
    return `₦${amount.toLocaleString('en-NG')}`;
}

// Format date
function formatDate(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time
function formatDateTime(timestamp) {
    if (!timestamp) return 'N/A';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('en-NG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show loading state
function showLoading(element, text = 'Loading...') {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    
    if (element) {
        element.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>${text}</p>
            </div>
        `;
    }
}

// Show error state
function showError(element, message = 'Something went wrong') {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    
    if (element) {
        element.innerHTML = `
            <div class="error-state">
                <span class="material-icons">error_outline</span>
                <p>${message}</p>
            </div>
        `;
    }
}

// Show empty state
function showEmpty(element, message = 'No data available') {
    if (typeof element === 'string') {
        element = document.getElementById(element);
    }
    
    if (element) {
        element.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">inbox</span>
                <p>${message}</p>
            </div>
        `;
    }
}

// Export for use in other files
window.firebaseApp = {
    auth,
    db,
    CLOUDINARY_CONFIG,
    showNotification,
    formatPrice,
    formatDate,
    formatDateTime,
    showLoading,
    showError,
    showEmpty
};