
        // ============================================
        // PRODUCT DATA STRUCTURE
        // Define all products with their details
        // ============================================
        const products = [
            {
                id: 1,
                name: "Royal Black Shirt",
                category: "shirt",
                price: 85000,
                description: "Crafted from premium Egyptian cotton, this signature piece embodies timeless sophistication. The perfect balance of comfort and elegance, designed for those who demand excellence in every detail.",
                images: [
                    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800",
                    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800",
                    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800"
                ],
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "White", hex: "#FFFFFF" }
                ],
                badge: "NEW"
            },
            {
                id: 2,
                name: "Executive Hoodie",
                category: "hoodie",
                price: 95000,
                description: "Luxury meets streetwear in this meticulously designed hoodie. Premium fleece construction with refined details that set you apart from the crowd.",
                images: [
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
                    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"
                ],
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "Charcoal", hex: "#36454F" }
                ],
                badge: "TRENDING"
            },
            {
                id: 3,
                name: "Prestige Trousers",
                category: "pants",
                price: 75000,
                description: "Tailored to perfection with Italian wool blend. These trousers combine modern cut with classic styling for a distinguished look that commands respect.",
                images: [
                    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
                    "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800"
                ],
                sizes: ["28", "30", "32", "34", "36", "38"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "Navy", hex: "#000080" }
                ]
            },
            {
                id: 4,
                name: "Sovereign Cap",
                category: "cap",
                price: 35000,
                description: "The perfect finishing touch. Premium construction with embroidered logo, designed for those who pay attention to every detail.",
                images: [
                    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
                    "https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=800"
                ],
                sizes: ["One Size"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "White", hex: "#FFFFFF" }
                ],
                badge: "LIMITED"
            },
            {
                id: 5,
                name: "Classic White Shirt",
                category: "shirt",
                price: 80000,
                description: "An essential wardrobe staple reimagined. Crisp, clean lines with superior fabric quality that maintains its elegance wear after wear.",
                images: [
                    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800",
                    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800"
                ],
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: [
                    { name: "White", hex: "#FFFFFF" },
                    { name: "Cream", hex: "#F5F5DC" }
                ]
            },
            {
                id: 6,
                name: "Heritage Hoodie",
                category: "hoodie",
                price: 98000,
                description: "Contemporary design meets traditional craftsmanship. This premium hoodie features unique detailing that celebrates our Nigerian heritage.",
                images: [
                    "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800",
                    "https://images.unsplash.com/photo-1620799139834-6b8f844fbe29?w=800"
                ],
                sizes: ["S", "M", "L", "XL", "XXL"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "Forest Green", hex: "#228B22" }
                ],
                badge: "NEW"
            },
            {
                id: 7,
                name: "Elite Cargo Pants",
                category: "pants",
                price: 82000,
                description: "Function meets high fashion. These cargo pants redefine utility wear with premium materials and sophisticated design.",
                images: [
                    "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800",
                    "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=800"
                ],
                sizes: ["28", "30", "32", "34", "36", "38"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "Olive", hex: "#808000" }
                ]
            },
            {
                id: 8,
                name: "Luxury Performance Cap",
                category: "cap",
                price: 38000,
                description: "Athletic elegance at its finest. Breathable, comfortable, and undeniably premium.",
                images: [
                    "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800",
                    "https://images.unsplash.com/photo-1521369909029-2afed882baee?w=800"
                ],
                sizes: ["One Size"],
                colors: [
                    { name: "Black", hex: "#000000" },
                    { name: "White", hex: "#FFFFFF" }
                ]
            }
        ];

        // ============================================
        // CART MANAGEMENT FUNCTIONS
        // Handle all cart operations with localStorage
        // ============================================
        
        /**
         * Get current cart from localStorage
         * Returns empty array if no cart exists
         */
        function getCart() {
            const cart = localStorage.getItem('noirelegance_cart');
            return cart ? JSON.parse(cart) : [];
        }

        /**
         * Save cart to localStorage
         * @param {Array} cart - Array of cart items
         */
        function saveCart(cart) {
            localStorage.setItem('noirelegance_cart', JSON.stringify(cart));
            updateCartCount();
        }

        /**
         * Add product to cart with selected options
         * @param {Object} product - Product object
         * @param {String} size - Selected size
         * @param {String} color - Selected color
         */
        function addToCart(product, size, color) {
            const cart = getCart();
            const cartItem = {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0],
                size: size,
                color: color,
                quantity: 1
            };
            
            // Check if item with same options already exists
            const existingIndex = cart.findIndex(item => 
                item.id === cartItem.id && 
                item.size === cartItem.size && 
                item.color === cartItem.color
            );
            
            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push(cartItem);
            }
            
            saveCart(cart);
            showNotification('Product added to cart!');
        }

        /**
         * Remove item from cart
         * @param {Number} index - Index of item in cart array
         */
        function removeFromCart(index) {
            const cart = getCart();
            cart.splice(index, 1);
            saveCart(cart);
            renderCart();
        }

        /**
         * Update cart count badge in navigation
         */
        function updateCartCount() {
            const cart = getCart();
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            document.getElementById('cartCount').textContent = totalItems;
        }

        // ============================================
        // PRODUCT RENDERING FUNCTIONS
        // Display products in different contexts
        // ============================================
        
        /**
         * Render product cards in a grid
         * @param {Array} productsToRender - Products to display
         * @param {String} containerId - ID of container element
         */
        function renderProducts(productsToRender, containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = productsToRender.map(product => `
                <a href="#" class="product-card" onclick="showProductDetail(${product.id}); return false;">
                    <div class="product-image-wrapper">
                        <img src="${product.images[0]}" alt="${product.name}">
                        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                    </div>
                    <div class="product-info">
                        <div class="product-category">${product.category}</div>
                        <h3 class="product-name">${product.name}</h3>
                        <div class="product-price">₦${product.price.toLocaleString()}</div>
                    </div>
                </a>
            `).join('');
        }

        /**
         * Show detailed product page
         * @param {Number} productId - ID of product to display
         */
        function showProductDetail(productId) {
            const product = products.find(p => p.id === productId);
            if (!product) return;
            
            const container = document.getElementById('productDetailContent');
            container.innerHTML = `
                <div class="product-detail-grid">
                    <div class="product-gallery">
                        <img src="${product.images[0]}" alt="${product.name}" class="main-image" id="mainImage">
                        <div class="thumbnail-images">
                            ${product.images.map((img, index) => `
                                <img src="${img}" alt="${product.name}" class="thumbnail ${index === 0 ? 'active' : ''}" 
                                     onclick="changeMainImage('${img}', this)">
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="product-detail-info">
                        <h1>${product.name}</h1>
                        <div class="product-detail-price">₦${product.price.toLocaleString()}</div>
                        <p class="product-description">${product.description}</p>
                        
                        <div class="product-options">
                            <div class="option-group">
                                <label>Select Size:</label>
                                <div class="size-options">
                                    ${product.sizes.map((size, index) => `
                                        <button class="option-btn ${index === 0 ? 'selected' : ''}" 
                                                onclick="selectOption(this, 'size')">${size}</button>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="option-group">
                                <label>Select Color:</label>
                                <div class="color-options">
                                    ${product.colors.map((color, index) => `
                                        <button class="color-btn ${index === 0 ? 'selected' : ''}" 
                                                style="background-color: ${color.hex}; ${color.hex === '#FFFFFF' ? 'border: 2px solid #ddd;' : ''}"
                                                onclick="selectOption(this, 'color')"
                                                data-color="${color.name}"></button>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                        
                        <button class="add-to-cart-btn" onclick="addToCartFromDetail(${product.id})">
                            Add to Cart
                        </button>
                    </div>
                </div>
            `;
            
            showPage('productDetail');
        }

        /**
         * Change main product image when thumbnail clicked
         * @param {String} imageSrc - Source of new main image
         * @param {Element} thumbnail - Clicked thumbnail element
         */
        function changeMainImage(imageSrc, thumbnail) {
            document.getElementById('mainImage').src = imageSrc;
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            thumbnail.classList.add('active');
        }

        /**
         * Handle option selection (size/color)
         * @param {Element} button - Clicked button element
         * @param {String} type - Type of option (size/color)
         */
        function selectOption(button, type) {
            const parent = button.parentElement;
            parent.querySelectorAll('button').forEach(btn => btn.classList.remove('selected'));
            button.classList.add('selected');
        }

        /**
         * Add product to cart from detail page
         * @param {Number} productId - ID of product to add
         */
        function addToCartFromDetail(productId) {
            const product = products.find(p => p.id === productId);
            const selectedSize = document.querySelector('.size-options .option-btn.selected').textContent;
            const selectedColor = document.querySelector('.color-options .color-btn.selected').dataset.color;
            
            addToCart(product, selectedSize, selectedColor);
        }

        // ============================================
        // CART PAGE RENDERING
        // Display cart contents and summary
        // ============================================
        function renderCart() {
            const cart = getCart();
            const container = document.getElementById('cartContent');
            
            if (cart.length === 0) {
                container.innerHTML = `
                    <div class="empty-cart">
                        <div style="font-size: 5rem; color: #ccc; margin-bottom: 2rem;">
                            <i data-lucide="shopping-bag"></i>
                        </div>
                        <h2 style="margin-bottom: 1rem; font-weight: 300; letter-spacing: 2px;">YOUR CART IS EMPTY</h2>
                        <p style="color: #666; margin-bottom: 2rem;">Discover our exclusive collections</p>
                        <a href="#" class="learn-more" onclick="showPage('shop')">CONTINUE SHOPPING</a>
                    </div>
                `;
                lucide.createIcons();
                return;
            }
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            container.innerHTML = `
                <div class="cart-items">
                    ${cart.map((item, index) => `
                        <div class="cart-item">
                            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                            <div class="cart-item-info">
                                <h3>${item.name}</h3>
                                <div class="cart-item-details">
                                    Size: ${item.size} | Color: ${item.color} | Quantity: ${item.quantity}
                                </div>
                                <div class="cart-item-price">₦${(item.price * item.quantity).toLocaleString()}</div>
                            </div>
                            <div class="cart-item-actions">
                                <button class="remove-btn" onclick="removeFromCart(${index})">Remove</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="cart-summary">
                    <div class="cart-total">
                        <span>TOTAL:</span>
                        <span>₦${total.toLocaleString()}</span>
                    </div>
                    
                    <div class="checkout-info">
                        <p><strong>Checkout functionality is currently under development.</strong></p>
                        <p style="margin-top: 1rem;">For orders and inquiries, please contact:</p>
                        <p class="developer-contact">Developer: James Daniel</p>
                        <p style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                            We'll have full payment integration ready soon!
                        </p>
                    </div>
                </div>
            `;
        }

        // ============================================
        // NAVIGATION & PAGE MANAGEMENT
        // Handle page switching and URL routing
        // ============================================
        
        /**
         * Show specific page and hide others
         * @param {String} pageName - Name of page to display
         */
        function showPage(pageName) {
            // Hide all pages
            document.querySelectorAll('.page-content').forEach(page => {
                page.classList.remove('active');
            });
            
            // Show selected page
            const pageMap = {
                'home': 'homePage',
                'shop': 'shopPage',
                'collections': 'collectionsPage',
                'about': 'aboutPage',
                'contact': 'contactPage',
                'cart': 'cartPage',
                'productDetail': 'productDetailPage'
            };
            
            const pageId = pageMap[pageName];
            if (pageId) {
                document.getElementById(pageId).classList.add('active');
                
                // Render content for specific pages
                if (pageName === 'cart') {
                    renderCart();
                    lucide.createIcons();
                } else if (pageName === 'shop') {
                    renderProducts(products, 'shopProducts');
                }
                
                // Scroll to top
                window.scrollTo(0, 0);
            }
        }

        /**
         * Filter products by category
         * @param {String} category - Category to filter by
         */
        function filterByCategory(category) {
            showPage('shop');
            
            // Update active filter button
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.category === category) {
                    btn.classList.add('active');
                }
            });
            
            // Filter and render products
            const filtered = category === 'all' ? products : products.filter(p => p.category === category);
            renderProducts(filtered, 'shopProducts');
        }

        // ============================================
        // UI ENHANCEMENTS
        // Notification and scroll effects
        // ============================================
        
        /**
         * Show notification message
         * @param {String} message - Message to display
         */
        function showNotification(message) {
            const notification = document.getElementById('notification');
            notification.textContent = message;
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        /**
         * Handle navbar scroll effect
         */
        window.addEventListener('scroll', () => {
            const navbar = document.getElementById('navbar');
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // ============================================
        // HERO SLIDESHOW (Mobile)
        // Auto-rotating image slideshow for mobile
        // ============================================
        let slideIndex = 0;
        function heroSlideshow() {
            const slides = document.querySelectorAll('.hero-slide');
            slides.forEach(slide => slide.classList.remove('active'));
            slideIndex = (slideIndex + 1) % slides.length;
            slides[slideIndex].classList.add('active');
        }
        
        // Start slideshow on mobile
        if (window.innerWidth <= 768) {
            setInterval(heroSlideshow, 5000);
        }

        // ============================================
        // SHOP FILTER BUTTONS
        // Handle category filtering in shop page
        // ============================================
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    filterByCategory(btn.dataset.category);
                });
            });
        });

        // ============================================
        // INITIALIZATION
        // Load initial content when page loads
        // ============================================
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize Lucide icons
            lucide.createIcons();
            
            // Load home page products
            renderProducts(products.slice(0, 4), 'homeProducts');
            
            // Update cart count
            updateCartCount();
            
            // Initialize shop page with all products
            renderProducts(products, 'shopProducts');
        });
  