export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import mangakakalot from '@/lib/mangakakalot';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const page = searchParams.get('page') || '1';

  try {
    if (title) {
      // Spaces must be converted to underscores for mangakakalot search
      const query = title.replace(/\s+/g, '_').toLowerCase();
      const data = await mangakakalot.search(query, page);
      return NextResponse.json(data);
    } else {
      const data = await mangakakalot.latestManga(page);
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch manga from Mangakakalot' }, { status: 500 });
  }
}
