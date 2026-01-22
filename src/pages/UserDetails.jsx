import { useEffect, useState } from "react";
import LoginHeader from "@/components/LoginHeader";
import LogoImage from "@/assets/images/1pass_logo.jpg";

const SELFIE_STORAGE_KEY = "capturedSelfie";
const SELFIE_RESPONSE_KEY = "selfiePersistResponse";
const AADHAAR_VERIFIED_KEY = "aadhaarVerified";
const GUEST_KEY = "guest";
const GUEST_SELFIE_KEY = "guestSelfie";

const normalizeBase64Image = (base64) => {
  if (!base64) return null;
  if (base64.startsWith("data:image")) return base64;
  return `data:image/jpeg;base64,${base64}`;
};

const UserDetails = () => {
  const [user, setUser] = useState({
    name: "—",
    mobile: "—",
    status: 0,
    selfie: "",
  });

  useEffect(() => {
    /* ---------------- PRIMARY SOURCES ---------------- */
    const guestRaw = sessionStorage.getItem(GUEST_KEY);
    const guest = guestRaw ? JSON.parse(guestRaw) : null;

    const guestSelfieRaw = sessionStorage.getItem(GUEST_SELFIE_KEY);
    const guestSelfie = guestSelfieRaw ? JSON.parse(guestSelfieRaw) : null;

    /* ---------------- FALLBACK SOURCES ---------------- */
    const rawSelfie = sessionStorage.getItem(SELFIE_STORAGE_KEY);

    const selfieRespRaw = sessionStorage.getItem(SELFIE_RESPONSE_KEY);
    const selfieResp = selfieRespRaw ? JSON.parse(selfieRespRaw) : null;

    const aadhaarVerifiedRaw = sessionStorage.getItem(AADHAAR_VERIFIED_KEY);
    const aadhaarVerified = aadhaarVerifiedRaw
      ? JSON.parse(aadhaarVerifiedRaw)
      : null;

    /* ---------------- NAME ---------------- */
    const name =
      guest?.fullName || selfieResp?.name || aadhaarVerified?.fullName || "—";

    /* ---------------- MOBILE ---------------- */
    const countryCode =
      guest?.phoneCountryCode || selfieResp?.phoneCountryCode || "91";

    const phoneNumber = guest?.phoneNumber || selfieResp?.phoneNumber || "";

    const mobile = phoneNumber ? `${countryCode} ${phoneNumber}` : "—";

    /* ---------------- STATUS ---------------- */
    const status =
      guest?.verificationStatus === "verified" ||
      aadhaarVerified?.verificationStatus === 1
        ? 1
        : 0;

    /* ---------------- SELFIE ---------------- */
    const selfie =
      normalizeBase64Image(selfieResp?.image) ||
      normalizeBase64Image(guestSelfie?.image) ||
      normalizeBase64Image(rawSelfie) ||
      "";

    setUser({
      name,
      mobile,
      status,
      selfie,
    });
  }, []);

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="min-h-screen bg-white border border-gray-200 flex flex-col">
        <div className="m-3 border border-gray-200 rounded-2xl overflow-hidden flex flex-col flex-1">
          <LoginHeader logo={LogoImage} />

          <div className="flex-1 bg-white flex flex-col items-center pt-8">
            {/* User Image */}
            <div className="w-60 h-60 rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center mb-6 overflow-hidden">
              <img
                src={user.selfie || LogoImage}
                alt="User"
                className="w-full h-full object-cover scale-150"
              />
            </div>

            {/* User Details */}
            <div className="w-full px-8 space-y-4">
              <div className="flex items-center">
                <p className="text-sm text-gray-500">Full Name :&nbsp;</p>
                <p className="text-sm font-semibold text-gray-900">
                  {user.name}
                </p>
              </div>

              <div className="flex items-center">
                <p className="text-sm text-gray-500">Mobile Number :&nbsp;</p>
                <p className="text-sm font-semibold text-gray-700">
                  {user.mobile}
                </p>
              </div>

              <div className="flex items-center">
                <p className="text-sm text-gray-500">Status :&nbsp;</p>
                <p
                  className={`text-sm font-semibold ${
                    user.status === 1 ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {user.status === 1 ? "Verified" : "Pending"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
