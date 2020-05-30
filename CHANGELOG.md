# Changelog

## 2.14.2

- Fix errors on replacing textures
- Fix webcam example not working

## 2.14.0

- Support glslify in multipass shaders
- Add texture size to uniform as `vec2 [name]Size`
- Fix error on rebuild

## 2.13.2

- Fix OSC loader bug with masseges includes multiple slashes in the address

## 2.13.0

- Fix GIF loader broken by chromium update

## 2.12.2

- Fix materials on multiple models not loaded correctly

## 2.12.1

- Fix video textures not playing

## 2.12.0

- Show correct error positions on shaders using glslify
- Support `#include` macro
- Install glslangValidator automatically using [glslang-validator-prebuilt](https://github.com/fand/glslang-validator-prebuilt)

## 2.11.4

- fix: Update shader correctly on server mode (#126)

## 2.11.3

- Fix timing issue #124

## 2.11.1

- Rename recording commands / paths of recorded files

## 2.11.0

- Add commands to record videos

## 2.10.2

- Fixed bugs of file path conversion in server mode #94

## 2.10.0

- Support [glslify-import](https://github.com/glslify/glslify-import) #93

## 2.9.1

- Accept OSC bundle messages

## 2.9.0

- Rename `OBJ` to `MODEL`
- Suport `.json` file
- Suport `.mtl` file
- Add `MODEL.BLEND` to specify color blend mode

## 2.8.0

- Add `Veda: Toggle Fullscreen` command (`ctrl-escape`)

## 2.7.0

- Support `.obj` file

## 2.6.0

- Moved from Flowtype to TypeScript

## 2.5.2

- Support `WIDTH` `HEIGHT` in `PASSES`

## 2.5.0

- Support float textures with `FLOAT` in `PASSES`

## 2.4.2

- Fix comment bug #61

## 2.4.1

- Fix server mode not working #56

## 2.4.0

- Sound texture for sound shader

## 2.3.0

- Sound shader (experimental)

## 2.2.1

- Disable culling in vertex shader

## 2.2.0

- Add `fftSize` and `fftSmoothingTimeConstant` to settings

## 2.1.5

- Fix styles
- Allow loading cross-origin textures

## 2.1.4

- Rename `.liverc` to `.vedarc`

## 2.1.3

- Remove native addons from dependencies

## 2.1.2

- Fix style bug in video, camera etc.

## 2.1.1

- Fix OSC not working because of native modules

## 2.1.0

- Add `IMPORTED.SPEED` to Change video speed

## 2.0.1

- Fix OSC initialization on server mode

## 2.0.0

- OSC Support!

## 1.1.2

- Fix background-color of canvas

## 1.1.1

- Fix MIDI not working on Windows

## 1.1.0

- Support animated GIF

## 1.0.1

- Fix keybinding confliction on non-GLSL files

## 1.0.0

🔥🔥 VEDA Released 🔥🔥

- Rename package to `veda`
- Move GLSL runtime engine to [fand/veda](https://github.com/fand/veda)

## 0.13.1

- Fix server mode on Windows

## 0.13.0

- Add server mode

## 0.12.0

- Supports combining vs and fs

## 0.11.0

- Supports Multipass Rendering!

## 0.10.3

- Fix bugs on initializing configs

## 0.10.2

- Fix bugs on initializing vertex shaders

## 0.10.1

- Fix bugs in gamepad support and some errors

## 0.10.0

- Glslify Support!!

## 0.9.3, 0.9.4

- Fix bugs in `glsl-livecoder:toggle` #19

## 0.9.2

- Support `.fs` and `.vs` files

## 0.9.1

- Fix bugs around IMPORTED

## 0.9.0

- Support header comments to change settings per file

## 0.8.1

- Fix error on empty editor #14

## 0.8.0

- Vertex Shaders Support!!

## 0.7.2

- Fix error on glsl-livecoder:toggle #13

## 0.7.1

- Fix audio inputs not working
- Improve performance on disabling glsl-livecoder

## 0.7.0

- Keyboard Support!

## 0.6.0

- Gamepad Support!

## 0.5.0

- Webcam Support!

## 0.4.6

- Fix midi implementation

## 0.4.5

- Improve performance on loading images / videos
- Fix styles

## 0.4.3, 0.4.4

- Update README

## 0.4.2

- Fix unexpected sound output caused by audio inputs and videos

## 0.4.1

- Windows Support!!

## 0.4.0

- Support loading images / videos with `.liverc`

## 0.3.0

- Add `Pixel Ratio` and `Frameskip` to config
- Ignore non-GLSL files while watching active tab

## 0.2.0

- Add `uniform sampler2D note` to get MIDI notes

## 0.1.2

- Fix the style of the selected item in sidebar

## 0.1.1

- Revise README.md

## 0.1.0 - First Release

- Hello GLSL :zap:
