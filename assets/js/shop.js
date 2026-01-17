/* ==========================================
   AURANOVA-AFRIQUE - SHOP PAGE FUNCTIONALITY
   ========================================== */

let currentFilters = {
    categories: ['all'],
    minPrice: 0,
    maxPrice: Infinity,
    sizes: [],
    availability: [],
    sortBy: 'featured'
};

let currentView = 'grid';

/* ==========================================
   INITIALIZE SHOP PAGE
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    loadShopProducts();
    initFilters();
    initSorting();
    initViewToggle();
    
    // Check URL parameters for category filter
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        filterByCategory(category);
    }
});

/* ==========================================
   LOAD PRODUCTS
   ========================================== */
function loadShopProducts() {
    const products = window.auranovaProducts?.productsData || [];
    const filteredProducts = filterAndSortProducts(products);
    displayShopProducts(filteredProducts);
    updateProductCount(filteredProducts.length);
}

/* ==========================================
   DISPLAY PRODUCTS
   ========================================== */
function displayShopProducts(products) {
    const container = document.getElementById('shopProducts');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 0;">
                <span class="material-icons" style="font-size: 5rem; color: var(--medium-gray); margin-bottom: 1rem;">shopping_bag</span>
                <h3 style="font-size: 1.5rem; margin-bottom: 1rem;">No products found</h3>
                <p style="color: var(--medium-gray);">Try adjusting your filters</p>
            </div>
        `;
        return;
    }
    
    products.forEach(product => {
        const productCard = window.auranovaProducts.createProductCard(product);
        container.appendChild(productCard);
    });
}

/* ==========================================
   FILTER AND SORT PRODUCTS
   ========================================== */
function filterAndSortProducts(products) {
    let filtered = products.filter(product => {
        // Category filter
        const categoryMatch = currentFilters.categories.includes('all') || 
                             currentFilters.categories.some(cat => 
                                product.category.toLowerCase().includes(cat.toLowerCase())
                             );
        
        // Price filter
        const priceMatch = product.price >= currentFilters.minPrice && 
                          product.price <= currentFilters.maxPrice;
        
        // Size filter
        const sizeMatch = currentFilters.sizes.length === 0 || 
                         currentFilters.sizes.some(size => product.sizes.includes(size));
        
        // Availability filter
        const availabilityMatch = currentFilters.availability.length === 0 || 
                                 (currentFilters.availability.includes('in-stock') && product.inStock);
        
        return categoryMatch && priceMatch && sizeMatch && availabilityMatch;
    });
    
    // Sort products
    filtered = sortProducts(filtered, currentFilters.sortBy);
    
    return filtered;
}

/* ==========================================
   SORT PRODUCTS
   ========================================== */
function sortProducts(products, sortBy) {
    const sorted = [...products];
    
    switch(sortBy) {
        case 'newest':
            return sorted.reverse();
        case 'price-low':
            return sorted.sort((a, b) => a.price - b.price);
        case 'price-high':
            return sorted.sort((a, b) => b.price - a.price);
        case 'name':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        default:
            return sorted;
    }
}

/* ==========================================
   INITIALIZE FILTERS
   ========================================== */
function initFilters() {
    // Category checkboxes
    const categoryCheckboxes = document.querySelectorAll('.filter-checkbox input[type="checkbox"]');
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.value === 'all') {
                // If "All" is checked, uncheck others
                if (this.checked) {
                    categoryCheckboxes.forEach(cb => {
                        if (cb.value !== 'all') cb.checked = false;
                    });
                    currentFilters.categories = ['all'];
                }
            } else {
                // If any category is checked, uncheck "All"
                const allCheckbox = document.querySelector('input[value="all"]');
                if (allCheckbox) allCheckbox.checked = false;
                
                currentFilters.categories = Array.from(categoryCheckboxes)
                    .filter(cb => cb.checked && cb.value !== 'all')
                    .map(cb => cb.value);
                
                if (currentFilters.categories.length === 0) {
                    currentFilters.categories = ['all'];
                    if (allCheckbox) allCheckbox.checked = true;
                }
            }
            
            loadShopProducts();
        });
    });
    
    // Price range
    const applyPriceBtn = document.querySelector('.btn-apply-price');
    if (applyPriceBtn) {
        applyPriceBtn.addEventListener('click', function() {
            const minPrice = document.getElementById('minPrice').value;
            const maxPrice = document.getElementById('maxPrice').value;
            
            currentFilters.minPrice = minPrice ? parseInt(minPrice) : 0;
            currentFilters.maxPrice = maxPrice ? parseInt(maxPrice) : Infinity;
            
            loadShopProducts();
        });
    }
    
    // Size buttons
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            
            currentFilters.sizes = Array.from(sizeButtons)
                .filter(b => b.classList.contains('active'))
                .map(b => b.textContent);
            
            loadShopProducts();
        });
    });
    
    // Reset filters
    const resetBtn = document.querySelector('.btn-reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetAllFilters);
    }
}

/* ==========================================
   RESET FILTERS
   ========================================== */
function resetAllFilters() {
    // Reset filter object
    currentFilters = {
        categories: ['all'],
        minPrice: 0,
        maxPrice: Infinity,
        sizes: [],
        availability: [],
        sortBy: 'featured'
    };
    
    // Reset UI
    document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(cb => {
        cb.checked = cb.value === 'all';
    });
    
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById('sortBy').value = 'featured';
    
    loadShopProducts();
}

/* ==========================================
   FILTER BY CATEGORY (from URL or link)
   ========================================== */
function filterByCategory(category) {
    // Uncheck all
    document.querySelectorAll('.filter-checkbox input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    // Check specific category
    const categoryCheckbox = document.querySelector(`input[value="${category}"]`);
    if (categoryCheckbox) {
        categoryCheckbox.checked = true;
        currentFilters.categories = [category];
    } else {
        currentFilters.categories = ['all'];
        const allCheckbox = document.querySelector('input[value="all"]');
        if (allCheckbox) allCheckbox.checked = true;
    }
    
    loadShopProducts();
}

/* ==========================================
   INITIALIZE SORTING
   ========================================== */
function initSorting() {
    const sortSelect = document.getElementById('sortBy');
    if (sortSelect) {
        sortSelect.addEventListener('change', function() {
            currentFilters.sortBy = this.value;
            loadShopProducts();
        });
    }
}

/* ==========================================
   VIEW TOGGLE (Grid/List)
   ========================================== */
function initViewToggle() {
    const viewButtons = document.querySelectorAll('.view-btn');
    const productsGrid = document.getElementById('shopProducts');
    
    viewButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active button
            viewButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Update grid class
            if (view === 'list') {
                productsGrid.classList.add('list-view');
            } else {
                productsGrid.classList.remove('list-view');
            }
            
            currentView = view;
        });
    });
}

/* ==========================================
   UPDATE PRODUCT COUNT
   ========================================== */
function updateProductCount(count) {
    const countElement = document.getElementById('productCount');
    if (countElement) {
        countElement.textContent = count;
    }
}

/* ==========================================
   EXPORT FUNCTIONS
   ========================================== */
window.shopFunctions = {
    filterByCategory,
    resetAllFilters,
    loadShopProducts
};