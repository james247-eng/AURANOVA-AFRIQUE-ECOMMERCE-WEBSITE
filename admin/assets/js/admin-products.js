/* ==========================================
   ADMIN PRODUCTS LISTING & MANAGEMENT
   ========================================== */

let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const itemsPerPage = 10;
let sortBy = 'newest';

/* ==========================================
   INITIALIZE PAGE
   ========================================== */
window.loadPageData = async function() {
    await loadProducts();
    setupEventListeners();
    displayProducts();
};

/* Initialize on page load */
document.addEventListener('DOMContentLoaded', function() {
    if (typeof loadPageData === 'function') {
        loadPageData();
    }
});

/* ==========================================
   LOAD PRODUCTS FROM FIRESTORE
   ========================================== */
async function loadProducts() {
    try {
        const { db, showNotification } = window.firebaseApp;
        
        if (!db) {
            console.warn('Firebase not initialized, trying localStorage');
            allProducts = JSON.parse(localStorage.getItem('auranova_products') || '[]');
            return;
        }
        
        const snapshot = await db.collection('products').get();
        allProducts = [];
        
        snapshot.forEach(doc => {
            allProducts.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`Loaded ${allProducts.length} products from Firestore`);
    } catch (error) {
        console.error('Error loading products:', error);
        // Fallback to localStorage
        allProducts = JSON.parse(localStorage.getItem('auranova_products') || '[]');
    }
}

/* ==========================================
   SETUP EVENT LISTENERS
   ========================================== */
function setupEventListeners() {
    // Search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            handleSearch(e.target.value);
        });
    }
    
    // Sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            sortBy = e.target.value;
            currentPage = 1;
            displayProducts();
        });
    }
    
    // Pagination
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayProducts();
            }
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const maxPages = Math.ceil(filteredProducts.length / itemsPerPage);
            if (currentPage < maxPages) {
                currentPage++;
                displayProducts();
            }
        });
    }
}

/* ==========================================
   SEARCH PRODUCTS
   ========================================== */
function handleSearch(query) {
    if (!query.trim()) {
        filteredProducts = [...allProducts];
    } else {
        const searchTerm = query.toLowerCase();
        filteredProducts = allProducts.filter(product => 
            product.name?.toLowerCase().includes(searchTerm) ||
            product.category?.toLowerCase().includes(searchTerm) ||
            product.sku?.toLowerCase().includes(searchTerm)
        );
    }
    currentPage = 1;
    displayProducts();
}

/* ==========================================
   SORT PRODUCTS
   ========================================== */
function sortProducts(products) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'newest':
            return sorted.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date();
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date();
                return dateB - dateA;
            });
        case 'oldest':
            return sorted.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt) || new Date();
                const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt) || new Date();
                return dateA - dateB;
            });
        case 'price-low':
            return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
        case 'price-high':
            return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
        case 'name-asc':
            return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        case 'name-desc':
            return sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
        default:
            return sorted;
    }
}

/* ==========================================
   DISPLAY PRODUCTS IN TABLE
   ========================================== */
function displayProducts() {
    if (filteredProducts.length === 0) {
        filteredProducts = [...allProducts];
    }
    
    const sorted = sortProducts(filteredProducts);
    const totalPages = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedProducts = sorted.slice(startIndex, startIndex + itemsPerPage);
    
    const tbody = document.getElementById('productsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    if (paginatedProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" style="text-align: center; padding: 2rem;">
                    <span class="material-icons" style="font-size: 3rem; color: var(--medium-gray);">inventory_2</span>
                    <p style="margin-top: 1rem; color: var(--medium-gray);">No products found</p>
                </td>
            </tr>
        `;
        updatePagination(1, 1);
        return;
    }
    
    paginatedProducts.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
    
    updatePagination(currentPage, totalPages);
}

/* ==========================================
   CREATE PRODUCT ROW
   ========================================== */
function createProductRow(product) {
    const row = document.createElement('tr');
    
    const imageHtml = product.image || product.images?.[0] 
        ? `<img src="${product.image || product.images[0]}" alt="${product.name}" style="height: 40px; width: 40px; object-fit: cover; border-radius: 4px;">` 
        : '<div style="height: 40px; width: 40px; background: #e0e0e0; border-radius: 4px;"></div>';
    
    const status = product.status || 'published';
    const statusBadgeClass = status === 'published' ? 'success' : 'warning';
    const createdDate = product.createdAt 
        ? new Date(product.createdAt.toDate?.() || product.createdAt).toLocaleDateString()
        : 'N/A';
    
    row.innerHTML = `
        <td style="padding: 0.75rem;">
            <input type="checkbox" class="product-checkbox" data-product-id="${product.id}">
        </td>
        <td>
            <div style="display: flex; align-items: center; gap: 0.75rem;">
                ${imageHtml}
                <div>
                    <strong>${product.name || 'N/A'}</strong>
                    <div style="font-size: 0.85rem; color: var(--medium-gray);">SKU: ${product.sku || 'N/A'}</div>
                </div>
            </div>
        </td>
        <td>${product.category || 'N/A'}</td>
        <td>₦${(product.price || 0).toLocaleString()}</td>
        <td>${product.stock || 0}</td>
        <td>
            <span class="status-badge ${statusBadgeClass}">
                ${status.charAt(0).toUpperCase() + status.slice(1)}
                ${!product.inStock ? ' - Out of Stock' : ''}
            </span>
        </td>
        <td style="font-size: 0.85rem; color: var(--medium-gray);">
            ${createdDate}
        </td>
        <td>
            <div class="action-buttons" style="display: flex; gap: 0.5rem;">
                <a href="edit-product.html?id=${product.id}" class="btn-icon" title="Edit">
                    <span class="material-icons">edit</span>
                </a>
                <button class="btn-icon btn-danger" onclick="adminProducts.deleteProduct('${product.id}')" title="Delete" style="border: none; background: none; cursor: pointer;">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

/* ==========================================
   EDIT PRODUCT
   ========================================== */
function editProduct(productId) {
    window.location.href = `edit-product.html?id=${productId}`;
}

/* ==========================================
   DELETE PRODUCT
   ========================================== */
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const { db } = window.firebaseApp || {};
        
        if (!db) {
            // Delete from localStorage
            allProducts = allProducts.filter(p => p.id !== productId);
            localStorage.setItem('auranova_products', JSON.stringify(allProducts));
            window.auranovaFunctions?.showNotification('Product deleted', 'success');
        } else {
            // Delete from Firestore
            await db.collection('products').doc(productId).delete();
            window.auranovaFunctions?.showNotification('Product deleted successfully', 'success');
        }
        
        // Reload products
        await loadProducts();
        displayProducts();
    } catch (error) {
        console.error('Error deleting product:', error);
        window.auranovaFunctions?.showNotification('Failed to delete product', 'error');
    }
}

/* ==========================================
   UPDATE PAGINATION
   ========================================== */
function updatePagination(page, totalPages) {
    const currentPageSpan = document.getElementById('currentPage');
    const totalPagesSpan = document.getElementById('totalPages');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (currentPageSpan) currentPageSpan.textContent = page;
    if (totalPagesSpan) totalPagesSpan.textContent = totalPages;
    
    if (prevBtn) prevBtn.disabled = page === 1;
    if (nextBtn) nextBtn.disabled = page === totalPages;
}

/* ==========================================
   EXPORT FUNCTIONS
   ========================================== */
window.adminProducts = {
    loadProducts,
    displayProducts,
    handleSearch,
    editProduct,
    deleteProduct
};
