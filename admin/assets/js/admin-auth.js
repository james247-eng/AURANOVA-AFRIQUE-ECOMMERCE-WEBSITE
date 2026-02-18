/* ==========================================
   ADMIN AUTHENTICATION
   Handles login, logout, and role verification
   ========================================== */

const { auth, db, showNotification } = window.firebaseApp;

let currentAdmin = null;

/* ==========================================
   CHECK IF USER IS ADMIN
   ========================================== */
async function checkAdminRole(user) {
  try {
    const userDoc = await db.collection("users").doc(user.uid).get();

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
auth.onAuthStateChanged(async (user) => {
  const currentPage = window.location.pathname.split("/").pop();

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
        showNotification("Access denied. Admin privileges required.", "error");
      }
    }
    return;
  }

  // If on other admin pages
  if (!user) {
    // Not logged in, redirect to login
    window.location.href = "login.html";
    return;
  }

  // User is logged in, verify admin role
  const isAdmin = await checkAdminRole(user);

  if (!isAdmin) {
    // Not an admin, sign out and redirect
    await auth.signOut();
    showNotification("Access denied. Admin privileges required.", "error");
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
   LOGIN FUNCTION
   ========================================== */
async function loginAdmin(email, password) {
  try {
    // Show loading
    const loginBtn = document.getElementById("loginBtn");
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = '<span class="spinner"></span> Logging in...';
    loginBtn.disabled = true;
    // Use Firebase Auth
    if (!auth) throw new Error('Firebase auth not initialized');
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Verify role in Firestore
    const isAdmin = await checkAdminRole(user);
    if (!isAdmin) {
      // Not an admin: sign out and reject
      await auth.signOut();
      showNotification('Access denied. Admin privileges required.', 'error');
      return false;
    }

    // Store minimal admin session for UI convenience
    const adminUser = { uid: user.uid, email: user.email, displayName: user.displayName || email.split('@')[0], role: 'admin' };
    localStorage.setItem('auranova_admin', JSON.stringify(adminUser));
    localStorage.removeItem('auranova_user');

    showNotification('Admin login successful! Redirecting...', 'success');
    setTimeout(() => { window.location.href = 'index.html'; }, 800);
    return true;
  } catch (error) {
    console.error("Login error:", error);

    let errorMessage = "Login failed. Please try again.";

    const loginBtn = document.getElementById("loginBtn");
    const originalText = loginBtn.innerHTML;

    switch (error?.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/wrong-password":
        errorMessage = "Incorrect password.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
      case "auth/user-disabled":
        errorMessage = "This account has been disabled.";
        break;
      case "auth/too-many-requests":
        errorMessage = "Too many failed attempts. Please try again later.";
        break;
    }

    showNotification(errorMessage, "error");

    // Reset button
   // const loginBtn = document.getElementById("loginBtn");
    if (loginBtn) {
      loginBtn.innerHTML = "Login";
      loginBtn.disabled = false;
    }

    return false;
  }
}

/* ==========================================
   LOGOUT FUNCTION
   ========================================== */
async function logoutAdmin() {
  try {
    await auth.signOut();
    showNotification("Logged out successfully", "success");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Logout error:", error);
    showNotification("Logout failed. Please try again.", "error");
  }
}

/* ==========================================
   PASSWORD RESET
   ========================================== */
async function sendPasswordReset(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    showNotification("Password reset email sent. Check your inbox.", "success");
    return true;
  } catch (error) {
    console.error("Password reset error:", error);

    let errorMessage = "Failed to send reset email.";

    switch (error.code) {
      case "auth/user-not-found":
        errorMessage = "No account found with this email.";
        break;
      case "auth/invalid-email":
        errorMessage = "Invalid email address.";
        break;
    }

    showNotification(errorMessage, "error");
    return false;
  }
}

/* ==========================================
   GET CURRENT ADMIN
   ========================================== */
function getCurrentAdmin() {
  return currentAdmin;
}

/* ==========================================
   CHECK IF SUPER ADMIN
   ========================================== */
async function isSuperAdmin() {
  if (!currentAdmin) return false;

  try {
    const userDoc = await db.collection("users").doc(currentAdmin.uid).get();
    return userDoc.exists && userDoc.data().role === "super_admin";
  } catch (error) {
    console.error("Error checking super admin:", error);
    return false;
  }
}

/* ==========================================
   EXPORT FUNCTIONS
   ========================================== */
window.adminAuth = {
  loginAdmin,
  logoutAdmin,
  sendPasswordReset,
  getCurrentAdmin,
  checkAdminRole,
  isSuperAdmin,
};
