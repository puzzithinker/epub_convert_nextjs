import { UploadForm } from "@/components/UploadForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { env } from "@/lib/env";

// Force dynamic rendering to avoid SSR issues with client-side context
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main
      className="min-h-screen flex items-center justify-center p-4 relative transition-colors duration-300"
      style={{
        background: 'linear-gradient(135deg, var(--background) 0%, var(--surface) 100%)',
      }}
    >
      {/* Theme toggle in top-right corner */}
      <div className="absolute top-6 right-6">
        <ThemeToggle />
      </div>

      {/* Main content container */}
      <div className="w-full max-w-2xl fade-in">
        {/* Header */}
        <header className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-4 transition-colors"
            style={{ color: 'var(--text)' }}
          >
            EPUB 簡繁轉換
          </h1>
          <p
            className="text-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            將簡體中文 EPUB 電子書轉換為繁體中文
          </p>
        </header>

        {/* Upload form */}
        <div className="mb-8">
          <UploadForm maxUploadBytes={env.MAX_UPLOAD_BYTES} />
        </div>

        {/* Footer info */}
        <footer
          className="text-center text-sm space-y-2 transition-colors"
          style={{ color: 'var(--text-secondary)' }}
        >
          <p>支援的格式：EPUB</p>
          <p>轉換過程完全在伺服器端進行，確保您的隱私安全</p>
        </footer>
      </div>
    </main>
  );
}
