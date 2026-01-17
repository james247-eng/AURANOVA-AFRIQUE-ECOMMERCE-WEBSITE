/* ==========================================
   ADD PRODUCT - WITH CLOUDINARY UPLOAD
   ========================================== */

const { db, CLOUDINARY_CONFIG, showNotification } = window.firebaseApp;

let uploadedImages = [];
let selectedFiles = [];

/* ==========================================
   PAGE LOAD
   ========================================== */
document.addEventListener('DOMContentLoaded', function() {
    initImageUpload();
    initFormSubmit();
});

/* ==========================================
   IMAGE UPLOAD INITIALIZATION
   ========================================== */
function initImageUpload() {
    const uploadArea = document.getElementById('imageUploadArea');
    const imageInput = document.getElementById('imageInput');
    const previewGrid = document.getElementById('imagePreviewGrid');
    
    // Click to upload
    uploadArea.addEventListener('click', () => {
        imageInput.click();
    });
    
    // Drag and drop
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
            handleFileSelect(files);
        }
    });
    
    // File input change
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            handleFileSelect(files);
        }
    });
}

/* ==========================================
   HANDLE FILE SELECTION
   ========================================== */
function handleFileSelect(files) {
    // Check max files (5)
    if (selectedFiles.length + files.length > 5) {
        showNotification('Maximum 5 images allowed', 'warning');
        return;
    }
    
    // Check file sizes
    const maxSize = 5 * 1024 * 1024; // 5MB
    for (const file of files) {
        if (file.size > maxSize) {
            showNotification(`${file.name} is too large. Max size is 5MB`, 'error');
            return;
        }
    }
    
    selectedFiles = [...selectedFiles, ...files];
    displayImagePreviews();
}

/* ==========================================
   DISPLAY IMAGE PREVIEWS
   ========================================== */
function displayImagePreviews() {
    const previewGrid = document.getElementById('imagePreviewGrid');
    
    previewGrid.innerHTML = '';
    
    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const previewDiv = document.createElement('div');
            previewDiv.className = 'image-preview-item';
            previewDiv.innerHTML = `
                <img src="${e.target.result}" alt="Preview ${index + 1}">
                <button type="button" class="remove-image" data-index="${index}">
                    <span class="material-icons">close</span>
                </button>
                ${index === 0 ? '<span class="primary-badge">Primary</span>' : ''}
            `;
            
            // Remove button
            previewDiv.querySelector('.remove-image').addEventListener('click', function() {
                removeImage(this.dataset.index);
            });
            
            previewGrid.appendChild(previewDiv);
        };
        
        reader.readAsDataURL(file);
    });
    
    // Show/hide upload area
    const uploadArea = document.getElementById('imageUploadArea');
    if (selectedFiles.length >= 5) {
        uploadArea.style.display = 'none';
    } else {
        uploadArea.style.display = 'flex';
    }
}

/* ==========================================
   REMOVE IMAGE
   ========================================== */
function removeImage(index) {
    selectedFiles.splice(index, 1);
    displayImagePreviews();
}

/* ==========================================
   UPLOAD IMAGES TO CLOUDINARY
   ========================================== */
async function uploadImagesToCloudinary() {
    if (selectedFiles.length === 0) {
        showNotification('Please select at least one image', 'error');
        return null;
    }
    
    const uploadProgress = document.getElementById('uploadProgress');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    uploadProgress.style.display = 'block';
    uploadedImages = [];
    
    try {
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            
            // Update progress
            const progress = ((i + 1) / selectedFiles.length) * 100;
            progressFill.style.width = `${progress}%`;
            progressText.textContent = `Uploading image ${i + 1} of ${selectedFiles.length}...`;
            
            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
            formData.append('folder', 'auranova-products'); // Optional: organize in folders
            
            // Upload to Cloudinary
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            if (!response.ok) {
                throw new Error(`Upload failed for ${file.name}`);
            }
            
            const data = await response.json();
            uploadedImages.push(data.secure_url);
        }
        
        progressText.textContent = 'Upload complete!';
        
        setTimeout(() => {
            uploadProgress.style.display = 'none';
        }, 1000);
        
        return uploadedImages;
        
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        uploadProgress.style.display = 'none';
        showNotification('Failed to upload images. Please try again.', 'error');
        return null;
    }
}

/* ==========================================
   FORM SUBMISSION
   ========================================== */
function initFormSubmit() {
    const form = document.getElementById('addProductForm');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="spinner"></span> Adding Product...';
        submitBtn.disabled = true;
        
        try {
            // 1. Upload images first
            const imageUrls = await uploadImagesToCloudinary();
            
            if (!imageUrls || imageUrls.length === 0) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                return;
            }
            
            // 2. Collect form data
            const formData = new FormData(form);
            
            // Get selected sizes
            const sizes = Array.from(form.querySelectorAll('input[name="sizes"]:checked'))
                .map(cb => cb.value);
            
            // Get colors (comma-separated)
            const colorsInput = formData.get('colors');
            const colors = colorsInput 
                ? colorsInput.split(',').map(c => c.trim()).filter(c => c)
                : [];
            
            // Get badges
            const badges = Array.from(form.querySelectorAll('input[name="badges"]:checked'))
                .map(cb => cb.value);
            
            // 3. Create product object
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                stock: parseInt(formData.get('stock')),
                sku: formData.get('sku') || null,
                sizes: sizes,
                colors: colors,
                badges: badges,
                images: imageUrls,
                image: imageUrls[0], // Primary image for backwards compatibility
                status: formData.get('status'),
                inStock: form.querySelector('input[name="inStock"]').checked,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            
            // 4. Add to Firestore
            const docRef = await db.collection('products').add(productData);
            
            showNotification('Product added successfully!', 'success');
            
            // 5. Redirect to products page after delay
            setTimeout(() => {
                window.location.href = 'products.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error adding product:', error);
            showNotification('Failed to add product. Please try again.', 'error');
            
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

/* ==========================================
   CSS FOR IMAGE PREVIEW
   Add this to admin.css or inline
   ========================================== */

// Add styles dynamically
const style = document.createElement('style');
style.textContent = `
    .image-preview-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 2px solid #e0e0e0;
    }
    
    .image-preview-item img {
        width: 100%;
        height: 150px;
        object-fit: cover;
    }
    
    .remove-image {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: rgba(255, 0, 0, 0.8);
        color: white;
        border: none;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .remove-image:hover {
        background: #ff0000;
        transform: scale(1.1);
    }
    
    .primary-badge {
        position: absolute;
        bottom: 0.5rem;
        left: 0.5rem;
        background: var(--primary);
        color: #000;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    
    .spinner {
        width: 16px;
        height: 16px;
        border: 2px solid #000;
        border-top-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        display: inline-block;
        margin-right: 0.5rem;
    }
    
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);