/* ==========================================
   INPUT VALIDATION & SANITIZATION UTILITY
   For AURANOVA-AFRIQUE Security
   ========================================== */

const InputValidator = {
  // Email validation
  isValidEmail: function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },

  // Password validation (min 8 chars, 1 uppercase, 1 number, 1 special char)
  isValidPassword: function (password) {
    const passwordRegex =
      /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
  },

  // Phone number validation (Nigerian format)
  isValidPhoneNigeria: function (phone) {
    const phoneRegex = /^(\+234|0)[1-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  },

  // Name validation (letters, spaces, hyphens only)
  isValidName: function (name) {
    const nameRegex = /^[a-zA-Z\s\-']{2,50}$/;
    return nameRegex.test(name.trim());
  },

  // URL validation
  isValidURL: function (url) {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Price validation (positive number)
  isValidPrice: function (price) {
    const priceNum = parseFloat(price);
    return !isNaN(priceNum) && priceNum > 0 && priceNum <= 9999999;
  },

  // Stock validation (non-negative integer)
  isValidStock: function (stock) {
    const stockNum = parseInt(stock);
    return !isNaN(stockNum) && stockNum >= 0 && stockNum <= 999999;
  },

  // Sanitize text input (remove malicious content)
  sanitizeText: function (text) {
    if (typeof text !== "string") return "";

    // Create a temporary element to escape HTML
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  // Sanitize HTML (basic - only allows safe tags)
  sanitizeHTML: function (html) {
    const allowedTags = ["p", "br", "strong", "em", "u", "a", "ul", "li", "ol"];
    const div = document.createElement("div");
    div.innerHTML = html;

    const allElements = div.getElementsByTagName("*");
    for (let i = allElements.length - 1; i >= 0; i--) {
      const element = allElements[i];
      if (!allowedTags.includes(element.tagName.toLowerCase())) {
        const text = document.createTextNode(element.textContent);
        element.parentNode.replaceChild(text, element);
      }
    }

    return div.innerHTML;
  },

  // Validate form fields
  validateForm: function (formElement) {
    const errors = [];
    const inputs = formElement.querySelectorAll("[required]");

    inputs.forEach((input) => {
      if (!input.value.trim()) {
        errors.push(`${input.name || input.id} is required`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  },

  // Validate credit card (Luhn algorithm)
  isValidCreditCard: function (cardNumber) {
    const cleaned = cardNumber.replace(/\D/g, "");
    if (cleaned.length < 13 || cleaned.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  // Truncate text to specified length
  truncateText: function (text, maxLength = 100) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + "...";
  },

  // Format and validate address
  isValidAddress: function (address) {
    const addressRegex = /^[a-zA-Z0-9\s,.\-#]{5,100}$/;
    return addressRegex.test(address.trim());
  },
};

// Export for use
if (typeof window !== "undefined") {
  window.InputValidator = InputValidator;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = InputValidator;
}
