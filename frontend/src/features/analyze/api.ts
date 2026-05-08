import { analyzeRequestSchema, analyzeResponseSchema, type AnalyzeRequest } from './schema';
import { getEnv } from '../../lib/env';

const defaultApiBaseUrl = getEnv('VITE_API_BASE_URL', 'http://localhost:8080');

export async function analyzeCorpus(
  request: AnalyzeRequest,
  apiBaseUrl: string = defaultApiBaseUrl,
) {
  const payload = analyzeRequestSchema.parse(request);
  const response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`API returned ${response.status}: ${details || response.statusText}`);
  }

  return analyzeResponseSchema.parse(await response.json());
}
