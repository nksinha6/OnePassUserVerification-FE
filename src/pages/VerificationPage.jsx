import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import LoginHeader from "@/components/LoginHeader";
import { API_ENDPOINTS } from "@/constants/config";
import apiClient from "@/services/apiClient";
import { ROUTES } from "@/constants/ui";
import {
  verifyDigilockerAccount,
  createDigilockerUrl,
} from "@/services/digilockerService";
import LogoImage from "@/assets/images/1pass_logo.jpg";

const VerificationPage = () => {
  const navigate = useNavigate();
  const { mobile, propertyId } = useParams();

  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [propertyName, setPropertyName] = useState("");
  const [apiError, setApiError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState("email"); // email, processing, digilocker

  // Generate verification ID
  const generateVerificationId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  useEffect(() => {
    if (mobile && propertyId) {
      // Format mobile
      const formattedMobile = `+91${mobile.replace('91-', '')}`;
      const cleanMobile = mobile.replace('91-', '');
      setPhoneNumber(cleanMobile);
      fetchProperty(propertyId);
    }
  }, [mobile, propertyId]);

  const fetchProperty = async (id) => {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.PROPERTY_BY_ID}?propertyId=${id}`);
      setPropertyName(response.data.name || response.data.propertyName || "Property");
    } catch (error) {
      console.error("Failed to fetch property", error);
      setPropertyName("Property");
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setApiError("Email is required");
      return;
    }

    if (!email.includes("@")) {
      setApiError("Please enter a valid email");
      return;
    }

    setIsLoading(true);
    setApiError("");
    setStep("processing");

    try {
      console.log("📧 Email submitted:", email);
      console.log("📱 Phone:", phoneNumber);

      // Step 1: Verify DigiLocker account
      const verificationId = generateVerificationId();
      console.log("🆔 Generated Verification ID:", verificationId);

      const digilockerResponse = await verifyDigilockerAccount(
        verificationId,
        phoneNumber
      );
      console.log("✅ DigiLocker verification response:", digilockerResponse);

      let userFlow = "signin";
      if (digilockerResponse.status === "ACCOUNT_EXISTS") userFlow = "signin";
      if (digilockerResponse.status === "ACCOUNT_NOT_FOUND") userFlow = "signup";

      const finalVerificationId = digilockerResponse.verification_id || verificationId;

      // Step 2: Store session data
      sessionStorage.setItem("digilockerResponse", JSON.stringify({
        ...digilockerResponse,
        phoneNumber: phoneNumber,
        countryCode: "91",
        verificationId_initial: verificationId,
        finalVerificationId: finalVerificationId,
        userFlow: userFlow,
        email: email,
      }));

      // Step 3: Create DigiLocker URL
      const baseUrl = window.location.origin;
      const redirectUrl = `${baseUrl}${ROUTES.VERIFICATION_CALLBACK}`;
      console.log("🔹 Base URL:", baseUrl, redirectUrl);

      console.log("📍 Redirect URL:", redirectUrl);
      console.log("👤 User Flow:", userFlow);

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

      // Store for callback
      sessionStorage.setItem("digilockerRedirectUrl", digilockerUrlResponse.url);
      sessionStorage.setItem("digilockerSessionData", JSON.stringify({
        verification_id: finalVerificationId,
        userFlow,
        phone: phoneNumber,
        status: digilockerResponse.status,
        url: digilockerUrlResponse.url,
        email: email,
      }));

      console.log("🔄 Redirecting to DigiLocker:", digilockerUrlResponse.url);
      setStep("digilocker");
      window.location.href = digilockerUrlResponse.url;

    } catch (error) {
      console.error("❌ Error:", error);
      setApiError(`Error: ${error.message}`);
      setStep("email");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="min-h-screen bg-white border border-gray-200 flex flex-col">
        <div className="m-3 border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1">
          <LoginHeader logo={LogoImage} title="Verify Identity" />

          <main className="p-6 flex flex-col flex-1">
            {apiError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{apiError}</p>
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="flex flex-col items-center w-full">
                <div className="w-full bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center">
                  {/* Stepper */}
                  <div className="flex w-full mb-8">
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-sm font-semibold text-yellow-600 border-b-4 border-yellow-400 pb-2">1. ENTER EMAIL</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-sm font-semibold text-gray-400">2. VERIFY WITH DIGILOCKER</span>
                    </div>
                    <div className="flex-1 flex flex-col items-center">
                      <span className="text-sm font-semibold text-gray-400">3. COMPLETE</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-left w-full">Verify Identity</h2>
                  <p className="text-gray-700 mb-6 text-left w-full">Enter your email to securely complete your identity verification</p>

                  {/* Info List */}
                  <ul className="mb-6 w-full space-y-3">
                    <li className="flex items-start text-gray-800">
                      <span className="mr-3 mt-1">📧</span>
                      <span>Enter your email to continue secure check-in at <b>[{propertyName}]</b>.</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <span className="mr-3 mt-1">🛡️</span>
                      <span>Your identity will be verified via DigiLocker using <b>[+91{phoneNumber}]</b>.</span>
                    </li>
                    <li className="flex items-start text-gray-800">
                      <span className="mr-3 mt-1">⏰</span>
                      <span>Your data will be stored for 1 year, as required by local law.</span>
                    </li>
                  </ul>

                  {/* Email Input */}
                  <div className="w-full mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Email Address"
                      disabled={isLoading}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand bg-gray-50 text-gray-900 text-base disabled:opacity-50"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' fill=\'none\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect width=\'20\' height=\'20\' rx=\'10\' fill=\'%23F3F4F6\'/%3E%3Cpath d=\'M5 7.5l5 3.75L15 7.5\' stroke=\'%239CA3AF\' stroke-width=\'1.5\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: '10px center' }}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mb-6 w-full text-left">
                    By providing your email, you agree to our <a href="#" className="underline">Terms and Conditions</a> and <a href="#" className="underline">Privacy Policy</a>
                  </p>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 px-4 bg-green-900 hover:bg-green-800 rounded-lg text-white font-semibold text-lg flex items-center justify-center disabled:opacity-50 transition-colors shadow-md"
                  >
                    {isLoading ? "Processing..." : "Proceed Securely"} <span className="ml-2">🔒</span>
                  </button>
                </div>
              </form>
            )}

            {step === "processing" && (
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                    <div className="animate-spin">⏳</div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Processing Verification</h3>
                  <p className="text-gray-600">Please wait while we set up your DigiLocker verification...</p>
                </div>
              </div>
            )}

            {step === "digilocker" && (
              <div className="flex flex-col items-center justify-center flex-1">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                    <span className="text-3xl">🔄</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Redirecting to DigiLocker</h3>
                  <p className="text-gray-600">You will be redirected shortly...</p>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
