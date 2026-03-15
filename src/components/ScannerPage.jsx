import { useState, useCallback } from "react";
import BarcodeScanner from "../components/BarcodeScanner";
import StockModal from "../components/StockModal";

export default function ScannerPage() {
  const [scannedBarcode, setScannedBarcode] = useState(null); // controls modal
  const [savedItems, setSavedItems] = useState([]);

  const handleScan = useCallback((barcode) => {
    // Only open modal if not already open for this barcode
    setScannedBarcode(prev => {
      if (prev === barcode) return prev; // debounce same barcode
      return barcode;
    });
  }, []);

  const handleSuccess = (createdItem) => {
    setSavedItems(prev => [createdItem, ...prev]);
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-serif text-lg font-bold text-[#2D2D2D]">Scan Stock Item</h2>

      <BarcodeScanner onScan={handleScan} />

      {/* Saved items list */}
      {savedItems.length > 0 && (
        <ul className="flex flex-col gap-2 mt-2">
          {savedItems.map((item, i) => (
            <li key={i} className="bg-white border border-[#F1E9E4] rounded-lg px-4 py-3 text-sm flex justify-between">
              <span className="font-bold">{item.name}</span>
              <span className="text-[#6D6D6D]">{item.barcode} · {item.location === 1 ? "Magazine" : "Fridge"}</span>
            </li>
          ))}
        </ul>
      )}

      {/* Modal — only mounts when a barcode is scanned */}
      {scannedBarcode && (
        <StockModal
          barcode={scannedBarcode}
          onClose={() => setScannedBarcode(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}