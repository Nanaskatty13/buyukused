// ============================================================
// backend/controllers/deliveryController.js
// ============================================================

const mongoose = require("mongoose");

const Delivery = require("../models/Delivery");
const User = require("../models/User");
const Product = require("../models/Product");

// ============================================================
// HELPERS
// ============================================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

// ------------------------------------------------------------
// Require authenticated user
// ------------------------------------------------------------

const requireUser = (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return null;
  }

  return userId;
};

// ------------------------------------------------------------
// Validate MongoDB ObjectId
// ------------------------------------------------------------

const isValidObjectId = (value) => {
  return (
    value &&
    mongoose.Types.ObjectId.isValid(String(value))
  );
};

// ------------------------------------------------------------
// Populate delivery
// ------------------------------------------------------------

const populateDelivery = (query) => {
  return query
    .populate(
      "requester",
      "name email phone role location avatar photoURL"
    )
    .populate(
      "seller",
      "name email phone location avatar photoURL"
    )
    .populate(
      "buyer",
      "name email phone location avatar photoURL"
    )
    .populate(
      "rider",
      "name email phone role location avatar photoURL riderProfile"
    )
    .populate(
      "product",
      "title price images image category location"
    );
};

// ============================================================
// CREATE DELIVERY
// POST /api/deliveries
// ============================================================

exports.createDelivery = async (req, res) => {
  const startedAt = Date.now();

  try {
    console.log("==================================================");
    console.log("🚴 CREATE DELIVERY REQUEST");
    console.log("==================================================");

    console.log("➡️ Method:", req.method);
    console.log("➡️ URL:", req.originalUrl);
    console.log("➡️ User:", req.user?._id || req.user?.id);
    console.log("➡️ Body:", JSON.stringify(req.body, null, 2));

    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const userId = requireUser(req, res);

    if (!userId) {
      return;
    }

    console.log("✅ Authenticated user:", userId);

    // --------------------------------------------------------
    // LOAD USER
    // --------------------------------------------------------

    const requester = await User.findById(userId);

    console.log(
      "👤 Requester lookup completed:",
      Boolean(requester)
    );

    if (!requester) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (requester.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated",
      });
    }

    // --------------------------------------------------------
    // ROLE CHECK
    // --------------------------------------------------------

    if (
      !["buyer", "seller", "admin"].includes(
        requester.role
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only buyers and sellers can request a rider",
      });
    }

    // --------------------------------------------------------
    // READ BODY
    // --------------------------------------------------------

    const {
      product,
      productTitle,
      seller,
      sellerName,
      sellerPhone,
      buyer,
      buyerName,
      buyerPhone,
      pickupLocation,
      pickupContactName,
      pickupPhone,
      deliveryLocation,
      deliveryContactName,
      deliveryPhone,
      notes,
      deliveryFee,
    } = req.body || {};

    // --------------------------------------------------------
    // REQUIRED LOCATIONS
    // --------------------------------------------------------

    if (
      !pickupLocation ||
      !String(pickupLocation).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Pickup location is required",
      });
    }

    if (
      !deliveryLocation ||
      !String(deliveryLocation).trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivery location is required",
      });
    }

    // --------------------------------------------------------
    // PRODUCT
    // --------------------------------------------------------

    let productDocument = null;

    if (product) {
      console.log("📦 Product ID received:", product);

      if (!isValidObjectId(product)) {
        return res.status(400).json({
          success: false,
          message: "Invalid product ID",
        });
      }

      productDocument = await Product.findById(product);

      console.log(
        "📦 Product lookup completed:",
        Boolean(productDocument)
      );

      if (!productDocument) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    // --------------------------------------------------------
    // SELLER
    // --------------------------------------------------------

    let sellerId = null;

    if (seller) {
      if (!isValidObjectId(seller)) {
        return res.status(400).json({
          success: false,
          message: "Invalid seller ID",
        });
      }

      sellerId = seller;
    } else if (requester.role === "seller") {
      sellerId = requester._id;
    }

    // --------------------------------------------------------
    // BUYER
    // --------------------------------------------------------

    let buyerId = null;

    if (buyer) {
      if (!isValidObjectId(buyer)) {
        return res.status(400).json({
          success: false,
          message: "Invalid buyer ID",
        });
      }

      buyerId = buyer;
    } else if (requester.role === "buyer") {
      buyerId = requester._id;
    }

    // --------------------------------------------------------
    // REQUESTER ROLE
    // --------------------------------------------------------

    const requesterRole =
      requester.role === "admin"
        ? "seller"
        : requester.role;

    // --------------------------------------------------------
    // DELIVERY FEE
    // --------------------------------------------------------

    let parsedDeliveryFee = 0;

    if (
      deliveryFee !== undefined &&
      deliveryFee !== null &&
      deliveryFee !== ""
    ) {
      parsedDeliveryFee = Number(deliveryFee);

      if (!Number.isFinite(parsedDeliveryFee)) {
        return res.status(400).json({
          success: false,
          message: "Invalid delivery fee",
        });
      }

      parsedDeliveryFee = Math.max(
        0,
        parsedDeliveryFee
      );
    }

    // --------------------------------------------------------
    // PREPARE DELIVERY
    // --------------------------------------------------------

    const deliveryData = {
      requester: requester._id,

      requesterRole,

      product:
        productDocument?._id || null,

      productTitle:
        productTitle ||
        productDocument?.title ||
        "",

      seller: sellerId,

      sellerName:
        sellerName ||
        (requester.role === "seller"
          ? requester.name
          : ""),

      sellerPhone:
        sellerPhone ||
        (requester.role === "seller"
          ? requester.phone || ""
          : ""),

      buyer: buyerId,

      buyerName:
        buyerName ||
        (requester.role === "buyer"
          ? requester.name
          : ""),

      buyerPhone:
        buyerPhone ||
        (requester.role === "buyer"
          ? requester.phone || ""
          : ""),

      pickupLocation:
        String(pickupLocation).trim(),

      pickupContactName:
        pickupContactName ||
        requester.name ||
        "",

      pickupPhone:
        pickupPhone ||
        requester.phone ||
        "",

      deliveryLocation:
        String(deliveryLocation).trim(),

      deliveryContactName:
        deliveryContactName ||
        requester.name ||
        "",

      deliveryPhone:
        deliveryPhone ||
        requester.phone ||
        "",

      notes: notes
        ? String(notes).trim()
        : "",

      deliveryFee: parsedDeliveryFee,

      currency: "GHS",

      status: "pending",

      rider: null,

      riderName: "",

      riderPhone: "",

      riderBikeType: "",

      riderBikeNumber: "",

      riderLocation: {
        latitude: null,
        longitude: null,
        address: "",
        updatedAt: null,
      },
    };

    console.log(
      "📝 Delivery data prepared:",
      JSON.stringify(
        deliveryData,
        null,
        2
      )
    );

    // --------------------------------------------------------
    // CREATE DELIVERY
    // --------------------------------------------------------

    console.log("💾 Creating delivery in MongoDB...");

    const delivery =
      await Delivery.create(
        deliveryData
      );

    console.log(
      "✅ Delivery created:",
      delivery._id
    );

    // --------------------------------------------------------
    // POPULATE
    // --------------------------------------------------------

    console.log(
      "🔄 Populating delivery..."
    );

    const populatedDelivery =
      await populateDelivery(
        Delivery.findById(
          delivery._id
        )
      );

    console.log(
      "✅ Delivery populated"
    );

    console.log(
      `⏱️ Delivery creation completed in ${
        Date.now() - startedAt
      }ms`
    );

    console.log("==================================================");

    return res.status(201).json({
      success: true,
      message:
        "Delivery request created successfully",
      delivery: populatedDelivery,
    });
  } catch (error) {
    console.error(
      "=================================================="
    );

    console.error(
      "❌ CREATE DELIVERY ERROR"
    );

    console.error(
      "Name:",
      error?.name
    );

    console.error(
      "Message:",
      error?.message
    );

    console.error(
      "Code:",
      error?.code
    );

    console.error(
      "Stack:",
      error?.stack
    );

    console.error(
      "=================================================="
    );

    if (
      error?.name ===
      "ValidationError"
    ) {
      const errors =
        Object.values(
          error.errors || {}
        ).map(
          (item) => item.message
        );

      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors,
      });
    }

    if (
      error?.name ===
      "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid delivery data",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create delivery request",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

// ============================================================
// GET CUSTOMER DELIVERIES
// GET /api/deliveries/customer
// ============================================================

exports.getCustomerDeliveries =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const deliveries =
        await populateDelivery(
          Delivery.find({
            $or: [
              {
                requester: userId,
              },
              {
                buyer: userId,
              },
              {
                seller: userId,
              },
            ],
          }).sort({
            createdAt: -1,
          })
        );

      return res.json({
        success: true,
        count: deliveries.length,
        deliveries,
      });
    } catch (error) {
      console.error(
        "❌ Get customer deliveries error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load customer deliveries",
      });
    }
  };

// ============================================================
// GET CUSTOMER REQUESTED DELIVERIES
// ============================================================

exports.getMyDeliveries =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const deliveries =
        await populateDelivery(
          Delivery.find({
            requester: userId,
          }).sort({
            createdAt: -1,
          })
        );

      return res.json({
        success: true,
        count: deliveries.length,
        deliveries,
      });
    } catch (error) {
      console.error(
        "❌ Get my deliveries error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load your deliveries",
      });
    }
  };

// ============================================================
// GET AVAILABLE DELIVERIES
// ============================================================

exports.getAvailableDeliveries =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const rider =
        await User.findById(userId);

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      if (rider.role !== "rider") {
        return res.status(403).json({
          success: false,
          message:
            "Only riders can view available deliveries",
        });
      }

      if (rider.isActive === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account has been deactivated",
        });
      }

      if (
        !rider.riderProfile?.isApproved
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account has not been approved yet",
        });
      }

      if (
        !rider.riderProfile?.isAvailable
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Set your rider status to available to view delivery requests",
        });
      }

      const deliveries =
        await populateDelivery(
          Delivery.find({
            status: "pending",
            rider: null,
          })
            .sort({
              createdAt: -1,
            })
            .limit(50)
        );

      return res.json({
        success: true,
        count: deliveries.length,
        deliveries,
      });
    } catch (error) {
      console.error(
        "❌ Get available deliveries error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load available deliveries",
      });
    }
  };

// ============================================================
// GET RIDER DELIVERIES
// ============================================================

exports.getRiderDeliveries =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const rider =
        await User.findById(userId);

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      if (rider.role !== "rider") {
        return res.status(403).json({
          success: false,
          message:
            "Only riders can access rider deliveries",
        });
      }

      const deliveries =
        await populateDelivery(
          Delivery.find({
            rider: rider._id,
          }).sort({
            createdAt: -1,
          })
        );

      return res.json({
        success: true,
        count: deliveries.length,
        deliveries,
      });
    } catch (error) {
      console.error(
        "❌ Get rider deliveries error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load rider deliveries",
      });
    }
  };

// ============================================================
// ACCEPT DELIVERY
// ============================================================

exports.acceptDelivery =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const rider =
        await User.findById(userId);

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      if (rider.role !== "rider") {
        return res.status(403).json({
          success: false,
          message:
            "Only riders can accept deliveries",
        });
      }

      if (rider.isActive === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account is inactive",
        });
      }

      if (
        !rider.riderProfile?.isApproved
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account has not been approved",
        });
      }

      if (
        !rider.riderProfile?.isAvailable
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Please set your rider status to available first",
        });
      }

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery ID",
        });
      }

      const delivery =
        await Delivery.findById(
          req.params.id
        );

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery request not found",
        });
      }

      if (
        delivery.status !== "pending" ||
        delivery.rider
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This delivery has already been accepted or is no longer available",
        });
      }

      delivery.rider =
        rider._id;

      delivery.riderName =
        rider.name || "";

      delivery.riderPhone =
        rider.phone || "";

      delivery.riderBikeType =
        rider.riderProfile?.bikeType ||
        "";

      delivery.riderBikeNumber =
        rider.riderProfile?.bikeNumber ||
        "";

      delivery.status =
        "accepted";

      delivery.acceptedAt =
        new Date();

      await delivery.save();

      const populatedDelivery =
        await populateDelivery(
          Delivery.findById(
            delivery._id
          )
        );

      return res.json({
        success: true,
        message:
          "Delivery accepted successfully",
        delivery:
          populatedDelivery,
      });
    } catch (error) {
      console.error(
        "❌ Accept delivery error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to accept delivery",
      });
    }
  };

// ============================================================
// UPDATE DELIVERY STATUS
// ============================================================

exports.updateDeliveryStatus =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const rider =
        await User.findById(userId);

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      if (rider.role !== "rider") {
        return res.status(403).json({
          success: false,
          message:
            "Only riders can update delivery status",
        });
      }

      const {
        status,
      } = req.body || {};

      const allowedStatuses = [
        "accepted",
        "picked_up",
        "in_transit",
        "delivered",
        "cancelled",
      ];

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery status",
        });
      }

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery ID",
        });
      }

      const delivery =
        await Delivery.findById(
          req.params.id
        );

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery not found",
        });
      }

      if (
        !delivery.rider ||
        delivery.rider.toString() !==
          userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this delivery",
        });
      }

      const currentStatus =
        delivery.status;

      const validTransitions = {
        accepted: [
          "picked_up",
          "cancelled",
        ],

        picked_up: [
          "in_transit",
          "cancelled",
        ],

        in_transit: [
          "delivered",
          "cancelled",
        ],

        delivered: [],

        cancelled: [],

        pending: [],
      };

      if (
        !validTransitions[
          currentStatus
        ]?.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Cannot change delivery from "${currentStatus}" to "${status}"`,
        });
      }

      const now =
        new Date();

      delivery.status =
        status;

      if (
        status === "picked_up"
      ) {
        delivery.pickedUpAt =
          now;
      }

      if (
        status === "in_transit"
      ) {
        delivery.inTransitAt =
          now;
      }

      if (
        status === "delivered"
      ) {
        delivery.deliveredAt =
          now;
      }

      if (
        status === "cancelled"
      ) {
        delivery.cancelledAt =
          now;

        delivery.cancelledBy =
          rider._id;

        if (req.body?.reason) {
          delivery.cancellationReason =
            String(
              req.body.reason
            ).trim();
        }
      }

      await delivery.save();

      if (
        status === "delivered"
      ) {
        if (
          !rider.riderProfile
        ) {
          rider.riderProfile = {};
        }

        rider.riderProfile.completedDeliveries =
          Number(
            rider.riderProfile
              .completedDeliveries || 0
          ) + 1;

        await rider.save();
      }

      const updatedDelivery =
        await populateDelivery(
          Delivery.findById(
            delivery._id
          )
        );

      return res.json({
        success: true,
        message:
          "Delivery status updated successfully",
        delivery:
          updatedDelivery,
      });
    } catch (error) {
      console.error(
        "❌ Update delivery status error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update delivery status",
      });
    }
  };

// ============================================================
// UPDATE RIDER LOCATION
// ============================================================

exports.updateRiderLocation =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const rider =
        await User.findById(userId);

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      if (rider.role !== "rider") {
        return res.status(403).json({
          success: false,
          message:
            "Only riders can update location",
        });
      }

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery ID",
        });
      }

      const delivery =
        await Delivery.findById(
          req.params.id
        );

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery not found",
        });
      }

      if (
        !delivery.rider ||
        delivery.rider.toString() !==
          userId.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You are not assigned to this delivery",
        });
      }

      const {
        latitude,
        longitude,
        location,
      } = req.body || {};

      if (
        latitude === undefined ||
        longitude === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Latitude and longitude are required",
        });
      }

      const lat =
        Number(latitude);

      const lng =
        Number(longitude);

      if (
        !Number.isFinite(lat) ||
        !Number.isFinite(lng)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid latitude or longitude",
        });
      }

      if (
        lat < -90 ||
        lat > 90
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid latitude",
        });
      }

      if (
        lng < -180 ||
        lng > 180
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid longitude",
        });
      }

      delivery.riderLocation = {
        latitude: lat,
        longitude: lng,
        address: location
          ? String(location).trim()
          : "",
        updatedAt:
          new Date(),
      };

      await delivery.save();

      return res.json({
        success: true,
        message:
          "Rider location updated successfully",
        location:
          delivery.riderLocation,
      });
    } catch (error) {
      console.error(
        "❌ Update rider location error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update rider location",
      });
    }
  };

// ============================================================
// TOGGLE RIDER AVAILABILITY
// ============================================================

exports.toggleRiderAvailability =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const rider =
        await User.findById(userId);

      if (!rider) {
        return res.status(404).json({
          success: false,
          message: "Rider not found",
        });
      }

      if (rider.role !== "rider") {
        return res.status(403).json({
          success: false,
          message:
            "Only riders can change availability",
        });
      }

      if (rider.isActive === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account is inactive",
        });
      }

      if (
        !rider.riderProfile?.isApproved
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account must be approved first",
        });
      }

      const requestedAvailability =
        req.body?.isAvailable;

      if (
        typeof requestedAvailability !==
        "boolean"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "isAvailable must be true or false",
        });
      }

      if (!rider.riderProfile) {
        rider.riderProfile = {};
      }

      rider.riderProfile.isAvailable =
        requestedAvailability;

      await rider.save();

      return res.json({
        success: true,
        message:
          requestedAvailability
            ? "You are now available for deliveries"
            : "You are now offline",

        isAvailable:
          rider.riderProfile
            .isAvailable,
      });
    } catch (error) {
      console.error(
        "❌ Toggle rider availability error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update rider availability",
      });
    }
  };

// ============================================================
// ALIAS
// ============================================================

exports.updateRiderAvailability =
  exports.toggleRiderAvailability;

// ============================================================
// GET SINGLE DELIVERY
// ============================================================

exports.getDelivery =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery ID",
        });
      }

      const delivery =
        await populateDelivery(
          Delivery.findById(
            req.params.id
          )
        );

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery not found",
        });
      }

      const currentUserId =
        userId.toString();

      const isRequester =
        delivery.requester?._id?.toString() ===
        currentUserId;

      const isRider =
        delivery.rider?._id?.toString() ===
        currentUserId;

      const isSeller =
        delivery.seller?._id?.toString() ===
        currentUserId;

      const isBuyer =
        delivery.buyer?._id?.toString() ===
        currentUserId;

      const currentUser =
        await User.findById(
          userId
        ).select("role");

      const isAdmin =
        currentUser?.role ===
        "admin";

      if (
        !isRequester &&
        !isRider &&
        !isSeller &&
        !isBuyer &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have access to this delivery",
        });
      }

      return res.json({
        success: true,
        delivery,
      });
    } catch (error) {
      console.error(
        "❌ Get delivery error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load delivery",
      });
    }
  };

// ============================================================
// CANCEL DELIVERY
// ============================================================

exports.cancelDelivery =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      if (
        !isValidObjectId(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery ID",
        });
      }

      const delivery =
        await Delivery.findById(
          req.params.id
        );

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery not found",
        });
      }

      const currentUser =
        await User.findById(
          userId
        );

      if (!currentUser) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const currentUserId =
        userId.toString();

      const isRequester =
        delivery.requester &&
        delivery.requester.toString() ===
          currentUserId;

      const isBuyer =
        delivery.buyer &&
        delivery.buyer.toString() ===
          currentUserId;

      const isSeller =
        delivery.seller &&
        delivery.seller.toString() ===
          currentUserId;

      const isRider =
        delivery.rider &&
        delivery.rider.toString() ===
          currentUserId;

      const isAdmin =
        currentUser.role ===
        "admin";

      if (
        !isRequester &&
        !isBuyer &&
        !isSeller &&
        !isRider &&
        !isAdmin
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to cancel this delivery",
        });
      }

      const cancellableStatuses = [
        "pending",
        "accepted",
        "picked_up",
        "in_transit",
      ];

      if (
        !cancellableStatuses.includes(
          delivery.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Delivery cannot be cancelled when status is "${delivery.status}"`,
        });
      }

      delivery.status =
        "cancelled";

      delivery.cancelledAt =
        new Date();

      delivery.cancelledBy =
        userId;

      if (req.body?.reason) {
        delivery.cancellationReason =
          String(
            req.body.reason
          ).trim();
      }

      await delivery.save();

      const updatedDelivery =
        await populateDelivery(
          Delivery.findById(
            delivery._id
          )
        );

      return res.json({
        success: true,
        message:
          "Delivery cancelled successfully",
        delivery:
          updatedDelivery,
      });
    } catch (error) {
      console.error(
        "❌ Cancel delivery error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to cancel delivery",
      });
    }
  };