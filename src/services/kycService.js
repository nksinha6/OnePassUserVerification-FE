// services/kycService.js

export const uploadPassport = async (front, back) => {
  try {
    const formData = new FormData();

    // Front image
    if (front) {
      const frontResponse = await fetch(front);
      const frontBlob = await frontResponse.blob();

      const frontFile = new File([frontBlob], "front-passport.png", {
        type: "image/png",
      });

      formData.append("front", frontFile);
    }

    // Back image
    if (back) {
      const backResponse = await fetch(back);
      const backBlob = await backResponse.blob();

      const backFile = new File([backBlob], "back-passport.png", {
        type: "image/png",
      });

      formData.append("back", backFile);
    }

    // API call
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
