/* @flow */
import * as THREE from 'three';
import AudioLoader from './audio-loader';
import MidiLoader from './midi-loader';
import VideoLoader from './video-loader';
import CameraLoader from './camera-loader';
import GamepadLoader from './gamepad-loader';
import KeyLoader from './key-loader';
import isVideo from 'is-video';

const DEFAULT_VERTEX_SHADER = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const DEFAULT_FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;
void main() {
  gl_FragColor = v_color;
}
`;

export default class ThreeShader {
  _ratio: number;
  _skip: number;
  _start: number;
  _isPlaying: boolean;
  _frame: number;

  _camera: THREE.Camera;
  _plane: THREE.Mesh;
  _renderer: THREE.Renderer;
  _scene: THREE.Scene;
  _targets: THREE.RenderTarget[];
  _textureLoader: THREE.TextureLoader;

  _audioLoader: AudioLoader;
  _cameraLoader: CameraLoader;
  _gamepadLoader: GamepadLoader;
  _keyLoader: KeyLoader;
  _midiLoader: MidiLoader;
  _videoLoader: VideoLoader;
  _uniforms: any;

  _vertexMode: string;

  constructor(ratio: number, skip: number) {
    this._ratio = ratio;
    this._skip = skip;

    this._scene = new THREE.Scene();

    // Create camera
    this._camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this._camera.position.set(0, 0, 1);
    this._camera.lookAt(this._scene.position);

    // Create a target for backbuffer
    this._targets = [
      new THREE.WebGLRenderTarget(
        0, 0,
        { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat }
      ),
      new THREE.WebGLRenderTarget(
        0, 0,
        { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat }
      ),
    ];

    this._audioLoader = new AudioLoader();
    this._cameraLoader = new CameraLoader();
    this._gamepadLoader = new GamepadLoader();
    this._keyLoader = new KeyLoader();
    this._midiLoader = new MidiLoader();
    this._videoLoader = new VideoLoader();

    // Prepare uniforms
    this._start = Date.now();
    this._uniforms = {
      backbuffer: { type: 't', value: new THREE.Texture() },
      mouse: { type: 'v2', value: new THREE.Vector2() },
      resolution: { type: 'v2', value: new THREE.Vector2() },
      time: { type: 'f', value: 0.0 },
      vertexCount: { type: 'f', value: 0 },
    };

    this._textureLoader = new THREE.TextureLoader();

    this._vertexMode = 'TRIANGLES';
  }

  setPixelRatio(pixelRatio: number): void {
    this._ratio = pixelRatio;
    this._renderer.setPixelRatio(1 / pixelRatio);
    this._resize();
  }

  setFrameskip(frameskip: number): void {
    this._skip = frameskip;
  }

  setVertexCount(count: number): void {
    this._uniforms.vertexCount.value = count;
  }

  setVertexMode(mode: string): void {
    this._vertexMode = mode;
  }

  setCanvas(canvas: HTMLCanvasElement): void {
    if (!canvas) {
      return;
    }

    this._renderer = new THREE.WebGLRenderer({ canvas });
    this._renderer.setPixelRatio(1 / this._ratio);
    this._resize();
    window.addEventListener('resize', this._resize);
    window.addEventListener('mousemove', this.mousemove);

    this._frame = 0;
    this.animate();
  }

  loadShader(shader: string): void {
    if (this._plane) {
      this._scene.remove(this._plane);
    }

    // Create plane
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: DEFAULT_VERTEX_SHADER,
      fragmentShader: shader,
      extensions: {
        derivatives: true,
        drawBuffers: false,
        fragDepth: false,
        shaderTextureLOD: false,
      },
    });
    this._plane = new THREE.Mesh(geometry, material);
    this._scene.add(this._plane);
  }

  loadVertexShader(vertexShader: string): void {
    if (this._plane) {
      this._scene.remove(this._plane);
    }

    // Create an object for vertexMode
    const geometry = new THREE.BufferGeometry();
    var vertices = new Float32Array(this._uniforms.vertexCount.value * 3);
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const vertexIds = new Float32Array(this._uniforms.vertexCount.value);
    vertexIds.forEach((v, i) => {
      vertexIds[i] = i;
    });
    geometry.addAttribute('vertexId', new THREE.BufferAttribute(vertexIds, 1));

    const material = new THREE.ShaderMaterial({
      uniforms: this._uniforms,
      vertexShader: vertexShader,
      fragmentShader: DEFAULT_FRAGMENT_SHADER,
      extensions: {
        derivatives: true,
        drawBuffers: false,
        fragDepth: false,
        shaderTextureLOD: false,
      },
    });

    if (this._vertexMode === 'POINTS') {
      this._plane = new THREE.Points(geometry, material);
    } else if (this._vertexMode === 'LINE_LOOP') {
      this._plane = new THREE.LineLoop(geometry, material);
    } else if (this._vertexMode === 'LINE_STRIP') {
      this._plane = new THREE.Line(geometry, material);
    } else if (this._vertexMode === 'LINES') {
      this._plane = new THREE.LineSegments(geometry, material);
    } else if (this._vertexMode === 'TRI_STRIP') {
      this._plane = new THREE.Mesh(geometry, material);
      this._plane.setDrawMode(THREE.TrianglesStripDrawMode);
    } else if (this._vertexMode === 'TRI_FAN') {
      this._plane = new THREE.Mesh(geometry, material);
      this._plane.setDrawMode(THREE.TrianglesFanDrawMode);
    } else {
      this._plane = new THREE.Mesh(geometry, material);
    }

    this._scene.add(this._plane);
  }

  loadTexture(name: string, textureUrl: string): void {
    const texture = isVideo(textureUrl) ? this._videoLoader.load(name, textureUrl) : this._textureLoader.load(textureUrl);
    this._uniforms[name] = {
      type: 't',
      value: texture,
    };
  }

  unloadTexture(name: string, textureUrl: string, remove: boolean): void {
    const texture = this._uniforms[name];
    texture.value.dispose();

    if (remove && isVideo(textureUrl)) {
      this._videoLoader.unload(textureUrl);
    }
  }

  mousemove = (e: MouseEvent) => {
    this._uniforms.mouse.value.x = e.clientX / window.innerWidth;
    this._uniforms.mouse.value.y = 1 - e.clientY / window.innerHeight;
  }

  _resize = () => {
    const [width, height] = [window.innerWidth, window.innerHeight];
    this._renderer.setSize(width, height);
    this._targets.forEach(t => t.setSize(width / this._ratio, height / this._ratio));
    this._uniforms.resolution.value.x = width / this._ratio;
    this._uniforms.resolution.value.y = height / this._ratio;
  }

  animate = () => {
    this._frame++;
    if (!this._isPlaying) {
      return;
    }

    requestAnimationFrame(this.animate);
    if (this._frame % this._skip === 0) {
      this._render();
    }
  }

  play(): void {
    this._isPlaying = true;
    this.animate();
  }

  stop(): void {
    this._isPlaying = false;
    this._audioLoader.disable();
    this._cameraLoader.disable();
    this._keyLoader.disable();
    this._midiLoader.disable();
    this._gamepadLoader.disable();
  }

  _render(): void {
    this._uniforms.time.value = (Date.now() - this._start) / 1000;
    this._targets = [this._targets[1], this._targets[0]];
    this._uniforms.backbuffer.value = this._targets[0].texture;

    // Update audio
    if (this._audioLoader.isEnabled) {
      this._audioLoader.update();
      this._uniforms.volume.value = (this._audioLoader: any).getVolume();
    }

    if (this._gamepadLoader.isEnabled) {
      this._gamepadLoader.update();
    }

    this._renderer.render(this._scene, this._camera);
    this._renderer.render(this._scene, this._camera, this._targets[1], true);
  }

  toggleAudio(flag: boolean): void {
    if (flag) {
      this._audioLoader.enable();
      this._uniforms = {
        ...this._uniforms,
        volume: { type: 'f', value: 0 },
        spectrum: { type: 't', value: this._audioLoader.spectrum },
        samples: { type: 't', value: this._audioLoader.samples },
      };
    } else {
      this._uniforms.spectrum.value.dispose();
      this._uniforms.samples.value.dispose();
      this._audioLoader.disable();
    }
  }

  toggleMidi(flag: boolean): void {
    if (flag) {
      this._midiLoader.enable();
      this._uniforms = {
        ...this._uniforms,
        midi: { type: 't', value: this._midiLoader.midiTexture },
        note: { type: 't', value: this._midiLoader.noteTexture },
      };
    } else {
      this._uniforms.midi.value.dispose();
      this._uniforms.note.value.dispose();
      this._midiLoader.disable();
    }
  }

  toggleCamera(flag: boolean): void {
    if (flag) {
      this._cameraLoader.enable();
      this._uniforms = {
        ...this._uniforms,
        camera: { type: 't', value: this._cameraLoader.texture },
      };
    } else {
      this._cameraLoader.disable();
    }
  }

  toggleKeyboard(flag: boolean): void {
    if (flag) {
      this._keyLoader.enable();
      this._uniforms = {
        ...this._uniforms,
        key: { type: 't', value: this._keyLoader.texture },
      };
    } else {
      this._keyLoader.disable();
    }
  }

  toggleGamepad(flag: boolean): void {
    if (flag) {
      this._gamepadLoader.enable();
      this._uniforms = {
        ...this._uniforms,
        gamepad: { type: 't', value: this._gamepadLoader.texture },
      };
    } else {
      this._gamepadLoader.disable();
    }
  }
}
