// frontend/src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import FloatingPhone from "./components/FloatingPhone";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import SearchResultsPage from "./pages/SearchResultsPage";
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
import PostAd from "./pages/PostAd";
import EditProduct from "./pages/EditProduct";
import BookRider from "./pages/BookRider";
import RiderDashboard from "./pages/RiderDashboard";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import MyAds from "./pages/MyAds";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";
import Messages from "./pages/Messages";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />

          <Route path="/search-results" element={<SearchResultsPage />} />

          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/for-sellers" element={<Buyers />} />
          <Route path="/for-sellers/pricing" element={<Pricing />} />
          <Route path="/for-sellers/tips" element={<Tips />} />
          <Route path="/for-buyers" element={<Buyers />} />
          <Route path="/for-buyers/safety-tips" element={<SafetyTips />} />
          <Route path="/for-buyers/report-ad" element={<ReportAd />} />
          <Route path="/support" element={<Support />} />
          <Route path="/legal/terms" element={<Terms />} />
          <Route path="/legal/privacy" element={<Privacy />} />
          <Route path="/legal/cookies" element={<Cookies />} />
          <Route path="/info" element={<InfoPage />} />

          <Route path="/post-ad" element={<PostAd />} />
          <Route path="/edit-product/:id" element={<EditProduct />} />

          <Route path="/book-rider" element={<BookRider />} />
          <Route path="/rider/dashboard" element={<RiderDashboard />} />

          <Route path="/admin" element={<AdminDashboard />} />

          <Route path="/my-ads" element={<MyAds />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/notifications" element={<Notifications />} />

          <Route path="/messages" element={<Messages />} />
          <Route path="/chat" element={<Messages />} />
          <Route path="/chat/:userId" element={<Messages />} />
          <Route path="/chat/:userId/:productId" element={<Messages />} />

          <Route path="*" element={<Home />} />
        </Routes>

        <FloatingPhone />
        <VercelAnalytics />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;