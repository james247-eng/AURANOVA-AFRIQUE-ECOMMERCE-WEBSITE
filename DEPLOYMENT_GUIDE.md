# AURANOVA-AFRIQUE - VERCEL DEPLOYMENT GUIDE

## Pre-Deployment Checklist

- [ ] All environment variables are set in Vercel
- [ ] Firebase project is created and configured
- [ ] Cloudinary account is set up
- [ ] Paystack account is configured (if using)
- [ ] Custom domain is pointing to Vercel
- [ ] SSL certificate is valid
- [ ] All console logs removed (DONE ✓)
- [ ] Input validation enabled (DONE ✓)
- [ ] Error handling implemented (DONE ✓)
- [ ] XSS vulnerabilities fixed (DONE ✓)

---

## 1. Firebase Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project"
3. Name it: `auranova-afrique`
4. Accept terms and create

### Step 2: Enable Authentication

1. In Firebase Console, go to Authentication
2. Click "Get started"
3. Enable these providers:
   - Email/Password
   - Google Sign-in

### Step 3: Create Firestore Database

1. Go to Firestore Database in Firebase
2. Click "Create database"
3. Start in production mode
4. Choose location (Africa/Europe for fastest access)

### Step 4: Get Firebase Config

1. Go to Project Settings (gear icon)
2. Copy the Firebase config object
3. You'll see:
   - apiKey
   - authDomain
   - projectId
   - storageBucket
   - messagingSenderId
   - appId

---

## 2. Cloudinary Setup

### Step 1: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com)
2. Sign up for free account
3. Go to Dashboard

### Step 2: Get Credentials

- Cloud Name: (shown on dashboard)
- Upload Preset: Create unsigned preset in Settings > Upload

### Step 3: Configure Upload Preset

1. Go to Settings > Upload
2. Click "Add upload preset"
3. Set name: `auranova-products`
4. Unsigned: Yes
5. Folder: `auranova-products`
6. Save

---

## 3. Vercel Deployment

### Step 1: Connect GitHub Repository

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings

### Step 2: Add Environment Variables

In Vercel Project Settings → Environment Variables, add:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_CLOUDINARY_NAME=your_cloud_name
REACT_APP_CLOUDINARY_PRESET=auranova-products
REACT_APP_CLOUDINARY_KEY=your_cloudinary_key
REACT_APP_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
REACT_APP_API_URL=https://your-domain.com
REACT_APP_ENVIRONMENT=production
```

### Step 3: Add Custom Domain

1. In Vercel → Settings → Domains
2. Add your custom domain
3. Point domain DNS to Vercel
4. Wait for SSL certificate (auto)

---

## 4. Firebase Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users collection - only own data
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth.uid != null && resource.data.role == 'admin';
    }

    // Products collection - public read, admin write
    match /products/{document=**} {
      allow read: if true;
      allow create, update, delete: if request.auth.token.role == 'admin';
    }

    // Orders collection - user can read own, admin can read all
    match /orders/{orderId} {
      allow read, write: if request.auth.uid == resource.data.userId;
      allow read: if request.auth.token.role == 'admin';
    }

    // Messages collection - admin only
    match /contact_messages/{document=**} {
      allow create: if true;
      allow read, delete: if request.auth.token.role == 'admin';
    }
  }
}
```

### Firebase Authentication Rules

1. Go to Authentication → Settings
2. Authorized domains:
   - `localhost`
   - `your-domain.com`
   - `www.your-domain.com`

---

## 5. Paystack Integration (Optional)

### Step 1: Create Paystack Account

1. Go to [Paystack](https://paystack.com)
2. Create account
3. Complete verification

### Step 2: Get Public Key

1. Go to Settings → API Keys & Webhooks
2. Copy Public Key (starts with `pk_`)
3. Add to Vercel environment variables

### Step 3: Setup Webhook

1. In Paystack Dashboard → Settings → API Keys & Webhooks
2. Add webhook URL: `https://your-domain.com/api/paystack-webhook`
3. Add events: `charge.success`, `charge.failed`

---

## 6. Post-Deployment Setup

### Step 1: Test Authentication

- [ ] Sign up new user
- [ ] Login with credentials
- [ ] Logout
- [ ] Test password reset
- [ ] Test Google sign-in

### Step 2: Test Core Features

- [ ] Add product to cart
- [ ] Add product to wishlist
- [ ] Complete checkout flow
- [ ] View order in my-account
- [ ] Submit contact form

### Step 3: Test Admin Panel

- [ ] Admin login
- [ ] View dashboard
- [ ] View orders
- [ ] View messages
- [ ] Add new product
- [ ] Edit/delete product

### Step 4: Performance Check

1. Run Lighthouse audit:
   - Performance > 80
   - Accessibility > 90
   - Best Practices > 90
   - SEO > 90

2. Check Core Web Vitals in PageSpeed Insights

---

## 7. Monitoring & Maintenance

### Setup Error Tracking

Add Sentry for error monitoring:

1. Create [Sentry](https://sentry.io) account
2. Create project
3. Get DSN
4. Add to environment variables
5. Implement Sentry SDK

### Database Backups

1. Go to Firebase → Firestore Database
2. Backups → Create Backup
3. Schedule automatic daily backups

### Monitor Logs

1. Vercel Dashboard → Logs
2. Firebase Console → Logs
3. Set up alerts for errors

---

## 8. Security Checklist

- [ ] All credentials in environment variables (NO hardcoding)
- [ ] HTTPS enforced
- [ ] CORS configured properly
- [ ] Input validation enabled
- [ ] XSS protection enabled
- [ ] CSRF tokens in forms
- [ ] Rate limiting configured
- [ ] Database backups automated
- [ ] Error tracking enabled
- [ ] 2FA enabled on admin accounts

---

## 9. Environment Variables Summary

| Variable                     | Source               | Format          |
| ---------------------------- | -------------------- | --------------- |
| FIREBASE_API_KEY             | Firebase Settings    | String          |
| FIREBASE_AUTH_DOMAIN         | Firebase Settings    | URL             |
| FIREBASE_PROJECT_ID          | Firebase Settings    | String          |
| FIREBASE_STORAGE_BUCKET      | Firebase Settings    | URL             |
| FIREBASE_MESSAGING_SENDER_ID | Firebase Settings    | Number          |
| FIREBASE_APP_ID              | Firebase Settings    | String          |
| CLOUDINARY_NAME              | Cloudinary Dashboard | String          |
| CLOUDINARY_PRESET            | Cloudinary Settings  | String          |
| CLOUDINARY_KEY               | Cloudinary Settings  | String          |
| PAYSTACK_PUBLIC_KEY          | Paystack Settings    | String (pk\_\*) |
| API_URL                      | Your domain          | HTTPS URL       |
| ENVIRONMENT                  | Set manually         | `production`    |

---

## 10. Troubleshooting

### Firebase Not Loading

- Check environment variables in Vercel
- Verify Firebase config is correct
- Check browser console for errors
- Ensure authorized domains include your URL

### Images Not Uploading

- Verify Cloudinary credentials
- Check upload preset name
- Ensure CORS is enabled in Cloudinary
- Check file size < 5MB

### Email Not Sending

- Verify Firebase Email Authentication is enabled
- Check email sender address
- Verify SMTP settings if using custom email
- Check spam folder

### Database Queries Failing

- Verify Firestore security rules
- Check collection names (case-sensitive)
- Ensure user is authenticated
- Check network tab for errors

---

## Support & Documentation

- **Firebase Docs:** https://firebase.google.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Cloudinary Docs:** https://cloudinary.com/documentation
- **Paystack Docs:** https://paystack.com/developers

---

## Deployment Notes

**Created:** January 23, 2026  
**Project:** AURANOVA-AFRIQUE  
**Status:** Production Ready  
**Hosting:** Vercel

For questions or issues during deployment, refer to the respective service documentation or contact support.
