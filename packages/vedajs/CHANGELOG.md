# CHANGELOG

## 0.16.0

- Stop using deprecated THREE.JSONLoader

## 0.15.0

- Allow initializing Veda without opts
- Add texture size to uniform as `vec2 [name]Size`;
  - When texrure `image` is loaded, `imageSize` is automatically loaded.

## 0.14.0

- Change `Veda.unloadTexture` arguments

## 0.13.0

- Fix gif loader not working in Chrome

## 0.12.1

- Load all materials at the same time

## 0.12.0

- Fix materials on multiple models not loaded correctly

## 0.11.2

- Change texture min/mag filter to THREE.LinearFilter

## 0.11.1

- Fix video not playing

## 0.11.0

- Add `getTime()`

## 0.10.1

- Use RMS for `volume` computation

## 0.10.0

- Add `startRecording`, `stopRecording`
  - Fix delta of `time` only if recording

## 0.9.1

- Fix delta of `time` even if the rendering causes junk frames

## 0.9.0

- Rename `OBJ` property to `MODEL`
  - VEDA loads 3D model file specified in `MODEL` property in `PASSES`
  - Supported formats: `.obj` `.json`
  - If `.mtl` file is specified in `MODEL.MATERIAL`, VEDA loads the materials as textures
    - Textures will be named `material0`, `material1`, etc.
- Add `BLEND` in `PASSES` for blend function of fragment colors
  - `BLEND` must be one of `NO`, `NORMAL`, `ADD`, `SUB` and `MUL`
  - These values correspond to [Three.js's blending mode constants](https://threejs.org/docs/#api/constants/Materials).

## 0.8.1

- Fix `stopSound()` error

## 0.8.0

- Support `.obj` file
  - VEDA will load OBJ file if `OBJ` property is specified in `PASSES`

## 0.7.0

- Replaced code from Flowtype to TypeScript

## 0.6.3

- Accept `WIDTH`, `HEIGHT` properties in `PASSES`

## 0.6.1

- Add `uniform vec3 mouseButtons`
- Fix blendmode in vertex shaders

## 0.6.0

- Support float textures with `FLOAT` in `PASSES`

## 0.5.3

- Fix errors around Web Audio API
- Use XHR instead of `fs` to fix errors on browsers

## 0.5.1, 0.5.2

- Support audio files for `loadTexture()`
- Update deps

## 0.5.0

- Support sound shaders

## 0.4.1

- Fix: Disable culling on vertex shader

## 0.4.0

- Add methodsf for FFT settings #2

## 0.3.4

- Fix styles
- Allow loading cross-origin texture

## 0.3.3

- Fix styles of video elements

## 0.3.2

- Add param `speed` to `loadTexture()`

## 0.3.1

- Fix: initialize MIDI only when enabled

## 0.3.0

- Add `setUniform()`
- Add `resetTime()`
- Fix: MIDI not working when MIDI ports are not ready on initialization

## 0.2.0

- Make the canvas transparent

## 0.1.2

- Fix: `mouse` not working

## 0.1.1

- Add `Veda.prototype.resize()` to resize the canvas explicitly
- Add type definition files for TypeScript & flowtype

## 0.1.0

- Support animated GIF

## 0.0.1

- Initial release!
  - VEDA.js was born as a coproduct of [atom-veda](https://github.com/fand/atom-veda/)
