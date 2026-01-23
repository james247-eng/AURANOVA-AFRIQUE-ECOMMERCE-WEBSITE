/* MY ACCOUNT PAGE - FIREBASE READY */
let currentUser = null;

document.addEventListener("DOMContentLoaded", function () {
  checkAuth();
  initTabs();
  initForms();
  loadUserData();
});

/* CHECK AUTHENTICATION */
function checkAuth() {
  // TODO: Firebase auth check
  // firebase.auth().onAuthStateChanged((user) => {
  //     if (user) {
  //         currentUser = user;
  //         loadUserData();
  //     } else {
  //         window.location.href = 'login.html';
  //     }
  // });

  // Mock check for now
  const mockUser = localStorage.getItem("auranova_user");
  if (!mockUser) {
    window.location.href = "login.html";
    return;
  }
  currentUser = JSON.parse(mockUser);
}

/* TABS */
function initTabs() {
  const tabButtons = document.querySelectorAll(
    ".account-nav-item:not(.logout-btn)",
  );
  const tabs = document.querySelectorAll(".account-tab");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabName = this.dataset.tab;

      // Remove active
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabs.forEach((t) => t.classList.remove("active"));

      // Add active
      this.classList.add("active");
      document.getElementById(tabName).classList.add("active");

      // Load tab data
      loadTabData(tabName);
    });
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", logout);
}

/* LOAD USER DATA */
function loadUserData() {
  if (!currentUser) return;

  // Update UI
  document.getElementById("userName").textContent =
    currentUser.displayName || currentUser.email;
  document.getElementById("userEmail").textContent = currentUser.email;

  // Load dashboard
  loadDashboard();
}

/* LOAD DASHBOARD */
function loadDashboard() {
  // TODO: Fetch from Firebase
  // const db = firebase.firestore();
  // const ordersRef = db.collection('orders').where('userId', '==', currentUser.uid);

  // Mock data
  const mockOrders = [];
  const wishlistItems = JSON.parse(
    localStorage.getItem("auranova_wishlist") || "[]",
  );

  document.getElementById("totalOrders").textContent = mockOrders.length;
  document.getElementById("pendingOrders").textContent = mockOrders.filter(
    (o) => o.status === "pending",
  ).length;
  document.getElementById("wishlistItems").textContent = wishlistItems.length;

  displayRecentOrders(mockOrders.slice(0, 3));
}

/* DISPLAY RECENT ORDERS */
function displayRecentOrders(orders) {
  const container = document.getElementById("recentOrdersList");
  container.innerHTML = "";

  if (orders.length === 0) {
    const noData = document.createElement("p");
    noData.className = "no-data";
    noData.textContent = "No orders yet. ";
    const link = document.createElement("a");
    link.href = "shop.html";
    link.textContent = "Start Shopping";
    noData.appendChild(link);
    container.appendChild(noData);
    return;
  }

  orders.forEach((order) => {
    const card = createOrderCard(order);
    container.appendChild(card);
  });
}

/* CREATE ORDER CARD */
function createOrderCard(order) {
  const card = document.createElement("div");
  card.className = "order-card";

  const header = document.createElement("div");
  header.className = "order-header";

  const orderId = document.createElement("span");
  orderId.className = "order-id";
  orderId.textContent = `Order #${order.id}`;

  const status = document.createElement("span");
  status.className = `order-status ${order.status}`;
  status.textContent = order.status;

  header.appendChild(orderId);
  header.appendChild(status);

  const details = document.createElement("div");
  details.className = "order-details";

  const dateDiv = document.createElement("div");
  dateDiv.className = "order-detail";
  const dateLabel = document.createElement("strong");
  dateLabel.textContent = "Date:";
  const dateSpan = document.createElement("span");
  dateSpan.textContent = new Date(order.createdAt).toLocaleDateString();
  dateDiv.appendChild(dateLabel);
  dateDiv.appendChild(dateSpan);

  const totalDiv = document.createElement("div");
  totalDiv.className = "order-detail";
  const totalLabel = document.createElement("strong");
  totalLabel.textContent = "Total:";
  const totalSpan = document.createElement("span");
  totalSpan.textContent = `₦${order.total.toLocaleString()}`;
  totalDiv.appendChild(totalLabel);
  totalDiv.appendChild(totalSpan);

  const itemsDiv = document.createElement("div");
  itemsDiv.className = "order-detail";
  const itemsLabel = document.createElement("strong");
  itemsLabel.textContent = "Items:";
  const itemsSpan = document.createElement("span");
  itemsSpan.textContent = `${order.items.length} items`;
  itemsDiv.appendChild(itemsLabel);
  itemsDiv.appendChild(itemsSpan);

  details.appendChild(dateDiv);
  details.appendChild(totalDiv);
  details.appendChild(itemsDiv);

  const actions = document.createElement("div");
  actions.className = "order-actions";

  const viewBtn = document.createElement("button");
  viewBtn.className = "btn-view-order";
  viewBtn.textContent = "View Details";
  viewBtn.addEventListener("click", () => viewOrder(order.id));
  actions.appendChild(viewBtn);

  if (order.status !== "delivered") {
    const trackBtn = document.createElement("button");
    trackBtn.className = "btn-track-order";
    trackBtn.textContent = "Track Order";
    actions.appendChild(trackBtn);
  }

  card.appendChild(header);
  card.appendChild(details);
  card.appendChild(actions);

  return card;
}

/* LOAD TAB DATA */
function loadTabData(tabName) {
  switch (tabName) {
    case "dashboard":
      loadDashboard();
      break;
    case "orders":
      loadOrders();
      break;
    case "profile":
      loadProfile();
      break;
    case "addresses":
      loadAddresses();
      break;
  }
}

/* LOAD ORDERS */
function loadOrders(status = "all") {
  // TODO: Fetch from Firebase
  const container = document.getElementById("ordersTable");
  container.innerHTML = "";

  // Mock data
  const orders = [];

  if (orders.length === 0) {
    const noData = document.createElement("p");
    noData.className = "no-data";
    noData.textContent = "No orders found. ";
    const link = document.createElement("a");
    link.href = "shop.html";
    link.textContent = "Start Shopping";
    noData.appendChild(link);
    container.appendChild(noData);
    return;
  }

  orders.forEach((order) => {
    const card = createOrderCard(order);
    container.appendChild(card);
  });
}

/* LOAD PROFILE */
function loadProfile() {
  const form = document.getElementById("profileForm");

  // TODO: Fetch from Firebase
  // const db = firebase.firestore();
  // const userDoc = await db.collection('users').doc(currentUser.uid).get();

  // Mock data
  form.firstName.value = currentUser.displayName?.split(" ")[0] || "";
  form.lastName.value = currentUser.displayName?.split(" ")[1] || "";
  form.email.value = currentUser.email;
  form.phone.value = currentUser.phone || "";
}

/* LOAD ADDRESSES */
function loadAddresses() {
  const container = document.getElementById("addressesGrid");

  // TODO: Fetch from Firebase
  // const db = firebase.firestore();
  // const addresses = await db.collection('users').doc(currentUser.uid).collection('addresses').get();

  // Mock data
  const addresses = [
    {
      id: "1",
      type: "Home",
      name: "John Doe",
      address: "123 Fashion Street",
      city: "Lagos",
      state: "Lagos",
      phone: "+234 XXX XXX XXXX",
      isDefault: true,
    },
  ];

  if (addresses.length === 0) {
    const noData = document.createElement("p");
    noData.className = "no-data";
    noData.textContent = "No saved addresses";
    container.appendChild(noData);
    return;
  }

  addresses.forEach((addr) => {
    const card = document.createElement("div");
    card.className = "address-card";

    const header = document.createElement("div");
    header.className = "address-header";

    const type = document.createElement("span");
    type.className = "address-type";
    type.textContent = addr.type;
    header.appendChild(type);

    if (addr.isDefault) {
      const defaultBadge = document.createElement("span");
      defaultBadge.className = "default-badge";
      defaultBadge.textContent = "Default";
      header.appendChild(defaultBadge);
    }

    const details = document.createElement("div");
    details.className = "address-details";

    const name = document.createElement("strong");
    name.textContent = addr.name;

    const address = document.createElement("div");
    address.textContent = addr.address;

    const cityState = document.createElement("div");
    cityState.textContent = `${addr.city}, ${addr.state}`;

    const phone = document.createElement("div");
    phone.textContent = addr.phone;

    details.appendChild(name);
    details.appendChild(address);
    details.appendChild(cityState);
    details.appendChild(phone);

    const actions = document.createElement("div");
    actions.className = "address-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "btn-edit";
    editBtn.textContent = "Edit";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-delete";
    deleteBtn.textContent = "Delete";

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    card.appendChild(header);
    card.appendChild(details);
    card.appendChild(actions);

    container.appendChild(card);
  });
}

/* INIT FORMS */
function initForms() {
  // Profile Form
  const profileForm = document.getElementById("profileForm");
  profileForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const updatedData = {
      firstName: profileForm.firstName.value,
      lastName: profileForm.lastName.value,
      phone: profileForm.phone.value,
    };

    // TODO: Update Firebase
    // const db = firebase.firestore();
    // await db.collection('users').doc(currentUser.uid).update(updatedData);
    // await currentUser.updateProfile({
    //     displayName: `${updatedData.firstName} ${updatedData.lastName}`
    // });

    console.log("Profile update:", updatedData);
    window.auranovaFunctions?.showNotification(
      "Profile updated successfully!",
      "success",
    );
  });

  // Password Form
  const passwordForm = document.getElementById("passwordForm");
  passwordForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const newPassword = passwordForm.newPassword.value;
    const confirmPassword = passwordForm.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      window.auranovaFunctions?.showNotification(
        "Passwords do not match",
        "info",
      );
      return;
    }

    // TODO: Update Firebase Auth
    // const currentPassword = passwordForm.currentPassword.value;
    // const credential = firebase.auth.EmailAuthProvider.credential(
    //     currentUser.email,
    //     currentPassword
    // );
    // await currentUser.reauthenticateWithCredential(credential);
    // await currentUser.updatePassword(newPassword);

    console.log("Password change requested");
    window.auranovaFunctions?.showNotification(
      "Password changed successfully!",
      "success",
    );
    passwordForm.reset();
  });

  // Order Filters
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterButtons.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      loadOrders(this.dataset.status);
    });
  });
}

/* VIEW ORDER */
function viewOrder(orderId) {
  console.log("View order:", orderId);
  window.auranovaFunctions?.showNotification(
    "Order details coming soon!",
    "info",
  );
}

/* LOGOUT */
function logout() {
  // TODO: Firebase logout
  // firebase.auth().signOut();

  localStorage.removeItem("auranova_user");
  window.auranovaFunctions?.showNotification(
    "Logged out successfully",
    "success",
  );
  window.location.href = "login.html";
}

/* 
FIREBASE INTEGRATION:
====================
1. Fetch user orders from Firestore
2. Update user profile in Firestore
3. Manage addresses collection
4. Change password with Firebase Auth
5. Real-time order status updates
*/
