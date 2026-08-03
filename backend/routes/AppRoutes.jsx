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

// Admin Pages
import AdminDashboard from "../admin/Dashboard";
import AdminProducts from "../admin/Products";
import AdminUsers from "../admin/Users";
import AdminOrders from "../admin/Orders";
import AdminSellers from "../admin/Sellers";
import AdminReports from "../admin/Reports";
import AdminSettings from "../admin/Settings";
import Categories from "../admin/Categories";

// Seller Pages
import SellerDashboard from "../seller/Dashboard";
import SellerProducts from "../seller/Products";
import AddProduct from "../seller/AddProduct";
import EditProduct from "../seller/EditProduct";
import SellerOrders from "../seller/Orders";
import Analytics from "../seller/Analytics";
import Customers from "../seller/Customers";
import SellerSettings from "../seller/Settings";

// Route Protection
import PrivateRoute from "./PrivateRoute";
import AdminRoute from "./AdminRoute";
import SellerRoute from "./SellerRoute";


function AppRoutes() {
  return (
    <Routes>

      {/* Public Website */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetails />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/post-free-ad" element={<PostFreeAd />} />
      </Route>


      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>


      {/* User Dashboard */}
      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
        </Route>
      </Route>


      {/* Admin Dashboard */}
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


      {/* Seller Dashboard */}
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
          <div style={{padding: "50px"}}>
            <h1>404 - Page Not Found</h1>
          </div>
        }
      />

    </Routes>
  );
}

export default AppRoutes;