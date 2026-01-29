// src/pages/VerificationFlow.js
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Mail,
  Lock,
  Shield,
  Clock,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";
import { ROUTES } from "@/constants/ui";
import {
  verifyDigilockerAccount,
  createDigilockerUrl,
} from "@/services/digilockerService";
import { getGuestByPhone } from "@/services/guestService";

import LoginHeader from "@/components/LoginHeader";
import LogoImage from "@/assets/images/1pass_logo.jpg";

const VerificationFlow = () => {
  const { mobile, propertyId } = useParams(); // Changed from mobileId to mobile
  const location = useLocation();

  // Check if we're on the base login page or login with parameters
  const isBaseLoginPage =
    location.pathname === "/login" || location.pathname === ROUTES.LOGIN;
  const hasUrlParams = mobile && propertyId;

  const [emailLocked, setEmailLocked] = useState(false);

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [manualMobile, setManualMobile] = useState("");
  const [countryCode, setCountryCode] = useState("91");
  const [emailError, setEmailError] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [propertyInfo, setPropertyInfo] = useState({ name: "" });
  const [loading, setLoading] = useState(false);

  // Generate proper UUID format verification ID
  const generateVerificationId = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  };

  // Format mobile number for display
  const formatMobile = (num) => {
    if (!num) return "[Mobile Number]";
    const cleanNum = num.replace(/-/g, "");
    if (cleanNum.length === 12) {
      return `+${cleanNum.slice(0, 2)} ${cleanNum.slice(2, 7)} ${cleanNum.slice(7)}`;
    }
    return `+${num}`;
  };

  useEffect(() => {
    const fetchGuestIfExists = async () => {
      if (!hasUrlParams) return;

      try {
        const { country, number } = getPhoneNumber();

        const guest = await getGuestByPhone(country, number);
        console.log(guest);

        if (guest && guest.email) {
          setEmail(guest.email); // 🔥 auto-fill email
          setEmailLocked(true);

          // Lock only if already verified
          if (guest.verificationStatus === "verified") {
            setEmailLocked(true);
          }
        }
      } catch (err) {
        console.error("Guest lookup failed:", err);
      }
    };

    fetchGuestIfExists();
  }, [hasUrlParams]);

  // Get phone number based on URL or manual input
  const getPhoneNumber = () => {
    if (hasUrlParams) {
      // Mobile from URL: format like "91-9106471172"
      const parts = mobile.split("-");
      if (parts.length === 2) {
        return { country: parts[0], number: parts[1] };
      }
      return { country: "91", number: mobile };
    }
    return {
      country: countryCode,
      number: manualMobile.slice(countryCode.length),
    };
  };

  // Display mobile number for info card
  const getDisplayMobile = () => {
    if (hasUrlParams) {
      return formatMobile(mobile);
    }
    return manualMobile ? `+${manualMobile}` : "[Mobile Number]";
  };

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        if (propertyId) {
          const response = await apiClient.get(API_ENDPOINTS.PROPERTY_BY_ID, {
            params: { propertyId },
          });
          if (response.data && response.data.name) {
            setPropertyInfo(response.data);
          } else {
            setPropertyInfo({ name: "" });
          }
        } else {
          setPropertyInfo({ name: "" });
        }
      } catch (error) {
        console.error("Error fetching property:", error);
        setPropertyInfo({ name: "" });
      }
    };

    fetchProperty();
  }, [propertyId]);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      valid = false;
    }

    // Only validate mobile if it's base login page (no URL parameters)
    if (
      isBaseLoginPage &&
      !hasUrlParams &&
      (!manualMobile || manualMobile.length < 10)
    ) {
      setMobileError("Please enter a valid mobile number");
      valid = false;
    }

    if (!valid) return;

    setLoading(true);
    const { country, number } = getPhoneNumber();

    try {
      // 1. Update Email/Phone persist
      if (!emailLocked) {
        await apiClient.put(API_ENDPOINTS.UPDATE_EMAIL, {
          phoneCountryCode: country,
          phoneNumber: number,
          emailAddress: email,
        });
      }

      // Update session storage
      sessionStorage.setItem(
        "guest",
        JSON.stringify({
          phoneNumber: number,
          countryCode: country,
          email: email,
        }),
      );

      // 2. Prepare DigiLocker Account
      const verificationId = generateVerificationId();
      console.log("Generated verificationId:", verificationId);

      const digilockerResponse = await verifyDigilockerAccount(
        verificationId,
        number,
      );

      console.log("DigiLocker response:", digilockerResponse);

      sessionStorage.setItem(
        "digilockerResponse",
        JSON.stringify({
          ...digilockerResponse,
          phoneNumber: number,
          countryCode: country,
          verificationId_initial: verificationId,
        }),
      );

      setEmailError("");
      setMobileError("");
      setStep(2);
    } catch (error) {
      console.error("Error in flow initiation:", error);
      setEmailError(`Failed to initiate verification: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const startDigilockerFlow = async () => {
    setLoading(true);
    try {
      const digilockerRes = JSON.parse(
        sessionStorage.getItem("digilockerResponse"),
      );
      if (!digilockerRes) throw new Error("Verification data missing");

      const { countryCode, phoneNumber } = digilockerRes;

      // Use verification_id from response OR the initial one
      const digilockerVerificationId =
        digilockerRes.verification_id || digilockerRes.verificationId_initial;

      let userFlow;
      if (digilockerRes.status === "ACCOUNT_EXISTS") userFlow = "signin";
      if (digilockerRes.status === "ACCOUNT_NOT_FOUND") userFlow = "signup";
      if (!userFlow) userFlow = "signin"; // Fallback

      // Use dynamic origin for redirect URL
      const base = import.meta.env.BASE_URL.replace(/\/$/, ""); // remove trailing slash
      // const redirectUrl = `${window.location.origin}${base}${ROUTES.CHECKIN_STATUS}`;
      const redirectUrl = "";

      console.log("Starting DigiLocker flow:", {
        verificationId: digilockerVerificationId,
        redirectUrl,
        userFlow,
      });

      const digilockerUrlResponse = await createDigilockerUrl(
        digilockerVerificationId,
        ["AADHAAR"],
        redirectUrl,
        userFlow,
      );

      console.log("DigiLocker URL response:", digilockerUrlResponse);

      if (!digilockerUrlResponse.url) {
        throw new Error("No URL received from DigiLocker");
      }

      // Store redirect for session consistency
      sessionStorage.setItem(
        "digilockerRedirectUrl",
        digilockerUrlResponse.url,
      );
      sessionStorage.setItem(
        "digilockerSessionData",
        JSON.stringify({
          verification_id: digilockerVerificationId,
          userFlow,
          phone: phoneNumber,
          status: digilockerRes.status,
          url: digilockerUrlResponse.url,
        }),
      );

      // Redirect to DigiLocker
      window.location.href = digilockerUrlResponse.url;
    } catch (error) {
      console.error("Error starting DigiLocker:", error);
      alert(`Failed to start DigiLocker: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Main render function
  const renderContent = () => {
    return (
      <div className="w-full mx-auto">
        <div className="min-h-screen bg-white border border-gray-200 flex flex-col">
          <div className="m-3 border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1">
            {/* Header */}
            <LoginHeader logo={LogoImage} title="Verify Identity" />

            <main className="p-6 flex flex-col flex-1">
              {step === 1 ? renderStep1() : renderStep2()}
            </main>
          </div>
        </div>
      </div>
    );
  };

  const renderStep1 = () => {
    const displayMobileNumber = getDisplayMobile();

    return (
      <div className="flex flex-col items-center w-full">
        {/* Stepper */}
        <div className="w-full mb-6">
          <div className="flex items-start justify-between">
            {/* STEP 1 */}
            <div className="flex flex-col items-center w-24 text-center">
              <div className="w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center mb-2">
                <span className="text-white font-semibold text-sm">1</span>
              </div>
              <span className="text-sm font-semibold text-yellow-600 leading-tight">
                ENTER
                <br />
                EMAIL
              </span>
            </div>

            {/* LINE */}
            <div className="flex-1 h-0.5 bg-gray-200 mt-4 mx-2"></div>

            {/* STEP 2 */}
            <div className="flex flex-col items-center w-24 text-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <span className="text-gray-500 font-semibold text-sm">2</span>
              </div>
              <span className="text-sm font-semibold text-gray-400 leading-tight">
                ID
                <br />
                VERIFICATION
              </span>
            </div>

            {/* LINE */}
            <div className="flex-1 h-0.5 bg-gray-200 mt-4 mx-2"></div>

            {/* STEP 3 */}
            <div className="flex flex-col items-center w-24 text-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mb-2">
                <span className="text-gray-500 font-semibold text-sm">3</span>
              </div>
              <span className="text-sm font-semibold text-gray-400 leading-tight">
                COMPLETE
                <br />
                VERIFICATION
              </span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-5 text-center w-full">
          Verify Identity
        </h2>

        {/* Info Cards */}
        <div className="w-full space-y-5 mb-5">
          <div className="flex items-start">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shrink-0 border border-gray-200">
              <span className="text-xl">📧</span>
            </div>
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Enter your email to continue secure check-in{" "}
                {propertyInfo.name ? (
                  <span>
                    at{" "}
                    <span className="font-semibold text-gray-900">
                      {propertyInfo.name}
                    </span>
                  </span>
                ) : (
                  ""
                )}
                .
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shrink-0 border border-gray-200">
              <span className="text-xl">🛡️</span>
            </div>
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Your identity will be verified via DigiLocker using{" "}
                <span className="font-semibold text-gray-900">
                  {displayMobileNumber}
                </span>
                .
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-4 shrink-0 border border-gray-200">
              <span className="text-xl">⏰</span>
            </div>
            <div>
              <p className="text-gray-700 text-sm leading-relaxed">
                Your data will be stored for 1 year, as required by local law.
              </p>
            </div>
          </div>
        </div>

        {/* Phone Input (Only for base login page without URL parameters) */}
        {isBaseLoginPage && !hasUrlParams && (
          <div className="w-full mb-6">
            <div className="relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  ></path>
                </svg>
              </div>
              <PhoneInput
                country={"in"}
                value={manualMobile}
                onChange={(phone, country) => {
                  setManualMobile(phone);
                  setCountryCode(country.dialCode);
                  if (mobileError) setMobileError("");
                }}
                containerClass="react-tel-input"
                inputClass="form-control !w-full !h-16 !pl-14 !pr-4 !rounded-2xl !border-2 !border-gray-200 !focus:outline-none !focus:border-blue-500 !bg-white !text-gray-900 !text-lg"
                buttonClass="!border-none !bg-transparent !rounded-l-xl"
                placeholder="Mobile Number"
                inputProps={{
                  name: "phone",
                  required: true,
                }}
              />
            </div>
            {mobileError && (
              <p className="text-red-500 text-xs mt-2 ml-4">{mobileError}</p>
            )}
          </div>
        )}

        {/* Email Input */}
        <div className="w-full mb-1">
          <label className="block text-sm font-medium text-gray-700 mb-2 ml-1">
            Email
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-6 h-6 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <input
              type="email"
              className="w-full h-16 pl-14 pr-6 rounded-2xl border-2 border-gray-200
             focus:outline-none focus:border-blue-500 bg-white text-gray-900
             text-lg disabled:opacity-60 placeholder-gray-400 transition-colors"
              placeholder="Email Address"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError("");
              }}
              required
              disabled={loading || emailLocked} // 🔒 key line
            />
          </div>
          {emailError && (
            <p className="text-red-500 text-xs mt-2 ml-4">{emailError}</p>
          )}
        </div>

        {/* Terms */}
        <div className="w-full mb-5 px-2">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            By providing your email, you agree to our{" "}
            <a
              href="#"
              className="underline text-blue-600 hover:text-blue-700 font-medium"
            >
              Terms and Conditions
            </a>{" "}
            and{" "}
            <a
              href="#"
              className="underline text-blue-600 hover:text-blue-700 font-medium"
            >
              Privacy Policy
            </a>
          </p>
        </div>

        {/* Proceed Button */}
        <div className="w-full">
          <button
            onClick={handleFormSubmit}
            type="button"
            disabled={loading}
            className="w-full h-16 bg-[#1b3634] rounded-2xl text-white font-bold text-lg flex items-center justify-center disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
          >
            <span className="mr-3">
              {loading ? "Processing..." : "Proceed Securely"}
            </span>
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderStep2 = () => {
    return (
      <div className="animate-in fade-in slide-in-from-right-4 duration-500">
        <h1 className="text-2xl font-bold text-gray-900 mb-3 text-center">
          Identity Proof
        </h1>
        <p className="text-gray-600 mb-10 text-center text-base">
          Securely verify your documents through DigiLocker
        </p>

        <div className="space-y-4 mb-10">
          <button
            onClick={startDigilockerFlow}
            disabled={loading}
            className="w-full shadow-sm flex items-center p-5 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors"
          >
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Shield className="text-blue-600 w-7 h-7" />
            </div>
            <div className="text-left grow ml-4">
              <div className="font-bold text-slate-800">DigiLocker</div>
              <div className="text-xs text-slate-500">
                Fast & Secure document sharing
              </div>
            </div>
            <ChevronRight className="text-slate-300 w-5 h-5" />
          </button>
        </div>

        <button
          onClick={startDigilockerFlow}
          disabled={loading}
          className="w-full h-16 bg-[#1b3634] rounded-2xl text-white font-bold text-lg flex items-center justify-center disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98]"
        >
          <span className="mr-3">
            {loading ? "Please wait..." : "Continue to DigiLocker"}
          </span>
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>
    );
  };

  return renderContent();
};

export default VerificationFlow;
