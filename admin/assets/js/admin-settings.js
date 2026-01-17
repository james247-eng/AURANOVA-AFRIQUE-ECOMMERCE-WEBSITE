/* ==========================================
   ADMIN SETTINGS
   ========================================== */

const { auth, db, showNotification } = window.firebaseApp;

let currentAdmin = null;

/* ==========================================
   PAGE LOAD
   ========================================== */
window.loadPageData = async function() {
    currentAdmin = auth.currentUser;
    
    if (!currentAdmin) {
        window.location.href = 'login.html';
        return;
    }
    
    initializeTabs();
    await loadSettings();
    loadAdminProfile();
    initializeForms();
};

/* ==========================================
   INITIALIZE TABS
   ========================================== */
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.settings-tab');
    const panels = document.querySelectorAll('.settings-panel');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remove active class from all
            tabButtons.forEach(btn => btn.classList.remove('active'));
            panels.forEach(panel => panel.classList.remove('active'));
            
            // Add active to clicked
            this.classList.add('active');
            document.getElementById(`${tabName}-panel`).classList.add('active');
        });
    });
}

/* ==========================================
   LOAD SETTINGS FROM FIRESTORE
   ========================================== */
async function loadSettings() {
    try {
        const settingsDoc = await db.collection('settings').doc('store').get();
        
        if (settingsDoc.exists) {
            const settings = settingsDoc.data();
            populateStoreSettings(settings);
            populateShippingSettings(settings);
        }
        
    } catch (error) {
        console.error('Error loading settings:', error);
        // Continue with defaults if settings don't exist yet
    }
}

/* ==========================================
   POPULATE STORE SETTINGS
   ========================================== */
function populateStoreSettings(settings) {
    const form = document.getElementById('storeInfoForm');
    
    if (settings.storeName) form.storeName.value = settings.storeName;
    if (settings.storeEmail) form.storeEmail.value = settings.storeEmail;
    if (settings.storePhone) form.storePhone.value = settings.storePhone;
    if (settings.storeAddress) form.storeAddress.value = settings.storeAddress;
    
    // Social media
    if (settings.instagram) form.instagram.value = settings.instagram;
    if (settings.facebook) form.facebook.value = settings.facebook;
    if (settings.twitter) form.twitter.value = settings.twitter;
    if (settings.whatsapp) form.whatsapp.value = settings.whatsapp;
}

/* ==========================================
   POPULATE SHIPPING SETTINGS
   ========================================== */
function populateShippingSettings(settings) {
    const form = document.getElementById('shippingSettingsForm');
    
    if (settings.deliveryFee !== undefined) {
        form.deliveryFee.value = settings.deliveryFee;
    }
    
    if (settings.freeShippingThreshold !== undefined) {
        form.freeShippingThreshold.value = settings.freeShippingThreshold;
    }
    
    if (settings.deliveryTime) {
        form.deliveryTime.value = settings.deliveryTime;
    }
    
    if (settings.deliveryZones) {
        form.deliveryZones.value = settings.deliveryZones;
    }
}

/* ==========================================
   LOAD ADMIN PROFILE
   ========================================== */
function loadAdminProfile() {
    if (!currentAdmin) return;
    
    document.getElementById('profileName').textContent = currentAdmin.displayName || 'Admin';
    document.getElementById('profileEmail').textContent = currentAdmin.email;
}

/* ==========================================
   INITIALIZE FORMS
   ========================================== */
function initializeForms() {
    // Store Info Form
    const storeForm = document.getElementById('storeInfoForm');
    storeForm.addEventListener('submit', handleStoreInfoSubmit);
    
    // Shipping Settings Form
    const shippingForm = document.getElementById('shippingSettingsForm');
    shippingForm.addEventListener('submit', handleShippingSettingsSubmit);
    
    // Change Password Form
    const passwordForm = document.getElementById('changePasswordForm');
    passwordForm.addEventListener('submit', handleChangePassword);
}

/* ==========================================
   HANDLE STORE INFO SUBMIT
   ========================================== */
async function handleStoreInfoSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
    submitBtn.disabled = true;
    
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
        showNotification('Failed to save store information', 'error');
    }
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}

/* ==========================================
   HANDLE SHIPPING SETTINGS SUBMIT
   ========================================== */
async function handleShippingSettingsSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData(form);
        const settings = {
            deliveryFee: parseFloat(formData.get('deliveryFee')),
            freeShippingThreshold: parseFloat(formData.get('freeShippingThreshold')),
            deliveryTime: formData.get('deliveryTime'),
            deliveryZones: formData.get('deliveryZones'),
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection('settings').doc('store').set(settings, { merge: true });
        
        showNotification('Shipping settings updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving shipping settings:', error);
        showNotification('Failed to save shipping settings', 'error');
    }
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}

/* ==========================================
   HANDLE CHANGE PASSWORD
   ========================================== */
async function handleChangePassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;
    
    // Validate passwords match
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    // Validate password length
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }
    
    submitBtn.innerHTML = '<span class="spinner"></span> Updating...';
    submitBtn.disabled = true;
    
    try {
        // Re-authenticate user first
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentAdmin.email,
            currentPassword
        );
        
        await currentAdmin.reauthenticateWithCredential(credential);
        
        // Update password
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
            errorMessage = 'Please logout and login again before changing password';
        }
        
        showNotification(errorMessage, 'error');
    }
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
}