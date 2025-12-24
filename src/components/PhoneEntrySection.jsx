import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { UI_TEXT } from "../constants/ui";
import { validatePhoneNumber } from "../utility/loginUtils";

const PhoneEntrySection = ({ initialPhone, onSubmit, isLoading, apiError }) => {
  const [phone, setPhone] = useState(initialPhone);
  const [error, setError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (apiError) {
      setError(apiError);
    }
  }, [apiError]);

  const handlePhoneChange = (value) => {
    setPhone(value);
    if (error) setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    const validationError = validatePhoneNumber(phone);
    if (validationError) {
      setError(validationError);
      return;
    }

    onSubmit(phone);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col flex-1" noValidate>
      <div className="flex flex-col flex-1 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            {UI_TEXT.MOBILE_NUMBER_LABEL}
          </label>
          <PhoneInput
            international
            defaultCountry="IN"
            countryCallingCodeEditable={false}
            value={phone}
            onChange={handlePhoneChange}
            disabled={isLoading}
            placeholder={UI_TEXT.PHONE_PLACEHOLDER}
            className={`w-full rounded-lg border px-3 py-3 text-sm ${
              error ? "border-red-300" : "border-gray-300"
            }`}
            autoFocus
          />
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <div className="mt-auto space-y-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-brand hover:bg-brand-dark rounded-lg text-white font-medium disabled:opacity-50 transition-colors"
          >
            {isLoading ? UI_TEXT.SENDING_OTP_BUTTON : UI_TEXT.SEND_OTP_BUTTON}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PhoneEntrySection;
