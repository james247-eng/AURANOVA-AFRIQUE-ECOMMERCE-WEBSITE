/* ==========================================
   FIREBASE CONFIGURATION
   ========================================== */

/* ==========================================
   FIREBASE CONFIG - HARDCODED (replace values below)
   Paste your Firebase project values here from the Firebase console.
   Example:
     apiKey: "AIza...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:123456:web:abcdef"
   ========================================== */

const firebaseConfig = {
  apiKey: "AIzaSyBjhtSMrL-m1rwhj9o8UFB_2hNvWZ2tQ98",

  authDomain: "new-project-form-ee68c.firebaseapp.com",

  projectId: "new-project-form-ee68c",

  storageBucket: "new-project-form-ee68c.firebasestorage.app",

  messagingSenderId: "691717190873",

  appId: "1:691717190873:web:c6a609d2d5bdcf9025fac8"

};

// Initialize Firebase and attach services to window.firebaseApp
if (typeof firebase === "undefined") {
  console.error("Firebase SDK not loaded. Include firebase-app and services before this file.");
} else {
  if (!firebase.apps || firebase.apps.length === 0) {
    try {
      firebase.initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Firebase initializeApp error', e);
    }
  }

  const auth = firebase.auth();
  const db = firebase.firestore();

  db.enablePersistence && db.enablePersistence().catch(() => {});

  window.firebaseApp = {
    auth,
    db,
    CLOUDINARY_CONFIG: {
      cloudName: "dkbadi6hs",
      uploadPreset: "AuranovaAfrique",
      apiKey: "265822913537625",
    },
    showNotification: function (m, t) { console.log('notify', t || 'info', m); },
    formatPrice: function (a) { return '₦' + (a || 0).toLocaleString('en-NG'); },
    formatDate: function (ts) { return ts && ts.toDate ? ts.toDate().toLocaleDateString() : 'N/A'; },
    formatDateTime: function (ts) { return ts && ts.toDate ? ts.toDate().toLocaleString() : 'N/A'; },
    showLoading: function () {},
    showError: function () {},
    showEmpty: function () {},
  };
}

/* ==========================================
   CLOUDINARY CONFIGURATION
   ========================================== */

const CLOUDINARY_CONFIG = {
  cloudName:
    window.CLOUDINARY_NAME || process.env.REACT_APP_CLOUDINARY_NAME || "",
  uploadPreset:
    window.CLOUDINARY_PRESET || process.env.REACT_APP_CLOUDINARY_PRESET || "", // Create unsigned preset in Cloudinary dashboard
  apiKey: window.CLOUDINARY_KEY || process.env.REACT_APP_CLOUDINARY_KEY || "", // Optional, only needed for signed uploads
};

/* ==========================================
   GLOBAL HELPERS
   ========================================== */

// Show notification
function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <span class="material-icons">${
          type === "success"
            ? "check_circle"
            : type === "error"
              ? "error"
              : type === "warning"
                ? "warning"
                : "info"
        }</span>
        <span>${message}</span>
    `;

  document.body.appendChild(notification);

  // Trigger animation
  setTimeout(() => notification.classList.add("show"), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Format currency
function formatPrice(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

// Format date
function formatDate(timestamp) {
  if (!timestamp) return "N/A";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Format time
function formatDateTime(timestamp) {
  if (!timestamp) return "N/A";

  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleString("en-NG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Show loading state
function showLoading(element, text = "Loading...") {
  if (typeof element === "string") {
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
function showError(element, message = "Something went wrong") {
  if (typeof element === "string") {
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
function showEmpty(element, message = "No data available") {
  if (typeof element === "string") {
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
  showEmpty,
};
