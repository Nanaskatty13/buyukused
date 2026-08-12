// frontend/src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

import {
  getToken,
  setToken as setTokenStorage,
  removeToken,
  getUser,
  setUser as setUserStorage,
  removeUser,
  clearAuthData,
} from "../utils/storage";

// ================================================================
// AUTH CONTEXT
// ================================================================

const AuthContext = createContext(null);

// ================================================================
// USE AUTH
// ================================================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};

// ================================================================
// AUTH PROVIDER
// ================================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // ==============================================================
  // NORMALIZE USER
  // ==============================================================
  //
  // Keeps avatar/photoURL available regardless of which field
  // the backend sends.
  //

  const normalizeUser = (userData) => {
    if (!userData) {
      return null;
    }

    const data =
      userData?.user ||
      userData?.data?.user ||
      userData?.data ||
      userData;

    if (!data || typeof data !== "object") {
      return null;
    }

    return {
      ...data,

      _id:
        data._id ||
        data.id ||
        data.userId ||
        "",

      id:
        data.id ||
        data._id ||
        data.userId ||
        "",

      name: data.name || "",

      email: data.email || "",

      phone: data.phone || "",

      location:
        data.location || "Ghana",

      role:
        data.role || "buyer",

      isActive:
        data.isActive !== false,

      // ==========================================================
      // PROFILE IMAGE
      // ==========================================================

      avatar:
        data.avatar ||
        data.photoURL ||
        data.profileImage ||
        data.profilePicture ||
        "",

      photoURL:
        data.photoURL ||
        data.avatar ||
        data.profileImage ||
        data.profilePicture ||
        "",

      provider:
        data.provider || "local",

      providerId:
        data.providerId || "",

      lastLogin:
        data.lastLogin || null,

      createdAt:
        data.createdAt || null,

      updatedAt:
        data.updatedAt || null,
    };
  };

  // ==============================================================
  // REFRESH USER
  // ==============================================================
  //
  // Fetch the complete user profile from /auth/me.
  //
  // This is especially important after the user changes their
  // profile picture.
  //

  const refreshUser = async () => {
    const storedToken = getToken();

    if (!storedToken) {
      console.warn(
        "⚠️ Cannot refresh user: no token"
      );

      return null;
    }

    try {
      // ----------------------------------------------------------
      // Check API
      // ----------------------------------------------------------

      if (
        !api ||
        !api.auth ||
        typeof api.auth.getMe !== "function"
      ) {
        throw new Error(
          "api.auth.getMe is not available in api.js"
        );
      }

      // ----------------------------------------------------------
      // Request current user
      // ----------------------------------------------------------

      const data =
        await api.auth.getMe(
          storedToken
        );

      console.log(
        "👤 /auth/me response:",
        data
      );

      // ----------------------------------------------------------
      // Get user from response
      // ----------------------------------------------------------

      if (
        !data?.success ||
        !data?.user
      ) {
        console.warn(
          "⚠️ Refresh user: no user in response"
        );

        return null;
      }

      const fullUser =
        normalizeUser(data.user);

      if (!fullUser) {
        return null;
      }

      // ----------------------------------------------------------
      // Update React state
      // ----------------------------------------------------------

      setUser(fullUser);

      setToken(storedToken);

      // ----------------------------------------------------------
      // Update local storage
      // ----------------------------------------------------------

      setUserStorage(fullUser);

      setTokenStorage(storedToken);

      console.log(
        "✅ User refreshed with full profile:",
        fullUser
      );

      console.log(
        "🖼️ Profile picture:",
        fullUser.avatar ||
          fullUser.photoURL ||
          "No profile picture"
      );

      return fullUser;
    } catch (err) {
      console.error(
        "❌ Error refreshing user:",
        err
      );

      // ----------------------------------------------------------
      // Invalid token
      // ----------------------------------------------------------

      if (
        err?.status === 401 ||
        err?.status === 403
      ) {
        console.warn(
          "🔒 Authentication token is invalid or expired."
        );

        clearAuthData();

        setUser(null);
        setToken(null);
      }

      return null;
    }
  };

  // ==============================================================
  // RESTORE SESSION
  // ==============================================================

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const storedToken = getToken();
      const storedUser = getUser();

      console.log(
        "🔐 Restoring saved login session..."
      );

      // ----------------------------------------------------------
      // No token
      // ----------------------------------------------------------

      if (!storedToken) {
        if (mounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }

        console.log(
          "ℹ️ No saved authentication token"
        );

        return;
      }

      // ----------------------------------------------------------
      // Immediately restore saved data
      // ----------------------------------------------------------

      if (mounted) {
        setToken(storedToken);

        if (storedUser) {
          setUser(
            normalizeUser(
              storedUser
            )
          );
        }
      }

      // ----------------------------------------------------------
      // Verify session with backend
      // ----------------------------------------------------------

      try {
        if (
          !api ||
          !api.auth ||
          typeof api.auth.getMe !== "function"
        ) {
          throw new Error(
            "api.auth.getMe is not available in api.js"
          );
        }

        const data =
          await api.auth.getMe(
            storedToken
          );

        if (!mounted) {
          return;
        }

        console.log(
          "👤 Authentication response:",
          data
        );

        // --------------------------------------------------------
        // Valid user
        // --------------------------------------------------------

        if (
          data?.success &&
          data?.user
        ) {
          const fullUser =
            normalizeUser(
              data.user
            );

          setToken(
            storedToken
          );

          setUser(
            fullUser
          );

          setTokenStorage(
            storedToken
          );

          setUserStorage(
            fullUser
          );

          console.log(
            "✅ Login session restored"
          );

          console.log(
            "🖼️ Navbar avatar:",
            fullUser?.avatar ||
              fullUser?.photoURL ||
              "No profile picture"
          );
        }

        // --------------------------------------------------------
        // Backend returned no user
        // --------------------------------------------------------

        else {
          console.warn(
            "⚠️ Authentication check returned no user"
          );

          setToken(
            storedToken
          );

          setUser(
            storedUser
              ? normalizeUser(
                  storedUser
                )
              : null
          );
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        console.error(
          "❌ Auth restore error:",
          err
        );

        const status =
          err?.status;

        // --------------------------------------------------------
        // Invalid token
        // --------------------------------------------------------

        if (
          status === 401 ||
          status === 403
        ) {
          console.warn(
            "🔒 Saved token is invalid or expired."
          );

          clearAuthData();

          setToken(null);
          setUser(null);
        }

        // --------------------------------------------------------
        // Temporary backend/network problem
        // --------------------------------------------------------

        else {
          console.warn(
            "🌐 Temporary authentication check failure. Keeping saved login."
          );

          setToken(
            storedToken
          );

          setUser(
            storedUser
              ? normalizeUser(
                  storedUser
                )
              : null
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  // ==============================================================
  // LOGIN
  // ==============================================================

  const login = async (
    email,
    password
  ) => {
    try {
      const data =
        await api.auth.login(
          email,
          password
        );

      console.log(
        "🔐 Login response:",
        data
      );

      // ----------------------------------------------------------
      // Successful login
      // ----------------------------------------------------------

      if (
        data?.success &&
        data?.token &&
        data?.user
      ) {
        const loggedInUser =
          normalizeUser(
            data.user
          );

        // --------------------------------------------------------
        // Save authentication
        // --------------------------------------------------------

        setTokenStorage(
          data.token
        );

        setUserStorage(
          loggedInUser
        );

        setToken(
          data.token
        );

        setUser(
          loggedInUser
        );

        // --------------------------------------------------------
        // Fetch complete profile
        // --------------------------------------------------------

        let fullUser =
          loggedInUser;

        const refreshedUser =
          await refreshUser();

        if (refreshedUser) {
          fullUser =
            refreshedUser;
        }

        console.log(
          "✅ Login successful:",
          fullUser
        );

        console.log(
          "🖼️ Profile picture:",
          fullUser?.avatar ||
            fullUser?.photoURL ||
            "No profile picture"
        );

        return {
          success: true,
          user: fullUser,
          token: data.token,
        };
      }

      // ----------------------------------------------------------
      // Login failed
      // ----------------------------------------------------------

      return {
        success: false,
        error:
          data?.message ||
          "Login failed",
      };
    } catch (err) {
      console.error(
        "❌ Login error:",
        err
      );

      return {
        success: false,
        error:
          err?.message ||
          "Network error",
      };
    }
  };

  // ==============================================================
  // REGISTER
  // ==============================================================

  const register = async (
    userData
  ) => {
    try {
      const data =
        await api.auth.register(
          userData
        );

      console.log(
        "📝 Registration response:",
        data
      );

      // ----------------------------------------------------------
      // Successful registration
      // ----------------------------------------------------------

      if (
        data?.success &&
        data?.token &&
        data?.user
      ) {
        const registeredUser =
          normalizeUser(
            data.user
          );

        setTokenStorage(
          data.token
        );

        setUserStorage(
          registeredUser
        );

        setToken(
          data.token
        );

        setUser(
          registeredUser
        );

        // --------------------------------------------------------
        // Fetch complete profile
        // --------------------------------------------------------

        let fullUser =
          registeredUser;

        const refreshedUser =
          await refreshUser();

        if (refreshedUser) {
          fullUser =
            refreshedUser;
        }

        console.log(
          "✅ Registration successful:",
          fullUser
        );

        return {
          success: true,
          user: fullUser,
          token: data.token,
        };
      }

      // ----------------------------------------------------------
      // Registration failed
      // ----------------------------------------------------------

      return {
        success: false,
        error:
          data?.message ||
          "Registration failed",
      };
    } catch (err) {
      console.error(
        "❌ Register error:",
        err
      );

      return {
        success: false,
        error:
          err?.message ||
          "Network error",
      };
    }
  };

  // ==============================================================
  // UPDATE USER
  // ==============================================================
  //
  // Use this when profile information changes.
  //
  // Example:
  //
  // updateUser({
  //   ...user,
  //   avatar: newAvatar
  // });
  //

  const updateUser = (
    updatedUser
  ) => {
    if (!updatedUser) {
      return;
    }

    const normalizedUser =
      normalizeUser(
        updatedUser
      );

    if (!normalizedUser) {
      return;
    }

    setUser(
      normalizedUser
    );

    setUserStorage(
      normalizedUser
    );

    console.log(
      "✅ User context updated:",
      normalizedUser
    );

    console.log(
      "🖼️ Updated profile picture:",
      normalizedUser.avatar ||
        normalizedUser.photoURL ||
        "No profile picture"
    );
  };

  // ==============================================================
  // LOGOUT
  // ==============================================================

  const logout = async () => {
    const currentToken =
      token || getToken();

    try {
      if (
        currentToken &&
        api?.auth &&
        typeof api.auth.logout ===
          "function"
      ) {
        await api.auth.logout(
          currentToken
        );
      }
    } catch (err) {
      console.error(
        "❌ Logout API error:",
        err
      );
    } finally {
      // ----------------------------------------------------------
      // Clear local authentication
      // ----------------------------------------------------------

      clearAuthData();

      try {
        removeToken();
        removeUser();
      } catch (storageError) {
        console.warn(
          "⚠️ Storage cleanup warning:",
          storageError
        );
      }

      setToken(null);
      setUser(null);

      console.log(
        "👋 Logged out"
      );
    }
  };

  // ==============================================================
  // CONTEXT VALUE
  // ==============================================================

  const value = {
    // User
    user,
    setUser,
    updateUser,

    // Authentication
    token,

    // Loading
    loading,

    // Actions
    login,
    register,
    logout,
    refreshUser,

    // Status
    isAuthenticated:
      Boolean(token) &&
      Boolean(user),

    isAdmin:
      user?.role === "admin",

    isSeller:
      user?.role === "seller" ||
      user?.role === "admin",

    isBuyer:
      user?.role === "buyer",
  };

  // ==============================================================
  // PROVIDER
  // ==============================================================

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ================================================================
// DEFAULT EXPORT
// ================================================================

export default AuthContext;