import React from "react";

const MobileWrapper = ({ children, bg = "#F8FAFC" }) => {
  return (
    <div
      className="min-h-dvh w-full flex items-center justify-center"
      style={{ backgroundColor: bg }}
    >
      {/* Mobile App Container */}
      <div className="h-dvh w-full max-w-md bg-white flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default MobileWrapper;
