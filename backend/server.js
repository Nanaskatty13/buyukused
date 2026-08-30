// ============================================================
// backend/server.js
// BuyUKUsed Backend Server
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

dotenv.config();

// ============================================================
// CONFIGURATION
// ============================================================

const connectDB = require("./config/db");

require("./config/passport")(passport);

const activityMiddleware = require("./middleware/activity");

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
    `❌ Missing environment variables: ${missing.join(", ")}`
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
//
// IMPORTANT:
//
// BASE_URL is the BACKEND URL.
//
// Production:
// https://buyukused.onrender.com
//
// FRONTEND_URL is:
// https://buyukused.com
//
// Do NOT use the frontend URL as BASE_URL.
//

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

// ============================================================
// OPTIMIZED: COMPRESSION with better settings
// ============================================================

app.use(
  compression({
    // Compress all responses, including small ones
    threshold: 0,

    // Maximum compression level (9 = best compression)
    level: 9,

    // Filter: compress all applicable content types
    filter: (req, res) => {
      // Skip compression for already-compressed formats
      if (req.headers["x-no-compression"]) {
        return false;
      }

      // Use compression for all responses by default
      return compression.filter(req, res);
    },

    // Set Vary header for proper caching behavior
    // (compression already does this by default)
  })
);

console.log(
  "🗜️ Compression enabled: threshold=0, level=9"
);

// ============================================================
// REQUEST LOGGING
// ============================================================

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
//
// PRODUCTION FRONTEND:
//
// https://buyukused.com
// https://www.buyukused.com
//
// LOCAL DEVELOPMENT:
//
// http://localhost:3000
// http://127.0.0.1:3000
// http://localhost:5173
// http://127.0.0.1:5173
//
// Vercel URLs are kept temporarily for development/testing.
// You can remove them later once you are completely finished
// using Vercel preview deployments.
//

const allowedOrigins = [
  // ----------------------------------------------------------
  // PRIMARY PRODUCTION WEBSITE
  // ----------------------------------------------------------

  "https://buyukused.com",
  "https://www.buyukused.com",

  // ----------------------------------------------------------
  // LOCAL DEVELOPMENT
  // ----------------------------------------------------------

  "http://localhost:3000",
  "http://127.0.0.1:3000",

  "http://localhost:5173",
  "http://127.0.0.1:5173",

  // ----------------------------------------------------------
  // MAIN VERCEL DEPLOYMENT
  // ----------------------------------------------------------

  "https://buyukused.vercel.app",

  // ----------------------------------------------------------
  // KNOWN VERCEL PREVIEWS
  // ----------------------------------------------------------

  "https://buyukused-ggapyipm3-nanaskatty13s-projects.vercel.app",

  "https://buyukused-2w4b8fl3w-nanaskatty13s-projects.vercel.app",

  // ----------------------------------------------------------
  // PREVIOUS VERCEL PROJECT
  // ----------------------------------------------------------

  "https://sell-platform2.vercel.app",

  "https://sell-platform2-mcv0eniwt-nanaskatty13s-projects.vercel.app",

  // ----------------------------------------------------------
  // ENVIRONMENT VARIABLE
  // ----------------------------------------------------------

  process.env.FRONTEND_URL,
].filter(Boolean);

// ============================================================
// REMOVE DUPLICATES
// ============================================================

const uniqueAllowedOrigins = [
  ...new Set(allowedOrigins),
];

// ============================================================
// LOG CORS CONFIGURATION
// ============================================================

console.log(
  "🟢 Allowed CORS Origins:"
);

console.log(
  uniqueAllowedOrigins
);

// ============================================================
// CORS ORIGIN CHECK
// ============================================================

const isAllowedOrigin = (origin) => {
  // ----------------------------------------------------------
  // Requests without Origin
  // ----------------------------------------------------------
  //
  // Examples:
  // - Render health checks
  // - curl
  // - server-to-server requests
  //

  if (!origin) {
    return true;
  }

  // ----------------------------------------------------------
  // Explicitly allowed origins
  // ----------------------------------------------------------

  if (
    uniqueAllowedOrigins.includes(origin)
  ) {
    return true;
  }

  // ----------------------------------------------------------
  // BuyUKUsed Vercel preview deployments
  // ----------------------------------------------------------

  if (
    /^https:\/\/buyukused-[a-zA-Z0-9-]+-nanaskatty13s-projects\.vercel\.app$/.test(
      origin
    )
  ) {
    return true;
  }

  // ----------------------------------------------------------
  // General Vercel deployments
  // ----------------------------------------------------------

  if (
    /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(
      origin
    )
  ) {
    return true;
  }

  // ----------------------------------------------------------
  // Everything else is blocked
  // ----------------------------------------------------------

  return false;
};

// ============================================================
// CORS OPTIONS
// ============================================================

const corsOptions = {
  origin: (origin, callback) => {
    console.log(
      "🔍 Incoming CORS origin:",
      origin || "undefined"
    );

    if (isAllowedOrigin(origin)) {
      console.log(
        "✅ CORS allowed:",
        origin || "no-origin"
      );

      return callback(null, true);
    }

    console.log(
      "🚫 CORS blocked:",
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
    "HEAD",
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
    "RateLimit-Limit",
    "RateLimit-Remaining",
    "RateLimit-Reset",
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
// OPTIMIZED: STATIC UPLOADS with caching headers
// ============================================================

const uploadsDirectory = path.join(
  __dirname,
  "public",
  "uploads"
);

app.use(
  "/uploads",
  express.static(uploadsDirectory, {
    setHeaders: (res, filePath) => {
      // Allow cross-origin access
      res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
      );

      res.setHeader(
        "Cross-Origin-Resource-Policy",
        "cross-origin"
      );

      // ─── CACHE CONTROL ──────────────────────────────────────
      // Cache static assets for 1 year (immutable) for images
      // that rarely change, or 1 day for others
      const ext = path.extname(filePath).toLowerCase();

      if (
        [".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".ico"].includes(ext)
      ) {
        // Images: cache for 1 year
        res.setHeader(
          "Cache-Control",
          "public, max-age=31536000, immutable"
        );
      } else if (
        [".css", ".js", ".woff2", ".woff", ".ttf", ".eot"].includes(ext)
      ) {
        // Fonts and static assets: cache for 1 year
        res.setHeader(
          "Cache-Control",
          "public, max-age=31536000, immutable"
        );
      } else {
        // Everything else: cache for 1 day
        res.setHeader(
          "Cache-Control",
          "public, max-age=86400"
        );
      }
    },
  })
);

console.log(
  "📁 Static uploads directory:",
  uploadsDirectory
);

console.log(
  "🗄️ Static file caching: ENABLED (images: 1 year, others: 1 day)"
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
// ADMIN RATE-LIMIT BYPASS
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
  } catch {
    // Invalid JWT.
    // Normal authentication middleware
    // will handle it.
  }

  next();
};

app.use(
  skipIfAdmin
);

// ============================================================
// GLOBAL API RATE LIMITER
// ============================================================

const apiLimiter = rateLimit({
  windowMs:
    15 * 60 * 1000,

  max:
    process.env.NODE_ENV === "production"
      ? 500
      : 1000,

  skip: (req) => {
    // --------------------------------------------------------
    // Admin bypass
    // --------------------------------------------------------

    if (
      req.skipRateLimit
    ) {
      return true;
    }

    // --------------------------------------------------------
    // Development bypass
    // --------------------------------------------------------

    if (
      process.env.NODE_ENV ===
      "development"
    ) {
      return true;
    }

    // --------------------------------------------------------
    // Public product GET requests
    // --------------------------------------------------------

    if (
      req.method === "GET" &&
      req.path.startsWith(
        "/products"
      )
    ) {
      return true;
    }

    // --------------------------------------------------------
    // Public review GET requests
    // --------------------------------------------------------

    if (
      req.method === "GET" &&
      req.path.startsWith(
        "/reviews"
      )
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

    errorCode:
      "RATE_LIMITED",
  },
});

// ============================================================
// APPLY GLOBAL API LIMITER
// ============================================================

app.use(
  "/api",
  apiLimiter
);

// ============================================================
// PUBLIC READ RATE LIMITER
// ============================================================

const publicReadLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max:
      process.env.NODE_ENV ===
      "production"
        ? 1000
        : 5000,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,

      message:
        "Too many requests. Please try again later.",

      errorCode:
        "RATE_LIMITED",
    },
  });

// ============================================================
// AUTHENTICATION RATE LIMITER
// ============================================================

const authLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    max:
      process.env.NODE_ENV ===
      "production"
        ? 30
        : 200,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,

      message:
        "Too many authentication attempts. Please try again later.",

      errorCode:
        "AUTH_RATE_LIMITED",
    },
  });

// ============================================================
// AUTH RATE LIMITER
// ============================================================

app.use(
  "/auth",
  authLimiter
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
            Date.now() - startedAt
          }ms`
        );
      }
    );

    next();
  }
);

// ============================================================
// REVIEW REQUEST LOGGER
// ============================================================

app.use(
  "/api/reviews",
  (req, res, next) => {
    const startedAt =
      Date.now();

    console.log(
      "\n⭐ ============================================================"
    );

    console.log(
      `⭐ REVIEW REQUEST → ${req.method} ${req.originalUrl}`
    );

    console.log(
      "⭐ Origin:",
      req.headers.origin ||
        "undefined"
    );

    console.log(
      "⭐ Authorization:",
      req.headers.authorization
        ? "PRESENT"
        : "MISSING"
    );

    if (
      req.body &&
      Object.keys(req.body).length
    ) {
      console.log(
        "⭐ Review body:",
        {
          sellerId:
            req.body.sellerId ||
            "none",

          productId:
            req.body.productId ||
            "none",

          orderId:
            req.body.orderId ||
            "none",

          rating:
            req.body.rating,

          commentLength:
            String(
              req.body.comment ||
                ""
            ).length,

          comment:
            req.body.comment
              ? "[PRESENT]"
              : "[EMPTY]",
        }
      );
    }

    res.on(
      "finish",
      () => {
        console.log(
          `⭐ REVIEW RESPONSE ← ${req.method} ${req.originalUrl} | ${res.statusCode} | ${
            Date.now() - startedAt
          }ms`
        );

        console.log(
          "⭐ ============================================================\n"
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

const passwordRoutes =
  require("./routes/passwordRoutes");

const authRoutes =
  require("./routes/auth");

const productRoutes =
  require("./routes/products");

const notificationRoutes =
  require("./routes/notifications");

const userRoutes =
  require("./routes/users");

const messageRoutes =
  require("./routes/messages");

const adminRoutes =
  require("./routes/admin");

const deliveryRoutes =
  require("./routes/deliveryRoutes");

const uploadRoutes =
  require("./routes/upload");

const sellerRoutes =
  require("./routes/sellers");

const categoryRoutes =
  require("./routes/categories");

const visualSearchRoutes =
  require("./routes/visualSearchRoutes");

const listingRoutes =
  require("./routes/listings");

const reviewRoutes =
  require("./routes/reviewRoutes");

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
// AUTHENTICATION
// ============================================================

app.use(
  "/auth",
  authRoutes
);

// ============================================================
// SELLERS
// ============================================================

app.use(
  "/sellers",
  sellerRoutes
);

// ============================================================
// PRODUCTS
// ============================================================

app.use(
  "/api/products",
  (req, res, next) => {
    if (
      req.method === "GET"
    ) {
      return publicReadLimiter(
        req,
        res,
        next
      );
    }

    next();
  },
  productRoutes
);

// ============================================================
// REVIEWS
// ============================================================

app.use(
  "/api/reviews",
  (req, res, next) => {
    if (
      req.method === "GET"
    ) {
      return publicReadLimiter(
        req,
        res,
        next
      );
    }

    next();
  },
  reviewRoutes
);

console.log(
  "⭐ Reviews API mounted at /api/reviews"
);

console.log(
  "🔐 Review write operations require authentication"
);

console.log(
  "👤 Review edit/delete are owner-only"
);

// ============================================================
// VISUAL SEARCH
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
// LISTINGS
// ============================================================

app.use(
  "/api/listings",
  listingRoutes
);

console.log(
  "🔧 Listings API mounted at /api/listings"
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
      return res
        .status(404)
        .json({
          success: false,

          message:
            "API endpoint not found",

          path:
            req.originalUrl,
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
  (err, req, res, next) => {
    console.error(
      "\n============================================================"
    );

    console.error(
      "❌ GLOBAL ERROR"
    );

    console.error(
      "============================================================"
    );

    console.error(
      "Method:",
      req.method
    );

    console.error(
      "URL:",
      req.originalUrl
    );

    console.error(
      "Origin:",
      req.headers.origin ||
        "undefined"
    );

    console.error(
      "Name:",
      err?.name
    );

    console.error(
      "Message:",
      err?.message
    );

    console.error(
      "Code:",
      err?.code
    );

    console.error(
      "Stack:",
      err?.stack
    );

    console.error(
      "============================================================\n"
    );

    // --------------------------------------------------------
    // CORS
    // --------------------------------------------------------

    if (
      err &&
      err.message ===
        "CORS not allowed for this origin"
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            err.message,

          errorCode:
            "CORS_ERROR",
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
        return res
          .status(413)
          .json({
            success: false,

            message:
              "File too large. Maximum size is 5MB.",

            errorCode:
              "FILE_TOO_LARGE",
          });
      }

      return res
        .status(400)
        .json({
          success: false,

          message:
            err.message ||
            "File upload error.",

          errorCode:
            "UPLOAD_ERROR",
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

      return res
        .status(409)
        .json({
          success: false,

          message:
            `${field} already exists`,

          errorCode:
            "DUPLICATE_KEY",
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

      return res
        .status(400)
        .json({
          success: false,

          message:
            "Validation error",

          errors:
            messages,

          errorCode:
            "VALIDATION_ERROR",
        });
    }

    // --------------------------------------------------------
    // CAST ERROR
    // --------------------------------------------------------

    if (
      err &&
      err.name ===
        "CastError"
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Invalid data.",

          errorCode:
            "CAST_ERROR",
        });
    }

    // --------------------------------------------------------
    // RATE LIMIT ERROR
    // --------------------------------------------------------

    if (
      err &&
      err.status === 429
    ) {
      return res
        .status(429)
        .json({
          success: false,

          message:
            err.message ||
            "Too many requests, please try again later.",

          errorCode:
            "RATE_LIMITED",
        });
    }

    // --------------------------------------------------------
    // DEFAULT
    // --------------------------------------------------------

    return res
      .status(
        err?.status ||
          500
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
  process.env.PORT ||
  5000;

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
        user =
          new User({
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
        user.role =
          "admin";

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
      const connection =
        await connectDB();

      console.log(
        `✅ MongoDB connected to: ${connection.name}`
      );

      await ensureDefaultCategories();

      console.log(
        "✅ Default categories check completed"
      );

      await createDefaultAdmin();

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
              `🔗 Backend URL: ${
                process.env.BASE_URL ||
                "(auto-detected)"
              }`
            );

            console.log(
              `🌐 Production frontend: https://buyukused.com`
            );

            console.log(
              `📁 Uploads: ${uploadsDirectory}`
            );

            console.log(
              "🗄️ Static file caching: ENABLED (1 year for images/fonts)"
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
              "🛒 Seller API: /sellers"
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
              "🔐 Review authentication: ENABLED"
            );

            console.log(
              "👤 Review owner-only edit/delete: ENABLED"
            );

            console.log(
              "🟢 Activity tracking: ENABLED"
            );

            console.log(
              "🟢 CORS: ENABLED"
            );

            console.log(
              "🗜️ Compression: ENABLED (threshold=0, level=9)"
            );

            console.log(
              "🛡️ Global API rate limit: 500 / 15 min"
            );

            console.log(
              "🛡️ Public product/review reads: 1000 / 15 min"
            );

            console.log(
              "🔐 Authentication rate limit: 30 / 15 min"
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

      // --------------------------------------------------------
      // GRACEFUL SHUTDOWN
      // --------------------------------------------------------

      const shutdown =
        async (signal) => {
          console.log(
            `\n🛑 ${signal} received. Shutting down server...`
          );

          server.close(
            async () => {
              console.log(
                "🛑 HTTP server closed."
              );

              try {
                const mongoose =
                  require("mongoose");

                await mongoose.connection.close();

                console.log(
                  "🛑 MongoDB connection closed."
                );

                process.exit(0);
              } catch (error) {
                console.error(
                  "❌ Error closing MongoDB:",
                  error
                );

                process.exit(1);
              }
            }
          );

          setTimeout(
            () => {
              console.error(
                "❌ Forced shutdown after timeout."
              );

              process.exit(1);
            },
            10000
          );
        };

      process.once(
        "SIGTERM",
        () =>
          shutdown("SIGTERM")
      );

      process.once(
        "SIGINT",
        () =>
          shutdown("SIGINT")
      );
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