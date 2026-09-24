import { NextResponse } from "next/server";
import { getFileWithRange } from "@/lib/storage/service";

/**
 * GET /api/storage/file/[key]
 * Streams audio recordings and PDF sheets with HTTP byte-range request support (206 Partial Content)
 */
export async function GET(
  request: Request,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    if (!key) {
      return new NextResponse("File key is required", { status: 400 });
    }

    const rangeHeader = request.headers.get("range");
    const result = await getFileWithRange(key, rangeHeader);

    if (!result) {
      return new NextResponse("File not found", { status: 404 });
    }

    const headers = new Headers();
    headers.set("Content-Type", result.contentType);
    headers.set("Content-Length", String(result.contentLength));
    headers.set("Accept-Ranges", "bytes");
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    if (result.status === 206 && result.contentRange) {
      headers.set("Content-Range", result.contentRange);
      return new NextResponse(result.data as any, {
        status: 206,
        headers,
      });
    }

    return new NextResponse(result.data as any, {
      status: 200,
      headers,
    });
  } catch (err: unknown) {
    console.error("Storage streaming error:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

