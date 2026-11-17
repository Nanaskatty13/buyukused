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
// GLOBAL STYLES – prevents navbar overlap + liquid iOS27
// ============================================================

const globalStyles = document.createElement("style");
globalStyles.textContent = `
  /* Reserve space for sticky navbar (desktop) */
  .app-content {
    padding-top: 72px;
  }

  /* Tablet */
  @media (max-width: 1024px) {
    .app-content {
      padding-top: 68px;
    }
  }

  /* Mobile */
  @media (max-width: 767px) {
    .app-content {
      padding-top: 64px;
    }
  }

  /* Small mobile */
  @media (max-width: 480px) {
    .app-content {
      padding-top: 56px;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     LIQUID iOS27 — GLOBAL BACKGROUND
     ═══════════════════════════════════════════════════════════ */
  html,
  body,
  #root {
    min-height: 100vh;
  }

  body {
    background-color: #eef4ff;
    background-image:
      radial-gradient(
        circle at 8% 15%,
        rgba(0, 102, 204, 0.20) 0%,
        rgba(0, 102, 204, 0.06) 25%,
        transparent 55%
      ),
      radial-gradient(
        circle at 92% 60%,
        rgba(139, 92, 246, 0.16) 0%,
        rgba(139, 92, 246, 0.05) 25%,
        transparent 55%
      ),
      radial-gradient(
        circle at 50% 115%,
        rgba(6, 182, 212, 0.16) 0%,
        rgba(6, 182, 212, 0.05) 25%,
        transparent 55%
      ),
      linear-gradient(
        135deg,
        #eef4ff 0%,
        #f5f0ff 40%,
        #eaf7ff 70%,
        #f2f8ff 100%
      );
    background-attachment: fixed;
    background-repeat: no-repeat;
    background-size: cover;
  }

  /* ═══════════════════════════════════════════════════════════
     LIQUID iOS27 — GLOBAL BUTTON BASE
     Every <button> inherits this liquid glass look.
     Component-level class selectors (.btn-primary, .wa-send-btn,
     .liquid-pd-btn-wa, etc.) beat this element selector, so all
     existing per-page button styling stays intact.
     ═══════════════════════════════════════════════════════════ */
  button {
    font-family: inherit;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 8px 18px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.6);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.68) 0%,
      rgba(255, 255, 255, 0.32) 100%
    );
    backdrop-filter: blur(14px) saturate(180%);
    -webkit-backdrop-filter: blur(14px) saturate(180%);
    color: #1f2937;
    font-weight: 600;
    font-size: 14px;
    line-height: 1.2;
    cursor: pointer;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.9),
      inset 0 -1px 0 rgba(255, 255, 255, 0.15),
      0 2px 10px rgba(31, 38, 135, 0.08);
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      background 0.15s ease,
      border-color 0.15s ease;
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  button:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.95);
    background: linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.82) 0%,
      rgba(239, 246, 255, 0.5) 100%
    );
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 1),
      inset 0 -1px 0 rgba(255, 255, 255, 0.25),
      0 6px 20px rgba(31, 38, 135, 0.14);
    transform: translateY(-1px);
  }

  button:active:not(:disabled) {
    transform: translateY(0) scale(0.98);
  }

  button:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.7);
  }

  button:focus-visible {
    outline: none;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 1),
      0 0 0 3px rgba(0, 102, 204, 0.30),
      0 4px 14px rgba(31, 38, 135, 0.12);
  }

  /* ═══════════════════════════════════════════════════════════
     LIQUID iOS27 — REDUCED MOTION
     ═══════════════════════════════════════════════════════════ */
  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
    button:hover:not(:disabled) {
      transform: none;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     LIQUID iOS27 — MOBILE LIGHTER BLUR
     ═══════════════════════════════════════════════════════════ */
  @media (max-width: 480px) {
    body {
      background-attachment: scroll;
    }
    button {
      backdrop-filter: blur(8px) saturate(180%);
      -webkit-backdrop-filter: blur(8px) saturate(180%);
    }
  }
`;
document.head.appendChild(globalStyles);

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
            CONTENT WRAPPER – prevents navbar overlap
        ====================================================== */}

        <main className="app-content">

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

        </main>

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