import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Database,
  Clock,
  Scale,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Lock,
  Globe,
  ChevronDown,
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
  const [language, setLanguage] = useState("en");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef(null);
  const [isChecked, setIsChecked] = useState(false);
  const [businessType, setBusinessType] = useState("Hospitality");
  const [businessPlan, setBusinessPlan] = useState("Starter");
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [selectedId, setSelectedId] = useState("aadhaar");

  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (langRef.current && !langRef.current.contains(event.target)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
  const isHospitality = businessType === "Hospitality";
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
      // "",
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
      <MobileHeader
        rightComponent={
          <div className="relative" ref={langRef}>
            <div
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1.5 py-1.5 px-1 rounded-lg cursor-pointer bg-transparent text-gray-700 active:scale-95 transition-all"
            >
              <Globe size={16} className="text-gray-500" />
              <span className="text-sm font-semibold">
                {language === "hi" ? "हिंदी" : "English"}
              </span>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${isLangOpen ? "rotate-180" : ""
                  }`}
              />
            </div>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 mt-1 w-24 bg-white border border-gray-100 rounded-[8px] shadow-lg overflow-hidden z-100 origin-top-right transition-all duration-200 ${isLangOpen
                ? "opacity-100 scale-100 pointer-events-auto"
                : "opacity-0 scale-95 pointer-events-none"
                }`}
            >
              <div
                onClick={() => {
                  setLanguage("en");
                  setIsLangOpen(false);
                }}
                className={`px-3 py-2 text-xs font-medium cursor-pointer transition ${language === "en"
                  ? "bg-brand text-white"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                English
              </div>
              <div
                onClick={() => {
                  setLanguage("hi");
                  setIsLangOpen(false);
                }}
                className={`px-3 py-2 text-xs font-medium cursor-pointer transition ${language === "hi"
                  ? "bg-brand text-white"
                  : "text-gray-700 hover:bg-gray-50"
                  }`}
              >
                हिंदी
              </div>
            </div>
          </div>
        }
      />
      <ProgressBar />
      <h1
        className={`${isCorporate
          ? "text-3xl font-bold text-[#1b3631]"
          : "text-2xl text-brand"
          } mb-4`}
      >
        {language === "hi" ? "आपकी सहमति" : CONSENT_UI.TITLE}
      </h1>

      <p className="text-sm text-gray-500 mb-6 leading-[22px]">
        {(isCorporate || isHospitality) && businessPlan !== "Starter"
          ? language === "hi"
            // ? "एक सुरक्षित प्रवेश अनुभव प्रदान करने के लिए, हमें भारत के DPDP अधिनियम के अनुसार विशिष्ट डेटा बिंदुओं को संसाधित करने के लिए आपकी अनुमति की आवश्यकता है।"
            ? "इस विज़िट के लिए आपकी पहचान को सत्यापित करने हेतु, हमें आपके व्यक्तिगत डेटा को प्रोसेस करने के लिए आपकी सहमति की आवश्यकता है।"
            : "To verify your identity for this visit, we need your consent to process your personal data."
          // : "To provide a secure entry experience, we need your permission to process specific data points in accordance with India's DPDP Act."
          : language === "hi"
            ? "एक सुरक्षित प्रवेश अनुभव प्रदान करने के लिए, हमें भारत के DPDP अधिनियम के अनुसार विशिष्ट डेटा बिंदुओं को संसाधित करने के लिए आपकी अनुमति की आवश्यकता है।"
            : CONSENT_UI.DESCRIPTION}
      </p>

      {/* Consent Content */}
      {shouldShowDetailedConsent ? (
        <div className="space-y-6 overflow-y-auto pr-2 pb-6">
          <section>
            <h4 className="text-sm font-bold text-[#1b3631] mb-2">
              {language === "hi" ? "हम उपयोग करेंगे:" : "We will use:"}
            </h4>
            <ul className="text-sm text-gray-500 space-y-2 list-disc ml-5">
              <li>{language === "hi" ? "आपका ईमेल पता" : "Your email address"}</li>
              <li>{language === "hi" ? "रिसेप्शन पर साझा किया गया आपका फोन नंबर" : "Your phone number shared at reception"}</li>
              <li>{language === "hi" ? "सत्यापन के लिए चुने गए आपके आईडी का विवरण" : "Details from the ID you selected for verification"}</li>
            </ul>
          </section>

          <section>
            <h4 className="text-sm font-bold text-[#1b3631] mb-2">
              {language === "hi" ? "इस जानकारी का उपयोग केवल निम्नलिखित के लिए किया जाता है:" : "This information is used only for:"}
            </h4>
            <ul className="text-sm text-gray-500 space-y-2 list-disc ml-5">
              <li>{language === "hi" ? "आगंतुक पहचान सत्यापन" : "Visitor identity verification"}</li>
              <li>{language === "hi" ? "इस स्थान के लिए एक्सेस और सुरक्षा प्रबंधन" : "Access and security management for this location"}</li>
            </ul>
          </section>

          <section>
            <h4 className="text-sm font-bold text-[#1b3631] mb-2">
              {language === "hi" ? "आपका डेटा:" : "Your data:"}
            </h4>
            <ul className="text-sm text-gray-500 space-y-2 list-disc ml-5">
              <li>{language === "hi" ? "केवल इस विज़िट और अनुपालन के लिए प्रोसेस किया गया" : "Processed only for this visit and compliance"}</li>
              <li>{language === "hi" ? "बेचा नहीं जाता या मार्केटिंग के लिए उपयोग नहीं किया जाता" : "Not sold or used for marketing"}</li>
              <li>{language === "hi" ? "केवल अधिकृत सेवा प्रदाताओं के साथ साझा किया गया" : "Shared only with authorized service providers"}</li>
              <li>{language === "hi" ? "केवल कानूनी आवश्यकता के अनुसार बनाए रखा गया" : "Retained only as required by law"}</li>
            </ul>
          </section>

          <p className="text-xs text-gray-400 leading-relaxed">
            {language === "hi" ? (
              <>आप भारत के <span className="italic">DPDP अधिनियम</span> के अनुसार पहुँच, सुधार, या सहमति वापस लेने का अनुरोध कर सकते हैं।</>
            ) : (
              <>You can request access, correction, or withdrawal of consent as per India's <span className="italic">DPDP Act</span>.</>
            )}
          </p>
        </div>
      ) : shouldShowStarterConsent ? (
        <div className="space-y-3">
          {CONSENT_UI.ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            let title = item.title;
            let description = item.description;

            if (language === "hi") {
              if (item.id === 1) { title = "आगंतुक सत्यापन"; description = "सुविधा एक्सेस और सुरक्षा प्रोटोकॉल के लिए अपनी पहचान सुरक्षित रूप से सत्यापित करें।"; }
              if (item.id === 2) { title = "डेटा प्रोसेसिंग"; description = "प्रवेश लॉग और आपातकालीन सूचनाओं के लिए संपर्क विवरण (ईमेल/फोन) की प्रोसेसिंग।"; }
              if (item.id === 3) { title = "प्रतिधारण"; description = "डेटा केवल सुरक्षा प्रोटोकॉल द्वारा आवश्यक अवधि के लिए संग्रहीत किया जाता है और उसके बाद हटा दिया जाता है।"; }
              if (item.id === 4) { title = "कानूनी अधिकार"; description = "भारत के डिजिटल व्यक्तिगत डेटा संरक्षण (DPDP) अधिनियम के तहत अपने अधिकारों का प्रयोग करना।"; }
            }

            return (
              <div key={item.id} className="flex gap-3">
                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-brand" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold">{title}</h4>
                  <p className="text-xs text-gray-500">{description}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {!isCorporate && <div className="flex-1" />}

      {/* Checkbox */}
      <div
        className={`mt-auto ${isCorporate ? "bg-gray-50" : "bg-gray-100"
          } border border-gray-100 rounded-lg p-4 mb-4`}
      >
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => setIsChecked(e.target.checked)}
            className={`mt-1 h-5 w-5 ${isCorporate ? "accent-[#1b3631]" : "accent-brand"
              }`}
          />
          <p className="text-sm font-medium text-[#1b3631]">
            {language === "hi"
              ? "मैं पहचान सत्यापन और आगंतुक पहुँच प्रबंधन के लिए अपने व्यक्तिगत डेटा की प्रोसेसिंग के लिए सहमति देता हूँ।"
              : "I consent to the processing of my personal data for identity verification and visitor access management."}
          </p>
        </div>
      </div>

      {/* Continue Button */}
      <button
        disabled={!isChecked}
        onClick={handleContinue}
        className={`w-full h-14 rounded-[8px] font-bold flex items-center justify-center gap-2 shrink-0 transition ${isChecked
          ? "bg-[#1b3631] text-white"
          : "bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
      >
        {isCorporate && businessPlan === "Starter" ? (
          language === "hi" ? "मैं स्वीकार करता हूँ" : "I Accept"
        ) : (
          <>
            {language === "hi" ? "सुरक्षित रूप से आगे बढ़ें" : CONSENT_UI.CONTINUE_BUTTON}
            <Lock size={18} /> {/* ✅ Lock icon added */}
          </>
        )}
      </button>
    </div>
  );
};

export default Consent;
