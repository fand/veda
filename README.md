# glsl-livecoder

![apm version](https://img.shields.io/apm/v/glsl-livecoder.svg)
![license MIT](https://img.shields.io/apm/l/glsl-livecoder.svg)

Live coding environment for GLSL.

![screenshot](https://user-images.githubusercontent.com/1403842/28001497-f4191842-6567-11e7-8a4c-ee6df7b9d49b.png)


## Features

- GLSL Sandbox style `uniform` variables
- Additional `uniform` variables useful for live coding
  - Audio input
  - MIDI input
- Auto completion w/ [autocomplete-glsl](https://atom.io/packages/autocomplete-glsl/)
- Linting w/ [linter-glsl](https://atom.io/packages/linter-glsl/)


## Upcoming Features

- Image input
- Video input
- [glslify](https://github.com/stackgl/glslify) support


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


## `uniform` variables

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
each pixel stores the last event of the corresponding MIDI Events.

For example, `texture2D(midi, vec2(144. / 256., 0)).x` yields the note number of last `note on` event of MIDI Channel 1.

- `144.` (0x90): `note on` event of MIDI Channel 1
- `.x` (2nd byte): Note number

See [examples](./blob/master/examples/midi.frag) for actual usage.


## Author

Takayosi Amagi
- Twitter: [@amagitakayosi](https://twitter.com/amagitakayosi/)
- GitHub: [fand](https://github.com/fand/)

## LICENSE

MIT
