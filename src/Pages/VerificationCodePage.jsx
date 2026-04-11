import React, { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";
import ProgressBar from "../Components/ProgressBar";
import { VERIFICATION_UI } from "../constants/ui";
import aadhaarService from "../services/aadhaarService"; // ✅ IMPORT SERVICE
import { persistGuestRegister } from "../services/guestService";
import digilockerService from "../services/digilockerService";

const VerificationCodePage = () => {
  const navigate = useNavigate();

  const [code, setCode] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [businessPlan, setBusinessPlan] = useState("");
  const [isUserVerified, setIsUserVerified] = useState(false);

  useEffect(() => {
    console.log("🚀 VerificationCodePage mounted");
    console.log(
      "📦 Session Storage:",
      businessType,
      businessPlan,
      isUserVerified,
    );

    // 🔹 Generate Random Code
    // const randomNumber = Math.floor(100000 + Math.random() * 900000);
    // const formatted = `${randomNumber.toString().slice(0, 3)} ${randomNumber
    //   .toString()
    //   .slice(3)}`;
    // setCode(formatted);
    setCode("123 456");

    // 🔹 Load Business Data
    const typeRaw = sessionStorage.getItem("businessType");
    const planRaw = sessionStorage.getItem("businessPlan");
    const verified = sessionStorage.getItem("isVerifiedUser");

    const type = typeRaw?.trim().toLowerCase();
    const plan = planRaw?.trim().toLowerCase();

    setBusinessType(typeRaw);
    setBusinessPlan(planRaw);
    setIsUserVerified(verified === "true");

    console.log("📦 businessType:", typeRaw);
    console.log("📦 businessPlan:", planRaw);

    const isEligibleType = type === "hospitality" || type === "corporate";

    const isEligiblePlan = plan === "smb" || plan === "enterprise";

    console.log("✅ isEligibleType:", isEligibleType);
    console.log("✅ isEligiblePlan:", isEligiblePlan);

    // 🚨 ONLY RUN FOR Hospitality/Corporate + SMB & Enterprise
    if (!isEligibleType || !isEligiblePlan) {
      console.log("⛔ Aadhaar flow skipped (Plan/Type not eligible)");
      return;
    }

    // 🔹 Prevent Duplicate Persist
    if (sessionStorage.getItem("aadhaarPersisted") === "true") {
      console.log("⚠️ Aadhaar already persisted. Skipping API call.");
      return;
    }

    const digilockerRaw = sessionStorage.getItem("digilockerResponse");

    if (!digilockerRaw) {
      console.warn("❌ digilockerResponse missing in localStorage");
      return;
    }

    let verificationId = null;
    let referenceId = null;

    try {
      const parsed = JSON.parse(digilockerRaw);

      verificationId =
        parsed?.verification_id || parsed?.verificationId || null;

      referenceId =
        parsed?.reference_id || parsed?.referenceId || verificationId;
    } catch (err) {
      console.error("❌ Invalid digilockerResponse JSON:", err);
      return;
    }

    if (!verificationId) {
      console.warn("❌ Verification ID missing");
      return;
    }

    const phoneCode = sessionStorage.getItem("phoneCountryCode") || "+91";
    const phoneNumber = sessionStorage.getItem("phoneNumber");

    if (!phoneNumber) {
      console.warn("❌ phoneNumber missing");
      return;
    }

    const base64ToFile = (base64String, fileName) => {
      try {
        const arr = base64String.split(",");
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";

        const bstr = atob(arr[arr.length - 1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], fileName, { type: mime });
      } catch (err) {
        console.error("❌ Base64 conversion failed:", err);
        return null;
      }
    };

    const fetchAndPersist = async () => {
      try {
        console.log("📡 Calling Aadhaar API...");

        const digilockerResponse = await digilockerService.persistDigilockerIds(
          String(verificationId),
          String(referenceId),
          phoneCode,
          phoneNumber,
        );

        console.log("Digilocker IDS Response", digilockerResponse);

        const aadhaarData = await aadhaarService.getAadhaarData(
          String(verificationId),
          String(referenceId),
          phoneCode,
          phoneNumber,
        );

        console.log("📥 Aadhaar API response:", aadhaarData);

        if (!aadhaarData) {
          console.warn("⚠️ No Aadhaar data received");
          return;
        }

        const country =
          aadhaarData?.split_address?.country ||
          aadhaarData?.splitAddress?.country;

        const aadhaarUpdatePayload = {
          Uid: aadhaarData?.uid || "",
          PhoneCountryCode: phoneCode,
          PhoneNumber: phoneNumber,
          Name: aadhaarData?.name || "",
          Gender: aadhaarData?.gender || "",
          DateOfBirth: aadhaarData?.dob || aadhaarData?.dateOfBirth || "",
          Nationality: country === "India" ? "Indian" : country || "",
          VerificationId: String(verificationId),
          ReferenceId: String(referenceId),

          SplitAddress: {
            Country: aadhaarData?.split_address?.country || null,
            State: aadhaarData?.split_address?.state || null,
            Dist: aadhaarData?.split_address?.dist || null,
            Subdist: aadhaarData?.split_address?.subdist || null,
            Vtc: aadhaarData?.split_address?.vtc || null,
            Po: aadhaarData?.split_address?.po || null,
            Street: aadhaarData?.split_address?.street || null,
            House: aadhaarData?.split_address?.house || null,
            Landmark: aadhaarData?.split_address?.landmark || null,
            Pincode: aadhaarData?.split_address?.pincode || null,
          },
        };

        await aadhaarService.persistAadhaarUpdate(aadhaarUpdatePayload);

        const aadhaarBase64 =
          aadhaarData?.photo_link ||
          aadhaarData?.image ||
          aadhaarData?.profile_image;

        if (
          aadhaarBase64 &&
          (type === "corporate" || type === "hospitality") &&
          plan === "enterprise"
        ) {
          const imageFile = base64ToFile(aadhaarBase64, "aadhaar.jpg");

          if (imageFile) {
            await aadhaarService.persistAadhaarImage(
              phoneCode,
              phoneNumber,
              imageFile,
            );
          }
        }

        await persistGuestRegister(phoneCode, phoneNumber, "identity_verified");

        console.log("✅ Guest verification status updated");

        sessionStorage.setItem("aadhaarData", JSON.stringify(aadhaarData));
        sessionStorage.setItem("aadhaarPersisted", "true");

        console.log("✅ Aadhaar Flow Completed Successfully");
      } catch (error) {
        console.error(
          "❌ Aadhaar flow error:",
          error.response?.data || error.message,
        );
      }
    };

    fetchAndPersist();
  }, []);

  return (
    <div className="w-full h-dvh bg-white flex flex-col px-4 py-5">
      <MobileHeader />
      <ProgressBar />

      <h1 className="text-2xl text-brand mb-2 font-bold">
        {VERIFICATION_UI.TITLE}
      </h1>

      <p className="text-sm text-gray-500 mb-10 leading-[20px]">
        {VERIFICATION_UI.DESCRIPTION}
      </p>

      <div className="flex justify-center mb-12">
        <h2 className="text-4xl font-semibold tracking-widest text-brand">
          {code}
        </h2>
      </div>

      <div className="flex-1" />

      <div className="bg-gray-100 rounded-md p-4 mb-4 flex items-start gap-3">
        <ShieldCheck size={16} className="text-brand mt-1" />
        <p className="text-xs text-gray-500 leading-[20px]">
          {VERIFICATION_UI.FOOTER_TEXT}
        </p>
      </div>

      <button
        onClick={() => navigate("/success")}
        className="w-full h-14 bg-brand text-white rounded-md font-semibold shadow-lg hover:opacity-90 transition"
      >
        {VERIFICATION_UI.DONE_BUTTON}
      </button>
    </div>
  );
};

export default VerificationCodePage;
