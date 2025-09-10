Integrating Dotenvx with Supabase Branching
===========================================

Goal
----

- Keep production Google OAuth values safe and stable.
- Enable preview branches to use encrypted secrets without leaking plaintext.
- Avoid Supabase PRs overwriting `config.toml` with `env(GOOGLE_CLIENT_ID)` defaults.

What changed
------------

- `supabase/config.toml` now uses:
  - `client_id = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID)"`
  - `secret    = "env(SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET)"`
- New env files for dotenvx:
  - `supabase/.env.production` (committed, encrypted values)
  - `supabase/.env.preview` (committed, encrypted values for PR branches)
  - `supabase/.env.keys` (gitignored; holds private decryption keys)
  - `supabase/.env.local` (gitignored; local plaintext for dev)
- `.gitignore` updated to track the two encrypted files above.
- NPM scripts to run Supabase CLI via dotenvx for prod/preview.

Install dotenvx (one-time)
-------------------------

You can use `npx` directly, or install locally:

```bash
npm i -D @dotenvx/dotenvx
```

Set production secrets (encrypted)
----------------------------------

Encrypt and commit your production Google credentials into `supabase/.env.production`:

```bash
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "<prod-client-id>" -f supabase/.env.production
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "<prod-client-secret>" -f supabase/.env.production

# Optional auth URL settings
npx @dotenvx/dotenvx set SUPABASE_AUTH_SITE_URL "https://<your-app-url>" -f supabase/.env.production
npx @dotenvx/dotenvx set SUPABASE_AUTH_ADDITIONAL_REDIRECT_URLS "https://<your-app-url>/**" -f supabase/.env.production
```

Set preview (PR) secrets (encrypted)
------------------------------------

```bash
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID "<preview-client-id>" -f supabase/.env.preview
npx @dotenvx/dotenvx set SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET "<preview-client-secret>" -f supabase/.env.preview
# Optional
npx @dotenvx/dotenvx set SUPABASE_AUTH_SITE_URL "https://<your-preview-app-url>" -f supabase/.env.preview
npx @dotenvx/dotenvx set SUPABASE_AUTH_ADDITIONAL_REDIRECT_URLS "https://<your-preview-app-url>/**" -f supabase/.env.preview
```

Important: upload decryption keys to Supabase
---------------------------------------------

Dotenvx writes the decryption keys to `supabase/.env.keys` (gitignored). Upload those keys to each Supabase project that will build from this repo so the branching executor can decrypt values:

Do this once per remote project (both `main` and `develop`):

```bash
# Link to the project you want to update (pick one at a time)
npx supabase link --project-ref rcbddkhvysexkvgqpcud   # main (production)
# or
npx supabase link --project-ref kpqrzaisoyxqillzpbms   # develop (persistent branch)

# Upload keys for that linked project
npx supabase secrets set --env-file supabase/.env.keys
```

Local development
-----------------

Add your local plaintext values to `supabase/.env.local` (this file is gitignored), or keep using the existing `.env.supabase.local` with the new variable names present.

Running deploys via dotenvx (optional but recommended)
-----------------------------------------------------

Use the provided npm scripts to ensure envs are loaded correctly when pushing configs or migrations:

```bash
# Production
npm run s:link:prod
npm run s:db:push:prod
npm run s:config:push:prod

# Preview (for PR branches)
npm run s:db:push:preview
npm run s:config:push:preview
```

How this prevents overrides
---------------------------

- `config.toml` references stable, explicit keys (`SUPABASE_AUTH_EXTERNAL_GOOGLE_*`).
- Preview branches commit an encrypted `supabase/.env.preview` that the Supabase branching executor reads, provided the project has the decryption keys from `supabase/.env.keys`.
- Production uses `supabase/.env.production` in CI or when running `config push` manually, so your real values aren’t replaced by bare `env(GOOGLE_* )` defaults.

Troubleshooting
---------------

- If logs show `WARN: environment variable is unset`, ensure:
  - The appropriate `.env.*` file is committed (for preview) or present in CI (for production).
  - `supabase/.env.keys` was uploaded to the targeted Supabase project via `supabase secrets set`.
  - The executor actually runs from your repo’s `supabase` directory (default behavior) and has access to `.env.preview`.
- If the executor says `Loading config override: [remotes.main]` for a develop PR, that’s okay as long as `.env.preview` is present—the env values will still resolve from the encrypted preview file.
