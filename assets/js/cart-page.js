/* ==========================================
   AURANOVA-AFRIQUE - CART PAGE
   ========================================== */

let cart = [];
let promoCode = null;
let discountAmount = 0;

document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    initCartControls();
    loadRecommendedProducts();
});

/* ==========================================
   LOAD CART
   ========================================== */
function loadCart() {
    cart = window.auranovaFunctions?.getCart() || [];
    
    if (cart.length === 0) {
        showEmptyCart();
    } else {
        showCartContent();
        displayCartItems();
        updateCartSummary();
    }
}

function showEmptyCart() {
    document.getElementById('emptyCart').style.display = 'block';
    document.getElementById('cartContent').style.display = 'none';
}

function showCartContent() {
    document.getElementById('emptyCart').style.display = 'none';
    document.getElementById('cartContent').style.display = 'block';
}

/* ==========================================
   DISPLAY CART ITEMS
   ========================================== */
function displayCartItems() {
    const container = document.getElementById('cartItemsList');
    const countElement = document.getElementById('cartItemCount');
    
    container.innerHTML = '';
    countElement.textContent = cart.length;
    
    cart.forEach((item, index) => {
        const cartItem = createCartItem(item, index);
        container.appendChild(cartItem);
    });
}

function createCartItem(item, index) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.dataset.index = index;
    
    const selectedSize = item.selectedSize || item.sizes?.[0] || 'N/A';
    const selectedColor = item.selectedColor || item.colors?.[0] || 'N/A';
    const quantity = item.quantity || 1;
    const itemTotal = item.price * quantity;
    
    div.innerHTML = `
        <div class="cart-item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        
        <div class="cart-item-details">
            <p class="item-category">${item.category}</p>
            <h3 class="item-name">
                <a href="product-details.html?id=${item.id}">${item.name}</a>
            </h3>
            <div class="item-options">
                <div class="item-option">
                    <strong>Size:</strong> ${selectedSize}
                </div>
                <div class="item-option">
                    <strong>Color:</strong> ${selectedColor}
                </div>
            </div>
            <p class="item-price">${window.auranovaFunctions?.formatPrice(item.price) || `₦${item.price.toLocaleString()}`}</p>
        </div>
        
        <div class="cart-item-right">
            <div class="item-controls">
                <div class="quantity-control">
                    <button class="qty-btn-cart decrease" data-index="${index}">
                        <span class="material-icons">remove</span>
                    </button>
                    <div class="qty-display">${quantity}</div>
                    <button class="qty-btn-cart increase" data-index="${index}">
                        <span class="material-icons">add</span>
                    </button>
                </div>
                <button class="btn-remove" data-index="${index}">
                    <span class="material-icons">delete_outline</span>
                </button>
            </div>
            <p class="item-total">${window.auranovaFunctions?.formatPrice(itemTotal) || `₦${itemTotal.toLocaleString()}`}</p>
        </div>
    `;
    
    return div;
}

/* ==========================================
   CART CONTROLS
   ========================================== */
function initCartControls() {
    const container = document.getElementById('cartItemsList');
    
    // Event delegation for quantity and remove buttons
    container.addEventListener('click', function(e) {
        const btn = e.target.closest('button');
        if (!btn) return;
        
        const index = parseInt(btn.dataset.index);
        
        if (btn.classList.contains('decrease')) {
            updateQuantity(index, -1);
        } else if (btn.classList.contains('increase')) {
            updateQuantity(index, 1);
        } else if (btn.classList.contains('btn-remove')) {
            removeItem(index);
        }
    });
    
    // Clear cart
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearCart);
    }
    
    // Checkout
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            window.auranovaFunctions?.showNotification('Checkout coming soon!', 'info');
        });
    }
    
    // Promo code
    const applyPromoBtn = document.getElementById('applyPromoBtn');
    if (applyPromoBtn) {
        applyPromoBtn.addEventListener('click', applyPromoCode);
    }
}

/* ==========================================
   UPDATE QUANTITY
   ========================================== */
function updateQuantity(index, change) {
    if (!cart[index]) return;
    
    const newQuantity = (cart[index].quantity || 1) + change;
    
    if (newQuantity < 1) {
        removeItem(index);
        return;
    }
    
    if (newQuantity > 10) {
        window.auranovaFunctions?.showNotification('Maximum quantity is 10', 'info');
        return;
    }
    
    cart[index].quantity = newQuantity;
    window.auranovaFunctions?.saveCart?.(cart) || localStorage.setItem('auranova_cart', JSON.stringify(cart));
    
    displayCartItems();
    updateCartSummary();
}

/* ==========================================
   REMOVE ITEM
   ========================================== */
function removeItem(index) {
    const item = cart[index];
    cart.splice(index, 1);
    
    window.auranovaFunctions?.saveCart?.(cart) || localStorage.setItem('auranova_cart', JSON.stringify(cart));
    
    window.auranovaFunctions?.showNotification(`${item.name} removed from cart`, 'info');
    
    if (cart.length === 0) {
        showEmptyCart();
    } else {
        displayCartItems();
        updateCartSummary();
    }
}

/* ==========================================
   CLEAR CART
   ========================================== */
function clearCart() {
    if (!confirm('Are you sure you want to clear your cart?')) return;
    
    cart = [];
    localStorage.setItem('auranova_cart', JSON.stringify(cart));
    window.auranovaFunctions?.updateCartCount?.();
    
    showEmptyCart();
    window.auranovaFunctions?.showNotification('Cart cleared', 'info');
}

/* ==========================================
   UPDATE CART SUMMARY
   ========================================== */
function updateCartSummary() {
    const subtotal = cart.reduce((total, item) => {
        return total + (item.price * (item.quantity || 1));
    }, 0);
    
    // Delivery fee (free above 50,000)
    const deliveryFee = subtotal >= 50000 ? 0 : 2500;
    
    // Apply discount
    const discount = calculateDiscount(subtotal);
    
    const total = subtotal + deliveryFee - discount;
    
    // Update DOM
    document.getElementById('subtotal').textContent = window.auranovaFunctions?.formatPrice(subtotal) || `₦${subtotal.toLocaleString()}`;
    document.getElementById('deliveryFee').textContent = deliveryFee === 0 ? 'FREE' : (window.auranovaFunctions?.formatPrice(deliveryFee) || `₦${deliveryFee.toLocaleString()}`);
    document.getElementById('discount').textContent = discount > 0 ? `-${window.auranovaFunctions?.formatPrice(discount) || `₦${discount.toLocaleString()}`}` : '₦0';
    document.getElementById('totalAmount').textContent = window.auranovaFunctions?.formatPrice(total) || `₦${total.toLocaleString()}`;
}

/* ==========================================
   PROMO CODE
   ========================================== */
function applyPromoCode() {
    const input = document.getElementById('promoInput');
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        window.auranovaFunctions?.showNotification('Please enter a promo code', 'info');
        return;
    }
    
    // Demo promo codes
    const promoCodes = {
        'WELCOME10': 0.10, // 10% off
        'SAVE20': 0.20,    // 20% off
        'AURANOVA': 0.15   // 15% off
    };
    
    if (promoCodes[code]) {
        promoCode = code;
        discountAmount = promoCodes[code];
        updateCartSummary();
        window.auranovaFunctions?.showNotification(`Promo code applied! ${Math.round(discountAmount * 100)}% off`, 'success');
        input.value = '';
    } else {
        window.auranovaFunctions?.showNotification('Invalid promo code', 'info');
    }
}

function calculateDiscount(subtotal) {
    if (!promoCode || !discountAmount) return 0;
    return subtotal * discountAmount;
}

/* ==========================================
   LOAD RECOMMENDED PRODUCTS
   ========================================== */
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