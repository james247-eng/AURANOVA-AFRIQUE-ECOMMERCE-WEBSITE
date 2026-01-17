/* ==========================================
   EDIT PRODUCT - WITH IMAGE MANAGEMENT
   ========================================== */

const { db, CLOUDINARY_CONFIG, showNotification } = window.firebaseApp;

let currentProduct = null;
let productId = null;
let existingImages = [];
let newSelectedFiles = [];
let imagesToDelete = [];

/* ==========================================
   PAGE LOAD
   ========================================== */
window.loadPageData = async function() {
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    productId = urlParams.get('id');
    
    if (!productId) {
        showNotification('No product ID provided', 'error');
        window.location.href = 'products.html';
        return;
    }
    
    await loadProduct();
    initImageUpload();
    initFormSubmit();
    initDeleteButton();
};

/* ==========================================
   LOAD PRODUCT FROM FIRESTORE
   ========================================== */
async function loadProduct() {
    const loadingState = document.getElementById('loadingState');
    const form = document.getElementById('editProductForm');
    
    loadingState.style.display = 'block';
    form.style.display = 'none';
    
    try {
        const doc = await db.collection('products').doc(productId).get();
        
        if (!doc.exists) {
            showNotification('Product not found', 'error');
            window.location.href = 'products.html';
            return;
        }
        
        currentProduct = { id: doc.id, ...doc.data() };
        populateForm();
        
        loadingState.style.display = 'none';
        form.style.display = 'block';
        
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
    // Basic info
    document.getElementById('productName').value = currentProduct.name || '';
    document.getElementById('productDescription').value = currentProduct.description || '';
    document.getElementById('productCategory').value = currentProduct.category || '';
    document.getElementById('productPrice').value = currentProduct.price || 0;
    document.getElementById('productStock').value = currentProduct.stock || 0;
    document.getElementById('productSku').value = currentProduct.sku || '';
    
    // Sizes
    if (currentProduct.sizes && Array.isArray(currentProduct.sizes)) {
        currentProduct.sizes.forEach(size => {
            const checkbox = document.querySelector(`input[name="sizes"][value="${size}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Colors
    if (currentProduct.colors && Array.isArray(currentProduct.colors)) {
        document.getElementById('productColors').value = currentProduct.colors.join(', ');
    }
    
    // Badges
    if (currentProduct.badges && Array.isArray(currentProduct.badges)) {
        currentProduct.badges.forEach(badge => {
            const checkbox = document.querySelector(`input[name="badges"][value="${badge}"]`);
            if (checkbox) checkbox.checked = true;
        });
    }
    
    // Status
    document.getElementById('productStatus').value = currentProduct.status || 'published';
    document.getElementById('productInStock').checked = currentProduct.inStock !== false;
    
    // Images
    existingImages = currentProduct.images || (currentProduct.image ? [currentProduct.image] : []);
    displayExistingImages();
}

/* ==========================================
   DISPLAY EXISTING IMAGES
   ========================================== */
function displayExistingImages() {
    const grid = document.getElementById('existingImagesGrid');
    
    if (existingImages.length === 0) {
        grid.innerHTML = '<p style="color: #999; text-align: center;">No images</p>';
        return;
    }
    
    grid.innerHTML = existingImages.map((url, index) => `
        <div class="image-preview-item" data-url="${url}">
            <img src="${url}" alt="Product image ${index + 1}">
            <button type="button" class="remove-image" data-index="${index}">
                <span class="material-icons">close</span>
            </button>
            ${index === 0 ? '<span class="primary-badge">Primary</span>' : ''}
        </div>
    `).join('');
    
    // Add remove listeners
    grid.querySelectorAll('.remove-image').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            removeExistingImage(index);
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
    showNotification('Image will be removed when you save', 'info');
}

/* ==========================================
   NEW IMAGE UPLOAD INITIALIZATION
   ========================================== */
function initImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = 'var(--primary)';
        uploadArea.style.background = 'rgba(212, 175, 55, 0.05)';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.background = '#f5f5f5';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
        uploadArea.style.background = '#f5f5f5';
        
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/')
        );
        
        if (files.length > 0) {
            handleNewFileSelect(files);
        }
    });
    
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleNewFileSelect(files);
        }
    });
}

/* ==========================================
   HANDLE NEW FILE SELECTION
   ========================================== */
function handleNewFileSelect(files) {
    const totalImages = existingImages.length + newSelectedFiles.length;
    
    if (totalImages + files.length > 5) {
        showNotification('Maximum 5 images allowed total', 'warning');
        return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const file of files) {
        if (file.size > maxSize) {
            showNotification(`${file.name} is too large. Max size is 5MB`, 'error');
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
    
    grid.innerHTML = '';
    
    newSelectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const div = document.createElement('div');
            div.className = 'image-preview-item';
            div.innerHTML = `
                <img src="${e.target.result}" alt="New image ${index + 1}">
                <button type="button" class="remove-image" data-index="${index}">
                    <span class="material-icons">close</span>
                </button>
            `;
            
            div.querySelector('.remove-image').addEventListener('click', function() {
                removeNewImage(this.dataset.index);
            });
            
            grid.appendChild(div);
        };
        
        reader.readAsDataURL(file);
    });
    
    // Show/hide upload area
    const uploadArea = document.getElementById('imageUploadArea');
    const totalImages = existingImages.length + newSelectedFiles.length;
    uploadArea.style.display = totalImages >= 5 ? 'none' : 'flex';
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
    if (newSelectedFiles.length === 0) return [];
    
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    uploadProgress.style.display = 'block';
    const uploadedUrls = [];
    
    try {
        for (let i = 0; i < newSelectedFiles.length; i++) {
            const file = newSelectedFiles[i];
            
            const progress = ((i + 1) / newSelectedFiles.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading image ${i + 1} of ${newSelectedFiles.length}...`;
            
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('folder', 'auranova-products');
            
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
            
            const data = await response.json();
            uploadedUrls.push(data.secure_url);
        }
        
        progressText.textContent = 'Upload complete!';
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 1000);
        
        return uploadedUrls;
        
    } catch (error) {
        console.error('Upload error:', error);
        uploadProgress.style.display = 'none';
        throw error;
    }
}

/* ==========================================
   FORM SUBMISSION
   ========================================== */
function initFormSubmit() {
    const form = document.getElementById('editProductForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Updating...';
        submitBtn.disabled = true;
        
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
                .map(cb => cb.value);
            
            const colorsInput = formData.get('colors');
            const colors = colorsInput 
                ? colorsInput.split(',').map(c => c.trim()).filter(c => c)
                : [];
            
            const badges = Array.from(form.querySelectorAll('input[name="badges"]:checked'))
                .map(cb => cb.value);
            
            // 4. Update product data
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
                inStock: form.querySelector('input[name="inStock"]').checked,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // 5. Update in Firestore
            await db.collection('products').doc(productId).update(updateData);
            
            showNotification('Product updated successfully!', 'success');
            
            // 6. Redirect after delay
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error updating product:', error);
            showNotification(error.message || 'Failed to update product', 'error');
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
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
    
    deleteBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    confirmBtn.addEventListener('click', async () => {
        modal.style.display = 'none';
        await deleteProduct();
    });
}

async function deleteProduct() {
    try {
        showNotification('Deleting product...', 'info');
        
        await db.collection('products').doc(productId).delete();
        
        showNotification('Product deleted successfully', 'success');
        
        setTimeout(() => {
            window.location.href = 'products.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}