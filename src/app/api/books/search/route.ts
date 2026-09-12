import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const page = searchParams.get('page') || '1';
  const topic = searchParams.get('topic'); // e.g. 'c' for comics/manga

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  try {
    const topicQuery = topic ? `&topics%5B%5D=${topic}` : '';
    const response = await fetch(`https://libgen.li/index.php?req=${encodeURIComponent(title)}&page=${page}${topicQuery}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch from libgen');
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const results: any[] = [];
    
    $('table tbody tr').each((i, el) => {
      if (i === 0) return; // skip header
      const tds = $(el).find('td');
      if (tds.length < 8) return;
      
      const rawTitle = $(tds[0]).text().trim();
      const rawAuthor = $(tds[1]).text().trim();
      const publisher = $(tds[2]).text().trim();
      const year = $(tds[3]).text().trim();
      const language = $(tds[4]).text().trim();
      const pages = $(tds[5]).text().trim();
      const size = $(tds[6]).text().trim();
      const extension = $(tds[7]).text().trim();
      
      const mirrorHref = $(tds[8]).find('a').attr('href');
      let md5 = '';
      if (mirrorHref && mirrorHref.includes('md5=')) {
        md5 = mirrorHref.split('md5=')[1].split('&')[0];
      }
      
      if (!md5) return;
      
      const internalIdMatch = $(tds[0]).find('.badge-secondary').text().trim().match(/(?:c|f|s)\s+(\d+)/);
      const internalId = internalIdMatch ? parseInt(internalIdMatch[1], 10) : 0;
      
      let coverUrl = '';
      if (internalId && md5) {
        const bucket = Math.floor(internalId / 1000) * 1000;
        const typeBadge = $(tds[0]).find('.badge-secondary').text().trim().charAt(0);
        if (typeBadge === 'c') {
           coverUrl = `https://libgen.li/comicscovers/${bucket}/${md5}_small.jpg`;
        } else if (typeBadge === 'f') {
           coverUrl = `https://libgen.li/fictioncovers/${bucket}/${md5}_small.jpg`;
        } else {
           coverUrl = `https://libgen.li/covers/${bucket}/${md5}-d.jpg`; // standard covers usually end in -d or _small, we'll try -d.
        }
      }

      // Clean title if possible
      let cleanTitle = $(tds[0]).find('b a').first().text().trim();
      if (!cleanTitle) cleanTitle = rawTitle;

      results.push({
        id: md5,
        title: cleanTitle,
        author: rawAuthor,
        publisher,
        year,
        lang: language,
        pages,
        size,
        extension,
        md5,
        coverUrl
      });
    });
    
    // limit to 25 results
    return NextResponse.json(results.slice(0, 25));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch books from libgen' }, { status: 500 });
  }
}
