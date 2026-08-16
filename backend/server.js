
// backend/server.js

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
// IMPORTANT: CORS MUST BE BEFORE ROUTES
// ============================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  "https://sell-platform2.vercel.app",

  "https://sell-platform2-mcv0eniwt-nanaskatty13s-projects.vercel.app",

  process.env.FRONTEND_URL,
].filter(Boolean);

console.log("🟢 Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: (origin, callback) => {
    console.log("🔍 Incoming origin:", origin);

    // Server-to-server / curl / health checks
    if (!origin) {
      return callback(null, true);
    }

    // Explicitly allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow Vercel preview deployments
    if (
      /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/.test(
        origin
      )
    ) {
      return callback(null, true);
    }

    console.log("🚫 Blocked CORS:", origin);

    return callback(
      new Error("CORS not allowed for this origin")
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
  ],

  optionsSuccessStatus: 204,
};

// Apply CORS globally
app.use(cors(corsOptions));

// Explicitly handle preflight requests
app.options("*", cors(corsOptions));

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
  express.static(uploadsDirectory)
);

console.log(
  "📁 Static uploads directory:",
  uploadsDirectory
);

// ============================================================
// PASSPORT
// ============================================================

app.use(passport.initialize());

// ============================================================
// RATE LIMITING
// ============================================================

const skipIfAdmin = (req, res, next) => {
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role === "admin") {
      req.skipRateLimit = true;
    }
  } catch (error) {
    // Invalid token.
    // Continue normally.
  }

  next();
};

app.use(skipIfAdmin);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max:
    process.env.NODE_ENV === "production"
      ? 100
      : 500,

  skip: (req) => {
    if (req.skipRateLimit) {
      return true;
    }

    if (process.env.NODE_ENV === "development") {
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

app.use("/api", limiter);
app.use("/auth", limiter);

// ============================================================
// ROOT API CHECK
// ============================================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Sell Platform API is running",
    environment:
      process.env.NODE_ENV || "development",
  });
});

// ============================================================
// HEALTH CHECK
// ============================================================

const healthResponse = (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
};

app.get("/health", healthResponse);

app.get("/api/health", healthResponse);

// ============================================================
// PASSWORD RESET ROUTES
// ============================================================

const passwordRoutes =
  require("./routes/passwordRoutes");

app.use(
  "/api/password",
  passwordRoutes
);

// ============================================================
// APPLICATION ROUTES
// ============================================================

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

console.log("✅ Routes loaded");

// ============================================================
// AUTHENTICATION
// ============================================================

app.use(
  "/auth",
  authRoutes
);

// ============================================================
// PRODUCTS
// ============================================================

app.use(
  "/api/products",
  productRoutes
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
// 404 HANDLER
// ============================================================

app.use((req, res) => {
  if (
    req.path.startsWith("/api") ||
    req.path.startsWith("/auth")
  ) {
    return res.status(404).json({
      success: false,
      message: "API endpoint not found",
    });
  }

  return res.status(404).send("Not Found");
});

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  (err, req, res, next) => {
    console.error("❌ Error:", err);

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
      err.name === "MulterError"
    ) {
      if (
        err.code === "LIMIT_FILE_SIZE"
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
    // DUPLICATE MONGODB FIELD
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
        message: `${field} already exists`,
      });
    }

    // --------------------------------------------------------
    // MONGOOSE VALIDATION
    // --------------------------------------------------------

    if (
      err &&
      err.name === "ValidationError"
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
        message: "Validation error",
        errors: messages,
      });
    }

    // --------------------------------------------------------
    // GENERIC ERROR
    // --------------------------------------------------------

    return res
      .status(err?.status || 500)
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

const createDefaultAdmin = async () => {
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
        email: normalizedEmail,
      });

    if (!user) {
      user = new User({
        name: "Admin",
        email: normalizedEmail,
        password: adminPassword,
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

const start = async () => {
  try {
    const connection =
      await connectDB();

    console.log(
      `✅ MongoDB connected to: ${connection.name}`
    );

    await createDefaultAdmin();

    const server = app.listen(
      PORT,
      () => {
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
      }
    );

    // Allow long-running requests
    server.timeout = 120000;

    server.keepAliveTimeout = 65000;

    server.headersTimeout = 66000;
  } catch (error) {
    console.error(
      "❌ Server failed:",
      error
    );

    process.exit(1);
  }
};

start();