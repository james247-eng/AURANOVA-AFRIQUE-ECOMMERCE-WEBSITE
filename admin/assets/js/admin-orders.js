/* ==========================================
   ADMIN ORDERS MANAGEMENT
   Load, display, filter, update order status
   ========================================== */

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const ordersPerPage = 15;

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
   PAGE LOAD - called by admin-auth-new.js after auth confirmed
   ========================================== */
window.loadPageData = async function () {
    waitForFirebase(async function () {
        await loadOrders();
        initializeFilters();
        updateOrdersBadge();
        initRealtimeListener();
    });
};

/* ==========================================
   LOAD ORDERS FROM FIRESTORE
   ========================================== */
async function loadOrders() {
    const { db, showNotification } = window.firebaseApp;
    const tableBody = document.getElementById('ordersTableBody');

    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:2rem;">
                    <div class="spinner" style="margin:0 auto;"></div>
                    <p>Loading orders...</p>
                </td>
            </tr>`;
    }

    try {
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .get();

        allOrders = [];
        snapshot.forEach(function (doc) {
            allOrders.push({ id: doc.id, ...doc.data() });
        });

        filteredOrders = [...allOrders];
        displayOrders();

    } catch (error) {
        console.error('Error loading orders:', error);
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:2rem;color:#f44336;">
                        Failed to load orders. Please refresh the page.
                    </td>
                </tr>`;
        }
        showNotification('Failed to load orders', 'error');
    }
}

/* ==========================================
   DISPLAY ORDERS IN TABLE
   ========================================== */
function displayOrders() {
    const { formatPrice, formatDateTime } = window.firebaseApp;
    const tableBody = document.getElementById('ordersTableBody');
    if (!tableBody) return;

    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <span class="material-icons" style="font-size:3rem;color:#ccc;">shopping_bag</span>
                    <p>No orders found</p>
                </td>
            </tr>`;
        updatePagination();
        return;
    }

    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = filteredOrders.slice(startIndex, endIndex);

    tableBody.innerHTML = ordersToShow.map(function (order) {
        const customerName = (order.customerInfo?.firstName && order.customerInfo?.lastName)
            ? order.customerInfo.firstName + ' ' + order.customerInfo.lastName
            : order.customerInfo?.email || 'Unknown';

        const itemCount = order.items ? order.items.length : 0;
        const statusClass = getStatusClass(order.status);
        const orderNumber = order.orderNumber || order.id.substring(0, 8).toUpperCase();

        return `
            <tr data-order-id="${order.id}" style="cursor:pointer;" onclick="viewOrder('${order.id}')">
                <td><strong>#${orderNumber}</strong></td>
                <td>
                    <div>
                        <strong style="display:block;">${customerName}</strong>
                        <small style="color:#666;">${order.customerInfo?.email || ''}</small>
                    </div>
                </td>
                <td>${formatDateTime(order.createdAt)}</td>
                <td>${itemCount} item${itemCount !== 1 ? 's' : ''}</td>
                <td><strong>${formatPrice(order.total || 0)}</strong></td>
                <td>
                    <span class="payment-badge ${order.paymentMethod || 'unknown'}">
                        ${formatPaymentMethod(order.paymentMethod)}
                    </span>
                </td>
                <td>
                    <select
                        class="status-select ${statusClass}"
                        data-order-id="${order.id}"
                        onclick="event.stopPropagation()"
                        onchange="updateOrderStatus('${order.id}', this.value)"
                    >
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
            </tr>`;
    }).join('');

    updatePagination();
}

/* ==========================================
   GET STATUS CLASS
   ========================================== */
function getStatusClass(status) {
    const statusMap = {
        'pending': 'pending',
        'processing': 'processing',
        'shipped': 'processing',
        'delivered': 'completed',
        'cancelled': 'cancelled'
    };
    return statusMap[status] || 'pending';
}

/* ==========================================
   FORMAT PAYMENT METHOD
   ========================================== */
function formatPaymentMethod(method) {
    const methodMap = {
        'card': 'Card',
        'transfer': 'Transfer',
        'paystack': 'Paystack',
        'pod': 'Pay on Delivery'
    };
    return methodMap[method] || method || 'N/A';
}

/* ==========================================
   INITIALIZE FILTERS
   ========================================== */
function initializeFilters() {
    const searchInput = document.getElementById('searchOrders');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }

    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }

    const exportBtn = document.getElementById('exportOrders');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportOrders);
    }
}

/* ==========================================
   SEARCH ORDERS
   ========================================== */
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        filteredOrders = [...allOrders];
    } else {
        filteredOrders = allOrders.filter(function (order) {
            const orderNumber = (order.orderNumber || order.id.substring(0, 8)).toLowerCase();
            const firstName = (order.customerInfo?.firstName || '').toLowerCase();
            const lastName = (order.customerInfo?.lastName || '').toLowerCase();
            const email = (order.customerInfo?.email || '').toLowerCase();

            return orderNumber.includes(query) ||
                firstName.includes(query) ||
                lastName.includes(query) ||
                email.includes(query);
        });
    }

    currentPage = 1;
    displayOrders();
}

/* ==========================================
   APPLY FILTERS
   ========================================== */
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value;
    const dateFilter = document.getElementById('dateFilter')?.value;

    filteredOrders = allOrders.filter(function (order) {
        const statusMatch = !statusFilter || order.status === statusFilter;

        let dateMatch = true;
        if (dateFilter && order.createdAt) {
            const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            const now = new Date();

            if (dateFilter === 'today') {
                dateMatch = orderDate.toDateString() === now.toDateString();
            } else if (dateFilter === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                dateMatch = orderDate >= weekAgo;
            } else if (dateFilter === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                dateMatch = orderDate >= monthAgo;
            }
        }

        return statusMatch && dateMatch;
    });

    currentPage = 1;
    displayOrders();
}

/* ==========================================
   UPDATE ORDER STATUS
   ========================================== */
window.updateOrderStatus = async function (orderId, newStatus) {
    const { db, showNotification } = window.firebaseApp;

    try {
        await db.collection('orders').doc(orderId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Update local arrays
        const order = allOrders.find(function (o) { return o.id === orderId; });
        if (order) order.status = newStatus;

        const filteredOrder = filteredOrders.find(function (o) { return o.id === orderId; });
        if (filteredOrder) filteredOrder.status = newStatus;

        showNotification('Order status updated to ' + newStatus, 'success');
        updateOrdersBadge();

    } catch (error) {
        console.error('Error updating order status:', error);
        window.firebaseApp.showNotification('Failed to update order status', 'error');
        displayOrders(); // Revert UI
    }
};

/* ==========================================
   VIEW ORDER DETAILS
   ========================================== */
window.viewOrder = function (orderId) {
    window.location.href = 'order-details.html?id=' + orderId;
};

/* ==========================================
   UPDATE ORDERS BADGE
   ========================================== */
function updateOrdersBadge() {
    const badge = document.getElementById('ordersBadge');
    if (!badge) return;

    const pendingCount = allOrders.filter(function (o) { return o.status === 'pending'; }).length;
    badge.textContent = pendingCount;
    badge.style.display = pendingCount > 0 ? 'flex' : 'none';
}

/* ==========================================
   PAGINATION
   ========================================== */
function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage) || 1;

    const currentPageEl = document.getElementById('currentPage');
    const totalPagesEl = document.getElementById('totalPages');
    if (currentPageEl) currentPageEl.textContent = currentPage;
    if (totalPagesEl) totalPagesEl.textContent = totalPages;

    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');

    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = function () {
            if (currentPage > 1) {
                currentPage--;
                displayOrders();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.onclick = function () {
            if (currentPage < totalPages) {
                currentPage++;
                displayOrders();
            }
        };
    }
}

/* ==========================================
   EXPORT ORDERS TO CSV
   ========================================== */
function exportOrders() {
    const { formatDateTime, formatPrice, showNotification } = window.firebaseApp;

    try {
        const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Items', 'Total', 'Status', 'Payment Method'];
        const rows = filteredOrders.map(function (o) {
            return [
                o.orderNumber || o.id.substring(0, 8).toUpperCase(),
                ((o.customerInfo?.firstName || '') + ' ' + (o.customerInfo?.lastName || '')).trim(),
                o.customerInfo?.email || '',
                formatDateTime(o.createdAt),
                o.items?.length || 0,
                o.total || 0,
                o.status || '',
                formatPaymentMethod(o.paymentMethod)
            ];
        });

        const csv = [
            headers.join(','),
            ...rows.map(function (row) {
                return row.map(function (cell) { return '"' + cell + '"'; }).join(',');
            })
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'orders-' + Date.now() + '.csv';
        a.click();
        window.URL.revokeObjectURL(url);

        showNotification('Orders exported successfully', 'success');

    } catch (error) {
        console.error('Export error:', error);
        window.firebaseApp.showNotification('Failed to export orders', 'error');
    }
}

/* ==========================================
   REAL-TIME LISTENER FOR NEW ORDERS
   ========================================== */
function initRealtimeListener() {
    const { db, showNotification } = window.firebaseApp;

    db.collection('orders')
        .where('status', '==', 'pending')
        .onSnapshot(function (snapshot) {
            snapshot.docChanges().forEach(function (change) {
                if (change.type === 'added') {
                    const newOrder = { id: change.doc.id, ...change.doc.data() };

                    // Only act on truly new orders (not existing ones loaded on page start)
                    const alreadyExists = allOrders.find(function (o) { return o.id === newOrder.id; });
                    if (!alreadyExists) {
                        allOrders.unshift(newOrder);
                        filteredOrders.unshift(newOrder);

                        showNotification('New order received!', 'success');

                        const audio = document.getElementById('notificationSound');
                        if (audio) audio.play().catch(function (e) { console.log('Sound play failed:', e); });

                        displayOrders();
                        updateOrdersBadge();
                    }
                }
            });
        }, function (error) {
            console.error('Realtime listener error:', error);
        });
}

/* ==========================================
   UTILITY: DEBOUNCE
   ========================================== */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(function () {
            func(...args);
        }, wait);
    };
}