import type { AnalyzeRequest, AnalyzeResponse, WorkspaceState } from './schema';
import { buildAnalyzeRequest } from './workspace';

export type ExportBundle = {
  schemaVersion: 1;
  request: AnalyzeRequest;
  response: AnalyzeResponse;
};

export function analysisToJson(request: AnalyzeRequest, response: AnalyzeResponse) {
  const bundle: ExportBundle = {
    schemaVersion: 1,
    request,
    response,
  };
  return `${JSON.stringify(bundle, null, 2)}\n`;
}

export function analysisToTokenCsv(response: AnalyzeResponse) {
  const rows = [
    [
      'document_id',
      'language',
      'token_index',
      'text',
      'lemma',
      'pos',
      'tag',
      'dep',
      'start',
      'end',
    ],
  ];
  response.documents.forEach((document) => {
    document.tokens.forEach((token, index) => {
      rows.push([
        document.id,
        document.language,
        String(index),
        token.text,
        token.lemma || '',
        token.pos || '',
        token.tag || '',
        token.dep || '',
        token.start === undefined ? '' : String(token.start),
        token.end === undefined ? '' : String(token.end),
      ]);
    });
  });
  return `${rows.map((row) => row.map(csvEscape).join(',')).join('\n')}\n`;
}

export function workspaceToJson(workspace: WorkspaceState) {
  return `${JSON.stringify(workspace, null, 2)}\n`;
}

export function buildCurlCommand(workspace: WorkspaceState) {
  const request = buildAnalyzeRequest(workspace);
  const body = JSON.stringify(request, null, 2).replace(/'/g, "'\"'\"'");
  return [
    `curl -X POST '${workspace.settings.apiBaseUrl.replace(/\/$/, '')}/api/v1/analyze'`,
    "  -H 'Content-Type: application/json'",
    `  -d '${body}'`,
  ].join(' \\\n');
}

export function makeShareUrl(workspace: WorkspaceState) {
  const payload = encodeBase64Url(workspaceToJson({ ...workspace, lastResult: undefined }));
  if (payload.length > 6000) {
    throw new Error('This workspace is too large for a share URL. Download a state file instead.');
  }
  const url = new URL(window.location.href);
  url.hash = `state=${payload}`;
  return url.toString();
}

export function parseShareHash(hash: string) {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!raw.startsWith('state=')) {
    return undefined;
  }
  return decodeBase64Url(raw.slice('state='.length));
}

export function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function copyText(content: string) {
  if (!navigator.clipboard) {
    throw new Error('Clipboard API is unavailable. Select and copy the text manually.');
  }
  await navigator.clipboard.writeText(content);
}

// Token/lemma text comes straight from the analyzed corpus. If a cell value
// starts with =, +, -, or @ (or a tab/CR), Excel, LibreOffice, and Google
// Sheets treat it as a formula when the exported CSV is opened, which is a
// classic CSV/"formula injection" vector (CWE-1236) -- e.g. a corpus token
// of `=HYPERLINK("https://evil.example","click")` could exfiltrate data or
// run further formulas for anyone who opens the exported file in a
// spreadsheet app. Neutralize it the standard way: prefix with a leading
// apostrophe so spreadsheet apps render the cell as literal text.
const CSV_FORMULA_TRIGGER_RE = /^[=+\-@\t\r]/;

function csvEscape(value: string) {
  const safe = CSV_FORMULA_TRIGGER_RE.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(safe)) {
    return `"${safe.replace(/"/g, '""')}"`;
  }
  return safe;
}

function encodeBase64Url(input: string) {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(input: string) {
  const padded = input
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(input.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}
