/* ==========================================
   ADMIN ORDER DETAILS
   View and manage single order
   ========================================== */

let currentOrder = null;
let orderId = null;

/* ==========================================
   PAGE LOAD - called by admin-auth-new.js after auth confirmed
   ========================================== */
window.loadPageData = async function () {
    const urlParams = new URLSearchParams(window.location.search);
    orderId = urlParams.get('id');

    if (!orderId) {
        window.firebaseApp.showNotification('No order ID provided', 'error');
        window.location.href = 'orders.html';
        return;
    }

    await loadOrder();
    initUpdateStatusButton();
    initPrintButton();
};

/* ==========================================
   LOAD ORDER FROM FIRESTORE
   ========================================== */
async function loadOrder() {
    const { db, showNotification } = window.firebaseApp;
    const loadingState = document.getElementById('loadingState');
    const contentDiv = document.getElementById('orderDetailsContent');

    if (loadingState) loadingState.style.display = 'block';
    if (contentDiv) contentDiv.style.display = 'none';

    try {
        const doc = await db.collection('orders').doc(orderId).get();

        if (!doc.exists) {
            showNotification('Order not found', 'error');
            window.location.href = 'orders.html';
            return;
        }

        currentOrder = { id: doc.id, ...doc.data() };
        displayOrderDetails();

        if (loadingState) loadingState.style.display = 'none';
        if (contentDiv) contentDiv.style.display = 'block';

    } catch (error) {
        console.error('Error loading order:', error);
        showNotification('Failed to load order', 'error');
        window.location.href = 'orders.html';
    }
}

/* ==========================================
   DISPLAY ORDER DETAILS
   ========================================== */
function displayOrderDetails() {
    displayOrderItems();
    displayCustomerInfo();
    displayDeliveryAddress();
    displayPaymentInfo();
    displayOrderTimeline();

    const statusSelect = document.getElementById('orderStatus');
    if (statusSelect) statusSelect.value = currentOrder.status || 'pending';
}

/* ==========================================
   DISPLAY ORDER ITEMS
   ========================================== */
function displayOrderItems() {
    const { formatPrice } = window.firebaseApp;
    const container = document.getElementById('orderItemsList');
    if (!container) return;

    if (!currentOrder.items || currentOrder.items.length === 0) {
        container.innerHTML = '<p style="color: #999;">No items in this order</p>';
        return;
    }

    container.innerHTML = currentOrder.items.map(function (item) {
        const imageUrl = item.image || (item.images && item.images[0]) || 'https://via.placeholder.com/80';
        const itemTotal = (item.price || 0) * (item.quantity || 1);

        return `
            <div class="order-item">
                <img src="${imageUrl}" alt="${item.name || 'Product'}">
                <div class="order-item-details">
                    <h4>${item.name || 'Unnamed Product'}</h4>
                    <div class="order-item-meta">
                        <span><strong>Size:</strong> ${item.selectedSize || 'N/A'}</span>
                        <span><strong>Color:</strong> ${item.selectedColor || 'N/A'}</span>
                        <span><strong>Qty:</strong> ${item.quantity || 1}</span>
                    </div>
                </div>
                <div class="order-item-price">
                    <p style="color: #666; font-size: 0.9rem; margin-bottom: 0.25rem;">
                        ${formatPrice(item.price || 0)} each
                    </p>
                    <p style="font-size: 1.1rem; font-weight: 600;">
                        ${formatPrice(itemTotal)}
                    </p>
                </div>
            </div>
        `;
    }).join('');

    const subtotalEl = document.getElementById('orderSubtotal');
    const deliveryEl = document.getElementById('orderDelivery');
    const totalEl = document.getElementById('orderTotal');

    if (subtotalEl) subtotalEl.textContent = formatPrice(currentOrder.subtotal || 0);
    if (deliveryEl) deliveryEl.textContent = currentOrder.delivery === 0
        ? 'FREE'
        : formatPrice(currentOrder.delivery || 0);
    if (totalEl) totalEl.textContent = formatPrice(currentOrder.total || 0);
}

/* ==========================================
   DISPLAY CUSTOMER INFO
   ========================================== */
function displayCustomerInfo() {
    const { formatDateTime } = window.firebaseApp;
    const container = document.getElementById('customerInfo');
    if (!container) return;

    const customer = currentOrder.customerInfo || {};

    container.innerHTML = `
        <div class="info-row">
            <strong>Name:</strong>
            <span>${customer.firstName || ''} ${customer.lastName || ''}</span>
        </div>
        <div class="info-row">
            <strong>Email:</strong>
            <span>${customer.email || 'N/A'}</span>
        </div>
        <div class="info-row">
            <strong>Phone:</strong>
            <span>${customer.phone || 'N/A'}</span>
        </div>
        <div class="info-row">
            <strong>Order Date:</strong>
            <span>${formatDateTime(currentOrder.createdAt)}</span>
        </div>
        <div class="info-row">
            <strong>Order ID:</strong>
            <span>#${currentOrder.orderNumber || currentOrder.id.substring(0, 8).toUpperCase()}</span>
        </div>
    `;
}

/* ==========================================
   DISPLAY DELIVERY ADDRESS
   ========================================== */
function displayDeliveryAddress() {
    const container = document.getElementById('deliveryAddress');
    if (!container) return;

    const address = currentOrder.deliveryAddress || {};

    container.innerHTML = `
        <div class="info-row">
            <strong>Street:</strong>
            <span>${address.address || 'N/A'}</span>
        </div>
        <div class="info-row">
            <strong>City:</strong>
            <span>${address.city || 'N/A'}</span>
        </div>
        <div class="info-row">
            <strong>State:</strong>
            <span>${address.state || 'N/A'}</span>
        </div>
        <div class="info-row">
            <strong>Postal Code:</strong>
            <span>${address.postalCode || 'N/A'}</span>
        </div>
        ${address.instructions ? `
            <div class="info-row">
                <strong>Instructions:</strong>
                <span>${address.instructions}</span>
            </div>
        ` : ''}
    `;
}

/* ==========================================
   DISPLAY PAYMENT INFO
   ========================================== */
function displayPaymentInfo() {
    const { formatPrice } = window.firebaseApp;
    const container = document.getElementById('paymentInfo');
    if (!container) return;

    const paymentMethodMap = {
        'card': 'Credit/Debit Card',
        'transfer': 'Bank Transfer',
        'paystack': 'Paystack',
        'pod': 'Pay on Delivery'
    };

    const paymentMethod = paymentMethodMap[currentOrder.paymentMethod] || currentOrder.paymentMethod || 'N/A';
    const paymentStatus = currentOrder.paymentStatus || 'pending';

    container.innerHTML = `
        <div class="info-row">
            <strong>Payment Method:</strong>
            <span>${paymentMethod}</span>
        </div>
        <div class="info-row">
            <strong>Payment Status:</strong>
            <span class="status-badge ${paymentStatus}">${paymentStatus}</span>
        </div>
        <div class="info-row">
            <strong>Amount Paid:</strong>
            <span>${formatPrice(currentOrder.total || 0)}</span>
        </div>
    `;
}

/* ==========================================
   DISPLAY ORDER TIMELINE
   ========================================== */
function displayOrderTimeline() {
    const { formatDateTime } = window.firebaseApp;
    const container = document.getElementById('orderTimeline');
    if (!container) return;

    if (currentOrder.status === 'cancelled') {
        container.innerHTML = `
            <div class="timeline-item">
                <div class="timeline-icon" style="background: #f44336; color: white;">
                    <span class="material-icons">cancel</span>
                </div>
                <div class="timeline-content">
                    <h4>Order Cancelled</h4>
                    <p>${formatDateTime(currentOrder.cancelledDate || currentOrder.updatedAt)}</p>
                </div>
            </div>
        `;
        return;
    }

    const timeline = [
        {
            label: 'Order Placed',
            date: currentOrder.createdAt,
            completed: true
        },
        {
            label: 'Processing',
            date: currentOrder.processingDate,
            completed: ['processing', 'shipped', 'delivered'].includes(currentOrder.status)
        },
        {
            label: 'Shipped',
            date: currentOrder.shippedDate,
            completed: ['shipped', 'delivered'].includes(currentOrder.status)
        },
        {
            label: 'Delivered',
            date: currentOrder.deliveredDate,
            completed: currentOrder.status === 'delivered'
        }
    ];

    container.innerHTML = timeline.map(function (item) {
        const iconClass = item.completed ? 'completed' : '';
        const icon = item.completed ? 'check_circle' : 'radio_button_unchecked';

        return `
            <div class="timeline-item">
                <div class="timeline-icon ${iconClass}">
                    <span class="material-icons">${icon}</span>
                </div>
                <div class="timeline-content">
                    <h4>${item.label}</h4>
                    <p>${item.date ? formatDateTime(item.date) : 'Pending'}</p>
                </div>
            </div>
        `;
    }).join('');
}

/* ==========================================
   UPDATE ORDER STATUS
   ========================================== */
function initUpdateStatusButton() {
    const updateBtn = document.getElementById('updateStatusBtn');
    const statusSelect = document.getElementById('orderStatus');
    if (!updateBtn || !statusSelect) return;

    updateBtn.addEventListener('click', async function () {
        const { db, showNotification } = window.firebaseApp;
        const newStatus = statusSelect.value;

        if (newStatus === currentOrder.status) {
            showNotification('Status is already set to ' + newStatus, 'info');
            return;
        }

        const btn = this;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span class="spinner"></span> Updating...';
        btn.disabled = true;

        try {
            const updateData = {
                status: newStatus,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (newStatus === 'processing' && !currentOrder.processingDate) {
                updateData.processingDate = firebase.firestore.FieldValue.serverTimestamp();
            } else if (newStatus === 'shipped' && !currentOrder.shippedDate) {
                updateData.shippedDate = firebase.firestore.FieldValue.serverTimestamp();
            } else if (newStatus === 'delivered' && !currentOrder.deliveredDate) {
                updateData.deliveredDate = firebase.firestore.FieldValue.serverTimestamp();
            } else if (newStatus === 'cancelled' && !currentOrder.cancelledDate) {
                updateData.cancelledDate = firebase.firestore.FieldValue.serverTimestamp();
            }

            await db.collection('orders').doc(orderId).update(updateData);

            // Update local order object
            currentOrder.status = newStatus;
            Object.assign(currentOrder, updateData);

            showNotification('Order status updated to ' + newStatus, 'success');

            // Refresh timeline to reflect new status
            displayOrderTimeline();

        } catch (error) {
            console.error('Error updating status:', error);
            window.firebaseApp.showNotification('Failed to update status', 'error');
        }

        btn.innerHTML = originalHTML;
        btn.disabled = false;
    });
}

/* ==========================================
   PRINT INVOICE
   ========================================== */
function initPrintButton() {
    const printBtn = document.getElementById('printInvoiceBtn');
    if (!printBtn) return;

    printBtn.addEventListener('click', function () {
        window.print();
    });
}

/* ==========================================
   PRINT STYLES
   ========================================== */
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        .sidebar, .top-bar, .back-link, .action-buttons,
        #updateStatusBtn, #printInvoiceBtn {
            display: none !important;
        }

        .main-content {
            margin-left: 0 !important;
        }

        .order-details-grid {
            display: block;
        }

        .order-info-card {
            page-break-inside: avoid;
            box-shadow: none;
            border: 1px solid #ddd;
        }
    }
`;
document.head.appendChild(printStyles);