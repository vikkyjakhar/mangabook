import { NextResponse } from 'next/server';

const MANGADEX_API_URL = 'https://api.mangadex.org';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get('title');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const contentRatings = '&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic';
    const url = title 
      ? `${MANGADEX_API_URL}/manga?title=${title}&includes[]=cover_art&limit=${limit}&offset=${offset}${contentRatings}`
      : `${MANGADEX_API_URL}/manga?includes[]=cover_art&limit=${limit}&offset=${offset}&order[rating]=desc${contentRatings}`;
      
    const response = await fetch(url, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Mangadex API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch manga' }, { status: 500 });
  }
}
