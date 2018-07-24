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

## Install

### Install `glslangValidator`

`VEDA` requires `glslangValidator`.<br>
Follow the below steps to install `glslangValidator`.

#### macOS

If you are uning macOS, `glslangValidator` can be installed by homebrew.

```sh
brew install glslang
```

#### Windows or Linux

If you are uning Windows or Linux, the best way to install `glslangValidator` is to install Vulkan SDK.<br>
Get the SDK from here:

https://www.lunarg.com/vulkan-sdk/

After that, add installed `glslangValidator` to your `PATH` environment variable.<br>
In Windows, `glslangValidator` will be installed in `C:\VulkanSDK\( version )\Bin`.

The path of `glslangValidator` can also be specified in the settings of `VEDA`.

### Install `VEDA`

Just install from Atom GUI or `apm`.

`$ apm install veda`

If Atom shows an error like below, try rebuilding the package from 🐞 icon on the footer.

```
Failed to require the main module of 'veda' because it requires an incompatible native module.
Run `apm rebuild` in the package directory to resolve.
```

## Features

### Commands

`VEDA` installs following commands to Atom.

* `toggle`
  * Start / Stop VEDA.
* `load-shader` (key: `ctrl-enter`)
  * Load the shader on current editor.
* `watch-shader` (key: `ctrl-shift-enter`)
  * Watch current tab and load the shader automatically.
* `watch-active-editor` (key: `ctrl-alt-enter`)
  * Watch active tab and run `watch-shader` automatically.
* `stop-watching` (key: `ctrl-.`)
  * Stop `watch-shader` and `watch-active-editor`.
* `toggle-fullscreen` (key: `ctrl-escape`)
  * Show the output fullscreen in the window

A typical workflow can be like this:

1.  Enable `VEDA` by running `veda:toggle` from the Command Palette of Atom.
2.  Edit your GLSL code.
3.  Hit `ctrl-enter` to run `veda:load-shader`.

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

### Settings

The settings of `VEDA` can be configured in 3 ways: global settings, project settings, and file settings.

* Global settings are loaded from Settings page of Atom.
* Project settings are loaded from `.vedarc`.
* File settings are loaded from the comments of the shader.

The order of priority is as follows:

`File Settings > Project Settings > Global Settings`

When File Settings and Global Settings has same properties, File Settings are used.

#### Global Settings

Global settings are most general settings.
You can change settings in `Settings` page of Atom.

If there are no project `.vedarc` or valid comments, VEDA will use the global settings as default.

#### Project Settings: `.vedarc`

Project settings is loaded from `.vedarc` on your project root.

* `.vedarc` must be located in your project's root directory.
* `.vedarc` is parsed as [JSON5 format](https://github.com/json5/json5).
  * You can write comments in `.vedarc`.
* `.vedarc` is loaded on startup and reloaded automatically when you edit it.

For example, when you write `.vedarc` like this:

```javascript
{
  "IMPORTED": {
    "image1": {
      "PATH": "./1.jpg",
    },
  },
  "vertexMode": "LINES",
  "pixelRatio": 2,
  "audio": true,
  "midi": true,
}
```

Then `VEDA` interpret like this:

* Load `./1.jpg` as a texture `image1`
* Draw lines on vertex shaders
* Enable audio input
* Enable MIDI input

#### File Settings

You can also write settings specific for the file.
Write comments on the head of the file like this:

```glsl
/*{ "audio": true }*/

void main() {
    ...
}
```

The comment must be written in the same format as `.vedarc`.

## Examples

### Fragment Shaders

You can write fragment shaders like [GLSL Sandbox](http://glslsandbox.com).

Fragment shaders must be named like `*.frag`.
Create a file `foo.frag` like this:

```glsl
precision mediump float;
uniform float time;
uniform vec2 resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(time), 1.0);
}
```

Then save it and hit `ctrl-enter` to run it.
VEDA will show the result on the background.

See [examples](./examples/shader1.frag) for actual usage.

### Vertex Shaders

VEDA also supports vertex shaders like [vertexshaderart.com](https://vertexshaderart.com/).

Vertex shaders must be named like `*.vert`.
Create a file `foo.vert` like this:

```glsl
/*{ "vertexCount": 300 }*/
precision mediump float;
attribute float vertexId;
uniform float vertexCount;
uniform float time;
uniform vec2 resolution;
varying vec4 v_color;

void main() {
  float i = vertexId + time *2.;

  vec3 pos = vec3(
    cos(i * 1.0),
    sin(i * 1.1),
    cos(i * 1.2)
  );

  gl_Position = vec4(pos.x, pos.y, pos.z, 1);

  v_color = vec4(fract(vertexId / 3.), 1, 1, 1);
}
```

Then save it and hit `ctrl-enter` to run it.
VEDA will show the result on the background.

See [examples](./examples/vertex.vert) for actual usage.

### Optional Inputs

To use these features, you have to enable them by adding following lines to `.vedarc` or header comments.

* Audio inputs: `"audio": true`
* MIDI inputs: `"midi": true`
* Webcam inputs: `"camera": true`
* Keyboard inputs: `"keyboard": true`
* Gamepad inputs: `"gamepad": true`

### Audio inputs

You can use audio data of the audio input.
These data are obtained by AnalyserNode of [Web Audio API](https://webaudio.github.io/web-audio-api/).

`sampler2D samples` stores the most recent 256 frames from the audio input.
This is useful for drawing waveforms.

`sampler2D spectrum` stores the FFT result.
This is useful to draw the volume of specific frequency band, such as spectrum visualizer.

`float volume` is the average of all the frequency bands in `spectrum`.
See [examples](./examples/audio.frag) for actual usage.

### MIDI Events

`sampler2D midi` stores MIDI events obtained by [Web MIDI API](https://www.w3.org/TR/webmidi/).
The size of `midi` is `256x128`.
Each pixel stores the last event of the corresponding MIDI Events.

For example, `texture2D(midi, vec2(144. / 256., 0)).x` yields the note number of last `note on` event of MIDI Channel 1.

* `144.` (0x90): `note on` event of MIDI Channel 1
* `.x` (2nd byte): Note number

See [examples](./examples/midi.frag) for actual usage.

`sampler2D note` stores the volumes for each note number
The size of `midi` is `128x1`.
Each pixel stores the volume of the last event for corresponding MIDI note.

For example, `texture2D(note, vec2(60. / 128., 0)).x` yields the volume of note `C4` (Middle C).

See [examples](./examples/note.frag) for actual usage.

### OSC Inputs

VEDA accepts OSC messages on the port written in `osc` property of the settings.
When you write `"osc": 4000` to `.vedarc` or the header comment, messages will be stored and passed as textures:

* Texture name will be automatically generated from addresses.
  * `/foo`: `sampler2D osc_foo`
  * `/foo/bar`: `sampler2D osc_foo_bar`
* Arguments are translated to float. Strings are ignored.
  * `/foo 0.1 hello 100` yields a texture that contains `[0.1 0 100]`

See [examples](./examples/osc.frag) for actual usage.

### Webcam Inputs

`sampler2D camera` stores the images from the webcam.
`texture2D(camera, uv)` returns vec3 color.

See [examples](./examples/camera.frag) for actual usage.

### Keyboard Inputs

`sampler2D key` stores the status of keyboard.
The size of `keyboard` is `256x1`.

For example, `texture2D(key, vec2(65. / 256., 0.))` returns 1.0 when `a` is pressed.

Hitting `ESC` key resets the states of all key inputs.

See [examples](./examples/key.frag) for actual usage.

### Gamepad Inputs

`sampler2D gamepad` stores the status of gamepads connected to the PC.
The size of `gamepad` is `128x2`.
The status of buttons and axes are stored in `y = 0.0` and `y = 1.0`.

For example, `texture2D(gamepad, vec2(3. / 128., 0.))` returns 1.0 when the 3rd button is pressed.

See [examples](./examples/gamepad.frag) for actual usage.

### Loading images / videos

You can load images and videos by adding `IMPORTED` property in `.vedarc` or header comments.
If you write the path or URL of the resourece, it will be loaded automatically:

```glsl
/*
{
  "IMPORTED": {
    "image1": {
      "PATH": "1.jpg",
    },
    "image2": {
      "PATH": "../2.png",
    },
    "video1": {
      "PATH": "/Users/foo/Movies/1.mp4",
    },
    "video2": {
      "PATH": "http://example.com/2.mp4",
      "SPEED": 2,  // played 2x faster
    },
  },
}
*/
precision mediump float;
uniform vec2 resolution;

uniform sampler2D image1;
uniform sampler2D image2;
uniform sampler2D video1;
uniform sampler2D video2;

void main() {
	vec2 uv = gl_FragCoord.xy / resolution;

	gl_FragColor = (
		texture2D(image1, uv) +
		texture2D(image2, uv) +
		texture2D(video1, uv) +
    texture2D(video2, uv)
  );
}
```

The structure of `IMPORTED` properties is based on [Interactive Shader Format](https://www.interactiveshaderformat.com/).

See these examples for actual usage.

* [.vedarc](./examples/.vedarc)
* [image.frag](./examples/image.frag)
* [video.frag](./examples/video.frag)

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

### Server Mode

If you wanna hide code and show only the shaders, you can use server mode.
When `server` is specified, VEDA launches a web server instead of running shaders in the background of Atom.

In this example, VEDA runs server on `http://localhost:3000`.
You can run shaders on the browsers by opening the url.

```glsl
/*
{
  "server": 3000,
}
*/
```

Warning: Currently we can't use videos/images outside the project directory in server mode.

See an [example](./examples/server.frag) for actual usage.

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

## Contributors

Thanks goes to these wonderful people ([emoji key](https://github.com/kentcdodds/all-contributors#emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->

<!-- prettier-ignore -->
| [<img src="https://avatars3.githubusercontent.com/u/1403842?v=4" width="100px;"/><br /><sub><b>Takayosi Amagi</b></sub>](https://gmork.in/)<br />[💬](#question-fand "Answering Questions") [💻](https://github.com/fand/veda/commits?author=fand "Code") [🎨](#design-fand "Design") [📖](https://github.com/fand/veda/commits?author=fand "Documentation") | [<img src="https://avatars0.githubusercontent.com/u/756562?v=4" width="100px;"/><br /><sub><b>Jonathan Giroux (Koltes)</b></sub>](http://koltes.digital)<br />[🐛](https://github.com/fand/veda/issues?q=author%3AKoltesDigital "Bug reports") [💻](https://github.com/fand/veda/commits?author=KoltesDigital "Code") [👀](#review-KoltesDigital "Reviewed Pull Requests") | [<img src="https://avatars3.githubusercontent.com/u/3462746?v=4" width="100px;"/><br /><sub><b>Cezary Kopias</b></sub>](http://cezary.kopias.pl)<br />[🐛](https://github.com/fand/veda/issues?q=author%3ACezaryKopias "Bug reports") [💡](#example-CezaryKopias "Examples") | [<img src="https://avatars1.githubusercontent.com/u/1937287?v=4" width="100px;"/><br /><sub><b>tanitta</b></sub>](http://tanitta.net/)<br />[💻](https://github.com/fand/veda/commits?author=tanitta "Code") [🤔](#ideas-tanitta "Ideas, Planning, & Feedback") | [<img src="https://avatars0.githubusercontent.com/u/630181?v=4" width="100px;"/><br /><sub><b>Yuya Fujiwara</b></sub>](http://ason.as)<br />[🐛](https://github.com/fand/veda/issues?q=author%3Aasonas "Bug reports") | [<img src="https://avatars0.githubusercontent.com/u/8775460?v=4" width="100px;"/><br /><sub><b>Rikuo Hasegawa</b></sub>](https://sp4ghet.com)<br />[🐛](https://github.com/fand/veda/issues?q=author%3Asp4ghet "Bug reports") [💻](https://github.com/fand/veda/commits?author=sp4ghet "Code") [💡](#example-sp4ghet "Examples") |
| :---: | :---: | :---: | :---: | :---: | :---: |

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/kentcdodds/all-contributors) specification. Contributions of any kind welcome!

## Author

Takayosi Amagi

* Twitter: [@amagitakayosi](https://twitter.com/amagitakayosi/)
* GitHub: [fand](https://github.com/fand/)
* Blog: [マルシテイア](http://amagitakayosi.hatenablog.com/)

## License

MIT
