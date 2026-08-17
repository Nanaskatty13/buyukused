// backend/controllers/adminRiderController.js

const User = require("../models/User");
const Delivery = require("../models/Delivery");

// ============================================================
// HELPER
// ============================================================

const requireAdmin = (req, res) => {
  if (!req.user || req.user.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access is required",
    });

    return false;
  }

  return true;
};

// ============================================================
// GET ALL RIDERS
// GET /api/admin/riders
// ============================================================

exports.getRiders = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const {
      status = "all",
      search = "",
    } = req.query;

    const query = {
      role: "rider",
    };

    // ----------------------------------------------------------
    // STATUS FILTER
    // ----------------------------------------------------------

    if (status === "pending") {
      query["riderProfile.isApproved"] = false;
    }

    if (status === "approved") {
      query["riderProfile.isApproved"] = true;
    }

    if (status === "available") {
      query["riderProfile.isApproved"] = true;
      query["riderProfile.isAvailable"] = true;
      query.isActive = true;
    }

    if (status === "offline") {
      query["riderProfile.isAvailable"] = false;
    }

    if (status === "active") {
      query.isActive = true;
    }

    if (status === "inactive") {
      query.isActive = false;
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        {
          "riderProfile.bikeNumber":
            searchRegex,
        },
        {
          "riderProfile.bikeType":
            searchRegex,
        },
        {
          "riderProfile.serviceArea":
            searchRegex,
        },
      ];
    }

    // ----------------------------------------------------------
    // FETCH RIDERS
    // ----------------------------------------------------------

    const riders = await User.find(query)
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .lean();

    // ----------------------------------------------------------
    // DELIVERY STATISTICS
    // ----------------------------------------------------------

    const riderIds = riders.map(
      (rider) => rider._id
    );

    const deliveryStats =
      await Delivery.aggregate([
        {
          $match: {
            rider: {
              $in: riderIds,
            },
          },
        },
        {
          $group: {
            _id: "$rider",

            totalDeliveries: {
              $sum: 1,
            },

            completedDeliveries: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "delivered",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            activeDeliveries: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$status",
                      [
                        "accepted",
                        "picked_up",
                        "in_transit",
                      ],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            cancelledDeliveries: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "cancelled",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            totalEarnings: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "delivered",
                    ],
                  },
                  "$deliveryFee",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const statsMap = {};

    deliveryStats.forEach((stat) => {
      statsMap[
        String(stat._id)
      ] = stat;
    });

    // ----------------------------------------------------------
    // ATTACH STATS
    // ----------------------------------------------------------

    const formattedRiders = riders.map(
      (rider) => {
        const stat =
          statsMap[
            String(rider._id)
          ] || {};

        return {
          ...rider,

          riderStats: {
            totalDeliveries:
              stat.totalDeliveries || 0,

            completedDeliveries:
              stat.completedDeliveries || 0,

            activeDeliveries:
              stat.activeDeliveries || 0,

            cancelledDeliveries:
              stat.cancelledDeliveries || 0,

            totalEarnings:
              stat.totalEarnings || 0,
          },
        };
      }
    );

    return res.json({
      success: true,
      count: formattedRiders.length,
      riders: formattedRiders,
    });
  } catch (error) {
    console.error(
      "❌ Get riders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load riders",
    });
  }
};

// ============================================================
// GET RIDER BY ID
// GET /api/admin/riders/:id
// ============================================================

exports.getRider = async (req, res) => {
  try {
    if (!requireAdmin(req, res)) return;

    const rider =
      await User.findOne({
        _id: req.params.id,
        role: "rider",
      }).select("-password");

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    const deliveries =
      await Delivery.find({
        rider: rider._id,
      })
        .populate(
          "product",
          "title price images image"
        )
        .sort({
          createdAt: -1,
        })
        .limit(100)
        .lean();

    return res.json({
      success: true,
      rider,
      deliveries,
    });
  } catch (error) {
    console.error(
      "❌ Get rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load rider",
    });
  }
};

// ============================================================
// APPROVE RIDER
// PATCH /api/admin/riders/:id/approve
// ============================================================

exports.approveRider = async (
  req,
  res
) => {
  try {
    if (!requireAdmin(req, res)) return;

    const rider =
      await User.findOne({
        _id: req.params.id,
        role: "rider",
      });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    rider.riderProfile =
      rider.riderProfile || {};

    rider.riderProfile.isApproved =
      true;

    await rider.save();

    return res.json({
      success: true,
      message:
        "Rider approved successfully",
      rider: rider.toJSON(),
    });
  } catch (error) {
    console.error(
      "❌ Approve rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to approve rider",
    });
  }
};

// ============================================================
// REJECT / UNAPPROVE RIDER
// PATCH /api/admin/riders/:id/reject
// ============================================================

exports.rejectRider = async (
  req,
  res
) => {
  try {
    if (!requireAdmin(req, res)) return;

    const rider =
      await User.findOne({
        _id: req.params.id,
        role: "rider",
      });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    rider.riderProfile =
      rider.riderProfile || {};

    rider.riderProfile.isApproved =
      false;

    // A rejected rider cannot remain
    // available.
    rider.riderProfile.isAvailable =
      false;

    await rider.save();

    return res.json({
      success: true,
      message:
        "Rider approval removed",
      rider: rider.toJSON(),
    });
  } catch (error) {
    console.error(
      "❌ Reject rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to reject rider",
    });
  }
};

// ============================================================
// ACTIVATE RIDER
// PATCH /api/admin/riders/:id/activate
// ============================================================

exports.activateRider = async (
  req,
  res
) => {
  try {
    if (!requireAdmin(req, res)) return;

    const rider =
      await User.findOne({
        _id: req.params.id,
        role: "rider",
      });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    rider.isActive = true;

    await rider.save();

    return res.json({
      success: true,
      message:
        "Rider account activated",
      rider: rider.toJSON(),
    });
  } catch (error) {
    console.error(
      "❌ Activate rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to activate rider",
    });
  }
};

// ============================================================
// DEACTIVATE RIDER
// PATCH /api/admin/riders/:id/deactivate
// ============================================================

exports.deactivateRider = async (
  req,
  res
) => {
  try {
    if (!requireAdmin(req, res)) return;

    const rider =
      await User.findOne({
        _id: req.params.id,
        role: "rider",
      });

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    rider.isActive = false;

    rider.riderProfile =
      rider.riderProfile || {};

    rider.riderProfile.isAvailable =
      false;

    await rider.save();

    return res.json({
      success: true,
      message:
        "Rider account deactivated",
      rider: rider.toJSON(),
    });
  } catch (error) {
    console.error(
      "❌ Deactivate rider error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate rider",
    });
  }
};

// ============================================================
// RIDER STATS
// GET /api/admin/riders/stats
// ============================================================

exports.getRiderStats = async (
  req,
  res
) => {
  try {
    if (!requireAdmin(req, res)) return;

    const [
      total,
      approved,
      pending,
      available,
      inactive,
    ] = await Promise.all([
      User.countDocuments({
        role: "rider",
      }),

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved":
          true,
      }),

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved":
          false,
      }),

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved":
          true,
        "riderProfile.isAvailable":
          true,
        isActive: true,
      }),

      User.countDocuments({
        role: "rider",
        isActive: false,
      }),
    ]);

    const deliveryStats =
      await Delivery.aggregate([
        {
          $match: {
            rider: {
              $ne: null,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalDeliveries: {
              $sum: 1,
            },

            completedDeliveries: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "delivered",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            activeDeliveries: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "$status",
                      [
                        "accepted",
                        "picked_up",
                        "in_transit",
                      ],
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            cancelledDeliveries: {
              $sum: {
                $cond: [
                  {
                    $eq: [
                      "$status",
                      "cancelled",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]);

    const delivery =
      deliveryStats[0] || {};

    return res.json({
      success: true,

      stats: {
        total,
        approved,
        pending,
        available,
        inactive,

        totalDeliveries:
          delivery.totalDeliveries ||
          0,

        completedDeliveries:
          delivery.completedDeliveries ||
          0,

        activeDeliveries:
          delivery.activeDeliveries ||
          0,

        cancelledDeliveries:
          delivery.cancelledDeliveries ||
          0,
      },
    });
  } catch (error) {
    console.error(
      "❌ Rider stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to load rider statistics",
    });
  }
};