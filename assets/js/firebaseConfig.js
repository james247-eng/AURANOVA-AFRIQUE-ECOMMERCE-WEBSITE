/* ==========================================
   FIREBASE CONFIGURATION (SHARED)
   Used by both admin and client pages
   ========================================== */

// Get Firebase config from environment variables
// For Vercel: Add these as environment variables in project settings
const firebaseConfig = {
  apiKey: window.FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain:
    window.FIREBASE_AUTH_DOMAIN || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId:
    window.FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket:
    window.FIREBASE_STORAGE_BUCKET ||
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId:
    window.FIREBASE_MESSAGING_SENDER_ID ||
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: window.FIREBASE_APP_ID || process.env.REACT_APP_FIREBASE_APP_ID,
};

// Validate Firebase config
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error(
    "Firebase configuration is missing. Please set environment variables.",
  );
  console.error(
    "Required variables: FIREBASE_API_KEY, FIREBASE_PROJECT_ID, etc.",
  );
}

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

// Enable offline persistence
db.enablePersistence().catch((err) => {
  if (err.code === "failed-precondition") {
    // Multiple tabs open - offline persistence disabled
  } else if (err.code === "unimplemented") {
    // Offline persistence not available in this browser
  }
});

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
