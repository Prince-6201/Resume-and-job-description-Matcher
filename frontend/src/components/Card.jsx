export default function Card({ children, style = {}, className = "" }) {
  return (
    <div
      className={`fade-in ${className}`}
      style={{
        background: "white",
        borderRadius: "var(--r-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: 24,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
