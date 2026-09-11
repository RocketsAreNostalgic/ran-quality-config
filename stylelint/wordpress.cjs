'use strict';

// Resolve the upstream config from this package's peer context rather than
// asking Stylelint to resolve it relative to the consuming repository.
module.exports = {
    extends: [ require.resolve('@wordpress/stylelint-config') ],
};
