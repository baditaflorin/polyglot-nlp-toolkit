import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from './App';
import { isProduction } from './lib/env';
import './styles/app.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

if ('serviceWorker' in navigator && isProduction) {
  window.addEventListener('load', () => {
    void navigator.serviceWorker.register('/polyglot-nlp-toolkit/sw.js', {
      scope: '/polyglot-nlp-toolkit/',
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
