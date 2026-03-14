import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/1pass_logo.png";

const MobileHeader = ({ showBack = true, title, rightComponent }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between">
      {/* Left */}
      {showBack ? (
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <ArrowLeft size={20} />
        </button>
      ) : (
        <div className="w-5" />
      )}

      {/* Center */}
      {/* {title ? (
        <h2 className="font-semibold text-gray-800 text-lg h-15">{title}</h2>
      ) : (
        <img src={Logo} alt="1Pass Logo" className="h-15 object-contain" />
      )} */}

      <div className="h-[60px] flex items-center justify-center">
        {title ? (
          <h2 className="font-semibold text-gray-800 text-lg leading-none">
            {title}
          </h2>
        ) : (
          <img src={Logo} alt="1Pass Logo" className="h-full object-contain" />
        )}
      </div>

      {/* Right */}
      {rightComponent ? rightComponent : <div className="w-5" />}
    </div>
  );
};

export default MobileHeader;
