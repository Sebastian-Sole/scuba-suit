import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
  server: {
    SERVER_URL: z.string().url().optional(),
    // Future: custom basemap API key if needed
    BASEMAP_API_KEY: z.string().optional(),
    // Geoapify API key for geocoding (free tier: 3k/day, 90k/month)
    GEOAPIFY_API_KEY: z.string().min(1),
  },

  /**
   * The prefix that client-side variables must have. This is enforced both at
   * a type-level and at runtime.
   */
  clientPrefix: 'VITE_',

  client: {
    VITE_APP_TITLE: z.string().min(1).optional(),
    // Future: client-side basemap key if needed
    VITE_BASEMAP_API_KEY: z.string().optional(),
  },

  /**
   * What object holds the environment variables at runtime. This is usually
   * `process.env` or `import.meta.env`.
   * For TanStack Start with both server and client vars, we merge both.
   */
  runtimeEnv: {
    // Server-side env vars (from .env file via process.env)
    SERVER_URL: process.env.SERVER_URL,
    BASEMAP_API_KEY: process.env.BASEMAP_API_KEY,
    GEOAPIFY_API_KEY: process.env.GEOAPIFY_API_KEY,
    // Client-side env vars (from import.meta.env, must have VITE_ prefix)
    VITE_APP_TITLE: import.meta.env.VITE_APP_TITLE,
    VITE_BASEMAP_API_KEY: import.meta.env.VITE_BASEMAP_API_KEY,
  },

  /**
   * By default, this library will feed the environment variables directly to
   * the Zod validator.
   *
   * This means that if you have an empty string for a value that is supposed
   * to be a number (e.g. `PORT=` in a ".env" file), Zod will incorrectly flag
   * it as a type mismatch violation. Additionally, if you have an empty string
   * for a value that is supposed to be a string with a default value (e.g.
   * `DOMAIN=` in an ".env" file), the default value will never be applied.
   *
   * In order to solve these issues, we recommend that all new projects
   * explicitly specify this option as true.
   */
  emptyStringAsUndefined: true,
})
