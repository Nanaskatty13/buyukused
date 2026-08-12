import React from "react";
import { Routes, Route } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

import Navbar from "./components/Navbar";
import FloatingPhone from "./components/FloatingPhone";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";

// Seller pages
import PostAd from "./pages/PostAd";
import EditProduct from "./pages/EditProduct";

// Admin pages
import AdminDashboard from "./pages/Admin/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />

        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />

          {/* Seller */}
          <Route path="/post-ad" element={<PostAd />} />
          <Route
            path="/edit-product/:id"
            element={<EditProduct />}
          />

          {/* Admin */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>

        <FloatingPhone />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;