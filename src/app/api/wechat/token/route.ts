import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/wechat";

/**
 * GET /api/wechat/token
 * Returns a valid access token (cached)
 */
export async function GET(_req: NextRequest) {
  try {
    const token = await getAccessToken();
    return NextResponse.json({ success: true, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
