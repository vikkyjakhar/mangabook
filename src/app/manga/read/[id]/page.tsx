'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MangaReaderPage() {
  const { id } = useParams();
  const router = useRouter();
  const [pages, setPages] = useState<string[]>([]);
  const [baseUrl, setBaseUrl] = useState('');
  const [hash, setHash] = useState('');
  const [loading, setLoading] = useState(true);
  const [prevChapterId, setPrevChapterId] = useState<string | null>(null);
  const [nextChapterId, setNextChapterId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState<string>('');
  const [mangaId, setMangaId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChapterPages() {
      try {
        const res = await axios.get(`/api/manga/chapter/${id}?t=${Date.now()}`);
        const data = res.data;
        setBaseUrl(data.baseUrl);
        setHash(data.chapter?.hash || '');
        setPages(data.chapter?.data || []);
        setPrevChapterId(data.prevChapterId || null);
        setNextChapterId(data.nextChapterId || null);
        setChapterTitle(data.chapterTitle || '');
        setMangaId(data.mangaId || null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchChapterPages();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
      </div>
    );
  }

  if (pages.length === 0) {
    return <div className="p-8 text-center text-white">No pages found.</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-300 relative">
      <div className="sticky top-0 z-50 flex items-center justify-between bg-black/80 px-4 py-3 backdrop-blur-sm border-b border-gray-800 shadow-xl">
        <button 
          onClick={() => mangaId ? router.push(`/manga/${mangaId}`) : router.back()} 
          className="flex items-center gap-2 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Back to details
        </button>
        <div className="text-sm font-semibold text-center flex-1 mx-4">
          {chapterTitle} <span className="text-gray-500 font-normal ml-2">({pages.length} Pages)</span>
        </div>
        <div className="w-32 flex justify-end gap-2 text-sm">
          {prevChapterId && (
            <Link href={`/manga/read/${prevChapterId}`} className="hover:text-white px-2 py-1 bg-gray-900 rounded border border-gray-800 hidden sm:block">Prev</Link>
          )}
          {nextChapterId && (
            <Link href={`/manga/read/${nextChapterId}`} className="hover:text-white px-2 py-1 bg-gray-900 rounded border border-gray-800 hidden sm:block">Next</Link>
          )}
        </div>
      </div>

      {/* Floating Side Navigation */}
      {prevChapterId && (
        <Link 
          href={`/manga/read/${prevChapterId}`}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 hidden sm:flex h-full w-24 items-center justify-start pl-4 opacity-30 hover:opacity-100 transition-opacity"
          title="Previous Chapter"
        >
          <div className="bg-black/50 p-3 rounded-full backdrop-blur-md border border-gray-800 text-white shadow-2xl">
            <ChevronLeft className="h-8 w-8" />
          </div>
        </Link>
      )}

      {nextChapterId && (
        <Link 
          href={`/manga/read/${nextChapterId}`}
          className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden sm:flex h-full w-24 items-center justify-end pr-4 opacity-30 hover:opacity-100 transition-opacity"
          title="Next Chapter"
        >
          <div className="bg-black/50 p-3 rounded-full backdrop-blur-md border border-gray-800 text-white shadow-2xl">
            <ChevronRight className="h-8 w-8" />
          </div>
        </Link>
      )}

      {/* Mobile Navigation Footer */}
      <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-between px-4 sm:hidden pointer-events-none">
        {prevChapterId ? (
          <Link href={`/manga/read/${prevChapterId}`} className="pointer-events-auto bg-black/80 backdrop-blur-md border border-gray-800 text-white shadow-2xl rounded-full p-3 flex items-center justify-center">
            <ChevronLeft className="h-6 w-6" />
          </Link>
        ) : <div />}
        {nextChapterId ? (
          <Link href={`/manga/read/${nextChapterId}`} className="pointer-events-auto bg-black/80 backdrop-blur-md border border-gray-800 text-white shadow-2xl rounded-full p-3 flex items-center justify-center">
            <ChevronRight className="h-6 w-6" />
          </Link>
        ) : <div />}
      </div>

      <div className="flex flex-col items-center justify-center py-8 bg-[#0a0a0a]">
        {pages.map((page, index) => {
          const rawImageUrl = `${baseUrl}/data/${hash}/${page}`;
          const imageUrl = `/api/proxy?url=${encodeURIComponent(rawImageUrl)}`;
          return (
            <div key={page} className="w-full max-w-4xl flex justify-center mb-0">
              <img 
                src={imageUrl} 
                alt={`Page ${index + 1}`} 
                className="w-full h-auto object-contain"
                loading="lazy"
                style={{ display: 'block', margin: 0, padding: 0 }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
