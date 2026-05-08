import { getEnv } from '../../lib/env';

export function VersionBadge() {
  const version = getEnv('VITE_APP_VERSION', '0.1.0');
  const commit = getEnv('VITE_APP_COMMIT', 'dev');

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-teal-950">
      <span className="rounded-md bg-white px-2 py-1 shadow-panel">version {version}</span>
      <span className="rounded-md bg-white px-2 py-1 shadow-panel">commit {commit}</span>
    </div>
  );
}
