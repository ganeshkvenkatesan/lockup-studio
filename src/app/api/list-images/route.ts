import { NextResponse } from 'next/server';
import { initS3Cache, getCachedImages } from '@/lib/s3';

// GET /api/list-images?orientation=landscape|portrait
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const orientation = url.searchParams.get('orientation') || undefined;
    const prefix = orientation ? `${orientation}/` : '';
    // Ensure the server cache is initialized (this will no-op if already populated)
    await initS3Cache();

    const cached = getCachedImages(prefix);
    if (!cached) {
      // No cache available yet; return an empty response so the frontend can handle loading state.
      return NextResponse.json({});
    }

    return NextResponse.json(cached);
  } catch (error) {
    console.error('Failed to list S3 images', error);
    return NextResponse.json({ error: 'Failed to list images' }, { status: 500 });
  }
}
