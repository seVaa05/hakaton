import { createHash, randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { rateLimited, sameOrigin } from '@/lib/api-limit';

export const runtime = 'nodejs';

const COOKIE = 'student_visitor';
const voteSchema = z.object({ materialId: z.uuid(), vote: z.union([z.literal(1), z.literal(-1)]) }).strict();
const uuidSchema = z.uuid();

function visitor(request: NextRequest) {
  const existing = request.cookies.get(COOKIE)?.value;
  const token = existing && /^[0-9a-f]{64}$/.test(existing) ? existing : randomBytes(32).toString('hex');
  return { token, hash: createHash('sha256').update(token).digest('hex'), fresh: token !== existing };
}

function attachCookie(response: NextResponse, token: string, fresh: boolean) {
  if (fresh) response.cookies.set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax',
    path: '/', maxAge: 60 * 60 * 24 * 365,
  });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

async function summary(materialId: string, hash: string) {
  const admin = getSupabaseAdmin();
  const base = () => admin.from('material_votes').select('id', { count: 'exact', head: true }).eq('material_id', materialId);
  const [likes, dislikes, own] = await Promise.all([
    base().eq('vote', 1),
    base().eq('vote', -1),
    admin.from('material_votes').select('vote').eq('material_id', materialId).eq('visitor_hash', hash).maybeSingle(),
  ]);
  if (likes.error || dislikes.error || own.error) throw new Error('Vote summary unavailable');
  return { likes: likes.count ?? 0, dislikes: dislikes.count ?? 0, ownVote: own.data?.vote ?? null };
}

export async function GET(request: NextRequest) {
  const materialId = request.nextUrl.searchParams.get('materialId');
  if (!uuidSchema.safeParse(materialId).success) return error('Materijal nije ispravan.', 400);
  if (rateLimited(request, 'vote-read', 120, 3000, 60 * 60 * 1000)) return error('Previše zahteva. Pokušajte kasnije.', 429);
  const identity = visitor(request);
  try {
    const counts = await summary(materialId!, identity.hash);
    return attachCookie(NextResponse.json(counts), identity.token, identity.fresh);
  } catch {
    return error('Glasanje trenutno nije dostupno. Proverite SQL migraciju.', 503);
  }
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return error('Zahtev nije dozvoljen.', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return error('Očekuje se JSON.', 415);
  if (Number(request.headers.get('content-length') ?? 0) > 1024) return error('Zahtev je prevelik.', 413);
  if (rateLimited(request, 'vote', 30, 600, 60 * 60 * 1000)) return error('Previše glasova. Pokušajte kasnije.', 429);
  let input: z.infer<typeof voteSchema>;
  try {
    const raw = await request.text();
    if (raw.length > 1024) return error('Zahtev je prevelik.', 413);
    const parsed = voteSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return error('Glas nije ispravan.', 400);
    input = parsed.data;
  } catch {
    return error('Zahtev nije ispravan.', 400);
  }
  const identity = visitor(request);
  try {
    const admin = getSupabaseAdmin();
    const { data: material, error: materialError } = await admin.from('materials')
      .select('id').eq('id', input.materialId).maybeSingle();
    if (materialError) return error('Provera materijala nije uspela.', 502);
    if (!material) return error('Materijal ne postoji.', 404);
    const { error: voteError } = await admin.from('material_votes').upsert({
      material_id: input.materialId, visitor_hash: identity.hash, vote: input.vote,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'material_id,visitor_hash' });
    if (voteError) return error('Glas nije sačuvan. Proverite SQL migraciju.', 503);
    const counts = await summary(input.materialId, identity.hash);
    return attachCookie(NextResponse.json(counts), identity.token, identity.fresh);
  } catch {
    return error('Glasanje trenutno nije dostupno.', 503);
  }
}
