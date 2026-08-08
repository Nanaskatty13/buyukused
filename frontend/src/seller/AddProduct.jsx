// frontend/src/pages/Seller/AddProduct.jsx

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import ImageSlider from '../../components/ImageSlider';

const AddProduct = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const fileInputRef = useRef(null);

  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    brand: '',
    condition: 'new', // 'new' | 'used'
    isActive: true,
  });

  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]); // Array of File objects
  const [imagePreviews, setImagePreviews] = useState([]); // URLs for preview
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // ------------------------
  // 1. FETCH CATEGORIES ON MOUNT
  // ------------------------
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategories(data);
      } catch (err) {
        setToast({
          show: true,
          message: 'Failed to load categories. Please refresh.',
          type: 'error',
        });
      } finally {
        setFetchingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // ------------------------
  // 2. HANDLE TEXT INPUT CHANGES
  // ------------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // ------------------------
  // 3. HANDLE IMAGE SELECTION (MOBILE-FRIENDLY)
  // ------------------------
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Validate total size (max 10MB per file, 5 files total)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const MAX_FILES = 5;

    const oversized = files.some((file) => file.size > MAX_FILE_SIZE);
    if (oversized) {
      setToast({
        show: true,
        message: 'Each image must be under 10MB. Please compress your photos.',
        type: 'error',
      });
      e.target.value = ''; // Reset input
      return;
    }

    if (imageFiles.length + files.length > MAX_FILES) {
      setToast({
        show: true,
        message: `You can upload a maximum of ${MAX_FILES} images.`,
        type: 'error',
      });
      e.target.value = '';
      return;
    }

    // Append new files
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    // Generate preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Reset input so user can select the same file again if needed
    e.target.value = '';
  };

  // Remove an image
  const removeImage = (index) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(imagePreviews[index]);
    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];
    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);
    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
  };

  // ------------------------
  // 4. CLIENT-SIDE VALIDATION
  // ------------------------
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required.';
    if (formData.name.trim().length < 3) newErrors.name = 'Name must be at least 3 characters.';
    if (!formData.description.trim()) newErrors.description = 'Description is required.';
    if (formData.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters.';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required.';
    if (!formData.category) newErrors.category = 'Please select a category.';
    if (!formData.stock || parseInt(formData.stock) < 0) newErrors.stock = 'Valid stock quantity is required.';
    if (imageFiles.length === 0) newErrors.images = 'At least one product image is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ------------------------
  // 5. SUBMIT HANDLER (CRITICAL FOR MOBILE)
  // ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault(); // MUST be called first to prevent mobile double-submit

    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector('.error-text');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);

    try {
      // Build FormData (NO manual Content-Type header in the service!)
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('brand', formData.brand.trim() || '');
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('isActive', formData.isActive);

      // Append each image file
      imageFiles.forEach((file) => {
        formDataToSend.append('images', file); // key matches multer's field name
      });

      // Call the API service (service must NOT set Content-Type)
      const response = await productService.createProduct(formDataToSend, token);

      setToast({
        show: true,
        message: '✅ Product posted successfully!',
        type: 'success',
      });

      // Redirect to seller dashboard after a brief delay
      setTimeout(() => {
        navigate('/seller/products');
      }, 1500);
    } catch (err) {
      console.error('Add product error:', err);
      const errorMessage =
        err.response?.data?.message || err.message || 'Failed to post product. Please try again.';
      setToast({
        show: true,
        message: errorMessage,
        type: 'error',
      });
      // If server returns field-specific errors, map them
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  // ------------------------
  // 6. RENDER
  // ------------------------
  if (fetchingCategories) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 bg-white rounded-lg shadow-sm">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 flex items-center">
        <span className="mr-2">📦</span> Post a New Product
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ---- PRODUCT NAME ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., iPhone 15 Pro Max - 256GB"
            className={`w-full ${errors.name ? 'border-red-500' : ''}`}
            maxLength={100}
          />
          {errors.name && <p className="error-text text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* ---- DESCRIPTION ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            placeholder="Describe your product in detail (condition, features, why it's great)..."
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && <p className="error-text text-red-500 text-sm mt-1">{errors.description}</p>}
          <p className="text-xs text-gray-400 mt-1">
            {formData.description.length}/2000 characters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ---- PRICE ---- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price (₦ or $) <span className="text-red-500">*</span>
            </label>
            <Input
              type="text" // Use "text" + inputMode for better mobile keyboard
              inputMode="decimal"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="0.00"
              className={`w-full ${errors.price ? 'border-red-500' : ''}`}
            />
            {errors.price && <p className="error-text text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>

          {/* ---- STOCK ---- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stock Quantity <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              inputMode="numeric"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              placeholder="10"
              className={`w-full ${errors.stock ? 'border-red-500' : ''}`}
            />
            {errors.stock && <p className="error-text text-red-500 text-sm mt-1">{errors.stock}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* ---- CATEGORY ---- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="error-text text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          {/* ---- CONDITION ---- */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="new">Brand New</option>
              <option value="used">Used / Pre-owned</option>
            </select>
          </div>
        </div>

        {/* ---- BRAND (optional) ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand (optional)</label>
          <Input
            type="text"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="e.g., Apple, Samsung, Nike"
            className="w-full"
          />
        </div>

        {/* ---- IMAGE UPLOAD (MOBILE CRITICAL) ---- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images <span className="text-red-500">*</span> (Max 5, up to 10MB each)
          </label>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition ${
              errors.images ? 'border-red-500 bg-red-50' : 'border-gray-300'
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
              capture="environment" // Hints mobile to open camera directly on some browsers
            />
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">📸</span>
              <p className="text-gray-600">Tap to select photos from your gallery or camera</p>
              <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP</p>
            </div>
          </div>

          {errors.images && <p className="error-text text-red-500 text-sm mt-1">{errors.images}</p>}

          {/* Image Previews */}
          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 mt-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition shadow-md"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ---- ACTIVE TOGGLE ---- */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
          />
          <label className="text-sm text-gray-700">List product as active (visible to buyers)</label>
        </div>

        {/* ---- SUBMIT BUTTONS ---- */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            variant="primary"
            size="large"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3 text-base"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader size="small" color="white" className="mr-2" />
                Posting...
              </span>
            ) : (
              '🚀 Post Ad'
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="large"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto px-8 py-3 text-base"
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Toast Notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
          duration={5000}
        />
      )}
    </div>
  );
};

export default AddProduct;