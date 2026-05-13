import { NextRequest, NextResponse } from "next/server";
import { createDraft, sanitizeHtmlForWeChat, type DraftArticle } from "@/lib/wechat";

/**
 * POST /api/wechat/create-draft
 * Body: { articles: [{ title, content, thumb_media_id?, author?, digest? }] }
 * Returns: { success, media_id }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const articles: DraftArticle[] = body.articles || [];

    if (!articles.length) {
      return NextResponse.json(
        { success: false, error: "No articles provided" },
        { status: 400 }
      );
    }

    // Sanitize HTML content for each article
    const sanitizedArticles = articles.map((article) => ({
      ...article,
      content: sanitizeHtmlForWeChat(article.content),
    }));

    const mediaId = await createDraft(sanitizedArticles);

    return NextResponse.json({ success: true, media_id: mediaId });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
