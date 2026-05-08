import { AlertTriangle, Github, HeartHandshake, Server, Sparkles } from 'lucide-react';
import { Analyzer } from './features/analyze/Analyzer';
import { VersionBadge } from './features/analyze/VersionBadge';
import { ErrorBoundary } from './lib/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <main className="min-h-screen bg-paper text-ink">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-signal">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  70+ language corpus NLP
                </div>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal text-ink sm:text-4xl">
                  Polyglot NLP Toolkit
                </h1>
              </div>
              <nav className="flex flex-wrap items-center gap-2" aria-label="Project links">
                <a
                  className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-ink shadow-panel hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-signal"
                  href="https://github.com/baditaflorin/polyglot-nlp-toolkit"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  GitHub
                </a>
                <a
                  className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900 shadow-panel hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-600"
                  href="https://www.paypal.com/paypalme/florinbadita"
                  target="_blank"
                  rel="noreferrer"
                >
                  <HeartHandshake className="h-4 w-4" aria-hidden="true" />
                  PayPal
                </a>
              </nav>
            </div>
            <div className="flex flex-col gap-3 rounded-md border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-950 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2">
                <Server className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                <span>
                  Paste a corpus, choose NLP tasks, and run the Docker API behind this Pages UI.
                </span>
              </div>
              <VersionBadge />
            </div>
          </div>
        </header>

        <Analyzer />

        <footer className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 sm:px-6 lg:px-8">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>
              The public Pages site is static. Corpus analysis requires a running backend API;
              deploy the Docker stack or point the API field at your own instance.
            </p>
          </div>
          <p>
            Repository: https://github.com/baditaflorin/polyglot-nlp-toolkit · Support:
            https://www.paypal.com/paypalme/florinbadita
          </p>
        </footer>
      </main>
    </ErrorBoundary>
  );
}
