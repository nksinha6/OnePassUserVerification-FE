// src/pages/LoginPage.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PhoneEntrySection from "@/components/PhoneEntrySection";
import OTPEntrySection from "@/components/OTPEntrySection";
import LoginHeader from "@/components/LoginHeader";
import {
  getGuestByPhone,
  parsePhoneNumber,
  getGuestSelfieByPhone,
} from "@/services/guestService";
import { UI_TEXT, ROUTES } from "@/constants/ui";
import {
  verifyDigilockerAccount,
  createDigilockerUrl,
} from "@/services/digilockerService";
import { loginService, verifyOtpService } from "@/services/authService";
import LogoImage from "@/assets/images/1pass_logo.jpg";

const LoginPage = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  // Generate proper UUID format verification ID
  const generateVerificationId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  // Handle phone number submission
  const handlePhoneSubmit = async (phone) => {
    setPhoneNumber(phone);
    setIsLoading(true);
    setApiError("");

    try {
      const phoneForApi = phone.replace(/^\+91/, "");
      const { countryCode } = parsePhoneNumber(phone);
      const cleanCountryCode = countryCode.replace("+", "");

      await loginService(cleanCountryCode, phoneForApi);
      setOtpSent(true);
    } catch (error) {
      setApiError(error.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPhone = () => {
    setOtpSent(false);
    setApiError("");
  };

  // Handle OTP submission - FIXED VERSION
  const handleOtpSubmit = async (enteredOtp) => {
    setIsLoading(true);
    setApiError("");

    try {
      const { countryCode, phoneNumber: phoneNo } = parsePhoneNumber(phoneNumber);
      const cleanCountryCode = countryCode.replace("+", "");

      // Verify OTP
      const response = await verifyOtpService(cleanCountryCode, phoneNo, enteredOtp);

      if (response.verificationStatus === true) {
        // Get guest data
        const guest = await getGuestByPhone(cleanCountryCode, phoneNo);

        if (!guest) {
          setApiError("No account found. Please complete signup.");
          return;
        }

        // Store guest data
        sessionStorage.setItem("guest", JSON.stringify(guest));

        // Get guest selfie if exists
        const guestSelfie = await getGuestSelfieByPhone(cleanCountryCode, phoneNo);
        if (guestSelfie) {
          sessionStorage.setItem("guestSelfie", JSON.stringify(guestSelfie));
        }

        // Login user
        await login({
          phone: phoneNumber,
          guestData: guest,
        });

        // Check verification status
        if (guest.verificationStatus === "pending") {
          console.log("🚀 Starting DigiLocker flow for pending verification...");

          // Generate verification ID
          const verificationId = generateVerificationId();
          console.log("📝 Generated Verification ID:", verificationId);

          try {
            // Step 1: Verify DigiLocker account
            const digilockerResponse = await verifyDigilockerAccount(verificationId, phoneNo);
            console.log("✅ DigiLocker verification response:", digilockerResponse);

            // Determine user flow based on status
            let userFlow = "signin";
            if (digilockerResponse.status === "ACCOUNT_EXISTS") userFlow = "signin";
            if (digilockerResponse.status === "ACCOUNT_NOT_FOUND") userFlow = "signup";

            // Get verification ID from response or use generated one
            const finalVerificationId = digilockerResponse.verification_id || verificationId;

            // Store in session
            sessionStorage.setItem("digilockerResponse", JSON.stringify({
              ...digilockerResponse,
              phoneNumber: phoneNo,
              countryCode: cleanCountryCode,
              verificationId_initial: verificationId,
              finalVerificationId: finalVerificationId,
              userFlow: userFlow
            }));

            // Step 2: Create DigiLocker URL
            console.log("🔗 Creating DigiLocker URL...");

            // Use current origin for redirect URL
            const baseUrl = window.location.origin;
            const redirectUrl = `${baseUrl}${ROUTES.CHECKIN_STATUS}`;

            console.log("📍 Redirect URL:", redirectUrl);
            console.log("👤 User Flow:", userFlow);
            console.log("🆔 Final Verification ID:", finalVerificationId);

            const digilockerUrlResponse = await createDigilockerUrl(
              finalVerificationId,
              ["AADHAAR"],
              redirectUrl,
              userFlow
            );

            console.log("✅ DigiLocker URL response:", digilockerUrlResponse);

            if (!digilockerUrlResponse || !digilockerUrlResponse.url) {
              throw new Error("No URL received from DigiLocker service");
            }

            // Store session data
            sessionStorage.setItem("digilockerRedirectUrl", digilockerUrlResponse.url);
            sessionStorage.setItem("digilockerSessionData", JSON.stringify({
              verification_id: finalVerificationId,
              userFlow,
              phone: phoneNo,
              status: digilockerResponse.status,
              url: digilockerUrlResponse.url,
            }));

            // Redirect to DigiLocker
            console.log("🔄 Redirecting to DigiLocker:", digilockerUrlResponse.url);
            window.location.href = digilockerUrlResponse.url;
            return;

          } catch (digiError) {
            console.error("❌ DigiLocker flow error:", digiError);
            setApiError(`DigiLocker setup failed: ${digiError.message}`);
            return;
          }
        }

        // If already verified, go to user details
        if (guest.verificationStatus === "verified") {
          navigate(ROUTES.USER_DETAILS, { replace: true });
          return;
        }

        setApiError("Unable to proceed. Please contact support.");
      } else {
        setApiError(UI_TEXT.OTP_INVALID_ERROR || "Invalid OTP");
      }
    } catch (error) {
      console.error("❌ OTP verification error:", error);
      setApiError(error.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOtp = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setApiError("");

    try {
      const { countryCode, phoneNumber: phoneNo } = parsePhoneNumber(phoneNumber);
      const cleanCountryCode = countryCode.replace("+", "");

      await loginService(cleanCountryCode, phoneNo);
    } catch (error) {
      setApiError(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    console.log("Navigate to signup page");
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="min-h-screen bg-white border border-gray-200 flex flex-col">
        <div className="m-3 border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1">
          <LoginHeader logo={LogoImage} onSignUp={handleSignUp} />

          <main className="p-6 flex flex-col flex-1">
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{apiError}</p>
                <button
                  onClick={() => setApiError("")}
                  className="text-xs text-red-500 underline mt-1"
                >
                  Clear Error
                </button>
              </div>
            )}

            {!otpSent ? (
              <PhoneEntrySection
                initialPhone={phoneNumber}
                onSubmit={handlePhoneSubmit}
                isLoading={isLoading}
                apiError={apiError}
              />
            ) : (
              <OTPEntrySection
                phoneNumber={phoneNumber}
                onEditPhone={handleEditPhone}
                onVerify={handleOtpSubmit}
                onResend={handleResendOtp}
                isLoading={isLoading}
                apiError={apiError}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;