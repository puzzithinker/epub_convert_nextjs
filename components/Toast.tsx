"use client";

import { useEffect, useState } from "react";
import { ToastMessage } from "@/types";

interface ToastProps {
  message: ToastMessage | null;
  onComplete: () => void;
}

export function Toast({ message, onComplete }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onComplete, 300); // Wait for fade out
      }, 3400);

      return () => clearTimeout(timer);
    }
  }, [message, onComplete]);

  if (!message) return null;

  return (
    <div
      className={`fixed right-5 bottom-5 z-50 ml-5 px-6 py-4 rounded-lg bg-gray-800 text-gray-50 shadow-lg transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
      onMouseEnter={(e) => {
        e.currentTarget.style.animationPlayState = "paused";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.animationPlayState = "running";
      }}
    >
      {message.content}
    </div>
  );
}
