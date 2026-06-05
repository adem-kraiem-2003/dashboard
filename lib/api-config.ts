export const API_CONFIG = {
  baseURL: typeof window === 'undefined'
    ? (process.env.BACKEND_URL ?? 'http://localhost:3001')
    : (process.env.NEXT_PUBLIC_API_URL ?? '/api'),
  timeout: 10000,
};
