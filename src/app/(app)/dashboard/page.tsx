"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  FileCheck,
  Eye,
  Clock,
  Bookmark,
  PenLine,
  Library,
  History,
  Settings,
  ChevronRight,
  Pencil,
  ArrowRight,
} from 'lucide-react';
import { getRecommendedTopics } from '@/data/topics';
import { getRecentPosts } from '@/data/mockPosts';
import { getSchedulesForMonth } from '@/data/mockSchedules';

/* ─── helpers ─── */
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: '早安，心理中心夥伴', emoji: '' };
  if (hour < 18) return { text: '午安，心理中心夥伴', emoji: '' };
  return { text: '晚安，心理中心夥伴', emoji: '' };
};

const formatDate = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
  return `${y}年${m}月${d}日 週${weekdays[now.getDay()]}`;
};

/* ─── Animated counter ─── */
function AnimatedNumber({ target, duration = 800 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      setCount(current);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

/* ─── Floating particles for hero ─── */
function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 6 + 2,
        duration: Math.random() * 10 + 8,
        delay: Math.random() * 5,
        opacity: Math.random() * 0.12 + 0.04,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.id % 3 === 0 ? '#E8C547' : '#3D7EAA',
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 10, -10, 0],
            opacity: [p.opacity, p.opacity * 1.8, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

/* ─── Stat Card ─── */
function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  trend,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  unit: string;
  trend?: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="bg-card-light rounded-xl shadow-floating p-6 hover:shadow-card-hover transition-shadow duration-300"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-primary-blue/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-blue" strokeWidth={1.5} />
        </div>
        {trend && (
          <span className="text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div className="font-mono text-[36px] font-bold leading-none text-text-dark tracking-tight">
        <AnimatedNumber target={value} />
        <span className="text-lg ml-1">{unit}</span>
      </div>
      <p className="text-[13px] text-text-dark/60 mt-2 tracking-wide">{label}</p>
    </motion.div>
  );
}

/* ─── Mini Calendar ─── */
function MiniCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  const schedules = getSchedulesForMonth(year, month);
  const scheduledDates = new Set(schedules.map((s) => new Date(s.date).getDate()));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const nextSched = schedules.find((s) => new Date(s.date) >= now);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] }}
      className="bg-card-light rounded-xl shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-text-dark">
          {year}年{month + 1}月
        </h3>
        <span className="text-sm text-text-dark/50">今日 {today}日</span>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((w) => (
          <div key={w} className="text-center text-xs text-text-dark/50 py-1">
            {w}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null)
            return <div key={`empty-${i}`} className="h-9" />;
          const isToday = day === today;
          const hasSchedule = scheduledDates.has(day);

          return (
            <motion.div
              key={day}
              initial={hasSchedule ? { scale: 0 } : false}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.02, duration: 0.25 }}
              className={`relative h-9 flex items-center justify-center rounded-lg text-sm cursor-default transition-colors
                ${isToday ? 'bg-primary-blue text-white font-medium' : 'text-text-dark hover:bg-primary-blue/[0.06]'}
                ${hasSchedule && !isToday ? 'bg-primary-blue/10 text-primary-blue font-medium' : ''}
              `}
            >
              {day}
              {hasSchedule && !isToday && (
                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent-green" />
              )}
            </motion.div>
          );
        })}
      </div>

      {nextSched && (
        <div className="mt-4 p-3 rounded-lg bg-accent-green/10 text-accent-green text-sm flex items-center gap-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>
            {nextSched.date.slice(5).replace('-', '/')} {nextSched.time} 將自動發布「{nextSched.title}」
          </span>
        </div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
/* ═══════ MAIN DASHBOARD PAGE ══════════════ */
/* ═══════════════════════════════════════════ */
export default function Dashboard() {
  const router = useRouter();
  const greeting = getGreeting();
  const dateStr = formatDate();
  const recommended = getRecommendedTopics();
  const recentPosts = getRecentPosts(5);

  const statusConfig = {
    published: { label: '已發布', color: 'bg-success', textColor: 'text-success' },
    scheduled: { label: '排程中', color: 'bg-warning', textColor: 'text-warning' },
    draft: { label: '草稿', color: 'bg-text-dark/30', textColor: 'text-text-dark/50' },
  };

  const quickActions = [
    {
      icon: PenLine,
      title: '撰寫新文章',
      desc: '選擇主題，AI 一鍵生成圖文並茂的貼文',
      color: 'text-primary-blue',
      bgHover: 'hover:bg-primary-blue/[0.04]',
      to: '/editor',
    },
    {
      icon: Library,
      title: '瀏覽主題庫',
      desc: '探索 12+ 心理健康主題，收藏感興趣的內容',
      color: 'text-accent-green',
      bgHover: 'hover:bg-accent-green/[0.04]',
      to: '/topics',
    },
    {
      icon: History,
      title: '查看貼文紀錄',
      desc: '管理已發布與排程中的貼文，隨時重新編輯',
      color: 'text-accent-yellow',
      bgHover: 'hover:bg-accent-yellow/[0.04]',
      to: '/history',
    },
    {
      icon: Settings,
      title: '排程設定',
      desc: '設定自動發布時間與頻率，讓內容按計劃推送',
      color: 'text-text-dark',
      bgHover: 'hover:bg-text-dark/[0.04]',
      to: '/history',
    },
  ];

  return (
    <div className="pb-8">
      {/* ═══════ HERO SECTION ═══════ */}
      <section className="relative bg-bg-dark pb-12 overflow-hidden">
        <FloatingParticles />

        <div className="relative z-10 px-6 md:px-12 pt-10 pb-6">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-lg text-text-light/70 font-sans"
          >
            {greeting.text} {greeting.emoji}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="text-sm text-text-light/50 mt-1"
          >
            {dateStr}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2 }}
            className="font-display text-[40px] md:text-[52px] text-text-light leading-tight mt-4"
          >
            本週也要好好照顧自己
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.8 }}
            className="text-base text-text-light/60 mt-3 max-w-xl"
          >
            已為你準備好本週的心理健康主題，一鍵即可開始創作
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 1 }}
            className="flex items-center gap-4 mt-6"
          >
            <button
              onClick={() => router.push('/editor')}
              className="inline-flex items-center gap-2 bg-primary-blue text-text-light px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 hover:-translate-y-px active:scale-[0.98] transition-all shadow-primary-card"
            >
              開始生成本週貼文
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => router.push('/topics')}
              className="inline-flex items-center gap-2 bg-card-light text-primary-blue px-6 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 hover:-translate-y-px transition-all border border-border-custom"
            >
              瀏覽主題庫
            </button>
          </motion.div>
        </div>
      </section>

      <div className="px-6 md:px-12 mt-8 relative z-20 space-y-16 pb-8">
        {/* ═══════ STAT CARDS ═══════ */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FileCheck} label="本月已發布" value={12} unit="篇" trend="+3 較上週" delay={0} />
          <StatCard icon={Eye} label="累積瀏覽量" value={3248} unit="" trend="+18% 本月" delay={0.1} />
          <StatCard icon={Clock} label="待排程貼文" value={2} unit="篇" delay={0.2} />
          <StatCard icon={Bookmark} label="主題庫收藏" value={8} unit="個" delay={0.3} />
        </section>

        {/* ═══════ RECOMMENDED TOPICS ═══════ */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-6"
          >
            <div>
              <h2 className="font-display text-[32px] md:text-[40px] text-text-dark leading-tight">
                本週心晴推薦
              </h2>
              <p className="text-base text-text-dark/60 mt-1">
                根據時節與學生需求，為你精選的主題
              </p>
            </div>
            <button
              onClick={() => router.push('/topics')}
              className="hidden sm:inline-flex items-center gap-1 text-sm text-primary-blue hover:underline transition-all"
            >
              查看全部主題
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommended.map((topic, i) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.12 }}
                className="group bg-card-light rounded-xl shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="overflow-hidden h-40">
                  <img
                    src={topic.image}
                    alt={topic.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {topic.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-3 py-1 rounded-full bg-primary-blue/10 text-primary-blue font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="text-lg font-bold text-text-dark mb-1">{topic.title}</h3>
                  <p className="text-sm text-text-dark/60 mb-4 line-clamp-2">{topic.description}</p>
                  <button
                    onClick={() => router.push('/editor')}
                    className="inline-flex items-center gap-1.5 bg-primary-blue text-text-light px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all"
                  >
                    <PenLine className="w-3.5 h-3.5" />
                    生成文章
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => router.push('/topics')}
            className="sm:hidden mt-4 inline-flex items-center gap-1 text-sm text-primary-blue hover:underline"
          >
            查看全部主題
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* ═══════ QUICK ACTIONS ═══════ */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h2 className="font-display text-[32px] md:text-[40px] text-text-dark leading-tight">
              快速操作
            </h2>
            <p className="text-base text-text-dark/60 mt-1">常用功能一鍵直達</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  onClick={() => router.push(action.to)}
                  className={`group bg-card-light rounded-xl shadow-card p-6 text-left hover:shadow-card-hover transition-all duration-300 ${action.bgHover}`}
                >
                  <div className="mb-4 transition-transform duration-300 group-hover:-translate-y-1">
                    <Icon className={`w-12 h-12 ${action.color} group-hover:scale-110 transition-transform duration-300`} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-lg font-bold text-text-dark mb-1">{action.title}</h3>
                  <p className="text-sm text-text-dark/60 leading-relaxed">{action.desc}</p>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* ═══════ RECENT POSTS ═══════ */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-end justify-between mb-6"
          >
            <div>
              <h2 className="font-display text-[32px] md:text-[40px] text-text-dark leading-tight">
                最近貼文
              </h2>
              <p className="text-base text-text-dark/60 mt-1">最新生成與發布的內容</p>
            </div>
            <button
              onClick={() => router.push('/history')}
              className="hidden sm:inline-flex items-center gap-1 text-sm text-primary-blue hover:underline transition-all"
            >
              查看全部紀錄
              <ChevronRight className="w-4 h-4" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card-light rounded-xl shadow-card overflow-hidden"
          >
            {recentPosts.map((post, idx) => {
              const cfg = statusConfig[post.status];
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.06 }}
                  className="flex items-center gap-4 px-5 py-3.5 border-b border-border-custom last:border-b-0 group hover:bg-primary-blue/[0.04] hover:border-l-2 hover:border-l-primary-blue transition-all duration-200 cursor-pointer"
                >
                  {/* Status dot */}
                  <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.color}`} />

                  {/* Thumbnail */}
                  <img
                    src={post.thumbnail}
                    alt={post.title}
                    className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  />

                  {/* Title + tag */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-text-dark truncate group-hover:text-primary-blue transition-colors">
                      {post.title}
                    </p>
                    <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-primary-blue/10 text-primary-blue font-medium">
                      {post.topicName}
                    </span>
                  </div>

                  {/* Status label */}
                  <span className={`hidden sm:inline-block text-xs font-medium ${cfg.textColor}`}>
                    {cfg.label}
                  </span>

                  {/* Date */}
                  <span className="font-mono text-[13px] text-text-dark/50 w-[100px] text-right flex-shrink-0 hidden md:block">
                    {post.date}
                  </span>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      className="p-2 rounded-lg hover:bg-primary-blue/10 text-text-dark/40 hover:text-primary-blue transition-colors"
                      aria-label="編輯"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg hover:bg-primary-blue/10 text-text-dark/40 hover:text-primary-blue transition-colors"
                      aria-label="預覽"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <button
            onClick={() => router.push('/history')}
            className="sm:hidden mt-4 inline-flex items-center gap-1 text-sm text-primary-blue hover:underline"
          >
            查看全部紀錄
            <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* ═══════ SCHEDULE CALENDAR ═══════ */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <h2 className="font-display text-[32px] md:text-[40px] text-text-dark leading-tight">
              發布排程
            </h2>
            <p className="text-base text-text-dark/60 mt-1">未來 30 天內的貼文排程一覽</p>
          </motion.div>

          <MiniCalendar />
        </section>
      </div>
    </div>
  );
}
