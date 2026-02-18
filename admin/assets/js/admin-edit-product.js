/* ==========================================
   EDIT PRODUCT - WITH IMAGE MANAGEMENT
   ========================================== */

let currentProduct = null;
let productId = null;
let existingImages = [];
let newSelectedFiles = [];
let imagesToDelete = [];

/* ==========================================
   WAIT FOR FIREBASE
   ========================================== */
function waitForFirebase(callback) {
    if (window.firebaseApp && window.firebaseApp.auth && window.firebaseApp.db) {
        callback();
    } else {
        setTimeout(function () { waitForFirebase(callback); }, 100);
    }
}

/* ==========================================
   PAGE LOAD - called by admin-main.js after auth confirmed
   ========================================== */
window.loadPageData = async function () {
    waitForFirebase(async function () {
        const urlParams = new URLSearchParams(window.location.search);
        productId = urlParams.get('id');

        if (!productId) {
            window.firebaseApp.showNotification('No product ID provided', 'error');
            window.location.href = 'products.html';
            return;
        }

        await loadProduct();
        initImageUpload();
        initFormSubmit();
        initDeleteButton();
    });
};

/* ==========================================
   LOAD PRODUCT FROM FIRESTORE
   ========================================== */
async function loadProduct() {
    const { db, showNotification } = window.firebaseApp;

    const loadingState = document.getElementById('loadingState');
    const form = document.getElementById('editProductForm');

    if (loadingState) loadingState.style.display = 'block';
    if (form) form.style.display = 'none';

    try {
        const doc = await db.collection('products').doc(productId).get();

        if (!doc.exists) {
            showNotification('Product not found', 'error');
            window.location.href = 'products.html';
            return;
        }

        currentProduct = { id: doc.id, ...doc.data() };
        populateForm();

        if (loadingState) loadingState.style.display = 'none';
        if (form) form.style.display = 'block';

    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Failed to load product', 'error');
        window.location.href = 'products.html';
    }
}

/* ==========================================
   POPULATE FORM WITH PRODUCT DATA
   ========================================== */
function populateForm() {
    const setValue = function (id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value || '';
    };

    setValue('productName', currentProduct.name);
    setValue('productDescription', currentProduct.description);
    setValue('productCategory', currentProduct.category);
    setValue('productPrice', currentProduct.price || 0);
    setValue('productStock', currentProduct.stock || 0);
    setValue('productSku', currentProduct.sku);
    setValue('productStatus', currentProduct.status || 'published');

    const inStockEl = document.getElementById('productInStock');
    if (inStockEl) inStockEl.checked = currentProduct.inStock !== false;

    // Sizes
    if (currentProduct.sizes && Array.isArray(currentProduct.sizes)) {
        currentProduct.sizes.forEach(function (size) {
            const checkbox = document.querySelector('input[name="sizes"][value="' + size + '"]');
            if (checkbox) checkbox.checked = true;
        });
    }

    // Colors
    if (currentProduct.colors && Array.isArray(currentProduct.colors)) {
        const colorsEl = document.getElementById('productColors');
        if (colorsEl) colorsEl.value = currentProduct.colors.join(', ');
    }

    // Badges
    if (currentProduct.badges && Array.isArray(currentProduct.badges)) {
        currentProduct.badges.forEach(function (badge) {
            const checkbox = document.querySelector('input[name="badges"][value="' + badge + '"]');
            if (checkbox) checkbox.checked = true;
        });
    }

    // Images
    existingImages = currentProduct.images || (currentProduct.image ? [currentProduct.image] : []);
    displayExistingImages();
}

/* ==========================================
   DISPLAY EXISTING IMAGES
   ========================================== */
function displayExistingImages() {
    const grid = document.getElementById('existingImagesGrid');
    if (!grid) return;

    if (existingImages.length === 0) {
        grid.innerHTML = '<p style="color:#999;text-align:center;">No images</p>';
        return;
    }

    grid.innerHTML = existingImages.map(function (url, index) {
        return `
            <div class="image-preview-item" data-url="${url}">
                <img src="${url}" alt="Product image ${index + 1}">
                <button type="button" class="remove-image" data-index="${index}">
                    <span class="material-icons">close</span>
                </button>
                ${index === 0 ? '<span class="primary-badge">Primary</span>' : ''}
            </div>`;
    }).join('');

    grid.querySelectorAll('.remove-image').forEach(function (btn) {
        btn.addEventListener('click', function () {
            removeExistingImage(parseInt(this.dataset.index));
        });
    });
}

/* ==========================================
   REMOVE EXISTING IMAGE
   ========================================== */
function removeExistingImage(index) {
    const imageUrl = existingImages[index];
    imagesToDelete.push(imageUrl);
    existingImages.splice(index, 1);
    displayExistingImages();
    window.firebaseApp.showNotification('Image will be removed when you save', 'info');
}

/* ==========================================
   NEW IMAGE UPLOAD INITIALIZATION
   ========================================== */
function initImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');

    if (!uploadArea || !imageInput) return;

    uploadArea.addEventListener('click', function () { imageInput.click(); });

    uploadArea.addEventListener('dragover', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(212, 175, 55, 0.05)';
    });

    uploadArea.addEventListener('dragleave', function () {
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.background = '#f5f5f5';
    });

    uploadArea.addEventListener('drop', function (e) {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.background = '#f5f5f5';

        const files = Array.from(e.dataTransfer.files).filter(function (file) {
            return file.type.startsWith('image/');
        });

        if (files.length > 0) handleNewFileSelect(files);
    });

    imageInput.addEventListener('change', function (e) {
        const files = Array.from(e.target.files);
        if (files.length > 0) handleNewFileSelect(files);
    });
}

/* ==========================================
   HANDLE NEW FILE SELECTION
   ========================================== */
function handleNewFileSelect(files) {
    const { showNotification } = window.firebaseApp;
    const totalImages = existingImages.length + newSelectedFiles.length;

    if (totalImages + files.length > 5) {
        showNotification('Maximum 5 images allowed total', 'warning');
        return;
    }

    const maxSize = 5 * 1024 * 1024;
    for (const file of files) {
        if (file.size > maxSize) {
            showNotification(file.name + ' is too large. Max size is 5MB', 'error');
            return;
        }
    }

    newSelectedFiles = [...newSelectedFiles, ...files];
    displayNewImagePreviews();
}

/* ==========================================
   DISPLAY NEW IMAGE PREVIEWS
   ========================================== */
function displayNewImagePreviews() {
    const grid = document.getElementById('newImagesGrid');
    if (!grid) return;

    grid.innerHTML = '';

    newSelectedFiles.forEach(function (file, index) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const div = document.createElement('div');
            div.className = 'image-preview-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="New image ${index + 1}">
                <button type="button" class="remove-image" data-index="${index}">
                    <span class="material-icons">close</span>
                </button>`;

            div.querySelector('.remove-image').addEventListener('click', function () {
                removeNewImage(parseInt(this.dataset.index));
            });

            grid.appendChild(div);
        };

        reader.readAsDataURL(file);
    });

    const uploadArea = document.getElementById('imageUploadArea');
    if (uploadArea) {
        const totalImages = existingImages.length + newSelectedFiles.length;
        uploadArea.style.display = totalImages >= 5 ? 'none' : 'flex';
    }
}

/* ==========================================
   REMOVE NEW IMAGE
   ========================================== */
function removeNewImage(index) {
    newSelectedFiles.splice(index, 1);
    displayNewImagePreviews();
}

/* ==========================================
   UPLOAD NEW IMAGES TO CLOUDINARY
   ========================================== */
async function uploadNewImages() {
    const { CLOUDINARY_CONFIG } = window.firebaseApp;

    if (newSelectedFiles.length === 0) return [];

    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');

    if (uploadProgress) uploadProgress.style.display = 'block';
    const uploadedUrls = [];

    try {
        for (let i = 0; i < newSelectedFiles.length; i++) {
            const file = newSelectedFiles[i];

            const progress = ((i + 1) / newSelectedFiles.length) * 100;
            if (progressFill) progressFill.style.width = progress + '%';
            if (progressText) progressText.textContent = 'Uploading image ' + (i + 1) + ' of ' + newSelectedFiles.length + '...';

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('folder', 'auranova-products');

            const response = await fetch(
                'https://api.cloudinary.com/v1_1/' + CLOUDINARY_CONFIG.cloudName + '/image/upload',
                { method: 'POST', body: formData }
            );

            if (!response.ok) throw new Error('Upload failed for ' + file.name);

            const data = await response.json();
            uploadedUrls.push(data.secure_url);
        }

        if (progressText) progressText.textContent = 'Upload complete!';
        if (uploadProgress) setTimeout(function () { uploadProgress.style.display = 'none'; }, 1000);

        return uploadedUrls;

    } catch (error) {
        console.error('Upload error:', error);
        if (uploadProgress) uploadProgress.style.display = 'none';
        throw error;
    }
}

/* ==========================================
   FORM SUBMISSION
   ========================================== */
function initFormSubmit() {
    const form = document.getElementById('editProductForm');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const { db, showNotification } = window.firebaseApp;

        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn ? submitBtn.innerHTML : '';
        if (submitBtn) {
            submitBtn.innerHTML = '<span class="spinner"></span> Updating...';
            submitBtn.disabled = true;
        }

        try {
            // 1. Upload new images if any
            let newImageUrls = [];
            if (newSelectedFiles.length > 0) {
                newImageUrls = await uploadNewImages();
            }

            // 2. Combine existing and new images
            const allImages = [...existingImages, ...newImageUrls];

            if (allImages.length === 0) {
                throw new Error('Product must have at least one image');
            }

            // 3. Collect form data
            const formData = new FormData(form);

            const sizes = Array.from(form.querySelectorAll('input[name="sizes"]:checked'))
                .map(function (cb) { return cb.value; });

            const colorsInput = formData.get('colors');
            const colors = colorsInput
                ? colorsInput.split(',').map(function (c) { return c.trim(); }).filter(function (c) { return c; })
                : [];

            const badges = Array.from(form.querySelectorAll('input[name="badges"]:checked'))
                .map(function (cb) { return cb.value; });

            // 4. Build update object
            const updateData = {
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                stock: parseInt(formData.get('stock')),
                sku: formData.get('sku') || null,
                sizes: sizes,
                colors: colors,
                badges: badges,
                images: allImages,
                image: allImages[0],
                status: formData.get('status'),
                inStock: form.querySelector('input[name="inStock"]')?.checked || false,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            // 5. Update in Firestore
            await db.collection('products').doc(productId).update(updateData);

            showNotification('Product updated successfully!', 'success');

            setTimeout(function () {
                window.location.href = 'products.html';
            }, 1500);

        } catch (error) {
            console.error('Error updating product:', error);
            window.firebaseApp.showNotification(error.message || 'Failed to update product', 'error');

            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    });
}

/* ==========================================
   DELETE PRODUCT
   ========================================== */
function initDeleteButton() {
    const deleteBtn = document.getElementById('deleteProductBtn');
    const modal = document.getElementById('deleteModal');
    const confirmBtn = document.getElementById('confirmDelete');
    const cancelBtn = document.getElementById('cancelDelete');

    if (!deleteBtn || !modal || !confirmBtn || !cancelBtn) return;

    deleteBtn.addEventListener('click', function () {
        modal.style.display = 'flex';
    });

    cancelBtn.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    confirmBtn.addEventListener('click', async function () {
        modal.style.display = 'none';
        await deleteProduct();
    });
}

async function deleteProduct() {
    const { db, showNotification } = window.firebaseApp;

    try {
        showNotification('Deleting product...', 'info');
        await db.collection('products').doc(productId).delete();
        showNotification('Product deleted successfully', 'success');

        setTimeout(function () {
            window.location.href = 'products.html';
        }, 1500);

    } catch (error) {
        console.error('Error deleting product:', error);
        window.firebaseApp.showNotification('Failed to delete product', 'error');
    }
}