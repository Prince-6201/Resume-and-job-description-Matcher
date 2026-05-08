import { CheckCircle, XCircle } from "lucide-react";
export default function SkillChip({ skill, matched = true }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 7,
        padding: "7px 11px",
        borderRadius: "var(--r-sm)",
        marginBottom: 5,
        background: matched ? "var(--green-l)" : "var(--red-l)",
        border: `1px solid ${matched ? "#bbf7d0" : "#fecaca"}`,
      }}
    >
      {matched ? (
        <CheckCircle size={13} color="var(--green)" />
      ) : (
        <XCircle size={13} color="var(--red)" />
      )}
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: matched ? "var(--green-d)" : "var(--red-d)",
        }}
      >
        {skill}
      </span>
    </div>
  );
}
