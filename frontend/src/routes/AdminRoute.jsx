import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const AdminRoute = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  // User not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // User is not admin
  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  // Allow admin access
  return <Outlet />;
};

export default AdminRoute;