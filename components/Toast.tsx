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

  const type = message.type || "info";

  // Get colors based on type
  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return {
          backgroundColor: 'var(--success)',
          color: 'white',
          boxShadow: 'var(--shadow-lg), 0 0 20px rgba(16, 185, 129, 0.4)',
        };
      case "error":
        return {
          backgroundColor: 'var(--error)',
          color: 'white',
          boxShadow: 'var(--shadow-lg), 0 0 20px rgba(239, 68, 68, 0.4)',
        };
      default:
        return {
          backgroundColor: 'var(--glass-bg)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          color: 'var(--text)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)',
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓";
      case "error":
        return "✕";
      default:
        return "ℹ";
    }
  };

  return (
    <div
      className={`fixed right-5 bottom-5 z-50 ml-5 px-6 py-4 rounded-2xl transition-all duration-300 flex items-center gap-3 ${
        isVisible ? "opacity-100 translate-y-0 bounce-in" : "opacity-0 translate-y-12"
      }`}
      style={{
        ...getTypeStyles(),
      }}
      role="alert"
      aria-live="polite"
      onMouseEnter={(e) => {
        e.currentTarget.style.animationPlayState = "paused";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.animationPlayState = "running";
      }}
    >
      <span className={`text-lg font-bold ${type === 'success' ? 'scale-in-spring' : ''}`} aria-hidden="true">
        {getIcon()}
      </span>
      <span className="font-medium">{message.content}</span>
    </div>
  );
}
