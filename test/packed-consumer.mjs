import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const consumer = mkdtempSync(join(tmpdir(), 'ran-quality-consumer-'));

try {
    const packed = JSON.parse(execFileSync('npm', [
        'pack', '--json', '--ignore-scripts', '--pack-destination', consumer,
    ], { cwd: root, encoding: 'utf8' }));
    assert.equal(packed.length, 1);

    // Deliberately omit every development dependency that is not a public peer.
    const peers = Object.fromEntries(Object.keys(manifest.peerDependencies).map((name) => {
        assert.equal(manifest.peerDependenciesMeta?.[name]?.optional, undefined);
        const version = manifest.devDependencies[name];
        assert.equal(typeof version, 'string', `Missing fixture version for ${name}`);
        return [ name, version ];
    }));
    writeFileSync(join(consumer, 'package.json'), JSON.stringify({
        name: 'ran-quality-packed-consumer',
        private: true,
        type: 'module',
        packageManager: manifest.packageManager,
        dependencies: {
            [manifest.name]: `file:./${packed[0].filename}`,
            ...peers,
        },
    }, null, 2));
    writeFileSync(join(consumer, 'pnpm-workspace.yaml'), [
        'autoInstallPeers: false',
        'strictPeerDependencies: true',
        'hoist: false',
        '',
    ].join('\n'));
    copyFileSync(new URL('./exports.test.mjs', import.meta.url), join(consumer, 'exports.test.mjs'));

    // A separate directory prevents package self-references and root devDependencies
    // from satisfying imports that are missing from the published contract.
    const options = { cwd: consumer, stdio: 'inherit', timeout: 180_000 };
    for (const [ setting, expected ] of [
        [ 'autoInstallPeers', 'false' ],
        [ 'strictPeerDependencies', 'true' ],
        [ 'hoist', 'false' ],
    ]) {
        const actual = execFileSync('pnpm', [ 'config', 'get', setting ], {
            ...options, stdio: 'pipe', encoding: 'utf8',
        }).trim();
        assert.equal(actual, expected, `Consumer must enforce ${setting}`);
    }
    execFileSync('pnpm', [ 'install', '--no-frozen-lockfile', '--ignore-scripts' ], options);
    execFileSync(process.execPath, [ '--test', 'exports.test.mjs' ], options);
} finally {
    rmSync(consumer, { recursive: true, force: true });
}
