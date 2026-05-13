"use client";
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  FileText,
  CheckCircle,
  Clock,
  Edit3,
  Search,
  Eye,
  Pencil,
  Copy,
  Trash2,
  X,
  Calendar,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { mockPosts } from '@/data/mockPosts';
import type { Post } from '@/data/mockPosts';
import { mockSchedules } from '@/data/mockSchedules';
import type { ScheduleItem } from '@/data/mockSchedules';
import { getTopicById } from '@/data/topics';

// ── Types ──────────────────────────────────────────────
type StatusFilter = 'all' | 'published' | 'draft' | 'scheduled';
type SortOption = 'newest' | 'oldest' | 'views';

// ── Stats cards data ───────────────────────────────────
const allPostsCount = mockPosts.length;
const publishedCount = mockPosts.filter((p) => p.status === 'published').length;
const scheduledCount = mockPosts.filter((p) => p.status === 'scheduled').length;
const draftCount = mockPosts.filter((p) => p.status === 'draft').length;

// ── Mock view counts for posts ─────────────────────────
const viewCounts: Record<string, number> = {
  'post-1': 342,
  'post-2': 518,
  'post-3': 0,
  'post-4': 0,
  'post-5': 891,
  'post-6': 0,
  'post-7': 1205,
  'post-8': 0,
  'post-9': 756,
  'post-10': 623,
};

const avgViews = Math.round(
  Object.values(viewCounts).reduce((a, b) => a + b, 0) /
    Object.values(viewCounts).filter((v) => v > 0).length || 0
);

// ── Status badge config ────────────────────────────────
const statusConfig = {
  published: { label: '已發布', color: 'bg-success', textColor: 'text-success', bgLight: 'bg-success/10' },
  draft: { label: '草稿', color: 'bg-text-dark/30', textColor: 'text-text-dark/50', bgLight: 'bg-text-dark/5' },
  scheduled: { label: '排程中', color: 'bg-warning', textColor: 'text-warning', bgLight: 'bg-warning/10' },
};

// ── Statistics Cards ───────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  delay,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
      className="bg-card-light rounded-[10px] h-20 px-5 flex items-center justify-between shadow-card"
    >
      <div>
        <p className="text-[13px] text-text-dark/50 font-medium tracking-wide">{title}</p>
        <p className={`font-mono text-[28px] font-bold leading-tight ${color}`}>{value}</p>
      </div>
      <Icon className={`w-6 h-6 ${color}`} strokeWidth={1.5} />
    </motion.div>
  );
}

// ── Preview Modal ──────────────────────────────────────
function PreviewModal({
  post,
  onClose,
}: {
  post: Post | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  if (!post) return null;

  const topic = getTopicById(post.topicId);

  const handleCopyHTML = async () => {
    try {
      const html = `<h1>${post.title}</h1><p>${post.excerpt}</p>`;
      await navigator.clipboard.writeText(html);
      setCopied(true);
      toast.success('HTML 已複製');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('複製失敗');
    }
  };

  const handleEdit = () => {
    router.push(`/editor?topic=${post.topicId}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card-light rounded-2xl w-[90vw] max-w-[800px] max-h-[85vh] overflow-hidden shadow-floating flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-border-custom">
          <h3 className="font-sans text-[28px] font-bold text-text-dark">{post.title}</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg hover:bg-bg-light flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-text-dark/60" />
          </button>
        </div>

        {/* Preview content */}
        <div className="flex-1 overflow-auto p-8">
          {/* Phone mockup */}
          <div className="mx-auto w-[375px] rounded-2xl border-4 border-border-custom overflow-hidden bg-card-light">
            {/* Status bar */}
            <div className="h-7 bg-bg-dark flex items-center justify-between px-5">
              <span className="text-[9px] text-text-light/80 font-mono">
                {new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div className="flex gap-0.5">
                <div className="w-2.5 h-2.5 rounded-full border border-text-light/60" />
                <div className="w-2.5 h-2.5 rounded-full border border-text-light/60" />
              </div>
            </div>

            {/* WeChat header */}
            <div className="bg-bg-dark/5 px-3 py-2.5 flex items-center gap-2 border-b border-border-custom">
              <div className="w-6 h-6 rounded-full bg-primary-blue flex items-center justify-center">
                <span className="text-[9px] text-text-light font-bold">心</span>
              </div>
              <span className="text-xs font-medium text-text-dark">心晴助手</span>
            </div>

            {/* Content */}
            <div className="p-5 max-h-[450px] overflow-y-auto">
              {topic && (
                <div className="relative h-[160px] rounded-lg overflow-hidden mb-5">
                  <img src={topic.image} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              )}
              <h4 className="text-xl font-bold text-text-dark text-center mb-3">
                {post.title}
              </h4>
              <div className="text-center text-xs text-text-dark/40 mb-4">
                心晴助手 · {post.date}
              </div>
              <p className="text-sm text-text-dark/80 leading-relaxed indent-8 mb-4">
                {post.excerpt}
              </p>
              <div className="mt-4 pt-3 border-t border-border-custom text-center">
                <p className="text-xs text-text-dark/40">
                  大學心理諮商中心 · 關心你的心理健康
                </p>
                <p className="text-xs text-primary-blue mt-1">閱讀原文 · 點讚 · 在看</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-8 py-5 border-t border-border-custom flex gap-3 justify-end">
          <button
            onClick={handleCopyHTML}
            className="h-10 px-5 rounded-lg bg-primary-blue text-text-light text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? '已複製' : '複製 HTML'}
          </button>
          <button
            onClick={handleEdit}
            className="h-10 px-5 rounded-lg border border-primary-blue text-primary-blue text-sm font-medium hover:bg-primary-blue/5 transition-colors flex items-center gap-2"
          >
            <Pencil className="w-4 h-4" />
            編輯此貼文
          </button>
          <button
            onClick={onClose}
            className="h-10 px-5 rounded-lg text-text-dark/60 text-sm font-medium hover:bg-bg-light transition-colors"
          >
            關閉
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Schedule Management Drawer ─────────────────────────
function ScheduleDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(mockSchedules);
  const [newSchedulePost, setNewSchedulePost] = useState('');
  const [newScheduleDate, setNewScheduleDate] = useState('');
  const [newScheduleTime, setNewScheduleTime] = useState('');

  const draftPosts = mockPosts.filter((p) => p.status === 'draft');

  const handleAddSchedule = () => {
    if (!newSchedulePost || !newScheduleDate || !newScheduleTime) {
      toast.error('請填寫所有欄位');
      return;
    }
    const post = mockPosts.find((p) => p.id === newSchedulePost);
    if (!post) return;
    const newSched: ScheduleItem = {
      id: `sched-${Date.now()}`,
      postId: post.id,
      title: post.title,
      date: newScheduleDate,
      time: newScheduleTime,
      status: 'scheduled',
      topicColor: '#3D7EAA',
    };
    setSchedules([...schedules, newSched]);
    setNewSchedulePost('');
    setNewScheduleDate('');
    setNewScheduleTime('');
    toast.success('排程已新增');
  };

  const handleCancelSchedule = (id: string) => {
    setSchedules(schedules.filter((s) => s.id !== id));
    toast.success('排程已取消');
  };

  const isUpcoming = (dateStr: string, timeStr: string) => {
    const now = new Date();
    const d = new Date(`${dateStr}T${timeStr}`);
    const diff = d.getTime() - now.getTime();
    return diff > 0 && diff < 24 * 60 * 60 * 1000;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 z-50"
            onClick={onClose}
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
            className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-card-light border-l border-border-custom z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border-custom">
              <h3 className="text-xl font-bold text-text-dark">排程管理</h3>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-lg hover:bg-bg-light flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-text-dark/60" />
              </button>
            </div>

            {/* Schedule list */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <AnimatePresence>
                {schedules.length === 0 ? (
                  <div className="text-center py-16">
                    <Calendar className="w-12 h-12 text-text-dark/20 mx-auto mb-4" />
                    <p className="text-text-dark/50 text-sm">尚無排程</p>
                  </div>
                ) : (
                  schedules.map((sched, i) => {
                    const upcoming = isUpcoming(sched.date, sched.time);
                    return (
                      <motion.div
                        key={sched.id}
                        initial={{ opacity: 0, x: 16 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 16 }}
                        transition={{ duration: 0.4, delay: i * 0.06 }}
                        className="py-4 border-b border-border-custom last:border-b-0"
                      >
                        <p className="text-[15px] font-semibold text-text-dark mb-1">
                          {sched.title}
                        </p>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-primary-blue" />
                          <span className="font-mono text-sm text-primary-blue">
                            {sched.date} {sched.time}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              upcoming
                                ? 'bg-warning/10 text-warning'
                                : 'bg-primary-blue/10 text-primary-blue'
                            }`}
                          >
                            {upcoming ? '即將發布' : '排程中'}
                          </span>
                          <button
                            onClick={() => handleCancelSchedule(sched.id)}
                            className="text-xs text-error hover:underline px-2 py-1"
                          >
                            取消排程
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>

            {/* Add new schedule */}
            <div className="px-6 py-5 border-t border-border-custom bg-bg-light/50">
              <h4 className="text-base font-semibold text-text-dark mb-4">新增排程</h4>
              <div className="space-y-3">
                <select
                  value={newSchedulePost}
                  onChange={(e) => setNewSchedulePost(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border-custom bg-card-light text-sm text-text-dark focus:outline-none focus:border-primary-blue"
                >
                  <option value="">選擇貼文...</option>
                  {draftPosts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={newScheduleDate}
                    onChange={(e) => setNewScheduleDate(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-border-custom bg-card-light text-sm text-text-dark focus:outline-none focus:border-primary-blue"
                  />
                  <input
                    type="time"
                    value={newScheduleTime}
                    onChange={(e) => setNewScheduleTime(e.target.value)}
                    className="flex-1 h-10 px-3 rounded-lg border border-border-custom bg-card-light text-sm text-text-dark focus:outline-none focus:border-primary-blue"
                  />
                </div>
                <button
                  onClick={handleAddSchedule}
                  className="w-full h-10 rounded-lg bg-primary-blue text-text-light text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Calendar className="w-4 h-4" />
                  新增排程
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Delete Confirmation Dialog ─────────────────────────
function DeleteDialog({
  isOpen,
  postTitle,
  onConfirm,
  onCancel,
}: {
  isOpen: boolean;
  postTitle: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card-light rounded-2xl p-8 max-w-sm w-full shadow-floating"
          >
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-error" />
              </div>
              <h4 className="text-lg font-bold text-text-dark mb-2">確認刪除</h4>
              <p className="text-sm text-text-dark/60 mb-6">
                確定要刪除「{postTitle}」嗎？此操作無法復原。
              </p>
              <div className="flex gap-3 w-full">
                <button
                  onClick={onCancel}
                  className="flex-1 h-11 rounded-lg border border-border-custom text-text-dark/70 text-sm font-medium hover:bg-bg-light transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 h-11 rounded-lg bg-error text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  確認刪除
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


// ── Main HistoryPage ───────────────────────────────────
export default function HistoryPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);
  const [scheduleDrawerOpen, setScheduleDrawerOpen] = useState(false);
  const [deletePost, setDeletePost] = useState<Post | null>(null);

  // Filter & sort posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.topicName.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Sort
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortOption === 'views') {
      result.sort((a, b) => (viewCounts[b.id] || 0) - (viewCounts[a.id] || 0));
    }

    return result;
  }, [posts, searchQuery, statusFilter, sortOption]);

  const handleDelete = (post: Post) => {
    setDeletePost(post);
  };

  const confirmDelete = () => {
    if (!deletePost) return;
    setPosts(posts.filter((p) => p.id !== deletePost.id));
    toast.success(`「${deletePost.title}」已刪除`);
    setDeletePost(null);
  };

  const handleCopyHTML = async (post: Post) => {
    try {
      const html = `<h1>${post.title}</h1><p>${post.excerpt}</p>`;
      await navigator.clipboard.writeText(html);
      toast.success('HTML 已複製到剪貼簿');
    } catch {
      toast.error('複製失敗');
    }
  };

  const handleEdit = (post: Post) => {
    router.push(`/editor?topic=${post.topicId}`);
  };

  const handleRepublish = (post: Post) => {
    toast.success(`「${post.title}」已重新發布`);
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'published', label: '已發布' },
    { key: 'draft', label: '草稿' },
    { key: 'scheduled', label: '排程中' },
  ];

  return (
    <div className="min-h-[100dvh]">
      {/* Page title */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="px-6 lg:px-12 pt-12 lg:pt-16 pb-8"
      >
        <h1 className="font-display text-[40px] text-text-dark mb-2">貼文管理</h1>
        <p className="text-base text-text-dark/60">
          管理你的所有貼文，查看排程、追蹤發布狀態
        </p>
      </motion.div>

      {/* Statistics */}
      <div className="px-6 lg:px-12 pb-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="全部貼文" value={allPostsCount} icon={FileText} color="text-text-dark" delay={0} />
          <StatCard title="已發布" value={publishedCount} icon={CheckCircle} color="text-success" delay={0.08} />
          <StatCard title="排程中" value={scheduledCount} icon={Clock} color="text-warning" delay={0.16} />
          <StatCard title="草稿" value={draftCount} icon={Edit3} color="text-primary-blue" delay={0.24} />
        </div>
      </div>

      {/* Search & Filter bar */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="px-6 lg:px-12 pb-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Search */}
          <div className="relative w-full lg:w-[280px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dark/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索貼文標題、主題..."
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-border-custom bg-card-light text-sm text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  statusFilter === tab.key
                    ? 'bg-primary-blue/10 text-primary-blue'
                    : 'bg-transparent text-text-dark/60 hover:text-text-dark hover:bg-bg-light'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1" />

          {/* Sort dropdown + Schedule button */}
          <div className="flex items-center gap-3">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="h-10 px-3 rounded-lg border border-border-custom bg-card-light text-sm text-text-dark focus:outline-none focus:border-primary-blue cursor-pointer"
            >
              <option value="newest">最新優先</option>
              <option value="oldest">最舊優先</option>
              <option value="views">最多瀏覽</option>
            </select>

            <button
              onClick={() => setScheduleDrawerOpen(true)}
              className="h-10 px-4 rounded-lg border border-primary-blue text-primary-blue text-sm font-medium hover:bg-primary-blue/5 transition-colors flex items-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              排程管理
            </button>
          </div>
        </div>
      </motion.div>

      {/* Post list */}
      <div className="px-6 lg:px-12 pb-16">
        {filteredPosts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <FileText className="w-16 h-16 text-text-dark/15 mb-4" />
            <p className="text-lg font-semibold text-text-dark/70 mb-2">尚無貼文</p>
            <p className="text-sm text-text-dark/50 mb-6">前往文章編輯器創建你的第一篇貼文吧</p>
            <button
              onClick={() => router.push('/editor')}
              className="h-10 px-6 rounded-lg bg-primary-blue text-text-light text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              去創作
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, i) => {
                const status = statusConfig[post.status];
                const views = viewCounts[post.id] || 0;
                const isScheduled = post.status === 'scheduled';

                return (
                  <motion.div
                    key={post.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="bg-card-light rounded-[10px] p-5 shadow-[0_1px_4px_rgba(27,42,65,0.04)] hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 min-h-[120px]"
                  >
                    <div className="flex items-center gap-4 h-full">
                      {/* Thumbnail */}
                      <img
                        src={post.thumbnail}
                        alt={post.title}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[16px] font-semibold text-text-dark truncate">
                          {post.title}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-primary-blue/10 text-primary-blue font-medium">
                            {post.topicName}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${status.color}`} />
                            <span className={`text-[13px] ${status.textColor}`}>{status.label}</span>
                          </span>
                          {post.status === 'scheduled' && (
                            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-warning/10 text-warning font-medium">
                              將於 12/25 14:00 發布
                            </span>
                          )}
                          <span className="font-mono text-xs text-text-dark/40">
                            建立於 {post.date}
                          </span>
                          {views > 0 && (
                            <span className="font-mono text-xs text-text-dark/40">
                              {views} 瀏覽
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setPreviewPost(post)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-text-dark/50 hover:text-primary-blue hover:bg-primary-blue/10 transition-colors"
                          title="預覽"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(post)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-text-dark/50 hover:text-primary-blue hover:bg-primary-blue/10 transition-colors"
                          title="編輯"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleCopyHTML(post)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-text-dark/50 hover:text-primary-blue hover:bg-primary-blue/10 transition-colors"
                          title="複製 HTML"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleRepublish(post)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-text-dark/50 hover:text-primary-blue hover:bg-primary-blue/10 transition-colors"
                          title="重新發布"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post)}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-text-dark/50 hover:text-error hover:bg-error/10 transition-colors"
                          title="刪除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Cancel schedule button for scheduled posts */}
                    {isScheduled && (
                      <div className="mt-3 pt-3 border-t border-border-custom flex justify-end">
                        <button
                          onClick={() => {
                            setPosts(posts.map((p) => (p.id === post.id ? { ...p, status: 'draft' as const } : p)));
                            toast.success('排程已取消');
                          }}
                          className="text-xs text-error hover:underline px-2 py-1"
                        >
                          取消排程
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewPost && (
          <PreviewModal post={previewPost} onClose={() => setPreviewPost(null)} />
        )}
      </AnimatePresence>

      {/* Schedule Drawer */}
      <ScheduleDrawer
        isOpen={scheduleDrawerOpen}
        onClose={() => setScheduleDrawerOpen(false)}
      />

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={!!deletePost}
        postTitle={deletePost?.title || ''}
        onConfirm={confirmDelete}
        onCancel={() => setDeletePost(null)}
      />
    </div>
  );
}
