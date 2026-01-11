import { useRef, useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAadhaarData, matchFace } from "../services/aadhaarService";

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

  const digilockerResponse = JSON.parse(
    sessionStorage.getItem("digilockerResponse")
  );

  // 🔹 Used ONLY for Aadhaar fetch
  const verificationId = digilockerResponse?.verification_id;
  const referenceId = digilockerResponse?.reference_id;

  const AADHAAR_STORAGE_KEY = "aadhaarData";

  /* ---------------- FETCH AADHAAR DATA ---------------- */
  useEffect(() => {
    const fetchAadhaarData = async () => {
      // if (!verificationId || !referenceId) {
      //   toast.error("Verification IDs not found");
      //   return;
      // }

      try {
        setIsLoading(true);
        const data = await getAadhaarData(verificationId, referenceId);
        setAadhaarData(data);
        localStorage.setItem(AADHAAR_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch Aadhaar data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAadhaarData();
  }, [verificationId, referenceId]);

  /* ---------------- CAMERA ---------------- */
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        videoRef.current.srcObject = stream;
      } catch {
        toast.error("Camera permission denied");
      }
    };

    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
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

    // Crop matches oval aspect ratio
    const cropWidth = vw * 0.6;
    const cropHeight = cropWidth * (OVAL_HEIGHT / OVAL_WIDTH);

    const sx = (vw - cropWidth) / 2;
    const sy = (vh - cropHeight) / 2;

    ctx.drawImage(video, sx, sy, cropWidth, cropHeight, 0, 0, 480, 480);
    const selfieDataUrl = canvas.toDataURL("image/jpeg", 0.8);

    if (!aadhaarData?.photo_link) {
      toast.error("Aadhaar photo missing");
      return;
    }

    try {
      setIsLoading(true);

      // 🔹 NEW verification ID for every selfie attempt
      const faceMatchVerificationId = generateVerificationId();
      console.log("Face Match Verification ID:", faceMatchVerificationId);

      const selfieFile = dataUrlToFile(selfieDataUrl, "selfie.jpg");
      const aadhaarFile = dataUrlToFile(
        `data:image/jpeg;base64,${aadhaarData.photo_link}`,
        "aadhaar.jpg"
      );

      const result = await matchFace(
        faceMatchVerificationId, // ✅ NEW ID HERE
        selfieFile,
        aadhaarFile,
        0.75
      );

      console.log("Face Match Result:", result);

      if (result.face_match_result === "YES") {
        toast.success("MATCH ✔ Face verified");
        setMatchResult("MATCH ✔");
      } else {
        toast.error("NO MATCH ❌");
        setMatchResult("NO MATCH ❌");
      }
    } catch (error) {
      console.error(error);
      toast.error("Face verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <ToastContainer />

      <div className="relative w-[380px] h-[750px] bg-black rounded-3xl overflow-hidden shadow-2xl">
        {/* Camera */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* 🌫️ Outer Blur */}
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
                background: "rgba(0, 0, 0, 0.74)",
                backdropFilter: "blur(5.9px)",
                WebkitBackdropFilter: "blur(5.9px)",
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

        {/* Text */}
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
