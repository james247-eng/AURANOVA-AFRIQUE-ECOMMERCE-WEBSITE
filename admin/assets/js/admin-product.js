/* ==========================================
   PRODUCTS PAGE - admin-product.js
   Loads, filters, paginates and manages
   products from Firestore.
   ========================================== */

const ITEMS_PER_PAGE = 10;
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
let productToDelete = null;
let selectedProducts = new Set();

/* ==========================================
   LOAD PAGE DATA (called by admin-auth)
   ========================================== */
function loadPageData() {
  loadProducts();
  initFilters();
  initBulkActions();
  initDeleteModal();
  initExport();
  initLogout();
}

/* ==========================================
   LOAD PRODUCTS FROM FIRESTORE
   ========================================== */
async function loadProducts() {
  const tbody = document.getElementById("productsTableBody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="8" class="no-data">Loading products...</td></tr>`;

  try {
    const { db } = window.firebaseApp;

    const snapshot = await db
      .collection("products")
      .orderBy("createdAt", "desc")
      .get();

    allProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Products loaded:", allProducts.length);

    filteredProducts = [...allProducts];
    renderProducts();
  } catch (error) {
    console.error("Error loading products:", error);
    tbody.innerHTML = `<tr><td colspan="8" class="no-data">Failed to load products. Please refresh.</td></tr>`;
  }
}

/* ==========================================
   RENDER PRODUCTS TABLE
   ========================================== */
function renderProducts() {
  const tbody = document.getElementById("productsTableBody");
  if (!tbody) return;

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  // Clamp currentPage
  if (currentPage > totalPages) currentPage = totalPages;

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const pageProducts = filteredProducts.slice(start, end);

  if (pageProducts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="no-data">No products found.</td></tr>`;
    updatePagination(totalPages);
    return;
  }

  tbody.innerHTML = pageProducts.map((product) => {
    const price = window.firebaseApp.formatPrice(product.price);
    const date = window.firebaseApp.formatDate(product.createdAt);
    const statusClass = getStatusClass(product.status);
    const imageUrl = product.image || product.images?.[0] || "";
    const checked = selectedProducts.has(product.id) ? "checked" : "";

    return `
      <tr>
        <td>
          <input type="checkbox" class="row-checkbox" data-id="${product.id}" ${checked}>
        </td>
        <td>
          <div class="product-cell">
            ${imageUrl
              ? `<img src="${imageUrl}" alt="${product.name}" class="product-thumb">`
              : `<div class="product-thumb-placeholder"><span class="material-icons">image</span></div>`
            }
            <div class="product-info">
              <span class="product-name">${product.name || "Unnamed"}</span>
              ${product.sku ? `<span class="product-sku">SKU: ${product.sku}</span>` : ""}
            </div>
          </div>
        </td>
        <td>${product.category || "—"}</td>
        <td>${price}</td>
        <td>${product.stock ?? "—"}</td>
        <td><span class="status-badge ${statusClass}">${product.status || "draft"}</span></td>
        <td>${date}</td>
        <td>
          <div class="action-buttons">
            <a href="edit-product.html?id=${product.id}" class="btn-icon" title="Edit">
              <span class="material-icons">edit</span>
            </a>
            <button class="btn-icon btn-icon-danger" title="Delete" onclick="openDeleteModal('${product.id}')">
              <span class="material-icons">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");

  // Re-attach checkbox listeners
  tbody.querySelectorAll(".row-checkbox").forEach((cb) => {
    cb.addEventListener("change", handleRowCheckbox);
  });

  updatePagination(totalPages);
  updateSelectAll();
}

/* ==========================================
   STATUS BADGE CLASS
   ========================================== */
function getStatusClass(status) {
  switch (status) {
    case "published": return "status-published";
    case "draft": return "status-draft";
    case "out-of-stock": return "status-out-of-stock";
    default: return "status-draft";
  }
}

/* ==========================================
   PAGINATION
   ========================================== */
function updatePagination(totalPages) {
  const currentPageEl = document.getElementById("currentPage");
  const totalPagesEl = document.getElementById("totalPages");
  const prevBtn = document.getElementById("prevPage");
  const nextBtn = document.getElementById("nextPage");

  if (currentPageEl) currentPageEl.textContent = currentPage;
  if (totalPagesEl) totalPagesEl.textContent = totalPages;
  if (prevBtn) prevBtn.disabled = currentPage <= 1;
  if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("prevPage")?.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderProducts();
    }
  });

  document.getElementById("nextPage")?.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    if (currentPage < totalPages) {
      currentPage++;
      renderProducts();
    }
  });
});

/* ==========================================
   FILTERS & SEARCH
   ========================================== */
function initFilters() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const statusFilter = document.getElementById("statusFilter");

  function applyFilters() {
    const search = (searchInput?.value || "").toLowerCase().trim();
    const category = categoryFilter?.value || "";
    const status = statusFilter?.value || "";

    filteredProducts = allProducts.filter((p) => {
      const matchSearch =
        !search ||
        (p.name && p.name.toLowerCase().includes(search)) ||
        (p.sku && p.sku.toLowerCase().includes(search));

      const matchCategory = !category || p.category === category;
      const matchStatus = !status || p.status === status;

      return matchSearch && matchCategory && matchStatus;
    });

    currentPage = 1;
    renderProducts();
  }

  searchInput?.addEventListener("input", applyFilters);
  categoryFilter?.addEventListener("change", applyFilters);
  statusFilter?.addEventListener("change", applyFilters);
}

/* ==========================================
   BULK ACTIONS
   ========================================== */
function initBulkActions() {
  const selectAll = document.getElementById("selectAll");
  const bulkActions = document.getElementById("bulkActions");
  const selectedCount = document.getElementById("selectedCount");
  const bulkDeleteBtn = document.getElementById("bulkDeleteBtn");
  const bulkPublishBtn = document.getElementById("bulkPublishBtn");

  selectAll?.addEventListener("change", (e) => {
    const checkboxes = document.querySelectorAll(".row-checkbox");
    checkboxes.forEach((cb) => {
      cb.checked = e.target.checked;
      const id = cb.dataset.id;
      if (e.target.checked) {
        selectedProducts.add(id);
      } else {
        selectedProducts.delete(id);
      }
    });
    updateBulkUI();
  });

  bulkDeleteBtn?.addEventListener("click", async () => {
    if (selectedProducts.size === 0) return;
    if (!confirm(`Delete ${selectedProducts.size} selected products? This cannot be undone.`)) return;

    try {
      const { db } = window.firebaseApp;
      const batch = db.batch();

      selectedProducts.forEach((id) => {
        batch.delete(db.collection("products").doc(id));
      });

      await batch.commit();
      selectedProducts.clear();
      window.firebaseApp.showNotification("Products deleted successfully.", "success");
      loadProducts();
    } catch (error) {
      console.error("Bulk delete error:", error);
      window.firebaseApp.showNotification("Failed to delete products.", "error");
    }
  });

  bulkPublishBtn?.addEventListener("click", async () => {
    if (selectedProducts.size === 0) return;

    try {
      const { db } = window.firebaseApp;
      const batch = db.batch();

      selectedProducts.forEach((id) => {
        batch.update(db.collection("products").doc(id), { status: "published" });
      });

      await batch.commit();
      selectedProducts.clear();
      window.firebaseApp.showNotification("Products published successfully.", "success");
      loadProducts();
    } catch (error) {
      console.error("Bulk publish error:", error);
      window.firebaseApp.showNotification("Failed to publish products.", "error");
    }
  });
}

function handleRowCheckbox(e) {
  const id = e.target.dataset.id;
  if (e.target.checked) {
    selectedProducts.add(id);
  } else {
    selectedProducts.delete(id);
  }
  updateBulkUI();
  updateSelectAll();
}

function updateBulkUI() {
  const bulkActions = document.getElementById("bulkActions");
  const selectedCount = document.getElementById("selectedCount");

  if (selectedProducts.size > 0) {
    if (bulkActions) bulkActions.style.display = "flex";
    if (selectedCount) selectedCount.textContent = `${selectedProducts.size} item${selectedProducts.size > 1 ? "s" : ""} selected`;
  } else {
    if (bulkActions) bulkActions.style.display = "none";
  }
}

function updateSelectAll() {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(".row-checkbox");
  if (!selectAll || checkboxes.length === 0) return;

  const allChecked = [...checkboxes].every((cb) => cb.checked);
  const someChecked = [...checkboxes].some((cb) => cb.checked);
  selectAll.checked = allChecked;
  selectAll.indeterminate = someChecked && !allChecked;
}

/* ==========================================
   DELETE MODAL
   ========================================== */
function initDeleteModal() {
  const modal = document.getElementById("deleteModal");
  const cancelBtn = document.getElementById("cancelDelete");
  const confirmBtn = document.getElementById("confirmDelete");

  cancelBtn?.addEventListener("click", () => {
    modal.style.display = "none";
    productToDelete = null;
  });

  confirmBtn?.addEventListener("click", async () => {
    if (!productToDelete) return;

    try {
      const { db } = window.firebaseApp;
      await db.collection("products").doc(productToDelete).delete();
      window.firebaseApp.showNotification("Product deleted.", "success");
      modal.style.display = "none";
      productToDelete = null;
      loadProducts();
    } catch (error) {
      console.error("Delete error:", error);
      window.firebaseApp.showNotification("Failed to delete product.", "error");
    }
  });
}

function openDeleteModal(productId) {
  productToDelete = productId;
  const modal = document.getElementById("deleteModal");
  if (modal) modal.style.display = "flex";
}

/* ==========================================
   EXPORT
   ========================================== */
function initExport() {
  document.getElementById("exportBtn")?.addEventListener("click", () => {
    if (filteredProducts.length === 0) {
      window.firebaseApp.showNotification("No products to export.", "warning");
      return;
    }

    const headers = ["ID", "Name", "Category", "Price", "Stock", "Status", "SKU"];
    const rows = filteredProducts.map((p) => [
      p.id,
      p.name || "",
      p.category || "",
      p.price || 0,
      p.stock || 0,
      p.status || "",
      p.sku || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auranova-products-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  });
}

/* ==========================================
   LOGOUT
   ========================================== */
function initLogout() {
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (window.adminAuth?.logoutAdmin) {
      window.adminAuth.logoutAdmin();
    }
  });
}