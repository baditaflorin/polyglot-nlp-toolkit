import { getEnv } from '../../lib/env';
import type { AnalyzeRequest, Operation, WorkspaceSettings, WorkspaceState } from './schema';

export const sampleCorpus =
  'Bucuresti este capitala Romaniei. Ana lucreaza la un proiect NLP multilingual.\n\n' +
  'Open-source tools can replace several tiny NLP services with one reliable pipeline.';

export const defaultOperations: Operation[] = [
  'detect',
  'tokenize',
  'pos',
  'ner',
  'embed',
  'cluster',
];

export const defaultSettings: WorkspaceSettings = {
  apiBaseUrl: getEnv('VITE_API_BASE_URL', 'http://localhost:8080'),
  language: 'auto',
  operations: defaultOperations,
  clusterCount: 2,
};

export const defaultWorkspace: WorkspaceState = {
  schemaVersion: 1,
  corpus: sampleCorpus,
  settings: defaultSettings,
  inputSummaries: [
    {
      source: 'built-in sample',
      format: 'text',
      documentsAdded: 2,
    },
  ],
};

export function splitDocuments(corpus: string) {
  return corpus
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function buildAnalyzeRequest(workspace: WorkspaceState): AnalyzeRequest {
  return {
    documents: splitDocuments(workspace.corpus),
    language: workspace.settings.language === 'auto' ? undefined : workspace.settings.language,
    operations: workspace.settings.operations,
    clusterCount: workspace.settings.clusterCount,
  };
}

export function replaceCorpus(
  workspace: WorkspaceState,
  corpus: string,
  source: string,
  format: string,
): WorkspaceState {
  return {
    ...workspace,
    corpus,
    inputSummaries: [
      {
        source,
        format,
        documentsAdded: splitDocuments(corpus).length,
      },
    ],
    lastResult: undefined,
  };
}

export function appendCorpus(
  workspace: WorkspaceState,
  corpus: string,
  source: string,
  format: string,
): WorkspaceState {
  const nextCorpus = [workspace.corpus.trim(), corpus.trim()].filter(Boolean).join('\n\n');
  return {
    ...workspace,
    corpus: nextCorpus,
    inputSummaries: [
      ...workspace.inputSummaries,
      {
        source,
        format,
        documentsAdded: splitDocuments(corpus).length,
      },
    ],
    lastResult: undefined,
  };
}

export function updateSettings(
  workspace: WorkspaceState,
  settings: Partial<WorkspaceSettings>,
): WorkspaceState {
  return {
    ...workspace,
    settings: {
      ...workspace.settings,
      ...settings,
    },
    lastResult: undefined,
  };
}
