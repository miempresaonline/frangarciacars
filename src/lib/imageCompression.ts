import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

const DEFAULT_OPTIONS: Required<CompressionOptions> = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  maxSizeMB: 1,
};

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!file.type.startsWith('image/')) {
    return file;
  }

  try {
    const compressionOptions = {
      maxSizeMB: opts.maxSizeMB,
      maxWidthOrHeight: Math.max(opts.maxWidth, opts.maxHeight),
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: opts.quality,
    };

    const compressedFile = await imageCompression(file, compressionOptions);

    return new File([compressedFile], file.name.replace(/\.[^/.]+$/, '.jpg'), {
      type: 'image/jpeg',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error compressing image, using original:', error);
    return file;
  }
}

export async function compressImageWithStats(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const originalSize = file.size;
  const compressedFile = await compressImage(file, options);
  const compressedSize = compressedFile.size;
  const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100;

  return {
    file: compressedFile,
    originalSize,
    compressedSize,
    compressionRatio,
  };
}

export async function compressMultipleImages(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<File[]> {
  const compressionPromises = files.map(async (file, index) => {
    const compressed = await compressImage(file, options);
    if (onProgress) {
      onProgress(index + 1, files.length);
    }
    return compressed;
  });

  return Promise.all(compressionPromises);
}

export async function compressMultipleImagesWithStats(
  files: File[],
  options: CompressionOptions = {},
  onProgress?: (current: number, total: number) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await compressImageWithStats(file, options);
    results.push(result);

    if (onProgress) {
      onProgress(i + 1, files.length);
    }
  }

  return results;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
