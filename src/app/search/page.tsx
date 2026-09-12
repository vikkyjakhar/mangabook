'use client';

import { useState, useEffect, Suspense } from 'react';
import { Search as SearchIcon, Loader2 } from 'lucide-react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (p: number) => void }) {
  const startPage = Math.max(1, currentPage - 5);
  const endPage = Math.min(totalPages, startPage + 9);
  
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex flex-col items-center justify-center font-sans select-none pb-12">
      <div className="flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base">
        {currentPage > 1 && (
          <button 
            onClick={() => onPageChange(currentPage - 1)}
            className="rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
          >
            Previous
          </button>
        )}
        
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`rounded-md px-4 py-2 transition-colors ${
              p === currentPage 
                ? 'bg-brand-primary text-white font-medium shadow-sm' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white'
            }`}
          >
            {p}
          </button>
        ))}
        
        {currentPage < totalPages && (
          <button 
            onClick={() => onPageChange(currentPage + 1)}
            className="rounded-md px-3 py-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white transition-colors"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('q') || '';
  const initialTab = (searchParams.get('tab') as 'mangadex' | 'libgen' | 'all') || 'all';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<'mangadex' | 'libgen' | 'all'>(initialTab);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [mangaResults, setMangaResults] = useState<any[]>([]);
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [fallbackResults, setFallbackResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    // If we land on search page with a tab, we should trigger search even if query is empty to show trending
    setCurrentPage(initialPage);
    performSearch(initialQuery, initialTab, initialPage);
  }, [initialQuery, initialTab, initialPage]);

  const performSearch = async (searchQ: string, tab: 'mangadex' | 'libgen' | 'all', page: number) => {
    setLoading(true);
    setHasSearched(true);
    try {
      const promises: Promise<any>[] = [];
      
      // 1. Queue Manga Search
      if (tab === 'mangadex' || tab === 'all') {
        const isTrending = !searchQ.trim();
        
        const mangadexEndpoint = isTrending 
          ? `/api/manga/search?page=${page}` // We'd need to make sure this works, or just fallback to empty string search
          : `/api/manga/search?title=${searchQ}&page=${page}`;
          
        const anilistQuery = isTrending
          ? `query ($page: Int) { Page (page: $page, perPage: 15) { media (type: MANGA, sort: TRENDING_DESC) { id title { romaji english } coverImage { large } } } }`
          : `query ($search: String, $page: Int) { Page (page: $page, perPage: 15) { media (search: $search, type: MANGA) { id title { romaji english } coverImage { large } } } }`;

        promises.push(
          Promise.allSettled([
            axios.get(mangadexEndpoint),
            isTrending ? Promise.resolve({ data: [] }) : axios.get(`/api/books/search?title=${searchQ}&page=${page}&topic=c`),
            axios.post('https://graphql.anilist.co', {
              query: anilistQuery,
              variables: isTrending ? { page } : { search: searchQ, page }
            })
          ]).then(async ([mangadexRes, libgenComicRes, anilistRes]) => {
            const combined: any[] = [];
            let mPages = 1;

            if (anilistRes.status === 'fulfilled' && anilistRes.value.data?.data?.Page?.media) {
              const aData = anilistRes.value.data.data.Page.media;
              aData.forEach((m: any) => {
                const title = m.title.english || m.title.romaji || 'Unknown';
                combined.push({ source: 'anilist', id: m.id, title, coverUrl: m.coverImage?.large, url: `/manga/${m.id}` });
              });
            }

            if (mangadexRes.status === 'fulfilled' && mangadexRes.value.data) {
              const mData = mangadexRes.value.data.data || [];
              mData.forEach((m: any) => {
                const title = m.attributes?.title?.en || Object.values(m.attributes?.title || {})[0] || 'Unknown';
                const coverArt = m.relationships?.find((r: any) => r.type === 'cover_art');
                const coverFileName = coverArt?.attributes?.fileName;
                const rawCoverUrl = coverFileName ? `https://uploads.mangadex.org/covers/${m.id}/${coverFileName}.256.jpg` : '';
                const coverUrl = rawCoverUrl ? `/api/proxy?url=${encodeURIComponent(rawCoverUrl)}` : '';
                
                // Deduplicate if AniList already added it (naive dedupe by exact title match)
                if (!combined.some(c => c.title.toLowerCase() === title.toLowerCase())) {
                  combined.push({ source: 'mangadex', id: m.id, title, coverUrl, url: `/manga/${m.id}` });
                }
              });
              mPages = Math.ceil((mangadexRes.value.data.total || 0) / 20);
            }

            if (libgenComicRes.status === 'fulfilled' && libgenComicRes.value.data) {
              const lData = libgenComicRes.value.data || [];
              lData.forEach((b: any) => {
                combined.push({ source: 'libgen', id: b.id || b.md5, title: b.title, coverUrl: b.coverUrl, url: `https://libgen.li/get.php?md5=${b.md5}`, isExternal: true });
              });
            }

            setFallbackResults([]); // No longer needed since AniList is in main results
            setMangaResults(combined);
            return mPages;
          })
        );
      } else {
        setMangaResults([]);
        setFallbackResults([]);
      }

      // 2. Queue Book Search
      if (tab === 'libgen' || tab === 'all') {
        const isTrending = !searchQ.trim();
        if (isTrending) {
           setBookResults([]);
           promises.push(Promise.resolve(1));
        } else {
          promises.push(
            axios.get(`/api/books/search?title=${searchQ}&page=${page}`).then(res => {
              setBookResults(res.data || []);
              return (res.data && res.data.length === 25) ? Math.max(10, page + 2) : page;
            })
          );
        }
      } else {
        setBookResults([]);
      }

      const results = await Promise.all(promises);
      setTotalPages(Math.max(1, ...results.filter(r => typeof r === 'number')));

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${activeTab}&page=1`);
  };

  const handleTabChange = (tab: 'mangadex' | 'libgen' | 'all') => {
    setActiveTab(tab);
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}&tab=${tab}&page=1`);
    }
  };

  const handlePageChange = (page: number) => {
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${activeTab}&page=${page}`);
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col items-center">
        <h1 className="mb-4 text-3xl font-bold">Search</h1>
        
        <form onSubmit={handleSubmit} className="relative w-full max-w-5xl flex flex-col md:flex-row items-center rounded-[2rem] md:rounded-full border border-gray-300 bg-white p-2 shadow-sm transition-shadow focus-within:border-brand-primary focus-within:ring-2 focus-within:ring-brand-light dark:border-gray-700 dark:bg-gray-900 gap-2 md:gap-0">
          
          <div className="flex w-full flex-1 items-center px-2 md:px-4">
            <SearchIcon className="h-5 w-5 shrink-0 text-gray-400" />
            <input
              type="text"
              placeholder={`Search for ${activeTab === 'mangadex' ? 'manga' : activeTab === 'libgen' ? 'books' : 'manga and books'}...`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent px-4 py-3 outline-none dark:text-white"
            />
          </div>

          <div className="flex w-full md:w-auto shrink-0 items-center justify-between gap-2 md:gap-4 md:pr-1">
            <div className="flex flex-1 md:flex-none shrink-0 gap-1 rounded-full bg-gray-100 p-1 dark:bg-gray-800 items-center">
              <button
                type="button"
                onClick={() => handleTabChange('mangadex')}
                className={`flex-1 md:flex-none rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'mangadex' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-brand-light dark:text-gray-400 dark:hover:bg-brand-secondary/20'
                }`}
              >
                MangaDex
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('libgen')}
                className={`flex-1 md:flex-none rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'libgen' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-brand-light dark:text-gray-400 dark:hover:bg-brand-secondary/20'
                }`}
              >
                LibGen
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('all')}
                className={`flex-1 md:flex-none rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                  activeTab === 'all' ? 'bg-brand-primary text-white shadow-md' : 'text-gray-600 hover:bg-brand-light dark:text-gray-400 dark:hover:bg-brand-secondary/20'
                }`}
              >
                All
              </button>
            </div>

            <button 
              type="submit" 
              className="shrink-0 rounded-full bg-brand-primary px-8 py-3 text-sm font-bold text-white hover:bg-brand-secondary transition-colors h-full"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Search'}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {(activeTab === 'mangadex' || activeTab === 'all') && (
            <motion.div
              key="manga"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 mb-8"
            >
              {activeTab === 'all' && mangaResults.length > 0 && <h2 className="col-span-full text-2xl font-bold mb-4">{!query.trim() ? "Trending Manga" : "Manga Results"}</h2>}
              {mangaResults.map((manga) => {
                const inner = (
                  <>
                    <div className="aspect-[2/3] w-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                      {manga.coverUrl ? (
                        <img src={manga.coverUrl} alt={manga.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-gray-400">No Cover</div>
                      )}
                      {manga.source === 'libgen' && (
                        <span className="absolute top-2 right-2 bg-brand-primary text-white text-xs px-2 py-1 rounded shadow-md">LibGen</span>
                      )}
                      {manga.source === 'mangakakalot' && (
                        <span className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 rounded shadow-md">MangaKakalot</span>
                      )}
                      {manga.source === 'anilist' && (
                        <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded shadow-md">AniList</span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-2 text-sm font-semibold">{manga.title}</h3>
                    </div>
                  </>
                );

                return manga.isExternal ? (
                  <a href={manga.url} target="_blank" rel="noopener noreferrer" key={manga.id} className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1 dark:bg-gray-800 block">
                    {inner}
                  </a>
                ) : (
                  <Link href={manga.url} key={manga.id} className="group relative overflow-hidden rounded-lg bg-white shadow-md transition-transform hover:-translate-y-1 dark:bg-gray-800 block">
                    {inner}
                  </Link>
                );
              })}
            </motion.div>
          )}

          {(activeTab === 'libgen' || activeTab === 'all') && (
            <motion.div
              key="books"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col gap-4"
            >
              {activeTab === 'all' && bookResults.length > 0 && <h2 className="text-2xl font-bold mb-4 mt-8">LibGen Results</h2>}
              {bookResults.map((book) => (
                <div key={book.id || book.md5} className="flex flex-col gap-4 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800 sm:flex-row items-start">
                  {book.coverUrl && (
                    <div className="w-24 shrink-0 overflow-hidden rounded bg-gray-200 dark:bg-gray-700 sm:w-32">
                      <img src={book.coverUrl} alt={book.title} className="h-auto w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{book.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">By {book.author} • {book.year} • {book.extension}</p>
                    {book.descr && <p className="mt-2 line-clamp-2 text-sm text-gray-600 dark:text-gray-300" dangerouslySetInnerHTML={{ __html: book.descr }} />}
                  </div>
                  <div className="flex gap-2">
                     <a href={`https://libgen.li/get.php?md5=${book.md5}`} target="_blank" rel="noopener noreferrer" className="rounded bg-brand-light px-4 py-2 text-sm font-medium text-brand-primary hover:bg-blue-200 dark:bg-brand-secondary/30 dark:text-brand-secondary">Download</a>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Empty State / Fallback */}
        {!loading && hasSearched && ((activeTab === 'mangadex' && mangaResults.length === 0) || (activeTab === 'libgen' && bookResults.length === 0) || (activeTab === 'all' && mangaResults.length === 0 && bookResults.length === 0)) ? (
          <div className="mt-12">
            <div className="text-center text-gray-500 mb-8">
              We couldn't find "{query}" in our database.
            </div>
            
            {(activeTab === 'mangadex' || activeTab === 'all') && query && (
              <div className="mt-8 border-t border-gray-200 dark:border-gray-800 pt-8">
                <h3 className="text-xl font-bold mb-2">Try searching on external sites</h3>
                <p className="text-gray-500 mb-6">Click a button below to search directly on these community sites:</p>
                
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  <a href={`https://mangakakalot.gg/search/story/${encodeURIComponent(query.replace(/\s+/g, '_').toLowerCase())}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-light transition-colors font-medium">Search MangaKakalot</a>
                  <a href={`https://mangafire.to/filter?keyword=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-light transition-colors font-medium">Search MangaFire</a>
                  <a href={`https://weebcentral.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-light transition-colors font-medium">Search Weeb Central</a>
                  <a href={`https://mangago.me/r/l_search/?name=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-light transition-colors font-medium">Search Mangago</a>
                </div>
              </div>
            )}
          </div>
        ) : (
          hasSearched && !loading && (
            <>
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={handlePageChange} 
              />
              
              {(activeTab === 'mangadex' || activeTab === 'all') && query && (
                <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8 text-center pb-8">
                  <h3 className="text-lg font-bold mb-4">Didn't find exactly what you were looking for?</h3>
                  <p className="text-sm text-gray-500 mb-4">Try searching directly on these community sites:</p>
                  <div className="flex flex-wrap justify-center gap-3">
                    <a href={`https://mangakakalot.gg/search/story/${encodeURIComponent(query.replace(/\s+/g, '_').toLowerCase())}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-light transition-colors text-sm font-medium">MangaKakalot</a>
                    <a href={`https://mangafire.to/filter?keyword=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-light transition-colors text-sm font-medium">MangaFire</a>
                    <a href={`https://weebcentral.com/search?q=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-light transition-colors text-sm font-medium">Weeb Central</a>
                    <a href={`https://mangago.me/r/l_search/?name=${encodeURIComponent(query)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-primary/10 text-brand-primary rounded-full hover:bg-brand-primary hover:text-brand-light transition-colors text-sm font-medium">Mangago</a>
                  </div>
                </div>
              )}
            </>
          )
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto" /></div>}>
      <SearchContent />
    </Suspense>
  )
}

