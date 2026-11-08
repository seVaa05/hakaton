import { z } from 'zod';

export const GenerateRequestSchema = z.object({
  materialId: z.uuid(),
  count: z.union([z.literal(5), z.literal(10), z.literal(15)]),
  type: z.enum(['SINGLE_CHOICE', 'OPEN', 'MIXED']),
}).strict();

export const GeneratedQuestionSchema = z.object({
  type: z.enum(['SINGLE_CHOICE', 'OPEN']),
  prompt: z.string().trim().min(12).max(600),
  options: z.array(z.string().trim().min(1).max(250)).max(4),
  correctOptionIndex: z.number().int().min(0).max(3).nullable(),
  suggestedAnswer: z.string().trim().max(900).nullable(),
  explanation: z.string().trim().min(10).max(900),
  reference: z.string().trim().max(160).nullable(),
  evidence: z.string().trim().min(5).max(500),
}).strict().superRefine((question, context) => {
  if (question.type === 'SINGLE_CHOICE') {
    if (question.options.length !== 4 || new Set(question.options.map(option => option.toLocaleLowerCase('sr'))).size !== 4) {
      context.addIssue({ code: 'custom', message: 'A choice question needs four distinct options.' });
    }
    if (question.correctOptionIndex === null) {
      context.addIssue({ code: 'custom', message: 'A choice question needs a correct option.' });
    }
  } else if (question.options.length !== 0 || question.correctOptionIndex !== null || !question.suggestedAnswer) {
    context.addIssue({ code: 'custom', message: 'An open question needs a suggested answer and no options.' });
  }
});

export type GeneratedQuestion = z.infer<typeof GeneratedQuestionSchema>;
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
