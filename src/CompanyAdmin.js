import React, { useState, useEffect, useRef } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase, ref, onValue, set, get } from "firebase/database";

// ── Firebase setup (same project as Driver App) ─────────────
const _firebaseConfig = {
  apiKey: "AIzaSyBRDCFSJl___6-r3l2FAUdqn0fQ9eVvjRU",
  databaseURL: "https://expo-projects-f6ba3-default-rtdb.firebaseio.com",
  projectId: "expo-projects-f6ba3",
};
const _app = getApps().length === 0 ? initializeApp(_firebaseConfig) : getApp();
const _db  = getDatabase(_app);

// ═══════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════
const SEED_BUSES = [
    { id: 1, number: "TN-01-AB-1234", model: "Ashok Leyland", capacity: 52, fuel: "Diesel", status: "active", routeId: "R-101", driverId: 1, lastService: "2024-11-10", kmRun: 42300, year: 2020 },
    { id: 2, number: "TN-01-CD-5678", model: "Tata Starbus", capacity: 45, fuel: "CNG", status: "active", routeId: "R-102", driverId: 2, lastService: "2024-10-25", kmRun: 38100, year: 2021 },
    { id: 3, number: "TN-01-EF-9012", model: "Eicher Pro", capacity: 35, fuel: "Diesel", status: "maintenance", routeId: null, driverId: null, lastService: "2024-09-05", kmRun: 61500, year: 2018 },
    { id: 4, number: "TN-01-GH-3456", model: "Volvo 9400", capacity: 56, fuel: "Diesel", status: "idle", routeId: null, driverId: null, lastService: "2024-12-01", kmRun: 15200, year: 2023 },
];

const SEED_DRIVERS = [
    { id: 1, name: "Ramesh Kumar", phone: "9876543210", license: "TN-2023-12345", status: "on-duty", busId: 1, experience: "5 yrs", rating: 4.8, joinDate: "2023-01-15" },
    { id: 2, name: "Suresh Babu", phone: "9123456780", license: "TN-2022-98765", status: "on-duty", busId: 2, experience: "3 yrs", rating: 4.5, joinDate: "2022-06-20" },
    { id: 3, name: "Arjun Selvam", phone: "9988776655", license: "TN-2021-54321", status: "off-duty", busId: null, experience: "7 yrs", rating: 4.9, joinDate: "2021-03-10" },
    { id: 4, name: "Karthik Raj", phone: "9765432100", license: "TN-2020-11223", status: "off-duty", busId: null, experience: "2 yrs", rating: 4.2, joinDate: "2024-02-01" },
];

const SEED_ROUTES = [
    { id: "R-101", name: "City Center → Airport", from: "City Center", to: "Airport", stops: ["City Center", "Gandhi Nagar", "Anna Salai", "Airport"], distance: "28 km", duration: "55 min", fare: 35, status: "active" },
    { id: "R-102", name: "Central → Meenakshi", from: "Madurai Central", to: "Meenakshi Temple", stops: ["Madurai Central", "KK Nagar", "Goripalayam", "Meenakshi Temple"], distance: "12 km", duration: "30 min", fare: 15, status: "active" },
    { id: "R-103", name: "North → South Ring Road", from: "Bypass Jn", to: "Aavin Roundana", stops: ["Bypass Jn", "Arapalayam", "Mattuthavani", "Aavin Roundana"], distance: "18 km", duration: "40 min", fare: 20, status: "inactive" },
];

const SEED_TRIPS = [
    { id: "T-2001", routeId: "R-101", busId: 1, driverId: 1, date: "2025-02-21", time: "08:00", status: "completed", passengers: 41, revenue: 1435 },
    { id: "T-2002", routeId: "R-102", busId: 2, driverId: 2, date: "2025-02-21", time: "09:30", status: "in-progress", passengers: 33, revenue: 495 },
    { id: "T-2003", routeId: "R-101", busId: 1, driverId: 1, date: "2025-02-21", time: "13:00", status: "scheduled", passengers: 0, revenue: 0 },
    { id: "T-2004", routeId: "R-102", busId: 2, driverId: 2, date: "2025-02-22", time: "07:00", status: "scheduled", passengers: 0, revenue: 0 },
    { id: "T-2005", routeId: "R-101", busId: 1, driverId: 1, date: "2025-02-20", time: "08:00", status: "completed", passengers: 48, revenue: 1680 },
    { id: "T-2006", routeId: "R-102", busId: 2, driverId: 2, date: "2025-02-20", time: "10:00", status: "completed", passengers: 38, revenue: 570 },
];

// Simulated GPS locations for live tracking
const GPS_POSITIONS = [
    { busId: 1, lat: 9.9252, lng: 78.1198, speed: 42, heading: "North", lastUpdate: "just now", passengers: 33 },
    { busId: 2, lat: 9.9310, lng: 78.1250, speed: 28, heading: "East", lastUpdate: "30 sec ago", passengers: 21 },
];

const COMPANY = { name: "Sri Murugan Transport Co.", id: "COMP-001", city: "Madurai", state: "Tamil Nadu", contact: "9876500000", email: "admin@smt.in", license: "TN-TRANS-2020-001" };

const EMPTY_BUS = { number: "", model: "", capacity: "", fuel: "Diesel", status: "idle", routeId: "", driverId: "", lastService: "", kmRun: "", year: "" };
const EMPTY_DRIVER = { name: "", phone: "", license: "", experience: "", status: "off-duty", busId: "", rating: "5.0", joinDate: "" };
const EMPTY_ROUTE = { id: "", name: "", from: "", to: "", stops: "", distance: "", duration: "", fare: "", status: "active" };
const EMPTY_TRIP = { routeId: "", busId: "", driverId: "", date: "", time: "", status: "scheduled" };

// ═══════════════════════════════════════════════════════════
// SHARED SMALL COMPONENTS
// ═══════════════════════════════════════════════════════════
function Toast({ toast }) {
    if (!toast) return null;
    const isErr = toast.type === "error";
    return (
        <div style={{
            position: "fixed", top: 24, right: 24, zIndex: 9999, padding: "13px 22px",
            borderRadius: 14, fontWeight: 700, fontSize: 14, color: "white",
            background: isErr ? "#ef4444" : "#10b981",
            boxShadow: "0 8px 30px rgba(0,0,0,.2)", animation: "caFade .3s ease",
        }}>
            {isErr ? "✕ " : "✓ "}{toast.msg}
        </div>
    );
}

function Badge({ val }) {
    const map = {
        active: "#dcfce7,#16a34a,ACTIVE",
        idle: "#fef3c7,#d97706,IDLE",
        maintenance: "#fee2e2,#dc2626,MAINTENANCE",
        "on-duty": "#dcfce7,#16a34a,ON DUTY",
        "off-duty": "#f3f4f6,#64748b,OFF DUTY",
        completed: "#dcfce7,#16a34a,COMPLETED",
        "in-progress": "#dbeafe,#2563eb,ACTIVE",
        scheduled: "#fef3c7,#d97706,PENDING",
        cancelled: "#fee2e2,#dc2626,CANCELLED",
        inactive: "#f3f4f6,#64748b,INACTIVE",
        VERIFIED: "#dcfce7,#16a34a,VERIFIED",
        PENDING: "#fef3c7,#d97706,PENDING",
    };
    const [bg, color, text] = (map[val] || map[val?.toUpperCase()] || "#f3f4f6,#64748b," + val).split(",");
    return (
        <span style={{ background: bg, color, padding: "5px 12px", borderRadius: 8, fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: .5 }}>
            {text || val}
        </span>
    );
}

function Modal({ title, onClose, wide, children }) {
    return (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,.55)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}
            onClick={onClose}>
            <div style={{ background: "#fff", borderRadius: 22, padding: 32, width: "100%", maxWidth: wide ? 700 : 560, boxShadow: "0 24px 80px rgba(0,0,0,.22)", maxHeight: "90vh", overflowY: "auto" }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                    <span style={{ fontSize: 19, fontWeight: 800, color: "#0f172a" }}>{title}</span>
                    <button onClick={onClose} style={{ background: "#f1f5f9", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "#64748b" }}>✕</button>
                </div>
                {children}
            </div>
        </div>
    );
}

function Field({ label, required, children, span }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 5, gridColumn: span ? "1/-1" : undefined }}>
            <label style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: .5 }}>
                {label}{required && <span style={{ color: "#dc2626" }}> *</span>}
            </label>
            {children}
        </div>
    );
}

function StatCard({ icon, label, value, sub, color }) {
    return (
        <div style={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", borderRadius: 18, padding: "22px 24px", boxShadow: "0 8px 32px rgba(0,0,0,.1)", borderLeft: `6px solid ${color}`, borderTop: "1px solid rgba(255,255,255,0.4)", borderRight: "1px solid rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.4)", display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ fontSize: 28, background: `${color}20`, width: 52, height: 52, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
            <div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#000" }}>{value}</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1e293b" }}>{label}</div>
                {sub && <div style={{ fontSize: 13, fontWeight: 600, color: "#475569", marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

function ConfirmDel({ name, onConfirm, onClose }) {
    return (
        <Modal title="⚠️ Confirm Delete" onClose={onClose}>
            <p style={{ color: "#64748b", marginBottom: 24 }}>Delete <strong style={{ color: "#0f172a" }}>{name}</strong>? This cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                <button style={B.cancel} onClick={onClose}>Cancel</button>
                <button style={B.danger} onClick={onConfirm}>Yes, Delete</button>
            </div>
        </Modal>
    );
}

// Shared styles
const B = {
    primary: { background: "#4f46e5", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer", textShadow: "0 1px 2px rgba(0,0,0,0.2)" },
    cancel: { background: "#e2e8f0", color: "#0f172a", border: "1px solid #cbd5e1", padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer" },
    danger: { background: "#ef4444", color: "#fff", border: "none", padding: "10px 22px", borderRadius: 10, fontWeight: 800, fontSize: 14, cursor: "pointer", textShadow: "0 1px 2px rgba(0,0,0,0.2)" },
    sm: { border: "none", padding: "6px 13px", borderRadius: 8, fontSize: 12, fontWeight: 800, cursor: "pointer" },
};
const INP = { padding: "10px 13px", borderRadius: 10, border: "2px solid #cbd5e1", fontSize: 14, fontWeight: 600, outline: "none", color: "#000", width: "100%", boxSizing: "border-box", background: "rgba(255, 255, 255, 0.95)" };
const SEL = { ...INP, appearance: "auto" };
const TABLE = {
    card: { background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(10px)", borderRadius: 18, boxShadow: "0 8px 32px rgba(0,0,0,.1)", border: "1px solid rgba(255,255,255,0.4)", overflow: "hidden" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: { textAlign: "left", padding: "14px 16px", fontSize: 13, color: "#000", background: "rgba(241, 245, 249, 0.8)", fontWeight: 900, textTransform: "uppercase", letterSpacing: .5, borderBottom: "2px solid #cbd5e1", whiteSpace: "nowrap" },
    td: { padding: "14px 16px", borderBottom: "1px solid #e2e8f0", fontSize: 15, fontWeight: 600, color: "#0f172a", verticalAlign: "middle" },
};
const PG = {
    hdr: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, background: "rgba(255, 255, 255, 0.85)", backdropFilter: "blur(8px)", padding: "16px 24px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" },
    title: { margin: 0, fontSize: 24, fontWeight: 900, color: "#000", textShadow: "0 2px 10px rgba(255,255,255,0.9)" },
    sub: { margin: "4px 0 0", fontSize: 14, fontWeight: 700, color: "#1e293b" },
    bar: { display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center", background: "rgba(255, 255, 255, 0.85)", padding: "14px", borderRadius: 16, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.5)" },
    srch: { flex: 1, minWidth: 220, padding: "10px 14px", borderRadius: 10, border: "2px solid #cbd5e1", fontSize: 14, fontWeight: 600, outline: "none", background: "rgba(255, 255, 255, 0.95)", color: "#000" },
};

// ═══════════════════════════════════════════════════════════
// 1. DASHBOARD
// ═══════════════════════════════════════════════════════════
function Dashboard({ buses, drivers, routes, trips, company, setPage }) {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const activeBuses = buses.filter(b => b.status === "active").length;
    const onDuty = drivers.filter(d => d.status === "on-duty").length;
    const activeRoutes = routes.filter(r => r.status === "active").length;
    const totalRev = trips.filter(t => t.status === "completed").reduce((s, t) => s + t.revenue, 0);
    const todayTrips = trips.filter(t => t.date === "2025-02-21"); // Simulated today
    const inProgress = todayTrips.filter(t => t.status === "in-progress").length;

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Welcome Banner */}
            <div style={{ 
                background: "linear-gradient(135deg, #4f46e5, #4dabf7)", 
                borderRadius: 24, 
                padding: "40px", 
                color: "white", 
                boxShadow: "0 10px 30px rgba(79, 70, 229, 0.4)",
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{ position: "relative", zIndex: 1 }}>
                    <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, marginBottom: 8 }}>Welcome, {company.name}</h1>
                    <p style={{ margin: 0, opacity: 0.9, fontSize: 16, fontWeight: 600 }}>Company Admin Panel · {today}</p>
                    
                    <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                        <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", padding: "8px 16px", borderRadius: 100, fontSize: 14, fontWeight: 700 }}>{buses.length} Buses</div>
                        <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", padding: "8px 16px", borderRadius: 100, fontSize: 14, fontWeight: 700 }}>{drivers.length} Drivers</div>
                        <div style={{ background: "rgba(255,255,255,0.2)", backdropFilter: "blur(10px)", padding: "8px 16px", borderRadius: 100, fontSize: 14, fontWeight: 700 }}>{routes.length} Routes</div>
                    </div>
                </div>
                {/* Abstract shape in background of banner */}
                <div style={{ position: "absolute", right: "-50px", top: "-50px", width: 250, height: 250, background: "rgba(255,255,255,0.1)", borderRadius: "50%", zIndex: 0 }} />
            </div>

            {/* Stat Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 16 }}>
                <StatCard icon="🚌" label="Total Buses" value={buses.length} sub={`${activeBuses} active`} color="#4f46e5" />
                <StatCard icon="👤" label="Drivers" value={drivers.length} sub={`${onDuty} on duty`} color="#6c5ce7" />
                <StatCard icon="🗺" label="Routes" value={routes.length} sub={`${activeRoutes} active`} color="#00d2d3" />
                <StatCard icon="📋" label="Today's Trips" value={todayTrips.length} sub={`${inProgress} in progress`} color="#f59e0b" />
                <StatCard icon="₹" label="Total Revenue" value={`₹${totalRev.toLocaleString()}`} sub="All time" color="#10b981" />
            </div>

            {/* Bottom Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 24 }}>
                {/* Today's Activity */}
                <div style={TABLE.card}>
                    <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Today's Trip Activity</h3>
                        <button onClick={() => setPage("trips")} style={{ background: "#4f46e5", color: "white", border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>View All</button>
                    </div>
                    <table style={TABLE.table}>
                        <thead>
                            <tr>
                                <th style={TABLE.th}>Route</th>
                                <th style={TABLE.th}>Time</th>
                                <th style={TABLE.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {todayTrips.map(t => {
                                const route = routes.find(r => r.id === t.routeId);
                                return (
                                    <tr key={t.id}>
                                        <td style={TABLE.td}>{route?.name || t.routeId}</td>
                                        <td style={TABLE.td}>{t.time}</td>
                                        <td style={TABLE.td}><Badge val={t.status} /></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Fleet Overview */}
                <div style={TABLE.card}>
                    <div style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>Fleet Overview</h3>
                        <button onClick={() => setPage("buses")} style={{ background: "#4f46e5", color: "white", border: "none", padding: "8px 16px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>Manage</button>
                    </div>
                    <div style={{ padding: "0 24px 24px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                            {/* Simple fleet list as seen in image */}
                            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: 12 }}>
                                <span style={{ fontWeight: 800, color: "#64748b" }}>BUS NO.</span>
                                <span style={{ fontWeight: 800, color: "#64748b" }}>DRIVER</span>
                                <span style={{ fontWeight: 800, color: "#64748b" }}>STATUS</span>
                            </div>
                            {buses.slice(0, 5).map(b => (
                                <div key={b.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: 600 }}>{b.number}</span>
                                    <span style={{ fontWeight: 600 }}>{drivers.find(d => d.id === b.driverId)?.name || "Unassigned"}</span>
                                    <div style={{ width: 12, height: 12, borderRadius: "50%", background: b.status === "active" ? "#10b981" : "#f59e0b" }} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 2. BUS MANAGEMENT
// ═══════════════════════════════════════════════════════════
function BusManagement({ buses, setBuses, drivers, routes, showToast }) {
    const [modal, setModal] = useState(null);
    const [sel, setSel] = useState(null);
    const [form, setForm] = useState(EMPTY_BUS);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const filtered = buses
        .filter(b => filter === "All" || b.status === filter.toLowerCase())
        .filter(b => b.number.toLowerCase().includes(search.toLowerCase()) || b.model.toLowerCase().includes(search.toLowerCase()));

    const driverName = id => drivers.find(d => d.id === id)?.name || "Unassigned";
    const routeName = id => routes.find(r => r.id === id)?.name || "—";

    const save = async () => {
        if (!form.number || !form.model || !form.capacity) { showToast("Fill required fields.", "error"); return; }
        
        if (modal === "add") {
            try {
                const token = localStorage.getItem("token") || "";
                const res = await fetch("http://localhost:5000/api/company/buses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({
                        bus_number: form.number,
                        model: form.model,
                        capacity: +form.capacity,
                        route_id: form.routeId || null
                    })
                });

                const data = await res.json();
                if (!res.ok) {
                    console.error("Add Bus Error:", data);
                    showToast(data.error || "Failed to add bus", "error");
                    return;
                }

                const newBus = { 
                    ...form, 
                    id: data.bus_id, 
                    number: form.number,
                    model: form.model,
                    capacity: +form.capacity, 
                    kmRun: +form.kmRun || 0, 
                    driverId: form.driverId ? +form.driverId : null, 
                    routeId: form.routeId || null 
                };
                setBuses(p => [...p, newBus]);
                showToast("Bus added successfully.");
            } catch (err) {
                console.error(err);
                showToast("Network error while adding bus.", "error");
                return;
            }
        } else {
            // Edit logic can be added later if needed, focusing on add for now as requested
            setBuses(p => p.map(b => b.id === sel.id ? { ...form, id: sel.id, capacity: +form.capacity, kmRun: +form.kmRun || 0, driverId: form.driverId ? +form.driverId : null, routeId: form.routeId || null } : b));
            showToast("Bus updated.");
        }
        setModal(null);
    };

    const BusForm = () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, padding: "8px 0" }}>
            <Field label="Bus Number" required><input style={INP} value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="TN-01-XX-0000" /></Field>
            <Field label="Model" required><input style={INP} value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="Ashok Leyland" /></Field>
            <Field label="Capacity (seats)" required><input style={INP} type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} /></Field>
            <Field label="Fuel Type"><select style={{...INP, cursor: "pointer"}} value={form.fuel} onChange={e => setForm(f => ({ ...f, fuel: e.target.value }))}>{["Diesel", "CNG", "Electric", "Petrol"].map(x => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Status"><select style={{...INP, cursor: "pointer"}} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>{["active", "idle", "maintenance"].map(x => <option key={x}>{x}</option>)}</select></Field>
            <Field label="Year of Manufacture"><input style={INP} type="number" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="2022" /></Field>
            <Field label="KM Run"><input style={INP} type="number" value={form.kmRun} onChange={e => setForm(f => ({ ...f, kmRun: e.target.value }))} /></Field>
            <Field label="Last Service Date"><input style={INP} type="date" value={form.lastService} onChange={e => setForm(f => ({ ...f, lastService: e.target.value }))} /></Field>
            <Field label="Assign Route" span><select style={{...INP, cursor: "pointer"}} value={form.routeId || ""} onChange={e => setForm(f => ({ ...f, routeId: e.target.value || null }))}>
                <option value="">— No Route —</option>{routes.map(r => <option key={r.id} value={r.id}>{r.id}: {r.name}</option>)}
            </select></Field>
            <Field label="Assign Driver" span><select style={{...INP, cursor: "pointer"}} value={form.driverId || ""} onChange={e => setForm(f => ({ ...f, driverId: e.target.value || null }))}>
                <option value="">— No Driver —</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name} ({d.status})</option>)}
            </select></Field>
        </div>
    );

    const statusBadge = (status) => {
        const colors = {
            active: { bg: "#dcfce7", color: "#16a34a" },
            maintenance: { bg: "#fee2e2", color: "#dc2626" },
            idle: { bg: "#fef3c7", color: "#d97706" }
        };
        const st = colors[status] || colors.idle;
        return (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: st.bg, color: st.color, padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: st.color }} />
                <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>Buses</h2>
                    <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>Manage your bus fleet</p>
                </div>
                <button style={{ background: "#4f46e5", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all .2s", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }} 
                        onClick={() => { setForm(EMPTY_BUS); setModal("add"); }}>
                    + Add Bus
                </button>
            </div>

            {/* List Container */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                {/* Search & Filter Bar */}
                <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
                        <input type="text" placeholder="Search buses..." value={search} onChange={e => setSearch(e.target.value)}
                            style={{ padding: "10px 16px 10px 40px", width: 300, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", transition: "border-color .2s", color: "#0f172a" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Filter:</span>
                        <select style={{ padding: "10px 36px 10px 16px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", cursor: "pointer", appearance: "none", background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center`, color: "#0f172a", fontWeight: 500 }}
                                value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="All">All Statuses</option>
                            <option value="Active">Active</option>
                            <option value="Maintenance">Maintenance</option>
                            <option value="Idle">Idle</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Bus No.</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Model</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Capacity</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Status</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && <tr><td colSpan={6} style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 14 }}>No buses found matching your criteria.</td></tr>}
                        {filtered.map((b, i) => (
                            <tr key={b.id} style={{ borderBottom: i === filtered.length - 1 ? "none" : "1px solid #e2e8f0", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ display: "inline-block", background: "#f1f5f9", color: "#0f172a", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600, fontFamily: "monospace", border: "1px solid #e2e8f0" }}>
                                        {b.number}
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 500, color: "#334155" }}>{b.model}</td>
                                <td style={{ padding: "16px 24px", fontSize: 14, color: "#64748b" }}>{b.capacity} seats</td>
                                <td style={{ padding: "16px 24px" }}>{statusBadge(b.status)}</td>
                                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                        <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 6, borderRadius: 6, transition: "background .2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#4f46e5"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }} title="View Details" onClick={() => { setSel(b); setModal("view") }}>👁</button>
                                        <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 6, borderRadius: 6, transition: "background .2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#1e40af"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }} title="Edit Bus" onClick={() => { setSel(b); setForm({ ...b, driverId: b.driverId || "", routeId: b.routeId || "" }); setModal("edit") }}>✏</button>
                                        <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 6, borderRadius: 6, transition: "background .2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }} title="Delete Bus" onClick={() => { setSel(b); setModal("delete") }}>🗑</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "🚌 Add New Bus" : "✏ Edit Bus"} onClose={() => setModal(null)}>{BusForm()}<div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button style={B.cancel} onClick={() => setModal(null)}>Cancel</button><button style={B.primary} onClick={save}>{modal === "add" ? "Add Bus" : "Save Changes"}</button></div></Modal>}
            {modal === "view" && sel && <Modal title="🚌 Bus Details" onClose={() => setModal(null)}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                    {[["Bus Number", sel.number], ["Model", sel.model], ["Capacity", sel.capacity + " seats"], ["Fuel", sel.fuel], ["Year", sel.year || "—"], ["KM Run", (sel.kmRun || 0).toLocaleString() + " km"], ["Last Service", sel.lastService || "—"], ["Route", routeName(sel.routeId)], ["Driver", driverName(sel.driverId)], ["Status", sel.status]].map(([k, v]) => (
                        <div key={k} style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{v}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><button style={B.primary} onClick={() => setModal(null)}>Close</button></div>
            </Modal>}
            {modal === "delete" && sel && <ConfirmDel name={sel.number} onConfirm={() => { setBuses(p => p.filter(b => b.id !== sel.id)); setModal(null); showToast("Bus deleted.", "error"); }} onClose={() => setModal(null)} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 3. DRIVER MANAGEMENT
// ═══════════════════════════════════════════════════════════
function DriverManagement({ drivers, setDrivers, buses, showToast }) {
    const [modal, setModal] = useState(null);
    const [sel, setSel] = useState(null);
    const [form, setForm] = useState(EMPTY_DRIVER);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("All");

    const filtered = drivers
        .filter(d => filter === "All" || d.status === filter.toLowerCase().replace(" ", "-"))
        .filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.license.toLowerCase().includes(search.toLowerCase()));

    const busNum = id => buses.find(b => b.id === id)?.number || "Unassigned";

    const save = async () => {
        if (!form.name || !form.phone) { showToast("Full Name and Phone are required.", "error"); return; }
        
        // Frontend Phone Validation: Exactly 10 digits
        if (!/^\d{10}$/.test(form.phone)) {
            showToast("Phone number must be exactly 10 digits.", "error");
            return;
        }

        if (modal === "add") {
            try {
                // Determine API base url (could be from env)
                const API_URL = "http://localhost:5000/api/company/drivers";
                const token = localStorage.getItem("token") || ""; // In case auth is established

                const res = await fetch(API_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                    body: JSON.stringify({ name: form.name, phone: form.phone, license: form.license })
                });

                const data = await res.json();

                if (!res.ok) {
                    console.error("Add Driver Error:", data);
                    showToast(data.error || "Failed to add driver", "error");
                    return;
                }

                // If backend responds successfully, add driver to local state and show generated password
                const newDriver = { 
                    ...form, 
                    id: data.driver_id, 
                    license: form.license, 
                    status: "active",
                    busId: form.busId ? +form.busId : null, 
                    rating: +form.rating || 5.0 
                };
                setDrivers(p => [...p, newDriver]);
                showToast(`Driver added. Auto-generated password: ${data.password}`);
                
                // Show a standard browser alert so admin can easily copy it
                alert(`Driver successfully added!\n\n📱 Driver App Login Credentials:\nUsername (Phone): ${form.phone}\nPassword: ${data.password}\n\nPlease share these credentials with the driver so they can log in to the GoBus Driver App.`);

            } catch (err) {
                console.error(err);
                showToast("Network error while adding driver.", "error");
                return;
            }
        } else {
            setDrivers(p => p.map(d => d.id === sel.id ? { ...form, id: sel.id, busId: form.busId ? +form.busId : null, rating: +form.rating } : d));
            showToast("Driver updated.");
        }
        setModal(null);
    };

    const DForm = () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, padding: "8px 0" }}>
            <Field label="Full Name" required><input style={INP} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
            <Field label="Phone" required>
                <input style={INP} type="tel" maxLength={10} placeholder="e.g. 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value.replace(/\D/g, "").slice(0, 10) }))} />
            </Field>
            <Field label="License No."><input style={INP} value={form.license} onChange={e => setForm(f => ({ ...f, license: e.target.value }))} /></Field>
            <Field label="Experience"><input style={INP} value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} placeholder="e.g. 5 yrs" /></Field>
            <Field label="Status"><select style={{...INP, cursor: "pointer"}} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="on-duty">On Duty</option><option value="off-duty">Off Duty</option></select></Field>
            <Field label="Rating (1–5)"><input style={INP} type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e => setForm(f => ({ ...f, rating: e.target.value }))} /></Field>
            <Field label="Joining Date"><input style={INP} type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))} /></Field>
            <Field label="Assign Bus"><select style={{...INP, cursor: "pointer"}} value={form.busId || ""} onChange={e => setForm(f => ({ ...f, busId: e.target.value || null }))}>
                <option value="">— No Bus —</option>{buses.map(b => <option key={b.id} value={b.id}>{b.number}</option>)}
            </select></Field>
        </div>
    );

    const statusBadge = (status) => {
        const isOffDuty = status === "off-duty";
        return (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: isOffDuty ? "#f1f5f9" : "#dcfce7", color: isOffDuty ? "#64748b" : "#16a34a", padding: "4px 12px", borderRadius: 100, fontSize: 12, fontWeight: 600 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isOffDuty ? "#94a3b8" : "#16a34a" }} />
                <span>{isOffDuty ? "Off Duty" : "On Duty"}</span>
            </div>
        );
    }

    const ratingsBadge = (rating) => {
        return (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "#fef3c7", color: "#d97706", padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
                <span>⭐</span>
                <span>{Number(rating).toFixed(1)}</span>
            </div>
        );
    }

    // Hash string to color
    const getAvatarColor = (name) => {
        const colors = [
            "linear-gradient(135deg, #f87171, #ef4444)",
            "linear-gradient(135deg, #fbbf24, #f59e0b)",
            "linear-gradient(135deg, #34d399, #10b981)",
            "linear-gradient(135deg, #60a5fa, #3b82f6)",
            "linear-gradient(135deg, #818cf8, #6366f1)",
            "linear-gradient(135deg, #c084fc, #a855f7)",
            "linear-gradient(135deg, #f472b6, #ec4899)"
        ];
        let hash = 0;
        for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>Drivers</h2>
                    <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>Manage your driver fleet</p>
                </div>
                <button style={{ background: "#4f46e5", color: "white", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: "pointer", transition: "all .2s", boxShadow: "0 4px 12px rgba(79, 70, 229, 0.2)" }} 
                        onClick={() => { setForm(EMPTY_DRIVER); setModal("add"); }}>
                    + Add Driver
                </button>
            </div>

            {/* List Container */}
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)" }}>
                {/* Search & Filter Bar */}
                <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0" }}>
                    <div style={{ position: "relative" }}>
                        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
                        <input type="text" placeholder="Search drivers..." value={search} onChange={e => setSearch(e.target.value)}
                            style={{ padding: "10px 16px 10px 40px", width: 300, border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", transition: "border-color .2s", color: "#0f172a" }} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Filter:</span>
                        <select style={{ padding: "10px 36px 10px 16px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", cursor: "pointer", appearance: "none", background: `white url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 12px center`, color: "#0f172a", fontWeight: 500 }}
                                value={filter} onChange={e => setFilter(e.target.value)}>
                            <option value="All">All Statuses</option>
                            <option value="On Duty">On Duty</option>
                            <option value="Off Duty">Off Duty</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                        <tr>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Name</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Phone</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>License No.</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Experience</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Bus Assigned</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Rating</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc" }}>Status</th>
                            <th style={{ padding: "16px 24px", fontSize: 13, fontWeight: 600, color: "#64748b", borderBottom: "1px solid #e2e8f0", background: "#f8fafc", textAlign: "right" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 && <tr><td colSpan={8} style={{ padding: 40, textAlign: "center", color: "#64748b", fontSize: 14 }}>No drivers found matching your criteria.</td></tr>}
                        {filtered.map((d, i) => (
                            <tr key={d.id} style={{ borderBottom: i === filtered.length - 1 ? "none" : "1px solid #e2e8f0", transition: "background .2s" }} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                                <td style={{ padding: "16px 24px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: getAvatarColor(d.name), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
                                            {d.name.charAt(0).toUpperCase()}
                                        </div>
                                        <span style={{ fontSize: 14, fontWeight: 600, color: "#0f172a" }}>{d.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: "16px 24px", fontSize: 14, color: "#64748b" }}>{d.phone}</td>
                                <td style={{ padding: "16px 24px" }}>
                                    <code style={{ background: "#f1f5f9", color: "#475569", padding: "4px 8px", borderRadius: 6, fontSize: 12, border: "1px solid #e2e8f0" }}>{d.license}</code>
                                </td>
                                <td style={{ padding: "16px 24px", fontSize: 14, color: "#64748b" }}>{d.experience}</td>
                                <td style={{ padding: "16px 24px", fontSize: 14, color: "#334155" }}>{busNum(d.busId) !== "Unassigned" ? <span style={{ display: "inline-block", background: "#f8fafc", color: "#334155", padding: "4px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600, border: "1px solid #e2e8f0" }}>{busNum(d.busId)}</span> : <span style={{ color: "#94a3b8" }}>—</span>}</td>
                                <td style={{ padding: "16px 24px" }}>{ratingsBadge(d.rating)}</td>
                                <td style={{ padding: "16px 24px" }}>{statusBadge(d.status)}</td>
                                <td style={{ padding: "16px 24px", textAlign: "right" }}>
                                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                        <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 6, borderRadius: 6, transition: "background .2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#4f46e5"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }} title="View Profile" onClick={() => { setSel(d); setModal("view") }}>👁</button>
                                        <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 6, borderRadius: 6, transition: "background .2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#1e40af"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }} title="Edit Driver" onClick={() => { setSel(d); setForm({ ...d, busId: d.busId || "" }); setModal("edit") }}>✏</button>
                                        <button style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: 6, borderRadius: 6, transition: "background .2s" }} onMouseEnter={e => { e.currentTarget.style.background = "#fef2f2"; e.currentTarget.style.color = "#dc2626"; }} onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#64748b"; }} title="Delete Driver" onClick={() => { setSel(d); setModal("delete") }}>🗑</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "👤 Add Driver" : "✏ Edit Driver"} onClose={() => setModal(null)}>{DForm()}<div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button style={B.cancel} onClick={() => setModal(null)}>Cancel</button><button style={B.primary} onClick={save}>{modal === "add" ? "Add Driver" : "Save Changes"}</button></div></Modal>}
            {modal === "view" && sel && <Modal title="👤 Driver Profile" onClose={() => setModal(null)}>
                <div style={{ textAlign: "center", marginBottom: 28 }}>
                    <div style={{ width: 80, height: 80, borderRadius: "50%", background: getAvatarColor(sel.name), color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, margin: "0 auto 12px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>{sel.name.charAt(0).toUpperCase()}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "#0f172a" }}>{sel.name}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 8 }}>
                        {ratingsBadge(sel.rating)}
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>·</span>
                        {statusBadge(sel.status)}
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                    {[["Phone", sel.phone], ["License", sel.license], ["Experience", sel.experience], ["Joining Date", sel.joinDate || "—"], ["Assigned Bus", busNum(sel.busId)]].map(([k, v]) => (
                        <div key={k} style={{ background: "#f8fafc", padding: "12px 14px", borderRadius: 10, border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: 11, color: "#64748b", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{k}</div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginTop: 4 }}>{v}</div>
                        </div>
                    ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}><button style={B.primary} onClick={() => setModal(null)}>Close</button></div>
            </Modal>}
            {modal === "delete" && sel && <ConfirmDel name={sel.name} onConfirm={() => { setDrivers(p => p.filter(d => d.id !== sel.id)); setModal(null); showToast("Driver deleted.", "error"); }} onClose={() => setModal(null)} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 4. ROUTE MANAGEMENT
// ═══════════════════════════════════════════════════════════
function RouteManagement({ routes, setRoutes, buses, showToast }) {
    const [modal, setModal] = useState(null);
    const [sel, setSel] = useState(null);
    const [form, setForm] = useState(EMPTY_ROUTE);
    const [search, setSearch] = useState("");

    const filtered = routes.filter(r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.from.toLowerCase().includes(search.toLowerCase()) ||
        r.to.toLowerCase().includes(search.toLowerCase())
    );

    const busOnRoute = routeId => buses.find(b => b.routeId === routeId)?.number || "—";

    const save = () => {
        if (!form.name || !form.from || !form.to) { showToast("Fill required fields.", "error"); return; }
        const stopsArr = typeof form.stops === "string" ? form.stops.split(",").map(s => s.trim()).filter(Boolean) : form.stops;
        if (modal === "add") {
            const newId = "R-" + (Math.max(...routes.map(r => +r.id.split("-")[1] || 100), 100) + 1);
            setRoutes(p => [...p, { ...form, id: newId, stops: stopsArr, fare: +form.fare || 0 }]);
            showToast("Route added.");
        } else {
            setRoutes(p => p.map(r => r.id === sel.id ? { ...form, id: sel.id, stops: stopsArr, fare: +form.fare || 0 } : r));
            showToast("Route updated.");
        }
        setModal(null);
    };

    const RForm = () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            <Field label="Route Name" required span><input style={INP} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="City Center → Airport" /></Field>
            <Field label="From" required><input style={INP} value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))} placeholder="Starting point" /></Field>
            <Field label="To" required><input style={INP} value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))} placeholder="Ending point" /></Field>
            <Field label="Distance"><input style={INP} value={form.distance} onChange={e => setForm(f => ({ ...f, distance: e.target.value }))} placeholder="e.g. 25 km" /></Field>
            <Field label="Duration"><input style={INP} value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="e.g. 45 min" /></Field>
            <Field label="Fare (₹)"><input style={INP} type="number" value={form.fare} onChange={e => setForm(f => ({ ...f, fare: e.target.value }))} /></Field>
            <Field label="Status"><select style={SEL} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}><option value="active">Active</option><option value="inactive">Inactive</option></select></Field>
            <Field label="Stops (comma-separated)" span><input style={INP} value={Array.isArray(form.stops) ? form.stops.join(", ") : form.stops} onChange={e => setForm(f => ({ ...f, stops: e.target.value }))} placeholder="Stop 1, Stop 2, Stop 3" /></Field>
        </div>
    );

    return (
        <div>
            <div style={PG.hdr}>
                <div><h2 style={PG.title}>Route Management</h2><p style={PG.sub}>{routes.length} routes configured</p></div>
                <button style={B.primary} onClick={() => { setForm(EMPTY_ROUTE); setModal("add"); }}>+ Add Route</button>
            </div>
            <div style={PG.bar}>
                <input style={PG.srch} placeholder="🔍 Search routes..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(340px,1fr))", gap: 16 }}>
                {filtered.length === 0 && <p style={{ color: "#94a3b8", padding: 32 }}>No routes found.</p>}
                {filtered.map(r => (
                    <div key={r.id} style={{ background: "#fff", borderRadius: 18, padding: 22, boxShadow: "0 4px 20px rgba(0,0,0,.06)", borderTop: `4px solid ${r.status === "active" ? "#10b981" : "#e2e8f0"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                            <div>
                                <code style={{ background: "#eef2ff", color: "#4f46e5", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>{r.id}</code>
                                <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginTop: 5 }}>{r.name}</div>
                            </div>
                            <Badge val={r.status} />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                            {[["📍 From", r.from], ["🏁 To", r.to], ["📏 Distance", r.distance || "—"], ["⏱ Duration", r.duration || "—"], ["💰 Fare", `₹${r.fare}`], ["🚌 Bus", busOnRoute(r.id)]].map(([lbl, val]) => (
                                <div key={lbl} style={{ fontSize: 13 }}>
                                    <span style={{ color: "#94a3b8" }}>{lbl}:</span> <strong style={{ color: "#334155" }}>{val}</strong>
                                </div>
                            ))}
                        </div>
                        {/* Stops timeline */}
                        <div style={{ marginBottom: 14 }}>
                            <div style={{ fontSize: 12, color: "#94a3b8", fontWeight: 700, marginBottom: 6 }}>STOPS ({r.stops?.length})</div>
                            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 0 }}>
                                {(r.stops || []).map((s, i) => (
                                    <React.Fragment key={i}>
                                        <span style={{ fontSize: 12, background: "#f1f5f9", color: "#334155", padding: "3px 9px", borderRadius: 20, fontWeight: 600 }}>{s}</span>
                                        {i < r.stops.length - 1 && <span style={{ color: "#cbd5e1", fontSize: 14, margin: "0 2px" }}>→</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                            <button style={{ ...B.sm, background: "#f1f5f9", color: "#475569", flex: 1 }} onClick={() => { setSel(r); setModal("view") }}>👁 View</button>
                            <button style={{ ...B.sm, background: "#dbeafe", color: "#1e40af", flex: 1 }} onClick={() => { setSel(r); setForm({ ...r, stops: Array.isArray(r.stops) ? r.stops.join(", ") : r.stops }); setModal("edit") }}>✏ Edit</button>
                            <button style={{ ...B.sm, background: "#fee2e2", color: "#991b1b", flex: 1 }} onClick={() => { setSel(r); setModal("delete") }}>🗑 Delete</button>
                        </div>
                    </div>
                ))}
            </div>

            {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "🗺 Add Route" : "✏ Edit Route"} onClose={() => setModal(null)} wide>{RForm()}<div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button style={B.cancel} onClick={() => setModal(null)}>Cancel</button><button style={B.primary} onClick={save}>{modal === "add" ? "Add Route" : "Save Changes"}</button></div></Modal>}
            {modal === "delete" && sel && <ConfirmDel name={sel.name} onConfirm={() => { setRoutes(p => p.filter(r => r.id !== sel.id)); setModal(null); showToast("Route deleted.", "error"); }} onClose={() => setModal(null)} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 5. TRIP MANAGEMENT
// ═══════════════════════════════════════════════════════════
function TripManagement({ trips, setTrips, buses, drivers, routes, showToast }) {
    const [modal, setModal] = useState(null);
    const [sel, setSel] = useState(null);
    const [form, setForm] = useState(EMPTY_TRIP);
    const [filter, setFilter] = useState("All");
    const [dateFilter, setDateFilter] = useState("");

    const filtered = trips
        .filter(t => filter === "All" || t.status === filter.toLowerCase().replace(" ", "-"))
        .filter(t => !dateFilter || t.date === dateFilter);

    const busNum = id => buses.find(b => b.id === +id)?.number || "—";
    const drvName = id => drivers.find(d => d.id === +id)?.name || "—";
    const rtName = id => routes.find(r => r.id === id)?.name || id;

    const save = () => {
        if (!form.routeId || !form.busId || !form.driverId || !form.date || !form.time) { showToast("Fill all required fields.", "error"); return; }
        // Conflict check: same bus on same date+time
        const conflict = trips.find(t => t.id !== sel?.id && t.busId === +form.busId && t.date === form.date && t.time === form.time);
        if (conflict) { showToast(`Bus already has a trip at ${form.time} on ${form.date}!`, "error"); return; }
        if (modal === "add") {
            const newId = "T-" + (Math.max(...trips.map(t => +t.id.split("-")[1] || 2000), 2000) + 1);
            setTrips(p => [...p, { ...form, id: newId, busId: +form.busId, driverId: +form.driverId, passengers: 0, revenue: 0 }]);
            showToast("Trip scheduled.");
        } else {
            setTrips(p => p.map(t => t.id === sel.id ? { ...form, id: sel.id, busId: +form.busId, driverId: +form.driverId, passengers: +form.passengers || 0, revenue: +form.revenue || 0 } : t));
            showToast("Trip updated.");
        }
        setModal(null);
    };

    const TForm = () => (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 24 }}>
            <Field label="Route" required span><select style={SEL} value={form.routeId} onChange={e => setForm(f => ({ ...f, routeId: e.target.value }))}>
                <option value="">— Select Route —</option>{routes.map(r => <option key={r.id} value={r.id}>{r.id}: {r.name}</option>)}
            </select></Field>
            <Field label="Bus" required><select style={SEL} value={form.busId} onChange={e => setForm(f => ({ ...f, busId: e.target.value }))}>
                <option value="">— Select Bus —</option>{buses.map(b => <option key={b.id} value={b.id}>{b.number}</option>)}
            </select></Field>
            <Field label="Driver" required><select style={SEL} value={form.driverId} onChange={e => setForm(f => ({ ...f, driverId: e.target.value }))}>
                <option value="">— Select Driver —</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select></Field>
            <Field label="Date" required><input style={INP} type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} /></Field>
            <Field label="Departure Time" required><input style={INP} type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} /></Field>
            <Field label="Status"><select style={SEL} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                {["scheduled", "in-progress", "completed", "cancelled"].map(s => <option key={s} value={s}>{s}</option>)}
            </select></Field>
            {modal === "edit" && <>
                <Field label="Passengers"><input style={INP} type="number" value={form.passengers || 0} onChange={e => setForm(f => ({ ...f, passengers: e.target.value }))} /></Field>
                <Field label="Revenue (₹)"><input style={INP} type="number" value={form.revenue || 0} onChange={e => setForm(f => ({ ...f, revenue: e.target.value }))} /></Field>
            </>}
        </div>
    );

    const statusColors = { scheduled: "#f59e0b", "in-progress": "#3b82f6", completed: "#10b981", cancelled: "#ef4444" };

    return (
        <div>
            <div style={PG.hdr}>
                <div><h2 style={PG.title}>Trip Management</h2><p style={PG.sub}>{trips.length} total trips · {trips.filter(t => t.status === "in-progress").length} live now</p></div>
                <button style={B.primary} onClick={() => { setForm(EMPTY_TRIP); setModal("add") }}>+ Schedule Trip</button>
            </div>

            {/* Summary chips */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                {["scheduled", "in-progress", "completed", "cancelled"].map(s => {
                    const cnt = trips.filter(t => t.status === s).length;
                    return <div key={s} style={{ background: "white", borderRadius: 12, padding: "10px 18px", boxShadow: "0 2px 8px rgba(0,0,0,.06)", display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: statusColors[s] }} />
                        <span style={{ fontSize: 13, color: "#64748b", textTransform: "capitalize" }}>{s}:</span>
                        <strong style={{ color: "#0f172a" }}>{cnt}</strong>
                    </div>;
                })}
            </div>

            <div style={PG.bar}>
                <div style={{ display: "flex", gap: 6 }}>
                    {["All", "Scheduled", "In Progress", "Completed", "Cancelled"].map(f => (
                        <button key={f} onClick={() => setFilter(f)} style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid", borderColor: filter === f ? "#4f46e5" : "#e2e8f0", background: filter === f ? "#eef2ff" : "white", color: filter === f ? "#4f46e5" : "#64748b", fontWeight: filter === f ? 700 : 500, fontSize: 12, cursor: "pointer" }}>{f}</button>
                    ))}
                </div>
                <input type="date" style={{ ...PG.srch, flex: "unset", width: 160 }} value={dateFilter} onChange={e => setDateFilter(e.target.value)} title="Filter by date" />
                {dateFilter && <button onClick={() => setDateFilter("")} style={{ ...B.sm, background: "#fee2e2", color: "#991b1b" }}>✕ Clear</button>}
            </div>

            <div style={TABLE.card}>
                <table style={TABLE.table}>
                    <thead><tr>
                        <th style={TABLE.th}>Trip ID</th><th style={TABLE.th}>Route</th><th style={TABLE.th}>Bus</th>
                        <th style={TABLE.th}>Driver</th><th style={TABLE.th}>Date</th><th style={TABLE.th}>Time</th>
                        <th style={TABLE.th}>Passengers</th><th style={TABLE.th}>Revenue</th><th style={TABLE.th}>Status</th><th style={TABLE.th}>Actions</th>
                    </tr></thead>
                    <tbody>
                        {filtered.length === 0 && <tr><td colSpan={10} style={{ padding: 32, textAlign: "center", color: "#94a3b8" }}>No trips found.</td></tr>}
                        {filtered.map(t => (
                            <tr key={t.id} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                                <td style={TABLE.td}><code style={{ background: "#eef2ff", color: "#4f46e5", padding: "2px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700 }}>{t.id}</code></td>
                                <td style={{ ...TABLE.td, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{rtName(t.routeId)}</td>
                                <td style={TABLE.td}>{busNum(t.busId)}</td>
                                <td style={TABLE.td}>{drvName(t.driverId)}</td>
                                <td style={TABLE.td}>{t.date}</td>
                                <td style={TABLE.td}>{t.time}</td>
                                <td style={TABLE.td}>{t.passengers || "—"}</td>
                                <td style={TABLE.td}>{t.revenue ? `₹${t.revenue}` : "—"}</td>
                                <td style={TABLE.td}><Badge val={t.status} /></td>
                                <td style={TABLE.td}>
                                    <div style={{ display: "flex", gap: 5 }}>
                                        <button style={{ ...B.sm, background: "#dbeafe", color: "#1e40af" }} onClick={() => { setSel(t); setForm({ ...t }); setModal("edit") }}>✏</button>
                                        <button style={{ ...B.sm, background: "#fee2e2", color: "#991b1b" }} onClick={() => { setSel(t); setModal("delete") }}>🗑</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {(modal === "add" || modal === "edit") && <Modal title={modal === "add" ? "📋 Schedule Trip" : "✏ Edit Trip"} onClose={() => setModal(null)} wide>{TForm()}<div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}><button style={B.cancel} onClick={() => setModal(null)}>Cancel</button><button style={B.primary} onClick={save}>{modal === "add" ? "Schedule Trip" : "Save Changes"}</button></div></Modal>}
            {modal === "delete" && sel && <ConfirmDel name={sel.id} onConfirm={() => { setTrips(p => p.filter(t => t.id !== sel.id)); setModal(null); showToast("Trip deleted.", "error"); }} onClose={() => setModal(null)} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 6. LIVE TRACKING — Real Firebase GPS
// ═══════════════════════════════════════════════════════════
function LiveTracking({ buses, drivers, routes }) {
    const [liveBuses, setLiveBuses] = useState([]);
    const [sel, setSel]             = useState(null);
    const [lastTick, setLastTick]   = useState(new Date().toLocaleTimeString());
    const [filterRoute, setFilterRoute] = useState("");
    const [filterBus, setFilterBus] = useState("");

    // ✅ Real Firebase listener
    useEffect(() => {
        const tripsRef = ref(_db, "trips");
        const unsubscribe = onValue(tripsRef, (snap) => {
            const data = snap.val();
            if (!data) { setLiveBuses([]); return; }

            const active = [];
            Object.entries(data).forEach(([tripCode, trip]) => {
                if (trip.status === "ended" || !trip.drivers) return;
                Object.entries(trip.drivers).forEach(([driverId, driver]) => {
                    if (!driver.latitude || !driver.longitude) return;
                    const ageMin = (Date.now() - (driver.updatedAt || 0)) / 60000;
                    if (ageMin > 10) return;
                    const matchedDriver = drivers.find(d => d.phone === driverId);
                    const matchedBus    = matchedDriver ? buses.find(b => b.id === matchedDriver.busId) : null;
                    active.push({
                        tripCode, driverId,
                        lat:        driver.latitude,
                        lng:        driver.longitude,
                        speed:      driver.speed || 0,
                        ageMin:     ageMin.toFixed(1),
                        updatedAt:  driver.updatedAt,
                        from:       trip.from  || "—",
                        to:         trip.to    || "—",
                        routeId:    trip.routeId || "",
                        busNo:      trip.busNo || matchedBus?.number || "Unknown",
                        driverName: matchedDriver?.name || driverId,
                        status:     trip.status || "active",
                    });
                });
            });

            setLiveBuses(active);
            setLastTick(new Date().toLocaleTimeString());
        });
        return () => unsubscribe();
    }, [buses, drivers]);

    // Apply Filters
    const filteredBuses = liveBuses.filter(b => {
        if (filterRoute && b.routeId !== filterRoute && b.from !== filterRoute) return false;
        if (filterBus && b.busNo !== filterBus) return false;
        return true;
    });

    return (
        <div>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>Live Tracking</h2>
                    <p style={{ margin: "6px 0 0", fontSize: 14, color: "#64748b" }}>Monitor your fleet in real-time</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 500 }}>Last sync: {lastTick}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: liveBuses.length > 0 ? "#dcfce7" : "#fee2e2", padding: "8px 16px", borderRadius: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: liveBuses.length > 0 ? "#16a34a" : "#dc2626", animation: "pulse 1.5s infinite" }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: liveBuses.length > 0 ? "#166534" : "#991b1b" }}>
                            {liveBuses.length > 0 ? "LIVE SIGNAL" : "NO SIGNAL"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div style={{ display: "flex", gap: 16, marginBottom: 24, background: "white", padding: "16px 20px", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>Select Route:</span>
                    <select style={{ flex: 1, padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", cursor: "pointer", color: "#0f172a", fontWeight: 500 }}
                            value={filterRoute} onChange={e => setFilterRoute(e.target.value)}>
                        <option value="">All Routes</option>
                        {routes && routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                    </select>
                </div>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 14, color: "#64748b", fontWeight: 600 }}>Select Bus:</span>
                    <select style={{ flex: 1, padding: "10px 16px", border: "1px solid #e2e8f0", borderRadius: 10, fontSize: 14, outline: "none", cursor: "pointer", color: "#0f172a", fontWeight: 500 }}
                            value={filterBus} onChange={e => setFilterBus(e.target.value)}>
                        <option value="">All Buses</option>
                        {buses.map(b => <option key={b.id} value={b.number}>{b.number} · {b.model}</option>)}
                    </select>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
                {/* Simulated map with real coords */}
                <div style={{ background: "#e2e8f0", borderRadius: 18, border: "1px solid #cbd5e1", overflow: "hidden", position: "relative", minHeight: 600, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
                    <div style={{ position: "absolute", top: "45%", left: 0, right: 0, height: 4, background: "rgba(255,255,255,.8)" }} />
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: "55%", width: 4, background: "rgba(255,255,255,.8)" }} />
                    
                    {filteredBuses.length === 0 && (
                        <div style={{ position: "relative", zIndex: 10, textAlign: "center", background: "white", padding: "30px 40px", borderRadius: 16, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", border: "1px solid #f1f5f9" }}>
                            <div style={{ fontSize: 40, marginBottom: 12 }}>🗺️</div>
                            <h3 style={{ margin: "0 0 8px", color: "#0f172a", fontSize: 18, fontWeight: 800 }}>Map view placeholder</h3>
                            <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>(Firebase tracking active, but no buses match filters or transmitting right now)</p>
                        </div>
                    )}

                    {filteredBuses.length > 0 && (
                        <>
                            <div style={{ position: "absolute", top: 16, left: 16, background: "white", color: "#0f172a", padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                                🗺 Tamil Nadu — Real GPS from Firebase
                            </div>
                            <div style={{ position: "absolute", bottom: 16, right: 16, display: "flex", flexDirection: "column", gap: 8 }}>
                                <div style={{ background: "white", width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>+</div>
                                <div style={{ background: "white", width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>-</div>
                            </div>
                            
                            {filteredBuses.map((g) => {
                                const baseLat  = filteredBuses[0].lat;
                                const baseLng  = filteredBuses[0].lng;
                                const xClamped = Math.max(8, Math.min(90, 50 + (g.lng - baseLng) * 800));
                                const yClamped = Math.max(10, Math.min(85, 50 - (g.lat - baseLat) * 800));
                                const isSelected = sel === g.tripCode;
                                return (
                                    <div key={g.tripCode} onClick={() => setSel(isSelected ? null : g.tripCode)}
                                        style={{ position: "absolute", left: `${xClamped}%`, top: `${yClamped}%`, cursor: "pointer", transform: "translate(-50%,-100%)", zIndex: isSelected ? 10 : 5, transition: "left 1s ease, top 1s ease" }}>
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div style={{ background: "white", padding: "6px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#0f172a", boxShadow: "0 4px 15px rgba(0,0,0,0.15)", marginBottom: 6, border: `2px solid ${isSelected ? "#4f46e5" : "transparent"}`, whiteSpace: "nowrap" }}>
                                                {g.busNo}
                                            </div>
                                            <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#4f46e5", border: "3px solid white", boxShadow: "0 2px 8px rgba(0,0,0,0.3)" }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </>
                    )}
                </div>

                {/* Right Panel: Live Vehicle Status */}
                <div style={{ background: "white", borderRadius: 18, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column" }}>
                    <div style={{ padding: "20px 24px", borderBottom: "1px solid #e2e8f0" }}>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#0f172a" }}>Live Vehicle Status</h3>
                    </div>
                    
                    <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", flex: 1, maxHeight: 600 }}>
                        {filteredBuses.length === 0 && (
                            <div style={{ textAlign: "center", padding: 40, color: "#64748b", fontSize: 14 }}>
                                No vehicles currently transmitting.
                            </div>
                        )}
                        
                        {filteredBuses.map(g => (
                            <div key={g.tripCode} onClick={() => setSel(sel === g.tripCode ? null : g.tripCode)}
                                style={{ background: sel === g.tripCode ? "#f8fafc" : "white", border: `2px solid ${sel === g.tripCode ? "#4f46e5" : "#e2e8f0"}`, borderRadius: 14, padding: 16, cursor: "pointer", transition: "all .2s" }}>
                                
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a", marginBottom: 4 }}>{g.busNo}</div>
                                        <div style={{ fontSize: 13, color: "#64748b" }}>Route: {g.from} → {g.to}</div>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#dcfce7", color: "#16a34a", padding: "4px 10px", borderRadius: 100, fontSize: 11, fontWeight: 700 }}>
                                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#16a34a" }} />
                                        Active
                                    </div>
                                </div>
                                
                                <div style={{ display: "flex", gap: 16, fontSize: 13 }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: "#94a3b8", marginBottom: 2, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Driver</div>
                                        <div style={{ color: "#334155", fontWeight: 600 }}>{g.driverName}</div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ color: "#94a3b8", marginBottom: 2, fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>Speed</div>
                                        <div style={{ color: "#334155", fontWeight: 600 }}>{g.speed > 0 ? `${(g.speed * 3.6).toFixed(0)} km/h` : "Stopped"}</div>
                                    </div>
                                </div>

                                {sel === g.tripCode && (
                                    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #e2e8f0", fontSize: 12 }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                            <span style={{ color: "#64748b" }}>Last Updated:</span>
                                            <span style={{ color: "#0f172a", fontWeight: 600 }}>{g.ageMin}m ago ({g.updatedAt ? new Date(g.updatedAt).toLocaleTimeString() : "—"})</span>
                                        </div>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                                            <span style={{ color: "#64748b" }}>Coordinates:</span>
                                            <span style={{ color: "#0f172a", fontWeight: 600, fontFamily: "monospace", fontSize: 11 }}>{g.lat.toFixed(5)}, {g.lng.toFixed(5)}</span>
                                        </div>
                                        <a href={`https://www.google.com/maps?q=${g.lat},${g.lng}`} target="_blank" rel="noreferrer"
                                            style={{ display: "block", background: "#f1f5f9", color: "#4f46e5", padding: "8px", borderRadius: 8, textAlign: "center", fontWeight: 700, textDecoration: "none", border: "1px solid #e2e8f0" }}>
                                            Open in Google Maps ↗
                                        </a>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 7. TRIP CODE MANAGER
// ═══════════════════════════════════════════════════════════
function TripCodeManager({ drivers, buses }) {
    const [form, setForm]       = useState({ driverPhone: "", busNo: "", from: "", to: "" });
    const [loading, setLoading] = useState(false);
    const [generated, setGenerated] = useState(null); // { tripCode, ... }
    const [allCodes, setAllCodes]   = useState([]);
    const [copied, setCopied]       = useState(false);

    // Load all trip codes from Firebase
    useEffect(() => {
        const unsub = onValue(ref(_db, "tripCodes"), (snap) => {
            const data = snap.val() || {};
            const list = Object.values(data).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            setAllCodes(list);
        });
        return () => unsub();
    }, []);

    // Generate unique trip code: TC-XXXXXX
    async function generateCode() {
        const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code, exists;
        let tries = 0;
        do {
            let c = "TC-";
            for (let i = 0; i < 6; i++) c += CHARS[Math.floor(Math.random() * CHARS.length)];
            code = c;
            const snap = await get(ref(_db, `tripCodes/${code}`));
            exists = snap.exists();
            tries++;
            if (tries > 20) throw new Error("Could not generate unique code");
        } while (exists);
        return code;
    }

    async function createTripCode() {
        if (!form.driverPhone || !form.busNo || !form.from || !form.to) {
            alert("Please fill all fields.");
            return;
        }
        setLoading(true);
        setGenerated(null);
        try {
            const driver   = drivers.find(d => d.phone === form.driverPhone);
            if (!driver) { alert("Driver not found."); setLoading(false); return; }

            const tripCode = await generateCode();
            const now      = Date.now();
            const data     = {
                tripCode,
                driverPhone: form.driverPhone,
                driverName:  driver.name,
                busNo:       form.busNo,
                from:        form.from,
                to:          form.to,
                status:      "pending",
                createdAt:   now,
                expiresAt:   now + 24 * 60 * 60 * 1000, // 24 hours
            };
            await set(ref(_db, `tripCodes/${tripCode}`), data);
            setGenerated(data);
            setForm({ driverPhone: "", busNo: "", from: "", to: "" });
        } catch (err) {
            alert("Error: " + err.message);
        }
        setLoading(false);
    }

    function copyCode(code) {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    const statusColor = { pending: "#f59e0b", active: "#10b981", ended: "#6b7280", expired: "#ef4444" };
    const statusBg    = { pending: "#fef3c7", active: "#dcfce7", ended: "#f3f4f6", expired: "#fee2e2" };

    const TAMIL_DISTRICTS = [
        "Ariyalur","Chengalpattu","Chennai","Coimbatore","Cuddalore","Dharmapuri",
        "Dindigul","Erode","Kallakurichi","Kancheepuram","Kanyakumari","Karur",
        "Krishnagiri","Madurai","Mayiladuthurai","Nagapattinam","Namakkal",
        "Nilgiris","Perambalur","Pudukkottai","Ramanathapuram","Ranipet",
        "Salem","Sivaganga","Tenkasi","Thanjavur","Theni","Thoothukudi",
        "Tiruchirappalli","Tirunelveli","Tirupathur","Tiruppur","Tiruvallur",
        "Tiruvannamalai","Tiruvarur","Vellore","Villupuram","Virudhunagar",
    ];

    return (
        <div>
            {/* Header */}
            <div style={PG.hdr}>
                <div>
                    <h2 style={PG.title}>🎫 Trip Code Manager</h2>
                    <p style={PG.sub}>Generate & manage secure trip codes for drivers</p>
                </div>
                <div style={{ background: "#eef2ff", padding: "8px 16px", borderRadius: 10, fontSize: 13, fontWeight: 700, color: "#4f46e5" }}>
                    {allCodes.length} Codes Generated
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "400px 1fr", gap: 24 }}>

                {/* ── LEFT: Generate Form ── */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
                        <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                            ➕ Create New Trip Code
                        </h3>

                        {/* Driver */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, display: "block", marginBottom: 6 }}>
                                Assign Driver *
                            </label>
                            <select style={INP} value={form.driverPhone} onChange={e => {
                                const d = drivers.find(x => x.phone === e.target.value);
                                const b = d?.busId ? buses.find(b => b.id === d.busId)?.number || "" : "";
                                setForm(f => ({ ...f, driverPhone: e.target.value, busNo: b }));
                            }}>
                                <option value="">— Select Driver —</option>
                                {drivers.map(d => (
                                    <option key={d.id} value={d.phone}>
                                        {d.name} · {d.phone}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Bus */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, display: "block", marginBottom: 6 }}>
                                Bus *
                            </label>
                            <select style={INP} value={form.busNo} onChange={e => setForm(f => ({ ...f, busNo: e.target.value }))}>
                                <option value="">— Select Bus —</option>
                                {buses.map(b => <option key={b.id} value={b.number}>{b.number} · {b.model}</option>)}
                            </select>
                        </div>

                        {/* From */}
                        <div style={{ marginBottom: 14 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, display: "block", marginBottom: 6 }}>
                                From District *
                            </label>
                            <select style={INP} value={form.from} onChange={e => setForm(f => ({ ...f, from: e.target.value }))}>
                                <option value="">— Select District —</option>
                                {TAMIL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        {/* To */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: .5, display: "block", marginBottom: 6 }}>
                                To District *
                            </label>
                            <select style={INP} value={form.to} onChange={e => setForm(f => ({ ...f, to: e.target.value }))}>
                                <option value="">— Select District —</option>
                                {TAMIL_DISTRICTS.filter(d => d !== form.from).map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>

                        <button
                            onClick={createTripCode}
                            disabled={loading}
                            style={{ width: "100%", background: loading ? "#94a3b8" : "#4f46e5", color: "#fff", border: "none", padding: "14px", fontSize: 15, fontWeight: 800, borderRadius: 12, cursor: loading ? "not-allowed" : "pointer" }}
                        >
                            {loading ? "⏳ Generating..." : "🎫 Generate Trip Code"}
                        </button>
                    </div>

                    {/* ── Generated Code Result ── */}
                    {generated && (
                        <div style={{ background: "#f0fdf4", border: "2px solid #86efac", borderRadius: 20, padding: 24, textAlign: "center" }}>
                            <div style={{ fontSize: 13, color: "#166534", fontWeight: 700, marginBottom: 10 }}>
                                ✅ Trip Code Generated!
                            </div>
                            <div style={{ fontSize: 40, fontWeight: 900, color: "#15803d", letterSpacing: 4, fontFamily: "monospace", marginBottom: 14 }}>
                                {generated.tripCode}
                            </div>
                            <button
                                onClick={() => copyCode(generated.tripCode)}
                                style={{ background: copied ? "#15803d" : "#4f46e5", color: "#fff", border: "none", padding: "9px 22px", borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 14 }}
                            >
                                {copied ? "✅ Copied!" : "📋 Copy Code"}
                            </button>
                            <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.8, textAlign: "left", background: "#fff", borderRadius: 12, padding: "12px 16px" }}>
                                <div>👤 <strong>{generated.driverName}</strong></div>
                                <div>📞 {generated.driverPhone}</div>
                                <div>🚌 {generated.busNo}</div>
                                <div>📍 {generated.from} → {generated.to}</div>
                                <div>⏰ Valid for 24 hours</div>
                            </div>
                            <div style={{ marginTop: 12, background: "#fef3c7", borderRadius: 10, padding: "10px 14px", fontSize: 12, color: "#92400e", textAlign: "left" }}>
                                📲 Share this code with the driver via SMS or WhatsApp
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT: All Trip Codes List ── */}
                <div style={{ background: "#fff", borderRadius: 20, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
                    <h3 style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 800, color: "#0f172a" }}>
                        📋 All Generated Trip Codes
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 580, overflowY: "auto" }}>
                        {allCodes.length === 0 && (
                            <div style={{ textAlign: "center", color: "#94a3b8", padding: 60 }}>
                                <div style={{ fontSize: 40, marginBottom: 12 }}>🎫</div>
                                <p>No trip codes generated yet.</p>
                            </div>
                        )}
                        {allCodes.map(tc => (
                            <div key={tc.tripCode} style={{ border: "1.5px solid #e2e8f0", borderRadius: 14, padding: "14px 16px", display: "grid", gridTemplateColumns: "160px 1fr auto", gap: 12, alignItems: "center" }}>
                                {/* Code */}
                                <div>
                                    <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 900, color: "#4f46e5", letterSpacing: 1 }}>
                                        {tc.tripCode}
                                    </div>
                                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>
                                        {tc.createdAt ? new Date(tc.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                                    </div>
                                </div>
                                {/* Details */}
                                <div style={{ fontSize: 13, color: "#374151", display: "flex", flexDirection: "column", gap: 3 }}>
                                    <div style={{ fontWeight: 700 }}>👤 {tc.driverName || "—"}</div>
                                    <div>📞 {tc.driverPhone}  ·  🚌 {tc.busNo}</div>
                                    <div style={{ color: "#4f46e5", fontWeight: 600 }}>📍 {tc.from} → {tc.to}</div>
                                </div>
                                {/* Status + Copy */}
                                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 800, background: statusBg[tc.status] || "#f3f4f6", color: statusColor[tc.status] || "#374151", padding: "4px 12px", borderRadius: 20, textTransform: "uppercase" }}>
                                        {tc.status}
                                    </span>
                                    {tc.status === "pending" && (
                                        <button onClick={() => copyCode(tc.tripCode)} style={{ background: "#eef2ff", border: "none", color: "#4f46e5", padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                                            📋 Copy
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════
// 8. REPORTS
// ═══════════════════════════════════════════════════════════
function Reports({ trips, buses, drivers, routes }) {
    const completed = trips.filter(t => t.status === "completed");
    const totalRev = completed.reduce((s, t) => s + t.revenue, 0);
    const totalPax = completed.reduce((s, t) => s + t.passengers, 0);
    const avgPax = completed.length ? Math.round(totalPax / completed.length) : 0;

    // Revenue by route
    const routeRev = routes.map(r => {
        const rTrips = completed.filter(t => t.routeId === r.id);
        return { ...r, trips: rTrips.length, rev: rTrips.reduce((s, t) => s + t.revenue, 0), pax: rTrips.reduce((s, t) => s + t.passengers, 0) };
    }).sort((a, b) => b.rev - a.rev);

    const maxRev = Math.max(...routeRev.map(r => r.rev), 1);

    // Driver performance
    const driverPerf = drivers.map(d => {
        const dTrips = completed.filter(t => t.driverId === d.id);
        return { ...d, trips: dTrips.length, pax: dTrips.reduce((s, t) => s + t.passengers, 0), rev: dTrips.reduce((s, t) => s + t.revenue, 0) };
    }).sort((a, b) => b.trips - a.trips);

    return (
        <div>
            <div style={PG.hdr}>
                <div><h2 style={PG.title}>Reports & Analytics</h2><p style={PG.sub}>Based on completed trips</p></div>
            </div>

            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
                <StatCard icon="💰" label="Total Revenue" value={`₹${totalRev.toLocaleString()}`} sub="All completed trips" color="#10b981" />
                <StatCard icon="✅" label="Trips Completed" value={completed.length} sub={`of ${trips.length} total`} color="#4f46e5" />
                <StatCard icon="👥" label="Total Passengers" value={totalPax.toLocaleString()} sub="Carried across routes" color="#f59e0b" />
                <StatCard icon="📊" label="Avg Passengers" value={avgPax} sub="Per completed trip" color="#06b6d4" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

                {/* Revenue by route */}
                <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
                    <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Revenue by Route</h3>
                    {routeRev.map(r => (
                        <div key={r.id} style={{ marginBottom: 16 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                                <span style={{ fontWeight: 600, color: "#334155" }}>{r.name}</span>
                                <span style={{ fontWeight: 800, color: "#10b981" }}>₹{r.rev.toLocaleString()}</span>
                            </div>
                            <div style={{ height: 8, background: "#f1f5f9", borderRadius: 999 }}>
                                <div style={{ width: `${(r.rev / maxRev) * 100}%`, height: "100%", background: "linear-gradient(to right,#4f46e5,#818cf8)", borderRadius: 999, minWidth: r.rev ? 4 : 0, transition: "width .8s" }} />
                            </div>
                            <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>{r.trips} trips · {r.pax} passengers</div>
                        </div>
                    ))}
                </div>

                {/* Driver performance */}
                <div style={{ background: "#fff", borderRadius: 18, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
                    <h3 style={{ margin: "0 0 20px", fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Driver Performance</h3>
                    {driverPerf.map((d, i) => (
                        <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: i === 0 ? "#eef2ff" : "#f8fafc" }}>
                            <div style={{ width: 38, height: 38, borderRadius: "50%", background: `linear-gradient(135deg,${i === 0 ? "#4f46e5,#818cf8" : i === 1 ? "#10b981,#34d399" : "#f59e0b,#fbbf24"})`, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800 }}>{d.name[0]}</div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a" }}>{d.name} {i === 0 && <span style={{ fontSize: 11, background: "#4f46e5", color: "white", borderRadius: 20, padding: "1px 7px", marginLeft: 4 }}>Top</span>}</div>
                                <div style={{ fontSize: 12, color: "#64748b" }}>{d.trips} trips · {d.pax} pax · ₹{d.rev.toLocaleString()}</div>
                            </div>
                            <div style={{ fontSize: 13, color: "#f59e0b", fontWeight: 700 }}>{d.rating}★</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Trip log table */}
            <div style={{ ...TABLE.card, marginTop: 20 }}>
                <div style={{ padding: "18px 20px 0" }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>Complete Trip Log</h3>
                </div>
                <div style={{ overflowX: "auto" }}>
                    <table style={{ ...TABLE.table, marginTop: 12 }}>
                        <thead><tr>
                            <th style={TABLE.th}>Trip ID</th><th style={TABLE.th}>Route</th><th style={TABLE.th}>Date</th>
                            <th style={TABLE.th}>Driver</th><th style={TABLE.th}>Passengers</th><th style={TABLE.th}>Revenue</th><th style={TABLE.th}>Status</th>
                        </tr></thead>
                        <tbody>
                            {trips.map(t => (
                                <tr key={t.id} onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"} onMouseLeave={e => e.currentTarget.style.background = ""}>
                                    <td style={TABLE.td}><code style={{ background: "#eef2ff", color: "#4f46e5", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{t.id}</code></td>
                                    <td style={TABLE.td}>{routes.find(r => r.id === t.routeId)?.name || t.routeId}</td>
                                    <td style={TABLE.td}>{t.date} {t.time}</td>
                                    <td style={TABLE.td}>{drivers.find(d => d.id === t.driverId)?.name || "—"}</td>
                                    <td style={TABLE.td}>{t.passengers || "—"}</td>
                                    <td style={TABLE.td}>{t.revenue ? `₹${t.revenue}` : "—"}</td>
                                    <td style={TABLE.td}><Badge val={t.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function CompanyProfile({ company, setCompany, showToast }) {
    const [edit, setEdit] = useState(false);
    const [form, setForm] = useState(company);
    const save = () => { setCompany(form); setEdit(false); showToast("Company profile updated."); };

    return (
        <div style={TABLE.card}>
            <div style={{ padding: "32px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg, #5e5ce6, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, color: "white" }}>🏢</div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 24, fontWeight: 900 }}>{company.name}</h3>
                        <p style={{ margin: 0, color: "#64748b", fontWeight: 600 }}>{company.city}, {company.state}</p>
                    </div>
                </div>
                {!edit ? (
                    <button style={B.primary} onClick={() => setEdit(true)}>Edit Profile</button>
                ) : (
                    <div style={{ display: "flex", gap: 12 }}>
                        <button style={B.cancel} onClick={() => setEdit(false)}>Cancel</button>
                        <button style={B.primary} onClick={save}>Save Changes</button>
                    </div>
                )}
            </div>
            
            <div style={{ padding: "32px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                    <Field label="Company Name"><input style={INP} value={form.name} disabled={!edit} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></Field>
                    <Field label="Email Address"><input style={INP} value={form.email} disabled={!edit} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></Field>
                    <Field label="Contact Number"><input style={INP} value={form.contact} disabled={!edit} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} /></Field>
                    <Field label="License Number"><input style={INP} value={form.license} disabled={!edit} onChange={e => setForm(f => ({ ...f, license: e.target.value }))} /></Field>
                    <Field label="City"><input style={INP} value={form.city} disabled={!edit} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} /></Field>
                    <Field label="State"><input style={INP} value={form.state} disabled={!edit} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></Field>
                </div>
            </div>
        </div>
    );
}

export default function CompanyAdmin({ onLogout }) {
    const [page, setPage] = useState("dashboard");
    const [buses, setBuses] = useState(SEED_BUSES);
    const [drivers, setDrivers] = useState(SEED_DRIVERS);
    const [routes, setRoutes] = useState(SEED_ROUTES);
    const [trips, setTrips] = useState(SEED_TRIPS);
    const [company, setCompany] = useState(COMPANY);
    const [toast, setToast] = useState(null);
    const [sidebarOpen, setSidebar] = useState(true);
    const [liveCount, setLiveCount] = useState(0);

    const fetchData = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        const headers = { "Authorization": `Bearer ${token}` };
        try {
            // Fetch Buses
            const bRes = await fetch("http://localhost:5000/api/company/buses", { headers });
            const bData = await bRes.json();
            if (bRes.ok && bData.buses) {
                setBuses(bData.buses.map(b => ({
                    id: b.bus_id,
                    number: b.bus_number,
                    model: b.model || "Unknown",
                    capacity: b.capacity,
                    status: b.status,
                    routeId: b.route_id,
                    driverId: b.driver_id || null
                })));
            }

            // Fetch Drivers
            const dRes = await fetch("http://localhost:5000/api/company/drivers", { headers });
            const dData = await dRes.json();
            if (dRes.ok && dData.drivers) {
                setDrivers(dData.drivers.map(d => ({
                    id: d.driver_id,
                    name: d.name,
                    phone: d.phone,
                    license: d.license || "",
                    status: d.status || "active",
                    busId: d.bus_id || null,
                    experience: d.experience || "",
                    rating: 5.0
                })));
            }

            // Fetch Routes
            const rRes = await fetch("http://localhost:5000/api/company/routes", { headers });
            const rData = await rRes.json();
            if (rRes.ok && rData.routes) {
                setRoutes(rData.routes.map(r => ({
                    id: r.route_id,
                    name: r.name,
                    from: r.start_location,
                    to: r.end_location,
                    status: r.status
                })));
            }
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
    };

    useEffect(() => {
        fetchData();

        const tripsRef = ref(_db, "trips");
        const unsub = onValue(tripsRef, (snap) => {
            const data = snap.val();
            if (!data) { setLiveCount(0); return; }
            let count = 0;
            Object.values(data).forEach(trip => {
                if (trip.status !== "ended" && trip.drivers) {
                    Object.values(trip.drivers).forEach(d => {
                        const ageMin = (Date.now() - (d.updatedAt || 0)) / 60000;
                        if (d.latitude && ageMin <= 10) count++;
                    });
                }
            });
            setLiveCount(count);
        });
        return () => unsub();
    }, []);

    // Refresh data when switching to critical pages
    useEffect(() => {
        if (page === "tripcodes" || page === "drivers") {
            fetchData();
        }
    }, [page]);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const NAV_GROUPS = [
        {
            title: "MAIN MENU",
            items: [
                { key: "dashboard", icon: "🏠", label: "Dashboard" },
                { key: "tracking",  icon: "📡", label: "Live Tracking", badge: liveCount > 0 ? liveCount : null },
            ]
        },
        {
            title: "FLEET MANAGEMENT",
            items: [
                { key: "buses",   icon: "🚌", label: "Bus Management" },
                { key: "drivers", icon: "👤", label: "Driver Management" },
                { key: "routes",  icon: "🗺", label: "Route Management" },
            ]
        },
        {
            title: "OPERATIONS",
            items: [
                { key: "trips",     icon: "📋", label: "Trip Management" },
                { key: "reports",   icon: "📊", label: "Reports & Analytics" },
                { key: "tripcodes", icon: "🎫", label: "Trip Codes" },
            ]
        },
        {
            title: "SYSTEM",
            items: [
                { key: "profile", icon: "⚙", label: "Company Profile" },
            ]
        }
    ];

    const allNavItems = NAV_GROUPS.flatMap(g => g.items);
    const activeItem = allNavItems.find(n => n.key === page);
    const pageTitle = activeItem?.label || "Overview";

    const renderPage = () => {
        switch (page) {
            case "dashboard":  return <Dashboard buses={buses} drivers={drivers} routes={routes} trips={trips} company={company} setPage={setPage} />;
            case "buses":      return <BusManagement buses={buses} setBuses={setBuses} drivers={drivers} routes={routes} showToast={showToast} />;
            case "drivers":    return <DriverManagement drivers={drivers} setDrivers={setDrivers} buses={buses} showToast={showToast} />;
            case "routes":     return <RouteManagement routes={routes} setRoutes={setRoutes} buses={buses} showToast={showToast} />;
            case "trips":      return <TripManagement trips={trips} setTrips={setTrips} buses={buses} drivers={drivers} routes={routes} showToast={showToast} />;
            case "tripcodes":  return <TripCodeManager drivers={drivers} buses={buses} />;
            case "tracking":   return <LiveTracking buses={buses} drivers={drivers} routes={routes} />;
            case "reports":    return <Reports trips={trips} buses={buses} drivers={drivers} routes={routes} />;
            case "profile":    return <CompanyProfile company={company} setCompany={setCompany} showToast={showToast} />;
            default:           return <Dashboard buses={buses} drivers={drivers} routes={routes} trips={trips} company={company} setPage={setPage} />;
        }
    };

    return (
        <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif", background: "#f8fafc", overflow: "hidden" }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
                @keyframes caFade { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
                @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }
                * { box-sizing: border-box; }
                ::-webkit-scrollbar { width:6px; height:6px; }
                ::-webkit-scrollbar-track { background:transparent; }
                ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius:10px; }
            `}</style>

            <Toast toast={toast} />

            {/* ── SIDEBAR ── */}
            <aside style={{ 
                width: sidebarOpen ? 280 : 0, 
                background: "#5e5ce6", 
                color: "white", 
                display: "flex", 
                flexDirection: "column", 
                transition: "all .3s cubic-bezier(0.4, 0, 0.2, 1)", 
                overflow: "hidden", 
                flexShrink: 0, 
                position: "relative", 
                zIndex: 20,
                boxShadow: "10px 0 30px rgba(0,0,0,0.05)"
            }}>
                
                {/* Logo Area */}
                <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
                        🚌
                    </div>
                    <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: "-0.5px", whiteSpace: "nowrap" }}>
                        GoBus <span style={{ opacity: 0.8 }}>Admin</span>
                    </div>
                </div>

                {/* Nav Lists */}
                <nav style={{ flex: 1, padding: "10px 16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "32px" }}>
                    {NAV_GROUPS.map((group, i) => (
                        <div key={i}>
                            <div style={{ fontSize: 11, fontWeight: 800, color: "rgba(255,255,255,0.6)", marginBottom: 12, paddingLeft: 16, letterSpacing: "1px", textTransform: "uppercase" }}>
                                {group.title}
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {group.items.map(n => {
                                    const active = page === n.key;
                                    return (
                                        <button key={n.key} onClick={() => setPage(n.key)} style={{
                                            display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 14,
                                            background: active ? "white" : "transparent",
                                            color: active ? "#5e5ce6" : "white", border: "none", cursor: "pointer", textAlign: "left", whiteSpace: "nowrap",
                                            fontWeight: 700, fontSize: 14, width: "100%",
                                            transition: "all .2s"
                                        }}
                                        onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,.1)"; }}
                                        onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                                            <span style={{ fontSize: 18, flexShrink: 0, opacity: active ? 1 : 0.8 }}>{n.icon}</span>
                                            <span style={{ flex: 1 }}>{n.label}</span>
                                            {n.badge && (
                                                <span style={{ background: active ? "#5e5ce6" : "white", color: active ? "white" : "#5e5ce6", borderRadius: 20, fontSize: 11, fontWeight: 800, padding: "2px 8px" }}>
                                                    {n.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </nav>

                {/* Bottom Profile Area */}
                <div style={{ padding: "24px", background: "rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                        <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 800, fontSize: 18, border: "2px solid rgba(255,255,255,0.3)" }}>
                            {company.name[0]}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 800, color: "white", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{company.name}</div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>System Admin</div>
                        </div>
                    </div>
                    <button onClick={onLogout} style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", color: "white", padding: "12px", borderRadius: 12, cursor: "pointer", width: "100%", fontSize: 14, fontWeight: 700, transition: "all .2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.25)"}
                        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── MAIN ── */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

                {/* BUS BACKGROUND IMAGE OVERLAY */}
                <div style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    opacity: 0.15, // Smooth visibility
                    zIndex: 0,
                    pointerEvents: "none"
                }} />

                {/* Header Navbar */}
                <header style={{ 
                    background: "rgba(255, 255, 255, 0.8)", 
                    backdropFilter: "blur(20px)",
                    padding: "0 40px", height: 88, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(0,0,0,0.05)", flexShrink: 0, zIndex: 10 
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <button onClick={() => setSidebar(s => !s)} style={{ background: "#f1f5f9", border: "none", cursor: "pointer", fontSize: 20, color: "#5e5ce6", width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12, transition: "all .2s" }}>
                            {sidebarOpen ? "⬅" : "☰"}
                        </button>
                        
                        <div>
                            <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700, display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                                <span>Company Admin</span>
                                <span style={{ opacity: 0.4 }}>•</span>
                                <span>{company.name}</span>
                            </div>
                            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 900, color: "#1e293b", letterSpacing: "-0.5px" }}>{pageTitle}</h2>
                        </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
                        {/* Status pill */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8, background: liveCount > 0 ? "#ecfdf5" : "#f8fafc", padding: "10px 20px", borderRadius: 100, border: `1px solid ${liveCount > 0 ? "#10b981" : "#e2e8f0"}` }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: liveCount > 0 ? "#10b981" : "#94a3b8", animation: liveCount > 0 ? "pulse 1.5s infinite" : "none" }} />
                            <span style={{ fontSize: 13, fontWeight: 800, color: liveCount > 0 ? "#065f46" : "#475569" }}>{liveCount > 0 ? `${liveCount} LIVE` : "0 LIVE"}</span>
                        </div>

                        {/* Notifications */}
                        <button style={{ position: "relative", background: "white", border: "1px solid #e2e8f0", cursor: "pointer", fontSize: 20, color: "#1e293b", width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                            🔔
                            {buses.some(b => b.status === "maintenance") && (
                                <div style={{ position: "absolute", top: 10, right: 10, background: "#ef4444", border: "2px solid white", width: 12, height: 12, borderRadius: "50%" }} />
                            )}
                        </button>
                        
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg, #5e5ce6, #818cf8)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 900, fontSize: 18, boxShadow: "0 4px 12px rgba(94, 92, 230, 0.3)" }}>
                            {company.name.substring(0, 3).toUpperCase()}
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main style={{ flex: 1, overflowY: "auto", padding: "40px", zIndex: 1 }}>
                    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
                        {renderPage()}
                    </div>
                </main>
            </div>
        </div>
    );
}