# THE HUMAN EXPERIMENT

- The current website is https://experiment-hypothetical-preferences-protot-the-human-experiment.cejbulovje.workers.dev/. Use this address when the user asks to see the site.
- The source of truth is the `experiment/hypothetical-preferences-prototype` branch of `rovoleg/The-human-experiment`. Start from its latest revision. Preserve previously released work and keep the branch current after each change.
- When asked to make a site change, test it and publish the updated branch to that same Cloudflare Preview. If Git-triggered publishing is unavailable, run `npm run publish:site` from the canonical checkout. Open the canonical address and verify the change before sharing the link.
- Treat other deployments and older checkouts as historical. Recover specific requested changes from them and integrate them into the canonical branch. A public launch, production Worker change, or database operation is a separate task.
