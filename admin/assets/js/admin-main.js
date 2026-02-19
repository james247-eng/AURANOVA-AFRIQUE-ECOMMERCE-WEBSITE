/* ==========================================
   ADMIN DASHBOARD - REAL FIREBASE QUERIES
   ========================================== */

let adminUser = null;
let notificationSound = null;
let unsubscribeOrders = null;

document.addEventListener('DOMContentLoaded', function () {
    waitForFirebase(function () {
        checkAdminAuth();
        initSidebar();
        initNotifications();
    });
});

/* ==========================================
   WAIT FOR FIREBASE (fixes timing/race condition)
   ========================================== */
function waitForFirebase(callback) {
    if (window.firebaseApp && window.firebaseApp.auth && window.firebaseApp.db) {
        callback();
    } else {
        setTimeout(function () {
            waitForFirebase(callback);
        }, 100);
    }
}

/* ==========================================
   CHECK ADMIN AUTHENTICATION
   ========================================== */
function checkAdminAuth() {
    const { auth, db } = window.firebaseApp;

    auth.onAuthStateChanged(async function (user) {
        if (!user) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const userDoc = await db.collection('users').doc(user.uid).get();
            const role = userDoc.exists ? userDoc.data().role : null;

            if (role !== 'admin' && role !== 'super_admin') {
                await auth.signOut();
                alert('Unauthorized access');
                window.location.href = 'login.html';
                return;
            }

            adminUser = user;

            const adminNameEl = document.getElementById('adminName');
            if (adminNameEl) {
           //     adminNameEl.textContent = user.displayName || user.email.split('@')[0];
            }

            // Only load dashboard data if we are on the dashboard page
            const isDashboard = !!document.getElementById('totalOrders');
            if (isDashboard) {
                loadDashboardData();
                initRealtimeListeners();
            }

            // Call page-specific data loader if it exists (orders, products, etc.)
            if (typeof loadPageData === 'function') {
                loadPageData();
            }

        } catch (err) {
            console.error('Error verifying admin role:', err);
            window.location.href = 'login.html';
        }
    });
}

/* ==========================================
   SIDEBAR
   ========================================== */
function initSidebar() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
            if (sidebarOverlay) {
                sidebarOverlay.classList.toggle('active');
            }
        });

        sidebar.querySelectorAll('.nav-item').forEach(function (item) {
            item.addEventListener('click', function () {
                sidebar.classList.remove('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.remove('active');
                }
            });
        });
    }

    // Close sidebar when overlay is clicked
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', function () {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async function () {
            if (confirm('Are you sure you want to logout?')) {
                try {
                    if (window.firebaseApp?.auth) {
                        await window.firebaseApp.auth.signOut();
                    }
                    localStorage.removeItem('admin_user');
                    window.location.href = 'login.html';
                } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = 'login.html';
                }
            }
        });
    }
}

/* ==========================================
   LOAD DASHBOARD DATA (ALL FROM FIRESTORE)
   ========================================== */
async function loadDashboardData() {
    const { db } = window.firebaseApp;

    try {
        const [ordersSnapshot, productsSnapshot, customersSnapshot] = await Promise.all([
            db.collection('orders').get(),
            db.collection('products').get(),
            db.collection('users').where('role', '==', 'customer').get()
        ]);

        // --- TOTAL ORDERS ---
        const totalOrders = ordersSnapshot.size;
        const totalOrdersEl = document.getElementById('totalOrders');
        if (totalOrdersEl) totalOrdersEl.textContent = totalOrders;

        // --- TOTAL REVENUE ---
        let totalRevenue = 0;
        const allOrders = [];
        ordersSnapshot.forEach(function (doc) {
            const order = { id: doc.id, ...doc.data() };
            allOrders.push(order);
            totalRevenue += order.total || 0;
        });
        const totalRevenueEl = document.getElementById('totalRevenue');
        if (totalRevenueEl) totalRevenueEl.textContent = '₦' + totalRevenue.toLocaleString('en-NG');

        // --- TOTAL PRODUCTS ---
        const totalProducts = productsSnapshot.size;
        const totalProductsEl = document.getElementById('totalProducts');
        if (totalProductsEl) totalProductsEl.textContent = totalProducts;

        // --- TOTAL CUSTOMERS ---
        const totalCustomers = customersSnapshot.size;
        const totalCustomersEl = document.getElementById('totalCustomers');
        if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;

        // --- BUILD PRODUCTS ARRAY ---
        const allProducts = [];
        productsSnapshot.forEach(function (doc) {
            allProducts.push({ id: doc.id, ...doc.data() });
        });

        // --- LOAD SUB-SECTIONS ---
        loadRecentOrders(allOrders);
        loadTopProducts(allOrders, allProducts);
        loadLowStockAlerts(allProducts);

        // --- ORDERS BADGE ---
        const pendingCount = allOrders.filter(function (o) {
            return o.status === 'pending';
        }).length;
        updateOrdersBadge(pendingCount);

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

/* ==========================================
   RECENT ORDERS TABLE
   ========================================== */
function loadRecentOrders(allOrders) {
    const tbody = document.getElementById('recentOrdersTable');
    if (!tbody) return;

    const sorted = allOrders
        .filter(function (o) { return o.createdAt; })
        .sort(function (a, b) {
            const dateA = a.createdAt.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
            const dateB = b.createdAt.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
            return dateB - dateA;
        })
        .slice(0, 5);

    if (sorted.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">No orders yet</td></tr>';
        return;
    }

    tbody.innerHTML = sorted.map(function (order) {
        const orderNumber = order.orderNumber || order.id.substring(0, 8).toUpperCase();
        const customerName = (order.customerInfo?.firstName && order.customerInfo?.lastName)
            ? order.customerInfo.firstName + ' ' + order.customerInfo.lastName
            : order.customerInfo?.email || 'Unknown';
        const total = '₦' + (order.total || 0).toLocaleString('en-NG');
        const status = order.status || 'pending';

        return '<tr>' +
            '<td><strong>#' + orderNumber + '</strong></td>' +
            '<td>' + customerName + '</td>' +
            '<td>' + total + '</td>' +
            '<td><span class="status-badge ' + status + '">' + status + '</span></td>' +
            '</tr>';
    }).join('');
}

/* ==========================================
   TOP SELLING PRODUCTS
   ========================================== */
function loadTopProducts(allOrders, allProducts) {
    const container = document.getElementById('topProductsList');
    if (!container) return;

    const salesCount = {};
    allOrders.forEach(function (order) {
        if (!order.items) return;
        order.items.forEach(function (item) {
            const pid = item.productId || item.id;
            if (pid) {
                salesCount[pid] = (salesCount[pid] || 0) + (item.quantity || 1);
            }
        });
    });

    const productSales = allProducts.map(function (product) {
        return {
            name: product.name || 'Unknown',
            image: product.image || (product.images && product.images[0]) || '',
            sales: salesCount[product.id] || 0
        };
    });

    productSales.sort(function (a, b) { return b.sales - a.sales; });
    const top5 = productSales.slice(0, 5);

    if (top5.length === 0 || top5[0].sales === 0) {
        container.innerHTML = '<p class="no-data">No sales data available</p>';
        return;
    }

    container.innerHTML = top5.map(function (product) {
        const imgHtml = product.image
            ? '<img src="' + product.image + '" alt="' + product.name + '" style="width:50px;height:50px;object-fit:cover;border-radius:6px;">'
            : '<div style="width:50px;height:50px;background:#e0e0e0;border-radius:6px;"></div>';

        return '<div class="product-item" style="display:flex;align-items:center;gap:1rem;padding:0.75rem 0;border-bottom:1px solid #f0f0f0;">' +
            imgHtml +
            '<div class="product-info">' +
            '<h4 style="margin:0;font-size:0.95rem;">' + product.name + '</h4>' +
            '<p class="product-sales" style="margin:0;color:#888;font-size:0.85rem;">' +
            product.sales + ' unit' + (product.sales !== 1 ? 's' : '') + ' sold' +
            '</p></div></div>';
    }).join('');
}

/* ==========================================
   LOW STOCK ALERTS
   ========================================== */
function loadLowStockAlerts(allProducts) {
    const container = document.getElementById('lowStockList');
    if (!container) return;

    const lowStock = allProducts
        .filter(function (p) { return (p.stock || 0) <= 5; })
        .sort(function (a, b) { return (a.stock || 0) - (b.stock || 0); });

    if (lowStock.length === 0) {
        container.innerHTML = '<p class="no-data">All products in stock</p>';
        return;
    }

    container.innerHTML = lowStock.map(function (product) {
        const stock = product.stock || 0;
        const stockColor = stock === 0 ? '#f44336' : '#ff9800';

        return '<div class="alert-item" style="display:flex;justify-content:space-between;align-items:center;padding:0.75rem 0;border-bottom:1px solid #f0f0f0;">' +
            '<strong>' + (product.name || 'Unknown') + '</strong>' +
            '<span style="color:' + stockColor + ';font-weight:600;">' +
            (stock === 0 ? 'Out of stock' : 'Only ' + stock + ' left') +
            '</span></div>';
    }).join('');
}

/* ==========================================
   UPDATE ORDERS BADGE
   ========================================== */
function updateOrdersBadge(count) {
    const badge = document.getElementById('ordersBadge');
    if (!badge) return;
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
}

/* ==========================================
   NOTIFICATIONS
   ========================================== */
function initNotifications() {
    notificationSound = document.getElementById('notificationSound');

    const notificationBtn = document.getElementById('notificationBtn');
    const notificationPanel = document.getElementById('notificationPanel');
    if (!notificationBtn || !notificationPanel) return;

    notificationBtn.addEventListener('click', function () {
        notificationPanel.classList.toggle('active');
        loadNotifications();
    });

    document.addEventListener('click', function (e) {
        if (!notificationBtn.contains(e.target) && !notificationPanel.contains(e.target)) {
            notificationPanel.classList.remove('active');
        }
    });

    const markAllReadBtn = document.getElementById('markAllRead');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllNotificationsRead);
    }

    updateNotificationBadge();
}

/* ==========================================
   REAL-TIME LISTENER FOR NEW ORDERS
   ========================================== */
function initRealtimeListeners() {
    const { db } = window.firebaseApp;

    unsubscribeOrders = db.collection('orders')
        .where('status', '==', 'pending')
        .onSnapshot(function (snapshot) {
            snapshot.docChanges().forEach(function (change) {
                if (change.type === 'added') {
                    const order = { id: change.doc.id, ...change.doc.data() };

                    const createdAt = order.createdAt?.toDate
                        ? order.createdAt.toDate()
                        : new Date(order.createdAt);
                    const secondsAgo = (Date.now() - createdAt.getTime()) / 1000;

                    if (secondsAgo < 30) {
                        showNewOrderNotification(order);
                    }
                }
            });
        }, function (error) {
            console.error('Realtime listener error:', error);
        });
}

/* ==========================================
   SHOW NEW ORDER NOTIFICATION
   ========================================== */
function showNewOrderNotification(order) {
    if (notificationSound) {
        notificationSound.play().catch(function (e) {
            console.log('Sound play failed:', e);
        });
    }

    const customerName = order.customerInfo?.firstName
        ? (order.customerInfo.firstName + ' ' + (order.customerInfo.lastName || '')).trim()
        : order.customerInfo?.email || 'a customer';

    addNotification({
        type: 'new_order',
        title: 'New Order Received!',
        message: 'Order from ' + customerName + ' — ₦' + (order.total || 0).toLocaleString('en-NG'),
        time: new Date(),
        unread: true,
        orderId: order.id
    });

    updateNotificationBadge();

    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Order!', {
            body: 'Order from ' + customerName + ' — ₦' + (order.total || 0).toLocaleString('en-NG'),
            icon: '/favicon.png'
        });
    }

    loadDashboardData();
}

/* ==========================================
   NOTIFICATION HELPERS
   ========================================== */
function addNotification(notification) {
    let notifications = [];
    try { notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]'); } catch (e) { }
    notifications.unshift(notification);
    notifications = notifications.slice(0, 50);
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
}

function loadNotifications() {
    let notifications = [];
    try { notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]'); } catch (e) { }

    const container = document.getElementById('notificationList');
    if (!container) return;

    if (notifications.length === 0) {
        container.innerHTML = '<p class="no-notifications">No new notifications</p>';
        return;
    }

    container.innerHTML = notifications.map(function (notif, index) {
        const icon = notif.type === 'new_order' ? 'shopping_bag' : 'mail';
        return '<div class="notification-item ' + (notif.unread ? 'unread' : '') + '" onclick="handleNotificationClick(' + index + ')" style="cursor:pointer;padding:0.75rem;border-bottom:1px solid #f0f0f0;">' +
            '<div style="display:flex;gap:1rem;">' +
            '<span class="material-icons" style="color:#d4af37;">' + icon + '</span>' +
            '<div style="flex:1;">' +
            '<strong>' + notif.title + '</strong>' +
            '<p style="font-size:0.85rem;color:#666;margin:0.25rem 0;">' + notif.message + '</p>' +
            '<small style="color:#999;">' + formatTimeAgo(new Date(notif.time)) + '</small>' +
            '</div></div></div>';
    }).join('');
}

function handleNotificationClick(index) {
    let notifications = [];
    try { notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]'); } catch (e) { return; }

    if (notifications[index]) {
        notifications[index].unread = false;
        localStorage.setItem('admin_notifications', JSON.stringify(notifications));

        if (notifications[index].type === 'new_order' && notifications[index].orderId) {
            window.location.href = 'order-details.html?id=' + notifications[index].orderId;
        }

        updateNotificationBadge();
        loadNotifications();
    }
}

function markAllNotificationsRead() {
    let notifications = [];
    try { notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]'); } catch (e) { }
    notifications = notifications.map(function (n) { return Object.assign({}, n, { unread: false }); });
    localStorage.setItem('admin_notifications', JSON.stringify(notifications));
    updateNotificationBadge();
    loadNotifications();
}

function updateNotificationBadge() {
    let notifications = [];
    try { notifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]'); } catch (e) { }

    const unreadCount = notifications.filter(function (n) { return n.unread; }).length;
    const badge = document.getElementById('notificationCount');
    if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

/* ==========================================
   FORMAT TIME AGO
   ========================================== */
function formatTimeAgo(date) {
    if (!date || isNaN(date.getTime())) return 'Unknown time';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    return date.toLocaleDateString();
}

/* ==========================================
   REQUEST BROWSER NOTIFICATION PERMISSION
   ========================================== */
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}