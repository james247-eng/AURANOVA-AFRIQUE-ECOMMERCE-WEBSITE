/* CONTACT PAGE - FIREBASE READY */
document.addEventListener('DOMContentLoaded', function() {
    initContactForm();
    initFAQ();
});

function initContactForm() {
    const form = document.getElementById('contactForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('.btn-primary');
        const originalText = submitBtn.textContent;
        
        // Disable button and show loading
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        const formData = {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            email: form.email.value,
            phone: form.phone.value || null,
            subject: form.subject.value,
            message: form.message.value,
            timestamp: new Date().toISOString(),
            status: 'unread'
        };
        
        try {
            // TODO: When connecting Firebase, add this:
            // const db = firebase.firestore();
            // await db.collection('contact_messages').add(formData);
            
            // For now, log to console
            console.log('Contact form data (ready for Firebase):', formData);
            
            window.auranovaFunctions?.showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            form.reset();
            
        } catch (error) {
            console.error('Error submitting form:', error);
            window.auranovaFunctions?.showNotification('Failed to send message. Please try again.', 'info');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(i => i.classList.remove('active'));
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

/* 
FIREBASE INTEGRATION NOTES:
==========================
When ready to connect Firebase:

1. Initialize Firebase in your project
2. Import Firestore
3. Replace console.log with actual Firebase call
4. Add error handling for network issues
5. Consider adding email notification via Firebase Functions
6. Store messages in 'contact_messages' collection
*/