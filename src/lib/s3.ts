import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
  _Object,
  ListObjectsV2CommandInput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const REGION = process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1';
const BUCKET = process.env.S3_BUCKET || process.env.NEXT_PUBLIC_S3_BUCKET;
const PRESIGN_EXPIRATION = process.env.PRESIGN_EXPIRATION ? parseInt(process.env.PRESIGN_EXPIRATION, 10) : 900;

const S3_ENDPOINT = process.env.S3_ENDPOINT || process.env.NEXT_PUBLIC_S3_ENDPOINT;
const S3_FORCE_PATH_STYLE = (process.env.S3_FORCE_PATH_STYLE || process.env.NEXT_PUBLIC_S3_FORCE_PATH_STYLE) === 'true';

if (!BUCKET) {
  // Keep import-time safe. Throw when functions are used.
}

let _cachedClient: S3Client | null = null;

function makeClient(opts?: { forceNoEndpoint?: boolean }) {
  // Memoize the client for the process.
  if (_cachedClient && !opts?.forceNoEndpoint) return _cachedClient;

  const cfg: S3ClientConfigLike = { region: REGION };
  if (S3_FORCE_PATH_STYLE) cfg.forcePathStyle = true;

  if (S3_ENDPOINT && !opts?.forceNoEndpoint) cfg.endpoint = S3_ENDPOINT;

  const client = new S3Client(cfg);
  if (!opts?.forceNoEndpoint) _cachedClient = client;
  return client;
}

type S3ClientConfigLike = {
  region: string;
  endpoint?: string;
  forcePathStyle?: boolean;
};

function constructPublicUrl(key: string) {
  // Fallback direct URL when presign is not available.
  if (S3_ENDPOINT) {
    // If a custom endpoint is provided, assume it can serve objects at the given path.
    return `${S3_ENDPOINT.replace(/\/$/, '')}/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
  }

  // Default S3 virtual-hosted style URL
  // e.g. https://{bucket}.s3.{region}.amazonaws.com/{key}
  return `https://${BUCKET}.s3.${REGION}.amazonaws.com/${encodeURIComponent(key).replace(/%2F/g, '/')}`;
}

export async function listS3Objects(prefix?: string) {
  if (!BUCKET) throw new Error('S3_BUCKET is not configured');

  const params: ListObjectsV2CommandInput = {
    Bucket: BUCKET,
    Prefix: prefix || '',
  };

  // Try with configured client first. If the custom endpoint is unreachable (ENOTFOUND),
  // retry with a client that doesn't set the endpoint so the SDK uses the regional S3 endpoint.
  let client = makeClient();
  const command = new ListObjectsV2Command(params);
  try {
    const resp = await client.send(command);
    return (resp.Contents as (_Object | undefined)[]) || [];
  } catch (err: unknown) {
    // Detect DNS resolution error and retry without endpoint.
    const e = err as { code?: string; errno?: number } | undefined;
    const isDnsErr = e && (e.code === 'ENOTFOUND' || e.errno === -3008 || String(err).includes('ENOTFOUND'));
    if (isDnsErr && S3_ENDPOINT) {
      console.warn('S3 endpoint not found, retrying with default AWS endpoint');
      client = makeClient({ forceNoEndpoint: true });
      const resp = await client.send(command);
      return (resp.Contents as (_Object | undefined)[]) || [];
    }
    throw err;
  }
}

export async function presignKey(key: string) {
  if (!BUCKET) throw new Error('S3_BUCKET is not configured');

  // Try to presign using a client configured the normal way. If presign fails due to endpoint
  // DNS resolution, or any other error, fall back to returning a constructed public URL.
  try {
    const client = makeClient();
    const cmd = new GetObjectCommand({ Bucket: BUCKET!, Key: key });
    return await getSignedUrl(client, cmd, { expiresIn: PRESIGN_EXPIRATION });
  } catch (err: unknown) {
    const e = err as { code?: string; errno?: number } | undefined;
    const isDnsErr = e && (e.code === 'ENOTFOUND' || e.errno === -3008 || String(err).includes('ENOTFOUND'));
    if (isDnsErr && S3_ENDPOINT) {
      // Try once more without the custom endpoint
      try {
        const client = makeClient({ forceNoEndpoint: true });
        const cmd = new GetObjectCommand({ Bucket: BUCKET!, Key: key });
        return await getSignedUrl(client, cmd, { expiresIn: PRESIGN_EXPIRATION });
      } catch (e) {
        console.warn('presign failed after retry, falling back to public URL', e);
        return constructPublicUrl(key);
      }
    }

    // For other errors just return a constructed public URL as a best-effort fallback.
    console.warn('presignKey failed, returning public URL fallback', err);
    return constructPublicUrl(key);
  }
}

export type { _Object };

// --- In-memory cache for startup population -------------------------------------------------
type ImageItem = { pathname: string; url: string };
type ImagesByGroup = Record<string, ImageItem[]>;

let s3Cache: { ts: number; data: ImagesByGroup } | null = null;
const CACHE_REFRESH_BEFORE_EXP_MS = 60 * 1000; // refresh 60s before presign expiration

async function buildFullCache() {
  if (!BUCKET) throw new Error('S3_BUCKET is not configured');

  // list all objects (no prefix) and presign them
  const contents = await listS3Objects();
  const files = contents.filter((item: _Object | undefined): item is _Object => !!item && !!item.Key && !item.Key.endsWith('/'));

  const grouped: ImagesByGroup = {};
  await Promise.all(
    files.map(async (f) => {
      const key = f.Key!;
      const parts = key.split('/');
      const group = parts[0] || 'root';
      const url = await presignKey(key);
      if (!grouped[group]) grouped[group] = [];
      grouped[group].push({ pathname: key, url });
    })
  );

  s3Cache = { ts: Date.now(), data: grouped };
  // schedule a refresh slightly before presign expiry
  scheduleRefresh();
}

let refreshTimer: NodeJS.Timeout | null = null;

function scheduleRefresh() {
  if (refreshTimer) clearTimeout(refreshTimer);
  // presigned urls expire in PRESIGN_EXPIRATION seconds; refresh slightly before that.
  const ms = Math.max(1000, PRESIGN_EXPIRATION * 1000 - CACHE_REFRESH_BEFORE_EXP_MS);
  refreshTimer = setTimeout(() => {
    // fire and forget
    buildFullCache().catch((e) => console.error('Failed to refresh s3 cache', e));
  }, ms);
}

export async function initS3Cache() {
  // allow multiple callers but only build once
  if (s3Cache) return s3Cache;
  await buildFullCache();
  return s3Cache!;
}

export function getCachedImages(prefix?: string) {
  if (!s3Cache) return null;
  if (!prefix) return s3Cache.data;

  // When a prefix is provided (e.g., 'landscape/'), we want to return groups that are the
  // subfolders under that prefix (e.g., 'outdoor', 'reception'), not the top-level 'landscape'
  // folder. Iterate all cached items and group by the second path segment.
  const result: ImagesByGroup = {};
  for (const g of Object.keys(s3Cache.data)) {
    for (const it of s3Cache.data[g]) {
      if (!it.pathname.startsWith(prefix)) continue;
      const parts = it.pathname.split('/');
      // parts[0] is the orientation; parts[1] should be the category
      const category = parts[1] || parts[0] || 'root';
      if (!result[category]) result[category] = [];
      result[category].push(it);
    }
  }
  return result;
}

export async function refreshS3CacheNow() {
  await buildFullCache();
  return s3Cache!;
}
