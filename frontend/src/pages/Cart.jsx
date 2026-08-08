// frontend/src/pages/Cart.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/api';   // ✅ correct path

const Cart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch recommended products (example)
  useEffect(() => {
    const fetchRecommended = async () => {
      setLoading(true);
      try {
        const data = await getProducts({ limit: 4 });
        setRecommended(data.products || []);
      } catch (error) {
        console.error('Failed to load recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Empty cart
  if (cartItems.length === 0) {
    return (
      <div style={{ padding: '40px 20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
        <h2>🛒 Your Cart</h2>
        <p style={{ color: '#6b7280', margin: '20px 0' }}>Your cart is empty.</p>
        <button
          onClick={() => (window.location.href = '/products')}
          style={{
            padding: '10px 24px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h2>🛒 Shopping Cart</h2>
      <div style={{ marginTop: '20px' }}>
        {cartItems.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '12px 0',
              borderBottom: '1px solid #e5e7eb',
            }}
          >
            <img
              src={item.image || '/placeholder.png'}
              alt={item.title}
              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }}
            />
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px' }}>{item.title}</h4>
              <p style={{ margin: 0, color: '#6b7280' }}>GH₵ {item.price}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                >
                  −
                </button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  style={{ padding: '4px 10px', border: '1px solid #d1d5db', borderRadius: '4px', background: 'white', cursor: 'pointer' }}
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}
                >
                  Remove
                </button>
              </div>
            </div>
            <div style={{ fontWeight: 600 }}>GH₵ {(item.price * item.quantity).toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* Order summary */}
      <div style={{ marginTop: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Subtotal</span>
          <span>GH₵ {subtotal.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span>Tax (10%)</span>
          <span>GH₵ {tax.toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '18px', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
          <span>Total</span>
          <span>GH₵ {total.toFixed(2)}</span>
        </div>
        <button
          onClick={() => alert('Proceed to checkout')}
          style={{
            width: '100%',
            padding: '12px',
            marginTop: '16px',
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          Proceed to Checkout
        </button>
        <button
          onClick={clearCart}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '8px',
            background: 'transparent',
            color: '#dc2626',
            border: '1px solid #dc2626',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Clear Cart
        </button>
      </div>

      {/* Recommended products */}
      {recommended.length > 0 && (
        <div style={{ marginTop: '40px' }}>
          <h3>You might also like</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
            {recommended.map((p) => (
              <div key={p._id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <img src={p.image || '/placeholder.png'} alt={p.title} style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '4px' }} />
                <h5 style={{ margin: '8px 0 4px' }}>{p.title}</h5>
                <p style={{ fontWeight: 600 }}>GH₵ {p.price}</p>
                <button
                  onClick={() => alert('Add to cart')}
                  style={{ padding: '6px 12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;