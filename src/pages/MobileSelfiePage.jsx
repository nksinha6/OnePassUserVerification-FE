import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAadhaarData,
  matchFace,
  persistGuestSelfie,
  persistAadhaarVerify,
} from "../services/aadhaarService";
import { ROUTES } from "@/constants/ui";
import { useCamera } from "@/contexts/CameraContext";

/* 🔹 Single source of truth */
const OVAL_WIDTH = 260;
const OVAL_HEIGHT = 360;

/* 🔹 Generate new verification ID for Face Match */
const generateVerificationId = () => {
  return crypto.randomUUID();
};

function MobileSelfiePage() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [matchResult, setMatchResult] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { streamRef, stopCamera } = useCamera();

  const digilockerResponse = JSON.parse(
    sessionStorage.getItem("digilockerResponse"),
  );

  console.log("📦 DigiLocker Response:", digilockerResponse);

  // 🔹 Used ONLY for Aadhaar fetch
  const verificationId = digilockerResponse?.verification_id;
  const referenceId = digilockerResponse?.reference_id;
  const phoneCode = digilockerResponse?.countryCode;
  const phoneNumber = digilockerResponse?.phoneNumber;

  const AADHAAR_STORAGE_KEY = "aadhaarData";
  const SELFIE_STORAGE_KEY = "capturedSelfie";

  const navigate = useNavigate();

  /* ---------------- FETCH AADHAAR DATA ---------------- */
  useEffect(() => {
    const fetchAadhaarData = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Fetching Aadhaar data...");

        const data = await getAadhaarData(
          verificationId,
          referenceId,
          phoneCode,
          phoneNumber,
        );

        setAadhaarData(data);
        localStorage.setItem(AADHAAR_STORAGE_KEY, JSON.stringify(data));
        sessionStorage.setItem(AADHAAR_STORAGE_KEY, JSON.stringify(data));

        console.log("✅ Aadhaar data fetched successfully", data);
      } catch (error) {
        console.error("❌ Failed to fetch Aadhaar data", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAadhaarData();
  }, [verificationId, referenceId]);

  /* ---------------- CAMERA ---------------- */

  useEffect(() => {
    if (streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play();
    }
  }, []);

  /* ---------------- HELPERS ---------------- */
  const dataUrlToFile = (dataUrl, filename) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  /* ---------------- CAPTURE SELFIE ---------------- */
  const captureSelfie = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const video = videoRef.current;

    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const cropWidth = vw * 0.6;
    const cropHeight = cropWidth * (OVAL_HEIGHT / OVAL_WIDTH);

    const sx = (vw - cropWidth) / 2;
    const sy = (vh - cropHeight) / 2;

    ctx.drawImage(video, sx, sy, cropWidth, cropHeight, 0, 0, 480, 480);
    const selfieDataUrl = canvas.toDataURL("image/jpeg", 0.8);

    sessionStorage.setItem(SELFIE_STORAGE_KEY, selfieDataUrl);
    console.log("💾 Selfie stored in sessionStorage");

    if (!aadhaarData?.photo_link) {
      console.error("❌ Aadhaar photo missing");
      return;
    }

    try {
      setIsLoading(true);

      const faceMatchVerificationId = generateVerificationId();
      console.log("🆔 Face Match Verification ID:", faceMatchVerificationId);

      const selfieFile = dataUrlToFile(selfieDataUrl, "selfie.jpg");
      const aadhaarFile = dataUrlToFile(
        `data:image/jpeg;base64,${aadhaarData.photo_link}`,
        "aadhaar.jpg",
      );

      console.log("📤 Calling Face Match API...");

      const result = await matchFace(
        faceMatchVerificationId,
        selfieFile,
        aadhaarFile,
        0.75,
      );

      console.log("📸 Face Match Result:", result);

      if (result.face_match_result === "YES") {
        console.log("✅ MATCH ✔ Face verified");
        setMatchResult("MATCH ✔");

        try {
          const persistSelfieResponse = await persistGuestSelfie(
            phoneCode,
            phoneNumber,
            selfieFile,
          );
          console.log("✅ Selfie saved successfully");
          sessionStorage.setItem(
            "selfiePersistResponse",
            JSON.stringify(persistSelfieResponse),
          );

          const country = aadhaarData?.split_address?.country;

          const aadhaarVerifyResponse = await persistAadhaarVerify(
            aadhaarData?.uid,
            phoneCode,
            phoneNumber,
            aadhaarData?.name,
            aadhaarData?.gender,
            aadhaarData?.dob,
            country === "India" ? "Indian" : country,
            aadhaarData?.split_address ?? {},
          );
          console.log("✅ Aadhaar verification saved");
          sessionStorage.setItem(
            "aadhaarVerified",
            JSON.stringify(aadhaarVerifyResponse),
          );
          stopCamera();
          navigate(ROUTES.SUCCESS, { replace: true });
        } catch (error) {
          console.error("❌ Failed to persist selfie / Aadhaar verify", error);
        }
      } else {
        console.error("❌ NO MATCH");
        setMatchResult("NO MATCH ❌");
      }
    } catch (error) {
      console.error("❌ Face verification failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="relative w-[380px] h-[750px] bg-black rounded-3xl overflow-hidden shadow-2xl">
        {/* Camera */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          webkit-playsinline="true"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Blur Mask */}
        <svg
          className="absolute inset-0 z-10 pointer-events-none"
          width="100%"
          height="100%"
          viewBox="0 0 375 667"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="outerBlurMask">
              <rect width="100%" height="100%" fill="white" />
              <ellipse
                cx="187.5"
                cy="333.5"
                rx={OVAL_WIDTH / 2}
                ry={OVAL_HEIGHT / 2}
                fill="black"
              />
            </mask>
          </defs>

          <foreignObject width="100%" height="100%" mask="url(#outerBlurMask)">
            <div
              style={{
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.74)",
                backdropFilter: "blur(5.9px)",
              }}
            />
          </foreignObject>

          <ellipse
            cx="187.5"
            cy="333.5"
            rx={OVAL_WIDTH / 2}
            ry={OVAL_HEIGHT / 2}
            fill="none"
            stroke="white"
            strokeWidth="2"
          />
        </svg>

        {/* Header */}
        <div className="absolute top-6 w-full text-center z-20">
          <h2 className="text-white text-lg font-semibold">
            Verify your identity
          </h2>
          <p className="text-white/80 text-sm mt-1">
            Position your face in the oval below
          </p>
        </div>

        {/* Canvas */}
        <canvas ref={canvasRef} width="480" height="480" className="hidden" />

        {/* Capture Button */}
        <button
          onClick={captureSelfie}
          disabled={isLoading}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
            <div className="w-12 h-12 bg-white rounded-full" />
          </div>
        </button>

        {/* Result */}
        {matchResult && (
          <div
            className={`absolute top-24 left-1/2 -translate-x-1/2 z-20 font-bold ${
              matchResult.includes("MATCH") ? "text-green-400" : "text-red-400"
            }`}
          >
            {matchResult}
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              Verifying...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MobileSelfiePage;
