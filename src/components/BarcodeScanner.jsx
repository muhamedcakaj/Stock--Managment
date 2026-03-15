import { useBarcode } from "../hooks/useBarcode";

export default function BarcodeScanner({ onScan }) {
  const { videoRef, isReady, error, stopScanning } = useBarcode({ onScan });

  return (
    <div style={{ position: "relative" }}>
      <video
        ref={videoRef}
        style={{ width: "100%", borderRadius: 8 }}
        playsInline
        muted
        autoPlay
      />

      {/* Scan frame */}
      <div
        style={{
          position: "absolute",
          top: "30%",
          left: "10%",
          width: "80%",
          height: "40%",
          border: "3px solid #00ff88",
          borderRadius: 10,
          pointerEvents: "none"
        }}
      />

      {error && (
        <p style={{ color: "red", padding: "8px" }}>
          ⚠️ {error}
        </p>
      )}

      {!isReady && !error && (
        <p style={{ color: "#888" }}>Starting camera...</p>
      )}

      {isReady && (
        <button onClick={stopScanning}>Stop Camera</button>
      )}
    </div>
  );
}