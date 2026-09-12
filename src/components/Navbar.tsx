'use client';

import Link from 'next/link';
import { BookOpen, Search } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-brand-light/80 backdrop-blur-md dark:border-gray-800 dark:bg-[#201311]/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-6 w-6 text-brand-primary dark:text-brand-secondary" />
          <div className="flex flex-col">
            <span className="font-bold text-xl tracking-tight leading-none">Manga<span className="text-brand-primary dark:text-brand-secondary">Book</span></span>
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 leading-tight">By comicbook.brave</span>
          </div>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className={`text-sm font-medium transition-colors hover:text-brand-primary ${pathname === '/' ? 'text-brand-primary' : 'text-gray-600 dark:text-gray-300'}`}>
            Home
          </Link>
          <Link href="/search" className={`text-sm font-medium transition-colors hover:text-brand-primary ${pathname === '/search' ? 'text-brand-primary' : 'text-gray-600 dark:text-gray-300'}`}>
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
}
