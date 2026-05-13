import { NextRequest, NextResponse } from "next/server";
import { publishDraft } from "@/lib/wechat";

/**
 * POST /api/wechat/publish
 * Body: { media_id }
 * Returns: { success, publish_id, msg_data_id }
 */
export async function POST(req: NextRequest) {
  try {
    const { media_id } = await req.json();

    if (!media_id) {
      return NextResponse.json(
        { success: false, error: "media_id is required" },
        { status: 400 }
      );
    }

    const result = await publishDraft(media_id);

    return NextResponse.json({
      success: true,
      publish_id: result.publish_id,
      msg_data_id: result.msg_data_id,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
