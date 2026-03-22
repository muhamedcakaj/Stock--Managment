import { useState, useEffect, useCallback } from "react";

// ─── Config ────────────────────────────────────────────────────────────────────
const BASE_URL = "http://localhost:8080/stock";
const LOCATION_ID = 2;
const LOCATION_LABEL = "Fridge";

// ─── API Layer ─────────────────────────────────────────────────────────────────
const stockAPI = {
    getAll: async () => {
        const res = await fetch(`${BASE_URL}/location/${LOCATION_ID}`, {
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch stocks");
        return res.json();
    },
    create: async (payload) => {
        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Create failed");
        return data;
    },
    // UPDATE — POST with id in body, always parse JSON to extract error message
    update: async (payload) => {
        const res = await fetch(BASE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Update failed");
        return data;
    },
    delete: async (id) => {
        const res = await fetch(`${BASE_URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("token")}`
            }
        });

        if (!res.ok) throw new Error("Delete failed");
    },
};

const BLANK_FORM = { barcode: "", name: "", quantity: "", price: "" };

// ─── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ toast, onDismiss }) {
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(onDismiss, 3500);
        return () => clearTimeout(t);
    }, [toast, onDismiss]);

    if (!toast) return null;

    return (
        <div style={{
            position: "fixed", bottom: "1.5rem", left: "50%", transform: "translateX(-50%)",
            zIndex: 100, display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.75rem 1.25rem", borderRadius: "999px",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.85rem",
            color: "#fff", background: toast.type === "error" ? "#DC2626" : "#16A34A",
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)", whiteSpace: "nowrap",
            animation: "slideUp 0.25s ease",
        }}>
            <span>{toast.type === "error" ? "✕" : "✓"}</span>
            {toast.message}
            <button onClick={onDismiss} style={{ marginLeft: "0.25rem", opacity: 0.7, background: "none", border: "none", color: "#fff", cursor: "pointer", fontSize: "1rem", lineHeight: 1 }}>×</button>
        </div>
    );
}

// ─── Shared field style ────────────────────────────────────────────────────────
const inputStyle = {
    width: "100%", boxSizing: "border-box",
    border: "1.5px solid #E7E5E0", borderRadius: "0.75rem",
    padding: "0.7rem 0.9rem", fontSize: "0.95rem",
    fontFamily: "'DM Sans', sans-serif", color: "#1C1917",
    background: "#fff", outline: "none", transition: "border-color 0.15s",
};

const labelStyle = {
    display: "block", fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.08em", color: "#A8A29E", marginBottom: "0.4rem",
};

// ─── Modal ─────────────────────────────────────────────────────────────────────
function StockModal({ initial, onClose, onSubmit }) {
    const isEdit = Boolean(initial?.id);

    const [form, setForm] = useState(
        isEdit
            ? { barcode: initial.barcode ?? "", name: initial.name ?? "", quantity: initial.quantity ?? "", price: initial.price ?? "" }
            : BLANK_FORM
    );
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

    const handleSubmit = async () => {
        if (!form.name.trim() || !form.quantity) {
            setError("Name and quantity are required.");
            return;
        }
        setBusy(true);
        setError("");
        try {
            await onSubmit({
                ...(isEdit ? { id: initial.id } : {}),
                barcode: form.barcode.trim() || null,
                name: form.name.trim(),
                quantity: Number(form.quantity),
                price: form.price !== "" ? Number(form.price) : null,
                location: LOCATION_ID,
            });
            onClose();
        } catch (err) {
            setError(err.message);  // ← now receives the real backend message
        } finally {
            setBusy(false);
        }
    };

    const fields = [
        { label: "Barcode", field: "barcode", type: "text", placeholder: "e.g. 5901234123457" },
        { label: "Product Name", field: "name", type: "text", placeholder: "e.g. Milk 1L" },
        { label: "Quantity", field: "quantity", type: "number", placeholder: "0" },
        { label: "Price (optional)", field: "price", type: "number", placeholder: "0.00" },
    ];

    return (
        <div
            onClick={onClose}
            style={{
                position: "fixed", inset: 0, zIndex: 50,
                background: "rgba(15,15,20,0.6)", backdropFilter: "blur(4px)",
                display: "flex", alignItems: "flex-end", justifyContent: "center",
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: "#FAFAF9", width: "100%", maxWidth: "480px",
                    borderRadius: "1.5rem 1.5rem 0 0", padding: "1.75rem 1.5rem 2rem",
                    boxShadow: "0 -8px 40px rgba(0,0,0,0.15)",
                    animation: "slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)",
                }}
            >
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "#D1CFC9", margin: "0 auto 1.5rem" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.25rem", fontWeight: 700, color: "#1C1917" }}>
                        {isEdit ? "Edit Item" : "New Item"}
                    </h2>
                    <button onClick={onClose} style={{ background: "#EDEBE7", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", color: "#78716C", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>

                {error && (
                    <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "0.75rem", padding: "0.6rem 0.9rem", marginBottom: "1rem", color: "#DC2626", fontSize: "0.82rem", fontFamily: "'DM Sans', sans-serif" }}>
                        ⚠️ {error}
                    </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {fields.map(({ label, field, type, placeholder }) => (
                        <div key={field}>
                            <label style={labelStyle}>{label}</label>
                            <input
                                type={type}
                                value={form[field]}
                                onChange={set(field)}
                                placeholder={placeholder}
                                step={field === "price" ? "0.01" : "1"}
                                style={inputStyle}
                                onFocus={(e) => e.target.style.borderColor = "#D97706"}
                                onBlur={(e) => e.target.style.borderColor = "#E7E5E0"}
                            />
                        </div>
                    ))}

                    {/* Location — read-only */}
                    <div>
                        <label style={labelStyle}>Location</label>
                        <div style={{ ...inputStyle, background: "#F5F3EF", color: "#78716C", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "default" }}>
                            <span>🧊</span>
                            <span style={{ fontWeight: 600 }}>{LOCATION_LABEL}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                    <button onClick={onClose} style={{ flex: 1, padding: "0.8rem", borderRadius: "0.85rem", border: "1.5px solid #E7E5E0", background: "#fff", color: "#78716C", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>Cancel</button>
                    <button onClick={handleSubmit} disabled={busy} style={{ flex: 1, padding: "0.8rem", borderRadius: "0.85rem", border: "none", background: busy ? "#D6D3D1" : "#1C1917", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: busy ? "not-allowed" : "pointer", transition: "background 0.15s" }}>
                        {busy ? "Saving…" : isEdit ? "Update" : "Add Item"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────
function ConfirmDialog({ item, onConfirm, onCancel }) {
    return (
        <div onClick={onCancel} style={{ position: "fixed", inset: 0, zIndex: 60, background: "rgba(15,15,20,0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem" }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "#FAFAF9", borderRadius: "1.5rem", padding: "2rem 1.5rem", width: "100%", maxWidth: "360px", textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗑️</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: "1.1rem", color: "#1C1917", marginBottom: "0.4rem" }}>Delete "{item.name}"?</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.85rem", color: "#A8A29E", marginBottom: "1.5rem" }}>This action cannot be undone.</p>
                <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button onClick={onCancel} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.85rem", border: "1.5px solid #E7E5E0", background: "#fff", color: "#78716C", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.9rem", cursor: "pointer" }}>Cancel</button>
                    <button onClick={onConfirm} style={{ flex: 1, padding: "0.75rem", borderRadius: "0.85rem", border: "none", background: "#DC2626", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer" }}>Delete</button>
                </div>
            </div>
        </div>
    );
}

// ─── Stock Card ────────────────────────────────────────────────────────────────
function StockCard({ stock, onEdit, onDelete }) {
    const lowStock = stock.quantity < 10;
    return (
        <div style={{ background: "#fff", border: "1.5px solid #F0EDE8", borderRadius: "1rem", padding: "1rem 1.1rem", display: "flex", alignItems: "center", gap: "0.9rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ minWidth: 44, height: 44, borderRadius: "0.65rem", background: lowStock ? "#FEF2F2" : "#F0FDF4", border: `1.5px solid ${lowStock ? "#FECACA" : "#BBF7D0"}`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", flexShrink: 0 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: "1rem", color: lowStock ? "#DC2626" : "#16A34A", lineHeight: 1 }}>{stock.quantity}</span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.6rem", color: lowStock ? "#EF4444" : "#22C55E", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sasia</span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.95rem", color: "#1C1917", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{stock.name}</p>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.78rem", color: "#A8A29E", margin: "0.1rem 0 0" }}>
                    {stock.price != null ? `€${Number(stock.price).toFixed(2)}` : "Nuk ka çmim"}
                </p>
                {stock.barcode && (
                    <p style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "#C4BFBA", margin: "0.15rem 0 0", letterSpacing: "0.03em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        🔖 {stock.barcode}
                    </p>
                )}
            </div>
            <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                <button onClick={() => onEdit(stock)} style={{ padding: "0.45rem 0.75rem", borderRadius: "0.6rem", border: "1.5px solid #E7E5E0", background: "#FAFAF9", color: "#57534E", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>Ndrysho</button>
                <button onClick={() => onDelete(stock)} style={{ padding: "0.45rem 0.75rem", borderRadius: "0.6rem", border: "1.5px solid #FECACA", background: "#FEF2F2", color: "#DC2626", fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: "0.78rem", cursor: "pointer" }}>Fshij</button>
            </div>
        </div>
    );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function FridgeStock() {
    const [stocks, setStocks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState(null);
    const [confirm, setConfirm] = useState(null);
    const [toast, setToast] = useState(null);
    const [search, setSearch] = useState("");

    const showToast = (message, type = "success") => setToast({ message, type });

    const fetchStocks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await stockAPI.getAll();
            setStocks(Array.isArray(data) ? data : []);
        } catch (err) {
            showToast(err.message, "error");
            setStocks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStocks(); }, [fetchStocks]);

    const handleCreate = async (payload) => {
        await stockAPI.create(payload);
        showToast("Item added.");
        fetchStocks();
    };

    // ✅ Fixed: pass payload directly (no id as first arg), matches new update signature
    const handleUpdate = async (payload) => {
        await stockAPI.update(payload);
        showToast("Item updated.");
        fetchStocks();
    };

    const handleDelete = async () => {
        try {
            await stockAPI.delete(confirm.id);
            showToast("Item deleted.");
            setConfirm(null);
            fetchStocks();
        } catch (err) {
            showToast(err.message, "error");
            setConfirm(null);
        }
    };

    const filtered = stocks.filter((s) =>
        s.name?.toLowerCase().includes(search.toLowerCase())
    );

    const lowCount = stocks.filter((s) => s.quantity < 10).length;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;600;700;800&display=swap');
                * { box-sizing: border-box; margin: 0; padding: 0; }
                body { background: #F5F3EF; }
                @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
                input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
                ::-webkit-scrollbar { width: 4px; }
                ::-webkit-scrollbar-thumb { background: #D6D3D1; border-radius: 2px; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#F5F3EF", fontFamily: "'DM Sans', sans-serif" }}>

                <header style={{ background: "#1C1917", padding: "1.25rem 1.25rem 1rem", position: "sticky", top: 0, zIndex: 30 }}>
                    <div style={{ maxWidth: 640, margin: "0 auto" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.9rem" }}>
                            <div>
                                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#60A5FA", marginBottom: "0.15rem" }}>
                                    🧊 Fridge ·
                                </p>
                                <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.45rem", fontWeight: 700, color: "#FAFAF9", lineHeight: 1.1 }}>
                                    Menaxhimi i Stokut
                                </h1>
                            </div>
                            <button
                                onClick={() => setModal("create")}
                                style={{ background: "#60A5FA", border: "none", borderRadius: "0.85rem", color: "#fff", fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: "0.88rem", padding: "0.65rem 1.1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.3rem", boxShadow: "0 4px 12px rgba(96,165,250,0.4)" }}
                            >+ Shto</button>
                        </div>
                        <div style={{ position: "relative" }}>
                            <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", fontSize: "0.9rem", opacity: 0.5 }}>🔍</span>
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Kërko artikuj…"
                                style={{ width: "100%", padding: "0.65rem 0.9rem 0.65rem 2.2rem", borderRadius: "0.75rem", border: "none", background: "rgba(255,255,255,0.08)", color: "#FAFAF9", fontSize: "0.9rem", fontFamily: "'DM Sans', sans-serif", outline: "none" }}
                            />
                        </div>
                    </div>
                </header>

                <div style={{ background: "#fff", borderBottom: "1px solid #F0EDE8" }}>
                    <div style={{ maxWidth: 640, margin: "0 auto", padding: "0.85rem 1.25rem", display: "flex", gap: "1.5rem" }}>
                        {[
                            { label: "Produktet", value: stocks.length, color: "#1C1917" },
                            { label: "Stok i Ulët", value: lowCount, color: lowCount > 0 ? "#DC2626" : "#16A34A" },
                            { label: "Sasia Totale", value: stocks.reduce((a, s) => a + (s.quantity || 0), 0), color: "#1C1917" },
                        ].map(({ label, value, color }) => (
                            <div key={label}>
                                <p style={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#A8A29E" }}>{label}</p>
                                <p style={{ fontSize: "1.2rem", fontWeight: 800, color, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.2 }}>{value}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <main style={{ maxWidth: 640, margin: "0 auto", padding: "1.25rem" }}>
                    {loading ? (
                        <div style={{ textAlign: "center", padding: "4rem 0", color: "#A8A29E", fontSize: "0.9rem" }}>
                            <div style={{ fontSize: "2rem", marginBottom: "0.5rem", animation: "fadeIn 0.5s infinite alternate" }}>⏳</div>
                            Duke u ngarkuar…
                        </div>
                    ) : filtered.length === 0 ? (
                        <div style={{ textAlign: "center", padding: "4rem 0", color: "#A8A29E" }}>
                            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>📭</div>
                            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#78716C", marginBottom: "0.4rem" }}>
                                {search ? "Nuk u gjet asnjë rezultat" : "Nuk ka artikuj ende"}
                            </p>
                            <p style={{ fontSize: "0.85rem" }}>
                                {search ? "Provo një kërkim tjetër" : "Shtyp + Shto për të filluar"}
                            </p>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
                            {filtered.map((stock) => (
                                <StockCard
                                    key={stock.id}
                                    stock={stock}
                                    onEdit={(s) => setModal(s)}
                                    onDelete={(s) => setConfirm(s)}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            {modal && (
                <StockModal
                    initial={modal === "create" ? null : modal}
                    onClose={() => setModal(null)}
                    onSubmit={modal === "create" ? handleCreate : handleUpdate}
                />
            )}

            {confirm && (
                <ConfirmDialog
                    item={confirm}
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(null)}
                />
            )}

            <Toast toast={toast} onDismiss={() => setToast(null)} />
        </>
    );
}