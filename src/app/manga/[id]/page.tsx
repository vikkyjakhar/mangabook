'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function MangaDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [manga, setManga] = useState<any>(null);
  const [chapters, setChapters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        let mangaData;
        let chaptersData = [];

        if (/^\d+$/.test(id as string)) {
          // It's an AniList ID
          const { fetchAnilistMangaById } = await import('@/lib/anilist');
          const anilistManga = await fetchAnilistMangaById(parseInt(id as string));
          
          if (anilistManga) {
            const mTitle = anilistManga.title.english || anilistManga.title.romaji || 'Unknown';
            mangaData = {
              title: mTitle,
              description: anilistManga.description || '',
              coverUrl: anilistManga.coverImage?.large || '',
              tags: anilistManga.genres || []
            };

            // Cross-reference MangaDex for chapters
            try {
              const searchRes = await axios.get(`/api/manga/search?title=${encodeURIComponent(mTitle)}`);
              const foundMd = searchRes.data.data?.[0];
              if (foundMd) {
                const chaptersRes = await axios.get(`/api/manga/${foundMd.id}/feed`);
                chaptersData = chaptersRes.data.data || [];
              }
            } catch (e) {
              console.error('MangaDex cross-reference failed', e);
            }
          }
        } else {
          // It's a MangaDex ID
          const [mangaRes, chaptersRes] = await Promise.all([
            axios.get(`/api/manga/${id}`),
            axios.get(`/api/manga/${id}/feed`)
          ]);
          
          const m = mangaRes.data.data;
          const mTitle = m.attributes.title.en || Object.values(m.attributes.title)[0] || 'Unknown';
          const coverArt = m.relationships.find((r: any) => r.type === 'cover_art');
          const coverUrl = coverArt?.attributes?.fileName ? `https://uploads.mangadex.org/covers/${m.id}/${coverArt.attributes.fileName}.512.jpg` : '';

          mangaData = {
            title: mTitle,
            description: m.attributes.description?.en || '',
            coverUrl: coverUrl,
            tags: m.attributes.tags.map((t: any) => t.attributes.name.en)
          };
          
          chaptersData = chaptersRes.data.data || [];
        }
        
        setManga(mangaData);
        setChapters(chaptersData);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-brand-primary" /></div>;
  }

  if (!manga) {
    return <div className="p-8 text-center">Manga not found.</div>;
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <button onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="w-full md:w-1/3 lg:w-1/4">
          <img src={manga.coverUrl} alt={manga.title} className="w-full rounded-xl shadow-lg" />
        </div>
        
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold md:text-4xl">{manga.title}</h1>
          <div className="flex flex-wrap gap-2">
            {manga.tags.map((tag: string, i: number) => (
              <span key={i} className="rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-primary dark:bg-brand-secondary/40 dark:text-brand-secondary">
                {tag}
              </span>
            ))}
          </div>
          <p 
            className="whitespace-pre-line text-sm leading-relaxed text-gray-700 dark:text-gray-300"
            dangerouslySetInnerHTML={{ __html: manga.description }}
          />
        </div>
      </div>

      <div className="mt-12">
        <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="text-2xl font-bold">Chapters</h2>
          <div className="flex flex-wrap items-center gap-2 justify-end">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-1">Read all chapters on:</span>
            <a href={`https://mangakakalot.gg/search/story/${encodeURIComponent(manga.title.replace(/\s+/g, '_').toLowerCase())}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold transition-colors">
              MangaKakalot
            </a>
            <a href={`https://mangafire.to/filter?keyword=${encodeURIComponent(manga.title)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold transition-colors">
              MangaFire
            </a>
            <a href={`https://weebcentral.com/search?q=${encodeURIComponent(manga.title)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold transition-colors">
              Weeb Central
            </a>
            <a href={`https://hentai20.io/?s=${encodeURIComponent(manga.title)}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-primary/10 text-brand-primary hover:bg-brand-primary hover:text-white rounded-lg text-xs font-bold transition-colors">
              Hentai20
            </a>
          </div>
        </div>

        {chapters.length === 0 && (
          <div className="rounded-xl bg-orange-100 border border-brand-primary/30 p-8 text-center dark:bg-brand-primary/10 mb-8 mt-4">
            <h3 className="text-xl font-bold text-brand-primary mb-3">No chapters available on MangaBook</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This manga is either officially licensed or hasn't been uploaded to Our Provider. You can still read it by searching on the community sites below!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={`https://mangakakalot.gg/search/story/${encodeURIComponent(manga.title.replace(/\s+/g, '_').toLowerCase())}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary text-white hover:bg-orange-600 rounded-full font-bold shadow-md transition-transform hover:scale-105">
                Search MangaKakalot
              </a>
              <a href={`https://mangafire.to/filter?keyword=${encodeURIComponent(manga.title)}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary text-white hover:bg-orange-600 rounded-full font-bold shadow-md transition-transform hover:scale-105">
                Search MangaFire
              </a>
              <a href={`https://weebcentral.com/search?q=${encodeURIComponent(manga.title)}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary text-white hover:bg-orange-600 rounded-full font-bold shadow-md transition-transform hover:scale-105">
                Search Weeb Central
              </a>
              <a href={`https://hentai20.io/?s=${encodeURIComponent(manga.title)}`} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-brand-primary text-white hover:bg-orange-600 rounded-full font-bold shadow-md transition-transform hover:scale-105">
                Search Hentai20
              </a>
            </div>
          </div>
        )}

        {chapters.length > 0 && (
          <>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {chapters.filter((c: any) => !c.attributes.externalUrl).length > 0 ? chapters.filter((c: any) => !c.attributes.externalUrl).map((chapter: any) => {
                return (
                  <Link 
                    key={chapter.id} 
                    href={`/manga/read/${chapter.id}`}
                    className="flex items-center justify-between rounded-md border border-gray-200 p-4 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {chapter.attributes.chapter && chapter.attributes.chapter.toLowerCase().includes('chapter') 
                            ? chapter.attributes.chapter 
                            : `Chapter ${chapter.attributes.chapter || '?'}`}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{chapter.attributes.translatedLanguage}</span>
                  </Link>
                );
              }) : (
                <div className="col-span-full py-8 text-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">No direct chapters available.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Chapters for this manga are officially licensed and unavailable here.</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Please use the community search links above to read it!</p>
                </div>
              )}
            </div>
            
            {chapters.some((c: any) => c.attributes.externalUrl) && chapters.filter((c: any) => !c.attributes.externalUrl).length > 0 && (
              <div className="mt-6 p-4 bg-brand-light/50 dark:bg-brand-secondary/10 rounded-lg text-sm text-brand-primary dark:text-brand-secondary text-center">
                Note: Some chapters are officially licensed and have been hidden. Use the community search links above to find missing chapters.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
