let converter: ((text: string) => string) | null = null;
let initialized = false;

export async function initializeConverter(): Promise<void> {
  if (initialized) return;

  try {
    // Use opencc-js (WASM version - works with Turbopack)
    const { Converter } = await import("opencc-js");
    converter = Converter({ from: "cn", to: "tw" });
    console.log("Using OpenCC WASM (opencc-js)");
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
    return converter!(line);
  });

  return converted.join("");
}

export function convertFilename(filename: string): string {
  if (!converter) {
    throw new Error("OpenCC converter not initialized");
  }

  return converter(filename);
}
