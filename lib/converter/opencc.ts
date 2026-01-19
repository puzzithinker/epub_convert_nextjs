import { env } from "@/lib/env";

let converter: any = null;
let initialized = false;

export async function initializeConverter(): Promise<void> {
  if (initialized) return;

  try {
    // Use native OpenCC
    // Note: WASM fallback (opencc-js) can be added later if needed
    const opencc = await import("opencc");
    converter = new opencc.OpenCC("s2tw.json");
    console.log("Using native OpenCC");
    initialized = true;
  } catch (error) {
    console.error("Failed to initialize OpenCC:", error);
    throw new Error("OpenCC initialization failed");
  }
}

export function convertContent(text: string): string {
  if (!converter) {
    throw new Error("OpenCC converter not initialized");
  }

  // Preserve line endings by processing line by line
  const lines = text.split(/(\r?\n)/);
  const converted = lines.map((line) => {
    // Don't convert line endings themselves
    if (line === "\n" || line === "\r\n" || line === "\r") {
      return line;
    }
    return converter.convertSync ? converter.convertSync(line) : converter(line);
  });

  return converted.join("");
}

export function convertFilename(filename: string): string {
  if (!converter) {
    throw new Error("OpenCC converter not initialized");
  }

  return converter.convertSync ? converter.convertSync(filename) : converter(filename);
}
