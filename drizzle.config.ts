import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

// Load DATABASE_URL from the framework-native env file when running locally.
// On Vercel/CI, DATABASE_URL is already present in process.env, so these are
// no-ops that simply do nothing if the files are absent.
config({ path: '.env.development.local' })
config({ path: '.env.local' })
config() // .env fallback

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Add it to .env.development.local (local) or the Vercel project env (deploy) before running drizzle-kit.',
  )
}

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
  // Safer diffs against a live database.
  verbose: true,
  strict: true,
})
