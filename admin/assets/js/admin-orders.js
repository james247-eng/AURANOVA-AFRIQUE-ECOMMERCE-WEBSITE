/* ==========================================
   ADMIN ORDERS MANAGEMENT
   Load, display, filter, update order status
   ========================================== */

const { db, showNotification, formatPrice, formatDateTime, showLoading, showError } = window.firebaseApp;

let allOrders = [];
let filteredOrders = [];
let currentPage = 1;
const ordersPerPage = 15;

/* ==========================================
   PAGE LOAD
   ========================================== */
window.loadPageData = async function() {
    await loadOrders();
    initializeFilters();
    updateOrdersBadge();
};

/* ==========================================
   LOAD ORDERS FROM FIRESTORE
   ========================================== */
async function loadOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    showLoading(tableBody, 'Loading orders...');
    
    try {
        const snapshot = await db.collection('orders')
            .orderBy('createdAt', 'desc')
            .get();
        
        allOrders = [];
        snapshot.forEach(doc => {
            allOrders.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        filteredOrders = [...allOrders];
        displayOrders();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        showError(tableBody, 'Failed to load orders. Please refresh the page.');
        showNotification('Failed to load orders', 'error');
    }
}

/* ==========================================
   DISPLAY ORDERS IN TABLE
   ========================================== */
function displayOrders() {
    const tableBody = document.getElementById('ordersTableBody');
    
    if (filteredOrders.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <span class="material-icons" style="font-size: 3rem; color: #ccc;">shopping_bag</span>
                    <p>No orders found</p>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * ordersPerPage;
    const endIndex = startIndex + ordersPerPage;
    const ordersToShow = filteredOrders.slice(startIndex, endIndex);
    
    // Build table rows
    tableBody.innerHTML = ordersToShow.map(order => {
        const customerName = order.customerInfo?.firstName && order.customerInfo?.lastName
            ? `${order.customerInfo.firstName} ${order.customerInfo.lastName}`
            : order.customerInfo?.email || 'Unknown';
        
        const itemCount = order.items ? order.items.length : 0;
        const statusClass = getStatusClass(order.status);
        
        return `
            <tr data-order-id="${order.id}" style="cursor: pointer;" onclick="viewOrder('${order.id}')">
                <td><strong>#${order.orderNumber || order.id.substring(0, 8).toUpperCase()}</strong></td>
                <td>
                    <div>
                        <strong style="display: block;">${customerName}</strong>
                        <small style="color: #666;">${order.customerInfo?.email || ''}</small>
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
            </tr>
        `;
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
    // Search input
    const searchInput = document.getElementById('searchOrders');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    
    // Status filter
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    // Date filter
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', applyFilters);
    }
    
    // Export button
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
        filteredOrders = allOrders.filter(order => {
            const orderNumber = order.orderNumber || order.id.substring(0, 8);
            const customerName = order.customerInfo?.firstName || '';
            const customerLastName = order.customerInfo?.lastName || '';
            const customerEmail = order.customerInfo?.email || '';
            
            return (
                orderNumber.toLowerCase().includes(query) ||
                customerName.toLowerCase().includes(query) ||
                customerLastName.toLowerCase().includes(query) ||
                customerEmail.toLowerCase().includes(query)
            );
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
    
    filteredOrders = allOrders.filter(order => {
        // Status filter
        const statusMatch = !statusFilter || order.status === statusFilter;
        
        // Date filter
        let dateMatch = true;
        if (dateFilter && order.createdAt) {
            const orderDate = order.createdAt.toDate ? order.createdAt.toDate() : new Date(order.createdAt);
            const now = new Date();
            
            switch(dateFilter) {
                case 'today':
                    dateMatch = orderDate.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    dateMatch = orderDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    dateMatch = orderDate >= monthAgo;
                    break;
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
window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        await db.collection('orders').doc(orderId).update({
            status: newStatus,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update local array
        const order = allOrders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
        }
        
        const filteredOrder = filteredOrders.find(o => o.id === orderId);
        if (filteredOrder) {
            filteredOrder.status = newStatus;
        }
        
        showNotification(`Order status updated to ${newStatus}`, 'success');
        updateOrdersBadge();
        
        // Send notification to customer (TODO: implement email)
        // await sendOrderStatusEmail(orderId, newStatus);
        
    } catch (error) {
        console.error('Error updating order status:', error);
        showNotification('Failed to update order status', 'error');
        
        // Revert UI
        displayOrders();
    }
};

/* ==========================================
   VIEW ORDER DETAILS
   ========================================== */
window.viewOrder = function(orderId) {
    window.location.href = `order-details.html?id=${orderId}`;
};

/* ==========================================
   UPDATE ORDERS BADGE
   ========================================== */
function updateOrdersBadge() {
    const badge = document.getElementById('ordersBadge');
    if (!badge) return;
    
    const pendingCount = allOrders.filter(o => o.status === 'pending').length;
    
    badge.textContent = pendingCount;
    badge.style.display = pendingCount > 0 ? 'flex' : 'none';
}

/* ==========================================
   PAGINATION
   ========================================== */
function updatePagination() {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages || 1;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayOrders();
            }
        };
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayOrders();
            }
        };
    }
}

/* ==========================================
   EXPORT ORDERS
   ========================================== */
function exportOrders() {
    try {
        const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Items', 'Total', 'Status', 'Payment Method'];
        const rows = filteredOrders.map(o => [
            o.orderNumber || o.id.substring(0, 8).toUpperCase(),
            `${o.customerInfo?.firstName || ''} ${o.customerInfo?.lastName || ''}`.trim(),
            o.customerInfo?.email || '',
            formatDateTime(o.createdAt),
            o.items?.length || 0,
            o.total || 0,
            o.status || '',
            formatPaymentMethod(o.paymentMethod)
        ]);
        
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-${Date.now()}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        showNotification('Orders exported successfully', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export orders', 'error');
    }
}

/* ==========================================
   UTILITY: DEBOUNCE
   ========================================== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/* ==========================================
   REAL-TIME ORDER LISTENER (OPTIONAL)
   ========================================== */
function initRealtimeListener() {
    db.collection('orders')
        .where('status', '==', 'pending')
        .onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const newOrder = { id: change.doc.id, ...change.doc.data() };
                    
                    // Check if order is new (not in our local array)
                    if (!allOrders.find(o => o.id === newOrder.id)) {
                        allOrders.unshift(newOrder);
                        filteredOrders.unshift(newOrder);
                        
                        // Show notification
                        showNotification('New order received!', 'success');
                        
                        // Play sound
                        const audio = document.getElementById('notificationSound');
                        if (audio) audio.play().catch(e => console.log('Sound play failed'));
                        
                        // Update display
                        displayOrders();
                        updateOrdersBadge();
                    }
                }
            });
        }, (error) => {
            console.error('Realtime listener error:', error);
        });
}

// Initialize realtime listener
setTimeout(initRealtimeListener, 2000);