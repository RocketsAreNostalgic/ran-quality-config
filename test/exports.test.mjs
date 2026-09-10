import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

import eslintWordPress from '@rocketsarenostalgic/quality-config/eslint/wordpress';

const require = createRequire(import.meta.url);
const prettier = require('@rocketsarenostalgic/quality-config/prettier');
const stylelintWordPress = require('@rocketsarenostalgic/quality-config/stylelint/wordpress');
const stylelintWordPressScss = require('@rocketsarenostalgic/quality-config/stylelint/wordpress-scss');

test('exports the WordPress ESLint flat-config baseline', () => {
    assert.ok(Array.isArray(eslintWordPress));
    assert.ok(eslintWordPress.length > 0);
});

test('exports the WordPress Prettier configuration', () => {
    assert.equal(typeof prettier, 'object');
    assert.notEqual(prettier, null);
});

test('exports CSS and SCSS Stylelint profiles', () => {
    assert.deepEqual(stylelintWordPress.extends, [ '@wordpress/stylelint-config' ]);
    assert.deepEqual(stylelintWordPressScss.extends, [ '@wordpress/stylelint-config/scss' ]);
});
