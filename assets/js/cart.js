/* ==========================================
   AURANOVA-AFRIQUE - CART SYSTEM
   ========================================== */

// Cart functionality is handled in main.js
// This file is for cart page specific functions

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the cart page
    if (window.location.pathname.includes('cart.html')) {
        // Cart page functionality is in cart-page.js
        console.log('Cart page loaded');
    }
});

// Export saveCart for use by cart-page.js
function saveCart(cart) {
    localStorage.setItem('auranova_cart', JSON.stringify(cart));
    if (window.auranovaFunctions?.updateCartCount) {
        window.auranovaFunctions.updateCartCount();
    }
}

if (typeof window.auranovaFunctions !== 'undefined') {
    window.auranovaFunctions.saveCart = saveCart;
}