import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import PhoneEntrySection from "../components/PhoneEntrySection";
import OTPEntrySection from "../components/OTPEntrySection";
import LoginHeader from "../components/LoginHeader";
import { sendOtpApi, verifyOtpApi, resendOtpApi } from "../utility/loginUtils";
import { UI_TEXT } from "../constants/ui";

// Import your logo image
import LogoImage from "../assets/images/1pass_logo.jpg";

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
        await login(phoneNumber);
        navigate("/checkins", { replace: true });
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
