import React, { useEffect, useRef, useState } from "react";
import MobileHeader from "../Components/MobileHeader";
import { useNavigate } from "react-router-dom";
import { uploadPassport } from "../services/kycService";

const PassportManualVerification = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  // ✅ FRONT / BACK STEP
  const [captureStep, setCaptureStep] = useState("front");

  // ✅ STORED IMAGES
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const [scanPosition, setScanPosition] = useState(0);
  const [scanDirection, setScanDirection] = useState(1);

  const [previewStep, setPreviewStep] = useState(null);

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

  // useEffect(() => {
  //   if (progress !== 100) return;

  //   const timer = setTimeout(() => {
  //     navigate("/confirm-passport-details");
  //   }, 5000);

  //   return () => clearTimeout(timer);
  // }, [progress, navigate]);

  useEffect(() => {
    const uploadData = async () => {
      try {
        // ✅ API CALL
        // const response = await uploadPassport(frontImage, backImage);
        const response = {
          full_name: "THAPLIYAL GARIMA",
          birth_place: "DELHI,DELHI",
          passport_number: "SP003369",
          dob: "01/07/1994",
          issue_date: "03/09/2024",
          expiry_date: "02/09/2034",
          nationality: "INDIAN",
          type: "Passport",
          mrz: null,
          face_image: null,
          address: "173-S CHITRA GUPTA ROAD ARAM BAGH PAHAR GANJ, DELHI",
          country_code: "IND",
          place_of_issue: "COIMBATORE",
          passport_type: "P",
          gender: "M",
        };
        console.log("Passport API Response:", response);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // optional success navigation
        navigate("/confirm-passport-details", {
          state: {
            passportData: response,
          },
        });
      } catch (error) {
        console.error("Upload failed:", error);

        setIsProcessing(false);

        // reset images
        setBackImage(null);
        setFrontImage(null);

        // go back to front capture
        setCaptureStep("front");

        // remove preview
        setPreviewStep(null);

        // reopen camera
        setTimeout(() => {
          startCamera();
        }, 100);
      }
    };

    if (isProcessing) {
      uploadData();
    }
  }, [isProcessing]); /* API Calling When Is Processing is true  */

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

  useEffect(() => {
    // reconnect stream whenever camera screen returns
    if (!previewStep && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.play().catch((err) => {
        console.log("Video play error:", err);
      });
    }
  }, [previewStep, captureStep]);

  const captureImage = () => {
    const canvas = document.createElement("canvas");

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL("image/png");

    // FRONT CAPTURE
    if (captureStep === "front") {
      setFrontImage(image);

      // show preview first
      setPreviewStep("front-preview");

      return;
    }

    // BACK CAPTURE
    if (captureStep === "back") {
      setBackImage(image);

      // show preview first
      setPreviewStep("back-preview");

      return;
    }
  };

  const handleFrontNext = () => {
    setPreviewStep(null);
    setCaptureStep("back");
  };

  const handleBackSubmit = () => {
    stopCamera();

    setPreviewStep(null);

    setIsProcessing(true);

    console.log({
      front: frontImage,
      back: backImage,
    });
  };

  const handleRescan = () => {
    // FRONT RESCAN
    if (previewStep === "front-preview") {
      setFrontImage(null);
    }

    // BACK RESCAN
    if (previewStep === "back-preview") {
      setBackImage(null);
    }

    setPreviewStep(null);
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

  if (previewStep) {
    const isFrontPreview = previewStep === "front-preview";

    return (
      <div className="h-dvh overflow-y-auto bg-[#f5f5f5] px-4 py-5 flex flex-col">
        <MobileHeader />

        {/* TITLE */}
        <div className="text-center mt-3">
          <h2 className="text-[22px] font-bold text-[#1B3631]">
            {isFrontPreview ? "Review Front Page" : "Review Back Page"}
          </h2>

          <p className="mt-2 text-sm text-[#5f6368] leading-6">
            Please review the captured passport image before continuing.
          </p>
        </div>

        {/* IMAGE PREVIEW */}
        <div className="flex-1 flex items-center justify-center mt-6">
          <div className="flex-1 flex flex-col justify-center">
            <div
              className="
      relative rounded-[10px] overflow-hidden
      h-[42vh]
      min-h-[260px]
      max-h-[420px]
      bg-black shadow-xl
    "
            >
              <img
                src={isFrontPreview ? frontImage : backImage}
                alt="passport-preview"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* BUTTONS */}
        <div className="mt-6 space-y-3">
          {/* NEXT */}
          <button
            onClick={isFrontPreview ? handleFrontNext : handleBackSubmit}
            className="
            w-full h-14 rounded-[6px]
            bg-[#1B3631]
            text-white text-lg font-semibold
          "
          >
            {isFrontPreview ? "Next-Scan Back Page" : "Continue"}
          </button>

          {/* RESCAN */}
          <button
            onClick={handleRescan}
            className="
            w-full h-14 rounded-[6px]
            text-[#1B3631]
            text-lg font-semibold
            bg-gray-200
          "
          >
            Re-Scan
          </button>
        </div>
      </div>
    );
  }

  // -- API Calling When Is Processing is True --

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
        </div>
      </div>

      {/* BOTTOM SECTION */}
      <div className="shrink-0">
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

// -- API Testing Only Front Page Needed --
