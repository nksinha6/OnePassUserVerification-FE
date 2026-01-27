// src/pages/VerificationFlow.js
import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock, Shield, Clock, ChevronRight, ArrowRight } from "lucide-react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import apiClient from "@/services/apiClient";
import { API_ENDPOINTS } from "@/constants/config";
import { ROUTES } from "@/constants/ui";
import { verifyDigilockerAccount, createDigilockerUrl } from "@/services/digilockerService";

const VerificationFlow = () => {
    const { mobileId, propertyId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const isLoginPath = location.pathname === "/login" || location.pathname === ROUTES.LOGIN;

    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [manualMobile, setManualMobile] = useState("");
    const [countryCode, setCountryCode] = useState("91");
    const [emailError, setEmailError] = useState("");
    const [mobileError, setMobileError] = useState("");
    const [propertyInfo, setPropertyInfo] = useState({ name: "[Property Name]" });
    const [loading, setLoading] = useState(false);

    // Generate proper UUID format verification ID (Same as reference LoginPage)
    const generateVerificationId = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
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

    const getParsedPhone = () => {
        if (mobileId) {
            const parts = mobileId.split("-");
            if (parts.length === 2) {
                return { country: parts[0], number: parts[1] };
            }
            return { country: "91", number: mobileId };
        }
        return { country: countryCode, number: manualMobile.slice(countryCode.length) };
    };

    const displayMobile = mobileId ? formatMobile(mobileId) : (manualMobile ? `+${manualMobile}` : "[Mobile Number]");

    useEffect(() => {
        const fetchProperty = async () => {
            try {
                const pId = propertyId || "2";
                const response = await apiClient.get(API_ENDPOINTS.PROPERTY_BY_ID, {
                    params: { propertyId: pId }
                });
                if (response.data && response.data.name) {
                    setPropertyInfo(response.data);
                }
            } catch (error) {
                console.error("Error fetching property:", error);
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

        if (isLoginPath && (!manualMobile || manualMobile.length < 10)) {
            setMobileError("Please enter a valid mobile number");
            valid = false;
        }

        if (!valid) return;

        setLoading(true);
        const { country, number } = getParsedPhone();

        try {
            // 1. Update Email/Phone persist (Using apiClient for tenant headers)
            await apiClient.put(API_ENDPOINTS.UPDATE_EMAIL, {
                phoneCountryCode: country,
                phoneNumber: number,
                emailAddress: email
            });

            // Update session storage
            sessionStorage.setItem("guest", JSON.stringify({
                phoneNumber: number,
                countryCode: country,
                email: email
            }));

            // 2. Prepare DigiLocker Account (Same flow as LoginPage reference)
            const verificationId = generateVerificationId();
            console.log("Generated verificationId:", verificationId);

            const digilockerResponse = await verifyDigilockerAccount(verificationId, number);

            console.log("DigiLocker response:", digilockerResponse);

            sessionStorage.setItem("digilockerResponse", JSON.stringify({
                ...digilockerResponse,
                phoneNumber: number,
                countryCode: country,
                verificationId_initial: verificationId
            }));

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
            const digilockerRes = JSON.parse(sessionStorage.getItem("digilockerResponse"));
            if (!digilockerRes) throw new Error("Verification data missing");

            const { countryCode, phoneNumber } = digilockerRes;

            // 🔹 Use verification_id from response OR the initial one (Matching LoginPage)
            const digilockerVerificationId = digilockerRes.verification_id || digilockerRes.verificationId_initial;

            let userFlow;
            if (digilockerRes.status === "ACCOUNT_EXISTS") userFlow = "signin";
            if (digilockerRes.status === "ACCOUNT_NOT_FOUND") userFlow = "signup";
            if (!userFlow) userFlow = "signin"; // Fallback

            // 🔹 Use current origin for redirect URL
            // const redirectUrl = `${window.location.origin}${ROUTES.CHECKIN_STATUS}`;
            const redirectUrl = `https://authiko.in/user/checkinstatus`;

            console.log("Starting DigiLocker flow:", {
                verificationId: digilockerVerificationId,
                redirectUrl,
                userFlow
            });

            const digilockerUrlResponse = await createDigilockerUrl(
                digilockerVerificationId,
                ["AADHAAR"],
                redirectUrl,
                userFlow
            );

            console.log("DigiLocker URL response:", digilockerUrlResponse);

            if (!digilockerUrlResponse.url) {
                throw new Error("No URL received from DigiLocker");
            }

            // 🔹 Store redirect for session consistency (Matching LoginPage)
            sessionStorage.setItem("digilockerRedirectUrl", digilockerUrlResponse.url);
            sessionStorage.setItem("digilockerSessionData", JSON.stringify({
                verification_id: digilockerVerificationId,
                userFlow,
                phone: phoneNumber,
                status: digilockerRes.status,
                url: digilockerUrlResponse.url,
            }));

            // Redirect to DigiLocker
            window.location.href = digilockerUrlResponse.url;
        } catch (error) {
            console.error("Error starting DigiLocker:", error);
            alert(`Failed to start DigiLocker: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const Stepper = () => (
        <div className="stepper-header">
            <div className="step-item">
                <div className={`step-indicator-bar ${step >= 1 ? "active" : ""}`} />
                <span className={`status-text-new ${step === 1 ? "active" : ""}`}>1. ENTER EMAIL</span>
            </div>
            <div className="step-item">
                <div className={`step-indicator-bar ${step >= 2 ? "active" : ""}`} />
                <span className={`status-text-new ${step === 2 ? "active" : ""}`}>2. ID VERIFICATION</span>
            </div>
            <div className="step-item">
                <div className={`step-indicator-bar ${step >= 3 ? "active" : ""}`} />
                <span className={`status-text-new ${step === 3 ? "active" : ""}`}>3. COMPLETE</span>
            </div>
        </div>
    );

    return (
        <div className="verification-container">
            <Stepper />

            <div className="verification-content">
                {step === 1 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="verification-title">Verify Identity</h1>
                        <p className="verification-subtitle">Enter your details to securely complete your identity verification</p>

                        <div className="info-list">
                            <div className="info-item">
                                <Mail className="info-icon" />
                                <p className="info-text">
                                    Enter your email to continue secure check-in at <strong>{propertyInfo.name}</strong>.
                                </p>
                            </div>
                            <div className="info-item">
                                <Shield className="info-icon" />
                                <p className="info-text">
                                    Your identity will be verified via DigiLocker using <strong>{displayMobile}</strong>.
                                </p>
                            </div>
                            <div className="info-item">
                                <Clock className="info-icon" />
                                <p className="info-text">
                                    Your data will be stored for 1 year, as required by local law.
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleFormSubmit}>
                            <div className="space-y-4 mb-6">
                                {isLoginPath && (
                                    <div className="input-group">
                                        <div className="relative custom-phone-input">
                                            <PhoneInput
                                                country={"in"}
                                                value={manualMobile}
                                                onChange={(phone, country) => {
                                                    setManualMobile(phone);
                                                    setCountryCode(country.dialCode);
                                                    if (mobileError) setMobileError("");
                                                }}
                                                containerClass="react-tel-input"
                                                inputClass="form-control !w-full !h-auto !py-3 !pl-14 !border-slate-200 !rounded-xl !bg-slate-50"
                                                buttonClass="!border-none !bg-transparent !rounded-l-xl"
                                                placeholder="Mobile Number"
                                                inputProps={{
                                                    name: "phone",
                                                    required: true,
                                                }}
                                            />
                                        </div>
                                        {mobileError && <p className="text-red-500 text-xs mt-2 ml-2">{mobileError}</p>}
                                    </div>
                                )}

                                <div className="input-group">
                                    <Mail className="input-icon" />
                                    <input
                                        type="email"
                                        className="email-field"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (emailError) setEmailError("");
                                        }}
                                        required
                                    />
                                    {emailError && <p className="text-red-500 text-xs mt-2 ml-2">{emailError}</p>}
                                </div>
                            </div>
                            <button type="submit" disabled={loading} className="proceed-btn-dark">
                                <span>{loading ? "Processing..." : "Proceed Securely"}</span>
                                <Lock className="w-5 h-5" />
                            </button>
                            <p className="terms-footer mt-4">
                                By providing your email, you agree to our <a href="#" className="terms-link">Terms and Conditions</a> and <a href="#" className="terms-link">Privacy Policy</a>
                            </p>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h1 className="verification-title">Identity Proof</h1>
                        <p className="verification-subtitle">Securely verify your documents through DigiLocker</p>

                        <div className="space-y-4 mb-10">
                            <button
                                onClick={startDigilockerFlow}
                                disabled={loading}
                                className="digilocker-btn w-full shadow-sm border-slate-200"
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <Shield className="text-blue-600 w-7 h-7" />
                                </div>
                                <div className="text-left grow">
                                    <div className="font-bold text-slate-800">DigiLocker</div>
                                    <div className="text-xs text-slate-500">Fast & Secure document sharing</div>
                                </div>
                                <ChevronRight className="text-slate-300 w-5 h-5" />
                            </button>
                        </div>

                        <button
                            onClick={startDigilockerFlow}
                            disabled={loading}
                            className="proceed-btn-dark border-none"
                        >
                            <span>{loading ? "Please wait..." : "Continue to DigiLocker"}</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerificationFlow;