import React, { useEffect, useRef, useState } from "react";
import { Image as ImageIcon, Camera, Zap } from "lucide-react";
import MobileHeader from "../Components/MobileHeader";
import { useNavigate } from "react-router-dom";

const PassportManualVerification = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const [flashOn, setFlashOn] = useState(false);

  // ✅ FRONT / BACK STEP
  const [captureStep, setCaptureStep] = useState("front");

  // ✅ STORED IMAGES
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const [scanPosition, setScanPosition] = useState(0);
  const [scanDirection, setScanDirection] = useState(1);

  useEffect(() => {
    if (!isProcessing) return;

    // ✅ Progress Animation
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // stop at 100
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }

        return prev + 1;
      });
    }, 120);

    // ✅ Independent Scan Animation
    const scanInterval = setInterval(() => {
      setScanPosition((prev) => {
        // moving down
        if (scanDirection === 1) {
          if (prev >= 99) {
            setScanDirection(-1);
            return prev - 4;
          }

          return prev + 4;
        }

        // moving up
        if (prev <= 0) {
          setScanDirection(1);
          return prev + 4;
        }

        return prev - 4;
      });
    }, 40);

    return () => {
      clearInterval(progressInterval);
      clearInterval(scanInterval);
    };
  }, [isProcessing, scanDirection]);

  useEffect(() => {
    if (progress !== 100) return;

    const timer = setTimeout(() => {
      navigate("/confirm-passport-details");
    }, 5000);

    return () => clearTimeout(timer);
  }, [progress, navigate]);

  // 🎥 START CAMERA
  const startCamera = async () => {
    try {
      // stop previous stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Camera error:", error);
    }
  };

  // 🛑 STOP CAMERA
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  // 🎥 CAMERA INIT
  useEffect(() => {
    startCamera();

    return () => {
      stopCamera();
    };
  }, []);

  // 📸 CAPTURE IMAGE
  const captureImage = () => {
    const canvas = document.createElement("canvas");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");

    // ✅ FRONT CAPTURE
    if (captureStep === "front") {
      setFrontImage(image);

      console.log("Front Captured");

      // move to back capture
      setCaptureStep("back");

      return;
    }

    // ✅ BACK CAPTURE
    if (captureStep === "back") {
      setBackImage(image);

      console.log("Back Captured");

      console.log({
        front: frontImage,
        back: image,
      });

      stopCamera();

      //   navigate("/passport-reading");
      setIsProcessing(true);

      // navigate OR upload API here
    }
  };

  const handleCancelProcessing = async () => {
    // stop processing UI
    setIsProcessing(false);

    // reset progress
    setProgress(0);

    // reset scanner
    setScanPosition(0);
    setScanDirection(1);

    // reset flow
    setCaptureStep("front");

    // clear images
    setFrontImage(null);
    setBackImage(null);

    // ✅ restart camera
    await startCamera();
  };

  if (isProcessing) {
    return (
      <div className="h-dvh bg-[#f5f5f5] px-4 py-5 flex flex-col">
        {/* HEADER */}
        <MobileHeader />

        {/* SCANNER CARD */}

        <div className="mt-2 rounded-[16px] overflow-hidden bg-white shadow-sm">
          <div className="bg-[#e8eceb] px-4 py-3">
            <p className="text-[#4d645b] text-[10px] font-bold tracking-[2px]">
              SCANNING IN PROGRESS
            </p>
          </div>

          <div className="relative h-[190px] bg-[#f7f7f7] overflow-hidden">
            <div
              className="
      absolute left-1/2 top-1/2
      -translate-x-1/2 -translate-y-1/2
      w-[120px] h-[150px]
      border border-[#c8c8c8]
      rounded-[60px]
    "
            />

            <div
              className="absolute left-0 w-full h-[2px] bg-[#6d8b81]"
              style={{
                top: `${scanPosition}%`,
                transition: "top 40ms linear",
              }}
            />

            <div className="absolute left-6 top-0 h-full w-[1px] bg-[#d3d3d3]" />
            <div className="absolute right-6 top-0 h-full w-[1px] bg-[#d3d3d3]" />

            {/* <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[11px] text-[#4f4f4f]">
              Capturing Image...
            </p> */}
          </div>
        </div>

        {/* CONTENT */}
        <div className="mt-5 text-center px-2">
          <h1 className="text-[20px] font-bold text-[#172b29]">
            Reading your passport
          </h1>

          <p className="mt-2 text-sm text-[#5f6368]">
            Please wait while we extract information from your document. This
            usually takes a few seconds.
          </p>
        </div>

        {/* STATUS */}
        <div className="mt-5 bg-[#eef1f1] rounded-[16px] p-4">
          {/* STATUS LABEL */}
          <p className="text-[10px] tracking-[2px] text-[#666]">STATUS</p>

          {/* STATUS ROW */}
          <div className="flex items-center justify-between mt-3">
            <p className="text-[#48675f] text-[14px] font-semibold">
              Extracting data...
            </p>

            <p className="text-[#4f4f4f] text-[14px] font-medium">
              {progress}%
            </p>
          </div>

          {/* PROGRESS */}
          <div className="mt-4 h-2 bg-[#d7dfde] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#48675f] rounded-full transition-all duration-200"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        </div>

        <div className="flex-1" />

        {/* CANCEL */}
        <button
          onClick={handleCancelProcessing}
          className="h-14 rounded-md bg-[#1B3631] text-white text-[18px] font-semibold"
        >
          Cancel request
        </button>
      </div>
    );
  }

  return (
    <div className="h-dvh bg-[#f5f5f5] px-4 py-5 flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="shrink-0">
        <MobileHeader />

        <div className="text-center mt-2">
          {/* TITLE */}
          <h2 className="text-xl font-bold text-[#1b3631]">
            {captureStep === "front"
              ? "Scan Passport Front"
              : "Scan Passport Back"}
          </h2>

          {/* DESCRIPTION */}
          <p className="text-sm text-[#5f6368] mt-3 px-2 leading-6">
            {captureStep === "front"
              ? "Please align the front page of your passport within the frame. Ensure the MRZ code is visible."
              : "Now, please align the back page or the inside cover of your passport within the frame."}
          </p>
        </div>
      </div>

      {/* CENTER CONTENT */}
      <div className="flex-1 flex flex-col justify-center">
        {/* CAMERA */}
        <div
          className="
          relative rounded-[10px] overflow-hidden
          h-[42vh]
          min-h-[260px]
          max-h-[420px]
          bg-black shadow-xl
        "
        >
          {/* VIDEO */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* FRONT OVERLAY */}
          {captureStep === "front" && (
            <>
              <div className="absolute inset-0 bg-black/20" />

              <div className="absolute inset-2">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white rounded-tl-md" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white rounded-tr-md" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white rounded-bl-md" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white rounded-br-md" />
              </div>
            </>
          )}

          {/* BACK OVERLAY */}
          {captureStep === "back" && (
            <>
              <div className="absolute inset-0 bg-black/20" />

              <div className="absolute inset-2">
                <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white rounded-tl-md" />
                <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white rounded-tr-md" />
                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white rounded-bl-md" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white rounded-br-md" />
              </div>
            </>
          )}

          {/* FLASH */}
          {flashOn && (
            <div className="absolute inset-0 bg-white/30 pointer-events-none" />
          )}
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="shrink-0">
        {/* CONTROLS */}
        <div className="flex items-center justify-center gap-15 mt-5">
          {/* GALLERY */}
          <button className="w-11 h-11 rounded-[6px] bg-[#d9dcdf] flex items-center justify-center">
            <ImageIcon size={18} className="text-[#5d6368]" />
          </button>

          {/* CAMERA */}
          <button
            onClick={captureImage}
            className="
            w-16 h-14 rounded-[6px]
            bg-[#1B3631]
            shadow-md flex items-center justify-center
          "
          >
            <Camera size={24} className="text-white" />
          </button>

          {/* FLASH */}
          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`
              w-11 h-11 rounded-[6px]
              flex items-center justify-center
              ${flashOn ? "bg-yellow-300" : "bg-[#d9dcdf]"}
            `}
          >
            <Zap
              size={18}
              className={flashOn ? "text-yellow-700" : "text-[#5d6368]"}
            />
          </button>
        </div>

        {/* MAIN BUTTON */}
        <button
          onClick={captureImage}
          className="
          mt-6 w-full h-14 rounded-[6px]
          bg-[#1B3631]
          text-white text-lg font-bold
        "
        >
          {captureStep === "front" ? "Capture Front Page" : "Capture Back Page"}
        </button>
      </div>
    </div>
  );
};

export default PassportManualVerification;
