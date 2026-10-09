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
pnpm add -D @rocketsarenostalgic/quality-config @wordpress/eslint-plugin@25.7.0 @babel/core@7.29.7 eslint@9.39.5 prettier@3.9.5 react@18.3.1 react-dom@18.3.1 typescript@6.0.3
```

`@babel/core` is a required peer of the pinned WordPress ESLint plugin. Its exact transitive graph also requires Prettier and TypeScript under strict pnpm peer validation, while its transitive WordPress theme package requires React and React DOM. These are quality-tool graph requirements; they do not require the consuming application to use React or TypeScript. The ESLint family does not require Stylelint or Stylelint-SCSS.

### Prettier

```sh
pnpm add -D @rocketsarenostalgic/quality-config @wordpress/prettier-config@4.51.0 prettier@3.9.5
```

The Prettier family does not require ESLint or Stylelint.

### Stylelint WordPress CSS

```sh
pnpm add -D @rocketsarenostalgic/quality-config @wordpress/stylelint-config@26.1.0 stylelint@17.14.1 stylelint-scss@7.2.0 react@18.3.1 react-dom@18.3.1
```

### Stylelint WordPress SCSS

```sh
pnpm add -D @rocketsarenostalgic/quality-config @wordpress/stylelint-config@26.1.0 stylelint@17.14.1 stylelint-scss@7.2.0 react@18.3.1 react-dom@18.3.1
```

The pinned WordPress Stylelint package requires both `stylelint` and `stylelint-scss` even for its CSS base. Although its WordPress theme dependency declares React and React DOM optional, nested WordPress element and compose dependencies require them under strict peer validation. The packed-consumer checks retain React and React DOM, while installing neither ESLint nor Prettier. These are tooling requirements, not application framework requirements.

CI proves these boundaries from the packed artifact in separate temporary consumer roots with peer auto-installation disabled, strict peer checking enabled, and hoisting disabled. Each root installs only its documented tool-family peer set and executes the corresponding config.

## Design boundary

The initial release deliberately stays close to the official WordPress packages. The CSS and SCSS profiles follow the official WordPress configuration without additional RAN enforcement. Logical-property enforcement, rational declaration ordering, unsupported-browser warnings and animation-performance plugins are not part of this baseline.

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

The CSS profiles require WordPress configuration 26.1.0, Stylelint 17 and Stylelint-SCSS 7. ESLint 9 and Prettier 3 remain unchanged. Consumers must upgrade the CSS peer set together and qualify their local plugins and exceptions; this change does not authorize automatic rollout.

The upgrade removes the old selector-parser dependency path. The development lock resolves every `postcss-selector-parser` to 7.1.6 and every `source-map-js` to 1.2.2; consumers must also refresh and inspect their own locks.

WordPress now rejects relative font weights and private `--_wp-` / `--_gcd-` custom properties, and inherits additional declaration, media and at-rule validation. The new `declaration-property-value-no-unknown` rule validates ordinary declarations but skips custom-property values. The RAN CSS profile follows that upstream behavior: it does not restore `color-no-invalid-hex`, `unit-no-unknown` or `function-linear-gradient-no-nonstandard-direction`. Ordinary declaration validation remains tested; invalid custom-property values previously caught by those additional rules may pass. Tests compare the effective CSS and SCSS rules with their upstream profiles to prevent additional RAN enforcement.

**SCSS coverage:** upstream disables `no-descending-specificity` and `no-duplicate-selectors` for SCSS because Stylelint 17 interprets standard CSS nesting rather than Sass selector concatenation. Re-enabling those rules does not reproduce the old Sass checks. This reduces the former SCSS coverage. The [owner decision of 9 October 2026](https://github.com/RocketsAreNostalgic/.github/issues/65#issuecomment-6077430975) accepts the upstream CSS/SCSS baseline, including these limitations, without additional RAN replacement checks. See the [Stylelint 17 migration guide](https://stylelint.io/migration-guide/to-17/). CSS consumers retain the checks unless they already have local exceptions.

Shared publication remains subject to qualification of the same candidate against Core and Starter, including its project configuration and generated assets. A changed shared candidate also requires separate Core requalification. A passing package fixture alone does not satisfy that consumer requirement.

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
