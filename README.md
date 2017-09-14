<div align="center">
  <img alt="logo" src="https://user-images.githubusercontent.com/1403842/28923702-d8155d46-7899-11e7-817b-1193d138e5b8.png" width="192"/>  
</div>

<div align="center">
  <h1>glsl-livecoder</h1>
  <i>VJ / Live Coding on Atom with GLSL.</i>
  <br>
  <br>  
  <br>
  <img alt="screenshot" src="https://user-images.githubusercontent.com/1403842/28673275-1d42b062-731d-11e7-92b0-bde5ca1f1cae.gif" style="width: 100% !important;"/>  
  <br>
  <br>
</div>

<div align="center">

![TravisCI](https://img.shields.io/travis/fand/glsl-livecoder.svg)
![apm version](https://img.shields.io/apm/v/glsl-livecoder.svg)
![license MIT](https://img.shields.io/apm/l/glsl-livecoder.svg)
![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)
</div>
<br>
<br>


##### TOC

- [Features](#features)
- [Install](#install)
- [Usage](#usage)
- [Examples](#examples)


## What's this?

`glsl-livecoder` is a GLSL runtime environment for Atom.
When you write GLSL code in Atom, glsl-livecoder immediately evaluates it and shows the result on the background.
It's just like [GLSL sandbox](http://glslsandbox.com/) or [Shadertoy](https://www.shadertoy.com/), but you can use autocomplete and linter by using existing Atom packages.
Moreover, It supports Audio inputs , MIDI inputs, loading videos and images, etc...!!!!

`glsl-livecoder` has following features.

- Fragment shaders runtime like [GLSL Sandbox](http://glslsandbox.com/)
- Vertex shader runtime like [vertexshaderart.com](https://www.vertexshaderart.com/)
- Loading images / videos
- Additional `uniform` variables useful for live coding
  - Audio input
  - MIDI input
  - Webcam input
  - Keyboard input
  - Gamepad input
- Auto completion (thx to [autocomplete-glsl](https://atom.io/packages/autocomplete-glsl/))
- Linting (thx to [linter-glsl](https://atom.io/packages/linter-glsl/))


## Tutorial

- [English](https://medium.com/@amagitakayosi/vj-live-coding-on-atom-glsl-livecoder-329eec5462df)
- [日本語](http://blog.gmork.in/entry/2017/08/04/173000)


## Install

### Install `glslangValidator`

`glsl-livecoder` requires `glslangValidator`.<br>
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

The path of `glslangValidator` can also be specified in the settings of `glsl-livecoder`.


### Install `glsl-livecoder`

Just install from Atom GUI or `apm`.

`$ apm install glsl-livecoder`

If Atom shows an error like below, try rebuilding the package from 🐞 icon on the footer.

```
Failed to require the main module of 'glsl-livecoder' because it requires an incompatible native module.
Run `apm rebuild` in the package directory to resolve.
```


## Features

### Commands

`glsl-livecoder` installs following commands to Atom.

- `toggle`
  - Start / Stop glsl-livecoder.
- `load-shader` (key: `ctrl-enter`)
  - Load the shader on current editor.  
- `watch-shader` (key: `ctrl-shift-enter`)
  - Watch current tab and load the shader automatically.
- `watch-active-editor` (key: `ctrl-alt-enter`)
  - Watch active tab and run `watch-shader` automatically.
- `stop-watching` (key: `ctrl-.`)
  - Stop `watch-shader` and `watch-active-editor`.

A typical workflow can be like this:

1. Enable `glsl-livecoder` by running `glsl-liveder:toggle` from the Command Palette of Atom.
2. Edit your GLSL code.
3. Hit `ctrl-enter` to run `glsl-livecoder:load-shader`.


### Preset `uniform` variables

- `float time`:
  - The elapsed time since `glsl-livecoder` has started.
- `vec2 resolution`
  - The resolution of the screen.
- `vec2 mouse`
  - Current position of mouse.
  - `vec2(0)` to `vec2(1)`
- `sampler2D backbuffer`
  - Rendered result of last frame.
  - RGBA format
- `sampler2D samples`
  - Samples of the audio input.
- `sampler2D spectrum`
  - FFT result of the audio input.
- `float volume`
  - The volume of the audio input.
- `sampler2D midi`
  - Last MIDI event for each channel of MIDI devices.
  - `x`: 3rd byte of the event
- `sampler2D note`
  - States of note numbers of MIDI devices.
  - `x`: the volume of the note


### Settings

The settings of `glsl-livecoder` can be configured in 3 ways: global settings, project settings, and file settings.

- Global settings are loaded from Settings page of Atom.
- Project settings are loaded from `.liverc`.
- File settings are loaded from the comments of the shader.

The order of priority is as follows:

`File Settings > Project Settings > Global Settings`

When File Settings and Global Settings has same properties, File Settings are used.


#### Global Settings

Global settings are most general settings.
You can change settings in `Settings` page of Atom.

If there are no project `.liverc` or valid comments, glsl-livecoder will use the global settings as default.


#### Project Settings: `.liverc`

Project settings is loaded from `.liverc` on your project root.

- `.liverc` must be located in your project's root directory.
- `.liverc` is parsed as [JSON5 format](https://github.com/json5/json5).
  - You can write comments in `.liverc`.
- `.liverc` is loaded on startup and reloaded automatically when you edit it.

For example, when you write `.liverc` like this:

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

Then `glsl-livecoder` interpret like this:

- Load `./1.jpg` as a texture `image1`
- Draw lines on vertex shaders
- Enable audio input
- Enable MIDI input


#### File Settings

You can also write settings specific for the file.
Write comments on the head of the file like this:

```glsl
/*{ "audio": true }*/

void main() {
    ...
}
```

The comment must be written in the same format as `.liverc`.


## Examples

### Fragment Shaders

You can write fragment shaders like [GLSL Sandbox](glsl-livecoder also supports).

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
glsl-livecoder will show the result on the background.

See [examples](./blob/master/examples/shader1.frag) for actual usage.


### Vertex Shaders

glsl-livecoder also supports vertex shaders like [vertexshaderart.com](https://vertexshaderart.com/).

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
glsl-livecoder will show the result on the background.

See [examples](./blob/master/examples/vertex.vert) for actual usage.


### Optional Inputs

To use these features, you have to enable them by adding following lines to `.liverc` or header comments.

- Audio inputs: `"audio": true`
- MIDI inputs: `"midi": true`
- Webcam inputs: `"camera": true`
- Keyboard inputs: `"keyboard": true`
- Gamepad inputs: `"gamepad": true`


### Audio inputs

You can use audio data of the audio input.
These data are obtained by AnalyserNode of [Web Audio API](https://webaudio.github.io/web-audio-api/).

`sampler2D samples` stores the most recent 256 frames from the audio input.
This is useful for drawing waveforms.

`sampler2D spectrum` stores the FFT result.
This is useful to draw the volume of specific frequency band, such as spectrum visualizer.

`float volume` is the average of all the frequency bands in `spectrum`.
See [examples](./blob/master/examples/audio.frag) for actual usage.


### MIDI Events

`sampler2D midi` stores MIDI events obtained by [Web MIDI API](https://www.w3.org/TR/webmidi/).
The size of `midi` is `256x128`.
Each pixel stores the last event of the corresponding MIDI Events.

For example, `texture2D(midi, vec2(144. / 256., 0)).x` yields the note number of last `note on` event of MIDI Channel 1.

- `144.` (0x90): `note on` event of MIDI Channel 1
- `.x` (2nd byte): Note number

See [examples](./blob/master/examples/midi.frag) for actual usage.

`sampler2D note` stores the volumes for each note number
The size of `midi` is `128x1`.
Each pixel stores the volume of the last event for corresponding MIDI note.

For example, `texture2D(note, vec2(60. / 128., 0)).x` yields the volume of note `C4` (Middle C).

See [examples](./blob/master/examples/note.frag) for actual usage.


### Webcam Inputs

`sampler2D camera` stores the images from the webcam.
`texture2D(camera, uv)` returns vec3 color.

See [examples](./blob/master/examples/camera.frag) for actual usage.


### Keyboard Inputs

`sampler2D key` stores the status of keyboard.
The size of `keyboard` is `256x1`.

For example, `texture2D(key, vec2(65. / 256., 0.))` returns 1.0 when `a` is pressed.

Hitting `ESC` key resets the states of all key inputs.

See [examples](./blob/master/examples/key.frag) for actual usage.


### Gamepad Inputs

`sampler2D gamepad` stores the status of gamepads connected to the PC.
The size of `gamepad` is `128x2`.
The status of buttons and axes are stored in `y = 0.0` and `y = 1.0`.

For example, `texture2D(gamepad, vec2(3. / 128., 0.))` returns 1.0 when the 3rd button is pressed.

See [examples](./blob/master/examples/gamepad.frag) for actual usage.


### Loading images / videos

You can load images and videos by adding `IMPORTED` property in `.liverc` or header comments.
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

- [.liverc](./blob/master/examples/.liverc)
- [image.frag](./blob/master/examples/image.frag)
- [video.frag](./blob/master/examples/video.frag)


### glslify

glsl-livecoder supports [glslify](https://github.com/stackgl/glslify).

If `"glslify": true` is in the settings, glsl-livecoder bundles the code with glslify before evaluating.
Note that it will cause lint errors because linter-glsl doesn't support glslify.

See [examples](./blob/master/examples/glslify.frag) for actual usage.


## Author

Takayosi Amagi
- Twitter: [@amagitakayosi](https://twitter.com/amagitakayosi/)
- GitHub: [fand](https://github.com/fand/)
- Blog: [マルシテイア](http://amagitakayosi.hatenablog.com/)


## License

MIT
