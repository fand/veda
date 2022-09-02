import { Uniform } from 'three';

export const DEFAULT_VERTEX_SHADER = `
varying vec2 vUv;
varying float vObjectId;
varying vec4 v_color;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const DEFAULT_3_VERTEX_SHADER = `#version 300 es
#define attribute in
#define varying out
#define texture2D texture
precision highp float;
precision highp int;
invariant gl_Position;

uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
uniform bool isOrthographic;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;


varying vec2 vUv;
varying float vObjectId;
varying vec4 v_color;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

export const DEFAULT_FRAGMENT_SHADER = `
precision mediump float;
varying vec2 vUv;
varying float vObjectId;
varying vec4 v_color;
void main() {
    gl_FragColor = v_color;
}
`;

export const SAMPLE_WIDTH = 1280;
export const SAMPLE_HEIGHT = 720;

// ref. https://github.com/mrdoob/three.js/wiki/Uniforms-types
export type UniformType =
    | '1i'
    | '1f'
    | '2f'
    | '3f'
    | '1iv'
    | '3iv'
    | '1fv'
    | '2fv'
    | '3fv'
    | '4fv'
    | 'Matrix3fv'
    | 'Matric4fv'
    | 'i'
    | 'f'
    | 'v2'
    | 'v3'
    | 'v4'
    | 'c'
    | 'm4'
    | 't'
    | 'iv1'
    | 'iv'
    | 'fv1'
    | 'fv'
    | 'v2v'
    | 'v3v'
    | 'v4v'
    | 'm4v'
    | 'tv';

export interface IVedaOptions {
    pixelRatio?: number;
    frameskip?: number;
    vertexMode?: string;
    vertexCount?: number;
    fftSize?: number;
    fftSmoothingTimeConstant?: number;
}

export const DEFAULT_VEDA_OPTIONS = {
    frameskip: 1,
    pixelRatio: 1,
    vertexCount: 3000,
    vertexMode: 'TRIANGLES',
};

export interface IPassModel {
    PATH: string;
    MATERIAL?: string;
}

export interface IPass {
    MODEL?: IPassModel;
    TARGET?: string;
    vs?: string;
    fs?: string;
    FLOAT?: boolean;
    WIDTH?: string;
    HEIGHT?: string;
    BLEND?: BlendMode;
    GLSL3?: boolean;
}

export type BlendMode = 'NO' | 'NORMAL' | 'ADD' | 'SUB' | 'MUL';

export type IShader = IPass | IPass[];

export interface IUniforms {
    [key: string]: {
        type: string;
        value: Uniform['value'];
    };
}
