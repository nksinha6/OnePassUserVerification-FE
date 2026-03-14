import React from "react";
import { ShieldCheck, CheckCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";
import { WELCOME_BACK_UI } from "../constants/ui";

const WelcomeBack = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-dvh bg-gray-100 flex flex-col p-3">
      <MobileHeader />

      {/* This wrapper centers the card */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full bg-white rounded-[6px] p-6 shadow-sm border border-gray-200 text-center">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
              <ShieldCheck size={28} className="text-brand" />
            </div>
          </div>

          <h1 className="text-2xl text-brand mb-3">{WELCOME_BACK_UI.TITLE}</h1>

          <p className="text-sm text-gray-600 mb-6 leading-[20px]">
            {WELCOME_BACK_UI.DESCRIPTION}
          </p>

          {/* Guest Card */}
          <div className="bg-gray-50 border border-gray-200 rounded-[6px] p-4 mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center text-xs font-semibold text-orange-600">
                GUEST
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold leading-[20px]">
                  {WELCOME_BACK_UI.GUEST_LABEL}
                </p>
                <p className="text-xs text-gray-500 leading-[20px]">
                  {WELCOME_BACK_UI.GUEST_STATUS}
                </p>
              </div>
            </div>
            <CheckCircle size={18} className="text-green-500" />{" "}
          </div>

          <button
            onClick={() => navigate("/consent")}
            className="w-full h-14 bg-brand text-white rounded-[6px] font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition"
          >
            {WELCOME_BACK_UI.CONTINUE_BUTTON}
            <ArrowRight size={18} />
          </button>

          <p className="text-sm text-gray-400 mt-6 leading-[20px]">
            {WELCOME_BACK_UI.FOOTER_TEXT}
          </p>
        </div>
      </div>
    </div>
  );
};

export default WelcomeBack;
