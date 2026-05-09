import { analyzeRequestSchema, analyzeResponseSchema, type AnalyzeRequest } from './schema';
import { getEnv } from '../../lib/env';

const defaultApiBaseUrl = getEnv('VITE_API_BASE_URL', 'http://localhost:8080');

export class ActionableError extends Error {
  constructor(
    message: string,
    readonly details?: string,
  ) {
    super(message);
    this.name = 'ActionableError';
  }
}

export async function analyzeCorpus(
  request: AnalyzeRequest,
  apiBaseUrl: string = defaultApiBaseUrl,
  signal?: AbortSignal,
) {
  const payload = analyzeRequestSchema.parse(request);
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/api/v1/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ActionableError(
        'Analysis was cancelled. Your corpus and settings are still intact.',
        'The browser aborted the in-flight API request.',
      );
    }
    throw new ActionableError(
      'Could not reach the NLP API. Check that the Docker backend is running and that the API base URL is correct.',
      error instanceof Error ? error.message : 'Network request failed.',
    );
  }

  if (!response.ok) {
    const details = await response.text();
    throw new ActionableError(
      `The NLP API rejected the corpus with HTTP ${response.status}. Check the corpus size, selected tasks, and API logs, then try again.`,
      details || response.statusText,
    );
  }

  try {
    return analyzeResponseSchema.parse(await response.json());
  } catch (error) {
    throw new ActionableError(
      'The NLP API returned a response the app could not understand. Save your state and check that frontend and backend versions match.',
      error instanceof Error ? error.message : 'Response validation failed.',
    );
  }
}
