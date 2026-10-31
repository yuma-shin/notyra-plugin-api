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

## First npm publication / 初回公開

The npm organization must grant the publishing account access to the `@notyra` scope. After merging the package source and validating the payload, sign in interactively on your own machine:

```sh
npm login --scope=@notyra --registry=https://registry.npmjs.org/
npm whoami
pnpm install --frozen-lockfile
pnpm build
pnpm test
npm pack --dry-run
npm publish --access public
```

Authentication and any 2FA confirmation are entered directly into npm's login flow. Creating the GitHub repository or npm organization alone does not publish the package. Verify with `npm view @notyra/plugin-api@3.1.7 version` before switching consumers to npm.

## Later releases with OIDC

Configure an npm [Trusted Publisher](https://docs.npmjs.com/trusted-publishers/) for this package:

- GitHub owner: `yuma-shin`
- Repository: `notyra-plugin-api`
- Workflow filename: `publish.yml`
- Environment: leave blank
- Allow direct **npm publish** (new publisher configurations may allow only staged publication by default)

Push a tag matching the package version, for example `v3.1.8` after synchronizing that API version. `.github/workflows/publish.yml` validates sources, builds/tests the package, and publishes publicly with provenance using GitHub OIDC. It does not require an npm token in repository secrets. The workflow uses Node 24 and npm 12.2.1, above npm's OIDC minimum requirements. Do not tag an already published version.

初回公開後、npm 側で上記の Trusted Publisher を設定します。以降は API と同じバージョンのタグで検証・公開できます。未設定のままタグを push しても公開は認証エラーになります。
