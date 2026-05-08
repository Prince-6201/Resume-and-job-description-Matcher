export default function CircularProgress({ percentage = 0, size = 170 }) {
  const sw = 14,
    r = (size - sw) / 2,
    circ = 2 * Math.PI * r,
    offset = circ - (percentage / 100) * circ;
  const color =
    percentage >= 75
      ? "var(--green)"
      : percentage >= 50
        ? "var(--amber)"
        : "var(--red)";
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)", display: "block" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--gray-200)"
          strokeWidth={sw}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)",
          }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 34, fontWeight: 800, color, lineHeight: 1 }}>
          {percentage}%
        </span>
        <span
          style={{
            fontSize: 10,
            color: "var(--text-muted)",
            fontWeight: 700,
            letterSpacing: 2,
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          MATCH
        </span>
      </div>
    </div>
  );
}
