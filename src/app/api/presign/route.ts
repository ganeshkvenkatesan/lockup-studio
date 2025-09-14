import { NextResponse } from 'next/server';
import { presignKey } from '@/lib/s3';

// POST /api/presign  { key: 'path/to/object.jpg' }
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const key = body?.key;
    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'Missing key' }, { status: 400 });
    }

    const url = await presignKey(key);
    return NextResponse.json({ url });
  } catch (err) {
    console.error('Failed to presign key', err);
    return NextResponse.json({ error: 'Failed to presign key' }, { status: 500 });
  }
}
