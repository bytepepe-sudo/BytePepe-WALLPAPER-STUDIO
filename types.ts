
export interface ProcessingResult {
  imageUrl: string;
  originalWidth: number;
  originalHeight: number;
  sampledColor: string;
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  processedUrl: string | null;
  isProcessing: boolean;
  error: string | null;
}
