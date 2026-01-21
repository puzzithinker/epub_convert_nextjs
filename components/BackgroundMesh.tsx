"use client";

import { useTheme } from "./ThemeProvider";

export function BackgroundMesh() {
  const { theme } = useTheme();

  return (
    <>
      {/* Animated gradient mesh background */}
      <div
        className="fixed inset-0 -z-10 overflow-hidden"
        style={{
          background:
            theme === "light"
              ? "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #00f2fe 100%)"
              : "linear-gradient(135deg, #1e3a8a 0%, #312e81 25%, #581c87 50%, #0c4a6e 75%, #164e63 100%)",
          backgroundSize: "400% 400%",
          animation: "gradientShift 15s ease infinite",
          opacity: theme === "light" ? 0.15 : 0.25,
        }}
      />

      {/* Floating geometric shapes */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Circle 1 */}
        <div
          className="absolute rounded-full opacity-20 float"
          style={{
            width: "300px",
            height: "300px",
            background:
              "radial-gradient(circle, var(--accent-purple), transparent)",
            top: "10%",
            left: "5%",
            animationDelay: "0s",
            filter: "blur(60px)",
          }}
        />

        {/* Circle 2 */}
        <div
          className="absolute rounded-full opacity-20 float"
          style={{
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, var(--accent-pink), transparent)",
            top: "40%",
            right: "10%",
            animationDelay: "2s",
            filter: "blur(80px)",
          }}
        />

        {/* Circle 3 */}
        <div
          className="absolute rounded-full opacity-20 float"
          style={{
            width: "250px",
            height: "250px",
            background:
              "radial-gradient(circle, var(--accent-cyan), transparent)",
            bottom: "15%",
            left: "15%",
            animationDelay: "4s",
            filter: "blur(50px)",
          }}
        />

        {/* Square decorative element */}
        <div
          className="absolute opacity-10 float"
          style={{
            width: "200px",
            height: "200px",
            background: "linear-gradient(45deg, var(--primary), var(--success))",
            top: "60%",
            right: "30%",
            borderRadius: "30px",
            transform: "rotate(45deg)",
            animationDelay: "1s",
            filter: "blur(40px)",
          }}
        />
      </div>
    </>
  );
}
