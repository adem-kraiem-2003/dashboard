/**
 * Next.js API route that proxies multipart file uploads to the NestJS backend.
 *
 * WHY this exists instead of using next.config.js rewrites:
 * Next.js 14+ can consume or lose the multipart request body when proxying via
 * rewrites(), resulting in multer receiving an empty buffer on the NestJS side.
 * This route handler explicitly reads the raw body and re-sends it using
 * Node.js `http.request()` (req.end(buffer)) which is the most reliable way
 * to forward binary data in Node.js.
 */
export const runtime = 'nodejs';

import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import * as http from 'node:http';
import * as https from 'node:https';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:3001';

// Headers that must not be forwarded between proxies
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailers',
  'transfer-encoding',
  'upgrade',
  'host',
]);

interface ProxyResult {
  status: number;
  body: string;
  contentType: string;
}

function proxyToBackend(
  targetUrl: string,
  method: string,
  headers: Record<string, string>,
  body: Buffer,
): Promise<ProxyResult> {
  return new Promise((resolve, reject) => {
    const u = new URL(targetUrl);
    const isHttps = u.protocol === 'https:';
    const transport = isHttps ? https : http;

    const req = transport.request(
      {
        hostname: u.hostname,
        port: u.port ? parseInt(u.port, 10) : isHttps ? 443 : 80,
        path: u.pathname + (u.search || ''),
        method,
        headers: body.length > 0
          ? { ...headers, 'content-length': String(body.length) }
          : headers,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 500,
            body: Buffer.concat(chunks).toString('utf8'),
            contentType: (res.headers['content-type'] as string) ?? 'application/json',
          });
        });
      },
    );

    req.on('error', reject);
    req.end(body);
  });
}

function buildForwardHeaders(request: NextRequest): Record<string, string> {
  const out: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    if (!HOP_BY_HOP.has(key.toLowerCase())) {
      out[key] = value;
    }
  });
  return out;
}

// ── POST — file uploads (product-image, category-image) ──────────────────────

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const targetUrl = `${BACKEND_URL}/upload/${path.join('/')}`;

  // Read the raw multipart body into a Buffer so we can forward it verbatim.
  // request.arrayBuffer() gives us the exact bytes the browser sent, including
  // multipart boundaries — multer on the NestJS side parses them correctly.
  const bodyBuffer = Buffer.from(await request.arrayBuffer());
  const headers = buildForwardHeaders(request);

  let result: ProxyResult;
  try {
    result = await proxyToBackend(targetUrl, 'POST', headers, bodyBuffer);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: `Proxy error: ${msg}` }, { status: 502 });
  }

  return new NextResponse(result.body, {
    status: result.status,
    headers: { 'content-type': result.contentType },
  });
}

// ── DELETE — product image deletion ──────────────────────────────────────────

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const targetUrl = `${BACKEND_URL}/upload/${path.join('/')}`;
  const headers = buildForwardHeaders(request);

  let result: ProxyResult;
  try {
    result = await proxyToBackend(targetUrl, 'DELETE', headers, Buffer.alloc(0));
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ message: `Proxy error: ${msg}` }, { status: 502 });
  }

  return new NextResponse(result.body, {
    status: result.status,
    headers: { 'content-type': result.contentType },
  });
}
