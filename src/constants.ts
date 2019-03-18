export const INITIAL_FRAGMENT_SHADER = `
precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = vec4(uv,0.5+0.5*sin(time),1.0);
}
`;

export const INITIAL_SOUND_SHADER = `
precision mediump float;
vec2 mainSound(in float time) {
    return vec2(sin(time* 440.), sin(time * 660.));
}
`;

export const INITIAL_SHADER = [
    {
        fs: INITIAL_FRAGMENT_SHADER,
    },
];

interface IPassModel {
    PATH: string;
}

interface IPass {
    MODEL?: IPassModel;
    TARGET?: string;
    vs?: string;
    fs?: string;
    FLOAT?: boolean;
    WIDTH?: string;
    HEIGHT?: string;
}

export type IShader = IPass[];
export type ISoundShader = string;

export type IVedaStatus = any;

export interface IOscData {
    name: string;
    data: number[];
}

export type CommandType =
    | 'PLAY'
    | 'STOP'
    | 'LOAD_SHADER'
    | 'PLAY_SOUND'
    | 'STOP_SOUND'
    | 'LOAD_SOUND_SHADER'
    | 'SET_OSC'
    | 'START_RECORDING'
    | 'STOP_RECORDING'
    | 'TOGGLE_FULLSCREEN';
export type CommandData = void | IShader | string | IOscData;
export interface ICommand {
    type: CommandType;
    data: CommandData;
}
