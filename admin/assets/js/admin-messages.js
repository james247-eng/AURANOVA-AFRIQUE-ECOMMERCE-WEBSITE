/* ==========================================
   ADMIN MESSAGES MANAGEMENT
   ========================================== */

const { db, showNotification, formatDateTime } = window.firebaseApp;

let allMessages = [];
let filteredMessages = [];
let currentFilter = 'all';
let selectedMessage = null;
let selectedMessages = new Set();

/* ==========================================
   PAGE LOAD
   ========================================== */
window.loadPageData = async function() {
    await loadMessages();
    initializeFilters();
    initializeSearch();
    initializeActions();
    updateMessagesBadge();
};

/* ==========================================
   LOAD MESSAGES
   ========================================== */
async function loadMessages() {
    try {
        const snapshot = await db.collection('contact_messages')
            .orderBy('createdAt', 'desc')
            .get();
        
        allMessages = [];
        snapshot.forEach(doc => {
            allMessages.push({ id: doc.id, ...doc.data() });
        });
        
        filteredMessages = [...allMessages];
        
        displayMessages();
        updateCounts();
        
    } catch (error) {
        console.error('Error loading messages:', error);
        showNotification('Failed to load messages', 'error');
        
        // Show empty state
        const messagesList = document.getElementById('messagesList');
        messagesList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">mail_outline</span>
                <p>No messages yet</p>
            </div>
        `;
    }
}

/* ==========================================
   DISPLAY MESSAGES LIST
   ========================================== */
function displayMessages() {
    const messagesList = document.getElementById('messagesList');
    
    if (filteredMessages.length === 0) {
        messagesList.innerHTML = `
            <div class="empty-state">
                <span class="material-icons">mail_outline</span>
                <p>No messages found</p>
            </div>
        `;
        return;
    }
    
    messagesList.innerHTML = filteredMessages.map(message => {
        const isUnread = !message.read;
        const isSelected = selectedMessages.has(message.id);
        
        return `
            <div class="message-item ${isUnread ? 'unread' : ''} ${selectedMessage?.id === message.id ? 'active' : ''}" 
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
                <div class="message-preview">${message.message?.substring(0, 60) || ''}...</div>
            </div>
        `;
    }).join('');
}

/* ==========================================
   SELECT MESSAGE
   ========================================== */
window.selectMessage = async function(messageId) {
    const message = allMessages.find(m => m.id === messageId);
    if (!message) return;
    
    selectedMessage = message;
    
    // Mark as read if unread
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
    if (!selectedMessage) return;
    
    const panel = document.getElementById('messageDetailsPanel');
    
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
        </div>
    `;
}

/* ==========================================
   REPLY TO MESSAGE
   ========================================== */
window.replyToMessage = function() {
    if (!selectedMessage) return;
    
    const email = selectedMessage.email;
    const subject = `Re: ${selectedMessage.subject || 'Your message'}`;
    
    // Open email client
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
};

/* ==========================================
   DELETE MESSAGE
   ========================================== */
window.deleteMessage = function(messageId) {
    const modal = document.getElementById('deleteModal');
    modal.style.display = 'flex';
    
    document.getElementById('confirmDelete').onclick = async () => {
        modal.style.display = 'none';
        
        try {
            await db.collection('contact_messages').doc(messageId).delete();
            
            allMessages = allMessages.filter(m => m.id !== messageId);
            filteredMessages = filteredMessages.filter(m => m.id !== messageId);
            
            if (selectedMessage?.id === messageId) {
                selectedMessage = null;
                document.getElementById('messageDetailsPanel').innerHTML = `
                    <div class="no-message-selected">
                        <span class="material-icons">mail_outline</span>
                        <p>Select a message to view details</p>
                    </div>
                `;
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
    
    document.getElementById('cancelDelete').onclick = () => {
        modal.style.display = 'none';
    };
};

/* ==========================================
   TOGGLE MESSAGE SELECTION
   ========================================== */
window.toggleMessageSelection = function(messageId) {
    if (selectedMessages.has(messageId)) {
        selectedMessages.delete(messageId);
    } else {
        selectedMessages.add(messageId);
    }
    
    updateDeleteButton();
    displayMessages();
};

/* ==========================================
   INITIALIZE FILTERS
   ========================================== */
function initializeFilters() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.dataset.filter;
            
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            currentFilter = filter;
            applyFilter();
        });
    });
}

/* ==========================================
   APPLY FILTER
   ========================================== */
function applyFilter() {
    switch(currentFilter) {
        case 'unread':
            filteredMessages = allMessages.filter(m => !m.read);
            break;
        case 'read':
            filteredMessages = allMessages.filter(m => m.read);
            break;
        default:
            filteredMessages = [...allMessages];
    }
    
    displayMessages();
}

/* ==========================================
   INITIALIZE SEARCH
   ========================================== */
function initializeSearch() {
    const searchInput = document.getElementById('searchMessages');
    
    searchInput.addEventListener('input', debounce(function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (!query) {
            applyFilter();
            return;
        }
        
        filteredMessages = allMessages.filter(message => {
            return (
                (message.name || '').toLowerCase().includes(query) ||
                (message.email || '').toLowerCase().includes(query) ||
                (message.subject || '').toLowerCase().includes(query) ||
                (message.message || '').toLowerCase().includes(query)
            );
        });
        
        // Apply current filter on top of search
        if (currentFilter === 'unread') {
            filteredMessages = filteredMessages.filter(m => !m.read);
        } else if (currentFilter === 'read') {
            filteredMessages = filteredMessages.filter(m => m.read);
        }
        
        displayMessages();
    }, 300));
}

/* ==========================================
   INITIALIZE ACTIONS
   ========================================== */
function initializeActions() {
    // Mark all read
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    markAllReadBtn.addEventListener('click', markAllAsRead);
    
    // Delete selected
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    deleteSelectedBtn.addEventListener('click', deleteSelectedMessages);
}

/* ==========================================
   MARK ALL AS READ
   ========================================== */
async function markAllAsRead() {
    try {
        const batch = db.batch();
        const unreadMessages = allMessages.filter(m => !m.read);
        
        unreadMessages.forEach(message => {
            const docRef = db.collection('contact_messages').doc(message.id);
            batch.update(docRef, { 
                read: true,
                readAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        });
        
        await batch.commit();
        
        allMessages.forEach(m => m.read = true);
        
        displayMessages();
        updateCounts();
        updateMessagesBadge();
        
        showNotification('All messages marked as read', 'success');
        
    } catch (error) {
        console.error('Error marking all as read:', error);
        showNotification('Failed to mark messages as read', 'error');
    }
}

/* ==========================================
   DELETE SELECTED MESSAGES
   ========================================== */
async function deleteSelectedMessages() {
    if (selectedMessages.size === 0) return;
    
    if (!confirm(`Delete ${selectedMessages.size} message(s)?`)) return;
    
    try {
        const batch = db.batch();
        
        selectedMessages.forEach(messageId => {
            const docRef = db.collection('contact_messages').doc(messageId);
            batch.delete(docRef);
        });
        
        await batch.commit();
        
        allMessages = allMessages.filter(m => !selectedMessages.has(m.id));
        filteredMessages = filteredMessages.filter(m => !selectedMessages.has(m.id));
        
        selectedMessages.clear();
        updateDeleteButton();
        
        displayMessages();
        updateCounts();
        
        showNotification('Messages deleted', 'success');
        
    } catch (error) {
        console.error('Error deleting messages:', error);
        showNotification('Failed to delete messages', 'error');
    }
}

/* ==========================================
   UPDATE DELETE BUTTON
   ========================================== */
function updateDeleteButton() {
    const btn = document.getElementById('deleteSelectedBtn');
    btn.style.display = selectedMessages.size > 0 ? 'inline-flex' : 'none';
    btn.innerHTML = `
        <span class="material-icons">delete</span>
        Delete Selected (${selectedMessages.size})
    `;
}

/* ==========================================
   UPDATE COUNTS
   ========================================== */
function updateCounts() {
    const unreadCount = allMessages.filter(m => !m.read).length;
    const readCount = allMessages.filter(m => m.read).length;
    
    document.getElementById('countAll').textContent = allMessages.length;
    document.getElementById('countUnread').textContent = unreadCount;
    document.getElementById('countRead').textContent = readCount;
}

/* ==========================================
   UPDATE MESSAGES BADGE
   ========================================== */
function updateMessagesBadge() {
    const badge = document.getElementById('messagesBadge');
    if (!badge) return;
    
    const unreadCount = allMessages.filter(m => !m.read).length;
    
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

/* ==========================================
   UTILITY
   ========================================== */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}