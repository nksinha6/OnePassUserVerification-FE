import React, { useState, useEffect } from "react";
import {
  Camera,
  Scan,
  EyeOff,
  ShieldAlert,
  ArrowRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";
import ProgressBar from "../Components/ProgressBar";
import aadhaarService from "../services/aadhaarService"; // ✅ IMPORT SERVICE
import { persistGuestRegister } from "../services/guestService";
import digilockerService from "../services/digilockerService";

const FaceMatch = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState("waiting");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setStatus("success");
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const type = sessionStorage.getItem("businessType");
    const plan = sessionStorage.getItem("businessPlan");
    const verified = sessionStorage.getItem("isVerifiedUser") === "true";

    console.log("Verified:", verified);

    const isEligibleType = type === "Corporate" || type === "Hospitality";

    const isEligiblePlan = plan === "SMB" || plan === "Enterprise";

    if (!isEligibleType || !isEligiblePlan) {
      console.log("🚫 Aadhaar + Image API skipped (Not eligible)");
      return;
    }

    // Prevent duplicate persist
    if (sessionStorage.getItem("aadhaarPersisted") === "true") {
      console.log("⚠️ Aadhaar already persisted");
      return;
    }

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

        console.log("📡 Persisting DigiLocker IDs...");

        const digilockerResponse = await digilockerService.persistDigilockerIds(
          String(verificationId),
          String(referenceId),
          phoneCode,
          phoneNumber,
        );

        console.log("📥 DigiLocker API Response:", digilockerResponse);

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

        if (!aadhaarBase64) {
          console.warn("❌ No Aadhaar image found");
          return;
        }

        const formattedBase64 = aadhaarBase64.startsWith("data:image")
          ? aadhaarBase64
          : `data:image/jpeg;base64,${aadhaarBase64}`;

        const imageFile = base64ToFile(formattedBase64, "aadhaar.jpg");

        if (!imageFile) {
          console.warn("❌ Image file conversion failed");
          return;
        }

        const type = sessionStorage.getItem("businessType");
        const plan = sessionStorage.getItem("businessPlan");

        if (
          (type === "Corporate" || type === "Hospitality") &&
          plan === "Enterprise"
        ) {
          await aadhaarService.persistAadhaarImage(
            phoneCode,
            phoneNumber,
            imageFile,
          );

          console.log("✅ Aadhaar Image Persisted");
        } else {
          console.log("🚫 Aadhaar Image API skipped");
        }

        await persistGuestRegister(phoneCode, phoneNumber, "identity_verified");

        console.log("✅ Guest verification status updated");

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

  return (
    <div className="w-full h-dvh bg-white px-4 py-5 flex flex-col overflow-hidden">
      <MobileHeader />
      <ProgressBar />
      <h1 className="text-3xl font-bold text-[#1b3631] mb-4">
        Verify your identity
      </h1>

      <div className="flex-1 overflow-y-auto pr-1">
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          To complete your check-in, your photo will be taken at the reception
          desk. This helps the host organization confirm that you are present in
          person and ensures secure access for everyone.
        </p>

        {/* Capture Status */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-12 h-12 flex items-center justify-center">
              {status === "success" ? (
                <div className="w-10 h-10 bg-[#1b3631] rounded-full flex items-center justify-center">
                  <Check className="text-white" size={20} />
                </div>
              ) : (
                <>
                  <svg className="w-12 h-12 -rotate-90">
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      className="text-gray-200"
                    />
                    <circle
                      cx="24"
                      cy="24"
                      r="20"
                      stroke="currentColor"
                      strokeWidth="3"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 20}
                      strokeDashoffset={2 * Math.PI * 20 * (1 - progress / 100)}
                      className="text-[#1b3631] transition-all duration-300"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-400">
                    {progress}%
                  </div>
                </>
              )}
            </div>

            <span className="text-sm font-bold text-gray-600">
              {status === "success"
                ? "Image captured successfully"
                : "Waiting for image capture..."}
            </span>
          </div>

          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300 bg-[#1b3631]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {/* Instructions */}
        <div className="mb-8">
          <h3 className="text-xs font-bold tracking-wider text-gray-500 mb-4">
            INSTRUCTIONS
          </h3>

          <div className="space-y-4 text-sm text-gray-600">
            <div className="flex items-start gap-3">
              <Scan size={30} className="mt-0.5 text-gray-400" />
              <p>
                Please stand facing the reception camera. Make sure your face is
                clearly visible.
              </p>
            </div>

            <div className="flex items-start gap-3">
              <EyeOff size={30} className="mt-0.5 text-gray-400" />
              <p>
                Remove masks or eyewear if possible. This will only take a
                moment.
              </p>
            </div>
          </div>
        </div>

        {/* Privacy Info */}
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-xs text-gray-500 leading-relaxed mb-6">
          <div className="flex items-start gap-2">
            <ShieldAlert size={16} className="mt-0.5 text-gray-400" />
            <p>
              Your image is used only to verify your identity for this visit. It
              is not used for marketing or profiling. Your data is processed
              securely in line with India’s DPDP Act.
            </p>
          </div>
        </div>
      </div>

      <button
        disabled={status !== "success"}
        onClick={() => navigate("/success")}
        className={`w-full h-14 rounded-[6px] shrink-0  font-bold transition flex items-center justify-center gap-2
          ${
            status === "success"
              ? "bg-[#1b3631] text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
      >
        Continue
        <ArrowRight size={18} />
      </button>
    </div>
  );
};

export default FaceMatch;
