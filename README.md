# glsl-livecoder

![apm version](https://img.shields.io/apm/v/glsl-livecoder.svg)
![license MIT](https://img.shields.io/apm/l/glsl-livecoder.svg)

An Atom package for VJ / Live Coding in GLSL.

![screenshot](https://user-images.githubusercontent.com/1403842/28673275-1d42b062-731d-11e7-92b0-bde5ca1f1cae.gif)


## Features

- GLSL Sandbox style `uniform` variables
- Load images / videos
- Additional `uniform` variables useful for live coding
  - Audio input
  - MIDI input
- Auto completion w/ [autocomplete-glsl](https://atom.io/packages/autocomplete-glsl/)
- Linting w/ [linter-glsl](https://atom.io/packages/linter-glsl/)


## Install

`$ apm install glsl-livecoder`

or install from Atom GUI.


## Commands

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


## Preset `uniform` variables

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
  - `x`: 2nd byte of the event
  - `y`: 3rd byte of the event
- `sampler2D note`
  - States of note numbers of MIDI devices.
  - `x`: the volume of the note

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
The size of `midi` is `256x1`.
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


### Loading images / videos using `.liverc`

You can load images and videos from local or via URL.
To use images / videos, `.liverc` is required.

- `.liverc` must be located in your project's root directory.
- `.liverc` is parsed as [JSON5 format](https://github.com/json5/json5)
  - You can write comments in `.liverc`.
- `.liverc` is loaded on startup and reloaded automatically when you edit it.
- Write image / video paths in `IMPORTED` property.
  - The structure of `.liverc` is based on [Interactive Shader Format](https://www.interactiveshaderformat.com/)

For example, create `.liverc` like this:

```javascript
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
```

Then use it in your GLSL file:

```glsl
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

See these examples for actual usage.

- [.liverc](./blob/master/examples/.liverc)
- [image.frag](./blob/master/examples/image.frag)
- [video.frag](./blob/master/examples/video.frag)


## Author

Takayosi Amagi
- Twitter: [@amagitakayosi](https://twitter.com/amagitakayosi/)
- GitHub: [fand](https://github.com/fand/)


## LICENSE

MIT
