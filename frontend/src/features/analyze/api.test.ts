import { describe, expect, it } from 'vitest';
import { analyzeRequestSchema } from './schema';

describe('analyzeRequestSchema', () => {
  it('accepts a valid corpus request', () => {
    const parsed = analyzeRequestSchema.parse({
      documents: ['Bucuresti este capitala Romaniei.'],
      operations: ['detect', 'tokenize'],
      clusterCount: 2,
    });

    expect(parsed.documents).toHaveLength(1);
  });

  it('rejects an empty document list', () => {
    expect(() =>
      analyzeRequestSchema.parse({
        documents: [],
        operations: ['detect'],
      }),
    ).toThrow();
  });
});
