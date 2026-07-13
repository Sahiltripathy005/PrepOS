import { ValidationError } from "../shared/errors.js";

export interface FileMetadata {
  filename: string;
  originalname: string;
  mimetype: string;
  size: number;
  buffer?: Buffer;
  path?: string;
}

export interface IStorageProvider {
  upload(file: FileMetadata): Promise<string>;
  delete(uri: string): Promise<void>;
}

export class LocalTempStorageProvider implements IStorageProvider {
  public async upload(file: FileMetadata): Promise<string> {
    return `/uploads/temp-${Date.now()}-${file.originalname}`;
  }

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  public async delete(_uri: string): Promise<void> {
    // Simulated delete logic
  }
}

export interface FileValidationOptions {
  allowedMimeTypes: string[];
  maxSizeInBytes: number;
}

export function validateUploadedFile(file: FileMetadata, options: FileValidationOptions): void {
  if (!options.allowedMimeTypes.includes(file.mimetype)) {
    throw new ValidationError(
      `File format '${file.mimetype}' is not permitted. Supported: ${options.allowedMimeTypes.join(", ")}`
    );
  }

  if (file.size > options.maxSizeInBytes) {
    const limitMb = (options.maxSizeInBytes / (1024 * 1024)).toFixed(2);
    throw new ValidationError(`File size exceeds limit of ${limitMb} MB.`);
  }
}
