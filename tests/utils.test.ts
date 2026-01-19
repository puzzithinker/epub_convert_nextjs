import { describe, it, expect } from "vitest";
import { humanFileSize, getFilenameFromContentDisposition } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("humanFileSize", () => {
    it("should format bytes correctly", () => {
      expect(humanFileSize(0)).toBe("0 B");
      expect(humanFileSize(500)).toBe("500 B");
    });

    it("should format KiB correctly", () => {
      expect(humanFileSize(1024)).toBe("1.0 KiB");
      expect(humanFileSize(1536)).toBe("1.5 KiB");
    });

    it("should format MiB correctly", () => {
      expect(humanFileSize(1048576)).toBe("1.0 MiB");
      expect(humanFileSize(20971520)).toBe("20.0 MiB");
    });

    it("should format GiB correctly", () => {
      expect(humanFileSize(1073741824)).toBe("1.0 GiB");
    });

    it("should use SI units when specified", () => {
      expect(humanFileSize(1000, true)).toBe("1.0 kB");
      expect(humanFileSize(1000000, true)).toBe("1.0 MB");
    });

    it("should handle negative numbers", () => {
      expect(humanFileSize(-1024)).toBe("-1.0 KiB");
    });
  });

  describe("getFilenameFromContentDisposition", () => {
    it("should extract filename from standard format", () => {
      const disposition = 'attachment; filename="test.epub"';
      expect(getFilenameFromContentDisposition(disposition)).toBe("test.epub");
    });

    it("should extract filename from UTF-8 format", () => {
      const disposition = "attachment; filename*=UTF-8''test%E6%B5%8B%E8%AF%95.epub";
      expect(getFilenameFromContentDisposition(disposition)).toBe("test测试.epub");
    });

    it("should handle filename with spaces", () => {
      const disposition = 'attachment; filename="my test file.epub"';
      expect(getFilenameFromContentDisposition(disposition)).toBe("my test file.epub");
    });

    it("should return default filename when no match", () => {
      const disposition = "attachment";
      expect(getFilenameFromContentDisposition(disposition)).toBe("converted.epub");
    });

    it("should decode URL-encoded filenames", () => {
      const disposition = "attachment; filename=test%20file.epub";
      expect(getFilenameFromContentDisposition(disposition)).toBe("test file.epub");
    });
  });
});
