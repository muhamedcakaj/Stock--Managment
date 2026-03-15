import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";

export function useBarcode({ onScan }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const [error, setError] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const stopScanning = useCallback(() => {
    // Stop all tracks on the video element's stream
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    // Release any remaining streams held by the library
    BrowserMultiFormatReader.releaseAllStreams();
    readerRef.current = null;
    setIsReady(false);
  }, []);

  const startScanning = useCallback(async () => {
    // Clean up any previous instance before starting a new one
    stopScanning();

    readerRef.current = new BrowserMultiFormatReader();
    setError(null);

    try {
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const rearCamera =
        devices.find(
          (d) =>
            d.label.toLowerCase().includes("back") ||
            d.label.toLowerCase().includes("rear") ||
            d.label.toLowerCase().includes("environment")
        ) || devices[0];

      await readerRef.current.decodeFromVideoDevice(
        rearCamera?.deviceId,
        videoRef.current,
        (result, err) => {
          if (result) onScan(result.getText());
          if (err && !(err instanceof NotFoundException)) {
            console.warn("Scan attempt:", err.message);
          }
        }
      );

      setIsReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError") {
        setError("Camera permission denied.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found.");
      } else if (err.name === "NotReadableError") {
        setError("Camera is already in use.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    }
  }, [onScan, stopScanning]);

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, [startScanning, stopScanning]);

  return { videoRef, isReady, error, startScanning, stopScanning };
}