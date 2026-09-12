import { NextResponse } from 'next/server';

const MANGADEX_API_URL = 'https://api.mangadex.org';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    // 1. Fetch chapter pages
    const atHomeRes = await fetch(`${MANGADEX_API_URL}/at-home/server/${id}`);
    if (!atHomeRes.ok) throw new Error(`Mangadex API error: ${atHomeRes.status}`);
    const atHomeData = await atHomeRes.json();

    // 2. Fetch chapter metadata to get the Manga ID and language
    const chapterRes = await fetch(`${MANGADEX_API_URL}/chapter/${id}?includes[]=manga`);
    if (!chapterRes.ok) throw new Error(`Mangadex API error: ${chapterRes.status}`);
    const chapterData = await chapterRes.json();
    
    const mangaId = chapterData.data?.relationships?.find((r: any) => r.type === 'manga')?.id;
    const lang = chapterData.data?.attributes?.translatedLanguage || 'en';

    let prevChapterId = null;
    let nextChapterId = null;
    let chapterTitle = `Chapter ${chapterData.data?.attributes?.chapter || '?'}`;

    if (mangaId) {
      // 3. Fetch all chapters for this manga in the same language to find prev/next
      const feedRes = await fetch(`${MANGADEX_API_URL}/manga/${mangaId}/feed?translatedLanguage[]=${lang}&order[chapter]=asc&limit=500&includeExternalUrl=0`);
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        const chapters = feedData.data || [];
        
        // Filter out external URLs (like we do in the frontend)
        const playableChapters = chapters.filter((c: any) => !c.attributes.externalUrl);
        
        const currentIndex = playableChapters.findIndex((c: any) => c.id === id);
        if (currentIndex > 0) {
          prevChapterId = playableChapters[currentIndex - 1].id;
        }
        if (currentIndex !== -1 && currentIndex < playableChapters.length - 1) {
          nextChapterId = playableChapters[currentIndex + 1].id;
        }
      }
    }

    return NextResponse.json({
      ...atHomeData,
      prevChapterId,
      nextChapterId,
      chapterTitle,
      mangaId
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch chapter data' }, { status: 500 });
  }
}
