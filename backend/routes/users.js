// backend/routes/users.js

const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");
const fs = require("fs");
const fsp = require("fs/promises");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const User = require("../models/User");
const { verifyToken, isAdmin } = require("../middleware/auth");

// ============================================================
// PROFILE UPLOAD DIRECTORY
// ============================================================

const profileUploadDir = path.resolve(
  __dirname,
  "../public/uploads/profiles"
);

console.log("📁 Profile upload directory:", profileUploadDir);

// ============================================================
// MULTER MEMORY STORAGE
//
// IMPORTANT:
// We do NOT use diskStorage here.
//
// The uploaded image stays in memory temporarily.
// We manually save it after validating the request.
// This avoids Render ENOENT errors during multer upload.
// ============================================================

const profileStorage = multer.memoryStorage();

const profileUpload = multer({
  storage: profileStorage,

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

    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error(
          "Only JPG, JPEG, PNG, WEBP and GIF images are allowed."
        ),
        false
      );
    }

    cb(null, true);
  },
});

// ============================================================
// HELPER: MAKE SURE UPLOAD DIRECTORY EXISTS
// ============================================================

const ensureProfileUploadDirectory = async () => {
  await fsp.mkdir(profileUploadDir, {
    recursive: true,
  });
};

// ============================================================
// HELPER: GENERATE SAFE FILE NAME
// ============================================================

const generateProfileFilename = (originalName, mimetype) => {
  const extensionFromName = path
    .extname(originalName || "")
    .toLowerCase();

  const allowedExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
  ];

  let extension = extensionFromName;

  if (!allowedExtensions.includes(extension)) {
    const mimeExtensions = {
      "image/jpeg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };

    extension = mimeExtensions[mimetype] || ".jpg";
  }

  return `profile-${Date.now()}-${Math.round(
    Math.random() * 1e9
  )}${extension}`;
};

// ============================================================
// HELPER: SAVE PROFILE IMAGE
// ============================================================

const saveProfileImage = async (file) => {
  if (!file || !file.buffer) {
    throw new Error("No image file received.");
  }

  await ensureProfileUploadDirectory();

  const filename = generateProfileFilename(
    file.originalname,
    file.mimetype
  );

  const filePath = path.join(
    profileUploadDir,
    filename
  );

  await fsp.writeFile(filePath, file.buffer);

  console.log("✅ Profile image saved:", filePath);

  return {
    filename,
    filePath,
  };
};

// ============================================================
// HELPER: DELETE PROFILE IMAGE
// ============================================================

const deleteProfileImage = async (photoURL) => {
  try {
    if (!photoURL) return;

    let pathname;

    try {
      pathname = new URL(photoURL).pathname;
    } catch {
      pathname = photoURL;
    }

    const filename = path.basename(pathname);

    if (!filename) return;

    // Prevent directory traversal
    const safeFilename = path.basename(filename);

    const filePath = path.join(
      profileUploadDir,
      safeFilename
    );

    const resolvedDirectory =
      path.resolve(profileUploadDir);

    const resolvedFile =
      path.resolve(filePath);

    if (
      !resolvedFile.startsWith(
        resolvedDirectory + path.sep
      )
    ) {
      console.warn(
        "⚠️ Blocked unsafe profile image deletion:",
        filePath
      );

      return;
    }

    try {
      await fsp.unlink(filePath);

      console.log(
        "🗑️ Old profile image deleted:",
        filePath
      );
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.error(
          "⚠️ Could not delete old profile image:",
          error.message
        );
      }
    }
  } catch (error) {
    console.error(
      "⚠️ Profile image deletion error:",
      error.message
    );
  }
};

// ============================================================
// HELPER: DELETE FILE SAFELY
// ============================================================

const deleteUploadedFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fsp.unlink(filePath);

    console.log(
      "🧹 Uploaded file cleaned up:",
      filePath
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(
        "⚠️ Upload cleanup failed:",
        error.message
      );
    }
  }
};

// ============================================================
// HELPER: SAFE USER RESPONSE
// ============================================================

const getSafeUser = (user) => {
  const userObject = user?.toObject
    ? user.toObject()
    : { ...user };

  delete userObject.password;

  return userObject;
};

// ============================================================
// UPDATE OWN PROFILE
//
// PUT /api/users/profile
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
            error.code === "LIMIT_FILE_SIZE"
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
    let newImagePath = null;

    try {
      const {
        name,
        email,
        phone,
        removePhoto,
      } = req.body;

      console.log(
        "👤 Updating profile for:",
        req.userId
      );

      console.log(
        "📷 Received profile image:",
        req.file
          ? {
              originalname:
                req.file.originalname,
              mimetype:
                req.file.mimetype,
              size: req.file.size,
            }
          : "No new image"
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

      const user = await User.findById(
        req.userId
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      // ======================================================
      // SAVE OLD PHOTO URL
      // ======================================================

      const oldPhotoURL =
        user.photoURL || null;

      // ======================================================
      // NAME
      // ======================================================

      if (name !== undefined) {
        const cleanName =
          String(name).trim();

        if (!cleanName) {
          return res.status(400).json({
            success: false,
            message: "Name cannot be empty.",
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
      // PROFILE PHOTO
      // ======================================================

      if (
        removePhoto === "true"
      ) {
        user.photoURL = null;
      } else if (req.file) {
        // ----------------------------------------------------
        // SAVE IMAGE MANUALLY
        // ----------------------------------------------------

        const savedImage =
          await saveProfileImage(
            req.file
          );

        newImagePath =
          savedImage.filePath;

        // ----------------------------------------------------
        // PUBLIC IMAGE URL
        // ----------------------------------------------------

        const baseUrl =
          `${req.protocol}://${req.get("host")}`;

        user.photoURL =
          `${baseUrl}/uploads/profiles/${encodeURIComponent(
            savedImage.filename
          )}`;
      }

      // ======================================================
      // SAVE USER
      // ======================================================

      await user.save();

      // ======================================================
      // DELETE OLD PHOTO ONLY AFTER DATABASE SAVE
      // ======================================================

      if (
        oldPhotoURL &&
        (
          removePhoto === "true" ||
          req.file
        )
      ) {
        await deleteProfileImage(
          oldPhotoURL
        );
      }

      // ======================================================
      // NEW IMAGE IS NOW SAFE
      // ======================================================

      newImagePath = null;

      console.log(
        "✅ Profile updated:",
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
        "❌ UPDATE PROFILE ERROR:",
        error
      );

      // ======================================================
      // DELETE NEW IMAGE IF DATABASE SAVE FAILED
      // ======================================================

      if (newImagePath) {
        await deleteUploadedFile(
          newImagePath
        );
      }

      // ======================================================
      // DUPLICATE EMAIL
      // ======================================================

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message:
            "That email address is already in use.",
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Failed to update profile.",
      });
    }
  }
);

// ============================================================
// ADMIN
// GET ALL USERS
//
// GET /api/users
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

        filter.$or = [
          {
            name: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            email: {
              $regex: safeSearch,
              $options: "i",
            },
          },
          {
            phone: {
              $regex: safeSearch,
              $options: "i",
            },
          },
        ];
      }

      // --------------------------------------------------------
      // PAGINATION
      // --------------------------------------------------------

      const parsedLimit =
        Math.min(
          Math.max(
            parseInt(limit, 10) || 50,
            1
          ),
          100
        );

      const parsedPage =
        Math.max(
          parseInt(page, 10) || 1,
          1
        );

      const skip =
        (parsedPage - 1) *
        parsedLimit;

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
          .limit(parsedLimit),

        User.countDocuments(filter),
      ]);

      return res.json({
        success: true,
        users,
        total,
        page: parsedPage,
        limit: parsedLimit,
        totalPages:
          Math.ceil(
            total / parsedLimit
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
// ADMIN
// GET USER STATS
//
// GET /api/users/stats
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
// ADMIN
// GET SINGLE USER
//
// GET /api/users/:id
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
// ADMIN
// UPDATE USER
//
// PUT /api/users/:id
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
      // PREVENT REMOVING OWN ADMIN ROLE
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

        user.email =
          cleanEmail;
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
          !allowedRoles.includes(role)
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
        user.isActive =
          isActive === true ||
          isActive === "true";
      }

      // ======================================================
      // PASSWORD
      // ======================================================

      if (password) {
        if (
          String(password).length <
          6
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Password must be at least 6 characters.",
          });
        }

        user.password =
          await bcrypt.hash(
            String(password),
            10
          );
      }

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
        error.code === 11000
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
          error.message,
      });
    }
  }
);

// ============================================================
// ADMIN
// DELETE USER
//
// DELETE /api/users/:id
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
      // PREVENT LAST ADMIN DELETE
      // ======================================================

      if (
        user.role === "admin"
      ) {
        const adminCount =
          await User.countDocuments({
            role: "admin",
          });

        if (adminCount <= 1) {
          return res.status(400).json({
            success: false,
            message:
              "Cannot delete the last admin.",
          });
        }
      }

      const oldPhotoURL =
        user.photoURL;

      // ======================================================
      // DELETE USER
      // ======================================================

      await user.deleteOne();

      // ======================================================
      // DELETE PHOTO
      // ======================================================

      if (oldPhotoURL) {
        await deleteProfileImage(
          oldPhotoURL
        );
      }

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
          error.message,
      });
    }
  }
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;