/* AUTH SYSTEM - FIREBASE BACKED
   - Login/Register use Firebase Auth + Firestore
   - Session stored briefly in localStorage as `auranova_user` for UI
   - Role-based redirect: admin -> /admin, others -> /pages/my-account.html
*/

document.addEventListener("DOMContentLoaded", function () {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
  initGoogleAuth();
});

function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password");
  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      const icon = this.querySelector(".material-icons");
      if (!input) return;
      if (input.type === "password") {
        input.type = "text";
        icon.textContent = "visibility_off";
      } else {
        input.type = "password";
        icon.textContent = "visibility";
      }
    });
  });
}

/* LOGIN */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = form.email.value.trim();
    const password = form.password.value;
    const submitBtn = form.querySelector(".btn-auth");

    if (!window.InputValidator?.isValidEmail(email)) {
      window.auranovaFunctions?.showNotification("Please enter a valid email address", "error");
      return;
    }
    if (!password || password.length < 6) {
      window.auranovaFunctions?.showNotification("Password must be at least 6 characters", "error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      if (!window.firebaseApp?.auth || !window.firebaseApp?.db) throw new Error('Firebase not initialized');
      const auth = window.firebaseApp.auth;
      const db = window.firebaseApp.db;

      const cred = await auth.signInWithEmailAndPassword(email, password);
      const user = cred.user;
      const userDoc = await db.collection('users').doc(user.uid).get();
      const userData = userDoc.exists ? userDoc.data() : { role: 'auranove_user' };

      const sessionUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || userData.firstName || 'User',
        role: userData.role || 'auranove_user'
      };

      localStorage.setItem('auranova_user', JSON.stringify(sessionUser));

      window.auranovaFunctions?.showNotification('Login successful!', 'success');

      setTimeout(() => {
        if (sessionUser.role === 'admin' || sessionUser.role === 'super_admin') {
          window.location.href = '../admin/index.html';
        } else {
          window.location.href = 'my-account.html';
        }
      }, 700);
    } catch (err) {
      console.error('Login error:', err);
      let errorMsg = 'Invalid email or password';
      if (err.code === 'auth/user-not-found') errorMsg = 'No account found with this email';
      if (err.code === 'auth/wrong-password') errorMsg = 'Incorrect password';
      if (err.code === 'auth/invalid-email') errorMsg = 'Invalid email format';
      window.auranovaFunctions?.showNotification(errorMsg, 'info');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Login';
    }
  });
}

/* REGISTER */
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();
    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    if (!window.InputValidator?.isValidName(firstName)) return window.auranovaFunctions?.showNotification('First name is invalid','error');
    if (!window.InputValidator?.isValidName(lastName)) return window.auranovaFunctions?.showNotification('Last name is invalid','error');
    if (!window.InputValidator?.isValidEmail(email)) return window.auranovaFunctions?.showNotification('Email address is invalid','error');
    if (!window.InputValidator?.isValidPhoneNigeria(phone)) return window.auranovaFunctions?.showNotification('Please enter a valid Nigerian phone number','error');
    if (!window.InputValidator?.isValidPassword(password)) return window.auranovaFunctions?.showNotification('Password must have 8+ chars, uppercase, number, and special char','error');
    if (password !== confirmPassword) return window.auranovaFunctions?.showNotification('Passwords do not match','error');

    const submitBtn = form.querySelector('.btn-auth');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
      if (!window.firebaseApp?.auth || !window.firebaseApp?.db) throw new Error('Firebase not initialized');
      const auth = window.firebaseApp.auth;
      const db = window.firebaseApp.db;

      const cred = await auth.createUserWithEmailAndPassword(email, password);
      const user = cred.user;

      await user.updateProfile({ displayName: `${firstName} ${lastName}` });

      await db.collection('users').doc(user.uid).set({
        firstName,
        lastName,
        phone,
        email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        role: 'auranove_user'
      });

      const sessionUser = { uid: user.uid, email: user.email, displayName: `${firstName} ${lastName}`, role: 'auranove_user' };
      localStorage.setItem('auranova_user', JSON.stringify(sessionUser));

      window.auranovaFunctions?.showNotification('Account created successfully!', 'success');
      setTimeout(() => { window.location.href = 'my-account.html'; }, 700);
    } catch (err) {
      console.error('Registration error:', err);
      let msg = 'Registration failed. Please try again.';
      if (err.code === 'auth/email-already-in-use') msg = 'Email already in use';
      if (err.code === 'auth/weak-password') msg = 'Password is too weak';
      if (err.code === 'auth/invalid-email') msg = 'Invalid email format';
      window.auranovaFunctions?.showNotification(msg, 'info');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Account';
    }
  });
}

/* GOOGLE AUTH placeholder */
function initGoogleAuth() {
  const googleLoginBtn = document.getElementById('googleLogin');
  const googleRegisterBtn = document.getElementById('googleRegister');
  if (googleLoginBtn) googleLoginBtn.addEventListener('click', handleGoogleAuth);
  if (googleRegisterBtn) googleRegisterBtn.addEventListener('click', handleGoogleAuth);
}
async function handleGoogleAuth() {
  window.auranovaFunctions?.showNotification('Google sign-in coming soon!', 'info');
}

/* Returns session user previously stored (synchronous helper) */
function checkAuthState() {
  const user = localStorage.getItem('auranova_user');
  return user ? JSON.parse(user) : null;
}

/* Logout - Firebase signOut + clear session */
async function logout() {
  try {
    if (window.firebaseApp?.auth) await window.firebaseApp.auth.signOut();
  } catch (e) {
    console.error('Firebase signOut failed', e);
  }
  localStorage.removeItem('auranova_user');
  window.auranovaFunctions?.showNotification('Logged out successfully', 'success');
  window.location.href = 'login.html';
}

window.auranovaAuth = { checkAuthState, logout };
