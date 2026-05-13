"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Heart,
  BookOpen,
  ArrowRight,
  X,
  Tag,
  Sparkles,
  Lightbulb,
} from 'lucide-react';
import { topics } from '@/data/topics';
import type { Topic } from '@/data/topics';

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const EASE_OUT = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number];
const EASE_SMOOTH = [0.4, 0, 0.2, 1] as [number, number, number, number];

/** Category filter tabs — derived from actual topic data */
const ALL_CATEGORIES = ['全部', ...Array.from(new Set(topics.map((t) => t.category)))];

/** localStorage key for persisted favourites */
const FAV_KEY = 'xinqing-favourite-topics';

/* ------------------------------------------------------------------ */
/*  Helper: read / write favourites                                  */
/* ------------------------------------------------------------------ */

function readFavs(): Set<string> {
  try {
    const raw = localStorage.getItem(FAV_KEY);
    if (raw) return new Set(JSON.parse(raw) as string[]);
  } catch { /* ignore */ }
  return new Set();
}

function writeFavs(set: Set<string>) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
}

/* ------------------------------------------------------------------ */
/*  Filter helper                                                     */
/* ------------------------------------------------------------------ */

function filterTopics(
  list: Topic[],
  category: string,
  query: string,
): Topic[] {
  return list.filter((t) => {
    const matchCat = category === '全部' || t.category === category;
    const q = query.trim().toLowerCase();
    const matchQuery =
      !q ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q));
    return matchCat && matchQuery;
  });
}

/* ------------------------------------------------------------------ */
/*  Variants                                                          */
/* ------------------------------------------------------------------ */

const headerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_SMOOTH },
  },
};

const searchRowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE_SMOOTH, delay: 0.1 },
  },
};

const cardContainerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
  exit: {
    transition: { staggerChildren: 0.03, staggerDirection: -1 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: EASE_OUT },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2 },
  },
};

/* ------------------------------------------------------------------ */
/*  Topic Detail Drawer                                               */
/* ------------------------------------------------------------------ */

function TopicDetailDrawer({
  topic,
  isFav,
  onClose,
  onToggleFav,
  onGenerate,
}: {
  topic: Topic;
  isFav: boolean;
  onClose: () => void;
  onToggleFav: () => void;
  onGenerate: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex justify-end"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.35, ease: EASE_SMOOTH }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg h-full bg-card-light shadow-floating overflow-y-auto"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-black/30 hover:bg-black/50 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
          aria-label="關閉"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cover image */}
        <div className="relative w-full h-64 overflow-hidden">
          <img
            src={topic.image}
            alt={topic.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1B2A41]/60 to-transparent" />
          <div className="absolute bottom-4 left-5 right-5">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary-blue/90 text-text-light mb-2">
              {topic.category}
            </span>
            <h2 className="font-display text-2xl text-white">{topic.title}</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <p className="text-text-dark/70 text-[15px] leading-relaxed">
              {topic.description}
            </p>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {topic.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-primary-blue/10 text-primary-blue"
              >
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>

          {/* Suggested article titles */}
          <div className="bg-bg-light rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-accent-yellow" />
              <h3 className="text-text-dark font-bold text-sm">建議文章標題</h3>
            </div>
            <ul className="space-y-3">
              {topic.suggestedArticleTitles.map((title, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-blue/10 text-primary-blue text-xs font-bold flex items-center justify-center mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-text-dark/80 text-sm leading-relaxed">{title}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Content hints */}
          <div className="bg-bg-light rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-4 h-4 text-primary-blue" />
              <h3 className="text-text-dark font-bold text-sm">內容方向提示</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {topic.contentHints.map((hint, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs bg-accent-green/10 text-accent-green font-medium"
                >
                  {hint}
                </span>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-2">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGenerate}
              className="flex-1 flex items-center justify-center gap-2 h-11 rounded-lg bg-primary-blue text-text-light text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              生成文章
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.9 }}
              onClick={onToggleFav}
              className="flex items-center justify-center w-11 h-11 rounded-lg border border-border-custom transition-colors"
              style={{
                backgroundColor: isFav ? '#E8C54715' : 'transparent',
                borderColor: isFav ? '#E8C547' : undefined,
              }}
              aria-label={isFav ? '取消收藏' : '加入收藏'}
            >
              <Heart
                className="w-5 h-5 transition-colors"
                style={{
                  color: isFav ? '#E8C547' : 'rgba(27,42,65,0.3)',
                }}
                fill={isFav ? '#E8C547' : 'none'}
              />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page Component                                               */
/* ------------------------------------------------------------------ */

export default function TopicsPage() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('全部');
  const [favs, setFavs] = useState<Set<string>>(readFavs);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);

  /* Persist favourites */
  useEffect(() => {
    writeFavs(favs);
  }, [favs]);

  const toggleFav = useCallback((id: string) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(
    () => filterTopics(topics, activeCategory, query),
    [activeCategory, query],
  );

  const favCount = favs.size;

  const handleGenerate = useCallback(
    (topicId: string) => {
      router.push(`/editor?topic=${topicId}`);
    },
    [router],
  );

  return (
    <div className="min-h-[calc(100dvh-56px-56px)] bg-bg-light">
      {/* ── Page Header ── */}
      <motion.div
        variants={headerVariants}
        initial="hidden"
        animate="visible"
        className="px-6 md:px-8 lg:px-12 pt-10 pb-6 md:pt-16 md:pb-8"
      >
        <div className="max-w-[1280px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2">
            <div>
              <h1 className="font-display text-[32px] md:text-[40px] text-text-dark leading-tight tracking-tight">
                主題庫
              </h1>
              <p className="mt-2 text-text-dark/60 text-[15px] md:text-base">
                收錄 {topics.length}+ 個專為大學生設計的心理健康主題，點擊即可開始創作
              </p>
            </div>
            <span className="font-mono text-sm text-text-dark/40">
              共 {topics.length} 個主題 · {favCount} 個已收藏
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Search & Filter Row ── */}
      <motion.div
        variants={searchRowVariants}
        initial="hidden"
        animate="visible"
        className="px-6 md:px-8 lg:px-12 pb-6 md:pb-8"
      >
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row md:items-center gap-4">
          {/* Search input */}
          <div className="relative w-full md:w-80 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dark/40 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋主題名稱、標籤..."
              className="w-full h-11 pl-10 pr-10 rounded-lg bg-card-light border border-border-custom text-text-dark text-sm placeholder:text-text-dark/40 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
            />
            <AnimatePresence>
              {query && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dark/40 hover:text-text-dark/70 transition-colors"
                  aria-label="清除搜尋"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Category filter tags */}
          <div className="flex flex-wrap gap-2">
            <AnimatePresence mode="popLayout">
              {ALL_CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <motion.button
                    key={cat}
                    layout
                    onClick={() => setActiveCategory(cat)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="relative px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors select-none"
                    style={{
                      backgroundColor: isActive
                        ? '#3D7EAA'
                        : 'rgba(61, 126, 170, 0.08)',
                      color: isActive ? '#F7F4EF' : '#3D7EAA',
                    }}
                  >
                    {cat}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* ── Topic Cards Grid ── */}
      <div className="px-6 md:px-8 lg:px-12 pb-12 md:pb-16">
        <div className="max-w-[1280px] mx-auto">
          <AnimatePresence mode="wait">
            {filtered.length > 0 ? (
              <motion.div
                key={activeCategory + query}
                variants={cardContainerVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filtered.map((topic) => {
                  const isFav = favs.has(topic.id);
                  return (
                    <TopicCard
                      key={topic.id}
                      topic={topic}
                      isFav={isFav}
                      onToggleFav={() => toggleFav(topic.id)}
                      onViewDetail={() => setSelectedTopic(topic)}
                      onGenerate={() => handleGenerate(topic.id)}
                    />
                  );
                })}
              </motion.div>
            ) : (
              <EmptyState onClear={() => { setQuery(''); setActiveCategory('全部'); }} />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Detail Drawer ── */}
      <AnimatePresence>
        {selectedTopic && (
          <TopicDetailDrawer
            topic={selectedTopic}
            isFav={favs.has(selectedTopic.id)}
            onClose={() => setSelectedTopic(null)}
            onToggleFav={() => toggleFav(selectedTopic.id)}
            onGenerate={() => {
              setSelectedTopic(null);
              handleGenerate(selectedTopic.id);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Topic Card                                                        */
/* ------------------------------------------------------------------ */

function TopicCard({
  topic,
  isFav,
  onToggleFav,
  onViewDetail,
  onGenerate,
}: {
  topic: Topic;
  isFav: boolean;
  onToggleFav: () => void;
  onViewDetail: () => void;
  onGenerate: () => void;
}) {
  return (
    <motion.div
      variants={cardItemVariants}
      layout
      className="group bg-card-light rounded-xl overflow-hidden shadow-card hover:shadow-[0_8px_24px_rgba(27,42,65,0.12)] transition-shadow duration-250 h-full flex flex-col"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      {/* Cover image */}
      <div className="relative w-full h-[180px] overflow-hidden">
        <motion.img
          src={topic.image}
          alt={topic.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgba(27,42,65,0.4)] to-transparent" />
        {/* Category pill on image */}
        <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium bg-primary-blue/90 text-text-light backdrop-blur-sm">
          {topic.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col">
        {/* Title + Favourite */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-text-dark font-bold text-[17px] leading-snug">
            {topic.title}
          </h3>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={onToggleFav}
            className="flex-shrink-0 mt-0.5 p-1 rounded-md hover:bg-bg-light transition-colors"
            aria-label={isFav ? '取消收藏' : '加入收藏'}
          >
            <motion.div
              animate={isFav ? { scale: [0.8, 1.2, 1] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Heart
                className="w-5 h-5 transition-colors duration-200"
                style={{
                  color: isFav ? '#E8C547' : 'rgba(27,42,65,0.3)',
                }}
                fill={isFav ? '#E8C547' : 'none'}
              />
            </motion.div>
          </motion.button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {topic.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary-blue/10 text-primary-blue"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Description */}
        <p className="mt-2 text-text-dark/65 text-[14px] leading-relaxed line-clamp-2">
          {topic.description}
        </p>

        {/* Actions */}
        <div className="mt-auto flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onGenerate}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary-blue text-text-light text-[13px] font-medium hover:opacity-90 transition-opacity"
          >
            <Sparkles className="w-3.5 h-3.5" />
            生成文章
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={onViewDetail}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-primary-blue text-[13px] font-medium hover:bg-primary-blue/5 transition-colors"
          >
            查看詳情
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Empty State                                                       */
/* ------------------------------------------------------------------ */

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-20"
    >
      <div className="w-16 h-16 rounded-2xl bg-primary-blue/10 flex items-center justify-center mb-4">
        <Search className="w-8 h-8 text-primary-blue/50" />
      </div>
      <h3 className="text-text-dark font-bold text-lg mb-1">沒有符合的主題</h3>
      <p className="text-text-dark/50 text-sm mb-4">試試調整搜尋關鍵字或篩選條件</p>
      <button
        onClick={onClear}
        className="px-5 py-2 rounded-lg bg-primary-blue text-text-light text-sm font-medium hover:opacity-90 transition-opacity"
      >
        清除篩選
      </button>
    </motion.div>
  );
}
