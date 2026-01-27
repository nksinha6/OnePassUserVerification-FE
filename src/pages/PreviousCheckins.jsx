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

  // Extract city and state from address
  const city = verifiedData.splitAddress?.vtc || verifiedData.splitAddress?.po || "";
  const state = verifiedData.splitAddress?.state || "";

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header with Back Button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Check-in Status</h1>
          </div>

          {/* Stepper / Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                  <p className="text-xs font-semibold text-gray-700 mt-2 text-center">1. ENTER EMAIL</p>
                </div>
              </div>
              <div className="flex-1 h-1 bg-green-500 mx-2"></div>
              <div className="flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                  <p className="text-xs font-semibold text-gray-700 mt-2 text-center">2. ID VERIFICATION</p>
                </div>
              </div>
              <div className="flex-1 h-1 bg-green-500 mx-2"></div>
              <div className="flex-1">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">✓</div>
                  <p className="text-xs font-semibold text-gray-700 mt-2 text-center">3. COMPLETE VERIFICATION</p>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Status Badge */}
          <div className="flex items-center justify-end mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 text-green-800 font-semibold">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              VERIFIED
            </span>
          </div>

          {/* Verification Details */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-lg font-bold text-gray-700 mb-6">VERIFICATION DETAILS</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">{verifiedData.name || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                <p className="text-lg font-semibold text-gray-900">{email || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <p className="text-lg font-semibold text-gray-900">
                  +{verifiedData.phoneCountryCode} {verifiedData.phoneNumber}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                <p className="text-lg font-semibold text-gray-900">{verifiedData.gender || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                <p className="text-lg font-semibold text-gray-900">{verifiedData.dateOfBirth || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Nationality</label>
                <p className="text-lg font-semibold text-gray-900">{verifiedData.nationality || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">UID</label>
                <p className="text-lg font-semibold text-gray-900">{verifiedData.uid || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                <p className="text-lg font-semibold text-gray-900">{city || "-"}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                <p className="text-lg font-semibold text-gray-900">{state || "-"}</p>
              </div>
            </div>

            {/* Full Address */}
            {verifiedData.splitAddress && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-md font-bold text-gray-700 mb-4">Complete Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {verifiedData.splitAddress.house && (
                    <div>
                      <span className="font-medium text-gray-600">House:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.house}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.street && (
                    <div>
                      <span className="font-medium text-gray-600">Street:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.street}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.landmark && (
                    <div>
                      <span className="font-medium text-gray-600">Landmark:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.landmark}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.vtc && (
                    <div>
                      <span className="font-medium text-gray-600">City:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.vtc}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.subdist && (
                    <div>
                      <span className="font-medium text-gray-600">Sub-District:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.subdist}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.dist && (
                    <div>
                      <span className="font-medium text-gray-600">District:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.dist}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.state && (
                    <div>
                      <span className="font-medium text-gray-600">State:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.state}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.pincode && (
                    <div>
                      <span className="font-medium text-gray-600">Pincode:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.pincode}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.po && (
                    <div>
                      <span className="font-medium text-gray-600">Post Office:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.po}</span>
                    </div>
                  )}
                  {verifiedData.splitAddress.country && (
                    <div>
                      <span className="font-medium text-gray-600">Country:</span>
                      <span className="text-gray-900"> {verifiedData.splitAddress.country}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          <button
            className="w-full mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            onClick={() => {
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
