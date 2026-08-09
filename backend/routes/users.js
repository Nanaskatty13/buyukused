// backend/routes/users.js

const express = require("express");
const router = express.Router();

const multer = require("multer");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const {
  cloudinary,
} = require("../config/cloudinary");

const User = require("../models/User");

const {
  verifyToken,
  isAdmin,
} = require("../middleware/auth");

// ============================================================
// MULTER - MEMORY STORAGE
// ============================================================
//
// IMPORTANT:
// Do NOT save profile images to Render's filesystem.
//
// The image is temporarily kept in memory and then uploaded
// directly to Cloudinary.
//
// Browser
//   ↓
// Multer memory
//   ↓
// Cloudinary
//   ↓
// MongoDB stores photoURL + photoPublicId
//
// ============================================================

const profileUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
      ),
      false
    );
  },
});

// ============================================================
// CLOUDINARY CONFIGURATION CHECK
// ============================================================

const isCloudinaryConfigured = () => {
  return (
    !!process.env.CLOUDINARY_CLOUD_NAME &&
    !!process.env.CLOUDINARY_API_KEY &&
    !!process.env.CLOUDINARY_API_SECRET
  );
};

// ============================================================
// UPLOAD IMAGE TO CLOUDINARY
// ============================================================

const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream =
      cloudinary.uploader.upload_stream(
        {
          folder: "sell-platform/profiles",

          resource_type: "image",

          transformation: [
            {
              width: 800,
              height: 800,
              crop: "limit",
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },

        (error, result) => {
          if (error) {
            return reject(error);
          }

          return resolve(result);
        }
      );

    uploadStream.end(buffer);
  });
};

// ============================================================
// DELETE CLOUDINARY IMAGE
// ============================================================

const deleteCloudinaryImage = async (
  photoURL,
  publicId = null
) => {
  try {
    if (!photoURL && !publicId) {
      return;
    }

    let cloudinaryPublicId =
      publicId || null;

    // --------------------------------------------------------
    // If public ID is not stored, attempt to extract it
    // from the Cloudinary URL.
    // --------------------------------------------------------

    if (!cloudinaryPublicId && photoURL) {
      try {
        const url = new URL(photoURL);

        let pathname = url.pathname;

        const uploadIndex =
          pathname.indexOf("/upload/");

        if (uploadIndex !== -1) {
          pathname =
            pathname.substring(
              uploadIndex +
                "/upload/".length
            );

          // Remove Cloudinary version.
          //
          // Example:
          // v1234567890/folder/image.jpg
          //
          pathname =
            pathname.replace(
              /^v\d+\//,
              ""
            );

          // Remove extension.
          pathname =
            pathname.replace(
              /\.[^/.]+$/,
              ""
            );

          cloudinaryPublicId =
            pathname;
        }
      } catch (error) {
        console.warn(
          "⚠️ Could not extract Cloudinary public ID:",
          error.message
        );
      }
    }

    if (!cloudinaryPublicId) {
      console.warn(
        "⚠️ No Cloudinary public ID available for deletion."
      );

      return;
    }

    await cloudinary.uploader.destroy(
      cloudinaryPublicId,
      {
        resource_type: "image",
      }
    );

    console.log(
      "🗑️ Cloudinary image deleted:",
      cloudinaryPublicId
    );
  } catch (error) {
    // Do not fail the user's profile update just because
    // deleting an old image failed.

    console.error(
      "⚠️ Could not delete Cloudinary image:",
      error.message
    );
  }
};

// ============================================================
// DELETE NEWLY UPLOADED IMAGE IF DATABASE SAVE FAILS
// ============================================================

const cleanupCloudinaryUpload =
  async (uploadResult) => {
    if (!uploadResult?.public_id) {
      return;
    }

    try {
      await cloudinary.uploader.destroy(
        uploadResult.public_id,
        {
          resource_type: "image",
        }
      );

      console.log(
        "🧹 Removed unused Cloudinary upload:",
        uploadResult.public_id
      );
    } catch (error) {
      console.error(
        "⚠️ Cloudinary cleanup failed:",
        error.message
      );
    }
  };

// ============================================================
// SAFE USER RESPONSE
// ============================================================

const getSafeUser = (user) => {
  const userObject =
    user?.toObject
      ? user.toObject()
      : { ...user };

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

// ============================================================
// UPDATE OWN PROFILE
//
// PUT /api/users/profile
//
// FormData:
//
// name
// email
// phone
// removePhoto
// photo
//
// ============================================================

router.put(
  "/profile",

  verifyToken,

  // ----------------------------------------------------------
  // MULTER
  // ----------------------------------------------------------

  (req, res, next) => {
    profileUpload.single("photo")(
      req,
      res,
      (error) => {
        if (error instanceof multer.MulterError) {
          console.error(
            "❌ Multer error:",
            error
          );

          if (
            error.code ===
            "LIMIT_FILE_SIZE"
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Profile image must be 5MB or smaller.",
            });
          }

          return res.status(400).json({
            success: false,
            message:
              error.message ||
              "Profile image upload failed.",
          });
        }

        if (error) {
          console.error(
            "❌ Profile upload error:",
            error
          );

          return res.status(400).json({
            success: false,
            message:
              error.message ||
              "Failed to upload profile image.",
          });
        }

        next();
      }
    );
  },

  // ----------------------------------------------------------
  // UPDATE PROFILE
  // ----------------------------------------------------------

  async (req, res) => {
    let cloudinaryUpload = null;

    try {
      const {
        name,
        email,
        phone,
        removePhoto,
      } = req.body;

      console.log(
        "👤 Updating profile:",
        req.userId
      );

      console.log(
        "📷 New photo:",
        req.file
          ? {
              originalname:
                req.file.originalname,
              mimetype:
                req.file.mimetype,
              size:
                req.file.size,
            }
          : "No new photo"
      );

      // ======================================================
      // VALIDATE USER ID
      // ======================================================

      if (
        !req.userId ||
        !mongoose.Types.ObjectId.isValid(
          req.userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid user ID.",
        });
      }

      // ======================================================
      // FIND USER
      // ======================================================

      const user =
        await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // ======================================================
      // SAVE OLD PHOTO INFORMATION
      // ======================================================

      const oldPhotoURL =
        user.photoURL || "";

      const oldPhotoPublicId =
        user.photoPublicId || "";

      // ======================================================
      // REMOVE PHOTO FLAG
      // ======================================================

      const shouldRemovePhoto =
        removePhoto === true ||
        removePhoto === "true" ||
        removePhoto === "1";

      // ======================================================
      // NAME
      // ======================================================

      if (name !== undefined) {
        const cleanName =
          String(name).trim();

        if (!cleanName) {
          return res.status(400).json({
            success: false,
            message:
              "Name cannot be empty.",
          });
        }

        if (cleanName.length < 2) {
          return res.status(400).json({
            success: false,
            message:
              "Name must be at least 2 characters.",
          });
        }

        user.name = cleanName;
      }

      // ======================================================
      // EMAIL
      // ======================================================

      if (email !== undefined) {
        const cleanEmail =
          String(email)
            .trim()
            .toLowerCase();

        if (!cleanEmail) {
          return res.status(400).json({
            success: false,
            message:
              "Email cannot be empty.",
          });
        }

        const validEmail =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            cleanEmail
          );

        if (!validEmail) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter a valid email address.",
          });
        }

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
              "That email address is already in use.",
          });
        }

        user.email = cleanEmail;
      }

      // ======================================================
      // PHONE
      // ======================================================

      if (phone !== undefined) {
        user.phone =
          String(phone).trim();
      }

      // ======================================================
      // REMOVE CURRENT PHOTO
      // ======================================================

      if (shouldRemovePhoto) {
        user.photoURL = "";
        user.photoPublicId = "";
      }

      // ======================================================
      // NEW PHOTO
      // ======================================================

      if (req.file) {
        // ----------------------------------------------------
        // Cloudinary configuration
        // ----------------------------------------------------

        if (!isCloudinaryConfigured()) {
          return res.status(500).json({
            success: false,
            message:
              "Cloudinary is not configured on the server.",
          });
        }

        console.log(
          "☁️ Uploading profile image to Cloudinary..."
        );

        // ----------------------------------------------------
        // Upload directly from memory
        // ----------------------------------------------------

        cloudinaryUpload =
          await uploadToCloudinary(
            req.file.buffer
          );

        if (
          !cloudinaryUpload ||
          !cloudinaryUpload.secure_url
        ) {
          throw new Error(
            "Cloudinary did not return an image URL."
          );
        }

        console.log(
          "✅ Cloudinary upload successful:",
          cloudinaryUpload.secure_url
        );

        // ----------------------------------------------------
        // Save Cloudinary information
        // ----------------------------------------------------

        user.photoURL =
          cloudinaryUpload.secure_url;

        user.photoPublicId =
          cloudinaryUpload.public_id;
      }

      // ======================================================
      // SAVE USER TO MONGODB
      // ======================================================

      await user.save();

      // ======================================================
      // DELETE OLD PHOTO
      // ======================================================
      //
      // Only after MongoDB successfully saved the new data.
      //
      // Do NOT delete the old photo if:
      //
      // - There was no photo change.
      //
      // ======================================================

      if (
        oldPhotoURL &&
        (shouldRemovePhoto ||
          req.file)
      ) {
        await deleteCloudinaryImage(
          oldPhotoURL,
          oldPhotoPublicId
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      console.log(
        "✅ Profile updated successfully:",
        user._id.toString()
      );

      return res.status(200).json({
        success: true,

        message:
          "Profile updated successfully.",

        user: getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "❌ Update profile error:",
        error
      );

      // ======================================================
      // CLEAN UP NEW CLOUDINARY IMAGE
      // ======================================================
      //
      // If Cloudinary succeeded but MongoDB failed,
      // delete the newly uploaded image.
      //
      // ======================================================

      if (cloudinaryUpload?.public_id) {
        await cleanupCloudinaryUpload(
          cloudinaryUpload
        );
      }

      // ======================================================
      // DUPLICATE EMAIL
      // ======================================================

      if (error?.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "That email address is already in use.",
        });
      }

      // ======================================================
      // MONGOOSE VALIDATION
      // ======================================================

      if (
        error?.name ===
        "ValidationError"
      ) {
        const errors =
          Object.values(
            error.errors || {}
          ).map(
            (item) =>
              item.message
          );

        return res.status(400).json({
          success: false,
          message:
            "Profile validation failed.",
          errors,
        });
      }

      // ======================================================
      // GENERIC ERROR
      // ======================================================

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Failed to update profile.",
      });
    }
  }
);

// ============================================================
// GET ALL USERS
//
// GET /api/users
//
// ADMIN ONLY
// ============================================================

router.get(
  "/",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const {
        search,
        role,
        limit = 50,
        page = 1,
      } = req.query;

      const filter = {};

      // --------------------------------------------------------
      // ROLE FILTER
      // --------------------------------------------------------

      if (
        role &&
        role !== "all"
      ) {
        filter.role = role;
      }

      // --------------------------------------------------------
      // SEARCH
      // --------------------------------------------------------

      if (search) {
        const safeSearch =
          String(search).trim();

        if (safeSearch) {
          filter.$or = [
            {
              name: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },

            {
              email: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },

            {
              phone: {
                $regex:
                  safeSearch,
                $options: "i",
              },
            },
          ];
        }
      }

      // --------------------------------------------------------
      // PAGINATION
      // --------------------------------------------------------

      const parsedLimit =
        Math.min(
          Math.max(
            parseInt(
              limit,
              10
            ) || 50,
            1
          ),
          100
        );

      const parsedPage =
        Math.max(
          parseInt(
            page,
            10
          ) || 1,
          1
        );

      const skip =
        (parsedPage - 1) *
        parsedLimit;

      // --------------------------------------------------------
      // QUERY
      // --------------------------------------------------------

      const [
        users,
        total,
      ] = await Promise.all([
        User.find(filter)
          .select("-password")
          .sort({
            createdAt: -1,
          })
          .skip(skip)
          .limit(
            parsedLimit
          ),

        User.countDocuments(
          filter
        ),
      ]);

      return res.json({
        success: true,

        users,

        total,

        page: parsedPage,

        limit: parsedLimit,

        totalPages:
          Math.ceil(
            total /
              parsedLimit
          ),
      });
    } catch (error) {
      console.error(
        "❌ Get all users error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

// ============================================================
// GET USER STATS
//
// GET /api/users/stats
//
// ADMIN ONLY
// ============================================================

router.get(
  "/stats",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const [
        totalUsers,
        totalAdmins,
        totalSellers,
        totalBuyers,
      ] = await Promise.all([
        User.countDocuments(),

        User.countDocuments({
          role: "admin",
        }),

        User.countDocuments({
          role: "seller",
        }),

        User.countDocuments({
          role: "buyer",
        }),
      ]);

      return res.json({
        success: true,

        stats: {
          totalUsers,
          totalAdmins,
          totalSellers,
          totalBuyers,
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
          error.message,
      });
    }
  }
);

// ============================================================
// GET SINGLE USER
//
// GET /api/users/:id
//
// ADMIN ONLY
// ============================================================

router.get(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID.",
        });
      }

      const user =
        await User.findById(
          req.params.id
        ).select("-password");

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      return res.json({
        success: true,
        user,
      });
    } catch (error) {
      console.error(
        "❌ Get single user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message,
      });
    }
  }
);

// ============================================================
// UPDATE USER
//
// PUT /api/users/:id
//
// ADMIN ONLY
// ============================================================

router.put(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID.",
        });
      }

      const {
        name,
        email,
        phone,
        role,
        password,
        isActive,
      } = req.body;

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      // ======================================================
      // PREVENT ADMIN FROM REMOVING OWN ADMIN ROLE
      // ======================================================

      if (
        user.role === "admin" &&
        role !== undefined &&
        role !== "admin" &&
        req.userId.toString() ===
          user._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cannot remove your own admin role.",
        });
      }

      // ======================================================
      // NAME
      // ======================================================

      if (name !== undefined) {
        const cleanName =
          String(name).trim();

        if (!cleanName) {
          return res.status(400).json({
            success: false,
            message:
              "Name cannot be empty.",
          });
        }

        if (cleanName.length < 2) {
          return res.status(400).json({
            success: false,
            message:
              "Name must be at least 2 characters.",
          });
        }

        user.name = cleanName;
      }

      // ======================================================
      // EMAIL
      // ======================================================

      if (email !== undefined) {
        const cleanEmail =
          String(email)
            .trim()
            .toLowerCase();

        if (!cleanEmail) {
          return res.status(400).json({
            success: false,
            message:
              "Email cannot be empty.",
          });
        }

        const validEmail =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            cleanEmail
          );

        if (!validEmail) {
          return res.status(400).json({
            success: false,
            message:
              "Please enter a valid email address.",
          });
        }

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
              "That email address is already in use.",
          });
        }

        user.email = cleanEmail;
      }

      // ======================================================
      // PHONE
      // ======================================================

      if (phone !== undefined) {
        user.phone =
          String(phone).trim();
      }

      // ======================================================
      // ROLE
      // ======================================================

      if (role !== undefined) {
        const allowedRoles = [
          "admin",
          "seller",
          "buyer",
        ];

        if (
          !allowedRoles.includes(
            role
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid user role.",
          });
        }

        user.role = role;
      }

      // ======================================================
      // ACTIVE STATUS
      // ======================================================

      if (
        isActive !== undefined
      ) {
        if (
          typeof isActive ===
          "boolean"
        ) {
          user.isActive =
            isActive;
        } else {
          user.isActive =
            String(
              isActive
            ).toLowerCase() ===
            "true";
        }
      }

      // ======================================================
      // PASSWORD
      // ======================================================

      if (password) {
        const cleanPassword =
          String(password);

        if (
          cleanPassword.length <
          6
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Password must be at least 6 characters.",
          });
        }

        // User schema pre-save hook will hash this.
        user.password =
          cleanPassword;
      }

      // ======================================================
      // SAVE
      // ======================================================

      await user.save();

      return res.json({
        success: true,

        message:
          "User updated successfully.",

        user:
          getSafeUser(user),
      });
    } catch (error) {
      console.error(
        "❌ Update user error:",
        error
      );

      if (
        error?.code === 11000
      ) {
        return res.status(409).json({
          success: false,
          message:
            "That email address is already in use.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Failed to update user.",
      });
    }
  }
);

// ============================================================
// DELETE USER
//
// DELETE /api/users/:id
//
// ADMIN ONLY
// ============================================================

router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.params.id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID.",
        });
      }

      // ======================================================
      // PREVENT SELF DELETE
      // ======================================================

      if (
        req.userId.toString() ===
        req.params.id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "You cannot delete your own account.",
        });
      }

      // ======================================================
      // FIND USER
      // ======================================================

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      // ======================================================
      // PREVENT DELETING LAST ADMIN
      // ======================================================

      if (
        user.role === "admin"
      ) {
        const adminCount =
          await User.countDocuments({
            role: "admin",
          });

        if (
          adminCount <= 1
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot delete the last admin.",
          });
        }
      }

      // ======================================================
      // SAVE PHOTO INFORMATION
      // ======================================================

      const oldPhotoURL =
        user.photoURL || "";

      const oldPhotoPublicId =
        user.photoPublicId || "";

      // ======================================================
      // DELETE USER
      // ======================================================

      await user.deleteOne();

      // ======================================================
      // DELETE CLOUDINARY PHOTO
      // ======================================================

      if (oldPhotoURL) {
        await deleteCloudinaryImage(
          oldPhotoURL,
          oldPhotoPublicId
        );
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      return res.json({
        success: true,
        message:
          "User deleted successfully.",
      });
    } catch (error) {
      console.error(
        "❌ Delete user error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error?.message ||
          "Failed to delete user.",
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;