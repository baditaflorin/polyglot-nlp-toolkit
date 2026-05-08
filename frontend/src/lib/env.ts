type EnvKey = 'VITE_API_BASE_URL' | 'VITE_APP_VERSION' | 'VITE_APP_COMMIT';

const env = import.meta.env as unknown as Record<EnvKey, string | undefined> & {
  PROD: boolean;
  DEV: boolean;
};

export function getEnv(key: EnvKey, fallback: string) {
  const value = env[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

export const isProduction = env.PROD;
export const isDevelopment = env.DEV;
