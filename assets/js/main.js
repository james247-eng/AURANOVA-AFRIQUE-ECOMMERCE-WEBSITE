/* ==========================================
   AURANOVA-AFRIQUE - MAIN JAVASCRIPT
   Global Functions & Initialization
   ========================================== */

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initPreloader();
    initNavbar();
    initMobileMenu();
    initDropdownMenus();
    updateCartCount();
    updateWishlistCount();
});

/* ==========================================
   PRELOADER
   ========================================== */
function initPreloader() {
    const preloader = document.getElementById('preloader');
    
    window.addEventListener('load', function() {
        setTimeout(function() {
            preloader.classList.add('hide');
        }, 1500);
    });
}

/* ==========================================
   NAVBAR SCROLL EFFECT
   ========================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    });
}

/* ==========================================
   MOBILE MENU TOGGLE
   ========================================== */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when clicking on a link
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
}

/* ==========================================
   DROPDOWN MENUS (Desktop & Mobile)
   ========================================== */
function initDropdownMenus() {
    const dropdownItems = document.querySelectorAll('.nav-item.dropdown');
    
    // Mobile dropdown toggle
    if (window.innerWidth <= 768) {
        dropdownItems.forEach(item => {
            const link = item.querySelector('.nav-link');
            link.addEventListener('click', function(e) {
                e.preventDefault();
                item.classList.toggle('active');
            });
        });
    }
    
    // Re-initialize on window resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            dropdownItems.forEach(item => {
                item.classList.remove('active');
            });
        }
    });
}

/* ==========================================
   CART FUNCTIONALITY
   ========================================== */

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('auranova_cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('auranova_cart', JSON.stringify(cart));
    updateCartCount();
}

// Add to cart
function addToCart(product) {
    const cart = getCart();
    
    // Check if product already exists
    const existingProductIndex = cart.findIndex(item => item.id === product.id);
    
    if (existingProductIndex > -1) {
        // Increase quantity
        cart[existingProductIndex].quantity += 1;
    } else {
        // Add new product
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart(cart);
    showNotification('Product added to cart!', 'success');
    animateCartIcon();
}

// Remove from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    showNotification('Product removed from cart', 'info');
}

// Update cart item quantity
function updateCartQuantity(productId, quantity) {
    const cart = getCart();
    const productIndex = cart.findIndex(item => item.id === productId);
    
    if (productIndex > -1) {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            cart[productIndex].quantity = quantity;
            saveCart(cart);
        }
    }
}

// Update cart count in navbar
function updateCartCount() {
    const cart = getCart();
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElement = document.getElementById('cartCount');
    
    if (cartCountElement) {
        cartCountElement.textContent = cartCount;
    }
}

// Animate cart icon when item is added
function animateCartIcon() {
    const cartIcon = document.querySelector('a[href="pages/cart.html"]');
    if (cartIcon) {
        cartIcon.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartIcon.style.transform = 'scale(1)';
        }, 300);
    }
}

/* ==========================================
   WISHLIST FUNCTIONALITY
   ========================================== */

// Get wishlist from localStorage
function getWishlist() {
    const wishlist = localStorage.getItem('auranova_wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
}

// Save wishlist to localStorage
function saveWishlist(wishlist) {
    localStorage.setItem('auranova_wishlist', JSON.stringify(wishlist));
    updateWishlistCount();
}

// Toggle wishlist
function toggleWishlist(product) {
    const wishlist = getWishlist();
    const existingIndex = wishlist.findIndex(item => item.id === product.id);
    
    if (existingIndex > -1) {
        // Remove from wishlist
        wishlist.splice(existingIndex, 1);
        saveWishlist(wishlist);
        showNotification('Removed from wishlist', 'info');
        return false;
    } else {
        // Add to wishlist
        wishlist.push(product);
        saveWishlist(wishlist);
        showNotification('Added to wishlist!', 'success');
        return true;
    }
}

// Check if product is in wishlist
function isInWishlist(productId) {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === productId);
}

// Update wishlist count in navbar
function updateWishlistCount() {
    const wishlist = getWishlist();
    const wishlistCountElement = document.getElementById('wishlistCount');
    
    if (wishlistCountElement) {
        wishlistCountElement.textContent = wishlist.length;
    }
}

/* ==========================================
   NOTIFICATION SYSTEM
   ========================================== */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Add styles dynamically
    const styles = {
        position: 'fixed',
        top: '100px',
        right: '20px',
        background: type === 'success' ? '#D4AF37' : '#333',
        color: type === 'success' ? '#000' : '#fff',
        padding: '1rem 1.5rem',
        borderRadius: '4px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        zIndex: '10001',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        animation: 'slideIn 0.3s ease',
        minWidth: '250px'
    };
    
    Object.assign(notification.style, styles);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = 'background: none; border: none; color: inherit; font-size: 1.5rem; cursor: pointer; padding: 0; margin-left: auto;';
    closeBtn.addEventListener('click', () => notification.remove());
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add animation styles to document
if (!document.getElementById('notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/* ==========================================
   UTILITY FUNCTIONS
   ========================================== */

// Format price to Nigerian Naira
function formatPrice(price) {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN'
    }).format(price);
}

// Debounce function for search
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

// Smooth scroll to element
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

/* ==========================================
   EXPORT FUNCTIONS (for use in other files)
   ========================================== */
window.auranovaFunctions = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCart,
    toggleWishlist,
    isInWishlist,
    getWishlist,
    formatPrice,
    showNotification,
    smoothScrollTo
};