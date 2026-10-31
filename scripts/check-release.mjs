import { readFileSync } from 'node:fs'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
assert.equal(process.env.GITHUB_REF_TYPE, 'tag', 'Publish only a version tag')
assert.equal(process.env.GITHUB_REF_NAME, `v${pkg.version}`, 'Tag must match package version')
assert.equal(process.env.GITHUB_REPOSITORY, 'yuma-shin/notyra-plugin-api', 'Publish from the canonical repository')
assert.equal(process.env.GITHUB_EVENT_NAME, 'release', 'Publish only a GitHub Release')
const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
assert.equal(event.action, 'published', 'Publish only a published release')
assert.equal(event.release?.draft, false, 'Release must not be a draft')
assert.equal(event.release?.prerelease, false, 'Release must be stable')
assert.equal(event.release?.tag_name, `v${pkg.version}`, 'Release tag must match package version')
execFileSync('git', ['merge-base', '--is-ancestor', 'HEAD', 'origin/main'], { stdio: 'pipe' })
