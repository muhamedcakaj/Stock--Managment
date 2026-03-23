import { useState, useEffect } from "react";

const LOCATIONS = [
  { label: "Magazine", value: 1 },
  { label: "Fridge", value: 2 },
];

export default function StockModal({ barcode, onClose, onSuccess }) {
  const [form, setForm] = useState({
    barcode: barcode || "",
    name: "",
    quantity: "",
    price: "",
    location: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update barcode if a new scan comes in while modal is open + prefill name if item exists
  useEffect(() => {
    if (!barcode) return;
    setForm(prev => ({ ...prev, barcode, name: "" }));

    const fetchExisting = async () => {
      try {
        const res = await fetch(`https://stockmanagment-production.up.railway.app/stock/barcode/${barcode}`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.name) {
            setForm(prev => ({ ...prev, name: data.name, price: data.price,quantity : data.quantity}));
          }
        }
        // If 404 or not found, just leave name empty — user can type it manually
      } catch {
        // Network error — silently ignore, user can type name manually
      }
    };

    fetchExisting();
  }, [barcode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Name is required.");
    if (!form.quantity || isNaN(form.quantity) || Number(form.quantity) <= 0)
      return setError("Enter a valid quantity.");
    if (!form.price || isNaN(form.price) || Number(form.price) < 0)
      return setError("Enter a valid price.");

    setLoading(true);
    setError(null);

    try {
      setLoading(true);
      setError("");

      const res = await fetch("https://stockmanagment-production.up.railway.app/stock", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          barcode: form.barcode,
          name: form.name,
          quantity: Number(form.quantity),
          price: Number(form.price),
          location: Number(form.location),
        }),
      });

      const data = await res.json(); // parse JSON always

      if (!res.ok) {
        // backend returned error
        throw new Error(data.error || `Server error: ${res.status}`);
      }

      // success
      onSuccess(data);
      onClose();

    } catch (err) {
      // show message to user
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Backdrop
    <div
      className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      {/* Modal — stop click propagation so backdrop click doesn't close it accidentally */}
      <div
        className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl p-6 flex flex-col gap-4 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="font-serif text-lg font-bold text-[#2D2D2D]">Add Stock Item</h2>
          <button
            onClick={onClose}
            className="text-[#B0B0B0] hover:text-[#2D2D2D] text-xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Barcode (read-only) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6D6D6D]">Barcode</label>
          <input
            value={form.barcode}
            readOnly
            className="border border-[#F1E9E4] rounded-lg px-3 py-2 bg-[#FDFCFB] text-[#2D2D2D] text-sm"
          />
        </div>

        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6D6D6D]">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="e.g. Milk 1L"
            className="border border-[#F1E9E4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Quantity */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6D6D6D]">Quantity</label>
          <input
            name="quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            placeholder="e.g. 10"
            className="border border-[#F1E9E4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>
        {/* Price */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6D6D6D]">
            Price
          </label>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={handleChange}
            placeholder="e.g. 1.99"
            className="border border-[#F1E9E4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Location */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold uppercase tracking-wider text-[#6D6D6D]">Location</label>
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            className="border border-[#F1E9E4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] bg-white"
          >
            {LOCATIONS.map(loc => (
              <option key={loc.value} value={loc.value}>{loc.label}</option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">⚠️ {error}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-[#F1E9E4] text-[#6D6D6D] text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-[#2D2D2D] text-white text-sm font-bold disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}