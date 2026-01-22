import { createContext, useContext, useRef } from "react";

const CameraContext = createContext(null);

export const CameraProvider = ({ children }) => {
  const streamRef = useRef(null);

  const startCamera = async () => {
    if (streamRef.current) return streamRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    });

    streamRef.current = stream;
    return stream;
  };

  const stopCamera = () => {
    if (!streamRef.current) return;
    streamRef.current.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  return (
    <CameraContext.Provider value={{ startCamera, stopCamera, streamRef }}>
      {children}
    </CameraContext.Provider>
  );
};

export const useCamera = () => useContext(CameraContext);
