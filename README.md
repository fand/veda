<div align="center">
  <img alt="logo" src="https://user-images.githubusercontent.com/1403842/28923702-d8155d46-7899-11e7-817b-1193d138e5b8.png" width="192"/>
</div>

<div align="center">
  <h1>VEDA</h1>
  <i>VJ / Live Coding on Atom with GLSL.</i>
  <br>
  <br>
  <br>
  <img alt="screenshot" src="https://user-images.githubusercontent.com/1403842/28673275-1d42b062-731d-11e7-92b0-bde5ca1f1cae.gif" style="width: 100% !important;"/>
  <br>
  <br>
</div>

<div align="center">

![TravisCI](https://img.shields.io/travis/fand/veda.svg)
![apm version](https://img.shields.io/apm/v/veda.svg)
![license MIT](https://img.shields.io/apm/l/veda.svg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![Greenkeeper badge](https://badges.greenkeeper.io/fand/veda.svg)](https://greenkeeper.io/)

</div>
<br>
<br>

##### TOC

* [Features](#features)
* [Install](#install)
* [Usage](#usage)
* [Examples](#examples)

## What's this?

`VEDA` is a GLSL runtime environment for Atom.
When you write GLSL code in Atom, VEDA immediately evaluates it and shows the result on the background.
It's just like [GLSL sandbox](http://glslsandbox.com/) or [Shadertoy](https://www.shadertoy.com/), but you can use autocomplete and linter by using existing Atom packages.
Moreover, It supports Audio inputs , MIDI inputs, loading videos and images, etc...!!!!

`VEDA` has following features.

* Fragment shaders runtime like [GLSL Sandbox](http://glslsandbox.com/)
* Vertex shader runtime like [vertexshaderart.com](https://www.vertexshaderart.com/)
* Loading images / videos
* Additional `uniform` variables useful for live coding
  * Audio input
  * MIDI input
  * OSC input
  * Webcam input
  * Keyboard input
  * Gamepad input
* Auto completion (thx to [autocomplete-glsl](https://atom.io/packages/autocomplete-glsl/))
* Linting (thx to [linter-glsl](https://atom.io/packages/linter-glsl/))

## Tutorial

* [English](https://medium.com/@amagitakayosi/vj-live-coding-on-atom-glsl-livecoder-329eec5462df)
* [日本語](http://blog.gmork.in/entry/2017/08/04/173000)

## Features

### Preset `uniform` variables

* `float time`:
  * The elapsed time since `VEDA` has started.
* `vec2 resolution`
  * The resolution of the screen.
* `vec2 mouse`
  * Current position of mouse.
  * `vec2(0)` to `vec2(1)`
* `sampler2D backbuffer`
  * Rendered result of last frame.
  * RGBA format
* `sampler2D samples`
  * Samples of the audio input.
* `sampler2D spectrum`
  * FFT result of the audio input.
* `float volume`
  * The volume of the audio input.
* `sampler2D midi`
  * Last MIDI event for each channel of MIDI devices.
  * `x`: 3rd byte of the event
* `sampler2D note`
  * States of note numbers of MIDI devices.
  * `x`: the volume of the note

## Examples

### Optional Inputs

To use these features, you have to enable them by adding following lines to `.vedarc` or header comments.

* Audio inputs: `"audio": true`
* MIDI inputs: `"midi": true`
* Webcam inputs: `"camera": true`
* Keyboard inputs: `"keyboard": true`
* Gamepad inputs: `"gamepad": true`

### Multipass Rendering

VEDA supports multipass rendering.
You can define passes in `PASSES` property in `.vedarc` or header comments.

```glsl
/*
{
  "PASSES": [
    { "TARGET": "buffer" },
    {},
  ],
}
*/
```

The structure of `PASSES` property is based on [Interactive Shader Format](https://www.interactiveshaderformat.com/).
However, VEDA doesn't support `PERSISTENT` property.

VEDA supports `WIDTH` and `HEIGHT` in PASSES.
You can specify numbers for pixels or write expressions using `$WIDTH` and `$HEIGHT`.

```glsl
/*
{
  "PASSES": [
    {
      "TARGET": "buffer",
      "WIDTH": 512,  // 512px
      "HEIGHT": "$HEIGHT / 2",  // half of the render target (= Atom's width / pixelRatio)
    },
    {},
  ],
}
*/
```

See these examples for actual usage.

* [multipass.frag](./examples/multipass.frag)
* [multipass.vert](./examples/multipass.vert)

### Combining VS and FS

In `PASSES` you can specify vertex shader path from fragment shader, and vice versa.
For example, when you write header comments like below in fragment shader, VEDA will use `./vertex.vert` for vertex shader instead of default vertex shader.

```glsl
/*
{
  "PASSES": [{
    "vs": "./vertex.vert",
  }],
}
*/
```

See these examples for actual usage.

* [combination.frag](./examples/combination.frag) and [combination.vert](./examples/combination.vert)
* [particles.frag](./examples/particles.frag) and [particles.vert](./examples/particles.vert)

### Compute shader

You can write compute shaders using multipass rendering.
For compute shaders, we need to specify use float textures like this:

```glsl
/*{
  "PASSES": [
    {
      "fs": "./velocity.frag",
      "TARGET": "velocityTexture",
      "FLOAT": true,
    },
    {
      "fs": "./position.frag",
      "TARGET": "positionTexture",
      "FLOAT": true,
    },
    {
      "vs": "./scene.vert",
      "fs": "./scene.frag",
      "TARGET": "sceneTexture",
    },
    {}
  ]
}*/
```

To initialize textures, use `uniform int FRAMEINDEX`.

```glsl
uniform int FRAMEINDEX;

void main(){
    if (FRAMEINDEX == 0) {
        gl_FragColor = vec4(0);
    }
    else {
        // Do what you want
    }
}
```

See an [example](./examples/gpgpu/post.frag) for actual usage.

### Loading 3D models

You can load 3D models by passing file path to `MODEL` property in `PASSES`:

```glsl
/*{
  "PASSES": [{
    "vs": "./foo.vert",
    "MODEL": { "PATH": "./foo.obj" },
  }]
}*/
```

When you load `.obj` files in fragment shader, your shader is applied on the model defined in `.obj` file.
When you load `.obj` in vertex shader, you can use following attributes:

* `attribute vec3 position`
* `attribute vec3 normal`

Then

```glsl
precision mediump float;
attribute vec3 position;
attribute vec3 normal;
varying vec4 v_color;

void main(){
    gl_Position = vec4(position, 1);
    v_color = vec4(dot(normal, vec3(1)); // Lighting
}
```

If you use `.obj` files, you can also load `.mtl` files for materials:

```glsl
/*{
    PASSES: [{
        MODEL: {
            PATH: `foo.obj`,
            MATERIAL: `foo.mtl`,
        }
    }]
}*/
```

Materials are loaded as textures like `uniform sampler2D material0`, `uniform sampler2D material1`, etc.

See examples for more detail.

* `.obj` file ([frag](./examples/obj.frag), [vert](./examples/obj.vert))
* `.obj` with `.mtl` ([frag](./examples/obj-mtl.vert), [vert](./examples/obj-mtl.vert))
* `.json` file ([frag](./examples/json.frag), [vert](./examples/json.vert))

### glslify

VEDA supports [glslify](https://github.com/stackgl/glslify).

If `"glslify": true` is in the settings, VEDA bundles the code with glslify before evaluating.
Note that it will cause lint errors because linter-glsl doesn't support glslify.

See [examples](./examples/glslify.frag) for actual usage.

### Sound shader (experimental)

VEDA supports sound shaders like [Shadertoy](https://www.shadertoy.com/results?filter=soundoutput).

There are 2 command for sound shaders:

* `Veda: Load Sound Shader` (`alt-enter`): Play current shader as a sound shader.
* `Veda: Stop Sound Shader` (`alt-.`): Stop sound shaders.

In sound shader you have to define `vec2 mainSound(float time)` function instead of `void main()`.
`mainSound` takes current time stamp (`time`) and return the sample for stereo channels (`vec2`).

For example, this shader plays 440Hz and 660Hz sine wave in left and right channel.

```glsl
#define PI 3.141592653
vec2 mainSound(in float time) {
  return vec2(
    sin(2. * PI * time * 440.),
    sin(2. * PI * time * 660.)
  );
}
```

See an [example](./examples/sound.frag) for actual usage.

## Author

Takayosi Amagi

* Twitter: [@amagitakayosi](https://twitter.com/amagitakayosi/)
* GitHub: [fand](https://github.com/fand/)
* Blog: [マルシテイア](http://amagitakayosi.hatenablog.com/)

## License

MIT
