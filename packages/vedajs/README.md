<div align="center">
  <img alt="logo" src="https://user-images.githubusercontent.com/1403842/28923702-d8155d46-7899-11e7-817b-1193d138e5b8.png" width="192"/>
</div>

<div align="center">
  <h1>VEDA.js</h1>
  <i>Shader Art Framework</i>
  <br>
  <br>
  <br>
  <img alt="screenshot" src="https://user-images.githubusercontent.com/1403842/28673275-1d42b062-731d-11e7-92b0-bde5ca1f1cae.gif" style="width: 100% !important;"/>
  <br>
  <br>
</div>

<div align="center">

![npm version](https://img.shields.io/npm/v/vedajs.svg)
![license MIT](https://img.shields.io/npm/l/vedajs.svg)
[![Greenkeeper badge](https://badges.greenkeeper.io/fand/vedajs.svg)](https://greenkeeper.io/)
[![hashtag #vedajs](https://img.shields.io/badge/hashtag-vedajs-blue.svg)](https://twitter.com/search?f=tweets&q=%23vedajs&src=typd)

</div>
<br>
<br>

## Install

```
npm install vedajs
```

## Usage

```js
import Veda from 'vedajs';

const veda = new Veda();

veda.setCanvas(canvas);
veda.loadFragmentShader(code);

veda.play();
```

## Advanced Usage

### Fragment shader

```js
veda.loadFragmentShader(code);
```

This is equivalent to

```js
veda.loadShader({ fs: code });
```

### Vertex shader

```js
veda.loadVertexShader(code);
```

This is equivalent to

```js
veda.loadShader({ vs: code });
```

### Using both

Pass a shader object to `loadShader`.

```js
veda.loadShader({
  vs: vertexShaderCode,
  fs: fragmentShaderCode,
});
```

### Multipath rendering

Pass an array of shaders to `loadShader`.

```js
veda.loadShader([
  {
    vs: vertexShaderFor1stPass,
    fs: fragmentShaderFor1stPass,
  },
  {
    fs: fragmentShaderFor2ndPass,
  },
]);
```

### Audio input

```js
veda.toggleAudio(true);
veda.loadShader(shader);
```

### MIDI input

```js
veda.toggleMidi(true);
veda.loadShader(shader);
```

### WebCam input

```js
veda.toggleCamera(true);
veda.loadShader(shader);
```

## Keyboard input

```js
veda.toggleKeyboard(true);
veda.loadShader(shader);
```

## Gamepad input

```js
veda.toggleGamepad(true);
veda.loadShader(shader);
```

## Sound shader

```js
veda.loadSoundShader(shader);
veda.playSound();
```

## Author

Takayosi Amagi

* Website: [gmork.in](https://gmork.in)
* Twitter: [@amagitakayosi](https://twitter.com/amagitakayosi)
* GitHub: [fand](https://github.com/fand)

## LICENSE

MIT
