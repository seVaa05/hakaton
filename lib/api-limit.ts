import 'server-only';
import { NextRequest } from 'next/server';

const windows = new Map<string, number[]>();

export function rateLimited(request: NextRequest, action: string, perIp: number, globalMax: number, windowMs: number) {
  const now = Date.now();
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const keys = [`${action}:ip:${ip}`, `${action}:global`];
  for (const [key, times] of windows) {
    const recent = times.filter(time => now - time < windowMs);
    if (recent.length) windows.set(key, recent);
    else windows.delete(key);
  }
  if ((windows.get(keys[0])?.length ?? 0) >= perIp ||
      (windows.get(keys[1])?.length ?? 0) >= globalMax) return true;
  for (const key of keys) windows.set(key, [...(windows.get(key) ?? []), now]);
  return false;
}

export function sameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  return !origin || origin === request.nextUrl.origin;
}
