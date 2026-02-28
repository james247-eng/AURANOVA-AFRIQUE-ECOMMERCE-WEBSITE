/* ==========================================
   AURANOVA-AFRIQUE - PRODUCTS DATA & DISPLAY
   ========================================== */

// Auto-detect page and apply filters
const pageName = window.location.pathname.split("/").pop();

if (pageName === "trending.html") {
  // Show products sorted by popularity or with specific badge
  currentFilters.sortBy = "featured";
} else if (pageName === "new-arrivals.html") {
  // Show newest products
  currentFilters.sortBy = "newest";
} else if (pageName === "limited-edition.html") {
  // Filter to show only limited edition products
  // This will run after products load
}

// Sample Products Data (Replace with Firebase data later)
const productsData = [
  {
    id: 1,
    name: "Royal Ebony Kaftan",
    category: "Premium Caftans",
    price: 45000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXbCVScbJ6S0uWnAsKYzyVh9koxu0nB0C13Q&s",
    badges: ["new", "limited"],
    description:
      "Luxurious hand-embroidered kaftan with traditional African motifs. Crafted from premium fabrics with meticulous attention to detail, this piece represents the perfect fusion of traditional African elegance and contemporary fashion.",
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "Navy", "Burgundy"],
    inStock: true,
  },
  {
    id: 2,
    name: "Executive Senator",
    category: "English Wears",
    price: 51000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTA09VuwT4dZ3dm0ILYa_0oB4oW8tgG7j9ipQ&s",
    badges: ["new"],
    description: "Sophisticated formal wear for the modern professional",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["Black", "Charcoal", "Navy"],
    inStock: true,
  },
  {
    id: 3,
    name: "Aso Oke Classic",
    category: "Traditional agbada & Yoruba Caps",
    price: 25000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWPAPU7UjvnG1Wpvhj63GTeS6REeCLJvDhqQ&s",
    badges: [],
    description:
      "Traditional agbada and Yoruba cap crafted from premium Aso Oke fabric",
    sizes: ["One Size"],
    colors: ["Gold", "Royal Blue", "Wine"],
    inStock: true,
  },
  {
    id: 4,
    name: "Heritage Face Cap",
    category: "Face Caps",
    price: 20000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3MHoTYQbgwsFvhYllB2P7aLOSeDjG6VB1ZQ&s",
    badges: [],
    description: "Modern face cap with African print accents",
    sizes: ["Adjustable"],
    colors: ["Multi"],
    inStock: true,
  },
  {
    id: 5,
    name: "Platinum Agbada",
    category: "Premium Caftans",
    price: 150000,
    image:
      "https://davidscottonline.com/cdn/shop/files/292417389_116757544405828_8778917058962022744_n.jpg?v=1704578489",
    badges: ["limited"],
    description: "Premium Agbada with gold embroidery",
    sizes: ["M", "L", "XL", "XXL"],
    colors: ["White", "Cream", "Gold"],
    inStock: true,
  },
  {
    id: 6,
    name: "Distinguished Suit",
    category: "English Wears",
    price: 95000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIUVDo1y9fGp9Pr7xCdRMfQ1wTFDdokPWZDQ&s",
    badges: ["new"],
    description: "Tailored suit for special occasions",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Grey"],
    inStock: true,
  },
  {
    id: 7,
    name: "Royal Gele Cap",
    category: "Yoruba Caps",
    price: 38000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTG0_mN3B49bIerVUWTjToP61CxxkjbpWT61w&s",
    badges: [],
    description: "Handcrafted traditional cap with modern styling",
    sizes: ["One Size"],
    colors: ["Purple", "Green", "Orange"],
    inStock: true,
  },
  {
    id: 8,
    name: "Urban Elite Cap",
    category: "Face Caps",
    price: 18000,
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnztQjsZITCpzs9p0TQDpqjyGTkCXHcA_NSg&s",
    badges: ["new"],
    description: "Contemporary face cap with AURANOVA emblem",
    sizes: ["Adjustable"],
    colors: ["Black", "White", "Navy"],
    inStock: true,
  },
];

/* ==========================================
   DISPLAY PRODUCTS FUNCTION
   ========================================== */
function displayProducts(products, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";

  products.forEach((product) => {
    const productCard = createProductCard(product);
    container.appendChild(productCard);
  });
}

/* ==========================================
   CREATE PRODUCT CARD
   ========================================== */
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";
  card.setAttribute("data-product-id", product.id);

  // Determine badge classes
  const badgeHTML = product.badges
    .map((badge) => {
      const badgeClass =
        badge === "new"
          ? "badge new"
          : badge === "limited"
            ? "badge limited"
            : "badge";
      const badgeText =
        badge === "new"
          ? "NEW"
          : badge === "limited"
            ? "LIMITED"
            : badge.toUpperCase();
      return `<span class="${badgeClass}">${badgeText}</span>`;
    })
    .join("");

  // Check if in wishlist
  const isWishlisted = window.auranovaFunctions?.isInWishlist(product.id);
  const heartIcon = isWishlisted ? "favorite" : "favorite_border";

  card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" loading="lazy">
            ${badgeHTML ? `<div class="product-badges">${badgeHTML}</div>` : ""}
            <div class="product-actions">
                <button class="action-btn wishlist-btn" data-product-id="${product.id}" aria-label="Add to wishlist">
                    <span class="material-icons">${heartIcon}</span>
                </button>
                <button class="action-btn quick-view-btn" data-product-id="${product.id}" aria-label="Quick view">
                    <span class="material-icons">visibility</span>
                </button>
            </div>
        </div>
        <div class="product-info">
            <p class="product-category">${product.category}</p>
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">${window.auranovaFunctions?.formatPrice(product.price) || `₦${product.price.toLocaleString()}`}</p>
            <button class="add-to-cart-btn" data-product-id="${product.id}">
                Add to Cart
            </button>
        </div>
    `;

  // Add event listeners
  addProductEventListeners(card, product);

  return card;
}

/* ==========================================
   ADD EVENT LISTENERS TO PRODUCT CARD
   ========================================== */
function addProductEventListeners(card, product) {
  // Add to cart button
  const addToCartBtn = card.querySelector(".add-to-cart-btn");
  addToCartBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    window.auranovaFunctions?.addToCart(product);
  });

  // Wishlist button
  const wishlistBtn = card.querySelector(".wishlist-btn");
  wishlistBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const icon = wishlistBtn.querySelector(".material-icons");
    const isAdded = window.auranovaFunctions?.toggleWishlist(product);

    if (isAdded !== undefined) {
      icon.textContent = isAdded ? "favorite" : "favorite_border";
    }
  });

  // Quick view button
  const quickViewBtn = card.querySelector(".quick-view-btn");
  quickViewBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    openQuickView(product);
  });

  // Click on card to go to product details
  card.addEventListener("click", () => {
    window.location.href = `pages/product-details.html?id=${product.id}`;
  });
}

/* ==========================================
   QUICK VIEW MODAL (Placeholder)
   ========================================== */
function openQuickView(product) {
  // This will be implemented later with a modal
  console.log("Quick view for:", product.name);
  window.auranovaFunctions?.showNotification("Quick view coming soon!", "info");
}

/* ==========================================
   FILTER PRODUCTS
   ========================================== */
function filterProducts(category = null, minPrice = 0, maxPrice = Infinity) {
  return productsData.filter((product) => {
    const categoryMatch = category ? product.category === category : true;
    const priceMatch = product.price >= minPrice && product.price <= maxPrice;
    return categoryMatch && priceMatch;
  });
}

/* ==========================================
   SEARCH PRODUCTS
   ========================================== */
function searchProducts(query) {
  const searchTerm = query.toLowerCase();
  return productsData.filter((product) => {
    return (
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
  });
}

/* ==========================================
   GET PRODUCT BY ID
   ========================================== */
function getProductById(id) {
  // Handle both string and number IDs (Firestore uses strings)
  return productsData.find((product) => product.id === id || product.id === parseInt(id));
}

/* ==========================================
   LOAD PRODUCTS FROM FIRESTORE
   ========================================== */
async function loadProductsFromFirestore() {
  try {
    if (!window.firebaseApp?.db) {
      console.warn('Firebase not initialized, using sample data');
      return null;
    }

    const snapshot = await window.firebaseApp.db.collection('products').get();
    const products = [];
    
    snapshot.forEach(doc => {
      products.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log(`Loaded ${products.length} products from Firestore`);
    return products;
  } catch (error) {
    console.error('Error loading products from Firestore:', error);
    return null;
  }
}

/* ==========================================
   LOAD PRODUCTS FROM LOCALSTORAGE
   ========================================== */
function loadProductsFromLocalStorage() {
  try {
    const stored = localStorage.getItem('auranova_products');
    if (stored) {
      const products = JSON.parse(stored);
      console.log(`Loaded ${products.length} products from localStorage`);
      return products;
    }
  } catch (error) {
    console.error('Error loading from localStorage:', error);
  }
  return null;
}

/* ==========================================
   LATEST PRODUCTS ON HOME PAGE
   ========================================== */
document.addEventListener("DOMContentLoaded", async function () {
  // Load products from Firestore, localStorage, or use sample data
  let loadedProducts = await loadProductsFromFirestore();
  
  if (!loadedProducts) {
    loadedProducts = loadProductsFromLocalStorage();
  }
  
  if (loadedProducts) {
    // Replace productsData with loaded data
    window.auranovaProducts.productsData = loadedProducts;
    Object.assign(productsData, loadedProducts);
  }
  
  const latestProductsContainer = document.getElementById("latestProducts");

  if (latestProductsContainer) {
    // Get latest 8 products (those with 'new' badge or first 8)
    const latestProducts = productsData
      .filter(p => p.badges && p.badges.includes('new'))
      .slice(0, 8)
      .length > 0 
      ? productsData.filter(p => p.badges && p.badges.includes('new')).slice(0, 8)
      : productsData.slice(0, 8);
    displayProducts(latestProducts, "latestProducts");
  }

  // Load testimonials
  loadTestimonials();
});

/* ==========================================
   TESTIMONIALS DATA & DISPLAY
   ========================================== */
const testimonialsData = [
  {
    id: 1,
    text: "AURANOVA-AFRIQUE transformed my wardrobe. The craftsmanship is unmatched, and every piece tells a story. Truly premium quality!",
    author: "Chief Adebayo Olumide",
    role: "Business Executive",
    rating: 5,
  },
  {
    id: 2,
    text: "I ordered a custom kaftan for my wedding and the attention to detail was exceptional. The team understood exactly what I wanted.",
    author: "Mrs. Chioma Nwankwo",
    role: "Fashion Enthusiast",
    rating: 5,
  },
  {
    id: 3,
    text: "The limited edition pieces are worth every naira. AURANOVA-AFRIQUE is setting new standards for Nigerian luxury fashion.",
    author: "Engr. Babatunde Fashola",
    role: "Style Icon",
    rating: 5,
  },
];

function loadTestimonials() {
  const container = document.getElementById("testimonialsSlider");
  if (!container) return;

  const currentTestimonial = testimonialsData[0];

  container.innerHTML = `
        <div class="testimonial-item">
            <div class="testimonial-rating">
                ${"★".repeat(currentTestimonial.rating)}
            </div>
            <p class="testimonial-text">"${currentTestimonial.text}"</p>
            <h4 class="testimonial-author">${currentTestimonial.author}</h4>
            <p class="testimonial-role">${currentTestimonial.role}</p>
        </div>
    `;
}

/* ==========================================
   EXPORT FUNCTIONS
   ========================================== */
window.auranovaProducts = {
  productsData,
  displayProducts,
  filterProducts,
  searchProducts,
  getProductById,
  createProductCard,
  loadProductsFromFirestore,
  loadProductsFromLocalStorage,
};
