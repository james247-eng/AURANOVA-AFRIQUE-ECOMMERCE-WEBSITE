/* ==========================================
   ADMIN CUSTOMERS MANAGEMENT
   ========================================== */

let allCustomers = [];
let filteredCustomers = [];
let allOrders = [];
let currentPage = 1;
const customersPerPage = 15;

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
        await loadCustomersAndOrders();
        initializeSearch();
        initializeSorting();
        initializeExport();
    });
};

/* ==========================================
   LOAD CUSTOMERS AND ORDERS
   ========================================== */
async function loadCustomersAndOrders() {
    const { db, showNotification } = window.firebaseApp;

    try {
        // Run both queries in parallel
        const [usersSnapshot, ordersSnapshot] = await Promise.all([
           db.collection('users').get(),
            db.collection('orders').get()
        ]);

        // Build orders array
        allOrders = [];
        ordersSnapshot.forEach(function (doc) {
            allOrders.push({ id: doc.id, ...doc.data() });
        });

        // Build customers array with order stats
        allCustomers = [];
        usersSnapshot.forEach(function (doc) {
            const customerData = { id: doc.id, ...doc.data() };
            const customerOrders = allOrders.filter(function (o) {
                return o.userId === doc.id;
            });

            allCustomers.push({
                ...customerData,
                totalOrders: customerOrders.length,
                totalSpent: customerOrders.reduce(function (sum, o) {
                    return sum + (o.total || 0);
                }, 0),
                orders: customerOrders
            });
        });

        filteredCustomers = [...allCustomers];

        displayCustomers();
        updateStats();

    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('Failed to load customers', 'error');

        const tableBody = document.getElementById('customersTableBody');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align:center;padding:2rem;color:#f44336;">
                        Failed to load customers. Please refresh the page.
                    </td>
                </tr>`;
        }
    }
}

/* ==========================================
   UPDATE STATS
   ========================================== */
function updateStats() {
    const { formatPrice } = window.firebaseApp;

    const totalCustomers = allCustomers.length;

    const now = new Date();
    const newThisMonth = allCustomers.filter(function (c) {
        if (!c.createdAt) return false;
        const created = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
        return created.getMonth() === now.getMonth() &&
               created.getFullYear() === now.getFullYear();
    }).length;

    const activeCustomers = allCustomers.filter(function (c) {
        return c.totalOrders > 0;
    }).length;

    const totalRevenue = allCustomers.reduce(function (sum, c) {
        return sum + c.totalSpent;
    }, 0);
    const totalOrders = allCustomers.reduce(function (sum, c) {
        return sum + c.totalOrders;
    }, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    const totalCustomersEl = document.getElementById('totalCustomers');
    const newCustomersEl = document.getElementById('newCustomers');
    const activeCustomersEl = document.getElementById('activeCustomers');
    const avgOrderValueEl = document.getElementById('avgOrderValue');

    if (totalCustomersEl) totalCustomersEl.textContent = totalCustomers;
    if (newCustomersEl) newCustomersEl.textContent = newThisMonth;
    if (activeCustomersEl) activeCustomersEl.textContent = activeCustomers;
    if (avgOrderValueEl) avgOrderValueEl.textContent = formatPrice(avgOrderValue);
}

/* ==========================================
   DISPLAY CUSTOMERS TABLE
   ========================================== */
function displayCustomers() {
    const { formatPrice, formatDate } = window.firebaseApp;
    const tableBody = document.getElementById('customersTableBody');
    if (!tableBody) return;

    if (filteredCustomers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <span class="material-icons" style="font-size:3rem;color:#ccc;">people</span>
                    <p>No customers found</p>
                </td>
            </tr>`;
        updatePagination();
        return;
    }

    const startIndex = (currentPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    const customersToShow = filteredCustomers.slice(startIndex, endIndex);

    tableBody.innerHTML = customersToShow.map(function (customer) {
        const displayName = customer.displayName ||
            ((customer.firstName || '') + ' ' + (customer.lastName || '')).trim() ||
            'Unknown';
        const initials = displayName
            .split(' ')
            .map(function (n) { return n[0] || ''; })
            .join('')
            .substring(0, 2)
            .toUpperCase();

        return `
            <tr>
                <td>
                    <div class="customer-info">
                        <div class="customer-avatar">${initials}</div>
                        <span class="customer-name">${displayName}</span>
                    </div>
                </td>
                <td>${customer.email || 'N/A'}</td>
                <td>${customer.phone || 'N/A'}</td>
                <td><strong>${customer.totalOrders}</strong></td>
                <td><strong>${formatPrice(customer.totalSpent)}</strong></td>
                <td>${formatDate(customer.createdAt)}</td>
                <td>
                    <button class="btn-view" onclick="viewCustomer('${customer.id}')">
                        View Details
                    </button>
                </td>
            </tr>`;
    }).join('');

    updatePagination();
}

/* ==========================================
   VIEW CUSTOMER DETAILS (MODAL)
   ========================================== */
window.viewCustomer = async function (customerId) {
    const { formatPrice, formatDate } = window.firebaseApp;

    const customer = allCustomers.find(function (c) { return c.id === customerId; });
    if (!customer) return;

    const modal = document.getElementById('customerModal');
    const content = document.getElementById('customerDetailsContent');
    if (!modal || !content) return;

    const displayName = customer.displayName ||
        ((customer.firstName || '') + ' ' + (customer.lastName || '')).trim() ||
        'Unknown';

    content.innerHTML = `
        <div class="detail-section">
            <h4>Customer Information</h4>
            <div class="detail-row">
                <strong>Name:</strong>
                <span>${displayName}</span>
            </div>
            <div class="detail-row">
                <strong>Email:</strong>
                <span>${customer.email || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <strong>Phone:</strong>
                <span>${customer.phone || 'N/A'}</span>
            </div>
            <div class="detail-row">
                <strong>Joined:</strong>
                <span>${formatDate(customer.createdAt)}</span>
            </div>
        </div>

        <div class="detail-section">
            <h4>Order Statistics</h4>
            <div class="detail-row">
                <strong>Total Orders:</strong>
                <span>${customer.totalOrders}</span>
            </div>
            <div class="detail-row">
                <strong>Total Spent:</strong>
                <span>${formatPrice(customer.totalSpent)}</span>
            </div>
            <div class="detail-row">
                <strong>Average Order:</strong>
                <span>${customer.totalOrders > 0
                    ? formatPrice(Math.round(customer.totalSpent / customer.totalOrders))
                    : '₦0'}</span>
            </div>
        </div>

        <div class="detail-section">
            <h4>Recent Orders</h4>
            <div class="order-list">
                ${customer.orders.length > 0
                    ? customer.orders.slice(0, 5).map(function (order) {
                        return `
                            <div class="order-item">
                                <span>#${order.orderNumber || order.id.substring(0, 8).toUpperCase()}</span>
                                <span>${formatPrice(order.total || 0)}</span>
                                <span class="status-badge ${order.status}">${order.status}</span>
                            </div>`;
                    }).join('')
                    : '<p style="color:#999;text-align:center;padding:1rem;">No orders yet</p>'
                }
            </div>
        </div>`;

    modal.classList.add('active');

    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.onclick = function () {
            modal.classList.remove('active');
        };
    }

    modal.onclick = function (e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    };
};

/* ==========================================
   SEARCH
   ========================================== */
function initializeSearch() {
    const searchInput = document.getElementById('searchCustomers');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function (e) {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            filteredCustomers = [...allCustomers];
        } else {
            filteredCustomers = allCustomers.filter(function (customer) {
                const name = (
                    customer.displayName ||
                    customer.firstName ||
                    customer.lastName || ''
                ).toLowerCase();
                const email = (customer.email || '').toLowerCase();
                const phone = (customer.phone || '').toLowerCase();

                return name.includes(query) ||
                       email.includes(query) ||
                       phone.includes(query);
            });
        }

        currentPage = 1;
        displayCustomers();
    }, 300));
}

/* ==========================================
   SORTING
   ========================================== */
function initializeSorting() {
    const sortSelect = document.getElementById('sortBy');
    if (!sortSelect) return;

    sortSelect.addEventListener('change', function () {
        const sortBy = this.value;

        filteredCustomers.sort(function (a, b) {
            if (sortBy === 'newest') {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                return dateB - dateA;
            } else if (sortBy === 'oldest') {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                return dateA - dateB;
            } else if (sortBy === 'most-orders') {
                return b.totalOrders - a.totalOrders;
            } else if (sortBy === 'highest-spend') {
                return b.totalSpent - a.totalSpent;
            }
            return 0;
        });

        currentPage = 1;
        displayCustomers();
    });
}

/* ==========================================
   EXPORT TO CSV
   ========================================== */
function initializeExport() {
    const { formatDate, showNotification } = window.firebaseApp;
    const exportBtn = document.getElementById('exportCustomersBtn');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', function () {
        try {
            const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Joined Date'];
            const rows = filteredCustomers.map(function (c) {
                const name = c.displayName ||
                    ((c.firstName || '') + ' ' + (c.lastName || '')).trim() ||
                    'Unknown';
                return [
                    name,
                    c.email || '',
                    c.phone || '',
                    c.totalOrders,
                    c.totalSpent,
                    formatDate(c.createdAt)
                ];
            });

            const csv = [
                headers.join(','),
                ...rows.map(function (row) {
                    return row.map(function (cell) {
                        return '"' + cell + '"';
                    }).join(',');
                })
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'customers-' + Date.now() + '.csv';
            a.click();
            window.URL.revokeObjectURL(url);

            showNotification('Customers exported successfully', 'success');

        } catch (error) {
            console.error('Export error:', error);
            window.firebaseApp.showNotification('Failed to export customers', 'error');
        }
    });
}

/* ==========================================
   PAGINATION
   ========================================== */
function updatePagination() {
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage) || 1;

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
                displayCustomers();
            }
        };
    }

    if (nextBtn) {
        nextBtn.disabled = currentPage >= totalPages;
        nextBtn.onclick = function () {
            if (currentPage < totalPages) {
                currentPage++;
                displayCustomers();
            }
        };
    }
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