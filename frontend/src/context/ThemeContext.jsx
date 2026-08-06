// frontend/src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

// Create context
export const ThemeContext = createContext();

// Custom hook to use theme
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Provider component
export const ThemeProvider = ({ children }) => {
  // Load theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('theme');
      return stored || 'light';
    } catch (error) {
      console.warn('Error loading theme from localStorage:', error);
      return 'light';
    }
  });

  // Apply theme class to body and save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('theme', theme);
      // Add/remove class on document.documentElement (or body)
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.warn('Error saving theme to localStorage:', error);
    }
  }, [theme]);

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Set specific theme (e.g., 'dark' or 'light')
  const setThemeValue = useCallback((newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setTheme(newTheme);
    }
  }, []);

  // Memoize value to prevent unnecessary re‑renders
  const value = useMemo(() => ({
    theme,
    toggleTheme,
    setTheme: setThemeValue,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  }), [theme, toggleTheme, setThemeValue]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

// Also export the context itself
export default ThemeContext;