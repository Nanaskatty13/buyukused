// frontend/src/routes/AppRoutes.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";

// Layouts
import MainLayout from "../layouts/MainLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import AuthLayout from "../layouts/AuthLayout";

// Public Pages
import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import Profile from "../pages/Profile";
import PostFreeAd from "../pages/PostFreeAd";

// Informational Pages
import About from "../pages/About";
import HowItWorks from "../pages/HowItWorks";
import Contact from "../pages/Contact";
import ForSellers from "../pages/ForSellers";
import ForSellersPostFreeAd from "../pages/PostFreeAd";
import Pricing from "../pages/Pricing";
import Tips from "../pages/Tips";
import ForBuyers from "../pages/ForBuyers";
import BrowseAds from "../pages/BrowseAds";
import SafetyTips from "../pages/SafetyTips";
import ReportAd from "../pages/ReportAd";
import Support from "../pages/Support";
import CallUs from "../pages/CallUs";
import Email from "../pages/Email";
import WhatsApp from "../pages/WhatsApp";
import Terms from "../pages/Terms";
import Privacy from "../pages/Privacy";
import Cookies from "../pages/Cookies";

// ✨ New pages – Seller Profile & Feedback
import SellerPage from "../pages/SellerPage";
import Feedback from "../pages/Feedback";

// Admin Pages
import AdminDashboard from "../admin/Dashboard";
import AdminProducts from "../admin/Products";
import AdminUsers from "../admin/Users";
import AdminOrders from "../admin/Orders";
import AdminSellers from "../admin/Sellers";
import AdminReports from "../admin/Reports";
import AdminSettings from "../admin/Settings";
import Categories from "../admin/Categories";

// Seller Dashboard Pages
import SellerDashboard from "../seller/Dashboard";
import SellerProducts from "../seller/Products";
import AddProduct from "../seller/AddProduct";
import EditProduct from "../seller/EditProduct";
import SellerOrders from "../seller/Orders";
import Analytics from "../seller/Analytics";
import Customers from "../seller/Customers";
import SellerSettings from "../seller/Settings";

// Protection
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import SellerRoute from "./SellerRoute";

function AppRoutes() {
  return (
    <Routes>
      {/* PUBLIC WEBSITE – with MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post-free-ad" element={<PostFreeAd />} />

        {/* ─── INFO ROUTES ─── */}
        <Route path="/about" element={<About />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<Contact />} />

        <Route path="/for-sellers" element={<ForSellers />} />
        <Route path="/for-sellers/post-free-ad" element={<ForSellersPostFreeAd />} />
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

        {/* ─── SELLER PROFILE & FEEDBACK ─── */}
        <Route path="/seller/:sellerId" element={<SellerPage />} />
        <Route path="/feedback/:sellerId" element={<Feedback />} />
      </Route>

      {/* AUTH */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* USER DASHBOARD */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />} />
      </Route>

      {/* ADMIN DASHBOARD */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="sellers" element={<AdminSellers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="categories" element={<Categories />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* SELLER DASHBOARD */}
      <Route element={<SellerRoute />}>
        <Route path="/seller" element={<DashboardLayout />}>
          <Route index element={<SellerDashboard />} />
          <Route path="products" element={<SellerProducts />} />
          <Route path="add-product" element={<AddProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="orders" element={<SellerOrders />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<SellerSettings />} />
        </Route>
      </Route>

      {/* 404 */}
      <Route
        path="*"
        element={
          <div style={{ padding: "50px" }}>
            <h1>404 - Page Not Found</h1>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;