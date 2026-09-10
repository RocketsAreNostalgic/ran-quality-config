import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const temporaryRoot = mkdtempSync(join(tmpdir(), 'ran-quality-consumers-'));

const versionFor = (name) => {
    const version = manifest.devDependencies[name];
    assert.equal(typeof version, 'string', `Missing exact development version for ${name}`);
    return version;
};

const families = [
    {
        name: 'eslint',
        dependencies: [ '@wordpress/eslint-plugin', '@babel/core', 'eslint', 'react', 'react-dom' ],
        absentTopLevel: [ 'prettier', 'stylelint', 'stylelint-scss' ],
        test: `
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import config from '@rocketsarenostalgic/quality-config/eslint/wordpress';
const eslint = new ESLint({ overrideConfigFile: true, overrideConfig: config });
const [ result ] = await eslint.lintText('export const answer = 42;\\n', { filePath: 'fixture.js' });
assert.equal(result.errorCount, 0, result.messages.map(({ message }) => message).join('\\n'));
`,
    },
    {
        name: 'prettier',
        dependencies: [ '@wordpress/prettier-config', 'prettier' ],
        absentTopLevel: [ 'eslint', 'stylelint', 'stylelint-scss' ],
        test: `
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import * as prettierApi from 'prettier';
const require = createRequire(import.meta.url);
const config = require('@rocketsarenostalgic/quality-config/prettier');
const source = 'const fixture={answer:42};\\n';
const formatted = await prettierApi.format(source, { ...config, parser: 'babel' });
assert.notEqual(formatted, source);
assert.equal(await prettierApi.format(formatted, { ...config, parser: 'babel' }), formatted);
`,
    },
    {
        name: 'stylelint-css',
        dependencies: [ '@wordpress/stylelint-config', 'stylelint', 'stylelint-scss', 'react', 'react-dom' ],
        absentTopLevel: [ 'eslint', 'prettier' ],
        test: `
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import stylelint from 'stylelint';
const require = createRequire(import.meta.url);
const config = require('@rocketsarenostalgic/quality-config/stylelint/wordpress');
const result = await stylelint.lint({
    code: '/* RAN packed consumer fixture. */\\n.ran-fixture {\\n\\tdisplay: block;\\n}\\n',
    codeFilename: 'fixture.css',
    config,
});
assert.equal(result.errored, false, result.results.flatMap(({ warnings }) => warnings.map(({ text }) => text)).join('\\n'));
`,
    },
    {
        name: 'stylelint-scss',
        dependencies: [ '@wordpress/stylelint-config', 'stylelint', 'stylelint-scss', 'react', 'react-dom' ],
        absentTopLevel: [ 'eslint', 'prettier' ],
        test: `
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import stylelint from 'stylelint';
const require = createRequire(import.meta.url);
const config = require('@rocketsarenostalgic/quality-config/stylelint/wordpress-scss');
const result = await stylelint.lint({
    code: '$display: block;\\n\\n.ran-fixture {\\n\\tdisplay: $display;\\n\\n\\t&__child {\\n\\t\\tdisplay: none;\\n\\t}\\n}\\n',
    codeFilename: 'fixture.scss',
    config,
});
assert.equal(result.errored, false, result.results.flatMap(({ warnings }) => warnings.map(({ text }) => text)).join('\\n'));
`,
    },
];

try {
    const packed = JSON.parse(execFileSync('npm', [
        'pack', '--json', '--ignore-scripts', '--pack-destination', temporaryRoot,
    ], { cwd: root, encoding: 'utf8' }));
    assert.equal(packed.length, 1);

    for (const family of families) {
        const consumer = join(temporaryRoot, family.name);
        mkdirSync(consumer);

        const dependencies = {
            [manifest.name]: `file:../${packed[0].filename}`,
        };
        for (const name of family.dependencies) {
            dependencies[name] = versionFor(name);
        }

        writeFileSync(join(consumer, 'package.json'), JSON.stringify({
            name: `ran-quality-${family.name}-consumer`,
            private: true,
            type: 'module',
            packageManager: manifest.packageManager,
            dependencies,
        }, null, 2));
        writeFileSync(join(consumer, 'pnpm-workspace.yaml'), [
            'autoInstallPeers: false',
            'strictPeerDependencies: true',
            'hoist: false',
            '',
        ].join('\n'));
        writeFileSync(join(consumer, 'test.mjs'), family.test.trimStart());

        const options = { cwd: consumer, stdio: 'inherit', timeout: 180_000 };
        for (const [ setting, expected ] of [
            [ 'autoInstallPeers', 'false' ],
            [ 'strictPeerDependencies', 'true' ],
            [ 'hoist', 'false' ],
        ]) {
            const actual = execFileSync('pnpm', [ 'config', 'get', setting ], {
                ...options,
                stdio: 'pipe',
                encoding: 'utf8',
            }).trim();
            assert.equal(actual, expected, `${family.name} consumer must enforce ${setting}`);
        }

        execFileSync('pnpm', [ 'install', '--no-frozen-lockfile', '--ignore-scripts' ], options);

        for (const name of family.absentTopLevel) {
            assert.equal(
                existsSync(join(consumer, 'node_modules', name)),
                false,
                `${family.name} consumer unexpectedly installed unrelated top-level peer ${name}`,
            );
        }

        execFileSync(process.execPath, [ 'test.mjs' ], options);
    }
} finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
}
