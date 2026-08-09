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

  // Important:
  // Protected components should wait until the saved session
  // has been checked.
  const [loading, setLoading] = useState(true);

  // ============================================================
  // RESTORE SESSION
  // ============================================================

  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const storedToken = getToken();
      const storedUser = getUser();

      console.log("🔐 Restoring saved login session...");

      // --------------------------------------------------------
      // No token
      // --------------------------------------------------------

      if (!storedToken) {
        if (mounted) {
          setToken(null);
          setUser(null);
          setLoading(false);
        }

        console.log("ℹ️ No saved authentication token");
        return;
      }

      // --------------------------------------------------------
      // Temporarily use saved credentials while checking API
      // --------------------------------------------------------

      if (mounted) {
        setToken(storedToken);

        if (storedUser) {
          setUser(storedUser);
        }
      }

      try {
        // ------------------------------------------------------
        // Verify token with backend
        // ------------------------------------------------------

        if (
          !api ||
          !api.auth ||
          typeof api.auth.getMe !== "function"
        ) {
          throw new Error(
            "api.auth.getMe is not available in api.js"
          );
        }

        const data = await api.auth.getMe(storedToken);

        if (!mounted) return;

        // ------------------------------------------------------
        // Valid session
        // ------------------------------------------------------

        if (data?.success && data?.user) {
          setToken(storedToken);
          setUser(data.user);

          setTokenStorage(storedToken);
          setUserStorage(data.user);

          console.log("✅ Login session restored");
        } else {
          console.warn(
            "⚠️ Authentication check returned no user"
          );

          // Keep saved session if backend response is unexpected.
          setToken(storedToken);
          setUser(storedUser || null);
        }
      } catch (err) {
        if (!mounted) return;

        console.error(
          "❌ Auth restore error:",
          err
        );

        const status = err?.status;

        // ------------------------------------------------------
        // Definitely invalid token
        // ------------------------------------------------------

        if (status === 401 || status === 403) {
          console.warn(
            "🔒 Saved token is invalid or expired."
          );

          clearAuthData();

          setToken(null);
          setUser(null);
        } else {
          // ----------------------------------------------------
          // Server/network/CORS problem
          // ----------------------------------------------------
          // Don't log the user out just because the server
          // temporarily failed.

          console.warn(
            "🌐 Temporary authentication check failure. Keeping saved login."
          );

          setToken(storedToken);
          setUser(storedUser || null);
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

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (email, password) => {
    try {
      const data = await api.auth.login(
        email,
        password
      );

      if (
        data?.success &&
        data?.token &&
        data?.user
      ) {
        setTokenStorage(data.token);
        setUserStorage(data.user);

        setToken(data.token);
        setUser(data.user);

        console.log("✅ Login successful");

        return {
          success: true,
          user: data.user,
          token: data.token,
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
          err?.message ||
          "Network error",
      };
    }
  };

  // ============================================================
  // REGISTER
  // ============================================================

  const register = async (userData) => {
    try {
      const data =
        await api.auth.register(userData);

      if (
        data?.success &&
        data?.token &&
        data?.user
      ) {
        setTokenStorage(data.token);
        setUserStorage(data.user);

        setToken(data.token);
        setUser(data.user);

        console.log(
          "✅ Registration successful"
        );

        return {
          success: true,
          user: data.user,
          token: data.token,
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
          err?.message ||
          "Network error",
      };
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = async () => {
    const currentToken = token;

    try {
      if (
        currentToken &&
        api?.auth &&
        typeof api.auth.logout === "function"
      ) {
        await api.auth.logout(
          currentToken
        );
      }
    } catch (err) {
      console.error(
        "Logout API error:",
        err
      );
    } finally {
      clearAuthData();

      // Also explicitly remove these in case the
      // storage implementation changes later.
      try {
        removeToken();
        removeUser();
      } catch (storageError) {
        console.warn(
          "Storage cleanup warning:",
          storageError
        );
      }

      setToken(null);
      setUser(null);

      console.log("👋 Logged out");
    }
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = {
    user,
    token,
    loading,

    login,
    register,
    logout,

    isAuthenticated:
      Boolean(token) &&
      Boolean(user),
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;