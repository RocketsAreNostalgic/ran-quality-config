import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import test from 'node:test';

import { ESLint } from 'eslint';
import * as prettierApi from 'prettier';
import stylelint from 'stylelint';

import eslintWordPress from '@rocketsarenostalgic/quality-config/eslint/wordpress';

const require = createRequire(import.meta.url);
const prettier = require('@rocketsarenostalgic/quality-config/prettier');
const stylelintWordPress = require('@rocketsarenostalgic/quality-config/stylelint/wordpress');
const stylelintWordPressScss = require('@rocketsarenostalgic/quality-config/stylelint/wordpress-scss');

const expectedPeers = [
    '@babel/core',
    '@wordpress/eslint-plugin',
    '@wordpress/prettier-config',
    '@wordpress/stylelint-config',
    'eslint',
    'prettier',
    'react',
    'react-dom',
    'stylelint',
    'stylelint-scss',
    'typescript',
];

test('declares every shared tool/config peer optional and retains exact development pins', async () => {
    const { devDependencies, peerDependencies, peerDependenciesMeta } = JSON.parse(
        await readFile(new URL('../package.json', import.meta.url)),
    );

    assert.deepEqual(Object.keys(peerDependencies).sort(), expectedPeers.slice().sort());

    for (const peer of expectedPeers) {
        assert.equal(peerDependenciesMeta?.[peer]?.optional, true, `${peer} must remain optional at package level`);
        assert.equal(typeof devDependencies[peer], 'string', `${peer} must remain installed for repository validation`);
        assert.match(devDependencies[peer], /^\d+\.\d+\.\d+$/, `${peer} must have an exact development pin`);
    }
});

test('loads and executes the WordPress ESLint flat-config baseline', async () => {
    assert.ok(Array.isArray(eslintWordPress));
    assert.ok(eslintWordPress.length > 0);

    const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: eslintWordPress,
    });
    const [ result ] = await eslint.lintText('export const answer = 42;\n', {
        filePath: 'fixture.js',
    });

    assert.equal(result.errorCount, 0, result.messages.map(({ message }) => message).join('\n'));
});

test('loads and executes the WordPress Prettier configuration', async () => {
    assert.equal(typeof prettier, 'object');
    assert.notEqual(prettier, null);

    const source = 'const fixture={answer:42};\n';
    const once = await prettierApi.format(source, { ...prettier, parser: 'babel' });
    const twice = await prettierApi.format(once, { ...prettier, parser: 'babel' });

    assert.equal(twice, once);
    assert.notEqual(once, source);
});

test('loads and executes the WordPress CSS Stylelint profile', async () => {
    assert.deepEqual(stylelintWordPress.extends, [ require.resolve('@wordpress/stylelint-config') ]);

    const result = await stylelint.lint({
        code: '/* RAN shared config fixture. */\n.ran-fixture {\n\tdisplay: block;\n}\n',
        codeFilename: 'fixture.css',
        config: stylelintWordPress,
    });

    assert.equal(result.errored, false, result.results.flatMap(({ warnings }) => warnings.map(({ text }) => text)).join('\n'));
});

test('loads and executes the WordPress SCSS Stylelint profile independently', async () => {
    assert.deepEqual(stylelintWordPressScss.extends, [ require.resolve('@wordpress/stylelint-config/scss') ]);

    const result = await stylelint.lint({
        code: '$display: block;\n\n.ran-fixture {\n\tdisplay: $display;\n\n\t&__child {\n\t\tdisplay: none;\n\t}\n}\n',
        codeFilename: 'fixture.scss',
        config: stylelintWordPressScss,
    });

    assert.equal(result.errored, false, result.results.flatMap(({ warnings }) => warnings.map(({ text }) => text)).join('\n'));
});
