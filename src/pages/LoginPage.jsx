import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PhoneEntrySection from "@/components/PhoneEntrySection";
import OTPEntrySection from "@/components/OTPEntrySection";
import LoginHeader from "@/components/LoginHeader";
import { sendOtpApi, verifyOtpApi, resendOtpApi } from "@/utility/loginUtils";
import { getGuestByPhone, parsePhoneNumber } from "@/services/guestService";
import { UI_TEXT, ROUTES } from "@/constants/ui";

// Import your logo image
import LogoImage from "@/assets/images/1pass_logo.jpg";

const LoginPage = () => {
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { isAuthenticated, login, isLoading: authLoading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate("/checkins", { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handlePhoneSubmit = async (phone) => {
    setPhoneNumber(phone);
    setIsLoading(true);
    setApiError("");

    try {
      await sendOtpApi(phone);
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

  const handleOtpSubmit = async (enteredOtp) => {
    setIsLoading(true);
    setApiError("");

    try {
      const response = await verifyOtpApi(phoneNumber, enteredOtp);

      if (response.success) {
        // After OTP verification, fetch guest information
        const { countryCode, phoneNumber: phoneNo } =
          parsePhoneNumber(phoneNumber);
        const guest = await getGuestByPhone(countryCode, phoneNo);
        console.log(guest);

        // Prepare data for login
        const loginData = {
          phone: phoneNumber,
          guestData: guest || null, // Include guest data if available
        };

        // Login with guest data
        await login(loginData);

        // Store guest data in session for later use if needed
        if (guest) {
          sessionStorage.setItem("currentGuest", JSON.stringify(guest));
        }

        navigate(ROUTES.CHECKINS, { replace: true });
      } else {
        setApiError(
          response.message || UI_TEXT.OTP_INVALID_ERROR || "Invalid OTP"
        );
      }
    } catch (error) {
      console.error("Login failed:", error);

      if (error.message.includes("full")) {
        setApiError("Browser storage is full. Please clear cache.");
      } else if (error.message.includes("valid")) {
        setApiError("Invalid phone number format");
      } else if (error.response?.status === 404) {
        // Guest not found - this is okay, it might be a new user
        // Proceed with login anyway
        const loginData = {
          phone: phoneNumber,
          guestData: null,
        };
        await login(loginData);
        navigate(ROUTES.CHECKINS, { replace: true });
      } else {
        setApiError(error.message || "Login failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isLoading) return;

    setIsLoading(true);
    setApiError("");
    try {
      await resendOtpApi(phoneNumber);
    } catch (error) {
      setApiError(error.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = () => {
    console.log("Navigate to signup page");
    // navigate("/signup");
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
