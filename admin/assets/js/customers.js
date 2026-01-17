/* ==========================================
   ADMIN CUSTOMERS MANAGEMENT
   ========================================== */

const { db, showNotification, formatPrice, formatDate } = window.firebaseApp;

let allCustomers = [];
let filteredCustomers = [];
let allOrders = [];
let currentPage = 1;
const customersPerPage = 15;

/* ==========================================
   PAGE LOAD
   ========================================== */
window.loadPageData = async function() {
    await loadCustomersAndOrders();
    initializeSearch();
    initializeSorting();
    initializeExport();
};

/* ==========================================
   LOAD CUSTOMERS AND ORDERS
   ========================================== */
async function loadCustomersAndOrders() {
    try {
        // Load all users (customers)
        const usersSnapshot = await db.collection('users')
            .where('role', '==', 'customer')
            .get();
        
        // Load all orders
        const ordersSnapshot = await db.collection('orders').get();
        
        allOrders = [];
        ordersSnapshot.forEach(doc => {
            allOrders.push({ id: doc.id, ...doc.data() });
        });
        
        // Build customers array with order stats
        allCustomers = [];
        usersSnapshot.forEach(doc => {
            const customerData = { id: doc.id, ...doc.data() };
            const customerOrders = allOrders.filter(o => o.userId === doc.id);
            
            allCustomers.push({
                ...customerData,
                totalOrders: customerOrders.length,
                totalSpent: customerOrders.reduce((sum, o) => sum + (o.total || 0), 0),
                orders: customerOrders
            });
        });
        
        filteredCustomers = [...allCustomers];
        
        displayCustomers();
        updateStats();
        
    } catch (error) {
        console.error('Error loading customers:', error);
        showNotification('Failed to load customers', 'error');
    }
}

/* ==========================================
   UPDATE STATS
   ========================================== */
function updateStats() {
    const totalCustomers = allCustomers.length;
    
    // New customers this month
    const now = new Date();
    const thisMonth = allCustomers.filter(c => {
        if (!c.createdAt) return false;
        const created = c.createdAt.toDate ? c.createdAt.toDate() : new Date(c.createdAt);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    }).length;
    
    // Active customers (with at least 1 order)
    const activeCustomers = allCustomers.filter(c => c.totalOrders > 0).length;
    
    // Average order value
    const totalRevenue = allCustomers.reduce((sum, c) => sum + c.totalSpent, 0);
    const totalOrders = allCustomers.reduce((sum, c) => sum + c.totalOrders, 0);
    const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
    
    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('newCustomers').textContent = thisMonth;
    document.getElementById('activeCustomers').textContent = activeCustomers;
    document.getElementById('avgOrderValue').textContent = formatPrice(avgOrderValue);
}

/* ==========================================
   DISPLAY CUSTOMERS
   ========================================== */
function displayCustomers() {
    const tableBody = document.getElementById('customersTableBody');
    
    if (filteredCustomers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">
                    <span class="material-icons" style="font-size: 3rem; color: #ccc;">people</span>
                    <p>No customers found</p>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }
    
    // Pagination
    const startIndex = (currentPage - 1) * customersPerPage;
    const endIndex = startIndex + customersPerPage;
    const customersToShow = filteredCustomers.slice(startIndex, endIndex);
    
    tableBody.innerHTML = customersToShow.map(customer => {
        const displayName = customer.displayName || 
                           `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
                           'Unknown';
        const initials = displayName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
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
            </tr>
        `;
    }).join('');
    
    updatePagination();
}

/* ==========================================
   VIEW CUSTOMER DETAILS
   ========================================== */
window.viewCustomer = async function(customerId) {
    const customer = allCustomers.find(c => c.id === customerId);
    if (!customer) return;
    
    const modal = document.getElementById('customerModal');
    const content = document.getElementById('customerDetailsContent');
    
    const displayName = customer.displayName || 
                       `${customer.firstName || ''} ${customer.lastName || ''}`.trim() ||
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
                <span>${customer.totalOrders > 0 ? formatPrice(Math.round(customer.totalSpent / customer.totalOrders)) : '₦0'}</span>
            </div>
        </div>
        
        <div class="detail-section">
            <h4>Recent Orders</h4>
            <div class="order-list">
                ${customer.orders.length > 0 ? customer.orders.slice(0, 5).map(order => `
                    <div class="order-item">
                        <span>#${order.orderNumber || order.id.substring(0, 8).toUpperCase()}</span>
                        <span>${formatPrice(order.total || 0)}</span>
                        <span class="status-badge ${order.status}">${order.status}</span>
                    </div>
                `).join('') : '<p style="color: #999; text-align: center; padding: 1rem;">No orders yet</p>'}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    
    document.getElementById('closeModal').onclick = () => {
        modal.classList.remove('active');
    };
    
    modal.onclick = (e) => {
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
    
    searchInput.addEventListener('input', debounce(function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            filteredCustomers = [...allCustomers];
        } else {
            filteredCustomers = allCustomers.filter(customer => {
                const name = (customer.displayName || customer.firstName || customer.lastName || '').toLowerCase();
                const email = (customer.email || '').toLowerCase();
                const phone = (customer.phone || '').toLowerCase();
                
                return name.includes(query) || email.includes(query) || phone.includes(query);
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
    
    sortSelect.addEventListener('change', function() {
        const sortBy = this.value;
        
        switch(sortBy) {
            case 'newest':
                filteredCustomers.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                    return dateB - dateA;
                });
                break;
            case 'oldest':
                filteredCustomers.sort((a, b) => {
                    const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
                    const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
                    return dateA - dateB;
                });
                break;
            case 'most-orders':
                filteredCustomers.sort((a, b) => b.totalOrders - a.totalOrders);
                break;
            case 'highest-spend':
                filteredCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
                break;
        }
        
        currentPage = 1;
        displayCustomers();
    });
}

/* ==========================================
   EXPORT
   ========================================== */
function initializeExport() {
    const exportBtn = document.getElementById('exportCustomersBtn');
    
    exportBtn.addEventListener('click', function() {
        try {
            const headers = ['Name', 'Email', 'Phone', 'Total Orders', 'Total Spent', 'Joined Date'];
            const rows = filteredCustomers.map(c => {
                const name = c.displayName || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown';
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
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `customers-${Date.now()}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            showNotification('Customers exported successfully', 'success');
            
        } catch (error) {
            console.error('Export error:', error);
            showNotification('Failed to export customers', 'error');
        }
    });
}

/* ==========================================
   PAGINATION
   ========================================== */
function updatePagination() {
    const totalPages = Math.ceil(filteredCustomers.length / customersPerPage);
    
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages || 1;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayCustomers();
        }
    };
    
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayCustomers();
        }
    };
}

/* ==========================================
   UTILITY
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