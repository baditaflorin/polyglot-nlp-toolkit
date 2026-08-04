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

  it('neutralizes CSV formula injection in token text', () => {
    const malicious: AnalyzeResponse = {
      ...response,
      documents: [
        {
          ...response.documents[0],
          tokens: [
            { text: '=HYPERLINK("https://evil.example","click")', lemma: '=cmd', start: 0, end: 1 },
            { text: '+1+1', lemma: 'plus', start: 1, end: 2 },
            { text: '-1', lemma: 'minus', start: 2, end: 3 },
            { text: '@mention', lemma: 'at', start: 3, end: 4 },
            { text: 'safe', lemma: 'safe', start: 4, end: 5 },
          ],
        },
      ],
    };
    const csv = analysisToTokenCsv(malicious);
    const lines = csv.trim().split('\n').slice(1);
    // Every cell that would otherwise start with a formula-trigger character
    // must be prefixed with a leading apostrophe so spreadsheet apps treat
    // it as literal text instead of executing it as a formula.
    expect(lines[0]).toContain('\'=HYPERLINK');
    expect(lines[0]).toContain('\'=cmd');
    expect(lines[1]).toContain('\'+1+1');
    expect(lines[2]).toContain('\'-1');
    expect(lines[3]).toContain('\'@mention');
    // Values that don't start with a formula-trigger character are
    // untouched.
    expect(lines[4]).toContain(',safe,safe,');
  });

  it('builds curl for the current request', () => {
    expect(buildCurlCommand(defaultWorkspace)).toContain('/api/v1/analyze');
  });

  it('ignores unrelated hash fragments', () => {
    expect(parseShareHash('#section')).toBeUndefined();
  });
});
