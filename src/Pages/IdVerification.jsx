import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MobileHeader from "../Components/MobileHeader";
import ProgressBar from "../Components/ProgressBar";
import { verifyDigilockerAccount } from "../services/digilockerService";
import { Lock } from "lucide-react";

const IdVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { email, businessType, businessPlan } = location.state || {};
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValid = selectedId !== "";

  const handleProceed = async () => {
    try {
      setIsLoading(true);

      // ✅ Get phone data from localStorage
      const phoneNumber = sessionStorage.getItem("phoneNumber");
      const countryCode = sessionStorage.getItem("phoneCountryCode"); // make sure you store this during login

      if (!phoneNumber || !countryCode) {
        alert("Phone details not found. Please login again.");
        return;
      }

      // ✅ Generate verification ID
      const verificationId =
        "VER-" + Math.random().toString(36).substring(2, 10).toUpperCase();

      console.log("Generated Verification ID:", verificationId);

      // ✅ Call API
      const response = await verifyDigilockerAccount(
        verificationId,
        phoneNumber,
      );

      console.log("API Response:", response);

      // ✅ Create single object
      const digilockerData = {
        verificationId,
        countryCode,
        phoneNumber,
        digilockerResponse: response,
      };

      // ✅ Store in ONE localStorage key
      sessionStorage.setItem("digilockerData", JSON.stringify(digilockerData));

      // Optional: store selectedId if needed
      sessionStorage.setItem("selectedId", selectedId);

      // ✅ Navigate
      navigate("/consent", {
        state: { email, businessType, businessPlan },
      });
    } catch (error) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-dvh bg-white shadow-xl px-4 py-5 flex flex-col overflow-y-auto">
      <MobileHeader />
      <ProgressBar />

      <h1 className="text-2xl font-bold text-[#1b3631] mb-2">
        Choose an ID for verification
      </h1>

      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Please select the identification document you have ready. You will use a
        digital service to validate this document.
      </p>

      <div>
        <label className="block text-xs font-bold text-[#1b3631] tracking-wide mb-2">
          Identity Document Type
        </label>

        <div className="relative">
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-white text-sm h-12 rounded-[6px] border border-gray-200 px-4 appearance-none outline-none focus:border-gray-300"
          >
            <option value="" disabled>
              Select an option
            </option>
            <option value="aadhaar">Aadhaar</option>
            {/* <option value="passport">Passport</option>
            <option value="voter">Voter ID</option>
            <option value="dl">Driving License</option> */}
          </select>
        </div>
      </div>

      <div className="flex-1" />

      <button
        disabled={!isValid || isLoading}
        onClick={handleProceed}
        className={`w-full h-14 rounded-[6px] font-bold transition flex items-center justify-center gap-2
    ${
      isValid && !isLoading
        ? "bg-[#1b3631] text-white shadow-lg"
        : "bg-gray-200 text-gray-400 cursor-not-allowed"
    }
  `}
      >
        {isLoading ? "Verifying..." : "Provide Consent"}
        {!isLoading && <Lock size={18} />}
      </button>

      <p className="text-[10px] text-gray-400 text-center mt-4 uppercase tracking-wider">
        Encrypted & Secure iPass Check-in
      </p>
    </div>
  );
};

export default IdVerification;
