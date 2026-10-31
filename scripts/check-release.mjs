import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
assert.equal(process.env.GITHUB_REF_TYPE, 'tag', 'Publish only a version tag')
assert.equal(process.env.GITHUB_REF_NAME, `v${pkg.version}`, 'Tag must match package version')
assert.equal(process.env.GITHUB_REPOSITORY, 'yuma-shin/notyra-plugin-api', 'Publish from the canonical repository')
