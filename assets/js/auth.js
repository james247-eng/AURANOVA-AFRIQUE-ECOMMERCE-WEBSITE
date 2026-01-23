/* AUTH SYSTEM - FIREBASE READY */
document.addEventListener("DOMContentLoaded", function () {
  initPasswordToggles();
  initLoginForm();
  initRegisterForm();
  initGoogleAuth();
});

/* PASSWORD VISIBILITY TOGGLE */
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password");

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.dataset.target;
      const input = document.getElementById(targetId);
      const icon = this.querySelector(".material-icons");

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

/* LOGIN FORM */
function initLoginForm() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value;
    const remember = form.remember?.checked || false;

    const submitBtn = form.querySelector(".btn-auth");

    // Validate email format
    if (!window.InputValidator?.isValidEmail(email)) {
      window.auranovaFunctions?.showNotification(
        "Please enter a valid email address",
        "error",
      );
      return;
    }

    // Validate password not empty
    if (!password || password.length < 6) {
      window.auranovaFunctions?.showNotification(
        "Password must be at least 6 characters",
        "error",
      );
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Logging in...";

    try {
      // TODO: Firebase Auth
      // const auth = firebase.auth();
      // const userCredential = await auth.signInWithEmailAndPassword(email, password);
      // const user = userCredential.user;

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock user data
      const mockUser = {
        uid: "mock_uid_123",
        email: email,
        displayName: "Test User",
      };

      // Store in localStorage
      localStorage.setItem("auranova_user", JSON.stringify(mockUser));

      window.auranovaFunctions?.showNotification(
        "Login successful!",
        "success",
      );

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1000);
    } catch (error) {
      console.error("Login error:", error);
      window.auranovaFunctions?.showNotification(
        "Invalid email or password",
        "info",
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Login";
    }
  });
}

/* REGISTER FORM */
function initRegisterForm() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const password = form.password.value;
    const confirmPassword = form.confirmPassword.value;

    // Validate inputs
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const email = form.email.value.trim();
    const phone = form.phone.value.trim();

    if (!window.InputValidator?.isValidName(firstName)) {
      window.auranovaFunctions?.showNotification(
        "First name is invalid",
        "error",
      );
      return;
    }

    if (!window.InputValidator?.isValidName(lastName)) {
      window.auranovaFunctions?.showNotification(
        "Last name is invalid",
        "error",
      );
      return;
    }

    if (!window.InputValidator?.isValidEmail(email)) {
      window.auranovaFunctions?.showNotification(
        "Email address is invalid",
        "error",
      );
      return;
    }

    if (!window.InputValidator?.isValidPhoneNigeria(phone)) {
      window.auranovaFunctions?.showNotification(
        "Please enter a valid Nigerian phone number",
        "error",
      );
      return;
    }

    if (!window.InputValidator?.isValidPassword(password)) {
      window.auranovaFunctions?.showNotification(
        "Password must have 8+ chars, uppercase, number, and special char",
        "error",
      );
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      window.auranovaFunctions?.showNotification(
        "Passwords do not match",
        "error",
      );
      return;
    }

    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      phone: phone,
      password: password,
      createdAt: new Date().toISOString(),
    };

    const submitBtn = form.querySelector(".btn-auth");
    submitBtn.disabled = true;
    submitBtn.textContent = "Creating Account...";

    try {
      // TODO: Firebase Auth
      // const auth = firebase.auth();
      // const userCredential = await auth.createUserWithEmailAndPassword(userData.email, userData.password);
      // const user = userCredential.user;

      // Update user profile
      // await user.updateProfile({
      //     displayName: `${userData.firstName} ${userData.lastName}`
      // });

      // Store additional user data in Firestore
      // const db = firebase.firestore();
      // await db.collection('users').doc(user.uid).set({
      //     firstName: userData.firstName,
      //     lastName: userData.lastName,
      //     phone: userData.phone,
      //     email: userData.email,
      //     createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      //     role: 'customer'
      // });

      console.log("Registration data (ready for Firebase):", userData);
      // User data prepared for Firebase
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      window.auranovaFunctions?.showNotification(
        "Account created successfully!",
        "success",
      );

      setTimeout(() => {
        window.location.href = "login.html";
      }, 1000);
    } catch (error) {
      console.error("Registration error:", error);
      // Handle specific Firebase errors
      let errorMessage = "Registration failed. Please try again.";

      // TODO: Handle Firebase error codes
      // if (error.code === 'auth/email-already-in-use') {
      //     errorMessage = 'Email already in use';
      // } else if (error.code === 'auth/weak-password') {
      //     errorMessage = 'Password is too weak';
      // }

      window.auranovaFunctions?.showNotification(errorMessage, "info");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Create Account";
    }
  });
}

/* GOOGLE AUTH */
function initGoogleAuth() {
  const googleLoginBtn = document.getElementById("googleLogin");
  const googleRegisterBtn = document.getElementById("googleRegister");

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", handleGoogleAuth);
  }

  if (googleRegisterBtn) {
    googleRegisterBtn.addEventListener("click", handleGoogleAuth);
  }
}

async function handleGoogleAuth() {
  try {
    // TODO: Firebase Google Auth
    // const provider = new firebase.auth.GoogleAuthProvider();
    // const result = await firebase.auth().signInWithPopup(provider);
    // const user = result.user;

    // Check if new user, store additional data in Firestore
    // const db = firebase.firestore();
    // const userDoc = await db.collection('users').doc(user.uid).get();

    // if (!userDoc.exists) {
    //     await db.collection('users').doc(user.uid).set({
    //         email: user.email,
    //         displayName: user.displayName,
    //         photoURL: user.photoURL,
    //         createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    //         role: 'customer'
    //     });
    // }

    console.log("Google auth triggered");
    window.auranovaFunctions?.showNotification(
      "Google sign-in coming soon!",
      "info",
    );
  } catch (error) {
    console.error("Google auth error:", error);
    window.auranovaFunctions?.showNotification("Google sign-in failed", "info");
  }
}
/* CHECK AUTH STATE */
function checkAuthState() {
  // TODO: Firebase Auth State Observer
  // firebase.auth().onAuthStateChanged((user) => {
  //     if (user) {
  //         console.log('User is signed in:', user);
  //         // User is signed in
  //     } else {
  //         console.log('User is signed out');
  //         // User is signed out
  //     }
  // });

  // For now, check localStorage
  const user = localStorage.getItem("auranova_user");
  return user ? JSON.parse(user) : null;
}

/* LOGOUT */
function logout() {
  // TODO: Firebase Auth
  // firebase.auth().signOut();

  localStorage.removeItem("auranova_user");
  window.auranovaFunctions?.showNotification(
    "Logged out successfully",
    "success",
  );
  window.location.href = "login.html";
}

/* 
FIREBASE SETUP CHECKLIST:
========================
1. Create Firebase project
2. Enable Authentication (Email/Password & Google)
3. Create Firestore database
4. Set up security rules
5. Add Firebase config to project
6. Initialize Firebase in HTML before this script
7. Replace mock functions with real Firebase calls

FIRESTORE STRUCTURE:
====================
/users/{userId}
  - firstName
  - lastName
  - email
  - phone
  - photoURL
  - createdAt
  - role (customer/admin)
  
/orders/{orderId}
  - userId
  - items[]
  - total
  - status
  - createdAt
  
/products/{productId}
  - name
  - category
  - price
  - images[]
  - stock
  - createdAt
*/
