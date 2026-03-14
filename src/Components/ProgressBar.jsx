import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
const ProgressBar = () => {
  const location = useLocation();
  const [businessType, setBusinessType] = useState("");
  const [businessPlan, setBusinessPlan] = useState("");

  useEffect(() => {
    const type = sessionStorage.getItem("businessType") || "";
    const plan = sessionStorage.getItem("businessPlan") || "";
    setBusinessType(type);
    setBusinessPlan(plan);
  }, []);

  // ✅ Check if progress bar should be shown
  const isEligible = useMemo(
    () => businessType === "Corporate" || businessType === "Hospitality",
    [businessType],
  );

  if (!isEligible) {
    return null;
  }

  // ✅ Determine 4th step label based on business plan
  const getStep4Label = useCallback(() => {
    return businessPlan === "Enterprise" ? "Face Match" : "OTP Code";
  }, [businessPlan]);

  // ✅ Define progress steps based on business plan
  const steps = useMemo(() => {
    // For Starter plan - 3 steps
    if (businessPlan === "Starter") {
      return [
        {
          id: 1,
          label: "Verify Email",
          path: ["/email", "/email-verification"],
        },
        { id: 2, label: "Consent", path: ["/consent"] },
        {
          id: 3,
          label: "OTP Code",
          path: ["/verification-code", "/verification"],
        },
      ];
    }

    // For SMB and Enterprise - 4 steps
    return [
      { id: 1, label: "Verify Email", path: ["/email", "/email-verification"] },
      { id: 2, label: "Consent", path: ["/consent", "/id-verification"] },
      { id: 3, label: "Verify ID", path: [] },
      {
        id: 4,
        label: getStep4Label(),
        path: ["/verification-code", "/verification", "/face-match"],
      },
    ];
  }, [businessPlan, getStep4Label]);

  // ✅ Get current step index with memoization
  const currentStepIndex = useMemo(() => {
    const currentPath = location.pathname;
    for (let i = 0; i < steps.length; i++) {
      if (steps[i].path.includes(currentPath)) {
        return i;
      }
    }
    return -1;
  }, [location.pathname, steps]);

  // ✅ Get color for connector
  const getConnectorColor = useCallback(
    (index) => {
      if (index < currentStepIndex) {
        return "bg-[#1B3631]"; // active connector
      } else {
        return "bg-gray-300"; // inactive connector
      }
    },
    [currentStepIndex],
  );

  const getTextColor = useCallback(
    (index) => {
      if (index < currentStepIndex) {
        return "text-[#1B3631] font-bold";
      } else if (index === currentStepIndex) {
        return "text-[#1B3631] font-bold";
      } else {
        return "text-[#1B3631] font-medium";
      }
    },
    [currentStepIndex],
  );

  return (
    <div className="w-full bg-white py-2">
      {/* ✅ Progress Steps */}
      <div className="flex items-center justify-between relative">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className="flex flex-col items-center relative flex-1"
          >
            {/* ✅ Container for connector and circle */}
            <div className="relative w-full flex justify-center items-center h-4">
              {/* ✅ Solid Connector (Between circles) */}
              {index < steps.length - 1 && (
                <div
                  className={`absolute h-[2px] transition-all duration-300 ${getConnectorColor(
                    index,
                  )}`}
                  style={{
                    width: "100%",
                    left: "50%",
                    zIndex: 0,
                  }}
                />
              )}

              {/* ✅ Step Circle */}
              <div className="relative z-10 flex items-center justify-center bg-white rounded-full ring-[3px] ring-white">
                {index < currentStepIndex ? (
                  <div className="w-[12px] h-[12px] rounded-full bg-[#1B3631]" />
                ) : index === currentStepIndex ? (
                  <div className="w-[12px] h-[12px] rounded-full bg-white border-[2px] border-[#1B3631]" />
                ) : (
                  <div className="w-[12px] h-[12px] rounded-full bg-white border-[2px] border-gray-300" />
                )}
              </div>
            </div>

            {/* ✅ Step Label */}
            <p
              className={`text-xs mt-2 text-center leading-tight max-w-[80px] ${getTextColor(
                index,
              )}`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;
