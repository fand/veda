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

export interface ILoadShaderCommand {
    type: 'LOAD_SHADER';
    shader: IShader;
}

export interface ILoadSoundShaderCommand {
    type: 'LOAD_SOUND_SHADER';
    shader: string;
}

export interface IPlayCommand {
    type: 'PLAY';
}

export interface IPlaySoundCommand {
    type: 'PLAY_SOUND';
}

export interface ISetOscCommand {
    type: 'SET_OSC';
    data: IOscData;
}

export interface IStartRecordingCommand {
    type: 'START_RECORDING';
}

export interface IStopCommand {
    type: 'STOP';
}

export interface IStopRecordingCommand {
    type: 'STOP_RECORDING';
}

export interface IStopSoundCommand {
    type: 'STOP_SOUND';
}

export interface IToggleFullscreenCommand {
    type: 'TOGGLE_FULLSCREEN';
}

export type Command =
    | ILoadShaderCommand
    | ILoadSoundShaderCommand
    | IPlayCommand
    | IPlaySoundCommand
    | ISetOscCommand
    | IStartRecordingCommand
    | IStopCommand
    | IStopRecordingCommand
    | IStopSoundCommand
    | IToggleFullscreenCommand;

export interface IAudioInputsQuery {
    type: 'AUDIO_INPUTS';
}

export interface ITimeQuery {
    type: 'TIME';
}

export interface IVideoInputsQuery {
    type: 'VIDEO_INPUTS';
}

export type Query = IAudioInputsQuery | ITimeQuery | IVideoInputsQuery;
