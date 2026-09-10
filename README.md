# RAN Quality Config

Shared frontend quality configuration for Rockets Are Nostalgic (RAN) projects.

The package centralises the organisation-level ancestry for ESLint, Prettier and Stylelint while leaving actual project identity, source layout and justified exceptions in each consumer.

## Exports

- `@rocketsarenostalgic/quality-config/eslint/wordpress`
- `@rocketsarenostalgic/quality-config/prettier`
- `@rocketsarenostalgic/quality-config/stylelint/wordpress`
- `@rocketsarenostalgic/quality-config/stylelint/wordpress-scss`

## Tool peers

The public entry points are independently consumable. Tool peers are declared optional at package level so a repository using one quality surface is not required to install unrelated tools.

Install the peers required by the entry points a repository actually executes:

- ESLint WordPress: `eslint` `^9.39.5`;
- Prettier: `prettier` `^3.9.5`;
- Stylelint WordPress CSS: `stylelint` `^16.26.1`;
- Stylelint WordPress SCSS: `stylelint` `^16.26.1` and `stylelint-scss` `^6.14.0`.

A consumer may use several entry points together and should keep the corresponding tool versions in its own tracked package manifest and lockfile.

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
