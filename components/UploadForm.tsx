"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadState, ToastMessage, ToastType } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { Toast } from "./Toast";
import { SuccessConfetti } from "./SuccessConfetti";
import { humanFileSize, getFilenameFromContentDisposition } from "@/lib/utils";

interface UploadFormProps {
  maxUploadBytes: number;
}

export function UploadForm({ maxUploadBytes }: UploadFormProps) {
  const [state, setState] = useState<UploadState>({
    mode: "selecting",
    file: null,
    progress: 0,
    isProcessing: false,
    error: null,
    downloadUrl: null,
    downloadFilename: null,
  });

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dragCounterRef = useRef(0);

  const showToast = (content: string, type: ToastType = "info") => {
    setToast({ content, id: Date.now(), type });
  };

  const validateFile = (file: File): boolean => {
    // Check extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "epub") {
      showToast("只接受 EPUB 格式的檔案!", "error");
      return false;
    }

    // Check size
    if (file.size >= maxUploadBytes) {
      showToast("檔案過大!", "error");
      return false;
    }

    return true;
  };

  const updateFile = (file: File) => {
    if (!validateFile(file)) return;

    setState((prev) => ({
      ...prev,
      mode: "selected",
      file,
      error: null,
    }));
  };

  const reset = () => {
    if (state.downloadUrl) {
      URL.revokeObjectURL(state.downloadUrl);
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    setState({
      mode: "selecting",
      file: null,
      progress: 0,
      isProcessing: false,
      error: null,
      downloadUrl: null,
      downloadFilename: null,
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) {
      reset();
      return;
    }

    if (files.length > 1) {
      showToast("一次僅可上傳一個檔案。", "error");
      return;
    }

    updateFile(files[0]);
  };

  const handleSubmit = async () => {
    if (!state.file) return;

    setState((prev) => ({ ...prev, mode: "uploading", progress: 0, isProcessing: false }));

    const formData = new FormData();
    formData.append("upload", state.file);

    abortControllerRef.current = new AbortController();

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentage = (e.loaded / e.total) * 100;
          setState((prev) => ({
            ...prev,
            progress: percentage,
            isProcessing: percentage === 100,
          }));
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const blob = new Blob([xhr.response], { type: "application/epub+zip" });
          const disposition = xhr.getResponseHeader("content-disposition");
          const filename = disposition
            ? getFilenameFromContentDisposition(disposition)
            : "converted.epub";

          const url = URL.createObjectURL(blob);

          setState((prev) => ({
            ...prev,
            mode: "converted",
            progress: 100,
            isProcessing: false,
            downloadUrl: url,
            downloadFilename: filename,
          }));

          showToast("轉換完成!", "success");
          setShowConfetti(true);

          // Hide confetti after 3 seconds
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          let errorMessage = "轉換失敗";
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.error) {
              errorMessage = response.error;
            }
          } catch (e) {
            // Use default error message
          }

          setState((prev) => ({
            ...prev,
            mode: "uploadend",
            progress: 0,
            isProcessing: false,
            error: errorMessage,
          }));

          showToast(errorMessage, "error");
        }
      });

      xhr.addEventListener("error", () => {
        setState((prev) => ({
          ...prev,
          mode: "uploadend",
          progress: 0,
          isProcessing: false,
          error: "網路錯誤",
        }));

        showToast("網路錯誤", "error");
      });

      xhr.addEventListener("abort", () => {
        setState((prev) => ({
          ...prev,
          mode: "selected",
          progress: 0,
          isProcessing: false,
        }));

        showToast("已取消上傳");
      });

      xhr.open("POST", "/api/convert");
      xhr.responseType = "arraybuffer";
      xhr.send(formData);

      abortControllerRef.current.signal.addEventListener("abort", () => {
        xhr.abort();
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        mode: "uploadend",
        progress: 0,
        isProcessing: false,
        error: "上傳失敗",
      }));

      showToast("上傳失敗", "error");
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleDownload = () => {
    if (state.downloadUrl && state.downloadFilename) {
      const a = document.createElement("a");
      a.href = state.downloadUrl;
      a.download = state.downloadFilename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    if (files.length > 1) {
      showToast("一次僅可上傳一個檔案。", "error");
      return;
    }

    updateFile(files[0]);
  };

  const canInteract = state.mode === "selecting" || state.mode === "selected";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Drop zone */}
      <div
        className={`glass-card rounded-2xl p-8 transition-all duration-300 ${
          canInteract ? "cursor-pointer hover:scale-[1.01]" : ""
        } ${isDragging ? "scale-[1.02] glow-primary" : ""}`}
        style={{
          border: isDragging
            ? '2px solid var(--primary)'
            : '2px solid var(--glass-border)',
        }}
        onDragEnter={canInteract ? handleDragEnter : undefined}
        onDragLeave={canInteract ? handleDragLeave : undefined}
        onDragOver={canInteract ? handleDragOver : undefined}
        onDrop={canInteract ? handleDrop : undefined}
        onClick={() => canInteract && fileInputRef.current?.click()}
      >
        <div className="text-center">
          {/* Upload icon */}
          <div
            className={`mb-4 transition-transform duration-300 ${isDragging ? "scale-110" : ""}`}
          >
            <svg
              className="mx-auto h-8 w-8 transition-colors"
              style={{ color: isDragging ? 'var(--primary)' : 'var(--text-secondary)' }}
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Instructions */}
          <div className="mb-2">
            <span
              className="font-medium transition-colors"
              style={{ color: 'var(--primary)' }}
            >
              點擊選擇檔案
            </span>
            <span
              className="transition-colors"
              style={{ color: 'var(--text-secondary)' }}
            >
              {" "}或拖曳檔案至此
            </span>
          </div>
          <p
            className="text-sm transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            僅接受 EPUB 格式，最大 {humanFileSize(maxUploadBytes)}
          </p>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept=".epub"
            onChange={handleFileChange}
            disabled={!canInteract}
          />
        </div>
      </div>

      {/* File info and actions */}
      {state.file && (
        <div
          className="mt-4 p-5 rounded-2xl glass-surface transition-all duration-300 scale-in-spring"
        >
          {/* File name and size */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <span
                className="text-xl"
                role="img"
                aria-label="EPUB file"
              >
                📚
              </span>
              <span
                className="font-medium truncate max-w-[200px] sm:max-w-[300px]"
                style={{ color: 'var(--text)' }}
              >
                {state.file.name}
              </span>
            </div>
            <span
              className="text-sm whitespace-nowrap"
              style={{ color: 'var(--text-secondary)' }}
            >
              {humanFileSize(state.file.size)}
            </span>
          </div>

          {/* Progress bar */}
          {(state.mode === "uploading" || state.mode === "uploadend") && (
            <div className="mb-4">
              <ProgressBar
                progress={state.progress}
                isProcessing={state.isProcessing}
                hasError={!!state.error}
              />
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            {state.mode === "selected" && (
              <>
                <button
                  onClick={handleSubmit}
                  className="btn btn-primary flex-1 hover:glow-primary"
                >
                  <span>🔄</span>
                  <span>開始轉換</span>
                </button>
                <button
                  onClick={reset}
                  className="btn btn-secondary hover:scale-105"
                >
                  取消
                </button>
              </>
            )}

            {state.mode === "uploading" && (
              <button
                onClick={handleCancel}
                className="btn flex-1 hover:glow-error"
                style={{
                  backgroundColor: 'var(--error)',
                  color: 'white',
                }}
              >
                <span>✕</span>
                <span>取消上傳</span>
              </button>
            )}

            {state.mode === "converted" && (
              <>
                <button
                  onClick={handleDownload}
                  className="btn btn-success flex-1 hover:glow-success"
                >
                  <span>⬇️</span>
                  <span>下載轉換後的檔案</span>
                </button>
                <button
                  onClick={reset}
                  className="btn btn-secondary hover:scale-105"
                >
                  重新開始
                </button>
              </>
            )}

            {state.mode === "uploadend" && state.error && (
              <button
                onClick={reset}
                className="btn btn-secondary flex-1 hover:scale-105"
              >
                <span>↻</span>
                <span>重新開始</span>
              </button>
            )}
          </div>
        </div>
      )}

      {showConfetti && <SuccessConfetti />}
      <Toast message={toast} onComplete={() => setToast(null)} />
    </div>
  );
}
