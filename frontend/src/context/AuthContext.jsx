import React, {
  createContext,
  useContext,
  useState,
  useEffect,
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

const AuthContext = createContext();

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
  // Load saved authentication immediately
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());

  // Prevent protected pages from rendering
  // before authentication has been checked.
  const [loading, setLoading] = useState(true);

  // ==============================================================
  // RESTORE LOGIN SESSION
  // ==============================================================

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const storedToken = getToken();

      // No saved token = not logged in
      if (!storedToken) {
        if (mounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }

        return;
      }

      try {
        console.log(
          "🔐 Restoring saved login session..."
        );

        const data =
          await api.auth.getMe(storedToken);

        if (!mounted) return;

        if (data?.user) {
          // Token is valid
          setToken(storedToken);
          setUser(data.user);

          // Refresh stored user information
          setUserStorage(data.user);

          console.log(
            "✅ Login session restored"
          );
        } else {
          // Unexpected response
          console.warn(
            "⚠️ /auth/me returned no user"
          );

          // Keep the token for now.
          // Do not log the user out just because
          // the response format was unexpected.
        }
      } catch (err) {
        if (!mounted) return;

        console.error(
          "❌ Auth restore error:",
          err
        );

        // ========================================================
        // IMPORTANT
        // Only remove authentication when the backend
        // explicitly says the token is invalid/expired.
        // ========================================================

        if (
          err.status === 401 ||
          err.status === 403
        ) {
          console.warn(
            "🔒 Token is invalid or account is unauthorized."
          );

          clearAuthData();

          setToken(null);
          setUser(null);
        } else {
          // ======================================================
          // Network error / server temporarily unavailable /
          // CORS / 500 error etc.
          //
          // DO NOT DELETE THE SAVED TOKEN.
          // ======================================================

          console.warn(
            "🌐 Temporary authentication check failure. Keeping saved login."
          );

          // Keep existing localStorage authentication.
          // If user data is already stored, keep it too.
          const savedUser = getUser();

          if (savedUser) {
            setUser(savedUser);
          }

          setToken(storedToken);
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

      if (
        data?.token &&
        data?.user
      ) {
        // Save token permanently in localStorage
        setTokenStorage(data.token);

        // Update React state
        setToken(data.token);
        setUser(data.user);

        // Save user information
        setUserStorage(data.user);

        console.log(
          "✅ Login successful"
        );

        return {
          success: true,
          user: data.user,
        };
      }

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
          err.message ||
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

      if (
        data?.token &&
        data?.user
      ) {
        // Save authentication
        setTokenStorage(data.token);
        setToken(data.token);

        // Save user
        setUser(data.user);
        setUserStorage(data.user);

        console.log(
          "✅ Registration successful"
        );

        return {
          success: true,
          user: data.user,
        };
      }

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
          err.message ||
          "Network error",
      };
    }
  };

  // ==============================================================
  // LOGOUT
  // ==============================================================

  const logout = async () => {
    try {
      // Tell backend about logout if possible
      if (token) {
        await api.auth.logout(token);
      }
    } catch (err) {
      console.error(
        "Logout API error:",
        err
      );
    } finally {
      // ==========================================================
      // User intentionally logged out.
      // NOW we remove authentication.
      // ==========================================================

      clearAuthData();

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
    user,
    token,
    loading,

    login,
    register,
    logout,

    isAuthenticated:
      !!token && !!user,
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

export default AuthContext;