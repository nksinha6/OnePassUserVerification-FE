import React, { useEffect, useState } from "react";
import { Check, X, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CHECKIN_SUCCESS_UI } from "../constants/ui";
import aadhaarService from "../services/aadhaarService";
import { persistGuestRegister } from "../services/guestService";

const CheckinSuccess = () => {
  const navigate = useNavigate();

  const [businessType, setBusinessType] = useState("");
  const [businessPlan, setBusinessPlan] = useState("");
  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    const type = sessionStorage.getItem("businessType");
    const plan = sessionStorage.getItem("businessPlan");
    const verified = sessionStorage.getItem("isVerifiedUser");

    setBusinessType(type);
    setBusinessPlan(plan);
    setIsUserVerified(verified === "true");

    console.log(isUserVerified);

    // ✅ 🔥 ELIGIBILITY CHECK (ADD THIS BLOCK)
    const isEligibleType = type === "Corporate" || type === "Hospitality";

    const isEligiblePlan = plan === "SMB" || plan === "Enterprise";

    if (!isEligibleType || !isEligiblePlan) {
      console.log("🚫 Aadhaar + Image API skipped (Not eligible)");
      return; // ⛔ Stop everything here
    }

    if (sessionStorage.getItem("aadhaarPersisted") === "true") return;

    const digilockerRaw = sessionStorage.getItem("digilockerResponse");

    let verificationId = null;
    let referenceId = null;

    if (digilockerRaw) {
      try {
        const parsed = JSON.parse(digilockerRaw);

        verificationId =
          parsed?.verification_id || parsed?.verificationId || null;

        referenceId =
          parsed?.reference_id || parsed?.referenceId || verificationId;
      } catch (err) {
        console.error("Invalid digilockerResponse:", err);
        return;
      }
    }

    const phoneCode = sessionStorage.getItem("phoneCountryCode") || "+91";
    const phoneNumber = sessionStorage.getItem("phoneNumber");

    const base64ToFile = (base64String, fileName) => {
      try {
        if (!base64String) return null;

        const arr = base64String.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";

        const bstr = atob(arr[arr.length - 1]);
        const u8arr = new Uint8Array(bstr.length);

        for (let i = 0; i < bstr.length; i++) {
          u8arr[i] = bstr.charCodeAt(i);
        }

        return new File([u8arr], fileName, { type: mime });
      } catch (err) {
        console.error("Base64 conversion failed:", err);
        return null;
      }
    };

    const fetchAndPersist = async () => {
      try {
        if (!verificationId) {
          console.warn("Verification ID missing");
          return;
        }

        const aadhaarData = await aadhaarService.getAadhaarData(
          String(verificationId),
          String(referenceId),
          phoneCode,
          phoneNumber,
        );

        if (!aadhaarData) return;

        const country =
          aadhaarData?.split_address?.country ||
          aadhaarData?.splitAddress?.country;

        const aadhaarUpdatePayload = {
          Uid: aadhaarData?.uid || "",
          PhoneCountryCode: phoneCode,
          PhoneNumber: phoneNumber,
          Name: aadhaarData?.name || "",
          Gender: aadhaarData?.gender || "",
          DateOfBirth: aadhaarData?.dob || "",
          Nationality: country === "India" ? "Indian" : country || "",
          VerificationId: String(verificationId),
          ReferenceId: String(referenceId),
        };

        await aadhaarService.persistAadhaarUpdate(aadhaarUpdatePayload);

        console.log("✅ Aadhaar Data Persisted");

        // 🔹 Image Persist
        const aadhaarBase64 =
          aadhaarData?.photo_link ||
          aadhaarData?.image ||
          aadhaarData?.profile_image;

        if (aadhaarBase64?.startsWith("data:image")) {
          const imageFile = base64ToFile(aadhaarBase64, "aadhaar.jpg");

          if (imageFile) {
            await aadhaarService.persistAadhaarImage(
              phoneCode,
              phoneNumber,
              imageFile,
            );

            console.log("✅ Aadhaar Image Persisted");
          }
        }

        sessionStorage.setItem("aadhaarPersisted", "true");
        sessionStorage.setItem("aadhaarData", JSON.stringify(aadhaarData));
      } catch (error) {
        console.error(
          "❌ Aadhaar flow error:",
          error.response?.data || error.message,
        );
      }
    };

    fetchAndPersist();
  }, []);

  const handleDoneNavigation = async () => {
    const isCorporateOrHospitality =
      businessType === "Corporate" || businessType === "Hospitality";

    const isStarterPlan = businessPlan === "Starter";

    const alreadyRegistered =
      sessionStorage.getItem("guestRegistered") === "true";

    try {
      // 🚫 Stop API if already registered
      if (alreadyRegistered) {
        console.log("⚠️ Guest already registered. Skipping API call.");
        navigate("/history");
        return;
      }

      // ✅ Call API only for Corporate/Hospitality + Starter
      if (isCorporateOrHospitality && isStarterPlan) {
        const phoneCountryCode =
          sessionStorage.getItem("phoneCountryCode") || "+91";
        const phoneNumber = sessionStorage.getItem("phoneNumber");

        await persistGuestRegister(phoneCountryCode, phoneNumber, "registered");

        // ✅ Mark as registered
        sessionStorage.setItem("guestRegistered", "true");

        navigate("/profile");
      } else {
        navigate("/history");
      }
    } catch (error) {
      console.error("Navigation blocked due to API error:", error);
    }
  };

  return (
    <div className="w-full h-dvh bg-gray-100 flex flex-col items-center justify-center px-4 py-5">
      {/* Card */}
      <div className="w-full bg-white rounded-[6px] p-6 shadow-sm border border-gray-200 relative text-center">
        {/* Close Button */}
        <button
          onClick={() => navigate("/history")}
          className="absolute top-4 right-4 text-gray-400"
        >
          <X size={18} />
        </button>

        {/* 🔥 Animated Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-15 h-15 rounded-full bg-brand/20 animate-ping"></span>

            <div className="w-20 h-20 rounded-full bg-brand flex items-center justify-center shadow-lg animate-pop">
              <Check size={28} className="text-white" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl text-brand mb-3">{CHECKIN_SUCCESS_UI.TITLE}</h1>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 leading-[20px]">
          {CHECKIN_SUCCESS_UI.DESCRIPTION}
        </p>

        {/* Subtext */}
        <p className="text-xs text-gray-400 tracking-wide mb-6 leading-[20px]">
          {CHECKIN_SUCCESS_UI.SUBTEXT}
        </p>

        {/* ✅ Done Button with Conditional Navigation */}
        <button
          onClick={handleDoneNavigation}
          className="w-full h-14 bg-brand text-white rounded-[6px] font-semibold hover:opacity-90 transition"
        >
          {CHECKIN_SUCCESS_UI.DONE_BUTTON}
        </button>
      </div>

      {/* Help Section */}
      <div className="flex items-center gap-2 mt-6 text-gray-400 text-sm">
        <HelpCircle size={14} />
        {CHECKIN_SUCCESS_UI.HELP_TEXT}
      </div>
    </div>
  );
};

export default CheckinSuccess;
