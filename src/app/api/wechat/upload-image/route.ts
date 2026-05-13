import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/lib/wechat";

/**
 * POST /api/wechat/upload-image
 * Body: FormData with "image" field (file)
 * Returns: { success, url }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const url = await uploadImage(buffer, file.name);

    return NextResponse.json({ success: true, url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
