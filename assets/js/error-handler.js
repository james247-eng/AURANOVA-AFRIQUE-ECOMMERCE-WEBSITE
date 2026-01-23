/* ==========================================
   ERROR HANDLING UTILITY
   For AURANOVA-AFRIQUE
   ========================================== */

const ErrorHandler = {
  // Log errors safely (without exposing sensitive info)
  log: function (error, context = "") {
    const errorInfo = {
      message: error?.message || "Unknown error",
      context: context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent.substring(0, 100),
    };

    // In production, send to error tracking service (Sentry, etc)
    // if (window.location.hostname !== 'localhost') {
    //     this.sendToErrorTracking(errorInfo);
    // }
  },

  // Handle Firebase errors
  handleFirebaseError: function (error) {
    const errorCode = error?.code || "unknown";
    const userMessage = this.getFirebaseErrorMessage(errorCode);
    return userMessage;
  },

  // Get user-friendly Firebase error messages
  getFirebaseErrorMessage: function (errorCode) {
    const messages = {
      "auth/user-not-found": "Email not found. Please check and try again.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      "auth/email-already-in-use": "This email is already registered.",
      "auth/weak-password": "Password is too weak. Use at least 6 characters.",
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/operation-not-allowed": "This operation is not allowed.",
      "auth/too-many-requests":
        "Too many failed attempts. Please try again later.",
      "auth/network-request-failed":
        "Network error. Please check your connection.",
      "firestore/permission-denied":
        "You do not have permission to access this resource.",
      "firestore/not-found": "The requested resource was not found.",
      "firestore/already-exists": "This resource already exists.",
      "firestore/unavailable":
        "Service is temporarily unavailable. Please try again.",
      "storage/object-not-found": "File not found.",
      "storage/unauthorized": "You are not authorized to access this file.",
      "storage/canceled": "Upload was cancelled.",
    };

    return messages[errorCode] || "Something went wrong. Please try again.";
  },

  // Handle network errors
  handleNetworkError: function (error) {
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("Network")
    ) {
      return "Network error. Please check your internet connection.";
    }
    return "Connection error. Please try again.";
  },

  // Retry failed async operations
  retryAsync: function (asyncFn, maxRetries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
      const attempt = (retryCount) => {
        asyncFn()
          .then(resolve)
          .catch((error) => {
            if (retryCount < maxRetries) {
              setTimeout(() => attempt(retryCount + 1), delay);
            } else {
              reject(error);
            }
          });
      };
      attempt(0);
    });
  },

  // Wrap async function with error handling
  wrapAsync: function (asyncFn) {
    return async function (...args) {
      try {
        return await asyncFn(...args);
      } catch (error) {
        ErrorHandler.log(error, asyncFn.name);
        throw error;
      }
    };
  },

  // Handle form submission errors
  handleFormError: function (error, form) {
    const errorElement = form?.querySelector("[data-error]");
    if (errorElement) {
      errorElement.textContent = this.getErrorMessage(error);
      errorElement.style.display = "block";
    }
  },

  // Generic error message getter
  getErrorMessage: function (error) {
    if (typeof error === "string") return error;
    if (error?.message) return error.message;
    return "An unexpected error occurred. Please try again.";
  },

  // Send error to tracking service (setup needed)
  sendToErrorTracking: function (errorInfo) {
    // Implement error tracking service integration
    // Example: Sentry, LogRocket, etc.
    // if (window.Sentry) {
    //     Sentry.captureException(errorInfo);
    // }
  },
};

// Export for use
if (typeof window !== "undefined") {
  window.ErrorHandler = ErrorHandler;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = ErrorHandler;
}
