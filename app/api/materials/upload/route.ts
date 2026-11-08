import { randomUUID } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

export const runtime = 'nodejs';

const MAX_FILE_BYTES = 20 * 1024 * 1024;
const MAX_BODY_BYTES = MAX_FILE_BYTES + 64 * 1024;
const WINDOW_MS = 30 * 60 * 1000;
const MAX_PER_IP = 3;
const MAX_GLOBAL = 12;
const attempts = new Map<string, number[]>();
let activeUploads = 0;

const fields = z.object({
  subjectId: z.uuid(),
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000),
});

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function isLimited(ip: string) {
  const now = Date.now();
  for (const [key, timestamps] of attempts) {
    const recent = timestamps.filter(time => now - time < WINDOW_MS);
    if (recent.length) attempts.set(key, recent);
    else attempts.delete(key);
  }
  const ipKey = `ip:${ip}`;
  const own = attempts.get(ipKey) ?? [];
  const all = attempts.get('global') ?? [];
  if (own.length >= MAX_PER_IP || all.length >= MAX_GLOBAL) return true;
  attempts.set(ipKey, [...own, now]);
  attempts.set('global', [...all, now]);
  return false;
}

async function readBoundedBody(request: NextRequest) {
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (origin && origin !== request.nextUrl.origin) return jsonError('Zahtev nije dozvoljen.', 403);
  if (!(request.headers.get('content-type') ?? '').toLowerCase().startsWith('multipart/form-data;')) {
    return jsonError('Očekuje se obrazac sa PDF datotekom.', 415);
  }
  const contentLength = Number(request.headers.get('content-length'));
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return jsonError('PDF ne sme biti veći od 20 MB.', 413);
  }
  if (activeUploads >= 2) return jsonError('Server je zauzet. Pokušajte uskoro.', 429);
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isLimited(ip)) return jsonError('Previše otpremanja. Pokušajte kasnije.', 429);

  activeUploads++;
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secret = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secret) return jsonError('Otpremanje trenutno nije podešeno.', 503);

    const body = await readBoundedBody(request);
    if (!body) return jsonError('PDF ne sme biti veći od 20 MB.', 413);
    let form: FormData;
    try {
      form = await new Request(request.url, {
        method: 'POST',
        headers: { 'content-type': request.headers.get('content-type')! },
        body,
      }).formData();
    } catch {
      return jsonError('Obrazac nije ispravan.', 400);
    }
    const parsed = fields.safeParse({
      subjectId: form.get('subjectId'),
      title: form.get('title'),
      description: form.get('description'),
    });
    if (!parsed.success) return jsonError('Proverite predmet, naslov i opis.', 400);

    const file = form.get('file');
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_FILE_BYTES ||
        file.type !== 'application/pdf' || !file.name.toLowerCase().endsWith('.pdf')) {
      return jsonError('Izaberite PDF datoteku veličine do 20 MB.', 400);
    }
    const bytes = new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.subarray(0, 5)) !== '%PDF-') {
      return jsonError('Datoteka nije ispravan PDF.', 400);
    }

    const supabase = createClient(url, secret, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data: subject, error: subjectError } = await supabase
      .from('subjects').select('id').eq('id', parsed.data.subjectId).maybeSingle();
    if (subjectError) return jsonError('Provera predmeta nije uspela.', 502);
    if (!subject) return jsonError('Izabrani predmet ne postoji.', 400);

    const storagePath = `uploads/${randomUUID()}.pdf`;
    const { error: uploadError } = await supabase.storage.from('study-materials').upload(storagePath, bytes, {
      contentType: 'application/pdf',
      upsert: false,
    });
    if (uploadError) return jsonError('Otpremanje PDF-a nije uspelo.', 502);

    const { data: material, error: insertError } = await supabase.from('materials').insert({
      subject_id: parsed.data.subjectId,
      title: parsed.data.title,
      description: parsed.data.description,
      storage_path: storagePath,
    }).select('id').single();
    if (insertError || !material) {
      const { error: cleanupError } = await supabase.storage.from('study-materials').remove([storagePath]);
      if (cleanupError) console.error('Material upload cleanup failed');
      return jsonError('Čuvanje materijala nije uspelo.', 502);
    }

    revalidatePath('/materials');
    revalidatePath(`/subjects/${parsed.data.subjectId}`);
    return NextResponse.json({ id: material.id }, { status: 201 });
  } catch {
    return jsonError('Otpremanje nije uspelo. Pokušajte ponovo.', 500);
  } finally {
    activeUploads--;
  }
}
