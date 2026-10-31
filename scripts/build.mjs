import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import assert from 'node:assert/strict'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
const source = JSON.parse(readFileSync(resolve(root, 'api-source.json'), 'utf8'))
assert.equal(pkg.version, source.apiVersion, 'Package version must match exported Plugin API version')
assert.deepEqual(pkg.dependencies, source.dependencies, 'Sync dependencies from api-source.json')
assert.deepEqual(pkg.peerDependencies, source.peerDependencies, 'Sync peers from api-source.json')
for (const [file, hash] of Object.entries(source.files))
  assert.equal(createHash('sha256').update(readFileSync(resolve(root, file))).digest('hex'), hash, `Re-export canonical API source: ${file}`)
execFileSync(process.execPath, [resolve(root, 'node_modules/typescript/bin/tsc'), '-p', resolve(root, 'tsconfig.json')], { stdio: 'inherit' })
writeFileSync(resolve(root, 'index.js'), "throw new Error('@notyra/plugin-api is provided by Notyra. Keep it external and map it to /<plugin-id>/@notyra/api.js when building your plugin.');\nexport const notyra = undefined;\nexport default notyra;\n")
console.log(`Built @notyra/plugin-api ${pkg.version}`)
