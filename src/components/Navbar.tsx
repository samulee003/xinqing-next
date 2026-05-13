"use client";
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  PenLine,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
} from 'lucide-react';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/topics', label: '主題庫', icon: BookOpen },
  { path: '/editor', label: '文章編輯器', icon: PenLine },
  { path: '/history', label: '貼文管理', icon: ClipboardList },
];

interface NavbarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Navbar({ collapsed, onToggleCollapse }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
        className="hidden md:flex flex-col bg-bg-dark h-screen fixed left-0 top-0 z-50"
      >
        {/* Logo */}
        <div className="flex items-center justify-center h-16 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-9 h-9 flex-shrink-0">
              <Heart className="w-6 h-6 text-primary-blue" strokeWidth={2} />
              <MessageCircle className="w-4 h-4 text-accent-yellow absolute -bottom-0.5 -right-0.5" strokeWidth={2.5} />
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="text-text-light font-display text-lg whitespace-nowrap overflow-hidden"
                >
                  心晴助手
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-6 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 h-12 rounded-lg px-3 transition-all duration-200 group ${
                  pathname === item.path
                    ? 'bg-primary-blue text-text-light'
                    : 'text-text-light/60 hover:text-text-light/90 hover:bg-text-light/[0.08]'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" strokeWidth={1.5} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Collapse Toggle */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-full h-10 rounded-lg text-text-light/60 hover:text-text-light/90 hover:bg-text-light/[0.08] transition-colors"
            aria-label={collapsed ? '展開導航' : '收起導航'}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <div className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">收起</span>
              </div>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-bg-dark z-50 border-t border-white/10 flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-lg transition-colors ${
                pathname === item.path
                  ? 'text-primary-blue'
                  : 'text-text-light/40'
              }`}
            >
              <Icon className="w-5 h-5" strokeWidth={1.5} />
              <span className="text-[11px]">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-bg-dark z-40 h-14 flex items-center px-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary-blue" strokeWidth={2} />
          <MessageCircle className="w-3.5 h-3.5 text-accent-yellow -ml-1.5 -mb-0.5" strokeWidth={2.5} />
          <span className="text-text-light font-display text-base ml-1">心晴助手</span>
        </div>
      </div>
    </>
  );
}
