import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts, createProduct, deleteProduct } from '../api'; // adjust import path
import { getToken } from '../utils/storage'; // to check token if needed

const Publishing = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        // If unauthorized, redirect to login
        if (err.message.includes('401') || err.message.includes('403')) {
          // clear auth (already done in handleResponse) and navigate
          navigate('/login', { replace: true });
        } else {
          setError('Failed to load products. Please try again.');
        }
      } finally {
        setLoading(false); // ✅ CRITICAL: always set loading false
      }
    };

    // Optional: check if token exists, if not redirect immediately
    const token = getToken();
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    fetchProducts();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createProduct(newProduct);
      // Add the new product to the list (optimistic update)
      setProducts((prev) => [created, ...prev]);
      setNewProduct({ name: '', price: '', description: '', category: '' });
      setError(null);
    } catch (err) {
      console.error('Error creating product:', err);
      if (err.message.includes('401') || err.message.includes('403')) {
        navigate('/login', { replace: true });
      } else {
        setError('Failed to create product. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      if (err.message.includes('401') || err.message.includes('403')) {
        navigate('/login', { replace: true });
      } else {
        setError('Failed to delete product.');
      }
    }
  };

  // ---- Render ----
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-12 h-12 border-4 border-blue-500 rounded-full" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-4 text-gray-600">Loading your products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Published Products</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
          <button
            onClick={() => setError(null)}
            className="float-right font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Create Product Form */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
        <form onSubmit={handleCreateProduct}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={newProduct.name}
              onChange={handleInputChange}
              required
              className="border rounded px-3 py-2"
            />
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={newProduct.price}
              onChange={handleInputChange}
              required
              className="border rounded px-3 py-2"
            />
            <input
              type="text"
              name="category"
              placeholder="Category"
              value={newProduct.category}
              onChange={handleInputChange}
              className="border rounded px-3 py-2"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={newProduct.description}
              onChange={handleInputChange}
              rows="2"
              className="border rounded px-3 py-2 col-span-2"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          <p>You haven't published any products yet.</p>
          <p className="text-sm">Use the form above to create your first product.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white shadow-md rounded-lg p-4 flex flex-col">
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{product.category}</p>
              <p className="text-xl font-bold text-blue-600 mt-2">${product.price}</p>
              <p className="text-gray-700 text-sm mt-2 flex-grow">
                {product.description?.slice(0, 100)}
                {product.description?.length > 100 && '...'}
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View
                </button>
                <button
                  onClick={() => handleDeleteProduct(product._id)}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Publishing;