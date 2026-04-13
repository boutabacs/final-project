# HUBROBE - Complete E-commerce Platform

HUBROBE is a modern and high-performance e-commerce solution comprising a customer store, an administrator dashboard, and a robust backend.

## 🚀 Key Features

### 🛒 Customer Store (Frontend)
- **Shopping Experience**: Fluid navigation, persistent cart, wishlist management.
- **Secure Payments**: **Stripe** integration (Credit card) and Cash on Delivery (COD).
- **Customer Account**: Order history, real-time status tracking.
- **Reviews & Ratings**: Product rating system and service reviews after order reception.
- **Marketing**: Newsletter with automatic discount code (`WELCOME20`) and coupon management.
- **Invoicing**: Instant download of professional PDF invoices.
- **Design**: Minimalist interface, responsive, and modern notifications with `react-hot-toast`.

### 📊 Admin Dashboard
- **Order Management**: Update statuses (Pending, Processing, Delivered, Cancelled).
- **Catalog Management**: Add, edit, and delete products and blog articles.
- **Marketing**: Create discount coupons and send newsletters to subscribers.
- **Analytics**: Visualize monthly income and customer statistics.

### ⚙️ Backend (API)
- **Architecture**: REST API built with Node.js, Express, and MongoDB.
- **Security**: JWT authentication, admin route protection, and Stripe webhook validation.
- **Emailing**: Brevo integration for registration and order confirmations.

## 🛠️ Technical Stack
- **Frontend**: React.js, Tailwind CSS, Stripe SDK, Lucide Icons.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Stripe API, Brevo API.
- **Tools**: jsPDF (Invoices), React Hot Toast (Notifications).

## 📦 Installation and Configuration

### 1. Backend
```bash
cd backend
npm install
```
Create a `.env` file with:
- `MONGO_URL`
- `JWT_SEC`
- `STRIPE_KEY` (Secret Key)
- `STRIPE_WEBHOOK_SECRET`
- `BREVO_API_KEY`

### 2. Store (Hubrobe)
```bash
cd hubrobe
npm install
npm run dev
```

### 3. Admin Dashboard
```bash
cd admin-dashboard
npm install
npm run dev
```

## 🌐 Deployment
- **Frontend/Admin**: Optimized for Vercel.
- **Backend**: Optimized for Render.

---
*Developed with passion for a premium e-commerce experience.*
