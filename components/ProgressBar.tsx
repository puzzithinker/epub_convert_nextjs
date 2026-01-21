"use client";

interface ProgressBarProps {
  progress: number;
  isProcessing: boolean;
  hasError: boolean;
}

export function ProgressBar({ progress, isProcessing, hasError }: ProgressBarProps) {
  return (
    <div className="w-full space-y-2">
      {/* Progress bar container */}
      <div
        className="w-full h-3 rounded-full overflow-hidden relative"
        style={{
          backgroundColor: 'var(--border)',
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Animated shimmer effect during processing */}
        {isProcessing && (
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--primary), transparent)',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}

        {/* Actual progress bar */}
        <div
          className={`h-full transition-all duration-300 relative ${isProcessing ? 'pulse-glow' : ''}`}
          style={{
            width: `${progress}%`,
            background: hasError
              ? 'var(--error)'
              : 'linear-gradient(90deg, var(--primary), var(--gradient-4))',
            boxShadow: !hasError && progress > 0
              ? '0 0 10px rgba(59, 130, 246, 0.5)'
              : 'none',
          }}
        />
      </div>

      {/* Percentage display */}
      <div
        className="text-sm text-center font-medium fade-in"
        style={{ color: 'var(--text-secondary)' }}
      >
        {progress}%
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
