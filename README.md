# RAN Quality Config

Shared frontend quality configuration for Rockets Are Nostalgic (RAN) projects.

The package centralises the organisation-level ancestry for ESLint, Prettier and Stylelint while leaving actual project identity, source layout and justified exceptions in each consumer.

## Exports

- `@rocketsarenostalgic/quality-config/eslint/wordpress`
- `@rocketsarenostalgic/quality-config/prettier`
- `@rocketsarenostalgic/quality-config/stylelint/wordpress`
- `@rocketsarenostalgic/quality-config/stylelint/wordpress-scss`

## Tool-family peers

The public entry points are independently consumable by tool family. The shared package declares its upstream WordPress configs and host-tool requirements as optional peers so installing one family does not force unrelated quality tools into the consumer.

Install the package plus the peers required by the entry points a repository actually uses. The versions below are the exact development/consumer-fixture pins for this release; compatible peer ranges are declared in `package.json`.

### ESLint WordPress

```sh
pnpm add -D @rocketsarenostalgic/quality-config @wordpress/eslint-plugin@25.7.0 @babel/core@7.29.7 eslint@9.39.5 react@18.3.1 react-dom@18.3.1
```

`@babel/core` is a required peer of the pinned WordPress ESLint plugin. React and React DOM satisfy the required peer boundary of its transitive WordPress theme package. Prettier and TypeScript are optional in the pinned WordPress ESLint graph and are not required for the JavaScript-only baseline fixture.

### Prettier

```sh
pnpm add -D @rocketsarenostalgic/quality-config @wordpress/prettier-config@4.51.0 prettier@3.9.5
```

### Stylelint WordPress CSS

```sh
pnpm add -D @rocketsarenostalgic/quality-config @wordpress/stylelint-config@24.0.0 stylelint@16.26.1 stylelint-scss@6.14.0 react@18.3.1 react-dom@18.3.1
```

### Stylelint WordPress SCSS

```sh
pnpm add -D @rocketsarenostalgic/quality-config @wordpress/stylelint-config@24.0.0 stylelint@16.26.1 stylelint-scss@6.14.0 react@18.3.1 react-dom@18.3.1
```

The pinned WordPress Stylelint package requires both `stylelint` and `stylelint-scss` even for its CSS base and depends on the WordPress theme package, whose React and React DOM peers are required. This is an upstream tool-family requirement, not a requirement for the consuming application to use SCSS or React.

CI proves these boundaries from the packed artifact in separate temporary consumer roots with peer auto-installation disabled, strict peer checking enabled, and hoisting disabled. Each root installs only its documented tool-family peer set and executes the corresponding config.

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

The RAN Stylelint entry points resolve their pinned WordPress config peer from the shared package's own peer context. This avoids making Stylelint resolve the WordPress config relative to the consuming repository.

## Version policy

The first release intentionally remains compatible with the proven RAN Starter/Booster tooling generation: ESLint 9, Prettier 3 and Stylelint 16, while consuming the reviewed WordPress config versions in those lines. ESLint 10 / Stylelint 17 migrations should be tested across representative consumers before the shared package makes them the organisation default.

## Development

After generating and committing `pnpm-lock.yaml`:

```sh
corepack enable
pnpm install --frozen-lockfile
pnpm check
pnpm test:consumer
```

`pnpm check` executes representative ESLint, Prettier, CSS Stylelint and SCSS Stylelint fixtures against the repository's complete development graph.

`pnpm test:consumer` packs the package and separately proves each tool family from an isolated consumer with only its documented peers. This check requires registry access and deliberately does not inherit the repository's development dependencies.
