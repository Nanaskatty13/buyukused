const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

// ── GET all products (with filtering, search, pagination) ──
router.get('/', async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            location,
            condition,
            brand,
            page = 1,
            limit = 20
        } = req.query;

        let query = { isAvailable: true };

        // Category filter
        if (category && category !== 'all') {
            query.category = category;
        }

        // Location filter
        if (location && location !== 'all') {
            query.location = location;
        }

        // Condition filter
        if (condition && condition !== 'all') {
            query.condition = condition;
        }

        // Brand filter
        if (brand && brand !== 'all') {
            query.brand = brand;
        }

        // Price range
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Text search
        if (search) {
            query.$text = { $search: search };
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const total = await Product.countDocuments(query);

        const products = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .populate('sellerId', 'name email phone');

        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── GET single product ──
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('sellerId', 'name email phone');

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Increment view count
        product.views += 1;
        await product.save();

        res.json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── CREATE product (protected) ──
router.post('/', protect, async (req, res) => {
    try {
        const {
            title,
            phone,
            category,
            location,
            description,
            price,
            images,
            videoUrl,
            brand,
            model,
            condition,
            secondCondition,
            storage,
            color,
            exchange,
            bulkPrice,
            negotiation,
            sellerName,
            deliveryOptions,
            promo
        } = req.body;

        // Validate required fields (matches model)
        const errors = [];
        if (!title || title.length < 10) errors.push('Title must be at least 10 characters');
        if (!phone) errors.push('Phone is required');
        if (!category) errors.push('Category is required');
        if (!location) errors.push('Location is required');
        if (!description) errors.push('Description is required');
        if (!price || price <= 0) errors.push('Price must be greater than 0');
        if (!images || images.length < 3) errors.push('At least 3 images are required');
        if (!brand) errors.push('Brand is required');
        if (!model) errors.push('Model is required');
        if (!storage) errors.push('Storage is required');
        if (!color) errors.push('Color is required');
        if (!sellerName) errors.push('Seller name is required');

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        // Build product object
        const productData = {
            title,
            phone,
            category,
            location,
            description,
            price,
            images,
            videoUrl: videoUrl || '',
            brand,
            model,
            condition: condition || 'Used',
            secondCondition: secondCondition || '',
            storage,
            color,
            exchange: exchange || 'No',
            bulkPrice: bulkPrice || null,
            negotiation: negotiation || 'Yes',
            sellerName,
            sellerId: req.user._id,
            sellerPhone: req.user.phone || phone,
            deliveryOptions: deliveryOptions || [false, false, false],
            promo: promo || 'none'
        };

        const product = await Product.create(productData);

        res.status(201).json({
            success: true,
            product
        });
    } catch (error) {
        // Handle duplicate key or validation errors
        if (error.name === 'ValidationError') {
            const errors = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ errors });
        }
        res.status(500).json({ error: error.message });
    }
});

// ── UPDATE product (protected, owner only) ──
router.put('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Check ownership
        if (product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to edit this product' });
        }

        // Update only allowed fields
        const allowedUpdates = [
            'title', 'phone', 'category', 'location', 'description',
            'price', 'images', 'videoUrl', 'brand', 'model',
            'condition', 'secondCondition', 'storage', 'color',
            'exchange', 'bulkPrice', 'negotiation', 'deliveryOptions',
            'promo'
        ];

        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                product[field] = req.body[field];
            }
        });

        await product.save();

        res.json({ success: true, product });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── DELETE product (protected, owner only) ──
router.delete('/:id', protect, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        if (product.sellerId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'You are not authorized to delete this product' });
        }

        // Soft delete (mark as unavailable)
        product.isAvailable = false;
        await product.save();

        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;