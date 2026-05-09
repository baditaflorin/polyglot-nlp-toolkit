import { describe, expect, it } from 'vitest';
import { detectInputFormat, parseInput } from './input';
import { defaultWorkspace } from './workspace';

describe('input parsing', () => {
  it('normalizes HTML into visible corpus text', () => {
    const parsed = parseInput(
      '<html><head><style>.x{}</style></head><body><h1>Titlu</h1><p>Bucuresti este aici.</p></body></html>',
      'page.html',
      'text/html',
    );

    expect(parsed.kind).toBe('corpus');
    expect(parsed.format).toBe('html');
    if (parsed.kind === 'corpus') {
      expect(parsed.corpus).toContain('Titlu');
      expect(parsed.corpus).not.toContain('.x{}');
    }
  });

  it('turns CSV rows into separate documents', () => {
    const parsed = parseInput('name,city\nAna,Bucuresti\nMihai,Cluj', 'people.csv', 'text/csv');

    expect(parsed.kind).toBe('corpus');
    if (parsed.kind === 'corpus') {
      expect(parsed.documentsAdded).toBe(2);
      expect(parsed.corpus).toContain('name: Ana');
      expect(parsed.corpus).toContain('city: Cluj');
    }
  });

  it('detects versioned state files', () => {
    const parsed = parseInput(
      JSON.stringify(defaultWorkspace),
      'workspace.json',
      'application/json',
    );

    expect(parsed.kind).toBe('state');
    expect(parsed.format).toBe('state');
  });

  it('sniffs common formats without extensions', () => {
    expect(detectInputFormat('clipboard', 'text/plain', '<article>Hello</article>')).toBe('html');
    expect(detectInputFormat('clipboard', 'text/plain', 'a,b\n1,2')).toBe('csv');
  });
});
