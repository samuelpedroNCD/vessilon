export default function AppLoading() {
  return (
    <div style={{ padding: 24, background: "#fffefb", minHeight: "60vh" }}>
      <div style={{ height: 30, width: 220, borderRadius: 8, background: "#efece5", marginBottom: 22 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ height: 96, borderRadius: 12, background: "#f4f1ea", border: "1px solid #ece8e0" }} />
        ))}
      </div>
      <div style={{ height: 320, borderRadius: 12, background: "#f4f1ea", border: "1px solid #ece8e0" }} />
      <style>{`@keyframes vsl-pulse{0%,100%{opacity:1}50%{opacity:.55}} div[style*="f4f1ea"],div[style*="efece5"]{animation:vsl-pulse 1.4s ease-in-out infinite}`}</style>
    </div>
  );
}
