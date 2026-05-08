import { Bell } from "lucide-react";
export default function Header({ title, subtitle }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 28,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: 25,
            fontWeight: 800,
            color: "var(--text-primary)",
            margin: 0,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              color: "var(--text-secondary)",
              margin: "4px 0 0",
              fontSize: 13.5,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      <button
        style={{
          background: "white",
          border: "1px solid var(--border)",
          borderRadius: "var(--r-md)",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          gap: 7,
          fontSize: 13,
          fontWeight: 600,
          color: "var(--gray-700)",
          cursor: "pointer",
        }}
      >
        <Bell size={14} /> Notifications
      </button>
    </div>
  );
}
