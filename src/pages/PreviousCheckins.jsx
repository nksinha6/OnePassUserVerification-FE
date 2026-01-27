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
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Check-in Status</h1>

          {/* Stepper */}
          <div className="mb-12">
            <div className="flex items-center justify-between">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-2">1</div>
                <p className="text-sm font-semibold text-gray-700">ENTER EMAIL</p>
              </div>
              
              <div className="flex-1 h-1 bg-green-500 mx-4"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-2">2</div>
                <p className="text-sm font-semibold text-gray-700">ID VERIFICATION</p>
              </div>
              
              <div className="flex-1 h-1 bg-green-500 mx-4"></div>
              
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg mb-2">3</div>
                <p className="text-sm font-semibold text-gray-700">COMPLETE VERIFICATION</p>
              </div>
            </div>
          </div>

          {/* Verification Details Section */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-700 mb-4">VERIFICATION DETAILS</h2>
            
            <div className="border border-gray-300 rounded-lg p-6">
              {/* VERIFIED Badge - Top Right */}
              <div className="flex justify-end mb-6">
                <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-bold">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  VERIFIED
                </div>
              </div>

              {/* Verification Details Grid - Simplified */}
              <div className="space-y-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Full Name</div>
                  <div className="text-lg font-semibold">{verifiedData.name || "-"}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div className="text-lg font-semibold">
                    +{verifiedData.phoneCountryCode || "91"} {verifiedData.phoneNumber || "9876543210"}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">City</div>
                    <div className="text-lg font-semibold">{city || "Mumbai"}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-600 mb-1">State</div>
                    <div className="text-lg font-semibold">{state || "Maharashtra"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Proceed Button */}
          <div className="flex justify-center">
            <button
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-12 rounded-lg transition-colors"
              onClick={() => {
                console.log("Proceeding with verified data");
              }}
            >
              Proceed to Check-In
            </button>
          </div>

          {/* Full Details Section - Hidden by default, could be expandable */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer text-gray-700 hover:text-gray-900">
                <span className="font-semibold">View Complete Verification Details</span>
                <svg className="w-5 h-5 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              
              <div className="mt-6 bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email</div>
                    <div className="text-lg font-semibold text-gray-900">{email || "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Gender</div>
                    <div className="text-lg font-semibold text-gray-900">{verifiedData.gender || "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Date of Birth</div>
                    <div className="text-lg font-semibold text-gray-900">{verifiedData.dateOfBirth || "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">Nationality</div>
                    <div className="text-lg font-semibold text-gray-900">{verifiedData.nationality || "-"}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600 mb-1">UID</div>
                    <div className="text-lg font-semibold text-gray-900">{verifiedData.uid || "-"}</div>
                  </div>

                  {verifiedData.splitAddress && (
                    <>
                      <div className="md:col-span-2">
                        <div className="text-sm text-gray-600 mb-1">Complete Address</div>
                        <div className="text-gray-900">
                          {verifiedData.splitAddress.house && `${verifiedData.splitAddress.house}, `}
                          {verifiedData.splitAddress.street && `${verifiedData.splitAddress.street}, `}
                          {verifiedData.splitAddress.landmark && `${verifiedData.splitAddress.landmark}, `}
                          {verifiedData.splitAddress.vtc && `${verifiedData.splitAddress.vtc}, `}
                          {verifiedData.splitAddress.dist && `${verifiedData.splitAddress.dist}, `}
                          {verifiedData.splitAddress.state && `${verifiedData.splitAddress.state} `}
                          {verifiedData.splitAddress.pincode && `- ${verifiedData.splitAddress.pincode}`}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviousCheckins;