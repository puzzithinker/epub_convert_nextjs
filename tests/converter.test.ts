import { describe, it, expect, beforeAll } from "vitest";
import { convertContent, convertFilename, initializeConverter } from "@/lib/converter/opencc";
import { detectEncoding } from "@/lib/converter/encoding";

describe("OpenCC Converter", () => {
  beforeAll(async () => {
    // Initialize the converter before running tests
    await initializeConverter();
  });

  describe("convertContent", () => {
    it("should convert simplified Chinese to traditional Chinese", () => {
      const simplified = "简体中文测试";
      const result = convertContent(simplified);

      // The result should be different from the input (converted)
      expect(result).not.toBe(simplified);
      // Should contain traditional Chinese characters
      expect(result).toContain("繁");
    });

    it("should preserve line endings", () => {
      const textWithNewlines = "第一行\n第二行\r\n第三行";
      const result = convertContent(textWithNewlines);

      // Should preserve the newline characters
      expect(result).toContain("\n");
      expect(result).toContain("\r\n");
    });

    it("should handle empty strings", () => {
      const result = convertContent("");
      expect(result).toBe("");
    });

    it("should handle text with mixed content", () => {
      const mixed = "简体中文 English 123";
      const result = convertContent(mixed);

      // English and numbers should remain unchanged
      expect(result).toContain("English");
      expect(result).toContain("123");
    });
  });

  describe("convertFilename", () => {
    it("should convert simplified Chinese filenames", () => {
      const filename = "简体文件.epub";
      const result = convertFilename(filename);

      expect(result).not.toBe(filename);
      expect(result).toContain(".epub");
    });

    it("should preserve file extensions", () => {
      const filename = "测试.html";
      const result = convertFilename(filename);

      expect(result).toContain(".html");
    });
  });
});

describe("Encoding Detection", () => {
  it("should detect UTF-8 BOM", () => {
    const bufferWithBOM = Buffer.from([0xef, 0xbb, 0xbf, 0x48, 0x65, 0x6c, 0x6c, 0x6f]);
    const encoding = detectEncoding(bufferWithBOM);

    expect(encoding).toBe("utf-8");
  });

  it("should detect UTF-16LE BOM", () => {
    const bufferWithBOM = Buffer.from([0xff, 0xfe, 0x48, 0x00]);
    const encoding = detectEncoding(bufferWithBOM);

    expect(encoding).toBe("utf-16le");
  });

  it("should default to UTF-8 for no BOM", () => {
    const buffer = Buffer.from("Hello World");
    const encoding = detectEncoding(buffer);

    expect(encoding).toBe("utf-8");
  });

  it("should handle empty buffers", () => {
    const buffer = Buffer.from([]);
    const encoding = detectEncoding(buffer);

    expect(encoding).toBe("utf-8");
  });
});
