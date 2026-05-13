"use client";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

interface PublishState {
  isPublishing: boolean;
  isPublished: boolean;
  publishId: string | null;
}

export function useWechatPublish() {
  const [state, setState] = useState<PublishState>({
    isPublishing: false,
    isPublished: false,
    publishId: null,
  });

  const publish = useCallback(
    async (params: {
      title: string;
      content: string;
      thumbMediaId?: string;
      author?: string;
      digest?: string;
    }) => {
      setState((s) => ({ ...s, isPublishing: true, isPublished: false }));

      try {
        // Step 1: Create draft
        const draftRes = await fetch("/api/wechat/create-draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            articles: [
              {
                title: params.title,
                content: params.content,
                thumb_media_id: params.thumbMediaId || "",
                author: params.author || "UM心輔",
                digest: params.digest || params.title,
                show_cover_pic: 1,
                need_open_comment: 1,
                only_fans_can_comment: 0,
              },
            ],
          }),
        });

        const draftData = await draftRes.json();
        if (!draftData.success) {
          throw new Error(draftData.error || "創建草稿失敗");
        }

        // Step 2: Publish
        const pubRes = await fetch("/api/wechat/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ media_id: draftData.media_id }),
        });

        const pubData = await pubRes.json();
        if (!pubData.success) {
          throw new Error(pubData.error || "發布失敗");
        }

        setState({
          isPublishing: false,
          isPublished: true,
          publishId: pubData.publish_id,
        });

        toast.success("✅ 文章已成功發布到微信公眾號！");
        return pubData.publish_id;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "發布失敗";
        setState({ isPublishing: false, isPublished: false, publishId: null });
        toast.error(`❌ ${msg}`);
        throw err;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({ isPublishing: false, isPublished: false, publishId: null });
  }, []);

  return { ...state, publish, reset };
}
