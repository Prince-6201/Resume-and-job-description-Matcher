export default function Badge({
  label,
  color = "#4f46e5",
  bg = "#eef2ff",
  style = {},
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 11px",
        borderRadius: "var(--r-full)",
        fontSize: 12,
        fontWeight: 700,
        color,
        background: bg,
        ...style,
      }}
    >
      {label}
    </span>
  );
}
export function ScoreBadge({ pct }) {
  const [color, bg] =
    pct >= 75
      ? ["#065f46", "#f0fdf4"]
      : pct >= 50
        ? ["#92400e", "#fffbeb"]
        : ["#991b1b", "#fef2f2"];
  return <Badge label={`${pct}%`} color={color} bg={bg} />;
}
