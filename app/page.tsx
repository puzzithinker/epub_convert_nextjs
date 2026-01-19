import { UploadForm } from "@/components/UploadForm";
import { ThemeToggle } from "@/components/ThemeToggle";
import { env } from "@/lib/env";

// Force dynamic rendering to avoid SSR issues with client-side context
export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <ThemeToggle />

      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            EPUB 簡繁轉換
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            將簡體中文 EPUB 電子書轉換為繁體中文
          </p>
        </div>

        <UploadForm maxUploadBytes={env.MAX_UPLOAD_BYTES} />

        <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>支援的格式：EPUB</p>
          <p className="mt-2">轉換過程完全在伺服器端進行，確保您的隱私安全</p>
        </div>
      </div>
    </main>
  );
}
