import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import {
  BrainCircuit,
  Braces,
  Clipboard,
  Copy,
  Download,
  FileInput,
  FileJson,
  FileText,
  Languages,
  Loader2,
  Network,
  Play,
  Printer,
  RotateCcw,
  Settings,
  Share2,
  Square,
  Tags,
  Table,
  Upload,
} from 'lucide-react';
import { ActionableError, analyzeCorpus } from './api';
import {
  analysisToJson,
  analysisToTokenCsv,
  buildCurlCommand,
  copyText,
  downloadText,
  makeShareUrl,
  parseShareHash,
  workspaceToJson,
} from './exporters';
import { parseFiles, parseInput, type ParseResult } from './input';
import { clearWorkspace, loadWorkspace, saveWorkspace } from './storage';
import type { AnalyzeResponse, Operation, WorkspaceState } from './schema';
import {
  appendCorpus,
  buildAnalyzeRequest,
  defaultWorkspace,
  replaceCorpus,
  sampleCorpus,
  splitDocuments,
  updateSettings,
} from './workspace';

const operationOptions: Array<{ value: Operation; label: string; icon: typeof Languages }> = [
  { value: 'detect', label: 'Detect', icon: Languages },
  { value: 'tokenize', label: 'Tokens', icon: FileText },
  { value: 'pos', label: 'POS', icon: Tags },
  { value: 'parse', label: 'Parse', icon: Network },
  { value: 'ner', label: 'NER', icon: Braces },
  { value: 'embed', label: 'Embed', icon: BrainCircuit },
  { value: 'cluster', label: 'Cluster', icon: Network },
];

const languageOptions = [
  ['auto', 'Auto detect'],
  ['ro', 'Romanian'],
  ['en', 'English'],
  ['fr', 'French'],
  ['de', 'German'],
  ['es', 'Spanish'],
  ['it', 'Italian'],
];

type SessionState = {
  workspace: WorkspaceState;
  notice?: string;
};

function loadInitialSession(): SessionState {
  const shared = parseShareHash(window.location.hash);
  if (shared) {
    try {
      const parsed = parseInput(shared, 'share URL', 'application/json');
      if (parsed.kind === 'state') {
        return {
          workspace: parsed.workspace,
          notice: `Restored ${parsed.documentsAdded} document${parsed.documentsAdded === 1 ? '' : 's'} from the share URL.`,
        };
      }
    } catch (error) {
      return {
        workspace: loadWorkspace().workspace,
        notice:
          error instanceof Error
            ? `Share URL could not be restored: ${error.message}`
            : 'Share URL could not be restored.',
      };
    }
  }
  return loadWorkspace();
}

export function Analyzer() {
  const [session, setSession] = useState<SessionState>(loadInitialSession);
  const [error, setError] = useState<Error | null>(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [isPending, setIsPending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const workspace = session.workspace;
  const documents = useMemo(() => splitDocuments(workspace.corpus), [workspace.corpus]);
  const currentRequest = useMemo(() => buildAnalyzeRequest(workspace), [workspace]);
  const canRun = documents.length > 0 && workspace.settings.operations.length > 0 && !isPending;

  useEffect(() => {
    saveWorkspace(workspace);
  }, [workspace]);

  const setWorkspace = (
    updater: WorkspaceState | ((current: WorkspaceState) => WorkspaceState),
  ) => {
    setSession((current) => ({
      ...current,
      workspace: typeof updater === 'function' ? updater(current.workspace) : updater,
    }));
  };

  const setNotice = (notice: string) => {
    setSession((current) => ({ ...current, notice }));
  };

  const applyInput = (parsed: ParseResult, mode: 'replace' | 'append') => {
    if (parsed.kind === 'state') {
      setWorkspace(parsed.workspace);
      setNotice(`Restored state from ${parsed.source}.`);
      setError(null);
      return;
    }
    setWorkspace((current) =>
      mode === 'append'
        ? appendCorpus(current, parsed.corpus, parsed.source, parsed.format)
        : replaceCorpus(current, parsed.corpus, parsed.source, parsed.format),
    );
    setNotice(
      `${mode === 'append' ? 'Added' : 'Loaded'} ${parsed.documentsAdded} document${parsed.documentsAdded === 1 ? '' : 's'} from ${parsed.source} (${parsed.format}).${parsed.warning ? ` ${parsed.warning}` : ''}`,
    );
    setError(null);
  };

  const handleFiles = async (files: FileList | File[], mode: 'replace' | 'append') => {
    try {
      const parsed = await parseFiles(files);
      parsed.forEach((item, index) => applyInput(item, index === 0 ? mode : 'append'));
    } catch (caught) {
      setError(toActionableInputError(caught));
    }
  };

  const runAnalysis = async () => {
    if (!canRun) {
      return;
    }
    const controller = new AbortController();
    abortRef.current = controller;
    setIsPending(true);
    setError(null);
    setCopyStatus('');
    try {
      const result = await analyzeCorpus(
        currentRequest,
        workspace.settings.apiBaseUrl,
        controller.signal,
      );
      setWorkspace((current) => ({ ...current, lastResult: result }));
      setNotice(`Analyzed ${documents.length} document${documents.length === 1 ? '' : 's'}.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Analysis failed.'));
    } finally {
      setIsPending(false);
      abortRef.current = null;
    }
  };

  const cancelAnalysis = () => {
    abortRef.current?.abort();
  };

  const copy = async (label: string, content: string) => {
    try {
      await copyText(content);
      setCopyStatus(`${label} copied.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error(`${label} could not be copied.`));
    }
  };

  const downloadState = () => {
    downloadText('polyglot-workspace.json', workspaceToJson(workspace), 'application/json');
    setCopyStatus('Workspace state downloaded.');
  };

  const shareWorkspace = async () => {
    try {
      const url = makeShareUrl(workspace);
      window.history.replaceState(null, '', url);
      await copy('Share URL', url);
    } catch (caught) {
      setError(caught instanceof Error ? caught : new Error('Share URL could not be created.'));
    }
  };

  const result = workspace.lastResult;

  return (
    <section
      className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,1fr)] lg:px-8"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event: DragEvent<HTMLElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files.length > 0) {
          void handleFiles(event.dataTransfer.files, 'replace');
        }
      }}
    >
      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void runAnalysis();
        }}
      >
        <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor="corpus" className="text-sm font-semibold text-ink">
              Corpus
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50"
                type="button"
                onClick={() => {
                  setWorkspace((current) =>
                    replaceCorpus(current, sampleCorpus, 'built-in sample', 'text'),
                  );
                  setNotice('Sample corpus loaded.');
                }}
              >
                <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                Sample
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3.5 w-3.5" aria-hidden="true" />
                Files
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-2 py-1 text-xs font-medium hover:bg-slate-50"
                type="button"
                onClick={() => {
                  void readClipboardText(applyInput, setError);
                }}
              >
                <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
                Clipboard
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-md border border-red-200 px-2 py-1 text-xs font-medium text-red-800 hover:bg-red-50"
                type="button"
                onClick={() => {
                  clearWorkspace();
                  setSession({ workspace: defaultWorkspace, notice: 'Workspace cleared.' });
                  setError(null);
                }}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Start fresh
              </button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            className="sr-only"
            type="file"
            multiple
            accept=".txt,.csv,.tsv,.html,.htm,.json,text/*,application/json,text/html,text/csv"
            onChange={(event) => {
              if (event.target.files) {
                void handleFiles(event.target.files, 'replace');
              }
              event.currentTarget.value = '';
            }}
          />
          <textarea
            id="corpus"
            className="mt-2 h-72 w-full resize-y rounded-md border border-slate-300 bg-white p-3 text-sm leading-6 text-ink outline-none focus:border-signal focus:ring-2 focus:ring-teal-100"
            value={workspace.corpus}
            onChange={(event) => {
              setWorkspace((current) =>
                replaceCorpus(current, event.target.value, 'manual edit', 'text'),
              );
            }}
            onPaste={(event) => {
              const html = event.clipboardData.getData('text/html');
              if (html) {
                event.preventDefault();
                applyInput(parseInput(html, 'pasted HTML', 'text/html'), 'replace');
              }
            }}
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
            <span>
              {documents.length} document{documents.length === 1 ? '' : 's'}
            </span>
            <span>{workspace.corpus.length.toLocaleString()} characters</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Drop files anywhere in this panel. Supported inputs: text, HTML, CSV, TSV, JSON document
            arrays, and exported workspace state.
          </p>
        </div>

        <fieldset className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-panel sm:grid-cols-2">
          <legend className="flex items-center gap-2 px-1 text-sm font-semibold text-ink">
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </legend>
          <label className="text-sm font-semibold text-ink">
            API base URL
            <input
              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-teal-100"
              value={workspace.settings.apiBaseUrl}
              onChange={(event) => {
                setWorkspace((current) =>
                  updateSettings(current, { apiBaseUrl: event.target.value }),
                );
              }}
            />
          </label>
          <label className="text-sm font-semibold text-ink">
            Language
            <select
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-signal focus:ring-2 focus:ring-teal-100"
              value={workspace.settings.language}
              onChange={(event) => {
                setWorkspace((current) =>
                  updateSettings(current, { language: event.target.value }),
                );
              }}
            >
              {languageOptions.map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <div className="sm:col-span-2">
            <div className="text-sm font-semibold text-ink">Tasks</div>
            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {operationOptions.map(({ value, label, icon: Icon }) => {
                const active = workspace.settings.operations.includes(value);
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
                    onClick={() => {
                      const operations = active
                        ? workspace.settings.operations.filter((item) => item !== value)
                        : [...workspace.settings.operations, value];
                      if (operations.length > 0) {
                        setWorkspace((current) => updateSettings(current, { operations }));
                      }
                    }}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="text-sm font-semibold text-ink sm:col-span-2">
            Cluster count
            <input
              className="mt-2 w-full accent-signal"
              type="range"
              min={1}
              max={10}
              value={workspace.settings.clusterCount}
              onChange={(event) => {
                setWorkspace((current) =>
                  updateSettings(current, { clusterCount: Number(event.target.value) }),
                );
              }}
            />
          </label>
          <div className="text-sm text-slate-600 sm:col-span-2">
            {workspace.settings.clusterCount} clusters
          </div>
        </fieldset>

        <div className="flex gap-2">
          <button
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-signal px-4 py-3 text-sm font-semibold text-white shadow-panel hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-signal focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            type="submit"
            disabled={!canRun}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Play className="h-4 w-4" aria-hidden="true" />
            )}
            Run NLP pipeline
          </button>
          {isPending && (
            <button
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-ink shadow-panel hover:bg-slate-50"
              type="button"
              onClick={cancelAnalysis}
            >
              <Square className="h-4 w-4" aria-hidden="true" />
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {session.notice && (
          <div className="rounded-md border border-teal-200 bg-teal-50 p-3 text-sm text-teal-950">
            {session.notice}
          </div>
        )}
        {copyStatus && (
          <div className="rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700">
            {copyStatus}
          </div>
        )}
        <OutputControls
          request={currentRequest}
          result={result}
          workspace={workspace}
          onCopy={copy}
          onDownloadState={downloadState}
          onShare={shareWorkspace}
        />
        <ResultPanel result={result} error={error} isPending={isPending} />
      </div>
    </section>
  );
}

function OutputControls({
  request,
  result,
  workspace,
  onCopy,
  onDownloadState,
  onShare,
}: {
  request: ReturnType<typeof buildAnalyzeRequest>;
  result?: AnalyzeResponse;
  workspace: WorkspaceState;
  onCopy(this: void, label: string, content: string): Promise<void>;
  onDownloadState(this: void): void;
  onShare(this: void): Promise<void>;
}) {
  const hasResult = Boolean(result);
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 shadow-panel">
      <h2 className="text-lg font-semibold">Take it out</h2>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <ActionButton
          disabled={!hasResult}
          icon={Copy}
          label="Copy JSON"
          onClick={() => {
            if (result) {
              void onCopy('JSON', analysisToJson(request, result));
            }
          }}
        />
        <ActionButton
          disabled={!hasResult}
          icon={Download}
          label="JSON"
          onClick={() =>
            result &&
            downloadText(
              'polyglot-analysis.json',
              analysisToJson(request, result),
              'application/json',
            )
          }
        />
        <ActionButton
          disabled={!hasResult}
          icon={Table}
          label="CSV"
          onClick={() =>
            result &&
            downloadText(
              'polyglot-tokens.csv',
              analysisToTokenCsv(result),
              'text/csv;charset=utf-8',
            )
          }
        />
        <ActionButton
          disabled={!hasResult}
          icon={Copy}
          label="Copy CSV"
          onClick={() => {
            if (result) {
              void onCopy('CSV', analysisToTokenCsv(result));
            }
          }}
        />
        <ActionButton icon={FileJson} label="State file" onClick={onDownloadState} />
        <ActionButton icon={Share2} label="Share URL" onClick={() => void onShare()} />
        <ActionButton
          icon={Clipboard}
          label="Copy curl"
          onClick={() => {
            void onCopy('curl', buildCurlCommand(workspace));
          }}
        />
        <ActionButton icon={Printer} label="Print" onClick={() => window.print()} />
        <ActionButton
          icon={FileInput}
          label="Copy state"
          onClick={() => {
            void onCopy('State JSON', workspaceToJson(workspace));
          }}
        />
      </div>
    </div>
  );
}

function ActionButton({
  disabled,
  icon: Icon,
  label,
  onClick,
}: {
  disabled?: boolean;
  icon: typeof Copy;
  label: string;
  onClick(this: void): void;
}) {
  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
      type="button"
      disabled={disabled}
      onClick={onClick}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      {label}
    </button>
  );
}

async function readClipboardText(
  applyInput: (parsed: ParseResult, mode: 'replace' | 'append') => void,
  setError: (error: Error) => void,
) {
  try {
    const text = await navigator.clipboard.readText();
    applyInput(parseInput(text, 'clipboard', 'text/plain'), 'replace');
  } catch (caught) {
    setError(
      caught instanceof Error
        ? new Error(
            `Clipboard text could not be read. Use the corpus box paste shortcut instead. ${caught.message}`,
          )
        : new Error('Clipboard text could not be read. Use the corpus box paste shortcut instead.'),
    );
  }
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

function toActionableInputError(error: unknown) {
  return new ActionableError(
    'The input could not be loaded. Check that the file is text, HTML, CSV, TSV, JSON, or an exported workspace state.',
    error instanceof Error ? error.message : 'Input parser failed.',
  );
}
