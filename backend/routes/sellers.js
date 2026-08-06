const express = require("express");
const router = express.Router();


const {
    registerSeller,
    getSellerProfile,
    updateSellerProfile,
    getSellerDashboard,
    getMyProducts,
    getSellerOrders,
    getSellerEarnings

} = require("../controllers/sellerController");


const { protect } = require("../middleware/auth");
const seller = require("../middleware/seller");



// ==========================
// Seller Account
// ==========================

// Become a seller
router.post(
    "/register",
    protect,
    registerSeller
);


// Get seller profile
router.get(
    "/profile",
    protect,
    seller,
    getSellerProfile
);


// Update seller profile
router.put(
    "/profile",
    protect,
    seller,
    updateSellerProfile
);



// ==========================
// Seller Dashboard
// ==========================

router.get(
    "/dashboard",
    protect,
    seller,
    getSellerDashboard
);



// ==========================
// Seller Products
// ==========================

router.get(
    "/products",
    protect,
    seller,
    getMyProducts
);



// ==========================
// Seller Orders
// ==========================

router.get(
    "/orders",
    protect,
    seller,
    getSellerOrders
);



// ==========================
// Seller Earnings
// ==========================

router.get(
    "/earnings",
    protect,
    seller,
    getSellerEarnings
);



module.exports = router;