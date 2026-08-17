// backend/controllers/userController.js

const User = require("../models/User");

// ============================================================
// GET ALL USERS
// Admin only
// ============================================================

const getAllUsers = async (req, res) => {
  try {
    const {
      role,
      search,
      isActive,
      page = 1,
      limit = 50,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 50, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const filter = {};

    // ----------------------------------------------------------
    // ROLE FILTER
    // ----------------------------------------------------------

    if (
      role &&
      ["buyer", "seller", "rider", "admin"].includes(
        String(role).toLowerCase()
      )
    ) {
      filter.role = String(role).toLowerCase();
    }

    // ----------------------------------------------------------
    // ACTIVE STATUS FILTER
    // ----------------------------------------------------------

    if (isActive !== undefined) {
      if (isActive === "true") {
        filter.isActive = true;
      }

      if (isActive === "false") {
        filter.isActive = false;
      }
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search && String(search).trim()) {
      const searchTerm = String(search).trim();

      filter.$or = [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          location: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];
    }

    // ----------------------------------------------------------
    // FETCH USERS
    // ----------------------------------------------------------

    const [users, total] =
      await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        User.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,
      users,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Get all users error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

// ============================================================
// GET USER BY ID
// ============================================================

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(id)
      .select("-password")
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(
      "❌ Get user by ID error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to fetch user",
    });
  }
};

// ============================================================
// UPDATE USER
// ============================================================

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const {
      name,
      email,
      phone,
      location,
      avatar,
      photoURL,
      role,
      isActive,
      riderProfile,
    } = req.body || {};

    // ----------------------------------------------------------
    // BASIC FIELDS
    // ----------------------------------------------------------

    if (name !== undefined) {
      const cleanName = String(name).trim();

      if (cleanName.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "Name must be at least 2 characters",
        });
      }

      user.name = cleanName;
    }

    if (email !== undefined) {
      const cleanEmail = String(email)
        .trim()
        .toLowerCase();

      const existingUser =
        await User.findOne({
          email: cleanEmail,
          _id: {
            $ne: user._id,
          },
        });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message:
            "Email is already being used",
        });
      }

      user.email = cleanEmail;
    }

    if (phone !== undefined) {
      user.phone = String(phone).trim();
    }

    if (location !== undefined) {
      user.location =
        String(location).trim();
    }

    if (avatar !== undefined) {
      user.avatar =
        String(avatar).trim();
    }

    if (photoURL !== undefined) {
      user.photoURL =
        String(photoURL).trim();
    }

    // ----------------------------------------------------------
    // ROLE
    // ----------------------------------------------------------

    if (role !== undefined) {
      const newRole = String(role)
        .trim()
        .toLowerCase();

      const allowedRoles = [
        "buyer",
        "seller",
        "rider",
        "admin",
      ];

      if (!allowedRoles.includes(newRole)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user role",
        });
      }

      user.role = newRole;
    }

    // ----------------------------------------------------------
    // ACCOUNT STATUS
    // ----------------------------------------------------------

    if (isActive !== undefined) {
      user.isActive =
        Boolean(isActive);
    }

    // ----------------------------------------------------------
    // RIDER PROFILE
    // ----------------------------------------------------------

    if (
      riderProfile &&
      typeof riderProfile === "object"
    ) {
      if (
        riderProfile.isAvailable !==
        undefined
      ) {
        user.riderProfile.isAvailable =
          Boolean(
            riderProfile.isAvailable
          );
      }

      if (
        riderProfile.isApproved !==
        undefined
      ) {
        user.riderProfile.isApproved =
          Boolean(
            riderProfile.isApproved
          );
      }

      if (
        riderProfile.bikeType !==
        undefined
      ) {
        user.riderProfile.bikeType =
          String(
            riderProfile.bikeType
          ).trim();
      }

      if (
        riderProfile.bikeNumber !==
        undefined
      ) {
        user.riderProfile.bikeNumber =
          String(
            riderProfile.bikeNumber
          ).trim();
      }

      if (
        riderProfile.serviceArea !==
        undefined
      ) {
        user.riderProfile.serviceArea =
          String(
            riderProfile.serviceArea
          ).trim();
      }

      if (
        riderProfile.identificationNumber !==
        undefined
      ) {
        user.riderProfile.identificationNumber =
          String(
            riderProfile.identificationNumber
          ).trim();
      }

      if (
        riderProfile.rating !==
        undefined
      ) {
        const rating = Number(
          riderProfile.rating
        );

        if (
          Number.isNaN(rating) ||
          rating < 0 ||
          rating > 5
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Rider rating must be between 0 and 5",
          });
        }

        user.riderProfile.rating =
          rating;
      }

      if (
        riderProfile.completedDeliveries !==
        undefined
      ) {
        const completed =
          Number(
            riderProfile.completedDeliveries
          );

        if (
          Number.isNaN(completed) ||
          completed < 0
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Completed deliveries cannot be negative",
          });
        }

        user.riderProfile.completedDeliveries =
          completed;
      }
    }

    await user.save();

    const safeUser =
      user.toObject();

    delete safeUser.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: safeUser,
    });
  } catch (error) {
    console.error(
      "❌ Update user error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Email is already being used",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update user",
    });
  }
};

// ============================================================
// DELETE USER
// ============================================================

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Prevent an admin from deleting themselves
    if (
      req.user &&
      String(req.user._id) === String(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "You cannot delete your own admin account",
      });
    }

    const user =
      await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await User.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
      userId: id,
    });
  } catch (error) {
    console.error(
      "❌ Delete user error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete user",
    });
  }
};

// ============================================================
// GET USER STATISTICS
// ============================================================

const getUserStats = async (
  req,
  res
) => {
  try {
    const [
      totalUsers,
      buyers,
      sellers,
      riders,
      admins,
      activeUsers,
      inactiveUsers,
      approvedRiders,
      availableRiders,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "buyer",
      }),

      User.countDocuments({
        role: "seller",
      }),

      User.countDocuments({
        role: "rider",
      }),

      User.countDocuments({
        role: "admin",
      }),

      User.countDocuments({
        isActive: true,
      }),

      User.countDocuments({
        isActive: false,
      }),

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved":
          true,
      }),

      User.countDocuments({
        role: "rider",
        "riderProfile.isApproved":
          true,
        "riderProfile.isAvailable":
          true,
        isActive: true,
      }),
    ]);

    return res.status(200).json({
      success: true,

      stats: {
        totalUsers,
        buyers,
        sellers,
        riders,
        admins,
        activeUsers,
        inactiveUsers,
        approvedRiders,
        availableRiders,
      },
    });
  } catch (error) {
    console.error(
      "❌ Get user stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch user statistics",
    });
  }
};

// ============================================================
// GET RIDERS
// ============================================================

const getRiders = async (
  req,
  res
) => {
  try {
    const {
      search,
      approved,
      available,
      page = 1,
      limit = 50,
    } = req.query;

    const pageNumber = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 50, 1),
      100
    );

    const skip =
      (pageNumber - 1) * limitNumber;

    const filter = {
      role: "rider",
    };

    // ----------------------------------------------------------
    // APPROVAL FILTER
    // ----------------------------------------------------------

    if (approved !== undefined) {
      if (approved === "true") {
        filter[
          "riderProfile.isApproved"
        ] = true;
      }

      if (approved === "false") {
        filter[
          "riderProfile.isApproved"
        ] = false;
      }
    }

    // ----------------------------------------------------------
    // AVAILABILITY FILTER
    // ----------------------------------------------------------

    if (available !== undefined) {
      if (available === "true") {
        filter[
          "riderProfile.isAvailable"
        ] = true;
      }

      if (available === "false") {
        filter[
          "riderProfile.isAvailable"
        ] = false;
      }
    }

    // ----------------------------------------------------------
    // SEARCH
    // ----------------------------------------------------------

    if (search && String(search).trim()) {
      const searchTerm = String(search).trim();

      filter.$or = [
        {
          name: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          "riderProfile.bikeType": {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          "riderProfile.bikeNumber": {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          "riderProfile.serviceArea": {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ];
    }

    const [riders, total] =
      await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        User.countDocuments(filter),
      ]);

    return res.status(200).json({
      success: true,
      riders,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(
          total / limitNumber
        ),
      },
    });
  } catch (error) {
    console.error(
      "❌ Get riders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch riders",
    });
  }
};

// ============================================================
// APPROVE RIDER
// ============================================================

const approveRider = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const rider =
      await User.findById(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (rider.role !== "rider") {
      return res.status(400).json({
        success: false,
        message:
          "This user is not a rider",
      });
    }

    rider.riderProfile.isApproved =
      true;

    // Newly approved riders start unavailable
    // until they explicitly go online.
    rider.riderProfile.isAvailable =
      false;

    await rider.save();

    const safeRider =
      rider.toObject();

    delete safeRider.password;

    return res.status(200).json({
      success: true,
      message:
        "Rider approved successfully",
      rider: safeRider,
    });
  } catch (error) {
    console.error(
      "❌ Approve rider error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to approve rider",
    });
  }
};

// ============================================================
// REJECT / UNAPPROVE RIDER
// ============================================================

const rejectRider = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const rider =
      await User.findById(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (rider.role !== "rider") {
      return res.status(400).json({
        success: false,
        message:
          "This user is not a rider",
      });
    }

    rider.riderProfile.isApproved =
      false;

    // An unapproved rider must never remain
    // available for new deliveries.
    rider.riderProfile.isAvailable =
      false;

    await rider.save();

    const safeRider =
      rider.toObject();

    delete safeRider.password;

    return res.status(200).json({
      success: true,
      message:
        "Rider approval removed successfully",
      rider: safeRider,
    });
  } catch (error) {
    console.error(
      "❌ Reject rider error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove rider approval",
    });
  }
};

// ============================================================
// TOGGLE RIDER AVAILABILITY
// ============================================================

const updateRiderAvailability = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { isAvailable } =
      req.body || {};

    const rider =
      await User.findById(id);

    if (!rider) {
      return res.status(404).json({
        success: false,
        message: "Rider not found",
      });
    }

    if (rider.role !== "rider") {
      return res.status(400).json({
        success: false,
        message:
          "This user is not a rider",
      });
    }

    // Only approved and active riders
    // can become available.
    if (
      Boolean(isAvailable) === true &&
      (
        rider.riderProfile?.isApproved !==
          true ||
        rider.isActive === false
      )
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Rider must be approved and active before becoming available",
      });
    }

    rider.riderProfile.isAvailable =
      Boolean(isAvailable);

    await rider.save();

    const safeRider =
      rider.toObject();

    delete safeRider.password;

    return res.status(200).json({
      success: true,
      message: Boolean(isAvailable)
        ? "Rider is now available"
        : "Rider is now unavailable",
      rider: safeRider,
    });
  } catch (error) {
    console.error(
      "❌ Update rider availability error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid rider ID",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update rider availability",
    });
  }
};

// ============================================================
// GET AVAILABLE RIDERS
// For delivery assignment
// ============================================================

const getAvailableRiders = async (
  req,
  res
) => {
  try {
    const {
      serviceArea,
    } = req.query;

    const filter = {
      role: "rider",
      isActive: true,
      "riderProfile.isApproved": true,
      "riderProfile.isAvailable": true,
    };

    if (
      serviceArea &&
      String(serviceArea).trim()
    ) {
      filter[
        "riderProfile.serviceArea"
      ] = {
        $regex: String(
          serviceArea
        ).trim(),
        $options: "i",
      };
    }

    const riders =
      await User.find(filter)
        .select(
          "name phone location avatar photoURL riderProfile"
        )
        .sort({
          "riderProfile.rating": -1,
          "riderProfile.completedDeliveries": -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: riders.length,
      riders,
    });
  } catch (error) {
    console.error(
      "❌ Get available riders error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch available riders",
    });
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  getUserStats,

  getRiders,
  approveRider,
  rejectRider,
  updateRiderAvailability,
  getAvailableRiders,
};