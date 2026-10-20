# THE HUMAN EXPERIMENT — updated local project

This package contains the crowd-profile logo, updated long-term goal copy, and the public results library. The approved homepage title and introduction are preserved.

## Existing local database

Before starting the updated app against an existing local D1 database, run this once from the project folder:

```bash
npm run db:migrate:local
```

The migration deliberately keeps responses collected under the previous notice private (`is_public = 0`). New submissions are explicitly described as anonymous public responses and are visible in the public answer list. Aggregate statistics still open after 100 valid submissions.

For a fresh local database, use `npm run db:init:local` instead of running the migration first. Do not run both against the same database.

## Important before public launch

`public/privacy.html` still contains a draft notice with a contact placeholder and asks the owner to set a retention period. Resolve those items before publishing the site.

## Validation performed

JavaScript syntax checks were run for the updated frontend and Worker files. The live browser and the user's running local Wrangler server were not available in this execution environment, so visual/runtime verification against the actual local instance remains to be done.
