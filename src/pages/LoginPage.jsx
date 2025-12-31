import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import PhoneEntrySection from "@/components/PhoneEntrySection";
import OTPEntrySection from "@/components/OTPEntrySection";
import LoginHeader from "@/components/LoginHeader";
import { sendOtpApi, verifyOtpApi, resendOtpApi } from "@/utility/loginUtils";
import { getGuestByPhone, parsePhoneNumber } from "@/services/guestService";
import { UI_TEXT, ROUTES } from "@/constants/ui";
// Import the API function
import {
  verifyDigilockerAccount,
  createDigilockerUrl,
} from "@/services/digilockerService";

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
  // useEffect(() => {
  //   if (!authLoading && isAuthenticated) {
  //     navigate("/checkins", { replace: true });
  //   }
  // }, [isAuthenticated, authLoading, navigate]);

  // Function to generate random verification ID
  const generateVerificationId = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const handlePhoneSubmit = async (phone) => {
    setPhoneNumber(phone);
    setIsLoading(true);
    setApiError("");

    try {
      // Step 1: Call Digilocker verification API
      const verificationId = generateVerificationId();
      const phoneForApi = phone.replace(/^\+91/, "");

      const digilockerResponse = await verifyDigilockerAccount(
        verificationId,
        phoneForApi
      );

      console.log("Digilocker API Response:", digilockerResponse);

      const ACCOUNT_EXISTS = "ACCOUNT_EXISTS";
      const ACCOUNT_NOT_FOUND = "ACCOUNT_NOT_FOUND";

      let userFlow;
      if (digilockerResponse.status === ACCOUNT_EXISTS) {
        userFlow = "signin";
      } else if (digilockerResponse.status === ACCOUNT_NOT_FOUND) {
        userFlow = "signup";
      } else {
        userFlow = "verify";
      }
      const responseVerificationId =
        digilockerResponse.verification_id || verificationId;

      if (responseVerificationId) {
        sessionStorage.setItem(
          "digilockerVerificationId",
          responseVerificationId
        );
      }

      try {
        const digilockerVerificationId =
          digilockerResponse.verification_id || verificationId;

        const redirectUrl = "";

        const digilockerUrlResponse = await createDigilockerUrl(
          digilockerVerificationId,
          ["AADHAAR"],
          redirectUrl,
          userFlow
        );

        console.log("Digilocker URL Response:", digilockerUrlResponse);

        // Store the Digilocker URL and other data
        const digilockerData = {
          verification_id: digilockerVerificationId,
          userFlow: userFlow,
          phone: phoneForApi,
          status: digilockerResponse.status,
          url: digilockerUrlResponse.url,
          timestamp: new Date().toISOString(),
        };

        if (digilockerUrlResponse.url) {
          digilockerData.digilockerUrl = digilockerUrlResponse.url;
          sessionStorage.setItem(
            "digilockerRedirectUrl",
            digilockerUrlResponse.url
          );
        }

        // Store all data for later use
        sessionStorage.setItem(
          "digilockerSessionData",
          JSON.stringify(digilockerData)
        );
      } catch (digilockerUrlError) {
        console.error("Digilocker URL creation failed:", digilockerUrlError);
        setApiError(
          digilockerUrlError.message ||
            "Failed to create Digilocker sharing URL"
        );
        return;
      }

      // Step 3: Send OTP
      await sendOtpApi(phone);
      setOtpSent(true);
    } catch (error) {
      // Handle errors
      if (error.response?.status === 400) {
        setApiError("Invalid phone number format");
      } else if (error.response?.status === 404) {
        setApiError("Service unavailable. Please try again later.");
      } else if (
        error.message?.includes("Digilocker") ||
        error.message?.includes("verification")
      ) {
        setApiError(error.message || "Digilocker verification failed");
      } else {
        setApiError(error.message || "Failed to send OTP");
      }
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
        console.log("Guest data:", guest);

        // Prepare data for login
        const loginData = {
          phone: phoneNumber,
          guestData: guest || null,
        };

        // Login with guest data
        await login(loginData);

        // Store guest data in session for later use if needed
        if (guest) {
          sessionStorage.setItem("currentGuest", JSON.stringify(guest));
        }

        // Check verification status and redirect accordingly
        if (guest && guest.verificationStatus === "Pending") {
          // Redirect to Digilocker URL stored in session storage
          const digilockerRedirectUrl = sessionStorage.getItem(
            "digilockerRedirectUrl"
          );

          if (digilockerRedirectUrl) {
            console.log("Redirecting to Digilocker for verification");
            // Redirect to Digilocker
            window.location.href = digilockerRedirectUrl;
            return; // Important: return here to prevent further navigation
          } else {
            // Fallback: try to get URL from digilockerSessionData
            const digilockerSessionData = sessionStorage.getItem(
              "digilockerSessionData"
            );
            if (digilockerSessionData) {
              const parsedData = JSON.parse(digilockerSessionData);
              if (parsedData.url || parsedData.digilockerUrl) {
                window.location.href =
                  parsedData.url || parsedData.digilockerUrl;
                return;
              }
            }

            // If no URL found, redirect to checkins as fallback
            console.warn("Digilocker URL not found, redirecting to login");
            navigate(ROUTES.LOGIN, { replace: true });
          }
        } else if (guest && guest.verificationStatus === "Verified") {
          // Verified user - redirect to checkins
          console.log("User is verified, redirecting to checkins");
          navigate(ROUTES.CHECKINS, { replace: true });
        } else {
          // No guest data or unknown status - redirect to checkins
          console.log(
            "No guest data or unknown status, redirecting to checkins"
          );
          navigate(ROUTES.CHECKINS, { replace: true });
        }
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

        // For new users (404), check if we should redirect to Digilocker
        // or to checkins. Based on your flow, redirect to checkins.
        console.log("New user (404), redirecting to checkins");
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
