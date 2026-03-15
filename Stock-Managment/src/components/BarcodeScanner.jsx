import { useBarcode } from "../hooks/useBarcode";

export default function BarcodeScanner({ onScan }) {
  const { videoRef, isReady, error, stopScanning } = useBarcode({ onScan });

  return (
    <div>
      <video
        ref={videoRef}
        style={{ width: "100%", borderRadius: 8 }}
        playsInline
        muted
        autoPlay  // 👈 add this
      />

      {error && (
        <p style={{ color: "red", padding: "8px", background: "#fff0f0", borderRadius: 6 }}>
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