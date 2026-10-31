# @notyra/plugin-api

Official Plugin API types and manifest validator for Notyra. Source repository: [yuma-shin/notyra-plugin-api](https://github.com/yuma-shin/notyra-plugin-api). The public npm package belongs to the **@notyra** organization.

Notyra のプラグイン API 型定義とマニフェスト検証器です。プラグインやテンプレートへのコピー同梱をやめ、このリポジトリでビルド・検証・npm 配布を管理します。

## Use / 利用

After the first npm publication:

```sh
pnpm add -D @notyra/plugin-api@3.1.7
```

```ts
import { notyra } from '@notyra/plugin-api'
import type { Disposable, NotyraPluginApi } from '@notyra/plugin-api'
// Build-time validation, usable in Node:
import { parseManifest, printManifest } from '@notyra/plugin-api/manifest'
```

Keep the runtime API import external and map it to `/<plugin-id>/@notyra/api.js`. React and CodeMirror also use the host's shared virtual modules. The normal JavaScript entry throws a configuration error if executed directly. Interfaces and error types use `import type`.

実行時 API は Notyra が提供します。`@notyra/plugin-api` の通常のエントリをバンドルせず、`/<プラグインID>/@notyra/api.js` に変換してください。型だけの import は `import type` を使います。`./manifest` は Node 上で実行できる検証用サブパスです。

Before npm publication, consumers may temporarily pin this repository's immutable commit tarball. Generated declarations and runtime validator files are committed, so installing the snapshot does not need a build hook. Replace the snapshot with exact npm version `3.1.7` after publication and regenerate the consumer lockfiles. Do not edit or vendor a second copy.

## Develop and synchronize / 開発と同期

Node 24 and pnpm 12.15.0:

```sh
pnpm install --frozen-lockfile
pnpm build
pnpm test
npm pack --dry-run
```

The canonical contracts remain in the Notyra application. Run this command **from the app repository**, passing your checkout of this repository:

```sh
pnpm plugins:export-api ../notyra-plugin-api
```

`src/` and `api-source.json` are generated from `src/shared/plugin/api.ts`, `types.ts`, the manifest validator and `MarkdownNoteMeta`. Export does not overwrite this repository's package configuration, README or workflows. Match `package.json` version/dependencies/peerDependencies to `api-source.json`, then build, test and commit the generated `.js` / `.d.ts` outputs together. Build checks source hashes and version parity. CI rebuilds and rejects stale generated outputs.

本体が API の正本です。生成後は `api-source.json` と package.json のバージョン・依存関係を揃え、ビルド結果も一緒にコミットします。本体の生成コマンドは、このリポジトリの README・package.json・公開設定を上書きしません。API の版は本体の Plugin API の版と一致させます。

## npm setup / npm 側の事前準備

Publishing happens from GitHub Releases using OIDC. According to npm's [trust prerequisites](https://docs.npmjs.com/cli/v12/commands/npm-trust/#prerequisites), a package must already exist on npm before its Trusted Publisher can be configured. A new GitHub repository and npm organization alone are insufficient. Creating the package initially is a separate bootstrap step; this workflow cannot create an entirely new npm package using unconfigured OIDC. Complete that setup before publishing a Release.

公開は GitHub Releases と OIDC を使います。ただし npm の現行仕様では Trusted Publisher の設定対象パッケージが既に存在する必要があります。完全に未作成の npm パッケージの初回作成は事前準備として別途必要です。organization の作成だけでは設定・初回公開は完了しません。この制約を解消してから Release を公開してください。

Configure an npm [Trusted Publisher](https://docs.npmjs.com/trusted-publishers/):

- GitHub owner: `yuma-shin`
- Repository: `notyra-plugin-api`
- Workflow filename: `publish.yml`
- Environment: leave blank
- Allow direct **npm publish** (new publisher configurations may allow only staged publication by default)

## Release / リリース

1. Merge the API change and generated outputs into **main**.
2. Create a version tag matching package.json, such as **v3.1.7**, on that main commit.
3. Publish a stable **GitHub Release** for that tag.
4. `.github/workflows/publish.yml` builds/tests and publishes with GitHub OIDC and provenance.

A tag push alone does not publish. Draft releases, prereleases, mismatched versions and commits outside main cannot publish. No npm token or local npm login is used by the workflow. Node 24 and npm 12.2.1 satisfy npm's OIDC requirements. Verify `npm view @notyra/plugin-api@3.1.7 version` before switching consumers to the exact npm version. Never release a version that already exists on npm.

**main にマージ → main 上のコミットへバージョンタグ → 正式な GitHub Release を公開 → OIDC で npm 公開**の順です。タグを push しただけでは公開しません。パッケージの版とタグが一致し、リリースのコミットが main に含まれることを検証します。トークンを GitHub Secrets に保存する必要はありません。npm 側の事前設定がない場合は公開に失敗します。
