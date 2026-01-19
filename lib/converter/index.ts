import yauzl from "yauzl";
import yazl from "yazl";
import { convertContent, convertFilename, initializeConverter } from "./opencc";
import { detectEncoding } from "./encoding";

const TARGET_EXTENSIONS = ["htm", "html", "xhtml", "ncx", "opf"];

export interface ConversionOptions {
  convertFilenames?: boolean;
}

export async function convertEpub(
  inputBuffer: Buffer,
  options: ConversionOptions = { convertFilenames: true }
): Promise<Buffer> {
  // Initialize OpenCC converter (singleton pattern)
  await initializeConverter();

  return new Promise((resolve, reject) => {
    const outputZip = new yazl.ZipFile();
    const outputChunks: Buffer[] = [];

    // Collect output chunks
    outputZip.outputStream.on("data", (chunk: Buffer) => {
      outputChunks.push(chunk);
    });

    outputZip.outputStream.on("end", () => {
      resolve(Buffer.concat(outputChunks));
    });

    outputZip.outputStream.on("error", reject);

    // Open input EPUB
    yauzl.fromBuffer(inputBuffer, { lazyEntries: true }, (err, zipfile) => {
      if (err) {
        reject(new Error(`Failed to open EPUB: ${err.message}`));
        return;
      }

      if (!zipfile) {
        reject(new Error("Invalid EPUB file"));
        return;
      }

      let pendingEntries = 0;
      let readingComplete = false;

      const checkComplete = () => {
        if (readingComplete && pendingEntries === 0) {
          outputZip.end();
        }
      };

      zipfile.on("entry", (entry: yauzl.Entry) => {
        const isDirectory = /\/$/.test(entry.fileName);

        if (isDirectory) {
          zipfile.readEntry();
          return;
        }

        pendingEntries++;

        zipfile.openReadStream(entry, async (err, readStream) => {
          if (err) {
            reject(err);
            return;
          }

          if (!readStream) {
            reject(new Error(`Failed to read entry: ${entry.fileName}`));
            return;
          }

          try {
            const chunks: Buffer[] = [];

            for await (const chunk of readStream) {
              chunks.push(chunk);
            }

            const buffer = Buffer.concat(chunks);
            const extension = entry.fileName.split(".").pop()?.toLowerCase() || "";
            const shouldConvert = TARGET_EXTENSIONS.includes(extension);

            let outputBuffer: Buffer;
            let outputFilename = entry.fileName;

            if (shouldConvert) {
              // Convert content
              const encoding = detectEncoding(buffer);
              const text = buffer.toString(encoding);
              let converted = convertContent(text);

              // Special handling for .opf files
              if (extension === "opf") {
                converted = converted.replace(
                  /<dc:language>zh-CN<\/dc:language>/g,
                  "<dc:language>zh-TW</dc:language>"
                );
              }

              outputBuffer = Buffer.from(converted, "utf-8");
            } else {
              outputBuffer = buffer;
            }

            // Convert filename if enabled
            if (options.convertFilenames) {
              outputFilename = convertFilename(entry.fileName);
            }

            // Add to output zip with original compression
            outputZip.addBuffer(outputBuffer, outputFilename, {
              compress: entry.compressionMethod === 8, // 8 = DEFLATE
            });

            pendingEntries--;
            checkComplete();
            zipfile.readEntry();
          } catch (error) {
            reject(error);
          }
        });
      });

      zipfile.on("end", () => {
        readingComplete = true;
        checkComplete();
      });

      zipfile.on("error", reject);

      // Start reading entries
      zipfile.readEntry();
    });
  });
}
