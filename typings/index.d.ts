declare module 'atom-message-panel' {
    export class MessagePanelView {
        constructor(opts: { title: string });
        attach(): void;
        toggle(): void;
        clear(): void;
        add(view: PlainMessageView): void;
        close(): void;
    }
    export class PlainMessageView {
        constructor(opts: { message: string; className: string });
    }
}

declare module 'glslify' {
    interface IGlslifyOpts {
        basedir?: string;
        transform?: string[];
    }
    function glsl(shaderSource: string, opts: IGlslifyOpts): string;
    export function compile(src: string, opts: IGlslifyOpts): string;
    export function file(filename: string, opts: IGlslifyOpts): string;
    export default glsl;
}
