import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LoginHeader from "@/components/LoginHeader";
import LogoImage from "@/assets/images/1pass_logo.jpg";
import { ROUTES } from "@/constants/ui";
import { getAadhaarImageByPhone } from "@/services/aadhaarImageService";

/* ---------------- Detail Row ---------------- */
const DetailRow = ({ label, value, isLast }) => (
  <div
    className={`flex justify-between items-center py-3 ${
      !isLast ? "border-b border-gray-100" : ""
    }`}
  >
    <span className="text-sm text-gray-500 font-medium">{label}</span>
    <span className="text-sm font-semibold text-gray-900 text-right max-w-[60%] break-words">
      {value || "—"}
    </span>
  </div>
);

/* ---------------- Page ---------------- */
const ProfilePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [guest, setGuest] = useState(state?.guest || null);
  const [aadhaarImage, setAadhaarImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  /* -------- Session fallback -------- */
  useEffect(() => {
    if (!guest) {
      const storedGuest = sessionStorage.getItem("guest");
      if (storedGuest) {
        setGuest(JSON.parse(storedGuest));
      } else {
        navigate(ROUTES.LOGIN, { replace: true });
      }
    }
  }, [guest, navigate]);

  /* -------- Fetch Aadhaar Image -------- */
  useEffect(() => {
    if (!guest?.phoneCountryCode || !guest?.phoneNumber) return;

    const fetchAadhaarImage = async () => {
      setLoadingImage(true);
      try {
        const data = await getAadhaarImageByPhone(
          guest.phoneCountryCode,
          guest.phoneNumber,
        );

        // assuming API returns base64 image
        if (data?.image) {
          setAadhaarImage(`data:image/jpeg;base64,${data.image}`);
        }
      } catch (err) {
        console.error("Failed to fetch Aadhaar image:", err.message);
      } finally {
        setLoadingImage(false);
      }
    };

    fetchAadhaarImage();
  }, [guest]);

  if (!guest) return null;

  return (
    <div className="w-full mx-auto">
      <div className="min-h-screen bg-white border border-gray-200 flex flex-col">
        <div className="m-3 border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1">
          {/* SAME HEADER */}
          <LoginHeader logo={LogoImage} title="Check-in Status" />

          {/* SAME MAIN WRAPPER */}
          <main className="py-3 px-6 flex flex-col flex-1">
            {/* TITLE */}
            <div className="text-center mb-3">
              <h1 className="text-xl font-bold text-gray-900"> User Profile</h1>
            </div>

            {/* PROFILE IMAGE */}
            <div className="flex justify-center mb-6">
              <div className="p-1 rounded-3xl bg-gradient-to-br from-gray-200 via-gray-100 to-gray-300">
                <div className="w-40 h-40 rounded-2xl border-2 border-gray-300 bg-gray-50 overflow-hidden flex items-center justify-center shadow-md">
                  {loadingImage ? (
                    <span className="text-xs text-gray-400">Loading...</span>
                  ) : (
                    <img
                      src={aadhaarImage || guest.selfie || LogoImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* DETAILS CARD */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              {/* CARD HEADER */}
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs tracking-wide text-gray-500 font-semibold">
                  VERIFICATION DETAILS
                </span>
                <span className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  ● VERIFIED
                </span>
              </div>

              {/* DETAILS */}
              <DetailRow label="Full Name" value={guest.fullName} />
              <DetailRow label="Date of Birth" value={guest.dateOfBirth} />
              <DetailRow
                label="Phone"
                value={
                  guest.phoneNumber
                    ? `+${guest.phoneCountryCode} ${guest.phoneNumber}`
                    : null
                }
              />
              <DetailRow label="Email" value={guest.email} />
              <DetailRow label="City" value={guest.splitAddress?.vtc} />
              <DetailRow label="State" value={guest.splitAddress?.state} />
              <DetailRow label="Nationality" value={guest.nationality} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
