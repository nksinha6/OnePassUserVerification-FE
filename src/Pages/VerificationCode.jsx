import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Briefcase,
  Lock,
  User,
  IdCard,
  BadgeCheck,
  ArrowLeft,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";
import { createDigilockerUrl } from "../services/digilockerService";

const VerificationSelection = () => {
  const navigate = useNavigate();

  const [businessType, setBusinessType] = useState("Hospitality");
  const [businessPlan, setBusinessPlan] = useState("");
  const [isVerifiedUser, setIsVerifiedUser] = useState(false);
  const [selectedId, setSelectedId] = useState("aadhaar");

  useEffect(() => {
    setBusinessType(sessionStorage.getItem("businessType") || "Hospitality");
    setBusinessPlan(sessionStorage.getItem("businessPlan") || "");
    setIsVerifiedUser(sessionStorage.getItem("isVerifiedUser") === "true");
    setSelectedId(sessionStorage.getItem("selectedId") || "aadhaar");
  }, []);

  const isEligibleType = ["corporate", "hospitality"].includes(
    businessType?.toLowerCase(),
  );

  const isSMB = businessPlan?.toLowerCase() === "smb";
  const isEnterprise = businessPlan?.toLowerCase() === "enterprise";

  const shouldDirectlyShowCode = isEligibleType && isSMB && isVerifiedUser;

  useEffect(() => {
    if (shouldDirectlyShowCode) {
      navigate("/verification-code");
    }
  }, [shouldDirectlyShowCode, navigate]);

  // const handleContinue = () => {
  //   if (isSMB) {
  //     navigate("/verification-code");
  //   } else if (isEnterprise) {
  //     navigate("/face-match");
  //   }
  // };

  const handleContinue = async () => {
    try {
      // if (selectedId === "aadhaar")
      if (["aadhaar", "passport", "voter", "dl"].includes(selectedId)) {
        const digilockerData = JSON.parse(
          sessionStorage.getItem("digilockerData") || "{}",
        );
        console.log("digilockerData", digilockerData);

        const verificationId = digilockerData?.verificationId;
        const status = digilockerData?.digilockerResponse?.status; // 👈 get status properly

        // 🔹 Decide userFlow based on status
        let userFlow = "signin"; // default fallback

        if (status === "ACCOUNT_EXISTS") {
          userFlow = "signin";
        } else if (status === "ACCOUNT_NOT_FOUND") {
          userFlow = "signup";
        }

        if (!verificationId) {
          console.error("Missing verificationId in digilockerData");
          return;
        }

        let redirectPath = "/verification-code";

        if (isEnterprise) {
          redirectPath = "/face-match";
        }

        const redirectUrl = "";

        const response = await createDigilockerUrl(
          verificationId,
          ["AADHAAR"],
          // ["AADHAAR", "PAN", "DRIVING_LICENSE"],
          redirectUrl,
          userFlow,
        );

        console.log(response);

        sessionStorage.setItem("digilockerResponse", JSON.stringify(response));

        const digilockerUrl = response?.url || response?.data?.url;

        if (digilockerUrl) {
          window.location.href = digilockerUrl;
          return; // stop further navigation
        }
      }

      // 🔹 Fallback navigation (non-Aadhaar flow)
      if (isSMB) {
        navigate("/verification-code");
      } else if (isEnterprise) {
        navigate("/face-match");
      }
    } catch (error) {
      console.error("Error in verification flow:", error.message);
    }
  };

  const getIDContent = () => {
    switch (selectedId) {
      case "passport":
        return {
          title: "Verify with Passport",
          description:
            "Please have your physical Passport ready for digital verification.",
          icon: (
            <div className="relative">
              <User size={40} className="text-[#1b3631]" />
              <div className="absolute -top-1 -right-1">
                <BadgeCheck
                  size={16}
                  className="text-[#1b3631]"
                  fill="#1b3631"
                  stroke="white"
                />
              </div>
            </div>
          ),
          footerLink: "I do not have my passport at this time",
        };

      case "voter":
        return {
          title: "Digital Voter ID Verification",
          description:
            "Please have your physical Voter ID ready for electronic validation.",
          icon: <IdCard size={40} className="text-[#1b3631]" />,
          showImage: true,
          footerLink: "Need help? Contact support",
        };

      case "dl":
        return {
          title: "Digital Identity Verification",
          description:
            "Please have your Driver's License ready for secure validation.",
          icon: <IdCard size={40} className="text-[#1b3631]" />,
          showStatus: true,
          statusText: "ELECTRONIC VALIDATION READY",
          stepText: "Step 2 of 4 • Identity Verification",
        };

      case "aadhaar":
      default:
        return {
          title: "Verify your ID",
          description:
            "Verify your Aadhaar securely to continue. The verification process is encrypted and direct.",
          icon: <ShieldCheck size={40} className="text-[#1b3631]" />,
          card: {
            title: "Aadhaar Verification",
            description:
              "Have your Aadhaar number and registered mobile phone ready for OTP.",
            icon: <Briefcase size={24} className="text-[#1b3631]" />,
          },
        };
    }
  };

  const content = getIDContent();

  return (
    <div className="w-full h-dvh bg-white flex flex-col">
      {/* Header */}
      <div className="px-4 py-5 shrink-0">
        <MobileHeader />
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-4">
        <div
          className={`flex flex-col ${
            selectedId !== "aadhaar" ? "items-center text-center" : ""
          }`}
        >
          <div
            className={`w-full ${
              selectedId !== "aadhaar"
                ? "bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-gray-50 px-4 py-2 mt-2"
                : ""
            }`}
          >
            {/* Icon */}
            <div className="flex justify-center mb-8 pt-4">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center">
                {content.icon}
              </div>
            </div>

            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-[#1b3631] mb-4">
                {content.title}
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[280px] mx-auto">
                {content.description}
              </p>
            </div>

            {/* Aadhaar Card */}
            {content.card && (
              <div className="bg-gray-50 border border-gray-100 rounded-[6px] p-5 flex items-start gap-4 mb-8 w-full">
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  {content.card.icon}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#1b3631]">
                    {content.card.title}
                  </h4>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    {content.card.description}
                  </p>
                </div>
              </div>
            )}

            {/* Voter Placeholder */}
            {content.showImage && (
              <div className="w-full h-30 bg-gray-200/50 rounded-[6px] mb-8 border border-dashed border-gray-300 flex items-center justify-center">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  IDENTIFICATION REQUIRED
                </span>
              </div>
            )}

            {/* DL Status */}
            {content.showStatus && (
              <div className="w-full h-30 bg-[#f8fafc] rounded-[6px] mb-8 border border-dashed border-[#e2e8f0] flex items-center justify-center">
                <span className="text-[9px] font-extrabold text-[#94a3b8] uppercase tracking-[0.2em]">
                  {content.statusText}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Bottom Button */}
      <div className="px-4 pb-6 pt-3 bg-white shrink-0">
        <button
          onClick={handleContinue}
          className="w-full h-14 bg-[#1b3631] text-white rounded-[6px] font-bold shadow-lg shadow-black/10 hover:opacity-95 transition"
        >
          {selectedId === "aadhaar"
            ? "Proceed with verification >"
            : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default VerificationSelection;
