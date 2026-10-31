// Plugin_API type definitions (canonical source of `@notyra/plugin-api`)
export class PluginApiError extends Error {
    kind;
    details;
    constructor(kind, message, details) {
        super(message ?? kind);
        this.name = 'PluginApiError';
        this.kind = kind;
        this.details = details;
    }
}
