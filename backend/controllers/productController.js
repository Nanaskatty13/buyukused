// ==========================
// Update Product
// ==========================
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // 1. Update text fields (allow all fields from request body)
    const allowedFields = [
      'title', 'price', 'description', 'category', 'location',
      'condition', 'storage', 'color', 'status', 'sellerPhone',
      'batteryHealth', 'faceId', 'simStatus', 'negotiation', 'swapAccepted'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        // Convert boolean-like strings to actual booleans for checkboxes
        if (field === 'negotiation' || field === 'swapAccepted') {
          product[field] = req.body[field] === 'true';
        } else if (field === 'price' || field === 'batteryHealth') {
          // Ensure numeric fields are stored as numbers
          product[field] = req.body[field] === '' ? null : Number(req.body[field]);
        } else {
          product[field] = req.body[field];
        }
      }
    });

    // 2. Handle images – keep only those in imagesToKeep
    let imagesToKeep = [];
    if (req.body.imagesToKeep) {
      try {
        imagesToKeep = JSON.parse(req.body.imagesToKeep);
      } catch (e) {
        // If parsing fails, treat as empty array (keep none)
        imagesToKeep = [];
      }
    }

    // If imagesToKeep is an array, replace the product's images with it
    // (removes any images not listed)
    if (Array.isArray(imagesToKeep)) {
      product.images = imagesToKeep;
    }

    // 3. Append newly uploaded files (if any)
    //    Expect the field name to be 'files' (matches frontend)
    if (req.files && req.files.length > 0) {
      // Build absolute URLs for the uploaded files
      // Assumes you store files locally in /public/uploads
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const newImageUrls = req.files.map(file => {
        // file.path is the full path on disk; we need the URL path
        // e.g., /uploads/filename.jpg
        const relativePath = `/uploads/${file.filename}`;
        return `${baseUrl}${relativePath}`;
      });
      // Append to existing images
      product.images = [...product.images, ...newImageUrls];
    }

    // 4. Save the updated product
    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};