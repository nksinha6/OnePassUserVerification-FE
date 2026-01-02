// import { useRef, useEffect, useState } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { getAadhaarData, matchFace } from "../services/aadhaarService";

// /* 🔹 Single source of truth */
// const OVAL_WIDTH = 260;
// const OVAL_HEIGHT = 360;

// function MobileSelfiePage() {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

//   const [matchResult, setMatchResult] = useState(null);
//   const [aadhaarData, setAadhaarData] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);

//   const digilockerResponse = JSON.parse(
//     sessionStorage.getItem("digilockerResponse")
//   );

//   const verificationId = digilockerResponse?.verification_id;
//   const referenceId = digilockerResponse?.reference_id;

//   const AADHAAR_STORAGE_KEY = "aadhaarData";

//   /* ---------------- FETCH AADHAAR DATA ---------------- */
//   useEffect(() => {
//     const fetchAadhaarData = async () => {
//       if (!verificationId || !referenceId) {
//         toast.error("Verification IDs not found");
//         return;
//       }
//       try {
//         setIsLoading(true);
//         // const data = await getAadhaarData(verificationId, referenceId);
//         // setAadhaarData(data);
//         const data = {
//           reference_id: 29662,
//           verification_id: "25ee09f9-2ff9-46e4-8a53-b8a97c3c1c3e",
//           status: "SUCCESS",
//           uid: "xxxxxxxx5647",
//           care_of: "S/O: Fakkirappa Dollin",
//           dob: "02-02-1995",
//           gender: "M",
//           name: "Mallesh Fakkirappa Dollin",
//           photo_link:
//             "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",
//           split_address: {
//             country: "India",
//             dist: "Haveri",
//             house: "Shri Kanaka Nilaya",
//             landmark: "",
//             pincode: "581115",
//             po: "Ranebennur",
//             state: "Karnataka",
//             street: "Umashankar Nagar 1st Main 5th Cross",
//             subdist: "Ranibennur",
//             vtc: "Ranibennur",
//           },
//           year_of_birth: 1995,
//           xml_file:
//             "https://cf-sbox-payoutbankvalidationsvc-esign.s3.ap-south-1.amazonaws.com/digilocker/1619643/aadhaar/29662_1764240536133718749.xml?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASWG7WQ7N2JV7MENU%2F20251127%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251127T104856Z&X-Amz-Expires=172800&X-Amz-SignedHeaders=host&x-id=GetObject&X-Amz-Signature=b5a2edcfcfec918dbe76dadb3dc5a2731073a9d1addda60fc5bf57658ae02bc9",
//           message: "Aadhaar Card Exists",
//         };
//         setAadhaarData(data);
//         localStorage.setItem(AADHAAR_STORAGE_KEY, JSON.stringify(data));
//       } catch {
//         toast.error("Failed to fetch Aadhaar data");
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchAadhaarData();
//   }, [verificationId, referenceId]);

//   /* ---------------- CAMERA ---------------- */
//   useEffect(() => {
//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: "user" },
//         });
//         videoRef.current.srcObject = stream;
//       } catch {
//         toast.error("Camera permission denied");
//       }
//     };
//     startCamera();

//     return () => {
//       if (videoRef.current?.srcObject) {
//         videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
//       }
//     };
//   }, []);

//   /* ---------------- HELPERS ---------------- */
//   const dataUrlToFile = (dataUrl, filename) => {
//     const arr = dataUrl.split(",");
//     const mime = arr[0].match(/:(.*?);/)[1];
//     const bstr = atob(arr[1]);
//     let n = bstr.length;
//     const u8arr = new Uint8Array(n);
//     while (n--) u8arr[n] = bstr.charCodeAt(n);
//     return new File([u8arr], filename, { type: mime });
//   };

//   /* ---------------- CAPTURE SELFIE ---------------- */
//   const captureSelfie = async () => {
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext("2d");
//     const video = videoRef.current;

//     const vw = video.videoWidth;
//     const vh = video.videoHeight;

//     // Crop matches oval aspect ratio
//     const cropWidth = vw * 0.6;
//     const cropHeight = cropWidth * (OVAL_HEIGHT / OVAL_WIDTH);

//     const sx = (vw - cropWidth) / 2;
//     const sy = (vh - cropHeight) / 2;

//     ctx.drawImage(video, sx, sy, cropWidth, cropHeight, 0, 0, 480, 480);
//     const selfieDataUrl = canvas.toDataURL("image/jpeg", 0.8);

//     if (!aadhaarData?.photo_link) {
//       toast.error("Aadhaar photo missing");
//       return;
//     }

//     try {
//       setIsLoading(true);

//       const selfieFile = dataUrlToFile(selfieDataUrl, "selfie.jpg");
//       const aadhaarFile = dataUrlToFile(
//         `data:image/jpeg;base64,${aadhaarData.photo_link}`,
//         "aadhaar.jpg"
//       );

//       const result = await matchFace(
//         verificationId,
//         selfieFile,
//         aadhaarFile,
//         0.75
//       );

//       if (result.face_match_result === "YES") {
//         toast.success("MATCH ✔ Face verified");
//         setMatchResult("MATCH ✔");
//       } else {
//         toast.error("NO MATCH ❌");
//         setMatchResult("NO MATCH ❌");
//       }
//     } catch {
//       toast.error("Face verification failed");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /* ---------------- UI ---------------- */
//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <ToastContainer />

//       <div className="relative w-[380px] h-[750px] bg-black rounded-3xl overflow-hidden shadow-2xl">
//         {/* Camera */}
//         <video
//           ref={videoRef}
//           autoPlay
//           playsInline
//           muted
//           className="absolute inset-0 w-full h-full object-cover"
//         />
//         {/* 🌫️ OUTER AREA BLUR (MOBILE SAFE) */}
//         <svg
//           className="absolute inset-0 z-10 pointer-events-none"
//           width="100%"
//           height="100%"
//           viewBox="0 0 375 667"
//           preserveAspectRatio="none"
//         >
//           <defs>
//             {/* Inverted mask: hole in the center */}
//             <mask id="outerBlurMask">
//               <rect width="100%" height="100%" fill="white" />
//               <ellipse
//                 cx="187.5"
//                 cy="333.5"
//                 rx={OVAL_WIDTH / 2}
//                 ry={OVAL_HEIGHT / 2}
//                 fill="black"
//               />
//             </mask>
//           </defs>

//           {/* Blur + dim ONLY outside */}
//           <foreignObject width="100%" height="100%" mask="url(#outerBlurMask)">
//             <div
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 background: "rgba(0, 0, 0, 0.74)",
//                 borderRadius: "16px",
//                 boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
//                 backdropFilter: "blur(5.9px)",
//                 WebkitBackdropFilter: "blur(5.9px)",
//                 border: "1px solid rgba(255, 255, 255, 0.09)",
//               }}
//             />
//           </foreignObject>

//           {/* Oval border */}
//           <ellipse
//             cx="187.5"
//             cy="333.5"
//             rx={OVAL_WIDTH / 2}
//             ry={OVAL_HEIGHT / 2}
//             fill="none"
//             stroke="white"
//             strokeWidth="2"
//           />
//         </svg>

//         {/* Text */}
//         <div className="absolute top-6 w-full text-center z-20">
//           <h2 className="text-white text-lg font-semibold">
//             Verify your identity
//           </h2>
//           <p className="text-white/80 text-sm mt-1">
//             Position your face in the oval below
//           </p>
//         </div>

//         {/* Canvas */}
//         <canvas ref={canvasRef} width="480" height="480" className="hidden" />

//         {/* Capture Button */}
//         <button
//           onClick={captureSelfie}
//           disabled={isLoading}
//           className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
//         >
//           <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center">
//             <div className="w-12 h-12 bg-white rounded-full" />
//           </div>
//         </button>

//         {/* Result */}
//         {matchResult && (
//           <div
//             className={`absolute top-24 left-1/2 -translate-x-1/2 z-20 font-bold ${
//               matchResult.includes("MATCH") ? "text-green-400" : "text-red-400"
//             }`}
//           >
//             {matchResult}
//           </div>
//         )}

//         {/* Loading */}
//         {isLoading && (
//           <div className="absolute inset-0 bg-black/60 z-30 flex items-center justify-center">
//             <div className="text-white text-center">
//               <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
//               Verifying...
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default MobileSelfiePage;

// -- Mock Selfie Capture Testing --

import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getAadhaarData, matchFace } from "../services/aadhaarService";

/* 🔹 Single source of truth */
const OVAL_WIDTH = 260;
const OVAL_HEIGHT = 360;

function MobileSelfiePage() {
  const [matchResult, setMatchResult] = useState(null);
  const [aadhaarData, setAadhaarData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // const digilockerResponse = JSON.parse(
  //   sessionStorage.getItem("digilockerResponse")
  // );

  // const verificationId = digilockerResponse?.verification_id;
  // const referenceId = digilockerResponse?.reference_id;
  const verificationId = "25ee09f9-2ff9-46e4-8a53-b8a97c3c1c3e";
  const referenceId = 29662;

  const AADHAAR_STORAGE_KEY = "aadhaarData";

  /* ---------------- FETCH AADHAAR DATA ---------------- */
  useEffect(() => {
    const fetchAadhaarData = async () => {
      if (!verificationId || !referenceId) {
        toast.error("Verification IDs not found");
        return;
      }

      try {
        setIsLoading(true);

        // 🔹 Replace with real API in production
        const data = {
          reference_id: 29662,
          verification_id: "25ee09f9-2ff9-46e4-8a53-b8a97c3c1c3e",
          status: "SUCCESS",
          uid: "xxxxxxxx5647",
          care_of: "S/O: Fakkirappa Dollin",
          dob: "02-02-1995",
          gender: "M",
          name: "Mallesh Fakkirappa Dollin",
          photo_link:
            "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",
          split_address: {
            country: "India",
            dist: "Haveri",
            house: "Shri Kanaka Nilaya",
            landmark: "",
            pincode: "581115",
            po: "Ranebennur",
            state: "Karnataka",
            street: "Umashankar Nagar 1st Main 5th Cross",
            subdist: "Ranibennur",
            vtc: "Ranibennur",
          },
          year_of_birth: 1995,
          xml_file:
            "https://cf-sbox-payoutbankvalidationsvc-esign.s3.ap-south-1.amazonaws.com/digilocker/1619643/aadhaar/29662_1764240536133718749.xml?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIASWG7WQ7N2JV7MENU%2F20251127%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251127T104856Z&X-Amz-Expires=172800&X-Amz-SignedHeaders=host&x-id=GetObject&X-Amz-Signature=b5a2edcfcfec918dbe76dadb3dc5a2731073a9d1addda60fc5bf57658ae02bc9",
          message: "Aadhaar Card Exists",
        };

        setAadhaarData(data);
        localStorage.setItem(AADHAAR_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        toast.error("Failed to fetch Aadhaar data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAadhaarData();
  }, [verificationId, referenceId]);

  /* ---------------- BASE64 → FILE ---------------- */
  const base64ToFile = (base64, filename) => {
    const dataUrl = `data:image/jpeg;base64,${base64}`;
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) u8arr[n] = bstr.charCodeAt(n);

    return new File([u8arr], filename, { type: mime });
  };

  /* ---------------- FACE MATCH (NO CAMERA) ---------------- */
  const captureSelfie = async () => {
    if (!aadhaarData?.photo_link) {
      toast.error("Aadhaar photo missing");
      return;
    }

    try {
      setIsLoading(true);

      // 🔹 Using Base64 image directly
      const selfieFile = base64ToFile(aadhaarData.photo_link, "selfie.jpg");

      const aadhaarFile = base64ToFile(aadhaarData.photo_link, "aadhaar.jpg");

      const result = await matchFace(
        verificationId,
        selfieFile,
        aadhaarFile,
        0.75
      );

      if (result?.face_match_result === "YES") {
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
        {/* 🌫️ OUTER BLUR MASK */}
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
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
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
            Face verification using Aadhaar photo
          </p>
        </div>

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
