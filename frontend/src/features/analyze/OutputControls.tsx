import {
  Clipboard,
  Copy,
  Download,
  FileInput,
  FileJson,
  Printer,
  Share2,
  Table,
} from 'lucide-react';
import {
  analysisToJson,
  analysisToTokenCsv,
  buildCurlCommand,
  downloadText,
  workspaceToJson,
} from './exporters';
import type { AnalyzeRequest, AnalyzeResponse, WorkspaceState } from './schema';

export function OutputControls({
  request,
  result,
  workspace,
  onCopy,
  onDownloadState,
  onShare,
}: {
  request: AnalyzeRequest;
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
