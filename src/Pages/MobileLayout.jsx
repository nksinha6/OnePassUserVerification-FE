import React from "react";
import { Outlet } from "react-router-dom";
import MobileWrapper from "./MobileWrapper.jsx";

const MobileLayout = () => {
  return (
    <MobileWrapper bg="#EDEDED">
      <Outlet />
    </MobileWrapper>
  );
};

export default MobileLayout;
