import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Database,
  Clock,
  Scale,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Lock,
} from "lucide-react";
import MobileHeader from "../Components/MobileHeader";
import ProgressBar from "../Components/ProgressBar";
import { CONSENT_UI } from "../constants/ui";
import { useNavigate } from "react-router-dom";
import { createDigilockerUrl } from "../services/digilockerService";

const iconMap = {
  shield: ShieldCheck,
  database: Database,
  clock: Clock,
  scale: Scale,
};

const Consent = () => {
  const [isChecked, setIsChecked] = useState(false);
  const [businessType, setBusinessType] = useState("Hospitality");
  const [businessPlan, setBusinessPlan] = useState("Starter");
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [selectedId, setSelectedId] = useState("aadhaar");

  const navigate = useNavigate();

  useEffect(() => {
    const type = sessionStorage.getItem("businessType") || "Hospitality";
    const plan = sessionStorage.getItem("businessPlan") || "Starter";
    const verified = sessionStorage.getItem("isVerifiedUser") === "true";
    const id = sessionStorage.getItem("selectedId") || "aadhaar";

    setBusinessType(type);
    setBusinessPlan(plan);
    setIsVerifiedUser(verified);
    setSelectedId(id);
  }, []);

  const isCorporate = businessType === "Corporate";
  const isEligibleBusiness =
    businessType === "Corporate" || businessType === "Hospitality";

  const shouldShowDetailedConsent =
    isEligibleBusiness &&
    (businessPlan === "SMB" || businessPlan === "Enterprise");

  const shouldShowStarterConsent =
    isEligibleBusiness && businessPlan === "Starter";

  // 🔥 MAIN CONTINUE HANDLER
  const handleContinue = async () => {
    try {
      // ✅ 1️⃣ STARTER → DIRECT REDIRECT
      if (businessPlan === "Starter") {
        navigate("/verification-code");
        return;
      }

      // ✅ 2️⃣ SMB PLAN
      if (businessPlan === "SMB") {
        if (isVerifiedUser) {
          navigate("/verification-code");
          return;
        }

        await startDigiLockerFlow();
        return;
      }

      // ✅ 3️⃣ ENTERPRISE PLAN
      if (businessPlan === "Enterprise") {
        if (isVerifiedUser) {
          navigate("/face-match");
          return;
        }

        await startDigiLockerFlow();
        return;
      }

      // 🔹 Fallback
      navigate("/verification");
    } catch (error) {
      console.error("Error in verification flow:", error.message);
    }
  };

  // 🔐 DIGILOCKER FLOW
  const startDigiLockerFlow = async () => {
    if (!["aadhaar", "passport", "voter", "dl"].includes(selectedId)) {
      return;
    }

    const digilockerData = JSON.parse(
      sessionStorage.getItem("digilockerData") || "{}",
    );

    const verificationId = digilockerData?.verificationId;
    const status = digilockerData?.digilockerResponse?.status;

    let userFlow = "signin";

    if (status === "ACCOUNT_EXISTS") {
      userFlow = "signin";
    } else if (status === "ACCOUNT_NOT_FOUND") {
      userFlow = "signup";
    }

    if (!verificationId) {
      console.error("Missing verificationId in digilockerData");
      return;
    }

    const docMap = {
      aadhaar: "AADHAAR",
      passport: "PASSPORT",
      voter: "VOTER_ID",
      dl: "DRIVING_LICENSE",
    };

    const base = import.meta.env.BASE_URL.replace(/\/$/, "");

    let redirectPath = "/verification-code";

    if (
      (businessType === "Corporate" || businessType === "Hospitality") &&
      businessPlan === "Enterprise"
    ) {
      redirectPath = "/face-match";
    }

    const redirectUrl = `${window.location.origin}${base}${redirectPath}`;

    const response = await createDigilockerUrl(
      verificationId,
      [docMap[selectedId]],
      redirectUrl,
      userFlow,
    );

    sessionStorage.setItem("digilockerResponse", JSON.stringify(response));

    const digilockerUrl = response?.url || response?.data?.url;

    if (digilockerUrl) {
      window.location.href = digilockerUrl;
    }
  };

  return (
    <div className="w-full h-dvh bg-white px-4 py-5 flex flex-col overflow-y-auto">
      <MobileHeader />
      <ProgressBar />
      <h1
        className={`${
          isCorporate
            ? "text-3xl font-bold text-[#1b3631]"
            : "text-2xl text-brand"
        } mb-4`}
      >
        {CONSENT_UI.TITLE}
      </h1>

      <p className="text-sm text-gray-500 mb-6 leading-[22px]">
        {isCorporate
          ? "To verify your identity for this visit, we need your consent to process your personal data."
          : CONSENT_UI.DESCRIPTION}
      </p>

      {/* Consent Content */}
      {shouldShowDetailedConsent ? (
        <div className="space-y-6 overflow-y-auto pr-2 pb-6">
          <section>
            <h4 className="text-sm font-bold text-[#1b3631] mb-2">
              We will use:
            </h4>
            <ul className="text-sm text-gray-500 space-y-2 list-disc ml-5">
              <li>Your email address</li>
              <li>Your phone number shared at reception</li>
              <li>Details from the ID you selected for verification</li>
            </ul>
          </section>

          <section>
            <h4 className="text-sm font-bold text-[#1b3631] mb-2">
              This information is used only for:
            </h4>
            <ul className="text-sm text-gray-500 space-y-2 list-disc ml-5">
              <li>Visitor identity verification</li>
              <li>Access and security management for this location</li>
            </ul>
          </section>

          <section>
            <h4 className="text-sm font-bold text-[#1b3631] mb-2">
              Your data:
            </h4>
            <ul className="text-sm text-gray-500 space-y-2 list-disc ml-5">
              <li>Processed only for this visit and compliance</li>
              <li>Not sold or used for marketing</li>
              <li>Shared only with authorized service providers</li>
              <li>Retained only as required by law</li>
            </ul>
          </section>

          <p className="text-xs text-gray-400 leading-relaxed">
            You can request access, correction, or withdrawal of consent as per
            India's <span className="italic">DPDP Act</span>.
          </p>
        </div>
      ) : shouldShowStarterConsent ? (
        <div className="space-y-3">
          {CONSENT_UI.ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <div key={item.id} className="flex gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-brand" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{item.title}</h4>
                  <p className="text-xs text-gray-500">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {!isCorporate && <div className="flex-1" />}

      {/* Checkbox */}
      <div
        className={`mt-auto ${
          isCorporate ? "bg-gray-50" : "bg-gray-100"
        } border border-gray-100 rounded-lg p-4 mb-4`}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className={`mt-1 h-5 w-5 ${
              isCorporate ? "accent-[#1b3631]" : "accent-brand"
            }`}
          />
          <p className="text-sm font-medium text-[#1b3631]">
            I consent to the processing of my personal data for identity
            verification and visitor access management.
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <button
        disabled={!isChecked}
        onClick={handleContinue}
        className={`w-full h-14 rounded-[8px] font-bold flex items-center justify-center gap-2 shrink-0 transition ${
          isChecked
            ? "bg-[#1b3631] text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {isCorporate && businessPlan === "Starter" ? (
          "I Accept"
        ) : (
          <>
            {CONSENT_UI.CONTINUE_BUTTON}
            <Lock size={18} /> {/* ✅ Lock icon added */}
          </>
        )}
      </button>
    </div>
  );
};

export default Consent;
