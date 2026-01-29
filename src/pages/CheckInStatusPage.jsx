import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import {
  getAadhaarData,
  persistAadhaarVerify,
} from "@/services/aadhaarService";
import { getGuestByPhone } from "@/services/guestService";
import { ROUTES } from "@/constants/ui";

const DetailRow = ({ label, value, isLast }) => (
  <div
    className={`flex justify-between items-center py-1 ${
      !isLast ? "border-b border-slate-50 pb-4" : ""
    }`}
  >
    <span className="text-[14px] text-slate-500 font-medium">{label}</span>
    <span className="text-[15px] font-bold text-slate-800">
      {value || "N/A"}
    </span>
  </div>
);

const CheckInStatusPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [aadhaarData, setAadhaarData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [displayData, setDisplayData] = useState({
    countryCode: "",
    phoneNumber: "",
    email: "",
  });

  useEffect(() => {
    const processIDVerification = async () => {
      const queryParams = new URLSearchParams(location.search);
      const vIdFromUrl = queryParams.get("verification_id");
      const rIdFromUrl =
        queryParams.get("reference_id") || queryParams.get("referenceId");

      const storedDigi = JSON.parse(
        sessionStorage.getItem("digilockerResponse") || "{}",
      );
      const sessionGuest = JSON.parse(sessionStorage.getItem("guest") || "{}");

      const vId = vIdFromUrl || storedDigi.verification_id;
      const rId = rIdFromUrl || storedDigi.reference_id;

      const pCode = storedDigi.countryCode || sessionGuest.countryCode || "91";
      const pNum = storedDigi.phoneNumber || sessionGuest.phoneNumber;

      setDisplayData({
        countryCode: pCode,
        phoneNumber: pNum,
      });

      /* 🔹 NEW: Fetch Guest by Phone */
      try {
        const guestData = await getGuestByPhone(pCode, pNum);

        if (guestData) {
          console.log("✅ Existing Guest Found:", guestData);
          sessionStorage.setItem("guest", JSON.stringify(guestData));
          setDisplayData((prev) => ({
            ...prev,
            email: guestData.email || guestData.emailId || "",
          }));
        } else {
          console.log("ℹ️ No guest found for this phone number");
        }
      } catch (e) {
        console.warn("Guest lookup failed silently");
      }

      if (!vId || !rId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const data = await getAadhaarData(vId, rId, pCode, pNum);

        if (data) {
          setAadhaarData(data);
          sessionStorage.setItem("aadhaarData", JSON.stringify(data));

          const country = data?.split_address?.country || "Indian";

          await persistAadhaarVerify(
            data?.uid,
            pCode,
            pNum,
            data?.name,
            data?.gender,
            data?.dob,
            country === "India" ? "Indian" : country,
            data?.split_address ?? {},
          );
        } else {
          setError("Verification data not found. Please try again.");
        }
      } catch (err) {
        setError(err.message || "An error occurred during verification.");
      } finally {
        setIsLoading(false);
      }
    };

    processIDVerification();
  }, [location.search]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-[#10b981] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-600 font-medium">
          Fetching Verified Details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Verification Error
        </h2>
        <p className="text-slate-500 mb-8">{error}</p>
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full py-3 bg-brand text-white rounded-xl font-bold"
        >
          Try Again
        </button>
      </div>
    );
  }
  // Default view if no data yet
  if (!aadhaarData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Complete Verification
        </h2>
        <p className="text-slate-500 mb-8">
          Please complete your DigiLocker identity verification to see your
          status.
        </p>
        <button
          onClick={() => navigate(ROUTES.LOGIN)}
          className="w-full py-3 bg-brand text-white rounded-xl font-bold"
        >
          Return to Verification
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center px-4 h-16 border-b border-slate-100">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-slate-50 rounded-full transition-colors"
        >
          <ChevronLeft size={24} className="text-slate-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-slate-800 pr-10">
          Check-in Status
        </h1>
      </header>

      {/* Content */}
      <div className="flex-1 px-4 py-8 overflow-y-auto max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Verification Successful
          </h2>
          <p className="text-slate-500 text-sm">
            Your identity has been securely verified and updated.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase">
              Verification Details
            </h2>
            <div className="flex items-center gap-2 py-1.5 px-4 bg-green-50 rounded-full">
              <div className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></div>
              <span className="text-[12px] font-bold text-[#10b981] tracking-wide">
                VERIFIED
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <DetailRow
              label="Full Name"
              value={aadhaarData.full_name || aadhaarData.name}
            />
            <DetailRow
              label="Phone"
              value={`+${displayData.countryCode} ${displayData.phoneNumber}`}
            />
            <DetailRow label="Email" value={displayData.email || "N/A"} />
            <DetailRow
              label="City"
              value={
                aadhaarData.split_address?.vtc ||
                aadhaarData.split_address?.dist ||
                "N/A"
              }
            />
            <DetailRow
              label="State"
              value={aadhaarData.split_address?.state || "N/A"}
              isLast
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckInStatusPage;
