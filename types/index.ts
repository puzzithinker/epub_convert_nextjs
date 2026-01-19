export type UploadMode = "selecting" | "selected" | "uploading" | "uploadend" | "converted";

export interface UploadState {
  mode: UploadMode;
  file: File | null;
  progress: number;
  isProcessing: boolean;
  error: string | null;
  downloadUrl: string | null;
  downloadFilename: string | null;
}

export type ToastType = "info" | "success" | "error";

export interface ToastMessage {
  content: string;
  id: number;
  type?: ToastType;
}
