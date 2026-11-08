import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import { rateLimited, sameOrigin } from '@/lib/api-limit';

export const runtime = 'nodejs';

const schema = z.object({
  subjectId: z.uuid(),
  examType: z.enum(['MIDTERM', 'EXAM', 'TEST']),
  examDate: z.iso.date().nullable(),
  questionType: z.enum(['OPEN', 'SINGLE_CHOICE']),
  questionText: z.string().trim().min(10).max(2000),
  correctAnswer: z.string().trim().max(2000).optional(),
  options: z.array(z.string().trim().min(1).max(500)).length(4).optional(),
  correctOption: z.number().int().min(0).max(3).optional(),
}).strict().superRefine((value, context) => {
  if (value.examDate && value.examDate > new Date().toISOString().slice(0, 10)) {
    context.addIssue({ code: 'custom', message: 'Exam date cannot be in the future.' });
  }
  if (value.questionType === 'OPEN') {
    if (!value.correctAnswer || value.options || value.correctOption !== undefined) {
      context.addIssue({ code: 'custom', message: 'Open question needs an answer.' });
    }
  } else if (!value.options || value.correctOption === undefined || value.correctAnswer) {
    context.addIssue({ code: 'custom', message: 'Choice question needs four options and a correct choice.' });
  } else if (new Set(value.options.map(option => option.toLocaleLowerCase('sr'))).size !== 4) {
    context.addIssue({ code: 'custom', message: 'Options must be distinct.' });
  }
});

function error(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!sameOrigin(request)) return error('Zahtev nije dozvoljen.', 403);
  if (!request.headers.get('content-type')?.startsWith('application/json')) return error('Očekuje se JSON.', 415);
  if (Number(request.headers.get('content-length') ?? 0) > 12_000) return error('Zahtev je prevelik.', 413);
  if (rateLimited(request, 'question', 5, 60, 60 * 60 * 1000)) return error('Previše pitanja. Pokušajte kasnije.', 429);
  let input: z.infer<typeof schema>;
  try {
    const raw = await request.text();
    if (raw.length > 12_000) return error('Zahtev je prevelik.', 413);
    const parsed = schema.safeParse(JSON.parse(raw));
    if (!parsed.success) return error('Proverite pitanje i odgovore.', 400);
    input = parsed.data;
  } catch {
    return error('Zahtev nije ispravan.', 400);
  }
  try {
    const admin = getSupabaseAdmin();
    const { data: subject, error: subjectError } = await admin.from('subjects')
      .select('id').eq('id', input.subjectId).maybeSingle();
    if (subjectError) return error('Provera predmeta nije uspela.', 502);
    if (!subject) return error('Predmet ne postoji.', 400);
    const options = input.questionType === 'SINGLE_CHOICE'
      ? input.options!.map((text, index) => ({ text, isCorrect: index === input.correctOption }))
      : [];
    const correctAnswer = input.questionType === 'OPEN'
      ? input.correctAnswer!
      : input.options![input.correctOption!];
    const { data: id, error: insertError } = await admin.rpc('submit_exam_question', {
      p_subject_id: input.subjectId,
      p_question_text: input.questionText,
      p_question_type: input.questionType,
      p_exam_type: input.examType,
      p_exam_date: input.examDate,
      p_correct_answer: correctAnswer,
      p_options: options,
    });
    if (insertError || !id) return error('Čuvanje pitanja nije uspelo. Proverite da li je SQL migracija primenjena.', 503);
    revalidatePath('/questions');
    revalidatePath('/quiz');
    return NextResponse.json({ id }, { status: 201 });
  } catch {
    return error('Čuvanje pitanja trenutno nije dostupno.', 503);
  }
}
