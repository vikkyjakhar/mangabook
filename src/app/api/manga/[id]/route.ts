export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const MANGADEX_API_URL = 'https://api.mangadex.org';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const response = await fetch(`${MANGADEX_API_URL}/manga/${id}?includes[]=cover_art&includes[]=author&includes[]=artist`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`Mangadex API error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch manga details' }, { status: 500 });
  }
}
