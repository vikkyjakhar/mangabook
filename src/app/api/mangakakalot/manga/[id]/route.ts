import { NextResponse } from 'next/server';
import mangakakalot from '@/lib/mangakakalot';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const data = await mangakakalot.chapterInfo(id);
    return NextResponse.json(data);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch manga chapters from MangaKakalot' }, { status: 500 });
  }
}
