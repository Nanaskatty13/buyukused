import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import FloatingPhone from './components/FloatingPhone';  // ✅ ADD THIS

// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';

// Seller pages
import PostAd from './pages/PostAd';

// Admin pages
import AdminDashboard from './pages/Admin/AdminDashboard';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/post-ad" element={<PostAd />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <FloatingPhone />  {/* ✅ ADD THIS – it will appear on every page */}
      </CartProvider>
    </AuthProvider>
  );
}

export default App;