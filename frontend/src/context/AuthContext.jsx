// frontend/src/context/AuthContext.jsx

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
  getUser,
  setUser as setUserStorage,
  clearAuthData,
} from "../utils/storage";

// ============================================================
// AUTH CONTEXT
// ============================================================

const AuthContext = createContext();

// ============================================================
// USE AUTH
// ============================================================

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
};

// ============================================================
// AUTH PROVIDER
// ============================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // ==========================================================
  // RESTORE LOGIN AFTER REFRESH
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const restoreSession = async () => {
      const storedToken = getToken();
      const storedUser = getUser();

      // No token = not logged in
      if (!storedToken) {
        if (mounted) {
          setUser(null);
          setToken(null);
          setLoading(false);
        }

        return;
      }

      // Immediately restore saved state
      // so refresh does not visually log the user out.
      if (mounted) {
        setToken(storedToken);

        if (storedUser) {
          setUser(storedUser);
        }
      }

      try {
        console.log(
          "🔐 Checking saved login session..."
        );

        const data =
          await api.auth.getMe(storedToken);

        if (!mounted) return;

        if (data?.success && data?.user) {
          // Backend confirmed token is valid
          setToken(storedToken);
          setUser(data.user);

          // Update cached user
          setUserStorage(data.user);

          console.log(
            "✅ Login session restored"
          );
        } else {
          // Do NOT automatically log out
          // because of an unexpected response.
          console.warn(
            "⚠️ /auth/me returned an unexpected response."
          );
        }
      } catch (error) {
        if (!mounted) return;

        console.error(
          "❌ Session restore error:",
          error
        );

        // ======================================================
        // ONLY CLEAR AUTH FOR REAL AUTHORIZATION FAILURES
        // ======================================================

        if (
          error.status === 401 ||
          error.status === 403
        ) {
          console.warn(
            "🔒 Saved session is no longer valid."
          );

          clearAuthData();

          setToken(null);
          setUser(null);
        } else {
          // ====================================================
          // NETWORK / SERVER / CORS / 500 ERROR
          // ====================================================

          console.warn(
            "🌐 Could not verify session temporarily."
          );

          // Keep existing token and user.
          setToken(storedToken);

          if (storedUser) {
            setUser(storedUser);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreSession();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (email, password) => {
    try {
      const data =
        await api.auth.login(
          email,
          password
        );

      if (
        data?.success &&
        data?.token &&
        data?.user
      ) {
        // Save token
        setTokenStorage(data.token);

        // Save user
        setUserStorage(data.user);

        // Update React state
        setToken(data.token);
        setUser(data.user);

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
    } catch (error) {
      console.error(
        "❌ Login error:",
        error
      );

      return {
        success: false,
        error:
          error.message ||
          "Network error",
      };
    }
  };

  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = async (userData) => {
    try {
      const data =
        await api.auth.register(
          userData
        );

      if (
        data?.success &&
        data?.token &&
        data?.user
      ) {
        // Save authentication
        setTokenStorage(data.token);
        setUserStorage(data.user);

        // Update state
        setToken(data.token);
        setUser(data.user);

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
    } catch (error) {
      console.error(
        "❌ Registration error:",
        error
      );

      return {
        success: false,
        error:
          error.message ||
          "Network error",
      };
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = async () => {
    try {
      if (token) {
        await api.auth.logout(token);
      }
    } catch (error) {
      console.error(
        "Logout API error:",
        error
      );
    } finally {
      // Only logout removes the saved session.
      clearAuthData();

      setToken(null);
      setUser(null);

      console.log(
        "👋 Logged out"
      );
    }
  };

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {
    user,
    token,
    loading,

    login,
    register,
    logout,

    isAuthenticated:
      Boolean(token && user),
  };

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
