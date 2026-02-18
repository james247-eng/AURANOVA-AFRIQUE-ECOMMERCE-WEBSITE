/* ==========================================
   ADMIN MESSAGES MANAGEMENT
   ========================================== */

let allMessages = [];
let filteredMessages = [];
let currentFilter = 'all';
let selectedMessage = null;
let selectedMessages = new Set();

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
   PAGE LOAD
   ========================================== */
window.loadPageData = async function () {
    waitForFirebase(async function () {
        await loadMessages();
        initializeFilters();
        initializeSearch();
        initializeActions();
        updateMessagesBadge();
    });
};

/* ==========================================
   LOAD MESSAGES
   ========================================== */
async function loadMessages() {
    const { db, showNotification } = window.firebaseApp;

    try {
        const snapshot = await db.collection('contact_messages')
            .orderBy('createdAt', 'desc')
            .get();

        allMessages = [];
        snapshot.forEach(function (doc) {
            allMessages.push({ id: doc.id, ...doc.data() });
        });

        filteredMessages = [...allMessages];
        displayMessages();
        updateCounts();

    } catch (error) {
        console.error('Error loading messages:', error);
        showNotification('Failed to load messages', 'error');

        const messagesList = document.getElementById('messagesList');
        if (messagesList) {
            messagesList.innerHTML = `
                <div class="empty-state">
                    <span class="material-icons">mail_outline</span>
                    <p>No messages yet</p>
                </div>`;
        }
    }
}

/* ==========================================
   DISPLAY MESSAGES LIST
   ========================================== */
function displayMessages() {
    const { formatDateTime } = window.firebaseApp;
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;

    if (filteredMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">mail_outline</span>
                <p>No messages found</p>
            </div>`;
        return;
    }

    messagesList.innerHTML = filteredMessages.map(function (message) {
        const isUnread = !message.read;
        const isActive = selectedMessage?.id === message.id;
        const isSelected = selectedMessages.has(message.id);

        return `
            <div class="message-item ${isUnread ? 'unread' : ''} ${isActive ? 'active' : ''}"
                 data-message-id="${message.id}"
                 onclick="selectMessage('${message.id}')">
                <input
                    type="checkbox"
                    class="message-checkbox"
                    ${isSelected ? 'checked' : ''}
                    onclick="event.stopPropagation(); toggleMessageSelection('${message.id}')"
                >
                <div class="message-item-header">
                    <span class="message-sender">${message.name || 'Unknown'}</span>
                    <span class="message-date">${formatDateTime(message.createdAt)}</span>
                </div>
                <div class="message-subject">${message.subject || 'No Subject'}</div>
                <div class="message-preview">${(message.message || '').substring(0, 60)}...</div>
            </div>`;
    }).join('');
}

/* ==========================================
   SELECT MESSAGE
   ========================================== */
window.selectMessage = async function (messageId) {
    const { db } = window.firebaseApp;

    const message = allMessages.find(function (m) { return m.id === messageId; });
    if (!message) return;

    selectedMessage = message;

    if (!message.read) {
        try {
            await db.collection('contact_messages').doc(messageId).update({
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            message.read = true;
            updateCounts();
            updateMessagesBadge();
            displayMessages();
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    displayMessageDetails();
};

/* ==========================================
   DISPLAY MESSAGE DETAILS
   ========================================== */
function displayMessageDetails() {
    const { formatDateTime } = window.firebaseApp;
    const panel = document.getElementById('messageDetailsPanel');
    if (!panel || !selectedMessage) return;

    panel.innerHTML = `
        <div class="message-details-header">
            <div class="message-details-info">
                <h3>${selectedMessage.subject || 'No Subject'}</h3>
                <div class="message-details-meta">
                    <span><strong>From:</strong> ${selectedMessage.name || 'Unknown'}</span>
                    <span><strong>Email:</strong> ${selectedMessage.email || 'N/A'}</span>
                    ${selectedMessage.phone ? `<span><strong>Phone:</strong> ${selectedMessage.phone}</span>` : ''}
                    <span><strong>Date:</strong> ${formatDateTime(selectedMessage.createdAt)}</span>
                </div>
            </div>
            <div class="message-details-actions">
                <button class="btn-icon reply" onclick="replyToMessage()" title="Reply">
                    <span class="material-icons">reply</span>
                </button>
                <button class="btn-icon delete" onclick="deleteMessage('${selectedMessage.id}')" title="Delete">
                    <span class="material-icons">delete</span>
                </button>
            </div>
        </div>
        <div class="message-details-body">
            <p>${(selectedMessage.message || '').replace(/\n/g, '<br>')}</p>
        </div>`;
}

/* ==========================================
   REPLY TO MESSAGE
   ========================================== */
window.replyToMessage = function () {
    if (!selectedMessage) return;
    const subject = encodeURIComponent('Re: ' + (selectedMessage.subject || 'Your message'));
    window.location.href = 'mailto:' + selectedMessage.email + '?subject=' + subject;
};

/* ==========================================
   DELETE MESSAGE
   ========================================== */
window.deleteMessage = function (messageId) {
    const { db, showNotification } = window.firebaseApp;
    const modal = document.getElementById('deleteModal');
    if (!modal) return;

    modal.style.display = 'flex';

    document.getElementById('confirmDelete').onclick = async function () {
        modal.style.display = 'none';

        try {
            await db.collection('contact_messages').doc(messageId).delete();

            allMessages = allMessages.filter(function (m) { return m.id !== messageId; });
            filteredMessages = filteredMessages.filter(function (m) { return m.id !== messageId; });

            if (selectedMessage?.id === messageId) {
                selectedMessage = null;
                const panel = document.getElementById('messageDetailsPanel');
                if (panel) {
                    panel.innerHTML = `
                        <div class="no-message-selected">
                            <span class="material-icons">mail_outline</span>
                            <p>Select a message to view details</p>
                        </div>`;
                }
            }

            displayMessages();
            updateCounts();
            updateMessagesBadge();
            showNotification('Message deleted', 'success');

        } catch (error) {
            console.error('Error deleting message:', error);
            showNotification('Failed to delete message', 'error');
        }
    };

    document.getElementById('cancelDelete').onclick = function () {
        modal.style.display = 'none';
    };
};

/* ==========================================
   TOGGLE MESSAGE SELECTION
   ========================================== */
window.toggleMessageSelection = function (messageId) {
    if (selectedMessages.has(messageId)) {
        selectedMessages.delete(messageId);
    } else {
        selectedMessages.add(messageId);
    }
    updateDeleteButton();
    displayMessages();
};

/* ==========================================
   INITIALIZE FILTERS (tabs)
   ========================================== */
function initializeFilters() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            tabButtons.forEach(function (b) { b.classList.remove('active'); });
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            applyFilter();
        });
    });
}

/* ==========================================
   APPLY FILTER
   ========================================== */
function applyFilter() {
    if (currentFilter === 'unread') {
        filteredMessages = allMessages.filter(function (m) { return !m.read; });
    } else if (currentFilter === 'read') {
        filteredMessages = allMessages.filter(function (m) { return m.read; });
    } else {
        filteredMessages = [...allMessages];
    }
    displayMessages();
}

/* ==========================================
   INITIALIZE SEARCH
   ========================================== */
function initializeSearch() {
    const searchInput = document.getElementById('searchMessages');
    if (!searchInput) return;

    searchInput.addEventListener('input', debounce(function (e) {
        const query = e.target.value.toLowerCase().trim();

        if (!query) {
            applyFilter();
            return;
        }

        filteredMessages = allMessages.filter(function (message) {
            return (message.name || '').toLowerCase().includes(query) ||
                   (message.email || '').toLowerCase().includes(query) ||
                   (message.subject || '').toLowerCase().includes(query) ||
                   (message.message || '').toLowerCase().includes(query);
        });

        if (currentFilter === 'unread') {
            filteredMessages = filteredMessages.filter(function (m) { return !m.read; });
        } else if (currentFilter === 'read') {
            filteredMessages = filteredMessages.filter(function (m) { return m.read; });
        }

        displayMessages();
    }, 300));
}

/* ==========================================
   INITIALIZE ACTIONS
   ========================================== */
function initializeActions() {
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', markAllAsRead);
    }

    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', deleteSelectedMessages);
    }
}

/* ==========================================
   MARK ALL AS READ
   ========================================== */
async function markAllAsRead() {
    const { db, showNotification } = window.firebaseApp;

    try {
        const batch = db.batch();
        const unreadMessages = allMessages.filter(function (m) { return !m.read; });

        unreadMessages.forEach(function (message) {
            const docRef = db.collection('contact_messages').doc(message.id);
            batch.update(docRef, {
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });

        await batch.commit();

        allMessages.forEach(function (m) { m.read = true; });

        displayMessages();
        updateCounts();
        updateMessagesBadge();
        showNotification('All messages marked as read', 'success');

    } catch (error) {
        console.error('Error marking all as read:', error);
        window.firebaseApp.showNotification('Failed to mark messages as read', 'error');
    }
}

/* ==========================================
   DELETE SELECTED MESSAGES
   ========================================== */
async function deleteSelectedMessages() {
    const { db, showNotification } = window.firebaseApp;

    if (selectedMessages.size === 0) return;
    if (!confirm('Delete ' + selectedMessages.size + ' message(s)?')) return;

    try {
        const batch = db.batch();

        selectedMessages.forEach(function (messageId) {
            const docRef = db.collection('contact_messages').doc(messageId);
            batch.delete(docRef);
        });

        await batch.commit();

        allMessages = allMessages.filter(function (m) { return !selectedMessages.has(m.id); });
        filteredMessages = filteredMessages.filter(function (m) { return !selectedMessages.has(m.id); });

        selectedMessages.clear();
        updateDeleteButton();
        displayMessages();
        updateCounts();
        showNotification('Messages deleted', 'success');

    } catch (error) {
        console.error('Error deleting messages:', error);
        window.firebaseApp.showNotification('Failed to delete messages', 'error');
    }
}

/* ==========================================
   UPDATE DELETE BUTTON
   ========================================== */
function updateDeleteButton() {
    const btn = document.getElementById('deleteSelectedBtn');
    if (!btn) return;
    btn.style.display = selectedMessages.size > 0 ? 'inline-flex' : 'none';
    btn.innerHTML = `
        <span class="material-icons">delete</span>
        Delete Selected (${selectedMessages.size})`;
}

/* ==========================================
   UPDATE COUNTS
   ========================================== */
function updateCounts() {
    const unreadCount = allMessages.filter(function (m) { return !m.read; }).length;
    const readCount = allMessages.filter(function (m) { return m.read; }).length;

    const countAll = document.getElementById('countAll');
    const countUnread = document.getElementById('countUnread');
    const countRead = document.getElementById('countRead');

    if (countAll) countAll.textContent = allMessages.length;
    if (countUnread) countUnread.textContent = unreadCount;
    if (countRead) countRead.textContent = readCount;
}

/* ==========================================
   UPDATE MESSAGES BADGE
   ========================================== */
function updateMessagesBadge() {
    const badge = document.getElementById('messagesBadge');
    if (!badge) return;

    const unreadCount = allMessages.filter(function (m) { return !m.read; }).length;
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

/* ==========================================
   UTILITY: DEBOUNCE
   ========================================== */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(function () { func(...args); }, wait);
    };
}