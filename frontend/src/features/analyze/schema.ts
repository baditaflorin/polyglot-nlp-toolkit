import { z } from 'zod';

export const operationSchema = z.enum([
  'detect',
  'tokenize',
  'pos',
  'parse',
  'ner',
  'embed',
  'cluster',
]);

export const analyzeRequestSchema = z.object({
  documents: z.array(z.string().min(1)).min(1).max(100),
  language: z.string().optional(),
  operations: z.array(operationSchema).min(1),
  clusterCount: z.number().int().min(1).max(20).optional(),
});

export const tokenSchema = z.object({
  text: z.string(),
  lemma: z.string().optional(),
  pos: z.string().optional(),
  tag: z.string().optional(),
  dep: z.string().optional(),
  head: z.number().int().optional(),
  start: z.number().int().optional(),
  end: z.number().int().optional(),
});

export const entitySchema = z.object({
  text: z.string(),
  label: z.string(),
  start: z.number().int().optional(),
  end: z.number().int().optional(),
});

export const documentResultSchema = z.object({
  id: z.string(),
  language: z.string(),
  text: z.string(),
  tokens: z.array(tokenSchema),
  entities: z.array(entitySchema),
  embedding: z.array(z.number()).optional(),
  warnings: z.array(z.string()),
});

export const clusterSchema = z.object({
  id: z.number().int(),
  documentIds: z.array(z.string()),
  label: z.string(),
});

export const analyzeResponseSchema = z.object({
  version: z.string(),
  commit: z.string(),
  engine: z.object({
    spacy: z.string(),
    stanza: z.string(),
    nltk: z.string(),
    sentenceTransformers: z.string(),
    langdetectJava: z.string(),
  }),
  documents: z.array(documentResultSchema),
  clusters: z.array(clusterSchema),
  warnings: z.array(z.string()),
  durationMs: z.number(),
});

export type Operation = z.infer<typeof operationSchema>;
export type AnalyzeRequest = z.infer<typeof analyzeRequestSchema>;
export type AnalyzeResponse = z.infer<typeof analyzeResponseSchema>;
