import { supabase } from './supabase';
import { getSupabaseAdmin } from './supabase-admin';

export type Subject = { id: string; name: string; year: number | null };
export type Material = {
  id: string;
  subjectId: string;
  title: string;
  description: string | null;
  createdAt: string;
  url: string | null;
};
export type ExamQuestion = {
  id: string;
  subjectId: string;
  examType: 'EXAM' | 'MIDTERM' | 'TEST';
  type: 'multiple-choice' | 'open-ended';
  prompt: string;
  options?: string[];
  correctAnswer?: number;
  sampleAnswer?: string;
  examDate: string | null;
};

type SubjectRow = { id: string; name: string; study_year: number | null };
const toSubject = (row: SubjectRow): Subject => ({ id: row.id, name: row.name, year: row.study_year });

export async function getSubjects(): Promise<Subject[]> {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, study_year')
    .order('study_year', { ascending: true })
    .order('name', { ascending: true });
  if (error) throw new Error('Učitavanje predmeta nije uspelo.', { cause: error });
  return (data ?? []).map(toSubject);
}

export async function getSubject(id: string): Promise<Subject | undefined> {
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) return undefined;
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, study_year')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Učitavanje predmeta nije uspelo.', { cause: error });
  return data ? toSubject(data) : undefined;
}
type MaterialRow = {
  id: string;
  subject_id: string;
  title: string;
  description: string | null;
  storage_path: string | null;
  file_url: string | null;
  created_at: string;
};

const toMaterial = (row: MaterialRow): Material => ({
  id: row.id,
  subjectId: row.subject_id,
  title: row.title,
  description: row.description,
  createdAt: row.created_at,
  url: row.storage_path
    ? supabase.storage.from('study-materials').getPublicUrl(row.storage_path).data.publicUrl
    : row.file_url,
});

export async function getMaterials(subjectId?: string): Promise<Material[]> {
  const query = supabase
    .from('materials')
    .select('id, subject_id, title, description, storage_path, file_url, created_at');
  const { data, error } = await (subjectId ? query.eq('subject_id', subjectId) : query)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Učitavanje materijala nije uspelo.', { cause: error });
  return (data ?? []).map(toMaterial);
}
type QuestionOptionRow = { id: string; question_id: string; option_text: string; is_correct: boolean };
type QuestionRow = {
  id: string;
  subject_id: string;
  question_text: string;
  question_type: string;
  exam_type: string;
  exam_date: string | null;
  correct_answer: string;
};

export async function getQuestions(subjectId?: string): Promise<ExamQuestion[]> {
  const admin = getSupabaseAdmin();
  const query = admin.from('exam_questions')
    .select('id, subject_id, question_text, question_type, exam_type, exam_date, correct_answer');
  const { data, error } = await (subjectId ? query.eq('subject_id', subjectId) : query)
    .order('created_at', { ascending: false });
  if (error) throw new Error('Učitavanje ispitnih pitanja nije uspelo.', { cause: error });
  const ids = (data ?? []).map(row => row.id);
  const { data: optionRows, error: optionError } = ids.length
    ? await admin.from('question_options').select('id, question_id, option_text, is_correct').in('question_id', ids)
    : { data: [], error: null };
  if (optionError) throw new Error('Učitavanje odgovora nije uspelo.', { cause: optionError });
  const byQuestion = new Map<string, QuestionOptionRow[]>();
  for (const option of (optionRows ?? []) as QuestionOptionRow[]) {
    byQuestion.set(option.question_id, [...(byQuestion.get(option.question_id) ?? []), option]);
  }
  return ((data ?? []) as QuestionRow[]).filter(row =>
    ['OPEN', 'SINGLE_CHOICE'].includes(row.question_type) &&
    ['EXAM', 'MIDTERM', 'TEST'].includes(row.exam_type)
  ).map(row => {
    const options = row.question_type === 'SINGLE_CHOICE'
      ? [...(byQuestion.get(row.id) ?? [])].sort((a, b) => a.id.localeCompare(b.id))
      : [];
    return {
      id: row.id,
      subjectId: row.subject_id,
      examType: row.exam_type as ExamQuestion['examType'],
      type: row.question_type === 'SINGLE_CHOICE' ? 'multiple-choice' as const : 'open-ended' as const,
      prompt: row.question_text,
      options: row.question_type === 'SINGLE_CHOICE' ? options.map(option => option.option_text) : undefined,
      correctAnswer: row.question_type === 'SINGLE_CHOICE' ? options.findIndex(option => option.is_correct) : undefined,
      sampleAnswer: row.question_type === 'OPEN' ? row.correct_answer : undefined,
      examDate: row.exam_date,
    };
  });
}
