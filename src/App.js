/*import { useState } from "react";
import "./App.css";

import Login from "./Login";
import Drivers from "./Driver";
import Buses from "./Buses";
import Routes from "./Route"; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <>
      {isLoggedIn ? (
        <Dashboard
          activePage={activePage}
          setActivePage={setActivePage}
        />
      ) : (
        <Login onLogin={() => setIsLoggedIn(true)} />
      )}
    </>
  );
}

/* ===== Dashboard ===== */
/*
function Dashboard({ activePage, setActivePage }) {
  return (
    <div className="layout">
      {/* Sidebar *//*}
<aside className="sidebar">
<div className="logo">🚌 GoBus</div>

<ul className="menu">
<li
className={activePage === "dashboard" ? "active" : ""}
onClick={() => setActivePage("dashboard")}
>
Dashboard
</li>

<li
className={activePage === "drivers" ? "active" : ""}
onClick={() => setActivePage("drivers")}
>
Drivers
</li>

<li
className={activePage === "buses" ? "active" : ""}
onClick={() => setActivePage("buses")}
>
Buses
</li>

{/* ✅ ROUTES CONNECTED *//*}
<li
className={activePage === "routes" ? "active" : ""}
onClick={() => setActivePage("routes")}
>
Routes
</li>

<li>Tracking</li>
</ul>
</aside>

{/* Main *//*}
<div className="main-area">
  <header className="topbar">
    <h1>
      {activePage === "dashboard" && "Dashboard"}
      {activePage === "drivers" && "Manage Drivers"}
      {activePage === "buses" && "Manage Buses"}
      {activePage === "routes" && "Manage Routes"} {/* ✅ NEW *//*}
</h1>

<div className="profile">Admin</div>
</header>
/*
<main className="content">
{/* ===== Dashboard Page ===== *//*}
{activePage === "dashboard" && (
  <>
    <div className="cards">
      <div className="card">
        <span className="card-title">Total Drivers</span>
        <h2>12</h2>
      </div>

      <div className="card">
        <span className="card-title">Total Buses</span>
        <h2>8</h2>
      </div>

      <div className="card">
        <span className="card-title">Active Trips</span>
        <h2>5</h2>
      </div>
    </div>

    <div className="chart">
      <h3>Live Activity</h3>
      <p>Map / Graph later add pannalaam</p>
    </div>
  </>
)}

{/* ===== Other Pages ===== *//*}
{activePage === "drivers" && <Drivers />}
{activePage === "buses" && <Buses />}
{activePage === "routes" && <Routes />} {/* ✅ NEW *//*}
</main>
</div>
</div>
);
}

export default App;
*/
// import { useState } from "react";
// import "./App.css";
// import Login from "./Login";
// import Drivers from "./Driver";
// import Buses from "./Buses";
// import Routes from "./Route";
// import CompanyAdmin from "./CompanyAdmin";

// // Role credentials (in production, these come from your backend/Firebase)
// const CREDENTIALS = {
//   "admin@gobus.in": { password: "admin123", role: "main-admin", name: "Main Admin" },
//   "company@smt.in": { password: "company123", role: "company-admin", name: "Sri Murugan Transport" },
//   "driver@gobus.in": { password: "driver123", role: "driver", name: "Ramesh Kumar" },
// };

// export default function App() {
//   const [user, setUser] = useState(null); // { email, role, name }

//   const handleLogin = (email, password) => {
//     const found = CREDENTIALS[email.toLowerCase()];
//     if (found && found.password === password) {
//       setUser({ email, role: found.role, name: found.name });
//       return true;
//     }
//     return false;
//   };

//   const handleLogout = () => setUser(null);

//   if (!user) return <Login onLogin={handleLogin} />;

//   if (user.role === "company-admin") return <CompanyAdmin onLogout={handleLogout} user={user} />;
//   if (user.role === "main-admin") return <MainAdminDashboard user={user} onLogout={handleLogout} />;
//   if (user.role === "driver") return <DriverPortal user={user} onLogout={handleLogout} />;

//   return <Login onLogin={handleLogin} />;
// }

// // ─── MAIN ADMIN DASHBOARD ────────────────────────────────────────────────────
// function MainAdminDashboard({ user, onLogout }) {
//   const [activePage, setActivePage] = useState("dashboard");

//   return (
//     <div className="layout">
//       <aside className="sidebar">
//         <div className="logo">🚌 GoBus</div>
//         <ul className="menu">
//           {[["dashboard", "Dashboard"], ["drivers", "Drivers"], ["buses", "Buses"], ["routes", "Routes"], ["companies", "Companies"]].map(([key, label]) => (
//             <li key={key} className={activePage === key ? "active" : ""} onClick={() => setActivePage(key)}>{label}</li>
//           ))}
//         </ul>
//         <div style={{ position: "absolute", bottom: 24, left: 24, right: 24 }}>
//           <button onClick={onLogout} style={{ background: "rgba(255,255,255,.15)", border: "none", color: "white", padding: "10px", borderRadius: 10, cursor: "pointer", width: "100%", fontSize: 13, fontWeight: 700 }}>
//             ← Logout
//           </button>
//         </div>
//       </aside>

//       <div className="main-area">
//         <header className="topbar">
//           <h1>
//             {activePage === "dashboard" && "Dashboard"}
//             {activePage === "drivers" && "Manage Drivers"}
//             {activePage === "buses" && "Manage Buses"}
//             {activePage === "routes" && "Manage Routes"}
//             {activePage === "companies" && "Manage Companies"}
//           </h1>
//           <div className="profile">👑 {user.name}</div>
//         </header>

//         <main className="content">
//           {activePage === "dashboard" && (
//             <>
//               <div className="cards">
//                 <div className="card"><span className="card-title">Total Drivers</span><h2>12</h2></div>
//                 <div className="card"><span className="card-title">Total Buses</span><h2>8</h2></div>
//                 <div className="card"><span className="card-title">Active Trips</span><h2>5</h2></div>
//                 <div className="card"><span className="card-title">Companies</span><h2>3</h2></div>
//               </div>
//               <div className="chart">
//                 <h3>System Overview</h3>
//                 <p style={{ color: "#94a3b8", marginTop: 8 }}>Live activity map will appear here (integrate Google Maps / Leaflet API)</p>
//                 <div style={{ marginTop: 20, display: "flex", gap: 16 }}>
//                   {[["company@smt.in", "Sri Murugan Transport", "4 buses", "Active"], ["company2@abc.in", "ABC Travels", "2 buses", "Active"], ["company3@xyz.in", "XYZ Express", "2 buses", "Inactive"]].map(([, name, buses, status]) => (
//                     <div key={name} style={{ flex: 1, background: "#f8fafc", borderRadius: 12, padding: 16 }}>
//                       <div style={{ fontWeight: 700, color: "#0f172a" }}>{name}</div>
//                       <div style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{buses} · {status}</div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </>
//           )}
//           {activePage === "drivers" && <Drivers />}
//           {activePage === "buses" && <Buses />}
//           {activePage === "routes" && <Routes />}
//           {activePage === "companies" && <CompaniesPage />}
//         </main>
//       </div>
//     </div>
//   );
// }

// // Simple Companies listing for Main Admin
// function CompaniesPage() {
//   const [companies] = useState([
//     { id: "COMP-001", name: "Sri Murugan Transport Co.", city: "Madurai", buses: 4, drivers: 4, status: "active", contact: "9876500000" },
//     { id: "COMP-002", name: "ABC Travels", city: "Chennai", buses: 2, drivers: 2, status: "active", contact: "9123400000" },
//     { id: "COMP-003", name: "XYZ Express", city: "Coimbatore", buses: 2, drivers: 1, status: "inactive", contact: "9988800000" },
//   ]);
//   return (
//     <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
//       <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Registered Companies</h2>
//       <table style={{ width: "100%", borderCollapse: "collapse" }}>
//         <thead><tr style={{ borderBottom: "1px solid #e2e8f0" }}>
//           {["Company ID", "Name", "City", "Buses", "Drivers", "Contact", "Status"].map(h => (
//             <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{h}</th>
//           ))}
//         </tr></thead>
//         <tbody>
//           {companies.map(c => (
//             <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
//               <td style={{ padding: "14px", fontSize: 13 }}><code style={{ background: "#eef2ff", color: "#4f46e5", padding: "2px 8px", borderRadius: 6 }}>{c.id}</code></td>
//               <td style={{ padding: "14px", fontWeight: 700, color: "#0f172a" }}>{c.name}</td>
//               <td style={{ padding: "14px", color: "#64748b" }}>{c.city}</td>
//               <td style={{ padding: "14px" }}>{c.buses}</td>
//               <td style={{ padding: "14px" }}>{c.drivers}</td>
//               <td style={{ padding: "14px", color: "#64748b" }}>{c.contact}</td>
//               <td style={{ padding: "14px" }}>
//                 <span style={{ background: c.status === "active" ? "#dcfce7" : "#fee2e2", color: c.status === "active" ? "#166534" : "#991b1b", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{c.status}</span>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// // ─── DRIVER PORTAL (placeholder — you already built this) ────────────────────
// function DriverPortal({ user, onLogout }) {
//   return (
//     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f4f8", flexDirection: "column", gap: 20 }}>
//       <div style={{ background: "white", padding: 40, borderRadius: 20, boxShadow: "0 8px 30px rgba(0,0,0,.1)", textAlign: "center" }}>
//         <div style={{ fontSize: 64 }}>🚌</div>
//         <h2 style={{ margin: "16px 0 8px", color: "#0f172a" }}>Driver Portal</h2>
//         <p style={{ color: "#64748b", marginBottom: 24 }}>Welcome, {user.name}! Your driver module is loaded here.</p>
//         <button onClick={onLogout} style={{ background: "#4f46e5", color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>← Logout</button>
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import "./App.css";
import Login from "./Login";
import Drivers from "./Driver";
import Buses from "./Buses";
import Routes from "./Route";
import CompanyAdmin from "./CompanyAdmin";

// ✅ USERNAME-based credentials (no email needed)
const CREDENTIALS = {
  "admin1": { password: "pass123", role: "main-admin", name: "Main Admin" },
  "companyadmin": { password: "admin123", role: "company-admin", name: "ABC Admin" },
  "9898989898": { password: "driver789", role: "driver", name: "Manikandan" }, // Note: driver login requires phone 9898989898 in the DB
};

export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = async (username, password) => {
    try {
      // 1. Try Main Admin First
      let res = await fetch("http://localhost:5000/api/auth/main-admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password })
      });
      let data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        setUser({ ...data.user });
        return true;
      }

      // 2. If Main Admin fails, Try Company Admin
      res = await fetch("http://localhost:5000/api/auth/company-admin/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password })
      });
      data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        setUser({ ...data.user });
        return true;
      }

      // 3. Driver (Uses phone as username)
      res = await fetch("http://localhost:5000/api/auth/driver/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: username, password })
      });
      data = await res.json();
      
      if (res.ok && data.success) {
        localStorage.setItem("token", data.token);
        setUser({ ...data.user });
        return true;
      }
      
      console.error("Backend login failed for all roles.");
    } catch (err) {
      console.warn("Backend API unreachable, trying local mock fallback:", err);
    }

    // 4. Fallback Local Mock (just in case the database isn't fully seeded yet)
    const found = CREDENTIALS[username.toLowerCase()];
    if (found && found.password === password) {
      // Create a mock token for local testing without the backend
      const mockToken = "mock_token_" + found.role;
      localStorage.setItem("token", mockToken);

      setUser({ username, role: found.role, name: found.name });
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;
  if (user.role === "company-admin") return <CompanyAdmin onLogout={handleLogout} user={user} />;
  if (user.role === "main-admin") return <MainAdminDashboard user={user} onLogout={handleLogout} />;
  if (user.role === "driver") return <DriverPortal user={user} onLogout={handleLogout} />;

  return <Login onLogin={handleLogin} />;
}

/* ─── MAIN ADMIN DASHBOARD ─────────────────────────────── */
function MainAdminDashboard({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif", overflow: "hidden", background: "#f8fafc" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: "280px",
        background: "#1e1b4b", // matched dark shade
        borderRight: "1px solid #312e81", // matched border
        color: "white",
        display: "flex",
        flexDirection: "column",
        boxShadow: "4px 0 24px rgba(0,0,0,0.1)",
        zIndex: 10,
        position: "relative"
      }}>
        {/* Logo Area */}
        <div style={{ padding: "32px 28px", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 800, margin: 0, letterSpacing: "-0.5px" }}>GoBus Admin</h2>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>Main Admin Panel</div>
        </div>

        {/* User Card */}
        <div style={{ margin: "0 20px 24px", padding: "16px", background: "rgba(255,255,255,0.1)", borderRadius: "16px", display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "12px", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: "bold" }}>A</div>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 700 }}>{user.name}</div>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "2px" }}>Superadmin</div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "0 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: "❖" },
            { id: "companies", label: "Companies", icon: "🏢" },
            { id: "companyAdmins", label: "Company Admins", icon: "👥" },
            { id: "tripMonitor", label: "Trip Monitor", icon: "(o)", badge: "LIVE" }
          ].map((item) => {
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                style={{
                  display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px",
                  borderRadius: "14px", border: "none", cursor: "pointer", width: "100%", textIndent: 0,
                  background: isActive ? "rgba(79,70,229,0.3)" : "transparent",
                  color: isActive ? "#ffffff" : "#a5b4fc",
                  fontSize: "15px", fontWeight: isActive ? 700 : 500,
                  textAlign: "left", transition: "all 0.2s ease"
                }}
                onMouseOver={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.color = "#ffffff"; } }}
                onMouseOut={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#a5b4fc"; } }}
              >
                <span style={{ fontSize: "18px", opacity: isActive ? 1 : 0.8, color: isActive ? "#818cf8" : "rgba(165,180,252,0.7)" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: "#ef4444", color: "white", padding: "4px 8px",
                    borderRadius: "20px", fontSize: "10px", fontWeight: 800, letterSpacing: "0.5px"
                  }}>{item.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ padding: "24px", marginTop: "auto" }}>
          <button
            onClick={onLogout}
            style={{
              width: "100%", padding: "14px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent", color: "white", fontSize: "14px", fontWeight: 700,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px",
              transition: "all 0.2s"
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
            onMouseOut={(e) => e.currentTarget.style.background = "transparent"}
          >
            <span>←</span> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", position: "relative" }}>
        
        {/* BUS BACKGROUND IMAGE OVERLAY */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.4, // Increased visibility
          zIndex: 0,
          pointerEvents: "none"
        }} />

        {/* TOP HEADER */}
        <header style={{
          padding: "24px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(226, 232, 240, 0.8)",
          zIndex: 10,
          boxShadow: "0 4px 24px rgba(0,0,0,0.02)"
        }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ color: "#4f46e5" }}>⊞</span> 
              {activePage === "dashboard" && "Dashboard Overview"}
              {activePage === "companies" && "Company Management"}
              {activePage === "companyAdmins" && "Admin Access Control"}
              {activePage === "tripMonitor" && "Live Network Monitor"}
            </h1>
            <div style={{ fontSize: "13px", color: "#64748b", marginTop: "6px" }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ background: "#e0e7ff", color: "#4f46e5", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 700, display: "flex", alignItems: "center", gap: "8px" }}>
              👑 Main Admin
            </div>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <main style={{ flex: 1, padding: "32px 40px", overflowY: "auto", zIndex: 1 }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {activePage === "dashboard" && <MainAdminDashboardView user={user} />}
            {activePage === "companies" && <CompaniesPage />}
            {activePage === "companyAdmins" && <div style={{ background: "white", padding: 40, borderRadius: 20 }}>Company Admins Comming Soon...</div>}
            {activePage === "tripMonitor" && <div style={{ background: "white", padding: 40, borderRadius: 20 }}>Live Map coming soon...</div>}
          </div>
        </main>
      </div>
    </div>
  );
}

function MainAdminDashboardView({ user }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Welcome Banner */}
      <div style={{
        background: "linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)",
        borderRadius: "24px",
        padding: "36px 40px",
        color: "white",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(79, 70, 229, 0.2)"
      }}>
        {/* Abstract shapes for banner background */}
        <div style={{ position: "absolute", top: "-50px", right: "-50px", width: "300px", height: "300px", background: "rgba(255,255,255,0.1)", borderRadius: "50%", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", bottom: "-50px", right: "200px", width: "200px", height: "200px", background: "rgba(255,255,255,0.05)", borderRadius: "50%", filter: "blur(20px)" }} />
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <h2 style={{ fontSize: "32px", fontWeight: 800, margin: "0 0 8px", display: "flex", alignItems: "center", gap: "12px" }}>
            Welcome, {user.name} 👋
          </h2>
          <p style={{ margin: "0 0 24px", fontSize: "15px", color: "rgba(255,255,255,0.8)" }}>
            GoBus Fleet Management System · {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
          <div style={{ display: "flex", gap: "12px" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, backdropFilter: "blur(10px)" }}>5 Companies</span>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, backdropFilter: "blur(10px)" }}>3 Live Trips</span>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "6px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: 600, backdropFilter: "blur(10px)" }}>25 Drivers</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "20px" }}>
        {[
          { icon: "🏢", label: "Total Companies", value: "5", sub: "4 active, 1 inactive" },
          { icon: "🚌", label: "Live Trips", value: "3", sub: "Running right now" },
          { icon: "📅", label: "Trips Today", value: "12", sub: "10 done, 2 active" },
          { icon: "👤", label: "Total Drivers", value: "25", sub: "18 on duty" },
          { icon: "⏱️", label: "Avg Duration", value: "47m", sub: "Per trip" },
        ].map((stat, i) => (
          <div key={i} style={{
            background: "rgba(255, 255, 255, 0.9)",
            backdropFilter: "blur(10px)",
            borderRadius: "20px",
            padding: "24px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
            display: "flex", flexDirection: "column",
            border: "1px solid rgba(255,255,255,0.5)"
          }}>
            <div style={{ fontSize: "28px", marginBottom: "16px" }}>{stat.icon}</div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#0f172a", marginBottom: "4px", lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#475569", marginBottom: "4px" }}>{stat.label}</div>
            <div style={{ fontSize: "12px", color: "#94a3b8" }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Bottom Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "3fr 2fr", gap: "24px" }}>
        {/* Weekly Chart Placeholder */}
        <div style={{
          background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)", borderRadius: "24px",
          padding: "28px", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
        }}>
          <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
            📊 This Week's Trips
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "12px 0", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px", fontWeight: 700 }}>DAY</th>
                <th style={{ textAlign: "center", padding: "12px 0", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px", fontWeight: 700 }}>TRIPS</th>
                <th style={{ textAlign: "right", padding: "12px 0", borderBottom: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px", fontWeight: 700 }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: "16px 0", borderBottom: "1px solid #f1f5f9", fontWeight: 600, color: "#0f172a" }}>Monday</td>
                <td style={{ padding: "16px 0", borderBottom: "1px solid #f1f5f9", fontWeight: 700, color: "#1e293b", textAlign: "center" }}>8</td>
                <td style={{ padding: "16px 0", borderBottom: "1px solid #f1f5f9", textAlign: "right" }}><span style={{ color: "#3b82f6", background: "#eff6ff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>Normal</span></td>
              </tr>
              <tr>
                <td style={{ padding: "16px 0", fontWeight: 600, color: "#0f172a" }}>Tuesday</td>
                <td style={{ padding: "16px 0", fontWeight: 700, color: "#1e293b", textAlign: "center" }}>12</td>
                <td style={{ padding: "16px 0", textAlign: "right" }}><span style={{ color: "#3b82f6", background: "#eff6ff", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: 700 }}>Normal</span></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(10px)", borderRadius: "24px",
          padding: "28px", border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
        }}>
          <h3 style={{ margin: "0 0 24px", fontSize: "16px", fontWeight: 800, color: "#0f172a", display: "flex", alignItems: "center", gap: "8px" }}>
            ⏱️ Recent Activity
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ background: "#e0e7ff", padding: "10px", borderRadius: "10px", fontSize: "16px" }}>🏢</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>New company registered</div>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Sri Murugan Transport</div>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>2 min ago</div>
            </div>
            
            <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
              <div style={{ background: "#dcfce7", padding: "10px", borderRadius: "10px", fontSize: "16px" }}>✅</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a" }}>Trip completed</div>
                <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>Route: Madurai → Chennai</div>
              </div>
              <div style={{ fontSize: "12px", color: "#94a3b8" }}>14 min ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompaniesPage() {
  const companies = [
    { id: "COMP-001", name: "Sri Murugan Transport Co.", city: "Madurai", buses: 4, drivers: 4, status: "active" },
    { id: "COMP-002", name: "ABC Travels", city: "Chennai", buses: 2, drivers: 2, status: "active" },
    { id: "COMP-003", name: "XYZ Express", city: "Coimbatore", buses: 2, drivers: 1, status: "inactive" },
  ];
  return (
    <div style={{ background: "white", borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,.06)" }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 800, color: "#0f172a" }}>Registered Companies</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead><tr>
          {["Company ID", "Name", "City", "Buses", "Drivers", "Status"].map(h => (
            <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, color: "#64748b", fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #e2e8f0" }}>{h}</th>
          ))}
        </tr></thead>
        <tbody>
          {companies.map(c => (
            <tr key={c.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
              <td style={{ padding: "14px" }}><code style={{ background: "#eef2ff", color: "#4f46e5", padding: "2px 8px", borderRadius: 6, fontSize: 12 }}>{c.id}</code></td>
              <td style={{ padding: "14px", fontWeight: 700, color: "#0f172a" }}>{c.name}</td>
              <td style={{ padding: "14px", color: "#64748b" }}>{c.city}</td>
              <td style={{ padding: "14px" }}>{c.buses}</td>
              <td style={{ padding: "14px" }}>{c.drivers}</td>
              <td style={{ padding: "14px" }}>
                <span style={{ background: c.status === "active" ? "#dcfce7" : "#fee2e2", color: c.status === "active" ? "#166534" : "#991b1b", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 }}>{c.status}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DriverPortal({ user, onLogout }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#f0f4f8" }}>
      <div style={{ background: "white", padding: 40, borderRadius: 20, boxShadow: "0 8px 30px rgba(0,0,0,.1)", textAlign: "center" }}>
        <div style={{ fontSize: 64 }}>🚌</div>
        <h2 style={{ margin: "16px 0 8px", color: "#0f172a" }}>Driver Portal</h2>
        <p style={{ color: "#64748b", marginBottom: 24 }}>Welcome, {user.name}! Your driver module loads here.</p>
        <button onClick={onLogout} style={{ background: "#4f46e5", color: "white", border: "none", padding: "12px 28px", borderRadius: 10, fontWeight: 700, cursor: "pointer" }}>← Logout</button>
      </div>
    </div>
  );
}