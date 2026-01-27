import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/constants/ui";
import {
  getAadhaarData,
  persistAadhaarUpdate,
} from "@/services/aadhaarService";
import { storeVerificationData } from "@/services/verificationService";

const VerificationCallbackPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsLoading(true);
        console.log("📍 Verification callback received");

        // Get URL parameters
        const queryParams = new URLSearchParams(window.location.search);
        const vIdFromUrl = queryParams.get("verification_id");
        const rIdFromUrl = queryParams.get("reference_id") || queryParams.get("referenceId");

        console.log("📊 URL Params:", { vIdFromUrl, rIdFromUrl });

        // Get DigiLocker session data
        const digilockerSessionData = JSON.parse(
          sessionStorage.getItem("digilockerSessionData") || "{}"
        );
        const digilockerResponse = JSON.parse(
          sessionStorage.getItem("digilockerResponse") || "{}"
        );

        console.log("📦 DigiLocker Session Data:", digilockerSessionData);

        const verificationId = vIdFromUrl || digilockerSessionData?.verification_id;
        const referenceId = rIdFromUrl || digilockerSessionData?.reference_id;
        const phoneNumber = digilockerSessionData?.phone;
        const email = digilockerSessionData?.email;
        const phoneCode = "91";

        if (!verificationId || !referenceId || !phoneNumber) {
          throw new Error("Missing required parameters for verification");
        }

        console.log("🔄 Fetching Aadhaar data...");

        // Fetch Aadhaar data
        const aadhaarData = await getAadhaarData(
          verificationId,
          referenceId,
          phoneCode,
          phoneNumber
        );

        console.log("✅ Aadhaar data fetched:", aadhaarData);

        if (!aadhaarData) {
          throw new Error("Failed to fetch Aadhaar data");
        }

        // Build complete Aadhaar update payload
        const country = aadhaarData?.split_address?.country;
        const aadhaarUpdatePayload = {
          uid: aadhaarData?.uid || "",
          phoneCountryCode: phoneCode,
          phoneNumber: phoneNumber,
          name: aadhaarData?.name || "",
          gender: aadhaarData?.gender || "",
          dateOfBirth: aadhaarData?.dob || "",
          nationality: country === "India" ? "Indian" : (country || ""),
          splitAddress: {
            country: aadhaarData?.split_address?.country || null,
            state: aadhaarData?.split_address?.state || null,
            dist: aadhaarData?.split_address?.dist || null,
            subdist: aadhaarData?.split_address?.subdist || null,
            vtc: aadhaarData?.split_address?.vtc || null,
            po: aadhaarData?.split_address?.po || null,
            street: aadhaarData?.split_address?.street || null,
            house: aadhaarData?.split_address?.house || null,
            landmark: aadhaarData?.split_address?.landmark || null,
            pincode: aadhaarData?.split_address?.pincode || null,
          },
        };

        console.log("📤 Updating Aadhaar data...");

        // Update Aadhaar data
        const aadhaarVerifyResponse = await persistAadhaarUpdate(
          aadhaarUpdatePayload
        );

        console.log("✅ Aadhaar data updated successfully");

        // Store verification data for this phone number
        storeVerificationData(phoneNumber, aadhaarUpdatePayload);

        // Store in session for display
        sessionStorage.setItem(
          "verifiedAadhaarData",
          JSON.stringify(aadhaarUpdatePayload)
        );
        sessionStorage.setItem(
          "aadhaarVerified",
          JSON.stringify(aadhaarVerifyResponse)
        );
        sessionStorage.setItem("userEmail", email);

        console.log("✅ Verification complete, redirecting to checkins...");

        // Navigate to checkins page
        navigate(ROUTES.CHECKINS, { replace: true });

      } catch (error) {
        console.error("❌ Verification callback error:", error);
        setError(error.message || "Verification failed. Please try again.");
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <div className="animate-spin text-2xl">⏳</div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Verification</h2>
          <p className="text-gray-600">Please wait while we finalize your identity verification...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <span className="text-2xl">❌</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = ROUTES.LOGIN}
            className="px-6 py-3 bg-brand text-white rounded-lg font-semibold"
          >
            Go Back to Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default VerificationCallbackPage;
