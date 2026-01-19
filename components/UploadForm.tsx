"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadState, ToastMessage } from "@/types";
import { ProgressBar } from "./ProgressBar";
import { Toast } from "./Toast";
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
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const showToast = (content: string) => {
    setToast({ content, id: Date.now() });
  };

  const validateFile = (file: File): boolean => {
    // Check extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "epub") {
      showToast("只接受 EPUB 格式的檔案!");
      return false;
    }

    // Check size
    if (file.size >= maxUploadBytes) {
      showToast("檔案過大!");
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
      showToast("一次僅可上傳一個檔案。");
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

          showToast("轉換完成!");
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

          showToast(errorMessage);
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

        showToast("網路錯誤");
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

      showToast("上傳失敗");
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
    setDragCounter((prev) => prev + 1);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev - 1);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);

    const files = e.dataTransfer.files;
    if (files.length === 0) return;

    if (files.length > 1) {
      showToast("一次僅可上傳一個檔案。");
      return;
    }

    updateFile(files[0]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 transition-all ${
          dragCounter > 0
            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
            : "border-gray-300 dark:border-gray-600"
        } ${state.mode === "selecting" ? "" : "opacity-50"}`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
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
          <div className="mb-2">
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              點擊選擇檔案
            </label>
            <span className="text-gray-600 dark:text-gray-400"> 或拖曳檔案至此</span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            僅接受 EPUB 格式，最大 {humanFileSize(maxUploadBytes)}
          </p>
          <input
            ref={fileInputRef}
            id="file-upload"
            name="file-upload"
            type="file"
            className="sr-only"
            accept=".epub"
            onChange={handleFileChange}
            disabled={state.mode !== "selecting" && state.mode !== "selected"}
          />
        </div>
      </div>

      {state.file && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {state.file.name}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {humanFileSize(state.file.size)}
            </span>
          </div>

          {(state.mode === "uploading" || state.mode === "uploadend") && (
            <div className="mb-2">
              <ProgressBar
                progress={state.progress}
                isProcessing={state.isProcessing}
                hasError={!!state.error}
              />
            </div>
          )}

          <div className="flex gap-2 mt-3">
            {state.mode === "selected" && (
              <>
                <button
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  開始轉換
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  取消
                </button>
              </>
            )}

            {state.mode === "uploading" && (
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                取消上傳
              </button>
            )}

            {state.mode === "converted" && (
              <>
                <button
                  onClick={handleDownload}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  下載轉換後的檔案
                </button>
                <button
                  onClick={reset}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                >
                  重新開始
                </button>
              </>
            )}

            {state.mode === "uploadend" && state.error && (
              <button
                onClick={reset}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              >
                重新開始
              </button>
            )}
          </div>
        </div>
      )}

      <Toast message={toast} onComplete={() => setToast(null)} />
    </div>
  );
}
