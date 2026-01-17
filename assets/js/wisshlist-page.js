/* WISHLIST PAGE */
let wishlist = [];

document.addEventListener('DOMContentLoaded', function() {
    loadWishlist();
    initWishlistControls();
    loadRecommendedProducts();
});

function loadWishlist() {
    wishlist = window.auranovaFunctions?.getWishlist() || [];
    
    if (wishlist.length === 0) {
        showEmptyWishlist();
    } else {
        showWishlistContent();
        displayWishlistItems();
    }
}

function showEmptyWishlist() {
    document.getElementById('emptyWishlist').style.display = 'block';
    document.getElementById('wishlistContent').style.display = 'none';
    document.getElementById('shareSection').style.display = 'none';
}

function showWishlistContent() {
    document.getElementById('emptyWishlist').style.display = 'none';
    document.getElementById('wishlistContent').style.display = 'block';
    document.getElementById('shareSection').style.display = 'block';
}

function displayWishlistItems() {
    const container = document.getElementById('wishlistGrid');
    const countElement = document.getElementById('itemCount');
    
    container.innerHTML = '';
    countElement.textContent = wishlist.length;
    
    wishlist.forEach((item, index) => {
        const wishlistItem = createWishlistItem(item, index);
        container.appendChild(wishlistItem);
    });
}

function createWishlistItem(item, index) {
    const div = document.createElement('div');
    div.className = 'wishlist-item';
    div.dataset.id = item.id;
    
    const inStock = item.inStock !== false;
    const stockBadgeHTML = inStock 
        ? '<span class="stock-badge">In Stock</span>'
        : '<span class="stock-badge out-of-stock">Out of Stock</span>';
    
    div.innerHTML = `
        <div class="wishlist-item-image">
            <img src="${item.image}" alt="${item.name}">
            ${stockBadgeHTML}
            <button class="remove-btn" data-index="${index}">
                <span class="material-icons">close</span>
            </button>
        </div>
        
        <div class="wishlist-item-info">
            <p class="item-category">${item.category}</p>
            <h3 class="item-name">
                <a href="product-details.html?id=${item.id}">${item.name}</a>
            </h3>
            <p class="item-price">${window.auranovaFunctions?.formatPrice(item.price) || `₦${item.price.toLocaleString()}`}</p>
            
            <div class="item-actions">
                <button class="btn-add-to-cart" data-id="${item.id}" ${!inStock ? 'disabled' : ''}>
                    <span class="material-icons">shopping_cart</span>
                    ${inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <a href="product-details.html?id=${item.id}" class="btn-view-product">
                    <span class="material-icons">visibility</span>
                    View
                </a>
            </div>
        </div>
    `;
    
    return div;
}

function initWishlistControls() {
    const container = document.getElementById('wishlistGrid');
    
    // Remove from wishlist
    container.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-btn');
        if (removeBtn) {
            const index = parseInt(removeBtn.dataset.index);
            removeFromWishlist(index);
        }
        
        // Add to cart from wishlist
        const addToCartBtn = e.target.closest('.btn-add-to-cart');
        if (addToCartBtn && !addToCartBtn.disabled) {
            const productId = parseInt(addToCartBtn.dataset.id);
            addToCartFromWishlist(productId);
        }
    });
    
    // Add all to cart
    const addAllBtn = document.getElementById('addAllToCartBtn');
    if (addAllBtn) {
        addAllBtn.addEventListener('click', addAllToCart);
    }
    
    // Clear wishlist
    const clearBtn = document.getElementById('clearWishlistBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearWishlist);
    }
    
    // Share buttons
    const shareButtons = document.querySelectorAll('.share-btn');
    shareButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const url = window.location.href;
            
            switch(index) {
                case 0: // Facebook
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    break;
                case 1: // Twitter
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=Check out my AURANOVA-AFRIQUE wishlist!`, '_blank');
                    break;
                case 2: // WhatsApp
                    window.open(`https://wa.me/?text=Check out my AURANOVA-AFRIQUE wishlist! ${url}`, '_blank');
                    break;
                case 3: // Copy Link
                    navigator.clipboard.writeText(url).then(() => {
                        window.auranovaFunctions?.showNotification('Link copied to clipboard!', 'success');
                    });
                    break;
            }
        });
    });
}

function removeFromWishlist(index) {
    const item = wishlist[index];
    
    wishlist.splice(index, 1);
    localStorage.setItem('auranova_wishlist', JSON.stringify(wishlist));
    window.auranovaFunctions?.updateWishlistCount?.();
    
    window.auranovaFunctions?.showNotification(`${item.name} removed from wishlist`, 'info');
    
    if (wishlist.length === 0) {
        showEmptyWishlist();
    } else {
        displayWishlistItems();
    }
}

function addToCartFromWishlist(productId) {
    const product = wishlist.find(item => item.id === productId);
    if (!product) return;
    
    if (window.auranovaFunctions?.addToCart) {
        window.auranovaFunctions.addToCart(product);
    } else {
        // Fallback if main.js not loaded
        const cart = JSON.parse(localStorage.getItem('auranova_cart') || '[]');
        const existingIndex = cart.findIndex(item => item.id === productId);
        
        if (existingIndex > -1) {
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        localStorage.setItem('auranova_cart', JSON.stringify(cart));
        window.auranovaFunctions?.updateCartCount?.();
        window.auranovaFunctions?.showNotification('Product added to cart!', 'success');
    }
}

function addAllToCart() {
    if (wishlist.length === 0) return;
    
    const availableItems = wishlist.filter(item => item.inStock !== false);
    
    if (availableItems.length === 0) {
        window.auranovaFunctions?.showNotification('No items available to add', 'info');
        return;
    }
    
    availableItems.forEach(item => {
        window.auranovaFunctions?.addToCart(item);
    });
    
    window.auranovaFunctions?.showNotification(`${availableItems.length} items added to cart!`, 'success');
}

function clearWishlist() {
    if (!confirm('Are you sure you want to clear your entire wishlist?')) return;
    
    wishlist = [];
    localStorage.setItem('auranova_wishlist', JSON.stringify(wishlist));
    window.auranovaFunctions?.updateWishlistCount?.();
    
    showEmptyWishlist();
    window.auranovaFunctions?.showNotification('Wishlist cleared', 'info');
}

function loadRecommendedProducts() {
    const container = document.getElementById('recommendedProducts');
    if (!container) return;
    
    const products = window.auranovaProducts?.productsData || [];
    const recommended = products.slice(0, 4);
    
    container.innerHTML = '';
    recommended.forEach(product => {
        const card = window.auranovaProducts.createProductCard(product);
        container.appendChild(card);
    });
}