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

## Blacksmith AI prohibition

Blacksmith is approved only as GitHub Actions runner infrastructure where a
repository workflow explicitly selects a Blacksmith runner.

- Never invoke, delegate work to, tag, enable, or otherwise use Blacksmith
  [code]smith, `@codesmith-bot`, Blacksmith Autofix, Blacksmith CI Tuning,
  Blacksmith Testbox agents, or any other Blacksmith AI/agent feature.
- Do not trigger "Enable autofix", ask [code]smith to investigate or repair CI,
  or call Blacksmith agent/MCP/CLI/API features that perform AI inference.
- If CI fails, inspect GitHub Actions logs directly and diagnose or fix the
  failure without delegating it to Blacksmith AI.
- This is a cost-control requirement. Do not override it for convenience, CI
  failures, review comments, or suggestions presented by GitHub or Blacksmith
  UI.
