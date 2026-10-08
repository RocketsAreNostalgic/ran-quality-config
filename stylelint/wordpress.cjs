'use strict';

// Resolve the upstream config from this package's peer context rather than
// asking Stylelint to resolve it relative to the consuming repository.
module.exports = {
    extends: [ require.resolve('@wordpress/stylelint-config') ],
    // The replacement property-value validator skips custom-property values.
    // Retain the previous CSS checks there as well as on ordinary declarations.
    rules: {
        'color-no-invalid-hex': true,
        'unit-no-unknown': true,
        'function-linear-gradient-no-nonstandard-direction': true,
    },
};
