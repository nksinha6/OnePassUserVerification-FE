import React from "react";
import { Building2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";
import { HISTORY_UI } from "../constants/ui";
import Logo from "../assets/images/1pass_logo.png";

const CheckinHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-dvh bg-white px-4 py-5 flex flex-col overflow-y-auto">
      <MobileHeader
        showBack={false}
        rightComponent={
          <div
            onClick={() => navigate("/profile")}
            className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 active:scale-95 transition-all"
          >
            <User size={20} className="text-gray-600" />
          </div>
        }
      />

      {/* Title */}
      <h1 className="text-2xl text-brand mb-2">{HISTORY_UI.TITLE}</h1>

      {/* Description */}
      <p className="text-sm text-gray-500 mb-6 leading-[20px]">
        {HISTORY_UI.DESCRIPTION}
      </p>

      {/* History List */}
      <div className="space-y-4">
        {HISTORY_UI.ITEMS.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between border-b border-gray-100 pb-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <Building2 size={18} className="text-brand" />
              </div>

              <div>
                <h4 className="text-sm font-semibold">{item.location}</h4>
                <p className="text-xs text-gray-500 leading-[20px]">
                  {item.date}
                </p>
              </div>
            </div>

            {/* Status Badge */}
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full bg-green-100 text-green-600">
              {item.status}
            </span>
          </div>
        ))}
      </div>

      <div className="flex-1" />

      {/* Done Button
      <button
        onClick={() => navigate("/")}
        className="w-full h-14 bg-brand text-white rounded-[6px] font-semibold hover:opacity-90 transition mt-6"
      >
        {HISTORY_UI.DONE_BUTTON}
      </button> */}
    </div>
  );
};

export default CheckinHistory;
