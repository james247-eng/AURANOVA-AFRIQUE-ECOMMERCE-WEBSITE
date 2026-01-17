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
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const termsAgree = document.getElementById('termsAgree');
        if (!termsAgree.checked) {
            window.auranovaFunctions?.showNotification('Please agree to terms and conditions', 'info');
            return;
        }
        
        placeOrder();
    });
}

function placeOrder() {
    window.auranovaFunctions?.showNotification('Processing your order...', 'info');
    
    setTimeout(() => {
        localStorage.removeItem('auranova_cart');
        window.auranovaFunctions?.updateCartCount?.();
        
        window.auranovaFunctions?.showNotification('Order placed successfully!', 'success');
        
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    }, 2000);
}