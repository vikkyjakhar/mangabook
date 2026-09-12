import { NextResponse } from 'next/server';

const MANGADEX_API_URL = 'https://api.mangadex.org';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const offset = searchParams.get('offset') || '0';

  try {
    const contentRatings = '&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic';
    const response = await fetch(`${MANGADEX_API_URL}/manga/${id}/feed?translatedLanguage[]=en&order[chapter]=desc&limit=500&offset=${offset}${contentRatings}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Mangadex API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch manga chapters feed' }, { status: 500 });
  }
}
