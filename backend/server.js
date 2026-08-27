// ============================================================
// BuyUKUsed Backend Server
// backend/server.js
// ============================================================

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const jwt = require("jsonwebtoken");
const path = require("path");

// ============================================================
// ENVIRONMENT
// ============================================================

dotenv.config();

// ============================================================
// CONFIGURATION
// ============================================================

const connectDB = require("./config/db");

require("./config/passport")(passport);

// Activity tracking
const activityMiddleware =
  require("./middleware/activity");

// Category seeding
const {
  ensureDefaultCategories,
} = require("./controllers/categoryController");

const app = express();

// ============================================================
// ENVIRONMENT CHECK
// ============================================================

const requiredEnv = [
  "MONGO_URI",
  "JWT_SECRET",
];

const missing = requiredEnv.filter(
  (key) => !process.env[key]
);

if (missing.length > 0) {
  console.error(
    `❌ Missing environment variables: ${missing.join(
      ", "
    )}`
  );

  process.exit(1);
}

// ============================================================
// TRUST PROXY
// ============================================================

app.set("trust proxy", 1);

// ============================================================
// BASE URL
// ============================================================

app.use((req, res, next) => {
  req.baseUrl =
    process.env.BASE_URL ||
    `${req.protocol}://${req.get("host")}`;

  next();
});

// ============================================================
// SECURITY
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

app.use(compression());

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  // Local development
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  // Current production frontend
  "https://buyukused.vercel.app",

  // BuyUKUsed Vercel deployments
  "https://buyukused-ggapyipm3-nanaskatty13s-projects.vercel.app",
  "https://buyukused-2w4b8fl3w-nanaskatty13s-projects.vercel.app",

  // Older frontend deployments
  "https://sell-platform2.vercel.app",
  "https://sell-platform2-mcv0eniwt-nanaskatty13s-projects.vercel.app",

  // Environment variable
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log(
  "🟢 Allowed Origins:",
  allowedOrigins
);

// ============================================================
// CORS HELPER
// ============================================================

const isAllowedOrigin = (origin) => {
  // Server-to-server / Render health checks
  if (!origin) {
    return true;
  }

  // Explicitly allowed origins
  if (allowedOrigins.includes(origin)) {
    return true;
  }

  // BuyUKUsed Vercel preview deployments
  if (
    /^https:\/\/buyukused-[a-zA-Z0-9-]+-nanaskatty13s-projects\.vercel\.app$/.test(
      origin
    )
  ) {
    return true;
  }

  // Any normal Vercel deployment
  if (
    /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(
      origin
    )
  ) {
    return true;
  }

  return false;
};

// ============================================================
// CORS OPTIONS
// ============================================================

const corsOptions = {
  origin: (origin, callback) => {
    console.log(
      "🔍 Incoming origin:",
      origin || "undefined"
    );

    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.log(
      "🚫 Blocked CORS origin:",
      origin
    );

    return callback(
      new Error(
        "CORS not allowed for this origin"
      )
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "Origin",
    "X-Requested-With",
  ],

  exposedHeaders: [
    "Content-Length",
    "Content-Range",
  ],

  optionsSuccessStatus: 204,

  maxAge: 86400,
};

// ============================================================
// APPLY CORS
// ============================================================

app.use(cors(corsOptions));

app.options(
  "*",
  cors(corsOptions)
);

// ============================================================
// BODY PARSERS
// ============================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ============================================================
// STATIC UPLOADS
// ============================================================

const uploadsDirectory = path.join(
  __dirname,
  "public",
  "uploads"
);

app.use(
  "/uploads",
  express.static(
    uploadsDirectory,
    {
      setHeaders: (res) => {
        res.setHeader(
          "Access-Control-Allow-Origin",
          "*"
        );

        res.setHeader(
          "Cross-Origin-Resource-Policy",
          "cross-origin"
        );
      },
    }
  )
);

console.log(
  "📁 Static uploads directory:",
  uploadsDirectory
);

// ============================================================
// PASSPORT
// ============================================================

app.use(
  passport.initialize()
);

// ============================================================
// ACTIVITY TRACKING
// ============================================================

app.use(
  activityMiddleware
);

console.log(
  "🟢 Seller/user activity tracking enabled"
);

// ============================================================
// RATE LIMITING
// ============================================================

const skipIfAdmin = (
  req,
  res,
  next
) => {
  const authHeader =
    req.headers.authorization;

  if (
    !authHeader ||
    !authHeader.startsWith("Bearer ")
  ) {
    return next();
  }

  const token =
    authHeader.split(" ")[1];

  try {
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );

    if (
      decoded.role === "admin"
    ) {
      req.skipRateLimit = true;
    }
  } catch (error) {
    // Ignore invalid token.
  }

  next();
};

app.use(
  skipIfAdmin
);

const limiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max:
      process.env.NODE_ENV ===
      "production"
        ? 100
        : 500,

    skip: (req) => {
      if (
        req.skipRateLimit
      ) {
        return true;
      }

      if (
        process.env.NODE_ENV ===
        "development"
      ) {
        return true;
      }

      return false;
    },

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests, please try again later.",
    },
  });

app.use(
  "/api",
  limiter
);

app.use(
  "/auth",
  limiter
);

// ============================================================
// DELIVERY REQUEST LOGGER
// ============================================================

app.use(
  "/api/deliveries",
  (req, res, next) => {
    const startedAt =
      Date.now();

    console.log(
      `🚴 DELIVERY REQUEST → ${req.method} ${req.originalUrl}`
    );

    res.on(
      "finish",
      () => {
        console.log(
          `🚴 DELIVERY RESPONSE ← ${req.method} ${req.originalUrl} | ${res.statusCode} | ${
            Date.now() -
            startedAt
          }ms`
        );
      }
    );

    next();
  }
);

// ============================================================
// ROOT
// ============================================================

app.get(
  "/",
  (req, res) => {
    res.status(200).json({
      success: true,
      message:
        "BuyUKUsed API is running",
      environment:
        process.env.NODE_ENV ||
        "development",
    });
  }
);

// ============================================================
// HEALTH
// ============================================================

const healthResponse =
  (req, res) => {
    res.status(200).json({
      success: true,
      status: "ok",
      timestamp:
        new Date().toISOString(),
    });
  };

app.get(
  "/health",
  healthResponse
);

app.get(
  "/api/health",
  healthResponse
);

// ============================================================
// LOAD ROUTES
// ============================================================

// ------------------------------------------------------------
// AUTH / PASSWORD
// ------------------------------------------------------------

const passwordRoutes =
  require("./routes/passwordRoutes");

const authRoutes =
  require("./routes/auth");

// ------------------------------------------------------------
// PRODUCTS
// ------------------------------------------------------------

const productRoutes =
  require("./routes/products");

// ------------------------------------------------------------
// NOTIFICATIONS
// ------------------------------------------------------------

const notificationRoutes =
  require("./routes/notifications");

// ------------------------------------------------------------
// USERS
// ------------------------------------------------------------

const userRoutes =
  require("./routes/users");

// ------------------------------------------------------------
// MESSAGES
// ------------------------------------------------------------

const messageRoutes =
  require("./routes/messages");

// ------------------------------------------------------------
// ADMIN
// ------------------------------------------------------------

const adminRoutes =
  require("./routes/admin");

// ------------------------------------------------------------
// DELIVERY
// ------------------------------------------------------------

const deliveryRoutes =
  require("./routes/deliveryRoutes");

// ------------------------------------------------------------
// UPLOAD
// ------------------------------------------------------------

const uploadRoutes =
  require("./routes/upload");

// ------------------------------------------------------------
// SELLERS
// ------------------------------------------------------------

const sellerRoutes =
  require("./routes/sellers");

// ------------------------------------------------------------
// CATEGORIES
// ------------------------------------------------------------

const categoryRoutes =
  require("./routes/categories");

// ------------------------------------------------------------
// VISUAL SEARCH
// ------------------------------------------------------------

const visualSearchRoutes =
  require("./routes/visualSearchRoutes");

// ------------------------------------------------------------
// REVIEWS
// IMPORTANT: THIS FIXES:
// GET /api/reviews
// POST /api/reviews
// ------------------------------------------------------------

const reviewController =
  require("./controllers/reviewController");

console.log(
  "✅ All route modules loaded successfully"
);

// ============================================================
// PASSWORD RESET
// ============================================================

app.use(
  "/api/password",
  passwordRoutes
);

// ============================================================
// AUTH
// ============================================================

app.use(
  "/auth",
  authRoutes
);

// ============================================================
// SELLERS
// ============================================================

app.use(
  "/api/sellers",
  sellerRoutes
);

// Keep compatibility with older frontend
// requests that use /sellers.
app.use(
  "/sellers",
  sellerRoutes
);

// ============================================================
// PRODUCTS
// ============================================================

app.use(
  "/api/products",
  productRoutes
);

// ============================================================
// VISUAL IMAGE SEARCH
// ============================================================

app.use(
  "/api/visual-search",
  visualSearchRoutes
);

console.log(
  "🖼️ Visual Search API mounted at /api/visual-search"
);

// ============================================================
// NOTIFICATIONS
// ============================================================

app.use(
  "/api/notifications",
  notificationRoutes
);

// ============================================================
// USERS
// ============================================================

app.use(
  "/api/users",
  userRoutes
);

// ============================================================
// MESSAGES
// ============================================================

app.use(
  "/api/messages",
  messageRoutes
);

console.log(
  "💬 Messages API mounted at /api/messages"
);

// ============================================================
// ADMIN
// ============================================================

app.use(
  "/api/admin",
  adminRoutes
);

// ============================================================
// DELIVERY
// ============================================================

app.use(
  "/api/deliveries",
  deliveryRoutes
);

console.log(
  "🚴 Delivery API mounted at /api/deliveries"
);

// ============================================================
// UPLOAD
// ============================================================

app.use(
  "/api/upload",
  uploadRoutes
);

console.log(
  "📤 Upload API mounted at /api/upload"
);

// ============================================================
// CATEGORIES
// ============================================================

app.use(
  "/api/categories",
  categoryRoutes
);

console.log(
  "📂 Categories API mounted at /api/categories"
);

// ============================================================
// REVIEWS
// ============================================================
//
// GET    /api/reviews
// POST   /api/reviews
// PUT    /api/reviews/:id
// DELETE /api/reviews/:id
//
// POST   /api/reviews/:id/helpful
// POST   /api/reviews/:id/report
//
// POST   /api/reviews/:id/reply
// DELETE /api/reviews/:id/reply
//
// The controller already handles authentication
// checks where required.
//
// ============================================================

// GET REVIEWS
app.get(
  "/api/reviews",
  reviewController.getReviews
);

// CREATE REVIEW
app.post(
  "/api/reviews",
  reviewController.createReview
);

// UPDATE REVIEW
app.put(
  "/api/reviews/:id",
  reviewController.updateReview
);

// DELETE REVIEW
app.delete(
  "/api/reviews/:id",
  reviewController.deleteReview
);

// HELPFUL
app.post(
  "/api/reviews/:id/helpful",
  reviewController.toggleHelpful
);

// REPORT
app.post(
  "/api/reviews/:id/report",
  reviewController.reportReview
);

// SELLER REPLY
app.post(
  "/api/reviews/:id/reply",
  reviewController.replyToReview
);

// DELETE SELLER REPLY
app.delete(
  "/api/reviews/:id/reply",
  reviewController.deleteReply
);

console.log(
  "⭐ Reviews API mounted at /api/reviews"
);

// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  (req, res) => {
    console.log(
      `❌ 404: ${req.method} ${req.originalUrl}`
    );

    if (
      req.path.startsWith("/api") ||
      req.path.startsWith("/auth") ||
      req.path.startsWith("/sellers")
    ) {
      return res.status(404).json({
        success: false,
        message:
          "API endpoint not found",
        path: req.originalUrl,
      });
    }

    return res
      .status(404)
      .send("Not Found");
  }
);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "❌ Global error:",
      err
    );

    // --------------------------------------------------------
    // CORS
    // --------------------------------------------------------

    if (
      err &&
      err.message ===
        "CORS not allowed for this origin"
    ) {
      return res.status(403).json({
        success: false,
        message: err.message,
      });
    }

    // --------------------------------------------------------
    // MULTER
    // --------------------------------------------------------

    if (
      err &&
      err.name ===
        "MulterError"
    ) {
      if (
        err.code ===
        "LIMIT_FILE_SIZE"
      ) {
        return res.status(413).json({
          success: false,
          message:
            "File too large. Maximum size is 5MB.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          err.message ||
          "File upload error.",
      });
    }

    // --------------------------------------------------------
    // DUPLICATE MONGODB KEY
    // --------------------------------------------------------

    if (
      err &&
      err.code === 11000
    ) {
      const field =
        Object.keys(
          err.keyPattern || {}
        )[0] || "field";

      return res.status(409).json({
        success: false,
        message:
          `${field} already exists`,
      });
    }

    // --------------------------------------------------------
    // MONGOOSE VALIDATION
    // --------------------------------------------------------

    if (
      err &&
      err.name ===
        "ValidationError"
    ) {
      const messages =
        Object.values(
          err.errors || {}
        ).map(
          (error) =>
            error.message
        );

      return res.status(400).json({
        success: false,
        message:
          "Validation error",
        errors: messages,
      });
    }

    // --------------------------------------------------------
    // INVALID OBJECT ID
    // --------------------------------------------------------

    if (
      err &&
      err.name ===
        "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid ID.",
      });
    }

    // --------------------------------------------------------
    // JSON PARSING ERROR
    // --------------------------------------------------------

    if (
      err &&
      err instanceof SyntaxError &&
      err.status === 400 &&
      "body" in err
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid JSON request body.",
      });
    }

    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    return res
      .status(
        err?.status || 500
      )
      .json({
        success: false,
        message:
          err?.message ||
          "Internal Server Error",
      });
  }
);

// ============================================================
// UNHANDLED REJECTION
// ============================================================

process.on(
  "unhandledRejection",
  (error) => {
    console.error(
      "❌ Unhandled Rejection:",
      error
    );

    process.exit(1);
  }
);

// ============================================================
// UNCAUGHT EXCEPTION
// ============================================================

process.on(
  "uncaughtException",
  (error) => {
    console.error(
      "❌ Uncaught Exception:",
      error
    );

    process.exit(1);
  }
);

// ============================================================
// PORT
// ============================================================

const PORT =
  process.env.PORT || 5000;

// ============================================================
// DEFAULT ADMIN
// ============================================================

const createDefaultAdmin =
  async () => {
    try {
      const User =
        require("./models/User");

      const adminEmail =
        process.env.ADMIN_EMAIL;

      const adminPassword =
        process.env.ADMIN_PASSWORD;

      if (
        !adminEmail ||
        !adminPassword
      ) {
        console.log(
          "ℹ️ ADMIN_EMAIL or ADMIN_PASSWORD not configured. Skipping default admin creation."
        );

        return;
      }

      const normalizedEmail =
        adminEmail
          .trim()
          .toLowerCase();

      let user =
        await User.findOne({
          email:
            normalizedEmail,
        });

      if (!user) {
        user = new User({
          name: "Admin",

          email:
            normalizedEmail,

          password:
            adminPassword,

          phone: "",

          role: "admin",

          isActive: true,
        });

        await user.save();

        console.log(
          `✅ Default admin created: ${normalizedEmail}`
        );
      } else if (
        user.role !== "admin"
      ) {
        user.role = "admin";

        await user.save();

        console.log(
          `✅ User ${normalizedEmail} promoted to admin`
        );
      } else {
        console.log(
          `ℹ️ Admin user already exists: ${normalizedEmail}`
        );
      }
    } catch (error) {
      console.warn(
        "⚠️ Could not create admin:",
        error.message
      );
    }
  };

// ============================================================
// START SERVER
// ============================================================

const start =
  async () => {
    try {
      // --------------------------------------------------------
      // CONNECT DATABASE
      // --------------------------------------------------------

      const connection =
        await connectDB();

      console.log(
        `✅ MongoDB connected to: ${connection.name}`
      );

      // --------------------------------------------------------
      // DEFAULT CATEGORIES
      // --------------------------------------------------------

      await ensureDefaultCategories();

      console.log(
        "✅ Default categories check completed"
      );

      // --------------------------------------------------------
      // DEFAULT ADMIN
      // --------------------------------------------------------

      await createDefaultAdmin();

      // --------------------------------------------------------
      // START HTTP SERVER
      // --------------------------------------------------------

      const server =
        app.listen(
          PORT,
          () => {
            console.log(
              "============================================================"
            );

            console.log(
              `🚀 Server running on port ${PORT}`
            );

            console.log(
              `🌍 Environment: ${
                process.env.NODE_ENV ||
                "development"
              }`
            );

            console.log(
              `🔗 Base URL: ${
                process.env.BASE_URL ||
                "(auto-detected)"
              }`
            );

            console.log(
              `📁 Uploads: ${uploadsDirectory}`
            );

            console.log(
              "🔐 Admin API: /api/admin"
            );

            console.log(
              "🚴 Delivery API: /api/deliveries"
            );

            console.log(
              "📤 Upload API: /api/upload"
            );

            console.log(
              "🛒 Seller API: /api/sellers"
            );

            console.log(
              "💬 Messages API: /api/messages"
            );

            console.log(
              "📂 Categories API: /api/categories"
            );

            console.log(
              "🖼️ Visual Search API: /api/visual-search"
            );

            console.log(
              "⭐ Reviews API: /api/reviews"
            );

            console.log(
              "🟢 Activity tracking: ENABLED"
            );

            console.log(
              "🟢 CORS: ENABLED"
            );

            console.log(
              "============================================================"
            );
          }
        );

      // --------------------------------------------------------
      // SERVER TIMEOUTS
      // --------------------------------------------------------

      server.timeout =
        120000;

      server.keepAliveTimeout =
        65000;

      server.headersTimeout =
        66000;

    } catch (error) {
      console.error(
        "❌ Server failed:",
        error
      );

      process.exit(1);
    }
  };

// ============================================================
// START
// ============================================================

start();