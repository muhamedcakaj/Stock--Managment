import { useEffect, useRef, useState, useCallback } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException, DecodeHintType, BarcodeFormat } from "@zxing/library";

// Hints that dramatically improve scan speed and reliability
const HINTS = new Map([
  [
    DecodeHintType.POSSIBLE_FORMATS,
    [
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.UPC_E,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.DATA_MATRIX,
    ],
  ],
  [DecodeHintType.TRY_HARDER, true],
  [DecodeHintType.ASSUME_GS1, false],
]);

export function useBarcode({ onScan }) {
  const videoRef   = useRef(null);
  const readerRef  = useRef(null);
  const streamRef  = useRef(null);
  const lastScan   = useRef("");
  const lastScanTs = useRef(0);

  const [error,    setError]    = useState(null);
  const [isReady,  setIsReady]  = useState(false);
  const [torch,    setTorch]    = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [zoom,     setZoom]     = useState(1);
  const [maxZoom,  setMaxZoom]  = useState(1);

  const stopScanning = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    BrowserMultiFormatReader.releaseAllStreams();
    readerRef.current = null;
    setIsReady(false);
    setTorch(false);
    setHasTorch(false);
    setZoom(1);
    setMaxZoom(1);
  }, []);

  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      const newState = !torch;
      await track.applyConstraints({ advanced: [{ torch: newState }] });
      setTorch(newState);
    } catch {
      console.warn("Torch not supported");
    }
  }, [torch]);

  const applyZoom = useCallback(async (level) => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;
    try {
      await track.applyConstraints({ advanced: [{ zoom: level }] });
      setZoom(level);
    } catch {
      console.warn("Zoom not supported");
    }
  }, []);

  const startScanning = useCallback(async () => {
    stopScanning();
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const track = stream.getVideoTracks()[0];
      const caps  = track.getCapabilities?.() ?? {};
      setHasTorch(Boolean(caps.torch));
      if (caps.zoom) setMaxZoom(caps.zoom.max ?? 1);

      readerRef.current = new BrowserMultiFormatReader(HINTS);

      readerRef.current.decodeFromVideoElement(
        videoRef.current,
        (result, err) => {
          if (result) {
            const text = result.getText();
            const now  = Date.now();
            if (text === lastScan.current && now - lastScanTs.current < 2000) return;
            lastScan.current   = text;
            lastScanTs.current = now;
            onScan(text);
          }
          if (err && !(err instanceof NotFoundException)) {
            console.warn("Decode:", err.message);
          }
        }
      );

      setIsReady(true);
    } catch (err) {
      console.error("Camera error:", err);
      if (err.name === "NotAllowedError")       setError("Camera permission denied.");
      else if (err.name === "NotFoundError")    setError("No camera found.");
      else if (err.name === "NotReadableError") setError("Camera is already in use.");
      else setError(`Camera error: ${err.message}`);
    }
  }, [onScan, stopScanning]);

  useEffect(() => {
    startScanning();
    return () => stopScanning();
  }, [startScanning, stopScanning]);

  return {
    videoRef, isReady, error, startScanning, stopScanning,
    torch, hasTorch, toggleTorch,
    zoom, maxZoom, applyZoom,
  };
}