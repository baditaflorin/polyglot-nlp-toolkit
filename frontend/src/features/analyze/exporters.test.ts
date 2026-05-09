import { describe, expect, it } from 'vitest';
import { analysisToJson, analysisToTokenCsv, buildCurlCommand, parseShareHash } from './exporters';
import type { AnalyzeResponse } from './schema';
import { defaultWorkspace, buildAnalyzeRequest } from './workspace';

const response: AnalyzeResponse = {
  version: '0.2.0',
  commit: 'test',
  engine: {
    spacy: 'available',
    stanza: 'available',
    nltk: 'available',
    sentenceTransformers: 'available',
    langdetectJava: 'available',
  },
  documents: [
    {
      id: 'doc-1',
      language: 'ro',
      text: 'Ana merge.',
      tokens: [{ text: 'Ana', lemma: 'ana', pos: 'PROPN', start: 0, end: 3 }],
      entities: [],
      warnings: [],
    },
  ],
  clusters: [],
  warnings: [],
  durationMs: 12,
};

describe('exporters', () => {
  it('exports deterministic JSON bundle', () => {
    const request = buildAnalyzeRequest(defaultWorkspace);
    expect(analysisToJson(request, response)).toBe(analysisToJson(request, response));
  });

  it('exports token CSV with escaped values', () => {
    const csv = analysisToTokenCsv(response);
    expect(csv).toContain('document_id,language,token_index');
    expect(csv).toContain('doc-1,ro,0,Ana');
  });

  it('builds curl for the current request', () => {
    expect(buildCurlCommand(defaultWorkspace)).toContain('/api/v1/analyze');
  });

  it('ignores unrelated hash fragments', () => {
    expect(parseShareHash('#section')).toBeUndefined();
  });
});
