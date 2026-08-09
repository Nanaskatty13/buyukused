const TOKEN_KEY = "authToken";
const USER_KEY = "userData";

// ================================================================
// TOKEN
// ================================================================

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  if (token) {
    localStorage.setItem(
      TOKEN_KEY,
      token
    );
  }
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

// ================================================================
// USER
// ================================================================

export const getUser = () => {
  try {
    const data =
      localStorage.getItem(USER_KEY);

    if (!data) {
      return null;
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(
      "Invalid saved user data:",
      error
    );

    localStorage.removeItem(
      USER_KEY
    );

    return null;
  }
};

export const setUser = (user) => {
  if (user) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(user)
    );
  }
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
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
  return !!getToken();
};