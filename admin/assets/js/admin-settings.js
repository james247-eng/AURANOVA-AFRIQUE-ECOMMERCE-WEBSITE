/* ==========================================
   ADMIN SETTINGS
   ========================================== */

let currentAdmin = null;

/* ==========================================
   WAIT FOR FIREBASE
   ========================================== */
function waitForFirebase(callback) {
    if (window.firebaseApp && window.firebaseApp.auth && window.firebaseApp.db) {
        callback();
    } else {
        setTimeout(function () { waitForFirebase(callback); }, 100);
    }
}

/* ==========================================
   PAGE LOAD
   ========================================== */
window.loadPageData = async function () {
    waitForFirebase(async function () {
        const { auth } = window.firebaseApp;

        currentAdmin = auth.currentUser;

        if (!currentAdmin) {
            window.location.href = 'login.html';
            return;
        }

        initializeTabs();
        await loadSettings();
        loadAdminProfile();
        initializeForms();
    });
};

/* ==========================================
   INITIALIZE TABS
   ========================================== */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.settings-tab');
    const panels = document.querySelectorAll('.settings-panel');

    tabButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            const tabName = this.dataset.tab;

            tabButtons.forEach(function (btn) { btn.classList.remove('active'); });
            panels.forEach(function (panel) { panel.classList.remove('active'); });

            button.classList.add('active');

            const targetPanel = document.getElementById(tabName + '-panel');
            if (targetPanel) targetPanel.classList.add('active');
        });
    });
}

/* ==========================================
   LOAD SETTINGS FROM FIRESTORE
   ========================================== */
async function loadSettings() {
    const { db } = window.firebaseApp;

    try {
        const settingsDoc = await db.collection('settings').doc('store').get();

        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            populateStoreSettings(settings);
            populateShippingSettings(settings);
        }

    } catch (error) {
        console.error('Error loading settings:', error);
        // Continue with empty defaults if settings don't exist yet
    }
}

/* ==========================================
   POPULATE STORE SETTINGS
   ========================================== */
function populateStoreSettings(settings) {
    const form = document.getElementById('storeInfoForm');
    if (!form) return;

    if (settings.storeName && form.storeName) form.storeName.value = settings.storeName;
    if (settings.storeEmail && form.storeEmail) form.storeEmail.value = settings.storeEmail;
    if (settings.storePhone && form.storePhone) form.storePhone.value = settings.storePhone;
    if (settings.storeAddress && form.storeAddress) form.storeAddress.value = settings.storeAddress;
    if (settings.instagram && form.instagram) form.instagram.value = settings.instagram;
    if (settings.facebook && form.facebook) form.facebook.value = settings.facebook;
    if (settings.twitter && form.twitter) form.twitter.value = settings.twitter;
    if (settings.whatsapp && form.whatsapp) form.whatsapp.value = settings.whatsapp;
}

/* ==========================================
   POPULATE SHIPPING SETTINGS
   ========================================== */
function populateShippingSettings(settings) {
    const form = document.getElementById('shippingSettingsForm');
    if (!form) return;

    if (settings.deliveryFee !== undefined && form.deliveryFee) {
        form.deliveryFee.value = settings.deliveryFee;
    }
    if (settings.freeShippingThreshold !== undefined && form.freeShippingThreshold) {
        form.freeShippingThreshold.value = settings.freeShippingThreshold;
    }
    if (settings.deliveryTime && form.deliveryTime) {
        form.deliveryTime.value = settings.deliveryTime;
    }
    if (settings.deliveryZones && form.deliveryZones) {
        form.deliveryZones.value = settings.deliveryZones;
    }
}

/* ==========================================
   LOAD ADMIN PROFILE
   ========================================== */
function loadAdminProfile() {
    if (!currentAdmin) return;

    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');

    if (profileName) profileName.textContent = currentAdmin.displayName || 'Admin';
    if (profileEmail) profileEmail.textContent = currentAdmin.email;
}

/* ==========================================
   INITIALIZE FORMS
   ========================================== */
function initializeForms() {
    const storeForm = document.getElementById('storeInfoForm');
    if (storeForm) storeForm.addEventListener('submit', handleStoreInfoSubmit);

    const shippingForm = document.getElementById('shippingSettingsForm');
    if (shippingForm) shippingForm.addEventListener('submit', handleShippingSettingsSubmit);

    const passwordForm = document.getElementById('changePasswordForm');
    if (passwordForm) passwordForm.addEventListener('submit', handleChangePassword);
}

/* ==========================================
   HANDLE STORE INFO SUBMIT
   ========================================== */
async function handleStoreInfoSubmit(e) {
    e.preventDefault();
    const { db, showNotification } = window.firebaseApp;

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
        submitBtn.disabled = true;
    }

    try {
        const formData = new FormData(form);

        const settings = {
            storeName: formData.get('storeName'),
            storeEmail: formData.get('storeEmail'),
            storePhone: formData.get('storePhone'),
            storeAddress: formData.get('storeAddress'),
            instagram: formData.get('instagram'),
            facebook: formData.get('facebook'),
            twitter: formData.get('twitter'),
            whatsapp: formData.get('whatsapp'),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('settings').doc('store').set(settings, { merge: true });
        showNotification('Store information updated successfully!', 'success');

    } catch (error) {
        console.error('Error saving store info:', error);
        window.firebaseApp.showNotification('Failed to save store information', 'error');
    }

    if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/* ==========================================
   HANDLE SHIPPING SETTINGS SUBMIT
   ========================================== */
async function handleShippingSettingsSubmit(e) {
    e.preventDefault();
    const { db, showNotification } = window.firebaseApp;

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
        submitBtn.disabled = true;
    }

    try {
        const formData = new FormData(form);

        const settings = {
            deliveryFee: parseFloat(formData.get('deliveryFee')) || 0,
            freeShippingThreshold: parseFloat(formData.get('freeShippingThreshold')) || 0,
            deliveryTime: formData.get('deliveryTime'),
            deliveryZones: formData.get('deliveryZones'),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('settings').doc('store').set(settings, { merge: true });
        showNotification('Shipping settings updated successfully!', 'success');

    } catch (error) {
        console.error('Error saving shipping settings:', error);
        window.firebaseApp.showNotification('Failed to save shipping settings', 'error');
    }

    if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

/* ==========================================
   HANDLE CHANGE PASSWORD
   ========================================== */
async function handleChangePassword(e) {
    e.preventDefault();
    const { showNotification } = window.firebaseApp;

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }

    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }

    if (submitBtn) {
        submitBtn.innerHTML = '<span class="spinner"></span> Updating...';
        submitBtn.disabled = true;
    }

    try {
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentAdmin.email,
            currentPassword
        );

        await currentAdmin.reauthenticateWithCredential(credential);
        await currentAdmin.updatePassword(newPassword);

        showNotification('Password updated successfully!', 'success');
        form.reset();

    } catch (error) {
        console.error('Error changing password:', error);

        let errorMessage = 'Failed to update password';
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Current password is incorrect';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'Password is too weak';
        } else if (error.code === 'auth/requires-recent-login') {
            errorMessage = 'Please logout and login again before changing your password';
        }

        window.firebaseApp.showNotification(errorMessage, 'error');
    }

    if (submitBtn) {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}