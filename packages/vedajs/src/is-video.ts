function extname(name: string): string | undefined {
    const m = name.match(/\.([^.]*)$/);
    return m?.[1];
}

const videoExtensions = [
    '3g2',
    '3gp',
    'aaf',
    'asf',
    'avchd',
    'avi',
    'drc',
    'flv',
    'm2v',
    'm4p',
    'm4v',
    'mkv',
    'mng',
    'mov',
    'mp2',
    'mp4',
    'mpe',
    'mpeg',
    'mpg',
    'mpv',
    'mxf',
    'nsv',
    'ogg',
    'ogv',
    'qt',
    'rm',
    'rmvb',
    'roq',
    'svi',
    'vob',
    'webm',
    'wmv',
    'yuv',
];

export default function (filepath: string): boolean {
    const ext = extname(filepath)?.toLowerCase();
    return ext !== undefined && videoExtensions.includes(ext);
}
