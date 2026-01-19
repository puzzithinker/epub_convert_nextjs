"use client";

interface ProgressBarProps {
  progress: number;
  isProcessing: boolean;
  hasError: boolean;
}

export function ProgressBar({ progress, isProcessing, hasError }: ProgressBarProps) {
  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
      {isProcessing && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-400 animate-pulse"></div>
      )}
      <div
        className={`h-full transition-all duration-100 ${
          hasError ? "bg-red-500" : "bg-blue-500"
        } ${isProcessing ? "opacity-0" : "opacity-100"}`}
        style={{ width: `${progress}%` }}
      ></div>
    </div>
  );
}
