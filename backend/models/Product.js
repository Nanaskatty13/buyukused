const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // ── Basic Info (Step 1) ──
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        minlength: [10, 'Title must be at least 10 characters'],
        maxlength: [70, 'Title cannot exceed 70 characters']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['Cars', 'Phones', 'Real Estate', 'Jobs', 'Electronics', 'Fashion', 'Home', 'Other']
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        trim: true,
        maxlength: [350, 'Description cannot exceed 350 characters']
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [1, 'Price must be greater than 0']
    },
    images: {
        type: [String],   // array of image URLs
        validate: [arrayMinLength(3), 'At least 3 images are required']
    },
    videoUrl: {
        type: String,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be|facebook\.com).*/.test(v);
            },
            message: 'Please enter a valid YouTube or Facebook video URL'
        }
    },

    // ── Detailed Info (Step 2) ──
    brand: {
        type: String,
        required: [true, 'Brand is required'],
        trim: true
    },
    model: {
        type: String,
        required: [true, 'Model is required'],
        trim: true
    },
    condition: {
        type: String,
        required: [true, 'Condition is required'],
        enum: ['New', 'Used', 'Refurbished'],
        default: 'Used'
    },
    secondCondition: {
        type: String,
        enum: ['', 'Excellent', 'Very Good', 'Good', 'Fair'],
        default: ''
    },
    storage: {
        type: String,
        required: [true, 'Storage is required'],
        enum: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB']
    },
    color: {
        type: String,
        required: [true, 'Color is required'],
        trim: true
    },
    exchange: {
        type: String,
        enum: ['Yes', 'No'],
        default: 'No'
    },
    bulkPrice: {
        type: Number,
        min: [0, 'Bulk price cannot be negative'],
        default: null
    },
    negotiation: {
        type: String,
        enum: ['Yes', 'No', 'Not sure'],
        default: 'Yes'
    },

    // ── Seller & Delivery ──
    sellerName: {
        type: String,
        required: [true, 'Seller name is required'],
        trim: true
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sellerPhone: {
        type: String,
        trim: true
    },
    deliveryOptions: {
        type: [Boolean],
        default: [false, false, false]
    },

    // ── Promotion ──
    promo: {
        type: String,
        enum: ['none', 'top', 'boost'],
        default: 'none'
    },
    promoExpiry: {
        type: Date,
        default: null
    },

    // ── Stats ──
    views: {
        type: Number,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        default: true
    }

}, {
    timestamps: true
});

// Helper for array min length validation
function arrayMinLength(min) {
    return function(val) {
        return val && val.length >= min;
    };
}

// Index for search
productSchema.index({ title: 'text', description: 'text', brand: 'text', model: 'text' });

// Pre‑save hook to set promoExpiry based on promo type
productSchema.pre('save', function(next) {
    if (this.isModified('promo')) {
        if (this.promo === 'top') {
            // TOP promo: 30 days from now
            this.promoExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else if (this.promo === 'boost') {
            // Boost Premium: 28 days
            this.promoExpiry = new Date(Date.now() + 28 * 24 * 60 * 60 * 1000);
        } else {
            this.promoExpiry = null;
        }
    }
    next();
});

module.exports = mongoose.model('Product', productSchema);