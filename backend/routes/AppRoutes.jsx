import React from 'react';
import { Routes, Route } from 'react-router-dom';

// ─── Existing pages ──────────────────────────────
import Home from '../pages/Home';
import Products from '../pages/Products';
import ProductDetails from '../pages/ProductDetails';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Profile from '../pages/Profile';
import Cart from '../pages/Cart';
import Wishlist from '../pages/Wishlist';
import Checkout from '../pages/Checkout';
import Orders from '../pages/Orders';
import PostAd from '../pages/PostAd';
import AdminDashboard from '../pages/Admin/Dashboard';
import NotFound from '../pages/NotFound';

// ─── NEW PAGES ────────────────────────────────────
// About
import About from '../pages/About';
import HowItWorks from '../pages/HowItWorks';
import Contact from '../pages/Contact';

// For Sellers
import ForSellers from '../pages/ForSellers';
import PostFreeAd from '../pages/ForSellers/PostFreeAd';
import Pricing from '../pages/ForSellers/Pricing';
import Tips from '../pages/ForSellers/Tips';

// For Buyers
import ForBuyers from '../pages/ForBuyers';
import BrowseAds from '../pages/ForBuyers/BrowseAds';
import SafetyTips from '../pages/ForBuyers/SafetyTips';
import ReportAd from '../pages/ForBuyers/ReportAd';

// Support
import Support from '../pages/Support';
import CallUs from '../pages/Support/CallUs';
import Email from '../pages/Support/Email';
import WhatsApp from '../pages/Support/WhatsApp';

// Legal
import Terms from '../pages/Legal/Terms';
import Privacy from '../pages/Legal/Privacy';
import Cookies from '../pages/Legal/Cookies';

// ─── Route guards ────────────────────────────────
import PrivateRoute from './PrivateRoute';
import AdminRoute from './AdminRoute';
import SellerRoute from './SellerRoute';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* ─── New info pages ────────────────── */}
      <Route path="/about" element={<About />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/contact" element={<Contact />} />

      <Route path="/for-sellers" element={<ForSellers />} />
      <Route path="/for-sellers/post-free-ad" element={<PostFreeAd />} />
      <Route path="/for-sellers/pricing" element={<Pricing />} />
      <Route path="/for-sellers/tips" element={<Tips />} />

      <Route path="/for-buyers" element={<ForBuyers />} />
      <Route path="/for-buyers/browse-ads" element={<BrowseAds />} />
      <Route path="/for-buyers/safety-tips" element={<SafetyTips />} />
      <Route path="/for-buyers/report-ad" element={<ReportAd />} />

      <Route path="/support" element={<Support />} />
      <Route path="/support/call-us" element={<CallUs />} />
      <Route path="/support/email" element={<Email />} />
      <Route path="/support/whatsapp" element={<WhatsApp />} />

      <Route path="/legal/terms" element={<Terms />} />
      <Route path="/legal/privacy" element={<Privacy />} />
      <Route path="/legal/cookies" element={<Cookies />} />

      {/* Protected routes */}
      <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
      <Route path="/orders" element={<PrivateRoute><Orders /></PrivateRoute>} />
      <Route path="/post-ad" element={<PrivateRoute><PostAd /></PrivateRoute>} />
      <Route path="/admin/*" element={<AdminRoute><AdminDashboard /></AdminRoute>} />

      {/* 404 fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;