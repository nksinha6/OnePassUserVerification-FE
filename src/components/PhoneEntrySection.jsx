import { useState, useEffect } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { UI_TEXT } from "@/constants/ui";
import { validatePhoneNumber } from "@/utility/loginUtils";

const PhoneEntrySection = ({ initialPhone, onSubmit, isLoading, apiError }) => {
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState("");

  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  const handlePhoneChange = (value) => {
    setPhone(`+${value}`);
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validatePhoneNumber(phone);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit(phone);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col space-y-6"
      noValidate
    >
      {/* Phone Input */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-700">
          {UI_TEXT.MOBILE_NUMBER_LABEL}
        </label>

        <PhoneInput
          country="in"
          value={phone.replace("+", "")}
          onChange={handlePhoneChange}
          disabled={isLoading}
          countryCodeEditable={false}
          masks={{ in: "..... ....." }}
          containerClass="!w-full custom-phone-input"
          inputClass={`!w-full !h-15 !pl-13 !pr-4 !rounded-xl !border ${
            error ? "!border-red-300" : "!border-gray-300"
          } !focus:outline-none !focus:ring-2 !focus:ring-brand`}
          buttonClass="!border-0 !bg-transparent !pl-3"
        />

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Button directly below input */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 px-4 bg-brand hover:bg-brand-dark rounded-lg text-white font-medium disabled:opacity-50 transition-colors"
      >
        {isLoading ? UI_TEXT.SENDING_OTP_BUTTON : UI_TEXT.SEND_OTP_BUTTON}
      </button>
    </form>
  );
};

export default PhoneEntrySection;
