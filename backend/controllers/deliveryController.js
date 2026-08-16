
// backend/controllers/deliveryController.js

const Delivery = require("../models/Delivery");
const User = require("../models/User");
const Product = require("../models/Product");

// ============================================================
// HELPER: GET AUTHENTICATED USER ID
// ============================================================

const getUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

// ============================================================
// HELPER: CHECK USER
// ============================================================

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

// ============================================================
// CREATE DELIVERY REQUEST
// POST /api/deliveries
// ============================================================

exports.createDelivery = async (req, res) => {
  try {
    const userId = requireUser(req, res);

    if (!userId) {
      return;
    }

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

    // ----------------------------------------------------------
    // GET REQUESTER
    // ----------------------------------------------------------

    const requester = await User.findById(userId);

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

    // ----------------------------------------------------------
    // ONLY BUYERS AND SELLERS CAN REQUEST DELIVERY
    // ----------------------------------------------------------

    if (
      requester.role !== "buyer" &&
      requester.role !== "seller" &&
      requester.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Only buyers and sellers can request a rider",
      });
    }

    // ----------------------------------------------------------
    // VALIDATE LOCATIONS
    // ----------------------------------------------------------

    if (!pickupLocation || !String(pickupLocation).trim()) {
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

    // ----------------------------------------------------------
    // OPTIONAL PRODUCT
    // ----------------------------------------------------------

    let productDocument = null;

    if (product) {
      productDocument = await Product.findById(product);

      if (!productDocument) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }
    }

    // ----------------------------------------------------------
    // DETERMINE REQUESTER ROLE
    // ----------------------------------------------------------

    const requesterRole =
      requester.role === "admin"
        ? "seller"
        : requester.role;

    // ----------------------------------------------------------
    // CREATE DELIVERY
    // ----------------------------------------------------------

    const delivery = await Delivery.create({
      requester: requester._id,

      requesterRole,

      product:
        productDocument?._id || product || null,

      productTitle:
        productTitle ||
        productDocument?.title ||
        "",

      seller:
        seller ||
        (requester.role === "seller"
          ? requester._id
          : null),

      sellerName:
        sellerName ||
        (requester.role === "seller"
          ? requester.name
          : ""),

      sellerPhone:
        sellerPhone ||
        (requester.role === "seller"
          ? requester.phone
          : ""),

      buyer:
        buyer ||
        (requester.role === "buyer"
          ? requester._id
          : null),

      buyerName:
        buyerName ||
        (requester.role === "buyer"
          ? requester.name
          : ""),

      buyerPhone:
        buyerPhone ||
        (requester.role === "buyer"
          ? requester.phone
          : ""),

      pickupLocation:
        String(pickupLocation).trim(),

      pickupContactName:
        pickupContactName ||
        requester.name,

      pickupPhone:
        pickupPhone ||
        requester.phone,

      deliveryLocation:
        String(deliveryLocation).trim(),

      deliveryContactName:
        deliveryContactName ||
        requester.name,

      deliveryPhone:
        deliveryPhone ||
        requester.phone,

      notes:
        notes
          ? String(notes).trim()
          : "",

      deliveryFee:
        Number.isFinite(Number(deliveryFee))
          ? Math.max(0, Number(deliveryFee))
          : 0,

      currency: "GHS",

      status: "pending",
    });

    // ----------------------------------------------------------
    // POPULATE RESPONSE
    // ----------------------------------------------------------

    const populatedDelivery =
      await Delivery.findById(
        delivery._id
      )
        .populate(
          "requester",
          "name email phone role location"
        )
        .populate(
          "seller",
          "name email phone location"
        )
        .populate(
          "buyer",
          "name email phone location"
        )
        .populate(
          "product",
          "title price images image"
        );

    console.log(
      `🚴 Delivery request created: ${delivery._id}`
    );

    return res.status(201).json({
      success: true,
      message:
        "Delivery request created successfully",
      delivery: populatedDelivery,
    });
  } catch (error) {
    console.error(
      "❌ Create delivery error:",
      error
    );

    if (
      error.name === "ValidationError"
    ) {
      const errors = Object.values(
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

    return res.status(500).json({
      success: false,
      message:
        "Unable to create delivery request",
    });
  }
};

// ============================================================
// GET AVAILABLE DELIVERIES FOR RIDERS
// GET /api/deliveries/available
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

      // --------------------------------------------------------
      // RIDER ONLY
      // --------------------------------------------------------

      if (rider.role !== "rider") {
        return res.status(403).json({
          success: false,
          message:
            "Only riders can view available deliveries",
        });
      }

      // --------------------------------------------------------
      // APPROVAL
      // --------------------------------------------------------

      if (
        !rider.riderProfile?.isApproved
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account has not been approved yet",
        });
      }

      // --------------------------------------------------------
      // GET PENDING REQUESTS
      // --------------------------------------------------------

      const deliveries =
        await Delivery.find({
          status: "pending",
          rider: null,
        })
          .populate(
            "requester",
            "name phone role location"
          )
          .populate(
            "seller",
            "name phone location"
          )
          .populate(
            "buyer",
            "name phone location"
          )
          .populate(
            "product",
            "title price images image"
          )
          .sort({
            createdAt: -1,
          })
          .limit(50);

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
// ACCEPT DELIVERY
// POST /api/deliveries/:id/accept
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

      // --------------------------------------------------------
      // RIDER MUST BE APPROVED
      // --------------------------------------------------------

      if (
        !rider.riderProfile?.isApproved
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account has not been approved",
        });
      }

      // --------------------------------------------------------
      // RIDER MUST BE AVAILABLE
      // --------------------------------------------------------

      if (
        !rider.riderProfile?.isAvailable
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Please set your rider status to available first",
        });
      }

      // --------------------------------------------------------
      // FIND DELIVERY
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // PREVENT DOUBLE ACCEPTANCE
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // ASSIGN RIDER
      // --------------------------------------------------------

      delivery.rider = rider._id;

      delivery.riderName =
        rider.name;

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

      // --------------------------------------------------------
      // POPULATE
      // --------------------------------------------------------

      const populatedDelivery =
        await Delivery.findById(
          delivery._id
        )
          .populate(
            "requester",
            "name email phone role location"
          )
          .populate(
            "seller",
            "name phone location"
          )
          .populate(
            "buyer",
            "name phone location"
          )
          .populate(
            "rider",
            "name phone role location riderProfile"
          )
          .populate(
            "product",
            "title price images image"
          );

      console.log(
        `🚴 Rider ${rider.name} accepted delivery ${delivery._id}`
      );

      return res.json({
        success: true,
        message:
          "Delivery accepted successfully",
        delivery: populatedDelivery,
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
// PATCH /api/deliveries/:id/status
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
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid delivery status",
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

      // --------------------------------------------------------
      // ONLY ASSIGNED RIDER
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // STATUS TRANSITIONS
      // --------------------------------------------------------

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

      // --------------------------------------------------------
      // UPDATE STATUS
      // --------------------------------------------------------

      delivery.status = status;

      const now = new Date();

      if (status === "picked_up") {
        delivery.pickedUpAt = now;
      }

      if (status === "in_transit") {
        delivery.inTransitAt = now;
      }

      if (status === "delivered") {
        delivery.deliveredAt = now;
      }

      if (status === "cancelled") {
        delivery.cancelledAt = now;

        delivery.cancelledBy =
          rider._id;
      }

      await delivery.save();

      // --------------------------------------------------------
      // UPDATE RIDER STATS
      // --------------------------------------------------------

      if (
        status === "delivered"
      ) {
        rider.riderProfile.completedDeliveries =
          (rider.riderProfile
            .completedDeliveries || 0) + 1;

        await rider.save();
      }

      // --------------------------------------------------------
      // RESPONSE
      // --------------------------------------------------------

      const updatedDelivery =
        await Delivery.findById(
          delivery._id
        )
          .populate(
            "requester",
            "name email phone role location"
          )
          .populate(
            "seller",
            "name phone location"
          )
          .populate(
            "buyer",
            "name phone location"
          )
          .populate(
            "rider",
            "name phone role location riderProfile"
          )
          .populate(
            "product",
            "title price images image"
          );

      return res.json({
        success: true,
        message:
          "Delivery status updated successfully",
        delivery: updatedDelivery,
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
// GET MY REQUESTED DELIVERIES
// GET /api/deliveries/my
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
        await Delivery.find({
          requester: userId,
        })
          .populate(
            "seller",
            "name phone location"
          )
          .populate(
            "buyer",
            "name phone location"
          )
          .populate(
            "rider",
            "name phone role location riderProfile"
          )
          .populate(
            "product",
            "title price images image"
          )
          .sort({
            createdAt: -1,
          });

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
// GET RIDER DELIVERIES
// GET /api/deliveries/rider
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
        await Delivery.find({
          rider: rider._id,
        })
          .populate(
            "requester",
            "name email phone role location"
          )
          .populate(
            "seller",
            "name phone location"
          )
          .populate(
            "buyer",
            "name phone location"
          )
          .populate(
            "product",
            "title price images image"
          )
          .sort({
            createdAt: -1,
          });

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
// GET SINGLE DELIVERY
// GET /api/deliveries/:id
// ============================================================

exports.getDelivery =
  async (req, res) => {
    try {
      const userId =
        requireUser(req, res);

      if (!userId) {
        return;
      }

      const delivery =
        await Delivery.findById(
          req.params.id
        )
          .populate(
            "requester",
            "name email phone role location"
          )
          .populate(
            "seller",
            "name phone location"
          )
          .populate(
            "buyer",
            "name phone location"
          )
          .populate(
            "rider",
            "name phone role location riderProfile"
          )
          .populate(
            "product",
            "title price images image"
          );

      if (!delivery) {
        return res.status(404).json({
          success: false,
          message:
            "Delivery not found",
        });
      }

      // --------------------------------------------------------
      // ACCESS CONTROL
      // --------------------------------------------------------

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

      const user =
        await User.findById(
          userId
        );

      const isAdmin =
        user?.role === "admin";

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
// TOGGLE RIDER AVAILABILITY
// PATCH /api/deliveries/rider/availability
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

      if (
        !rider.riderProfile?.isApproved
      ) {
        return res.status(403).json({
          success: false,
          message:
            "Your rider account must be approved first",
        });
      }

      const isAvailable =
        Boolean(
          req.body?.isAvailable
        );

      rider.riderProfile.isAvailable =
        isAvailable;

      await rider.save();

      return res.json({
        success: true,
        message: isAvailable
          ? "You are now available for deliveries"
          : "You are now offline",
        isAvailable:
          rider.riderProfile.isAvailable,
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