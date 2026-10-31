import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, sep, basename } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync, spawnSync } from 'node:child_process'
const version = JSON.parse(readFileSync(new URL('../package.json', import.meta.url),'utf8')).version
function fixture(run) {
  const dir = mkdtempSync(resolve(tmpdir(),'notyra-api-release-'))
  const git = (...args) => execFileSync('git',args,{cwd:dir,stdio:'pipe'})
  try {
    git('init','-b','main')
    git('config','user.email','test@example.invalid'); git('config','user.name','Test')
    writeFileSync(resolve(dir,'file'),'main')
    git('add','file'); git('commit','-m','main')
    git('update-ref','refs/remotes/origin/main','HEAD')
    const event = {action:'published',release:{draft:false,prerelease:false,tag_name:`v${version}`}}
    const check = (changes={}) => {
      writeFileSync(resolve(dir,'event.json'),JSON.stringify(event))
      return spawnSync(process.execPath,[fileURLToPath(new URL('../scripts/check-release.mjs',import.meta.url))],{cwd:dir,encoding:'utf8',env:{...process.env,GITHUB_REF_TYPE:'tag',GITHUB_REF_NAME:`v${version}`,GITHUB_REPOSITORY:'yuma-shin/notyra-plugin-api',GITHUB_EVENT_NAME:'release',GITHUB_EVENT_PATH:resolve(dir,'event.json'),...changes}})
    }
    run({git,dir,event,check})
  } finally {
    if (!dir.startsWith(resolve(tmpdir())+sep)||!basename(dir).startsWith('notyra-api-release-')) throw new Error('Cleanup escaped test directory')
    rmSync(dir,{recursive:true,force:true})
  }
}
test('published stable release with matching version on main can publish',()=>fixture(({check})=>{
  const result=check(); assert.equal(result.status,0,result.stderr)
}))
test('tag pushes, wrong versions and unpublished or prerelease events cannot publish',()=>fixture(({check,event})=>{
  assert.notEqual(check({GITHUB_EVENT_NAME:'push'}).status,0)
  assert.notEqual(check({GITHUB_REF_NAME:'v0.0.0'}).status,0)
  event.release.draft=true; assert.notEqual(check().status,0)
  event.release.draft=false; event.release.prerelease=true; assert.notEqual(check().status,0)
}))
test('a release commit outside main cannot publish',()=>fixture(({git,dir,check})=>{
  git('checkout','-b','unmerged'); writeFileSync(resolve(dir,'file'),'feature')
  git('add','file'); git('commit','-m','unmerged')
  assert.notEqual(check().status,0)
}))
