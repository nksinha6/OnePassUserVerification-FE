import React, { useState, useEffect } from "react";
import MobileHeader from "../Components/MobileHeader";
import ProgressBar from "../Components/ProgressBar";
import { EMAIL_CAPTURE_UI } from "../constants/ui";
import { ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateGuestEmail, getGuestByPhone } from "../services/guestService"; // ✅ adjust path

const EmailCapture = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [businessType, setBusinessType] = useState("Hospitality");
  const [businessPlan, setBusinessPlan] = useState("Starter");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ Get phone number from Home page
  const fullPhoneNumber =
    location.state?.phoneNumber || sessionStorage.getItem("visitorPhone");
  console.log(fullPhoneNumber);

  // ✅ Split country code + phone number
  const extractPhoneData = (phone) => {
    if (!phone) return {};

    const cleaned = phone.replace("+", "");

    // Example: +919876543210
    const phoneCountryCode = cleaned.slice(0, 2); // adjust if needed
    const phoneNumber = cleaned.slice(2);

    return { phoneCountryCode, phoneNumber };
  };

  useEffect(() => {
    const type = sessionStorage.getItem("businessType") || "Hospitality";
    const plan = sessionStorage.getItem("businessPlan") || "Starter";

    setBusinessType(type);
    setBusinessPlan(plan);
  }, []);

  useEffect(() => {
    const fetchGuestData = async () => {
      if (!fullPhoneNumber) return;

      const { phoneCountryCode, phoneNumber } = extractPhoneData(fullPhoneNumber);
      
      if (phoneCountryCode && phoneNumber) {
        try {
          const guest = await getGuestByPhone(phoneCountryCode, phoneNumber);
          if (guest) {
            console.log("Guest data fetched:", guest);
            // Optionally auto-fill the email if it exists
            if (guest.emailId) setEmail(guest.emailId);
            else if (guest.email) setEmail(guest.email);
          }
        } catch (error) {
          console.error("Error calling getGuestByPhone:", error);
        }
      }
    };

    fetchGuestData();
  }, [fullPhoneNumber]);

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isSMBOrEnterprise =
    businessPlan === "SMB" || businessPlan === "Enterprise";

  const shouldShowIdVerification =
    (businessType === "Corporate" || businessType === "Hospitality") &&
    isSMBOrEnterprise;

  const shouldShowCorporatePrivacy =
    businessType === "Corporate" && businessPlan === "Starter";

  const isFormValid = isValidEmail;

  const handleContinue = async () => {
    if (!isFormValid || !fullPhoneNumber) return;

    try {
      setIsLoading(true);

      const { phoneCountryCode, phoneNumber } =
        extractPhoneData(fullPhoneNumber);

      // ✅ Call API
      await updateGuestEmail(phoneCountryCode, phoneNumber, email);

      // Save email locally
      sessionStorage.setItem("visitorEmail", email);
      sessionStorage.setItem("phoneCountryCode", phoneCountryCode);
      sessionStorage.setItem("phoneNumber", phoneNumber);

      const nextRoute = shouldShowIdVerification
        ? "/id-verification"
        : "/consent";

      // ✅ Navigate after success
      navigate(nextRoute, {
        state: {
          email,
          businessType,
          businessPlan,
          phoneNumber: fullPhoneNumber,
        },
      });
    } catch (error) {
      console.error("Email update failed:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-dvh bg-white shadow-xl px-4 py-5 flex flex-col overflow-y-auto">
      <MobileHeader />
      <ProgressBar />

      <h1 className="mb-3 text-3xl font-bold text-[#1b3631]">
        {EMAIL_CAPTURE_UI.TITLE}
      </h1>

      <p className="text-gray-500 text-sm mb-6 leading-[20px]">
        {EMAIL_CAPTURE_UI.DESCRIPTION}
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#1b3631] tracking-wide mb-2">
            {businessType === "Corporate"
              ? "Email address"
              : EMAIL_CAPTURE_UI.EMAIL_LABEL}
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              businessType === "Corporate"
                ? "name@email.com"
                : EMAIL_CAPTURE_UI.EMAIL_PLACEHOLDER
            }
            autoComplete="off"
            className={`w-full bg-white text-sm h-12 rounded-[6px] border px-4 transition
              outline-none focus:outline-none focus:ring-0 focus:border-gray-300
              ${
                email.length > 0
                  ? isValidEmail
                    ? "border-gray-200"
                    : "border-red-400"
                  : "border-gray-200"
              }
            `}
          />
        </div>
      </div>

      <div className="flex-1" />

      <div className="mt-8">
        <div
          className={`p-4 rounded-lg flex items-start gap-4 mb-8 ${
            shouldShowCorporatePrivacy
              ? "bg-gray-50 border border-gray-100"
              : ""
          }`}
        >
          <ShieldCheck
            size={20}
            className={`${
              shouldShowCorporatePrivacy ? "text-[#1b3631]" : "text-gray-400"
            } mt-1 shrink-0`}
          />
          <p className="text-[10px] leading-relaxed uppercase tracking-wider font-bold text-gray-400">
            Your data is processed securely and encrypted.
          </p>
        </div>

        <button
          disabled={!isFormValid || isLoading}
          onClick={handleContinue}
          className={`w-full h-14 rounded-[8px] font-bold transition flex items-center justify-center
            ${
              isFormValid
                ? "bg-[#1b3631] text-white hover:opacity-95 shadow-lg shadow-black/10"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }
          `}
        >
          {isLoading ? "Updating..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default EmailCapture;
