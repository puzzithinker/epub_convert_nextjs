import { UploadForm } from "@/components/UploadForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { BackgroundMesh } from "@/components/BackgroundMesh";
import { env } from "@/lib/env";

// Force dynamic rendering to avoid SSR issues with client-side context
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300">
      {/* Animated background */}
      <BackgroundMesh />

      {/* Theme toggle in top-right corner */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Main content container */}
      <div className="w-full max-w-2xl fade-in">
        {/* Header */}
        <header className="text-center mb-12 slide-up stagger-1">
          <h1
            className="text-6xl font-bold mb-4 transition-colors"
            style={{
              color: 'var(--text)',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
            }}
          >
            EPUB 簡繁轉換
          </h1>
          <p
            className="text-xl transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            將簡體中文 EPUB 電子書轉換為繁體中文
          </p>
        </header>

        {/* Upload form */}
        <div className="mb-8 slide-up stagger-2">
          <UploadForm maxUploadBytes={env.MAX_UPLOAD_BYTES} />
        </div>

        {/* Footer info */}
        <footer
          className="text-center text-sm space-y-2 transition-colors slide-up stagger-3"
          style={{ color: 'var(--text-secondary)' }}
        >
          <p>支援的格式：EPUB</p>
          <p>轉換過程完全在伺服器端進行，確保您的隱私安全</p>
        </footer>
      </div>
    </main>
  );
}
