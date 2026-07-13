import { describe, it, expect } from "vitest";
import { validateUploadedFile, FileMetadata } from "./upload.js";

describe("Upload Validator", () => {
  it("should validate and pass permitted files", () => {
    const file: FileMetadata = {
      filename: "test.pdf",
      originalname: "test.pdf",
      mimetype: "application/pdf",
      size: 1024 * 1024 // 1MB
    };

    expect(() =>
      validateUploadedFile(file, {
        allowedMimeTypes: ["application/pdf"],
        maxSizeInBytes: 2 * 1024 * 1024 // 2MB
      })
    ).not.toThrow();
  });

  it("should throw error for invalid mime types", () => {
    const file: FileMetadata = {
      filename: "test.exe",
      originalname: "test.exe",
      mimetype: "application/x-msdownload",
      size: 100
    };

    expect(() =>
      validateUploadedFile(file, {
        allowedMimeTypes: ["application/pdf"],
        maxSizeInBytes: 1000
      })
    ).toThrow(/permitted/);
  });
});
