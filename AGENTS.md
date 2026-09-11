# AGENTS.md

## Purpose

This repository owns shared RAN frontend quality configuration. It is not application runtime code.

## Boundaries

- Keep project source globs, globals, browser support, framework assumptions and product exceptions local.
- Prefer official WordPress configuration ancestry over copying upstream rules.
- Promote an additional RAN rule/plugin only after representative Starter and Booster/maintained-plugin validation.
- Treat `RocketsAreNostalgic/.github` quality policy as normative.

## Validation

Run the locked development contract before proposing changes:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm check
```

Consumer migrations should show that shared config adoption preserves or strengthens the pre-existing local quality contract.

## CI

GitHub Actions is the workflow control plane; jobs run on RAN's Blacksmith runner (`blacksmith-2vcpu-ubuntu-2404`). Keep third-party actions pinned to immutable commit SHAs and checkout credentials disabled before project-controlled commands run.
