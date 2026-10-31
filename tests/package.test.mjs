import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { parseManifest, printManifest } from '../manifest.js'
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
test('standalone manifest validator works with the installed semver dependency', () => {
  const parsed = parseManifest(JSON.stringify({ name: 'test-theme', version: '1.0.0', notyra: { displayName: 'Test', type: 'theme', notyraVersion: '^3.1.7', theme: 'theme.json' } }))
  assert.ok(parsed.ok)
  assert.deepEqual(parseManifest(printManifest(parsed.value)), parsed)
  assert.equal(parseManifest('{').ok, false)
})
test('runtime entry explains that the host provides the API', async () => {
  await assert.rejects(import('../index.js'), /provided by Notyra/)
})
test('public exports and source version point at the independent package', () => {
  const source = JSON.parse(readFileSync(new URL('../api-source.json', import.meta.url), 'utf8'))
  assert.equal(pkg.name, '@notyra/plugin-api')
  assert.equal(pkg.version, source.apiVersion)
  assert.equal(pkg.publishConfig.access, 'public')
  assert.equal(pkg.repository.url, 'git+https://github.com/yuma-shin/notyra-plugin-api.git')
  for (const entry of Object.values(pkg.exports)) {
    assert.ok(readFileSync(new URL(`../${entry.types}`, import.meta.url)).length)
    assert.ok(readFileSync(new URL(`../${entry.import}`, import.meta.url)).length)
  }
})
test('declared types compile in a clean NodeNext consumer', () => {
  execFileSync(process.execPath, [fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url)), '-p', fileURLToPath(new URL('./tsconfig.json', import.meta.url))], { stdio: 'inherit' })
})
