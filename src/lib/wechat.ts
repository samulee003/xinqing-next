/**
 * WeChat Official Account API Client
 * Docs: https://developers.weixin.qq.com/doc/offiaccount/Getting_Started/Overview.html
 */

const WX_API_BASE = "https://api.weixin.qq.com/cgi-bin";

// ─── Types ───
interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
}

interface UploadImageResponse {
  url: string;
}

interface CreateDraftResponse {
  media_id: string;
}

interface PublishResponse {
  publish_id: string;
  msg_data_id: string;
}

// ─── Cache ───
let cachedToken: { token: string; expiresAt: number } | null = null;

// ─── Get Access Token ───
export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 5min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const appid = process.env.WECHAT_APPID;
  const secret = process.env.WECHAT_APPSECRET;

  if (!appid || !secret) {
    throw new Error("WECHAT_APPID or WECHAT_APPSECRET not configured");
  }

  const url = `${WX_API_BASE}/token?grant_type=client_credential&appid=${appid}&secret=${secret}`;
  const res = await fetch(url);
  const data = (await res.json()) as AccessTokenResponse & { errcode?: number; errmsg?: string };

  if (data.errcode) {
    throw new Error(`WeChat API error: ${data.errmsg} (code: ${data.errcode})`);
  }

  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  };

  return data.access_token;
}

// ─── Upload Image (for article content images) ───
export async function uploadImage(buffer: Buffer, filename: string): Promise<string> {
  const token = await getAccessToken();
  const formData = new FormData();
  const blob = new Blob([new Uint8Array(buffer)]);
  formData.append("media", blob, filename);

  const res = await fetch(`${WX_API_BASE}/media/uploadimg?access_token=${token}`, {
    method: "POST",
    body: formData,
  });

  const data = (await res.json()) as UploadImageResponse & { errcode?: number; errmsg?: string };

  if (data.errcode) {
    throw new Error(`Upload image failed: ${data.errmsg} (code: ${data.errcode})`);
  }

  return data.url;
}

// ─── Create Draft Article ───
export interface DraftArticle {
  title: string;
  content: string;
  thumb_media_id?: string;
  author?: string;
  digest?: string;
  show_cover_pic?: number;
  content_source_url?: string;
  need_open_comment?: number;
  only_fans_can_comment?: number;
}

export async function createDraft(articles: DraftArticle[]): Promise<string> {
  const token = await getAccessToken();

  const res = await fetch(`${WX_API_BASE}/draft/add?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ articles }),
  });

  const data = (await res.json()) as CreateDraftResponse & { errcode?: number; errmsg?: string };

  if (data.errcode) {
    throw new Error(`Create draft failed: ${data.errmsg} (code: ${data.errcode})`);
  }

  return data.media_id;
}

// ─── Publish Draft ───
export async function publishDraft(mediaId: string): Promise<PublishResponse> {
  const token = await getAccessToken();

  const res = await fetch(`${WX_API_BASE}/freepublish/submit?access_token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ media_id: mediaId }),
  });

  const data = (await res.json()) as PublishResponse & { errcode?: number; errmsg?: string };

  if (data.errcode) {
    throw new Error(`Publish failed: ${data.errmsg} (code: ${data.errcode})`);
  }

  return data;
}

// ─── Validate HTML Content for WeChat ───
export function sanitizeHtmlForWeChat(html: string): string {
  // WeChat only supports a subset of HTML tags
  const allowedTags = [
    "p", "br", "strong", "b", "em", "i", "span", "a",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "img", "section", "blockquote",
  ];

  // Basic sanitization - remove script/style tags and their content
  let clean = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");

  return clean;
}
