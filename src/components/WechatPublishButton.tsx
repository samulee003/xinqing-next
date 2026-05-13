"use client";
import { motion } from "framer-motion";
import { Send, Check, Loader2, AlertCircle } from "lucide-react";
import { useWechatPublish } from "@/lib/useWechatPublish";

interface WechatPublishButtonProps {
  title: string;
  content: string;
  disabled?: boolean;
}

export default function WechatPublishButton({
  title,
  content,
  disabled = false,
}: WechatPublishButtonProps) {
  const { isPublishing, isPublished, publish, reset } = useWechatPublish();

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) return;
    await publish({ title, content });
  };

  if (isPublished) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex items-center gap-3 bg-success/10 border border-success/20 rounded-lg px-4 py-3"
      >
        <Check className="w-5 h-5 text-success" />
        <div>
          <p className="text-sm font-medium text-success">已成功發布到微信公眾號</p>
          <button
            onClick={reset}
            className="text-xs text-text-dark/50 hover:text-primary-blue mt-1"
          >
            再次發布
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <button
      onClick={handlePublish}
      disabled={disabled || isPublishing || !title.trim() || !content.trim()}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
        isPublishing || disabled || !title.trim() || !content.trim()
          ? "bg-text-dark/10 text-text-dark/30 cursor-not-allowed"
          : "bg-success text-white hover:bg-success/90 hover:shadow-lg active:scale-95"
      }`}
    >
      {isPublishing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>發布中...</span>
        </>
      ) : (
        <>
          <Send className="w-4 h-4" />
          <span>一鍵發布到微信</span>
        </>
      )}
    </button>
  );
}
