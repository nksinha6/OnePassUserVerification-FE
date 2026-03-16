import React from "react";
import { Navigate, Outlet } from "react-router-dom";

const ParamGuard = () => {
  const guestNumber = sessionStorage.getItem("guestNumber");
  const restaurantId = sessionStorage.getItem("restaurantId");

  if (!guestNumber || !restaurantId) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ParamGuard;
