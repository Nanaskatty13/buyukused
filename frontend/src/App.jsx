// frontend/src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import FloatingPhone from "./components/FloatingPhone";

// ============================================================
// PUBLIC / AUTH
// ============================================================

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// ============================================================
// PRODUCTS
// ============================================================

import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import SearchResultsPage from "./pages/SearchResultsPage";

// ============================================================
// INFORMATION
// ============================================================

import About from "./pages/About";
import HowItWorks from "./pages/HowItWorks";
import Contact from "./pages/Contact";
import Buyers from "./pages/Buyers";
import Pricing from "./pages/Pricing";
import Tips from "./pages/Tips";
import SafetyTips from "./pages/SafetyTips";
import ReportAd from "./pages/ReportAd";
import Support from "./pages/Support";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import InfoPage from "./pages/InfoPage";

// ============================================================
// SELLER
// ============================================================

import PostAd from "./pages/PostAd";
import EditProduct from "./pages/EditProduct";

// ============================================================
// ADMIN
// ============================================================

import AdminDashboard from "./pages/Admin/AdminDashboard";

// ============================================================
// DELIVERY / RIDER
// ============================================================

import BookRider from "./pages/BookRider";
import RiderDashboard from "./pages/RiderDashboard";

// ============================================================
// USER DASHBOARD
// ============================================================

import MyAds from "./pages/MyAds";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";

// ============================================================
// CHAT
// ============================================================
//
// IMPORTANT:
// Your Chat component is located at:
//
// src/components/chat/Chat.jsx
//
// So the import MUST point there.
// ============================================================

import Chat from "./components/chat/Chat";

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />

        <Routes>

          {/* ==================================================
              PUBLIC / AUTH
          ================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

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

          {/* ==================================================
              PRODUCTS
          ================================================== */}

          <Route
            path="/products"
            element={<Products />}
          />

          <Route
            path="/product/:id"
            element={<ProductDetails />}
          />

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

          {/* ==================================================
              SEARCH
          ================================================== */}

          <Route
            path="/search-results"
            element={<SearchResultsPage />}
          />

          {/* ==================================================
              INFORMATION
          ================================================== */}

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

          <Route
            path="/support"
            element={<Support />}
          />

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

          {/* ==================================================
              SELLER
          ================================================== */}

          <Route
            path="/post-ad"
            element={<PostAd />}
          />

          <Route
            path="/edit-product/:id"
            element={<EditProduct />}
          />

          {/* ==================================================
              DELIVERY
          ================================================== */}

          <Route
            path="/book-rider"
            element={<BookRider />}
          />

          {/* ==================================================
              RIDER DASHBOARD
          ================================================== */}

          <Route
            path="/rider/dashboard"
            element={<RiderDashboard />}
          />

          {/* ==================================================
              ADMIN
          ================================================== */}

          <Route
            path="/admin"
            element={<AdminDashboard />}
          />

          {/* ==================================================
              USER DASHBOARD
          ================================================== */}

          <Route
            path="/my-ads"
            element={<MyAds />}
          />

          <Route
            path="/analytics"
            element={<Analytics />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          {/* ==================================================
              MESSAGES / CHAT
          ==================================================
          
          Your Chat.jsx reads:

              /messages?user=USER_ID

          Therefore /messages is now the main messaging page.
          
          Examples:

              /messages
              /messages?user=64abc123
          
          ================================================== */}

          <Route
            path="/messages"
            element={<Chat />}
          />

          {/* ==================================================
              OPTIONAL CHAT ROUTES
          ==================================================
          
          These are kept for compatibility if other parts
          of your website already link to /chat.

          NOTE:
          Your current Chat.jsx uses the query parameter
          "?user=" rather than useParams(), so these routes
          will simply open the Chat component without selecting
          a user automatically.
          
          ================================================== */}

          <Route
            path="/chat"
            element={<Chat />}
          />

          <Route
            path="/chat/:userId"
            element={<Chat />}
          />

          <Route
            path="/chat/:userId/:productId"
            element={<Chat />}
          />

          {/* ==================================================
              FALLBACK
          ================================================== */}

          <Route
            path="*"
            element={<Home />}
          />

        </Routes>

        <FloatingPhone />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;