# THE HUMAN EXPERIMENT — starter kit

A minimal bilingual (English/Russian) survey with Cloudflare Turnstile, a D1 database, a server endpoint, and aggregate results that unlock after 100 responses.

## Important status

This is a starter implementation, not a deployed site. It has not been tested against a real Cloudflare account or live Turnstile keys. Test it in a preview deployment before public launch. Do not publish until the privacy notice, project contact, retention policy, and Turnstile configuration are completed.

## What it does

- Serves a responsive survey in English and Russian.
- Validates choices and text length on the server.
- Verifies Turnstile tokens server-side.
- Limits submissions to 3 per hour per IP-derived keyed hash. The raw IP is not stored by this application. Old rate-limit hashes are deleted after 24 hours; the hash is still pseudonymous technical data and should be disclosed in the privacy notice.
- Stores survey answers in D1.
- Exposes only aggregate counts at `/api/results`; counts are hidden until 100 responses.
- Does not automatically publish free-text answers.

The rate limit is not proof of one response per person: people can use multiple networks/devices, while people sharing a network may share a limit. Turnstile and rate limiting reduce abuse; they do not eliminate it.

## Deploy (Cloudflare Workers + D1)

1. Create a Cloudflare account and install a current Node.js LTS release.
2. In the project folder, run `npm install`.
3. Create a D1 database:
   `npx wrangler d1 create the-human-experiment`
4. Copy the returned database ID into `wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`.
5. Initialize the database:
   `npm run db:init:remote`
6. In the Cloudflare dashboard, open Turnstile and create a widget. Add your eventual public hostname. For local testing, use Cloudflare's documented test keys.
7. Replace `REPLACE_WITH_TURNSTILE_SITE_KEY` in `public/index.html` with the public site key. It is okay for this key to be visible in the page.
8. Add the private Turnstile secret as a Worker secret:
   `npx wrangler secret put TURNSTILE_SECRET_KEY`
9. Add a random, long rate-limit salt as a Worker secret:
   `npx wrangler secret put RATE_LIMIT_SALT`
   Keep it secret and stable. Changing it resets the effective rate-limit identities.
10. Test locally with `npm run dev`. Use the documented Turnstile test keys and a local D1 database initialized with `npm run db:init:local`. For local testing, add test secrets to `.dev.vars` (never commit this file).
11. Deploy with `npm run deploy`.
12. Open the deployed URL on mobile and desktop; test valid/invalid submissions, captcha failure, rate limit, and the results threshold. Confirm the private D1 database is not exposed to the public.
13. Replace the draft contact and retention text in `public/privacy.html` and have the final privacy notice reviewed before launch.

## Before public launch

- Add the real Turnstile site key and secret; never put the secret in frontend files.
- Add your project contact and a real retention period to the privacy notice.
- Decide whether to keep the demographic questions; they are optional but still sensitive enough to warrant data minimization.
- Add backups/export procedure for the D1 responses.
- Consider a moderation workflow before publishing any free-text answers. This starter kit intentionally does not expose them publicly.
- Add rate-limit cleanup for old `rate_limits` rows if traffic grows.
- Review applicable privacy obligations for your audience and hosting configuration.

## Data model

`responses` stores answer text, choice indexes, language and timestamp. `rate_limits` stores a keyed hash of the source IP and a rolling-window counter; it does not store raw IP addresses. Cloudflare may separately process technical metadata as part of serving the site and Turnstile.
