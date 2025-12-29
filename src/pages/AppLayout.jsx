// src/components/AppLayout.jsx
import React from "react";

const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex justify-center bg-gray-100">
      <div className="w-full max-w-content min-h-screen bg-white">
        {children}
      </div>
    </div>
  );
};

export default AppLayout;
