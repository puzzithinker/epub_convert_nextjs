export function detectEncoding(buffer: Buffer): BufferEncoding {
  // Check for UTF-8 BOM
  if (buffer.length >= 3 && buffer[0] === 0xef && buffer[1] === 0xbb && buffer[2] === 0xbf) {
    return "utf-8";
  }

  // Check for UTF-16 BOM
  if (buffer.length >= 2) {
    if (buffer[0] === 0xff && buffer[1] === 0xfe) {
      return "utf-16le";
    }
    if (buffer[0] === 0xfe && buffer[1] === 0xff) {
      // Node.js doesn't have utf-16be, use utf-16le and handle manually if needed
      return "utf-16le";
    }
  }

  // Default to UTF-8 (most EPUB files are UTF-8)
  // For production, consider adding chardet or jschardet for better detection
  return "utf-8";
}
