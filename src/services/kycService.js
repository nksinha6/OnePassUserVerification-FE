// services/kycService.js

export const uploadPassport = async (imageBase64) => {
  try {
    // base64 -> blob
    const response = await fetch(imageBase64);

    const blob = await response.blob();

    // blob -> file
    const file = new File([blob], "passport.png", {
      type: "image/png",
    });

    // form data
    const formData = new FormData();

    formData.append("file", file);

    // api call
    const apiResponse = await fetch("/api/Kyc/passport", {
      method: "POST",
      body: formData,
    });

    const data = await apiResponse.json();

    return data;
  } catch (error) {
    console.error("Passport Upload Error:", error);
    throw error;
  }
};
