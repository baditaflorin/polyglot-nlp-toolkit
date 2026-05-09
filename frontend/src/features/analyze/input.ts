import { workspaceStateSchema, type WorkspaceState } from './schema';
import { splitDocuments } from './workspace';

export type InputFormat = 'state' | 'json' | 'html' | 'csv' | 'tsv' | 'text';

export type ParsedInput = {
  kind: 'corpus';
  corpus: string;
  format: InputFormat;
  source: string;
  documentsAdded: number;
  warning?: string;
};

export type ParsedStateInput = {
  kind: 'state';
  workspace: WorkspaceState;
  format: 'state';
  source: string;
  documentsAdded: number;
  warning?: string;
};

export type ParseResult = ParsedInput | ParsedStateInput;

type FileLike = {
  name: string;
  type: string;
  text(): Promise<string>;
};

export function normalizeText(input: string) {
  return input
    .replace(/^\uFEFF/, '')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

export function detectInputFormat(source: string, mimeType: string, raw: string): InputFormat {
  const lower = source.toLowerCase();
  const trimmed = raw.trimStart();
  if (trimmed.startsWith('{') && trimmed.includes('"schemaVersion"')) {
    return 'state';
  }
  if (mimeType.includes('json') || lower.endsWith('.json') || trimmed.startsWith('[')) {
    return 'json';
  }
  if (
    mimeType.includes('html') ||
    lower.endsWith('.html') ||
    lower.endsWith('.htm') ||
    /<\/?[a-z][\s\S]*>/i.test(trimmed)
  ) {
    return 'html';
  }
  if (
    lower.endsWith('.tsv') ||
    raw
      .split('\n')
      .slice(0, 5)
      .some((line) => line.includes('\t'))
  ) {
    return 'tsv';
  }
  if (lower.endsWith('.csv') || looksLikeCsv(raw)) {
    return 'csv';
  }
  return 'text';
}

export function parseInput(
  raw: string,
  source = 'pasted text',
  mimeType = 'text/plain',
): ParseResult {
  const normalized = normalizeText(raw);
  const format = detectInputFormat(source, mimeType, normalized);

  if (format === 'state') {
    const parsed: unknown = JSON.parse(normalized);
    const workspace = workspaceStateSchema.parse(parsed);
    return {
      kind: 'state',
      workspace,
      format,
      source,
      documentsAdded: splitDocuments(workspace.corpus).length,
    };
  }

  const corpus = formatToCorpus(normalized, format);
  const documentsAdded = splitDocuments(corpus).length;
  return {
    kind: 'corpus',
    corpus,
    format,
    source,
    documentsAdded,
    warning: documentsAdded === 0 ? 'No usable text was found in this input.' : undefined,
  };
}

export async function parseFiles(files: FileList | File[]) {
  const parsed: ParseResult[] = [];
  for (const file of Array.from(files)) {
    parsed.push(await parseFile(file));
  }
  return parsed;
}

async function parseFile(file: FileLike) {
  return parseInput(await file.text(), file.name, file.type);
}

function formatToCorpus(input: string, format: InputFormat) {
  if (format === 'html') {
    return htmlToText(input);
  }
  if (format === 'csv' || format === 'tsv') {
    return rowsToDocuments(parseDelimited(input, format === 'tsv' ? '\t' : ','));
  }
  if (format === 'json') {
    return jsonToCorpus(input);
  }
  return input;
}

function htmlToText(input: string) {
  const document = new DOMParser().parseFromString(input, 'text/html');
  document.querySelectorAll('script, style, noscript, template').forEach((node) => node.remove());
  const text = document.body.textContent || input;
  return normalizeText(text.replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' '));
}

function jsonToCorpus(input: string) {
  const parsed: unknown = JSON.parse(input);
  if (Array.isArray(parsed)) {
    return parsed.map(jsonValueToDocument).filter(Boolean).join('\n\n');
  }
  if (isRecord(parsed) && Array.isArray(parsed.documents)) {
    return parsed.documents.map(jsonValueToDocument).filter(Boolean).join('\n\n');
  }
  if (isRecord(parsed) && typeof parsed.text === 'string') {
    return parsed.text;
  }
  return JSON.stringify(parsed, null, 2);
}

function jsonValueToDocument(value: unknown) {
  if (typeof value === 'string') {
    return normalizeText(value);
  }
  if (isRecord(value) && typeof value.text === 'string') {
    return normalizeText(value.text);
  }
  return '';
}

function looksLikeCsv(input: string) {
  const lines = input
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .slice(0, 5);
  return (
    lines.length > 1 && lines.every((line) => line.includes(',')) && similarFieldCounts(lines, ',')
  );
}

function similarFieldCounts(lines: string[], delimiter: string) {
  const counts = lines.map((line) => parseDelimitedLine(line, delimiter).length);
  return counts.length > 0 && counts.every((count) => Math.abs(count - counts[0]) <= 1);
}

function parseDelimited(input: string, delimiter: string) {
  return input
    .split('\n')
    .map((line) => parseDelimitedLine(line, delimiter).map((cell) => normalizeText(cell)))
    .filter((row) => row.some((cell) => cell.length > 0));
}

function parseDelimitedLine(line: string, delimiter: string) {
  const cells: string[] = [];
  let current = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === delimiter && !quoted) {
      cells.push(current);
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current);
  return cells;
}

function rowsToDocuments(rows: string[][]) {
  if (rows.length === 0) {
    return '';
  }
  const [header, ...body] = rows;
  const hasHeader = header.every((cell) => cell.length > 0 && !/\d{3,}/.test(cell));
  const dataRows = hasHeader ? body : rows;
  const headers = hasHeader ? header : [];
  return dataRows
    .map((row) =>
      row
        .map((cell, index) => {
          const label = headers[index] || `field_${index + 1}`;
          return `${label}: ${cell}`;
        })
        .join('\n'),
    )
    .map((doc, index) => `row_${index + 1}\n${doc}`)
    .join('\n\n');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
