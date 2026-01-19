export function humanFileSize(bytes: number, si: boolean = false): string {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }
  const units = si
    ? ["kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"]
    : ["KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
  let u = -1;
  do {
    bytes /= thresh;
    ++u;
  } while (Math.abs(bytes) >= thresh && u < units.length - 1);
  return bytes.toFixed(1) + " " + units[u];
}

export function getFilenameFromContentDisposition(disposition: string): string {
  const filenameMatch = disposition.match(/filename\*?=(?:UTF-8'')?([^;]+)/);
  if (!filenameMatch) return "converted.epub";

  let filename = filenameMatch[1].trim();
  if (filename.startsWith("UTF-8''")) {
    filename = decodeURIComponent(filename.slice(7));
  } else if (filename.startsWith('"') && filename.endsWith('"')) {
    filename = filename.slice(1, -1);
  }

  return decodeURIComponent(filename);
}
