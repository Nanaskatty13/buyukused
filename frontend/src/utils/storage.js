// frontend/src/utils/storage.js

const TOKEN_KEY = "authToken";
const USER_KEY = "userData";

// ================================================================
// TOKEN
// ================================================================

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("❌ Could not read auth token:", error);
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (!token) {
      localStorage.removeItem(TOKEN_KEY);
      return;
    }

    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("❌ Could not save auth token:", error);
  }
};

export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("❌ Could not remove auth token:", error);
  }
};

// ================================================================
// USER
// ================================================================

export const getUser = () => {
  try {
    const data = localStorage.getItem(USER_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Invalid stored user data:", error);

    // Remove corrupted data only.
    localStorage.removeItem(USER_KEY);

    return null;
  }
};

export const setUser = (user) => {
  try {
    if (!user) {
      localStorage.removeItem(USER_KEY);
      return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("❌ Could not save user:", error);
  }
};

export const removeUser = () => {
  try {
    localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("❌ Could not remove user:", error);
  }
};

// ================================================================
// CLEAR AUTH
// ================================================================

export const clearAuthData = () => {
  removeToken();
  removeUser();
};

// ================================================================
// AUTH CHECK
// ================================================================

export const isAuthenticated = () => {
  return Boolean(getToken());
};