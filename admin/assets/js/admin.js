/* ADMIN DASHBOARD - FIREBASE READY WITH REAL-TIME NOTIFICATIONS */

let adminUser = null;
let notificationSound = null;
let lastOrderCount = 0;

document.addEventListener('DOMContentLoaded', function() {
    checkAdminAuth();
    initSidebar();
    initNotifications();
    loadDashboardData();
    initRealtimeListeners();
});

/* CHECK ADMIN AUTHENTICATION */
function checkAdminAuth() {
    // TODO: Firebase Auth
    // firebase.auth().onAuthStateChanged(async (user) => {
    //     if (!user) {
    //         window.location.href = 'login.html';
    //         return;
    //     }
    //     const db = firebase.firestore();
    //     const userDoc = await db.collection('users').doc(user.uid).get();
    //     if (userDoc.data().role !== 'admin') {
    //         alert('Unauthorized access');
    //         await firebase.auth().signOut();
    //         window.location.href = 'login.html';
    //     }
    //     adminUser = user;
    //     document.getElementById('adminName').textContent = user.displayName || user.email;
    // });
    
    // Mock check
    const admin = localStorage.getItem('admin_user');
    if (!admin) {
        window.location.href = 'login.html';
        return;
    }
    adminUser = JSON.parse(admin);
    document.getElementById('adminName').textContent = adminUser.email;
}

/* SIDEBAR */
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('active');
        });
    }
    
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', function() {
        if (confirm('Are you sure you want to logout?')) {
            // TODO: firebase.auth().signOut();
            localStorage.removeItem('admin_user');
            window.location.href = 'login.html';
        }
    });
}

/* NOTIFICATIONS */
function initNotifications() {
    notificationSound = document.getElementById('notificationSound');
    
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    
    notificationBtn.addEventListener('click', function() {
        notificationPanel.classList.toggle('active');
        loadNotifications();
    });
    
    // Close when clicking outside
    document.addEventListener('click', function(e) {
        if (!notificationBtn.contains(e.target) && !notificationPanel.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });
    
    // Mark all read
    document.getElementById('markAllRead').addEventListener('click', markAllNotificationsRead);
}

/* LOAD DASHBOARD DATA */
async function loadDashboardData() {
    // TODO: Fetch from Firebase
    // const db = firebase.firestore();
    // const ordersSnapshot = await db.collection('orders').get();
    // const productsSnapshot = await db.collection('products').get();
    // const customersSnapshot = await db.collection('users').where('role', '==', 'customer').get();
    
    // Mock data
    const stats = {
        totalOrders: 156,
        totalRevenue: 4580000,
        totalProducts: 48,
        totalCustomers: 234
    };
    
    document.getElementById('totalOrders').textContent = stats.totalOrders;
    document.getElementById('totalRevenue').textContent = `₦${stats.totalRevenue.toLocaleString()}`;
    document.getElementById('totalProducts').textContent = stats.totalProducts;
    document.getElementById('totalCustomers').textContent = stats.totalCustomers;
    
    loadRecentOrders();
    loadTopProducts();
    loadLowStockAlerts();
}

/* LOAD RECENT ORDERS */
function loadRecentOrders() {
    // TODO: Fetch from Firebase
    // const db = firebase.firestore();
    // const orders = await db.collection('orders')
    //     .orderBy('createdAt', 'desc')
    //     .limit(5)
    //     .get();
    
    // Mock data
    const recentOrders = [
        { id: '#ORD-001', customer: 'John Doe', total: 85000, status: 'pending' },
        { id: '#ORD-002', customer: 'Jane Smith', total: 120000, status: 'processing' },
        { id: '#ORD-003', customer: 'Mike Johnson', total: 45000, status: 'completed' }
    ];
    
    const tbody = document.getElementById('recentOrdersTable');
    
    if (recentOrders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No orders yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = recentOrders.map(order => `
        <tr>
            <td><strong>${order.id}</strong></td>
            <td>${order.customer}</td>
            <td>₦${order.total.toLocaleString()}</td>
            <td><span class="status-badge ${order.status}">${order.status}</span></td>
        </tr>
    `).join('');
}

/* LOAD TOP PRODUCTS */
function loadTopProducts() {
    // Mock data
    const topProducts = [
        { name: 'Royal Ebony Kaftan', sales: 45, image: 'product1.jpg' },
        { name: 'Executive Senator', sales: 38, image: 'product2.jpg' },
        { name: 'Aso Oke Classic', sales: 32, image: 'product3.jpg' }
    ];
    
    const container = document.getElementById('topProductsList');
    
    if (topProducts.length === 0) {
        container.innerHTML = '<p class="no-data">No data available</p>';
        return;
    }
    
    container.innerHTML = topProducts.map(product => `
        <div class="product-item">
            <img src="https://via.placeholder.com/60" alt="${product.name}">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-sales">${product.sales} sales</p>
            </div>
        </div>
    `).join('');
}

/* LOAD LOW STOCK ALERTS */
function loadLowStockAlerts() {
    // Mock data
    const lowStockProducts = [
        { name: 'Urban Elite Cap', stock: 3 },
        { name: 'Heritage Face Cap', stock: 5 }
    ];
    
    const container = document.getElementById('lowStockList');
    
    if (lowStockProducts.length === 0) {
        container.innerHTML = '<p class="no-data">All products in stock</p>';
        return;
    }
    
    container.innerHTML = lowStockProducts.map(product => `
        <div class="alert-item">
            <strong>${product.name}</strong>
            <span>Only ${product.stock} units left</span>
        </div>
    `).join('');
}

/* REAL-TIME NOTIFICATIONS LISTENER */
function initRealtimeListeners() {
    // TODO: Firebase Real-time Listener
    // const db = firebase.firestore();
    // db.collection('orders')
    //     .where('status', '==', 'pending')
    //     .onSnapshot((snapshot) => {
    //         snapshot.docChanges().forEach((change) => {
    //             if (change.type === 'added') {
    //                 const order = change.doc.data();
    //                 showNewOrderNotification(order);
    //             }
    //         });
    //     });
    
    // Simulate real-time updates for demo
    setInterval(() => {
        checkForNewOrders();
    }, 30000); // Check every 30 seconds
}

/* CHECK FOR NEW ORDERS */
function checkForNewOrders() {
    // TODO: Replace with real Firebase query
    // For demo: randomly simulate new order
    if (Math.random() > 0.7) { // 30% chance
        const mockOrder = {
            id: `ORD-${Date.now()}`,
            customerName: 'New Customer',
            total: Math.floor(Math.random() * 100000) + 50000,
            createdAt: new Date()
        };
        showNewOrderNotification(mockOrder);
    }
}

/* SHOW NEW ORDER NOTIFICATION */
function showNewOrderNotification(order) {
    // Play sound
    if (notificationSound) {
        notificationSound.play().catch(e => console.log('Sound play failed:', e));
    }
    
    // Add to notification list
    addNotification({
        type: 'new_order',
        title: 'New Order Received!',
        message: `Order ${order.id} from ${order.customerName} - ₦${order.total.toLocaleString()}`,
        time: new Date(),
        unread: true,
        orderId: order.id
    });
    
    // Update badge count
    updateNotificationBadge();
    
    // Show browser notification if permitted
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order!', {
            body: `Order ${order.id} - ₦${order.total.toLocaleString()}`,
            icon: '/favicon.png',
            badge: '/favicon.png'
        });
    }
    
    // Update dashboard stats
    loadDashboardData();
}

/* ADD NOTIFICATION */
function addNotification(notification) {
    let notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications.unshift(notification);
    
    // Keep only last 50 notifications
    notifications = notifications.slice(0, 50);
    
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
}

/* LOAD NOTIFICATIONS */
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const container = document.getElementById('notificationList');
    
    if (notifications.length === 0) {
        container.innerHTML = '<p class="no-notifications">No new notifications</p>';
        return;
    }
    
    container.innerHTML = notifications.map((notif, index) => `
        <div class="notification-item ${notif.unread ? 'unread' : ''}" onclick="handleNotificationClick(${index})">
            <div style="display: flex; gap: 1rem;">
                <div class="icon">
                    <span class="material-icons">${notif.type === 'new_order' ? 'shopping_bag' : 'mail'}</span>
                </div>
                <div style="flex: 1;">
                    <strong>${notif.title}</strong>
                    <p style="font-size: 0.85rem; color: #666; margin: 0.3rem 0;">${notif.message}</p>
                    <small style="color: #999;">${formatTimeAgo(new Date(notif.time))}</small>
                </div>
            </div>
        </div>
    `).join('');
}

/* HANDLE NOTIFICATION CLICK */
function handleNotificationClick(index) {
    let notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    
    if (notifications[index]) {
        notifications[index].unread = false;
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));
        
        // Redirect based on notification type
        if (notifications[index].type === 'new_order') {
            window.location.href = `orders.html?id=${notifications[index].orderId}`;
        }
        
        updateNotificationBadge();
    }
}

/* MARK ALL NOTIFICATIONS READ */
function markAllNotificationsRead() {
    let notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    notifications = notifications.map(n => ({ ...n, unread: false }));
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    updateNotificationBadge();
    loadNotifications();
}

/* UPDATE NOTIFICATION BADGE */
function updateNotificationBadge() {
    const notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    const unreadCount = notifications.filter(n => n.unread).length;
    
    const badge = document.getElementById('notificationCount');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
    
    // Update orders badge
    const ordersBadge = document.getElementById('ordersBadge');
    if (ordersBadge) {
        const pendingOrders = 0; // TODO: Get from Firebase
        ordersBadge.textContent = pendingOrders;
        ordersBadge.style.display = pendingOrders > 0 ? 'flex' : 'none';
    }
}

/* FORMAT TIME AGO */
function formatTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return date.toLocaleDateString();
}

/* REQUEST NOTIFICATION PERMISSION */
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

/* FIREBASE SETUP NOTES:
========================
1. Set up Firestore real-time listeners for 'orders' collection
2. Listen for new documents with status 'pending'
3. Trigger notification when new order detected
4. Store notifications in Firestore for persistence across devices
5. Use Cloud Messaging for push notifications when admin is offline
*/