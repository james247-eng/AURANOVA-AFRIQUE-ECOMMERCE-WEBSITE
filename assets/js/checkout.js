/* CHECKOUT PAGE */
let currentStep = 1;
let formData = {};
let cart = [];

document.addEventListener('DOMContentLoaded', function() {
    cart = window.auranovaFunctions?.getCart() || [];
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    loadOrderSummary();
    initPaymentToggle();
    initFormSubmit();
});

function loadOrderSummary() {
    const container = document.getElementById('summaryItems');
    container.innerHTML = '';
    
    let subtotal = 0;
    
    cart.forEach(item => {
        const quantity = item.quantity || 1;
        const itemTotal = item.price * quantity;
        subtotal += itemTotal;
        
        const div = document.createElement('div');
        div.className = 'summary-item';
        div.innerHTML = `
            <div class="summary-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="summary-item-details">
                <div class="summary-item-name">${item.name}</div>
                <div class="summary-item-meta">Qty: ${quantity} | ${item.selectedSize || 'N/A'}</div>
                <div class="summary-item-price">${window.auranovaFunctions?.formatPrice(itemTotal) || `₦${itemTotal.toLocaleString()}`}</div>
            </div>
        `;
        container.appendChild(div);
    });
    
    const delivery = subtotal >= 50000 ? 0 : 2500;
    const total = subtotal + delivery;
    
    document.getElementById('summarySubtotal').textContent = window.auranovaFunctions?.formatPrice(subtotal) || `₦${subtotal.toLocaleString()}`;
    document.getElementById('summaryDelivery').textContent = delivery === 0 ? 'FREE' : (window.auranovaFunctions?.formatPrice(delivery) || `₦${delivery.toLocaleString()}`);
    document.getElementById('summaryTotal').textContent = window.auranovaFunctions?.formatPrice(total) || `₦${total.toLocaleString()}`;
}

function nextStep() {
    if (!validateStep(currentStep)) return;
    
    saveStepData(currentStep);
    
    const currentStepEl = document.getElementById(`step${currentStep}`);
    const currentStepIndicator = document.querySelector(`.step[data-step="${currentStep}"]`);
    
    currentStepEl.classList.remove('active');
    currentStepIndicator.classList.remove('active');
    currentStepIndicator.classList.add('completed');
    
    currentStep++;
    
    const nextStepEl = document.getElementById(`step${currentStep}`);
    const nextStepIndicator = document.querySelector(`.step[data-step="${currentStep}"]`);
    
    nextStepEl.classList.add('active');
    nextStepIndicator.classList.add('active');
    
    if (currentStep === 4) {
        displayReview();
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function prevStep() {
    const currentStepEl = document.getElementById(`step${currentStep}`);
    const currentStepIndicator = document.querySelector(`.step[data-step="${currentStep}"]`);
    
    currentStepEl.classList.remove('active');
    currentStepIndicator.classList.remove('active');
    
    currentStep--;
    
    const prevStepEl = document.getElementById(`step${currentStep}`);
    const prevStepIndicator = document.querySelector(`.step[data-step="${currentStep}"]`);
    
    prevStepEl.classList.add('active');
    prevStepIndicator.classList.add('active');
    prevStepIndicator.classList.remove('completed');
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function validateStep(step) {
    const stepEl = document.getElementById(`step${step}`);
    const inputs = stepEl.querySelectorAll('input[required], select[required]');
    
    for (let input of inputs) {
        if (!input.value.trim()) {
            input.focus();
            window.auranovaFunctions?.showNotification('Please fill in all required fields', 'info');
            return false;
        }
    }
    
    return true;
}

function saveStepData(step) {
    const stepEl = document.getElementById(`step${step}`);
    const inputs = stepEl.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (input.name) {
            formData[input.name] = input.value;
        }
    });
}

function displayReview() {
    document.getElementById('reviewContact').textContent = 
        `${formData.firstName} ${formData.lastName}\n${formData.email}\n${formData.phone}`;
    
    document.getElementById('reviewAddress').textContent = 
        `${formData.address}\n${formData.city}, ${formData.state}\n${formData.postalCode || 'N/A'}`;
    
    const paymentMethods = {
        'card': 'Credit/Debit Card',
        'transfer': 'Bank Transfer',
        'paystack': 'Paystack',
        'pod': 'Pay on Delivery'
    };
    
    document.getElementById('reviewPayment').textContent = 
        paymentMethods[formData.paymentMethod] || 'Not selected';
}

function initPaymentToggle() {
    const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]');
    const cardDetails = document.getElementById('cardDetails');
    
    paymentOptions.forEach(option => {
        option.addEventListener('change', function() {
            if (this.value === 'card') {
                cardDetails.style.display = 'block';
            } else {
                cardDetails.style.display = 'none';
            }
        });
    });
}

function initFormSubmit() {
    const form = document.getElementById('checkoutForm');
    
    function activateStep(step) {
        // clear active/completed classes
        document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.step').forEach(el => el.classList.remove('active', 'completed'));

        // mark previous steps as completed
        for (let i = 1; i < step; i++) {
            const ind = document.querySelector(`.step[data-step="${i}"]`);
            if (ind) ind.classList.add('completed');
        }

        const stepEl = document.getElementById(`step${step}`);
        const stepInd = document.querySelector(`.step[data-step="${step}"]`);
        if (stepEl) stepEl.classList.add('active');
        if (stepInd) stepInd.classList.add('active');
        currentStep = step;
    }

    function validateAllSteps() {
        // Validate required inputs across all steps; if any missing, activate that step and return false
        for (let s = 1; s <= 4; s++) {
            const stepEl = document.getElementById(`step${s}`);
            if (!stepEl) continue;
            const inputs = stepEl.querySelectorAll('input[required], select[required]');
            for (let input of inputs) {
                if (!input.value || !String(input.value).trim()) {
                    activateStep(s);
                    // try to focus if possible
                    try { input.focus(); } catch (e) {}
                    window.auranovaFunctions?.showNotification('Please fill in all required fields', 'info');
                    return false;
                }
            }
        }
        // All required fields present
        // Save all steps data
        for (let s = 1; s <= 4; s++) saveStepData(s);
        return true;
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // run script validation instead of native
        if (!validateAllSteps()) return;

        const termsAgree = document.getElementById('termsAgree');
        if (!termsAgree || !termsAgree.checked) {
            window.auranovaFunctions?.showNotification('Please agree to terms and conditions', 'info');
            activateStep(4);
            return;
        }

        placeOrder();
    });
}

function placeOrder() {
    window.auranovaFunctions?.showNotification('Processing your order...', 'info');

    // Prepare order payload
    const order = {
        user: null,
        items: cart,
        form: formData,
        subtotal: cart.reduce((s, it) => s + ((it.price || 0) * (it.quantity || 1)), 0),
        delivery: 0,
        total: 0,
        paymentMethod: formData.paymentMethod || 'unknown',
        status: 'pending',
        createdAt: null,
    };

    order.delivery = order.subtotal >= 50000 ? 0 : 2500;
    order.total = order.subtotal + order.delivery;

    // Attach user info if available
    try {
        const userStr = localStorage.getItem('auranova_user');
        if (userStr) {
            const usr = JSON.parse(userStr);
            order.user = { uid: usr.uid || usr.id || null, email: usr.email || null, name: usr.displayName || null };
        }
    } catch (err) {
        // ignore parse errors
    }

    // If Firestore is available via admin firebaseConfig (window.firebaseApp.db), persist order
    const db = window.firebaseApp?.db || (window.firebase && window.firebase.firestore ? window.firebase.firestore() : null);

    if (!db) {
        // Backend not configured - fallback to simulated behavior
        window.auranovaFunctions?.showNotification('Backend not configured. Order saved locally.', 'warning');

        // Save a local copy for debugging
        try {
            const localOrders = JSON.parse(localStorage.getItem('auranova_orders') || '[]');
            order.createdAt = new Date().toISOString();
            localOrders.push(order);
            localStorage.setItem('auranova_orders', JSON.stringify(localOrders));
        } catch (err) {
            // ignore
        }

        setTimeout(() => {
            localStorage.removeItem('auranova_cart');
            window.auranovaFunctions?.updateCartCount?.();
            window.auranovaFunctions?.showNotification('Order placed (local).', 'success');
            setTimeout(() => window.location.href = '../index.html', 1500);
        }, 800);

        return;
    }

    // Use Firestore (compat or instance) to add order
    try {
        const ordersCol = db.collection ? db.collection('orders') : db;

        // Use server timestamp where supported
        if (window.firebase && window.firebase.firestore && window.firebase.firestore.FieldValue) {
            order.createdAt = window.firebase.firestore.FieldValue.serverTimestamp();
        }

        ordersCol.add ? ordersCol.add(order).then(() => {
            // Success
            localStorage.removeItem('auranova_cart');
            window.auranovaFunctions?.updateCartCount?.();
            window.auranovaFunctions?.showNotification('Order placed successfully!', 'success');
            setTimeout(() => window.location.href = '../index.html', 1500);
        }).catch(err => {
            console.error('Error saving order:', err);
            window.auranovaFunctions?.showNotification('Failed to save order. Try again later.', 'error');
        }) : Promise.resolve().then(() => {
            // If db is already a reference to collection.add function (unlikely), fallback
            localStorage.removeItem('auranova_cart');
            window.auranovaFunctions?.updateCartCount?.();
            window.auranovaFunctions?.showNotification('Order placed (fallback).', 'success');
            setTimeout(() => window.location.href = '../index.html', 1500);
        });
    } catch (err) {
        console.error('Order persistence error:', err);
        window.auranovaFunctions?.showNotification('An unexpected error occurred', 'error');
    }
}