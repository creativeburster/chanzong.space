'use client';

import React from 'react';
import Link from 'next/link';
import { Search, BookOpen, GitFork, Feather } from 'lucide-react';

interface NavbarProps {
  onOpenSearch?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSearch }) => {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-zinc-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-amber-900/10 border border-amber-900/20 flex items-center justify-center text-amber-800 group-hover:scale-105 transition-transform">
            <Feather className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif-zen text-lg font-bold text-zinc-900 tracking-wide group-hover:text-amber-800 transition-colors">
              禅宗正法心传
            </span>
            <span className="text-[10px] tracking-widest text-zinc-500 font-sans uppercase">
              ChanZong Knowledge Base
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-700">
          <Link href="/" className="hover:text-amber-800 transition-colors flex items-center space-x-1.5">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>典籍大库</span>
          </Link>
          <Link href="#lineage" className="hover:text-amber-800 transition-colors flex items-center space-x-1.5">
            <GitFork className="w-4 h-4 text-amber-700" />
            <span>祖师法脉</span>
          </Link>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSearch}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-600 text-xs hover:border-amber-700 hover:text-amber-900 transition-all shadow-sm"
          >
            <Search className="w-3.5 h-3.5 text-amber-700" />
            <span className="hidden sm:inline font-medium">全站极速检索...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white rounded border border-zinc-300 font-mono text-zinc-500">
              Ctrl+K
            </kbd>
          </button>
        </div>
      </div>
    </header>
  );
};
