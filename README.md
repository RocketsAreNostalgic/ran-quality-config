# RAN Quality Config

Shared frontend quality configuration for Rockets Are Nostalgic (RAN) projects.

The package centralises the organisation-level ancestry for ESLint, Prettier and Stylelint while leaving actual project identity, source layout and justified exceptions in each consumer.

## Exports

- `@rocketsarenostalgic/quality-config/eslint/wordpress`
- `@rocketsarenostalgic/quality-config/prettier`
- `@rocketsarenostalgic/quality-config/stylelint/wordpress`
- `@rocketsarenostalgic/quality-config/stylelint/wordpress-scss`

## Tool peers

This is one bundled package, not independently installable toolchains. Consumers may execute any subset of its entry points, but must install the full peer set even when using only ESLint, Prettier or CSS Stylelint. All three upstream WordPress configs are unconditional dependencies, and optional peers on this package cannot make their required peers optional.

Install the package and its complete peer set as development dependencies (the versions below are the CI consumer fixture pins):

```sh
pnpm add -D @rocketsarenostalgic/quality-config @babel/core@7.29.7 eslint@9.39.5 postcss@8.5.28 prettier@3.9.5 react@18.3.1 react-dom@18.3.1 stylelint@16.26.1 stylelint-scss@6.14.0 typescript@6.0.3
```

The supported peer ranges are declared in `package.json`. Babel and TypeScript support the upstream ESLint graph; PostCSS and Stylelint-SCSS support the Stylelint graph, including its SCSS ancestry. React and React DOM satisfy the transitive WordPress theme dependencies. These are tooling dependencies, not a requirement to use React or TypeScript in application code. Keep React and React DOM on matching versions, and track the complete peer set in the consumer's manifest and lockfile.

Peer auto-installation is not required. CI installs the packed package with only this documented peer set, `autoInstallPeers: false` and `strictPeerDependencies: true`, then executes all four public entry points outside this repository.

## Design boundary

The initial release deliberately stays close to the official WordPress packages. Starter-only additions such as logical-property enforcement, rational declaration ordering, unsupported-browser warnings and animation-performance plugins are **not** promoted until they have been proven across representative RAN repositories.

Repository-local configuration continues to own:

- source globs;
- browser/Node/test environments;
- globals such as `wp`, `jQuery` and `$`;
- React/TypeScript applicability;
- browser-support policy where product-specific;
- generated/vendor exclusions;
- narrow product-specific exceptions.

## ESLint

```js
import ranWordPress from '@rocketsarenostalgic/quality-config/eslint/wordpress';

export default [
    ...ranWordPress,
    {
        files: [ 'assets/src/**/*.{js,mjs,ts,mts}' ],
        languageOptions: {
            globals: {
                jQuery: 'readonly',
            },
        },
    },
];
```

## Prettier

```json
{
    "prettier": "@rocketsarenostalgic/quality-config/prettier"
}
```

## Stylelint

CSS:

```json
{
    "extends": ["@rocketsarenostalgic/quality-config/stylelint/wordpress"]
}
```

SCSS:

```json
{
    "extends": ["@rocketsarenostalgic/quality-config/stylelint/wordpress-scss"]
}
```

## Version policy

The first release intentionally remains compatible with the proven RAN Starter/Booster tooling generation: ESLint 9, Prettier 3 and Stylelint 16, while consuming the current stable WordPress config packages in those lines. ESLint 10 / Stylelint 17 migrations should be tested across representative consumers before the shared package makes them the organisation default.

## Development

After generating and committing `pnpm-lock.yaml`:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm check
```

`pnpm check` loads every public package export and executes representative ESLint, Prettier, CSS Stylelint and SCSS Stylelint fixtures so upstream configuration-resolution problems fail in this package before reaching consumers.

`pnpm test:consumer` packs the package, installs it in a temporary consumer with only the documented peers and strict peer checking, and runs the same executable fixtures. This separate CI check requires registry access and does not inherit the repository's development dependencies.
