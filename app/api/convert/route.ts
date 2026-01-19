import { NextRequest, NextResponse } from "next/server";
import { convertEpub } from "@/lib/converter";
import { env } from "@/lib/env";
import { humanFileSize } from "@/lib/utils";
import mime from "mime-types";
import { convertFilename } from "@/lib/converter/opencc";

// Force Node.js runtime (required for native modules and file processing)
export const runtime = "nodejs";

// Increase timeout for conversion (Vercel Pro allows up to 60s)
export const maxDuration = 60;

interface ErrorResponse {
  status: false;
  error: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get("upload") as File | null;

    // Validation: file presence
    if (!file) {
      return NextResponse.json<ErrorResponse>(
        { status: false, error: "No file is specified." },
        { status: 400 }
      );
    }

    // Validation: filename
    if (!file.name) {
      return NextResponse.json<ErrorResponse>(
        { status: false, error: "No file name." },
        { status: 400 }
      );
    }

    // Validation: file extension
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (extension !== "epub") {
      return NextResponse.json<ErrorResponse>(
        { status: false, error: "Not an epub document" },
        { status: 415 }
      );
    }

    // Validation: file size
    if (file.size > env.MAX_UPLOAD_BYTES) {
      return NextResponse.json<ErrorResponse>(
        {
          status: false,
          error: `File is too large. Maximum file size is ${humanFileSize(
            env.MAX_UPLOAD_BYTES
          )}`,
        },
        { status: 413 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const inputBuffer = Buffer.from(arrayBuffer);

    // Perform conversion
    const outputBuffer = await convertEpub(inputBuffer, { convertFilenames: true });

    // Get converted filename
    const outputFilename = convertFilename(file.name);

    // Log success
    if (env.LOG_LEVEL === "info" || env.LOG_LEVEL === "debug") {
      console.log(`Converted successfully. File: ${outputFilename}`);
    }

    // Return binary response with proper headers
    // Convert Buffer to Uint8Array for NextResponse
    return new NextResponse(new Uint8Array(outputBuffer), {
      status: 200,
      headers: {
        "Content-Type": mime.lookup(".epub") || "application/epub+zip",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
          outputFilename
        )}`,
        "Content-Length": outputBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Conversion error:", error);

    const errorClass = error instanceof Error ? error.constructor.name : "UnknownError";
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (env.LOG_LEVEL === "debug") {
      console.error("Error details:", errorMessage);
    }

    return NextResponse.json<ErrorResponse>(
      { status: false, error: errorClass },
      { status: 500 }
    );
  }
}
