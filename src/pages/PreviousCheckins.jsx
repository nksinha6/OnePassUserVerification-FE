import React, { useEffect, useState } from "react";

const PreviousCheckins = () => {
  const [verifiedData, setVerifiedData] = useState(null);
  const [email, setEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const aadhaarData = sessionStorage.getItem("verifiedAadhaarData");
      const userEmail = sessionStorage.getItem("userEmail");

      if (aadhaarData) {
        setVerifiedData(JSON.parse(aadhaarData));
      }
      if (userEmail) {
        setEmail(userEmail);
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading verified data:", error);
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!verifiedData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">No verified data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Verification Complete</h1>

          {/* Header Status */}
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 font-semibold">✅ Your identity has been verified successfully</p>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Full Name</label>
              <p className="text-lg text-gray-900 font-semibold">{verifiedData.name || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Email</label>
              <p className="text-lg text-gray-900 font-semibold">{email || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Phone Number</label>
              <p className="text-lg text-gray-900 font-semibold">
                +{verifiedData.phoneCountryCode} {verifiedData.phoneNumber}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Gender</label>
              <p className="text-lg text-gray-900 font-semibold">{verifiedData.gender || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Date of Birth</label>
              <p className="text-lg text-gray-900 font-semibold">{verifiedData.dateOfBirth || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Nationality</label>
              <p className="text-lg text-gray-900 font-semibold">{verifiedData.nationality || "-"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">UID</label>
              <p className="text-lg text-gray-900 font-semibold">{verifiedData.uid || "-"}</p>
            </div>
          </div>

          {/* Address Information */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Address Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verifiedData.splitAddress && (
                <>
                  <div>
                    <label className="text-sm text-gray-600">House</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.house || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Street</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.street || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Landmark</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.landmark || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Post Office</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.po || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Village/Town/City</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.vtc || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Sub-District</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.subdist || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">District</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.dist || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">State</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.state || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Pincode</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.pincode || "-"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Country</label>
                    <p className="text-gray-900">{verifiedData.splitAddress.country || "-"}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Button */}
          <button
            className="w-full bg-brand hover:bg-brand-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            onClick={() => {
              // Add navigation or action here
              console.log("Proceeding with verified data");
            }}
          >
            Proceed to Check-In
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviousCheckins;
