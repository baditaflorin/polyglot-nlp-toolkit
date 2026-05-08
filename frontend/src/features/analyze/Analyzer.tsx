import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  BrainCircuit,
  Braces,
  FileText,
  Languages,
  Loader2,
  Network,
  Play,
  Tags,
} from 'lucide-react';
import { analyzeCorpus } from './api';
import type { AnalyzeResponse, Operation } from './schema';
import { getEnv } from '../../lib/env';
import { usePersistentState } from '../../lib/usePersistentState';

const defaultCorpus =
  'Bucuresti este capitala Romaniei. Ana lucreaza la un proiect NLP multilingual.\n\n' +
  'Open-source tools can replace several tiny NLP services with one reliable pipeline.';

const operations: Array<{ value: Operation; label: string; icon: typeof Languages }> = [
  { value: 'detect', label: 'Detect', icon: Languages },
  { value: 'tokenize', label: 'Tokens', icon: FileText },
  { value: 'pos', label: 'POS', icon: Tags },
  { value: 'parse', label: 'Parse', icon: Network },
  { value: 'ner', label: 'NER', icon: Braces },
  { value: 'embed', label: 'Embed', icon: BrainCircuit },
  { value: 'cluster', label: 'Cluster', icon: Network },
];

function splitDocuments(corpus: string) {
  return corpus
    .split(/\n\s*\n/g)
    .map((part) => part.trim())
    .filter(Boolean);
}

export function Analyzer() {
  const [corpus, setCorpus] = useState(defaultCorpus);
  const [apiBaseUrl, setApiBaseUrl] = usePersistentState(
    'polyglot-api-base-url',
    getEnv('VITE_API_BASE_URL', 'http://localhost:8080'),
  );
  const [language, setLanguage] = usePersistentState('polyglot-language', 'auto');
  const [clusterCount, setClusterCount] = usePersistentState('polyglot-cluster-count', 2);
  const [selectedOperations, setSelectedOperations] = usePersistentState<Operation[]>(
    'polyglot-operations',
    ['detect', 'tokenize', 'pos', 'ner', 'embed', 'cluster'],
  );

  const documents = useMemo(() => splitDocuments(corpus), [corpus]);

  const mutation = useMutation({
    mutationFn: () =>
      analyzeCorpus(
        {
          documents,
          language: language === 'auto' ? undefined : language,
          operations: selectedOperations,
          clusterCount,
        },
        apiBaseUrl,
      ),
  });

  const toggleOperation = (operation: Operation) => {
    setSelectedOperations((current) =>
      current.includes(operation)
        ? current.filter((item) => item !== operation)
        : [...current, operation],
    );
  };

  const canRun = documents.length > 0 && selectedOperations.length > 0 && !mutation.isPending;

  return (
    <section className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1fr)] lg:px-8">
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (canRun) {
            mutation.mutate();
          }
        }}
      >
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <label htmlFor="corpus" className="text-sm font-semibold text-ink">
            Corpus
          </label>
          <textarea
            id="corpus"
            className="mt-2 h-72 w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-signal focus:ring-2 focus:ring-teal-100"
            value={corpus}
            onChange={(event) => setCorpus(event.target.value)}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <span>
              {documents.length} document{documents.length === 1 ? '' : 's'}
            </span>
            <span>{corpus.length.toLocaleString()} characters</span>
          </div>
        </div>

        <div className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-panel sm:grid-cols-2">
          <label className="text-sm font-semibold text-ink">
            API base URL
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-teal-100"
              value={apiBaseUrl}
              onChange={(event) => setApiBaseUrl(event.target.value)}
            />
          </label>
          <label className="text-sm font-semibold text-ink">
            Language
            <select
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-teal-100"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="auto">Auto detect</option>
              <option value="ro">Romanian</option>
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="es">Spanish</option>
              <option value="it">Italian</option>
            </select>
          </label>
        </div>

        <fieldset className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <legend className="px-1 text-sm font-semibold text-ink">Tasks</legend>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {operations.map(({ value, label, icon: Icon }) => {
              const active = selectedOperations.includes(value);
              return (
                <button
                  className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-signal ${
                    active
                      ? 'border-signal bg-teal-50 text-teal-950'
                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                  key={value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleOperation(value)}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </button>
              );
            })}
          </div>
          <label className="mt-4 block text-sm font-semibold text-ink">
            Cluster count
            <input
              className="mt-2 w-full accent-signal"
              type="range"
              min={1}
              max={10}
              value={clusterCount}
              onChange={(event) => setClusterCount(Number(event.target.value))}
            />
          </label>
          <div className="text-sm text-slate-600">{clusterCount} clusters</div>
        </fieldset>

        <button
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-signal px-4 py-3 text-sm font-semibold text-white shadow-panel hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={!canRun}
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
          Run NLP pipeline
        </button>
      </form>

      <ResultPanel result={mutation.data} error={mutation.error} isPending={mutation.isPending} />
    </section>
  );
}

function ResultPanel({
  result,
  error,
  isPending,
}: {
  result?: AnalyzeResponse;
  error: Error | null;
  isPending: boolean;
}) {
  if (isPending) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-md border border-slate-200 bg-white p-6 shadow-panel">
        <div className="text-center text-slate-700">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-signal" aria-hidden="true" />
          <p className="mt-3 font-medium">Processing corpus</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-950 shadow-panel">
        <h2 className="text-lg font-semibold">API request failed</h2>
        <p className="mt-2 break-words">{error.message}</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-panel">
        <h2 className="text-xl font-semibold text-ink">Results</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Run the pipeline to see detected languages, linguistic annotations, entities, embeddings,
          and clusters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Results</h2>
          <span className="text-sm text-slate-600">{result.durationMs.toFixed(0)} ms</span>
        </div>
        <div className="mt-3 result-grid gap-3 text-sm">
          {Object.entries(result.engine).map(([name, status]) => (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3" key={name}>
              <div className="font-semibold capitalize">{name.replace(/([A-Z])/g, ' $1')}</div>
              <div className="mt-1 break-words text-slate-600">{status}</div>
            </div>
          ))}
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <h3 className="font-semibold">Warnings</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {result.documents.map((document) => (
          <article
            className="rounded-md border border-slate-200 bg-white p-4 shadow-panel"
            key={document.id}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-semibold">{document.id}</h3>
              <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-950">
                {document.language}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">{document.text}</p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[520px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3">Token</th>
                    <th className="py-2 pr-3">Lemma</th>
                    <th className="py-2 pr-3">POS</th>
                    <th className="py-2 pr-3">Dep</th>
                  </tr>
                </thead>
                <tbody>
                  {document.tokens.slice(0, 40).map((token, index) => (
                    <tr
                      className="border-b border-slate-100"
                      key={`${document.id}-${index}-${token.text}`}
                    >
                      <td className="py-2 pr-3 font-medium">{token.text}</td>
                      <td className="py-2 pr-3">{token.lemma || ''}</td>
                      <td className="py-2 pr-3">{token.pos || token.tag || ''}</td>
                      <td className="py-2 pr-3">{token.dep || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {document.entities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {document.entities.map((entity, index) => (
                  <span
                    className="rounded-md bg-plum px-2 py-1 text-xs font-medium text-white"
                    key={`${document.id}-entity-${index}`}
                  >
                    {entity.text} · {entity.label}
                  </span>
                ))}
              </div>
            )}
          </article>
        ))}
      </div>

      {result.clusters.length > 0 && (
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <h3 className="font-semibold">Clusters</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {result.clusters.map((cluster) => (
              <div
                className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm"
                key={cluster.id}
              >
                <div className="font-medium">{cluster.label}</div>
                <div className="mt-1 text-slate-600">{cluster.documentIds.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
