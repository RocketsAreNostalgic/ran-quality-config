import wordpress from '@wordpress/eslint-plugin';

/**
 * RAN WordPress JavaScript/TypeScript baseline.
 *
 * Repository-specific globs, runtime globals, React settings and exceptions
 * belong in the consuming repository.
 */
export default [ ...wordpress.configs.recommended ];
