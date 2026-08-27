// ============================================================
// frontend/src/App.jsx
// BuyUKUsed Application Routes
// ============================================================

import React from "react";
import { Routes, Route } from "react-router-dom";

// ============================================================
// CONTEXT
// ============================================================

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// ============================================================
// GLOBAL COMPONENTS
// ============================================================

import Navbar from "./components/Navbar";
import FloatingPhone from "./components/FloatingPhone";
import BackToTop from "./components/BackToTop";
import RobotGreeter from "./components/RobotGreeter";

// ============================================================
// VISUAL SEARCH
// ============================================================

import VisualSearch from "./components/VisualSearch";

// ============================================================
// AUTH PAGES
// ============================================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ============================================================
// PRODUCT PAGES
// ============================================================

import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import SearchResultsPage from "./pages/SearchResultsPage";

// ============================================================
// USER PAGES
// ============================================================

import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";

// ============================================================
// INFORMATION PAGES
// ============================================================

import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";

// ============================================================
// BUYER / SELLER INFORMATION
// ============================================================

import Buyers from "./pages/Buyers";
import Pricing from "./pages/Pricing";
import Tips from "./pages/Tips";
import SafetyTips from "./pages/SafetyTips";
import ReportAd from "./pages/ReportAd";

// ============================================================
// SUPPORT / LEGAL
// ============================================================

import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import InfoPage from "./pages/InfoPage";

// ============================================================
// SELLING
// ============================================================

import PostAd from "./pages/PostAd";
import EditProduct from "./pages/EditProduct";
import MyAds from "./pages/MyAds";
import Analytics from "./pages/Analytics";

// ============================================================
// RIDER
// ============================================================

import BookRider from "./pages/BookRider";
import RiderDashboard from "./pages/RiderDashboard";

// ============================================================
// ADMIN
// ============================================================

import AdminDashboard from "./pages/Admin/AdminDashboard";
import Sellers from "./admin/Sellers";

// ============================================================
// ACCOUNT / COMMUNICATION
// ============================================================

import Notifications from "./pages/Notifications";
import Messages from "./pages/Messages";

// ============================================================
// SELLER
// ============================================================

import SellerProducts from "./seller/Products";
import SellerPage from "./pages/SellerPage";

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <AuthProvider>
      <CartProvider>

        {/* ======================================================
            GLOBAL ROBOT GREETER
        ====================================================== */}

        <RobotGreeter />

        {/* ======================================================
            GLOBAL NAVBAR
        ====================================================== */}

        <Navbar />

        {/* ======================================================
            APPLICATION ROUTES
        ====================================================== */}

        <Routes>

          {/* ======================================================
              HOME
          ====================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          {/* ======================================================
              AUTHENTICATION
          ====================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* ======================================================
              PRODUCTS
          ====================================================== */}

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

          <Route
            path="/search-results"
            element={<SearchResultsPage />}
          />

          {/* ======================================================
              VISUAL SEARCH
          ====================================================== */}

          <Route
            path="/visual-search"
            element={<VisualSearch />}
          />

          {/* ======================================================
              USER
          ====================================================== */}

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/wishlist"
            element={<Wishlist />}
          />

          <Route
            path="/cart"
            element={<Cart />}
          />

          {/* ======================================================
              INFORMATION
          ====================================================== */}

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/how-it-works"
            element={<HowItWorks />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          {/* ======================================================
              SELLERS
          ====================================================== */}

          <Route
            path="/for-sellers"
            element={<Buyers />}
          />

          <Route
            path="/for-sellers/pricing"
            element={<Pricing />}
          />

          <Route
            path="/for-sellers/tips"
            element={<Tips />}
          />

          {/* ======================================================
              BUYERS
          ====================================================== */}

          <Route
            path="/for-buyers"
            element={<Buyers />}
          />

          <Route
            path="/for-buyers/safety-tips"
            element={<SafetyTips />}
          />

          <Route
            path="/for-buyers/report-ad"
            element={<ReportAd />}
          />

          {/* ======================================================
              SUPPORT
          ====================================================== */}

          <Route
            path="/support"
            element={<Support />}
          />

          {/* ======================================================
              LEGAL
          ====================================================== */}

          <Route
            path="/legal/terms"
            element={<Terms />}
          />

          <Route
            path="/legal/privacy"
            element={<Privacy />}
          />

          <Route
            path="/legal/cookies"
            element={<Cookies />}
          />

          <Route
            path="/info"
            element={<InfoPage />}
          />

          {/* ======================================================
              SELLING
          ====================================================== */}

          <Route
            path="/post-ad"
            element={<PostAd />}
          />

          <Route
            path="/edit-product/:id"
            element={<EditProduct />}
          />

          <Route
            path="/my-ads"
            element={<MyAds />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          {/* ======================================================
              RIDER
          ====================================================== */}

          <Route
            path="/book-rider"
            element={<BookRider />}
          />

          <Route
            path="/rider/dashboard"
            element={<RiderDashboard />}
          />

          {/* ======================================================
              ADMIN
          ====================================================== */}

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/sellers"
            element={<Sellers />}
          />

          {/* ======================================================
              NOTIFICATIONS
          ====================================================== */}

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* ======================================================
              MESSAGES
          ====================================================== */}

          <Route
            path="/messages"
            element={<Messages />}
          />

          <Route
            path="/chat"
            element={<Messages />}
          />

          <Route
            path="/chat/:userId"
            element={<Messages />}
          />

          <Route
            path="/chat/:userId/:productId"
            element={<Messages />}
          />

          {/* ======================================================
              SELLER PRODUCTS
          ====================================================== */}

          <Route
            path="/seller/products"
            element={<SellerProducts />}
          />

          {/* ======================================================
              PUBLIC SELLER PROFILE
          ====================================================== */}

          <Route
            path="/seller/:sellerId"
            element={<SellerPage />}
          />

          {/* ======================================================
              FALLBACK
          ====================================================== */}

          <Route
            path="*"
            element={<Home />}
          />

        </Routes>

        {/* ======================================================
            GLOBAL FLOATING COMPONENTS
        ====================================================== */}

        <FloatingPhone />

        <BackToTop />

      </CartProvider>
    </AuthProvider>
  );
}

export default App;