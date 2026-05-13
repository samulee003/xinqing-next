"use client";
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0 },
  transition: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const pageTitle = (() => {
    switch (pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/topics':
        return '主題庫';
      case '/editor':
        return '文章編輯器';
      case '/history':
        return '貼文管理';
      default:
        return '心晴助手';
    }
  })();

  return (
    <div className="min-h-[100dvh] bg-bg-light">
      <Navbar collapsed={collapsed} onToggleCollapse={() => setCollapsed((c) => !c)} />

      {/* Main layout */}
      <motion.div
        initial={false}
        animate={{ marginLeft: collapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        className="hidden md:block min-h-[100dvh]"
      >
        {/* Top Bar */}
        <header className="h-14 bg-card-light border-b border-border-custom flex items-center justify-between px-6 lg:px-10 sticky top-0 z-30">
          <h1 className="text-text-dark font-sans text-base font-medium">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dark/40" />
              <input
                type="text"
                placeholder="搜尋..."
                className="h-9 w-48 lg:w-64 pl-9 pr-4 rounded-lg border border-border-custom bg-bg-light text-sm text-text-dark placeholder:text-text-dark/40 focus:outline-none focus:border-primary-blue focus:ring-2 focus:ring-primary-blue/20 transition-all"
              />
            </div>
            <button className="relative p-2 rounded-lg hover:bg-bg-light transition-colors" aria-label="通知">
              <Bell className="w-5 h-5 text-text-dark/60" strokeWidth={1.5} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-primary-blue flex items-center justify-center text-text-light text-sm font-medium">
              心
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="min-h-[calc(100dvh-56px-56px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </motion.div>

      {/* Mobile Layout */}
      <div className="md:hidden pt-14 pb-16 min-h-[100dvh]">
        <main className="min-h-[calc(100dvh-120px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={pageTransition.initial}
              animate={pageTransition.animate}
              exit={pageTransition.exit}
              transition={pageTransition.transition}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
