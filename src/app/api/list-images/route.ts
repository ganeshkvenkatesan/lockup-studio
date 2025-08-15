import { list } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { blobs } = await list();

    const filesByFolder = blobs
      .filter((blob) => !blob.pathname.endsWith('/'))
      .reduce((acc, blob) => {
      const folder = blob.pathname.split('/')[0];
      if (!acc[folder]) {
        acc[folder] = [];
      }
      acc[folder].push(blob);
      return acc;
    }, {} as Record<string, typeof blobs>);

    return NextResponse.json(filesByFolder);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    );
  }
}
