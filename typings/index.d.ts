declare module 'atom-message-panel' {
    export class MessagePanelView {
        public constructor(opts: { title: string });
        public attach(): void;
        public toggle(): void;
        public clear(): void;
        public add(view: PlainMessageView): void;
        public close(): void;
    }
    export class PlainMessageView {
        public constructor(opts: { message: string; className: string });
    }
}

declare module 'glslify' {
    interface GlslifyOpts {
        basedir?: string;
        transform?: string[];
    }
    function glsl(shaderSource: string, opts: GlslifyOpts): string;
    export function compile(src: string, opts: GlslifyOpts): string;
    export function file(filename: string, opts: GlslifyOpts): string;
    export default glsl;
}

declare module 'osc-min' {
    type OscType =
        | 'string'
        | 'float'
        | 'integer'
        | 'blob'
        | 'true'
        | 'false'
        | 'null'
        | 'bang '
        | 'timetag'
        | 'array'
        | 'double';

    type OscValueElement =
        | string
        | number
        | boolean
        | Buffer
        | null
        | undefined;

    type OscValue = OscValueElement | OscValueElement[];

    interface OscArgs {
        type: OscType;
        value: OscValue;
    }

    interface OscMessage {
        oscType: 'bundle' | 'message';
        elements: OscMessage[];
        args: OscArgs[];
    }

    export function fromBuffer(buf: Buffer): OscMessage;
}

declare module 'is-relative' {
    function isRelative(path: string): boolean;
    export = isRelative;
}

declare module 'ffmpeg-static' {
    const path: string;
    export = path;
}

declare module 'shell' {
    export function showItemInFolder(path: string): void;
}
