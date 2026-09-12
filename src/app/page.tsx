'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [trendingManga, setTrendingManga] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const anilistRes = await import('@/lib/anilist').then(mod => mod.fetchAnilistTopManga(1, 10));

        const combinedResults: any[] = [];
        
        if (anilistRes && Array.isArray(anilistRes)) {
          anilistRes.forEach((m: any) => {
             const title = m.title?.english || m.title?.romaji || 'Unknown';
             combinedResults.push({
               source: 'anilist',
               id: m.id,
               title,
               coverUrl: m.coverImage?.large || '',
               url: `/manga/${m.id}`
             });
          });
        }
        
        setTrendingManga(combinedResults);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrending();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const genres = ['Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Horror', 'Comedy', 'Slice of Life', 'Drama', 'Hentai', 'Ecchi', 'Isekai', 'Thriller'];

  const topSites = [
    { "name": "Comix", "url": "https://comix.to/", "icon": "https://static.everythingmoe.com/icons/comix.png" },
    { "name": "Mangadotnet", "url": "https://mangadot.net/", "icon": "https://static.everythingmoe.com/icons/mangadotnet.png" },
    { "name": "Atsumaru", "url": "https://atsu.moe/", "icon": "https://static.everythingmoe.com/icons/atsu.png" },
    { "name": "Mangaball", "url": "https://mangaball.net/", "icon": "https://static.everythingmoe.com/icons/mangaball.png" },
    { "name": "OniSaga", "url": "https://onisaga.com/", "icon": "https://static.everythingmoe.com/icons/onisaga.png" },
    { "name": "MangaFire", "url": "https://mangafire.to/home", "icon": "https://static.everythingmoe.com/icons/mangaf.png" },
    { "name": "Weeb Central", "url": "https://weebcentral.com/", "icon": "https://static.everythingmoe.com/icons/weebcentral.png" },
    { "name": "Mangago", "url": "https://www.mangago.me/", "icon": "https://static.everythingmoe.com/icons/mangago.png" },
    { "name": "MKissa Manga", "url": "https://mkissa.to/manga", "icon": "https://static.everythingmoe.com/icons/mkissa.png" },
    { "name": "Bookwalker", "url": "https://bookwalker.com/", "icon": "https://static.everythingmoe.com/icons/bookwalker.png" }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      
      {/* Hero Section with Search */}
      <div className="w-full bg-brand-primary px-4 py-16 text-center text-white dark:bg-[#201311]">
        <h1 className="mb-4 text-4xl font-extrabold md:text-6xl">
          Your Ultimate Reading Hub
        </h1>
        <p className="mb-8 text-lg text-brand-light md:text-xl">
          Discover thousands of manga and books instantly.
        </p>
        
        <form onSubmit={handleSearch} className="mx-auto flex max-w-2xl items-center rounded-full bg-white p-2 shadow-lg dark:bg-gray-800">
          <Search className="ml-4 h-6 w-6 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search for manga, books, authors..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent px-4 py-3 text-gray-900 focus:outline-none dark:text-white"
          />
          <button type="submit" className="rounded-full bg-brand-primary px-6 py-3 font-semibold text-white hover:bg-brand-secondary">
            Search
          </button>
        </form>
      </div>

      {/* Trending Manga Section */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-brand-primary" /> Trending Manga
          </h2>
          <Link href="/search?tab=all" className="text-brand-primary hover:underline">View All</Link>
        </div>
        
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingManga.map((manga) => {
              const inner = (
                <>
                  <div className="aspect-[2/3] w-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative">
                    {manga.coverUrl ? (
                      <img src={manga.coverUrl} alt={manga.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-gray-400 text-sm">No Cover</div>
                    )}
                    {manga.source === 'libgen' && (
                      <span className="absolute top-2 right-2 bg-brand-primary text-white text-xs px-2 py-1 rounded shadow-md">LibGen</span>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{manga.title}</h3>
                  </div>
                </>
              );

              return manga.isExternal ? (
                <a href={manga.url} target="_blank" rel="noopener noreferrer" key={manga.id} className="group block overflow-hidden rounded-lg bg-white shadow transition-transform hover:-translate-y-1 dark:bg-gray-800">
                  {inner}
                </a>
              ) : (
                <Link href={manga.url} key={manga.id} className="group block overflow-hidden rounded-lg bg-white shadow transition-transform hover:-translate-y-1 dark:bg-gray-800">
                  {inner}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Reading Sites (EverythingMoe) */}
      <div className="container mx-auto max-w-6xl px-4 py-8 mb-4">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Top Free Manga Reading Sites
          </h2>
          <p className="text-gray-500 mt-1">Recommended by <a href="https://everythingmoe.com/" target="_blank" rel="noopener noreferrer" className="text-brand-primary hover:underline">EverythingMoe</a></p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {topSites.map(site => (
            <a 
              href={site.url} 
              key={site.name} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm border border-gray-100 transition-transform hover:-translate-y-1 hover:shadow-md dark:bg-gray-800 dark:border-gray-700"
            >
              <img src={site.icon} alt={site.name} className="h-8 w-8 rounded-full bg-gray-100" />
              <span className="font-semibold text-gray-800 dark:text-gray-200 line-clamp-1">{site.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Genres Section */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">Explore Genres</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {genres.map(genre => (
            <Link href={`/search?q=${genre}`} key={genre} className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary p-4 text-center text-xl font-bold text-white shadow-md transition-transform hover:scale-105">
              {genre}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Books Section */}
      <div className="container mx-auto max-w-6xl px-4 py-12 mb-12">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular Book Topics</h2>
          <Link href="/search?tab=books" className="text-brand-primary hover:underline">Search Books</Link>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {['Computer Science', 'Science Fiction', 'Self Help', 'History', 'Philosophy', 'Business'].map(topic => (
            <Link href={`/search?q=${topic}&tab=books`} key={topic} className="flex items-center justify-between rounded-lg bg-white p-6 shadow-sm border border-gray-100 transition-colors hover:border-brand-primary dark:bg-gray-800 dark:border-gray-700 dark:hover:border-brand-secondary">
              <span className="text-lg font-semibold text-gray-800 dark:text-gray-200">{topic}</span>
              <BookOpen className="h-5 w-5 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
