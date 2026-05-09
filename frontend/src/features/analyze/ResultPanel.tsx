import { Loader2 } from 'lucide-react';
import { ActionableError } from './api';
import type { AnalyzeResponse } from './schema';

export function ResultPanel({
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
    return <ErrorPanel error={error} />;
  }

  if (!result) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 shadow-panel">
        <h2 className="text-xl font-semibold text-ink">Results</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Load your corpus, run the pipeline, then export JSON, CSV, curl, or a state file.
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

function ErrorPanel({ error }: { error: Error }) {
  const actionable = error instanceof ActionableError ? error : undefined;
  return (
    <div className="rounded-md border border-red-200 bg-red-50 p-5 text-sm text-red-950 shadow-panel">
      <h2 className="text-lg font-semibold">Request needs attention</h2>
      <p className="mt-2 break-words">{error.message}</p>
      {actionable?.details && <p className="mt-2 break-words text-red-900">{actionable.details}</p>}
    </div>
  );
}
