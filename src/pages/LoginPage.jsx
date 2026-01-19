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

  // 🔹 Generate random verification ID
  const generateVerificationId = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  /* ---------------- PHONE SUBMIT ---------------- */
  const handlePhoneSubmit = async (phone) => {
    setPhoneNumber(phone);
    setIsLoading(true);
    setApiError("");

    try {
      const phoneForApi = phone.replace(/^\+91/, "");
      const { countryCode } = parsePhoneNumber(phone);
      const cleanCountryCode = countryCode.replace("+", "");

      // ✅ ONLY SEND OTP HERE
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

  /* ---------------- OTP SUBMIT ---------------- */
  const handleOtpSubmit = async (enteredOtp) => {
    setIsLoading(true);
    setApiError("");

    try {
      const { countryCode, phoneNumber: phoneNo } =
        parsePhoneNumber(phoneNumber);
      const cleanCountryCode = countryCode.replace("+", "");

      const response = await verifyOtpService(
        cleanCountryCode,
        phoneNo,
        enteredOtp
      );

      if (response.verificationStatus === true) {
        const guest = await getGuestByPhone(cleanCountryCode, phoneNo);

        if (!guest) {
          setApiError("No account found. Please complete signup.");
          return;
        }

        if (guest) {
          sessionStorage.setItem("guest", JSON.stringify(guest));
        }

        const guestSelfie = await getGuestSelfieByPhone(
          cleanCountryCode, // "91"
          phoneNo
        );

        if (guestSelfie) {
          sessionStorage.setItem("guestSelfie", JSON.stringify(guestSelfie));
        }

        await login({
          phone: phoneNumber,
          guestData: guest,
        });

        /* 🔹 DIGILOCKER FLOW MOVED HERE */
        if (guest.verificationStatus === "pending") {
          const verificationId = generateVerificationId();

          const digilockerResponse = await verifyDigilockerAccount(
            verificationId,
            phoneNo
          );

          sessionStorage.setItem(
            "digilockerResponse",
            JSON.stringify({
              ...digilockerResponse,
              phoneNumber: phoneNo,
              countryCode: cleanCountryCode,
            })
          );

          let userFlow;
          if (digilockerResponse.status === "ACCOUNT_EXISTS")
            userFlow = "signin";
          if (digilockerResponse.status === "ACCOUNT_NOT_FOUND")
            userFlow = "signup";

          const digilockerVerificationId =
            digilockerResponse.verification_id || verificationId;

          const redirectUrl = `https://authiko.in/user${ROUTES.SELFIE}`;

          const digilockerUrlResponse = await createDigilockerUrl(
            digilockerVerificationId,
            ["AADHAAR"],
            redirectUrl,
            userFlow
          );

          sessionStorage.setItem(
            "digilockerRedirectUrl",
            digilockerUrlResponse.url
          );

          sessionStorage.setItem(
            "digilockerSessionData",
            JSON.stringify({
              verification_id: digilockerVerificationId,
              userFlow,
              phone: phoneNo,
              status: digilockerResponse.status,
              url: digilockerUrlResponse.url,
            })
          );

          // 🔹 REDIRECT TO DIGILOCKER
          window.location.href = digilockerUrlResponse.url;
          return;
        }

        if (guest.verificationStatus === "verified") {
          navigate(ROUTES.USER_DETAILS, { replace: true });
          return;
        }

        setApiError("Unable to proceed. Please contact support.");
      } else {
        setApiError(UI_TEXT.OTP_INVALID_ERROR || "Invalid OTP");
      }
    } catch (error) {
      setApiError(error.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- RESEND OTP ---------------- */
  const handleResendOtp = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setApiError("");

    try {
      const { countryCode, phoneNumber: phoneNo } =
        parsePhoneNumber(phoneNumber);
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
