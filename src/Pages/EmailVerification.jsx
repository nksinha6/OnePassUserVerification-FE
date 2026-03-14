import React, { useEffect, useState } from "react";
import { Mail } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";
import ProgressBar from "../Components/ProgressBar";
import { EMAIL_VERIFICATION_UI } from "../constants/ui";

const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      sessionStorage.setItem("userEmail", location.state.email);
    } else {
      const storedEmail = sessionStorage.getItem("userEmail");
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }
  }, [location.state]);

  // ✅ Platform Detection
  const getPlatform = () => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;

    if (/android/i.test(userAgent)) return "android";
    if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) return "ios";
    return "other";
  };

  // ✅ Open Mail Inbox (Best Possible per Platform)
  const handleOpenEmailApp = () => {
    const platform = getPlatform();
    let url = "";

    if (platform === "android") {
      // Opens default mail app to inbox
      url =
        "intent:#Intent;action=android.intent.action.MAIN;category=android.intent.category.APP_EMAIL;end";
    } else if (platform === "ios") {
      // Attempts to open Gmail inbox (if installed)
      url = "googlegmail://";
    } else {
      // Desktop fallback (compose window)
      url = "mailto:";
    }

    window.location.href = url;

    // ⏳ Navigate after delay
    setTimeout(() => {
      const businessType = location.state?.businessType;
      const businessPlan = location.state?.businessPlan;

      const isSMBOrEnterprise =
        businessPlan === "SMB" || businessPlan === "Enterprise";

      const shouldGoToIdVerification =
        (businessType === "Corporate" || businessType === "Hospitality") &&
        isSMBOrEnterprise;

      navigate(shouldGoToIdVerification ? "/id-verification" : "/consent", {
        state: {
          email,
          businessType,
          businessPlan,
        },
      });
    }, 3000);
  };

  const handleResend = () => {
    console.log("Resend email logic here");
  };

  return (
    <div className="w-full h-dvh bg-white px-4 py-5 flex flex-col overflow-y-auto">
      <MobileHeader />
      <ProgressBar />

      {/* ICON + TEXT */}
      <div className="flex flex-col items-center text-center mt-10">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Mail size={32} className="text-[#1b3631]" />
        </div>

        <h1 className="text-2xl font-bold text-[#111827] mb-3">
          {EMAIL_VERIFICATION_UI.TITLE}
        </h1>

        <p className="text-sm text-gray-500 leading-[22px] max-w-xs">
          We've sent a verification link to{" "}
          <span className="font-semibold text-[#111827]">{email}</span>. Please
          check your inbox and confirm your email to continue.
        </p>
      </div>

      <div className="flex-1" />

      {/* BUTTON SECTION */}
      <div className="space-y-4 mb-6">
        <button
          onClick={handleOpenEmailApp}
          className="w-full h-14 rounded-[6px] bg-[#1b3631] text-white font-semibold flex items-center justify-center gap-2 shadow-md hover:opacity-95 transition"
        >
          <Mail size={18} />
          {EMAIL_VERIFICATION_UI.PRIMARY_BUTTON}
        </button>

        <button
          onClick={() => navigate("/email")}
          className="w-full text-sm text-gray-600 font-medium"
        >
          {EMAIL_VERIFICATION_UI.CHANGE_EMAIL}
        </button>
      </div>

      {/* RESEND */}
      <p className="text-center text-sm text-gray-500">
        {EMAIL_VERIFICATION_UI.RESEND_TEXT}{" "}
        <button onClick={handleResend} className="font-semibold text-[#1b3631]">
          {EMAIL_VERIFICATION_UI.RESEND_BUTTON}
        </button>
      </p>
    </div>
  );
};

export default EmailVerification;
