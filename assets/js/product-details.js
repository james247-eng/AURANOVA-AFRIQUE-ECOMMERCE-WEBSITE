/* ==========================================
   AURANOVA-AFRIQUE - PRODUCT DETAILS PAGE
   ========================================== */

let currentProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentQuantity = 1;

/* ==========================================
   INITIALIZE PRODUCT DETAILS PAGE
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    loadProductDetails();
    initTabs();
    initQuantityControls();
    initZoomModal();
    initWishlistButton();
    initShareButtons();
});

/* ==========================================
   LOAD PRODUCT DETAILS
   ========================================== */
function loadProductDetails() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (!productId) {
        // If no ID, show first product or redirect to shop
        currentProduct = window.auranovaProducts?.productsData[0];
    } else {
        currentProduct = window.auranovaProducts?.getProductById(productId);
    }
    
    if (!currentProduct) {
        window.location.href = 'shop.html';
        return;
    }
    
    displayProductDetails();
    loadRelatedProducts();
}

/* ==========================================
   DISPLAY PRODUCT DETAILS
   ========================================== */
function displayProductDetails() {
    // Update breadcrumb
    document.getElementById('breadcrumbCategory').textContent = currentProduct.category;
    document.getElementById('breadcrumbProduct').textContent = currentProduct.name;
    
    // Update product info
    document.getElementById('productCategory').textContent = currentProduct.category;
    document.getElementById('productTitle').textContent = currentProduct.name;
    document.getElementById('productPrice').textContent = window.auranovaFunctions?.formatPrice(currentProduct.price) || `₦${currentProduct.price.toLocaleString()}`;
    document.getElementById('productDescription').textContent = currentProduct.description;
    
    // Update badge
    const badgeEl = document.getElementById('productBadge');
    if (currentProduct.badges && currentProduct.badges.length > 0) {
        badgeEl.textContent = currentProduct.badges[0].toUpperCase();
        badgeEl.style.display = 'inline-block';
    } else {
        badgeEl.style.display = 'none';
    }
    
    // Load main image
    loadProductImages();
    
    // Load sizes
    loadSizes();
    
    // Load colors
    loadColors();
    
    // Check if in wishlist
    updateWishlistButton();
}

/* ==========================================
   LOAD PRODUCT IMAGES
   ========================================== */
function loadProductImages() {
    const mainImage = document.getElementById('mainImage');
    const thumbnailGallery = document.getElementById('thumbnailGallery');
    
    // For demo, we'll use the same image multiple times
    // In production, product would have multiple images
    const images = [
        currentProduct.image,
        currentProduct.image, // In real app, these would be different angles
        currentProduct.image,
        currentProduct.image
    ];
    
    // Set main image
    mainImage.src = images[0];
    mainImage.alt = currentProduct.name;
    
    // Load thumbnails
    thumbnailGallery.innerHTML = '';
    images.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${img}" alt="${currentProduct.name}">`;
        
        thumb.addEventListener('click', function() {
            // Update main image
            mainImage.src = img;
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
        
        thumbnailGallery.appendChild(thumb);
    });
}

/* ==========================================
   LOAD SIZES
   ========================================== */
function loadSizes() {
    const sizeSelector = document.getElementById('sizeSelector');
    sizeSelector.innerHTML = '';
    
    currentProduct.sizes.forEach((size, index) => {
        const sizeBtn = document.createElement('button');
        sizeBtn.className = 'size-option';
        sizeBtn.textContent = size;
        
        if (index === 0) {
            sizeBtn.classList.add('active');
            selectedSize = size;
        }
        
        sizeBtn.addEventListener('click', function() {
            document.querySelectorAll('.size-option').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedSize = size;
        });
        
        sizeSelector.appendChild(sizeBtn);
    });
}

/* ==========================================
   LOAD COLORS
   ========================================== */
function loadColors() {
    const colorSelector = document.getElementById('colorSelector');
    colorSelector.innerHTML = '';
    
    const colorMap = {
        'Black': '#000000',
        'White': '#FFFFFF',
        'Navy': '#000080',
        'Burgundy': '#800020',
        'Charcoal': '#36454F',
        'Gold': '#D4AF37',
        'Royal Blue': '#4169E1',
        'Wine': '#722F37',
        'Multi': 'linear-gradient(45deg, #D4AF37, #000000, #FFFFFF)',
        'Purple': '#800080',
        'Green': '#228B22',
        'Orange': '#FF8C00',
        'Cream': '#FFFDD0'
    };
    
    currentProduct.colors.forEach((color, index) => {
        const colorBtn = document.createElement('button');
        colorBtn.className = 'color-option';
        colorBtn.title = color;
        
        // Handle gradient colors
        if (colorMap[color] && colorMap[color].startsWith('linear')) {
            colorBtn.style.background = colorMap[color];
        } else {
            colorBtn.style.color = colorMap[color] || '#CCC';
        }
        
        if (index === 0) {
            colorBtn.classList.add('active');
            selectedColor = color;
        }
        
        colorBtn.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            selectedColor = color;
        });
        
        colorSelector.appendChild(colorBtn);
    });
}

/* ==========================================
   QUANTITY CONTROLS
   ========================================== */
function initQuantityControls() {
    const decreaseBtn = document.getElementById('decreaseQty');
    const increaseBtn = document.getElementById('increaseQty');
    const quantityInput = document.getElementById('productQuantity');
    
    decreaseBtn.addEventListener('click', function() {
        if (currentQuantity > 1) {
            currentQuantity--;
            quantityInput.value = currentQuantity;
        }
    });
    
    increaseBtn.addEventListener('click', function() {
        if (currentQuantity < 10) {
            currentQuantity++;
            quantityInput.value = currentQuantity;
        }
    });
    
    quantityInput.addEventListener('change', function() {
        let value = parseInt(this.value);
        if (isNaN(value) || value < 1) value = 1;
        if (value > 10) value = 10;
        currentQuantity = value;
        this.value = value;
    });
    
    // Add to cart button
    const addToCartBtn = document.getElementById('addToCartBtn');
    addToCartBtn.addEventListener('click', function() {
        if (!selectedSize) {
            window.auranovaFunctions?.showNotification('Please select a size', 'info');
            return;
        }
        
        if (!selectedColor) {
            window.auranovaFunctions?.showNotification('Please select a color', 'info');
            return;
        }
        
        const productToAdd = {
            ...currentProduct,
            selectedSize,
            selectedColor,
            quantity: currentQuantity
        };
        
        window.auranovaFunctions?.addToCart(productToAdd);
    });
    
    // Buy now button
    const buyNowBtn = document.getElementById('buyNowBtn');
    buyNowBtn.addEventListener('click', function() {
        if (!selectedSize || !selectedColor) {
            window.auranovaFunctions?.showNotification('Please select size and color', 'info');
            return;
        }
        
        // Add to cart and redirect to cart page
        const productToAdd = {
            ...currentProduct,
            selectedSize,
            selectedColor,
            quantity: currentQuantity
        };
        
        window.auranovaFunctions?.addToCart(productToAdd);
        window.location.href = 'cart.html';
    });
}

/* ==========================================
   TABS FUNCTIONALITY
   ========================================== */
function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Remove active from all buttons and panels
            tabButtons.forEach(b => b.classList.remove('active'));
            tabPanels.forEach(p => p.classList.remove('active'));
            
            // Add active to clicked button and corresponding panel
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

/* ==========================================
   ZOOM MODAL
   ========================================== */
function initZoomModal() {
    const zoomBtn = document.getElementById('zoomBtn');
    const zoomModal = document.getElementById('zoomModal');
    const zoomClose = document.getElementById('zoomClose');
    const zoomedImage = document.getElementById('zoomedImage');
    const mainImage = document.getElementById('mainImage');
    
    zoomBtn.addEventListener('click', function() {
        zoomedImage.src = mainImage.src;
        zoomModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    zoomClose.addEventListener('click', closeZoomModal);
    
    zoomModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeZoomModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && zoomModal.classList.contains('active')) {
            closeZoomModal();
        }
    });
}

function closeZoomModal() {
    const zoomModal = document.getElementById('zoomModal');
    zoomModal.classList.remove('active');
    document.body.style.overflow = '';
}

/* ==========================================
   WISHLIST BUTTON
   ========================================== */
function initWishlistButton() {
    const wishlistBtn = document.getElementById('wishlistFloatBtn');
    
    wishlistBtn.addEventListener('click', function() {
        const isAdded = window.auranovaFunctions?.toggleWishlist(currentProduct);
        updateWishlistButton();
    });
}

function updateWishlistButton() {
    const wishlistBtn = document.getElementById('wishlistFloatBtn');
    const icon = wishlistBtn.querySelector('.material-icons');
    
    if (window.auranovaFunctions?.isInWishlist(currentProduct.id)) {
        wishlistBtn.classList.add('active');
        icon.textContent = 'favorite';
    } else {
        wishlistBtn.classList.remove('active');
        icon.textContent = 'favorite_border';
    }
}

/* ==========================================
   SHARE BUTTONS
   ========================================== */
function initShareButtons() {
    const shareButtons = document.querySelectorAll('.share-btn');
    
    shareButtons.forEach((btn, index) => {
        btn.addEventListener('click', function() {
            const url = window.location.href;
            const title = currentProduct.name;
            
            switch(index) {
                case 0: // Facebook
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
                    break;
                case 1: // Twitter
                    window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
                    break;
                case 2: // WhatsApp
                    window.open(`https://wa.me/?text=${title} ${url}`, '_blank');
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

/* ==========================================
   LOAD RELATED PRODUCTS
   ========================================== */
function loadRelatedProducts() {
    const relatedContainer = document.getElementById('relatedProducts');
    if (!relatedContainer) return;
    
    // Get products from same category, exclude current product
    const allProducts = window.auranovaProducts?.productsData || [];
    const relatedProducts = allProducts
        .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
        .slice(0, 4);
    
    relatedContainer.innerHTML = '';
    
    relatedProducts.forEach(product => {
        const card = window.auranovaProducts.createProductCard(product);
        relatedContainer.appendChild(card);
    });
    
    // If not enough from same category, fill with random products
    if (relatedProducts.length < 4) {
        const remaining = 4 - relatedProducts.length;
        const otherProducts = allProducts
            .filter(p => p.id !== currentProduct.id && !relatedProducts.includes(p))
            .slice(0, remaining);
        
        otherProducts.forEach(product => {
            const card = window.auranovaProducts.createProductCard(product);
            relatedContainer.appendChild(card);
        });
    }
}