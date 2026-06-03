import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Apple touch icon — reversed Tide mark on the brand teal ground.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f3b2e",
          borderRadius: 40,
        }}
      >
        <svg width="120" height="120" viewBox="0 0 56 56" fill="none">
          <line x1="2" y1="42" x2="22" y2="42" stroke="#fffefb" strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
          <line x1="34" y1="42" x2="54" y2="42" stroke="#fffefb" strokeWidth="1.6" opacity="0.6" strokeLinecap="round" />
          <line x1="28" y1="42" x2="28" y2="51.5" stroke="#b8743a" strokeWidth="1.7" strokeDasharray="2 2" />
          <path d="M 25.5 51.5 L 28 54.5 L 30.5 51.5 Z" fill="#b8743a" />
          <path d="M 13 18 L 28 39 L 43 18" stroke="#fffefb" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
          <path d="M 6 10 L 28 42 L 50 10" stroke="#fffefb" strokeWidth="3.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="28" cy="42" r="3" fill="#b8743a" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
