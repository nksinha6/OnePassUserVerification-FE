import React, { useEffect, useState } from "react";
import {
  Check,
  X,
  Building2,
  Calendar,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/images/1pass_logo.png";

const VerificationDone = () => {
  const navigate = useNavigate();
  const [businessType, setBusinessType] = useState("Hospitality");

  useEffect(() => {
    const type = sessionStorage.getItem("businessType") || "Hospitality";
    setBusinessType(type);
  }, []);

  return (
    <div className="w-full h-dvh bg-[#F7F7F7] px-4 py-10 flex flex-col items-center">
      {/* Success Card */}
      <div className="w-full bg-white rounded-3xl p-8 shadow-xl shadow-black/5 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => navigate("/history")}
          className="absolute top-6 right-6 text-gray-400 p-2 hover:bg-gray-50 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        {/* Animated Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping"></div>
            <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 animate-pop">
              <Check className="text-white" size={32} />
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#1b3631] mb-3">
            Verification done
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Your identity has been successfully verified. You are now authorized
            for entry.
          </p>
        </div>

        {/* Visit Details */}
        <div className="bg-gray-50 rounded-2xl p-5 space-y-4 border border-gray-100 mb-8 text-left">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
              <Building2 size={20} className="text-[#1b3631]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Location
              </p>
              <p className="text-sm font-bold text-[#1b3631]">
                Microsoft Office, Block A
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
              <Calendar size={20} className="text-[#1b3631]" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Entry Time
              </p>
              <p className="text-sm font-bold text-[#1b3631]">
                Today, 10:30 AM
              </p>
            </div>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={() => navigate("/history")}
          className="w-full h-14 bg-[#1b3631] text-white rounded-xl font-bold hover:opacity-95 transition-all shadow-lg shadow-black/10 flex items-center justify-center gap-2"
        >
          View check-in history
          <ArrowRight size={18} />
        </button>
      </div>

      {/* Footer Logo */}
      <div className="mt-12 opacity-30 grayscale">
        <img src={Logo} alt="1Pass" className="h-6" />
      </div>
    </div>
  );
};

export default VerificationDone;
