import type { NotyraPluginApi, PluginModule, PluginManifest, Disposable } from '@notyra/plugin-api'
import { parseManifest } from '@notyra/plugin-api/manifest'
const plugin: PluginModule = { activate() {}, deactivate() {} }
declare const api: NotyraPluginApi
const disposable: Disposable = api.styles.add('body {}')
const parsed = parseManifest('{}')
const manifest: PluginManifest | null = parsed.ok ? parsed.value : null
void [plugin, disposable, manifest]
