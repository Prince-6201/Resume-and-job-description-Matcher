import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  FileText,
  Zap,
  Clock,
  User,
  Users,
  Trophy,
  Target,
  Menu,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const USER_NAV = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/upload", label: "Upload Resume", icon: Upload },
  { path: "/jd", label: "Job Description", icon: FileText },
  { path: "/matcher", label: "Matcher", icon: Zap },
  { path: "/history", label: "History", icon: Clock },
  { path: "/profile", label: "Profile", icon: User },
];
const HR_NAV = [
  { path: "/hr/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/hr/upload", label: "Upload Resumes", icon: Upload },
  { path: "/hr/jd", label: "Job Description", icon: FileText },
  { path: "/hr/leaderboard", label: "Leaderboard", icon: Trophy },
  { path: "/hr/applicants", label: "All Applicants", icon: Users },
  { path: "/profile", label: "Profile", icon: User },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const nav = user?.role === "hr" ? HR_NAV : USER_NAV;
  const w = collapsed ? 70 : 244;

  return (
    <aside
      style={{
        width: w,
        minHeight: "100vh",
        flexShrink: 0,
        background:
          "linear-gradient(180deg,#1e1b4b 0%,#312e81 60%,#3730a3 100%)",
        display: "flex",
        flexDirection: "column",
        transition: "width .3s cubic-bezier(.4,0,.2,1)",
        boxShadow: "4px 0 24px rgba(30,27,75,.35)",
        zIndex: 10,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "18px 14px",
          borderBottom: "1px solid rgba(255,255,255,.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "linear-gradient(135deg,#818cf8,#6366f1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Target size={20} color="white" />
          </div>
          {!collapsed && (
            <div>
              <div
                style={{
                  color: "white",
                  fontWeight: 800,
                  fontSize: 17,
                  letterSpacing: -0.5,
                }}
              >
                ResuMatch
              </div>
              <div
                style={{
                  color: "#818cf8",
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                }}
              >
                {user?.role === "hr" ? "HR Portal" : "Candidate Portal"}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#818cf8",
            padding: 4,
            display: "flex",
            flexShrink: 0,
          }}
        >
          <Menu size={17} />
        </button>
      </div>

      <nav
        style={{
          flex: 1,
          padding: "10px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        {nav.map((item) => {
          const Icon = item.icon,
            active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ""}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 11,
                padding: "11px 12px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                background: active ? "rgba(129,140,248,.18)" : "transparent",
                color: active ? "#c7d2fe" : "#94a3b8",
                fontWeight: active ? 700 : 500,
                fontSize: 13.5,
                transition: "all .18s",
                justifyContent: collapsed ? "center" : "flex-start",
                borderLeft: `3px solid ${active ? "#818cf8" : "transparent"}`,
                width: "100%",
                fontFamily: "inherit",
              }}
            >
              <Icon size={17} style={{ flexShrink: 0 }} />
              {!collapsed && (
                <span
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div
        style={{
          padding: "10px 8px",
          borderTop: "1px solid rgba(255,255,255,.08)",
          flexShrink: 0,
        }}
      >
        {!collapsed && (
          <div
            style={{
              padding: "10px 12px",
              marginBottom: 4,
              background: "rgba(129,140,248,.1)",
              borderRadius: 10,
            }}
          >
            <div style={{ color: "#c7d2fe", fontSize: 12, fontWeight: 600 }}>
              {user?.name}
            </div>
            <div style={{ color: "#64748b", fontSize: 11 }}>{user?.email}</div>
          </div>
        )}
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          title={collapsed ? "Logout" : ""}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 11,
            padding: "11px 12px",
            width: "100%",
            borderRadius: 10,
            border: "none",
            cursor: "pointer",
            background: "transparent",
            color: "#94a3b8",
            fontWeight: 500,
            fontSize: 13.5,
            justifyContent: collapsed ? "center" : "flex-start",
            fontFamily: "inherit",
          }}
        >
          <LogOut size={17} />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
