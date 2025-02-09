import { z } from 'zod';

const envSchema = z.object({
  VITE_SPOTIFY_CLIENT_ID: z.string().default(''),
  VITE_API_URL: z.string().url().default('http://localhost:5173'),
});

// Safely parse environment variables with fallbacks
const env = envSchema.parse({
  VITE_SPOTIFY_CLIENT_ID: import.meta.env.VITE_SPOTIFY_CLIENT_ID || '',
  VITE_API_URL: import.meta.env.VITE_API_URL || 'http://localhost:5173',
});

export const config = {
  spotify: {
    clientId: env.VITE_SPOTIFY_CLIENT_ID,
  },
  apiUrl: env.VITE_API_URL,
} as const;

// Add a development warning if Spotify client ID is missing
if (!env.VITE_SPOTIFY_CLIENT_ID && import.meta.env.DEV) {
  console.warn(
    'Warning: VITE_SPOTIFY_CLIENT_ID is not set in your .env file. Spotify integration will not work.'
  );
}