/* ==========================================
admin/assets/js/admin-auth-new.js
   ADMIN AUTHENTICATION (using public auth)
   - Uses window.firebaseApp from shared firebaseConfig.js
   - Role-based access control (admin/super_admin only)
   - Redirects non-admin users to login
   ========================================== */

let currentAdmin = null;

// Safe access to firebase services (with multiple retries)
function getFirebaseServices() {
  if (window.firebaseApp && window.firebaseApp.auth && window.firebaseApp.db) {
    return { auth: window.firebaseApp.auth, db: window.firebaseApp.db };
  }
  return null;
}

/* ==========================================
   CHECK IF USER IS ADMIN
   ========================================== */
async function checkAdminRole(user) {
  const services = getFirebaseServices();
  if (!services) {
    console.error('Firebase services not initialized');
    return false;
  }

  try {
    const userDoc = await services.db.collection("users").doc(user.uid).get();

    if (!userDoc.exists) {
      console.error("User document not found");
      return false;
    }

    const userData = userDoc.data();
    return userData.role === "admin" || userData.role === "super_admin";
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
}

/* ==========================================
   AUTH STATE LISTENER
   ========================================== */
function initAdminAuthGuard() {
  const services = getFirebaseServices();
  if (!services) {
    console.error('Firebase not ready. Admin auth guard cannot initialize.');
    setTimeout(initAdminAuthGuard, 500); // Retry
    return;
  }

  const { auth, db } = services;
  const currentPage = window.location.pathname.split("/").pop();

  // Listen for auth changes
  auth.onAuthStateChanged(async (user) => {
    // If on login page
    if (currentPage === "login.html") {
      if (user) {
        // Check if user is admin
        const isAdmin = await checkAdminRole(user);

        if (isAdmin) {
          // Redirect to dashboard
          window.location.href = "index.html";
        } else {
          // Not an admin, sign out
          await auth.signOut();
          const msg = "Access denied. Admin privileges required.";
          console.warn(msg);
        }
      }
      return;
    }

    // If on other admin pages
    if (!user) {
      // Not logged in, redirect to login
      console.warn('No auth user on admin page. Redirecting to login.');
      window.location.href = "login.html";
      return;
    }

    // User is logged in, verify admin role
    const isAdmin = await checkAdminRole(user);

    if (!isAdmin) {
      // Not an admin, sign out and redirect
      await auth.signOut();
      const msg = "Access denied. Admin privileges required.";
      console.warn(msg);
      window.location.href = "login.html";
      return;
    }

    // User is admin, proceed
    currentAdmin = user;

    // Update UI with admin info
    updateAdminUI(user);

    // Load page-specific data
    if (typeof loadPageData === "function") {
      loadPageData();
    }
  });
}

/* ==========================================
   UPDATE ADMIN UI
   ========================================== */
function updateAdminUI(user) {
  const adminNameElements = document.querySelectorAll("#adminName");

  adminNameElements.forEach((el) => {
    el.textContent = user.displayName || user.email.split("@")[0];
  });
}

/* ==========================================
   GET CURRENT ADMIN
   ========================================== */
function getCurrentAdmin() {
  return currentAdmin;
}

/* ==========================================
   LOGOUT FUNCTION
   ========================================== */
async function logoutAdmin() {
  const services = getFirebaseServices();
  if (!services) return;

  try {
    await services.auth.signOut();
    console.log("Logged out successfully");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    window.location.href = "login.html";
  }
}

/* ==========================================
   INITIALIZE ON DOM READY
   ========================================== */
document.addEventListener("DOMContentLoaded", function () {
  // Wait a bit for firebaseConfig.js to initialize window.firebaseApp
  setTimeout(() => {
    if (window.firebaseApp && window.firebaseApp.auth) {
      initAdminAuthGuard();
    } else {
      console.error("Firebase not initialized yet.");
    }
  }, 100);
});

/* ==========================================
   EXPORT FUNCTIONS
   ==========================================*/
window.adminAuth = {
  checkAdminRole,
  getCurrentAdmin,
  logoutAdmin,
};
