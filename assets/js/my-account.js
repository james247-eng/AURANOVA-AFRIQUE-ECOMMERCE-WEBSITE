/* MY ACCOUNT PAGE - FIREBASE READY */
let currentUser = null;

document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initTabs();
    initForms();
    loadUserData();
});

/* CHECK AUTHENTICATION */
function checkAuth() {
    // TODO: Firebase auth check
    // firebase.auth().onAuthStateChanged((user) => {
    //     if (user) {
    //         currentUser = user;
    //         loadUserData();
    //     } else {
    //         window.location.href = 'login.html';
    //     }
    // });
    
    // Mock check for now
    const mockUser = localStorage.getItem('auranova_user');
    if (!mockUser) {
        window.location.href = 'login.html';
        return;
    }
    currentUser = JSON.parse(mockUser);
}

/* TABS */
function initTabs() {
    const tabButtons = document.querySelectorAll('.account-nav-item:not(.logout-btn)');
    const tabs = document.querySelectorAll('.account-tab');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Remove active
            tabButtons.forEach(b => b.classList.remove('active'));
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active
            this.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            // Load tab data
            loadTabData(tabName);
        });
    });
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', logout);
}

/* LOAD USER DATA */
function loadUserData() {
    if (!currentUser) return;
    
    // Update UI
    document.getElementById('userName').textContent = currentUser.displayName || currentUser.email;
    document.getElementById('userEmail').textContent = currentUser.email;
    
    // Load dashboard
    loadDashboard();
}

/* LOAD DASHBOARD */
function loadDashboard() {
    // TODO: Fetch from Firebase
    // const db = firebase.firestore();
    // const ordersRef = db.collection('orders').where('userId', '==', currentUser.uid);
    
    // Mock data
    const mockOrders = [];
    const wishlistItems = JSON.parse(localStorage.getItem('auranova_wishlist') || '[]');
    
    document.getElementById('totalOrders').textContent = mockOrders.length;
    document.getElementById('pendingOrders').textContent = mockOrders.filter(o => o.status === 'pending').length;
    document.getElementById('wishlistItems').textContent = wishlistItems.length;
    
    displayRecentOrders(mockOrders.slice(0, 3));
}

/* DISPLAY RECENT ORDERS */
function displayRecentOrders(orders) {
    const container = document.getElementById('recentOrdersList');
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="no-data">No orders yet. <a href="shop.html">Start Shopping</a></p>';
        return;
    }
    
    container.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

/* CREATE ORDER CARD */
function createOrderCard(order) {
    return `
        <div class="order-card">
            <div class="order-header">
                <span class="order-id">Order #${order.id}</span>
                <span class="order-status ${order.status}">${order.status}</span>
            </div>
            <div class="order-details">
                <div class="order-detail">
                    <strong>Date:</strong>
                    <span>${new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div class="order-detail">
                    <strong>Total:</strong>
                    <span>₦${order.total.toLocaleString()}</span>
                </div>
                <div class="order-detail">
                    <strong>Items:</strong>
                    <span>${order.items.length} items</span>
                </div>
            </div>
            <div class="order-actions">
                <button class="btn-view-order" onclick="viewOrder('${order.id}')">View Details</button>
                ${order.status !== 'delivered' ? '<button class="btn-track-order">Track Order</button>' : ''}
            </div>
        </div>
    `;
}

/* LOAD TAB DATA */
function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'profile':
            loadProfile();
            break;
        case 'addresses':
            loadAddresses();
            break;
    }
}

/* LOAD ORDERS */
function loadOrders(status = 'all') {
    // TODO: Fetch from Firebase
    const container = document.getElementById('ordersTable');
    
    // Mock data
    const orders = [];
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="no-data">No orders found. <a href="shop.html">Start Shopping</a></p>';
        return;
    }
    
    container.innerHTML = orders.map(order => createOrderCard(order)).join('');
}

/* LOAD PROFILE */
function loadProfile() {
    const form = document.getElementById('profileForm');
    
    // TODO: Fetch from Firebase
    // const db = firebase.firestore();
    // const userDoc = await db.collection('users').doc(currentUser.uid).get();
    
    // Mock data
    form.firstName.value = currentUser.displayName?.split(' ')[0] || '';
    form.lastName.value = currentUser.displayName?.split(' ')[1] || '';
    form.email.value = currentUser.email;
    form.phone.value = currentUser.phone || '';
}

/* LOAD ADDRESSES */
function loadAddresses() {
    const container = document.getElementById('addressesGrid');
    
    // TODO: Fetch from Firebase
    // const db = firebase.firestore();
    // const addresses = await db.collection('users').doc(currentUser.uid).collection('addresses').get();
    
    // Mock data
    const addresses = [
        {
            id: '1',
            type: 'Home',
            name: 'John Doe',
            address: '123 Fashion Street',
            city: 'Lagos',
            state: 'Lagos',
            phone: '+234 XXX XXX XXXX',
            isDefault: true
        }
    ];
    
    if (addresses.length === 0) {
        container.innerHTML = '<p class="no-data">No saved addresses</p>';
        return;
    }
    
    container.innerHTML = addresses.map(addr => `
        <div class="address-card">
            <div class="address-header">
                <span class="address-type">${addr.type}</span>
                ${addr.isDefault ? '<span class="default-badge">Default</span>' : ''}
            </div>
            <div class="address-details">
                <strong>${addr.name}</strong><br>
                ${addr.address}<br>
                ${addr.city}, ${addr.state}<br>
                ${addr.phone}
            </div>
            <div class="address-actions">
                <button class="btn-edit">Edit</button>
                <button class="btn-delete">Delete</button>
            </div>
        </div>
    `).join('');
}

/* INIT FORMS */
function initForms() {
    // Profile Form
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const updatedData = {
            firstName: profileForm.firstName.value,
            lastName: profileForm.lastName.value,
            phone: profileForm.phone.value
        };
        
        // TODO: Update Firebase
        // const db = firebase.firestore();
        // await db.collection('users').doc(currentUser.uid).update(updatedData);
        // await currentUser.updateProfile({
        //     displayName: `${updatedData.firstName} ${updatedData.lastName}`
        // });
        
        console.log('Profile update:', updatedData);
        window.auranovaFunctions?.showNotification('Profile updated successfully!', 'success');
    });
    
    // Password Form
    const passwordForm = document.getElementById('passwordForm');
    passwordForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newPassword = passwordForm.newPassword.value;
        const confirmPassword = passwordForm.confirmPassword.value;
        
        if (newPassword !== confirmPassword) {
            window.auranovaFunctions?.showNotification('Passwords do not match', 'info');
            return;
        }
        
        // TODO: Update Firebase Auth
        // const currentPassword = passwordForm.currentPassword.value;
        // const credential = firebase.auth.EmailAuthProvider.credential(
        //     currentUser.email,
        //     currentPassword
        // );
        // await currentUser.reauthenticateWithCredential(credential);
        // await currentUser.updatePassword(newPassword);
        
        console.log('Password change requested');
        window.auranovaFunctions?.showNotification('Password changed successfully!', 'success');
        passwordForm.reset();
    });
    
    // Order Filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            loadOrders(this.dataset.status);
        });
    });
}

/* VIEW ORDER */
function viewOrder(orderId) {
    console.log('View order:', orderId);
    window.auranovaFunctions?.showNotification('Order details coming soon!', 'info');
}

/* LOGOUT */
function logout() {
    // TODO: Firebase logout
    // firebase.auth().signOut();
    
    localStorage.removeItem('auranova_user');
    window.auranovaFunctions?.showNotification('Logged out successfully', 'success');
    window.location.href = 'login.html';
}

/* 
FIREBASE INTEGRATION:
====================
1. Fetch user orders from Firestore
2. Update user profile in Firestore
3. Manage addresses collection
4. Change password with Firebase Auth
5. Real-time order status updates
*/