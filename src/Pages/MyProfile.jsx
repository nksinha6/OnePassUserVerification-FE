import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle, Mail, Phone } from "lucide-react";
import MobileHeader from "../Components/MobileHeader";
import { getGuestByPhone } from "../services/guestService";
import UserIcon from "../assets/images/UserIcon.png";
import { updateGuestProfile } from "../services/guestService";

const MyProfile = () => {
  const navigate = useNavigate();

  const [profileImage] = useState(UserIcon);

  const [form, setForm] = useState({
    phone: "",
    email: "",
    firstName: "",
    surname: "",
    organization: "",
    laptopSerial: "",
    mobileIMEI: "",
  });

  const [profileLoaded, setProfileLoaded] = useState(false);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [hasCheckedProfile, setHasCheckedProfile] = useState(false);

  /* ---------------------------------------------
     FETCH PROFILE DATA
  --------------------------------------------- */
  useEffect(() => {
    const phoneCountryCodeRaw = sessionStorage.getItem("phoneCountryCode");
    const phoneNumberRaw = sessionStorage.getItem("phoneNumber");
    const visitorPhoneRaw = sessionStorage.getItem("visitorPhone");
    const sessionEmail = sessionStorage.getItem("userEmail");
    const businessType = sessionStorage.getItem("businessType");
    const businessPlan = sessionStorage.getItem("businessPlan");

    let countryCode = "";
    let phoneNumber = "";

    if (phoneCountryCodeRaw && phoneNumberRaw) {
      countryCode = phoneCountryCodeRaw;
      phoneNumber = phoneNumberRaw;

      if (phoneNumberRaw.includes("-")) {
        const parts = phoneNumberRaw.split("-");
        countryCode = parts[0];
        phoneNumber = parts[1];
      }
    } else if (visitorPhoneRaw) {
      const cleanPhone = visitorPhoneRaw.replace(/\s+/g, "");
      if (cleanPhone.startsWith("+")) {
        const withoutPlus = cleanPhone.substring(1);
        countryCode = withoutPlus.substring(0, 2);
        phoneNumber = withoutPlus.substring(2);
      }
    }

    if (!countryCode || !phoneNumber) return;

    const normalizedType = businessType?.toLowerCase();
    const normalizedPlan = businessPlan?.toLowerCase();

    const isEligibleType = ["corporate", "hospitality"].includes(
      normalizedType,
    );

    const isStarter = normalizedPlan === "starter";
    const isFullPlan = ["smb", "enterprise"].includes(normalizedPlan);

    setForm((prev) => ({
      ...prev,
      phone: `+${countryCode} ${phoneNumber}`,
      email: sessionEmail || prev.email,
    }));

    if (!isEligibleType) return;

    const fetchStarterEmail = async () => {
      try {
        const guestData = await getGuestByPhone(countryCode, phoneNumber);

        if (guestData?.id) {
          sessionStorage.setItem("guestId", guestData.id);
        }

        let firstName = "";
        let surname = "";

        if (guestData?.fullName) {
          const nameParts = guestData.fullName.trim().split(/\s+/);
          firstName = nameParts[0] || "";
          surname = nameParts.slice(1).join(" ") || "";
        }

        setForm((prev) => ({
          ...prev,
          email: guestData?.email || "",
          firstName,
          surname,
          organization: guestData?.organization || "",
        }));

        setProfileLoaded(true); // ✅ important
      } catch (error) {
        console.error("Starter email fetch error:", error.message);
      }
    };
    const fetchFullProfileData = async () => {
      try {
        const guestData = await getGuestByPhone(countryCode, phoneNumber);

        if (guestData) {
          let firstName = "";
          let surname = "";

          if (guestData?.fullName) {
            const nameParts = guestData.fullName.trim().split(/\s+/);
            firstName = nameParts[0] || "";
            surname = nameParts.slice(2).join(" ") || "";
          }

          setForm((prev) => ({
            ...prev,
            email: guestData?.email || prev.email,
            firstName,
            surname,
            organization: guestData?.organization || "",
          }));

          // setProfileLoaded(true); // ✅ important
        }
      } catch (error) {
        console.error("Full profile fetch error:", error.message);
      }
    };

    if (isStarter) fetchStarterEmail();
    else if (isFullPlan) fetchFullProfileData();
  }, []);

  /* ---------------------------------------------
     AUTO MODAL
  --------------------------------------------- */
  useEffect(() => {
    if (!profileLoaded) return; // ✅ wait for API

    const businessType = sessionStorage.getItem("businessType")?.toLowerCase();
    const businessPlan = sessionStorage.getItem("businessPlan")?.toLowerCase();

    const isCorporateStarter =
      businessType === "corporate" && businessPlan === "starter";

    if (!isCorporateStarter) return;
    if (hasCheckedProfile) return;

    const missing =
      !form.firstName?.trim() ||
      !form.surname?.trim() ||
      !form.organization?.trim();

    if (missing) setShowProfileModal(true);

    setHasCheckedProfile(true);
  }, [
    profileLoaded,
    form.firstName,
    form.surname,
    form.organization,
    hasCheckedProfile,
  ]);

  /* ---------------------------------------------
     PROGRESS BAR
  --------------------------------------------- */
  const totalFields = 7;

  const completedFields = useMemo(() => {
    return Object.values(form).filter((value) => value && value.trim() !== "")
      .length;
  }, [form]);

  const progress = Math.round((completedFields / totalFields) * 100);

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const businessType = sessionStorage.getItem("businessType")?.toLowerCase();
  const businessPlan = sessionStorage.getItem("businessPlan")?.toLowerCase();

  const isCorporateStarter =
    businessType === "corporate" && businessPlan === "starter";

  const requiredFields = isCorporateStarter
    ? [form.phone, form.email, form.organization, form.firstName, form.surname]
    : [form.phone, form.email, form.firstName, form.surname];

  const isContinueEnabled = requiredFields.every(
    (field) => field && field.trim() !== "",
  );

  return (
    <div className="w-full h-dvh bg-white flex justify-center items-center">
      <div className="w-full max-w-sm h-full bg-white flex flex-col overflow-hidden px-4 py-5">
        <MobileHeader title="My Profile" />

        <div className="flex-1 overflow-y-auto py-5 space-y-6">
          <div className="flex flex-col items-center">
            <img
              src={profileImage}
              alt="profile"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>

          <div className="bg-gray-100 rounded-md p-4 space-y-3">
            <div className="flex justify-between text-sm font-medium">
              <span>{progress}% Complete</span>
              <span>
                {completedFields} of {totalFields} fields
              </span>
            </div>

            <div className="w-full h-2 bg-gray-300 rounded-md">
              <div
                className="h-2 bg-[#1b3631] rounded-md transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <SectionTitle title="VERIFIED CONTACT INFO" />

          <InputField icon={<Phone size={16} />} value={form.phone} verified />
          <InputField icon={<Mail size={16} />} value={form.email} verified />

          <SectionTitle title="PERSONAL IDENTITY" />

          <div className="flex gap-3">
            <TextInput
              label="First Name"
              value={form.firstName}
              onChange={(e) => handleChange("firstName", e.target.value)}
            />
            <TextInput
              label="Surname"
              value={form.surname}
              onChange={(e) => handleChange("surname", e.target.value)}
            />
          </div>

          <TextInput
            label="Organization / Company"
            value={form.organization}
            onChange={(e) => handleChange("organization", e.target.value)}
          />

          <SectionTitle title="DEVICE INFORMATION" optional />

          <TextInput
            label="Laptop Serial Number"
            placeholder="e.g. SN-98234-XYZ"
            value={form.laptopSerial}
            onChange={(e) => handleChange("laptopSerial", e.target.value)}
          />

          <TextInput
            label="Mobile IMEI Number"
            placeholder="15-digit IMEI code"
            value={form.mobileIMEI}
            onChange={(e) => handleChange("mobileIMEI", e.target.value)}
          />
        </div>

        <div className="sticky bottom-0 bg-white">
          <button
            disabled={!isContinueEnabled}
            onClick={() => navigate("/history")}
            className={`w-full h-14 rounded-md font-semibold text-white transition-all
              ${
                isContinueEnabled
                  ? "bg-[#1b3631] hover:opacity-95"
                  : "bg-[#1b3631] opacity-40 cursor-not-allowed"
              }`}
          >
            Continue
          </button>
        </div>

        {showProfileModal && (
          <ProfileCompletionModal
            form={form}
            setForm={setForm}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </div>
    </div>
  );
};

/* ---------------------------------------------
   PROFILE MODAL
--------------------------------------------- */

const ProfileCompletionModal = ({ form, setForm, onClose }) => {
  const [localData, setLocalData] = useState({
    firstName: form.firstName || "",
    surname: form.surname || "",
    organization: form.organization || "",
  });

  const isValid =
    localData.firstName.trim() &&
    localData.surname.trim() &&
    localData.organization.trim();

  const handleSave = async () => {
    if (!isValid) return;

    const guestId = sessionStorage.getItem("guestId");

    const fullName = `${localData.firstName} ${localData.surname}`;

    await updateGuestProfile(guestId, fullName, localData.organization);

    setForm((prev) => ({
      ...prev,
      firstName: localData.firstName,
      surname: localData.surname,
      organization: localData.organization,
    }));

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-sm rounded-lg p-5 space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Complete Your Profile
        </h3>

        <TextInput
          label="First Name"
          value={localData.firstName}
          onChange={(e) =>
            setLocalData({ ...localData, firstName: e.target.value })
          }
        />

        <TextInput
          label="Surname"
          value={localData.surname}
          onChange={(e) =>
            setLocalData({ ...localData, surname: e.target.value })
          }
        />

        <TextInput
          label="Organization"
          value={localData.organization}
          onChange={(e) =>
            setLocalData({ ...localData, organization: e.target.value })
          }
        />

        <button
          disabled={!isValid}
          onClick={handleSave}
          className={`w-full h-12 rounded-md text-white font-medium ${
            isValid
              ? "bg-[#1b3631]"
              : "bg-[#1b3631] opacity-40 cursor-not-allowed"
          }`}
        >
          Save
        </button>
      </div>
    </div>
  );
};

/* --------------------------------------------- */

const SectionTitle = ({ title, optional }) => (
  <div className="flex items-center justify-between mt-4">
    <h4 className="text-xs font-bold text-gray-400 tracking-widest">{title}</h4>
    {optional && (
      <span className="text-[10px] bg-gray-200 px-2 py-1 rounded-md text-gray-500">
        OPTIONAL
      </span>
    )}
  </div>
);

const InputField = ({ icon, value, verified }) => (
  <div className="flex items-center bg-gray-100 px-4 py-3 rounded-md justify-between">
    <div className="flex items-center gap-3 text-gray-500 text-sm">
      {icon}
      {value}
    </div>
    {verified && <CheckCircle size={16} className="text-green-500" />}
  </div>
);

const TextInput = ({ label, value, placeholder, onChange }) => (
  <div className="w-full">
    <label className="block text-xs text-gray-400 mb-1">{label}</label>
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full h-12 bg-gray-100 px-4 rounded-md text-sm
                 focus:outline-none focus:ring-2 focus:ring-[#1b3631]/40"
    />
  </div>
);

export default MyProfile;
