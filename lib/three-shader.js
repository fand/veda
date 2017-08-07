'use babel';

import * as THREE from 'three';
import AudioLoader from './audio-loader';
import MidiLoader from './midi-loader';
import VideoLoader from './video-loader';
import isVideo from 'is-video';

const DEFAULT_VERTEX_SHADER = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export default class ThreeShader {
  /**
   * @constructor
   * @param {number} ratio
   * @param {number} skip
   */
  constructor(ratio, skip) {
    this.ratio = ratio;
    this.skip = skip;

    this.scene = new THREE.Scene();

    // Create camera
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(this.scene.position);

    // Create a target for backbuffer
    this.targets = [
      new THREE.WebGLRenderTarget(
        0, 0,
        { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat }
      ),
      new THREE.WebGLRenderTarget(
        0, 0,
        { minFilter: THREE.LinearFilter, magFilter: THREE.NearestFilter, format: THREE.RGBAFormat }
      ),
    ];

    this.audio = new AudioLoader();
    this.midi = new MidiLoader();
    this.videoLoader = new VideoLoader();

    // Prepare uniforms
    this.start = Date.now();
    this.uniforms = {
      backbuffer: { type: 't', value: new THREE.Texture() },
      mouse: { type: 'v2', value: new THREE.Vector2() },
      resolution: { type: 'v2', value: new THREE.Vector2() },
      time: { type: 'f', value: 0.0 },
      volume: { type: 'f', value: 0 },
      spectrum: { type: 't', value: this.audio.spectrum },
      samples: { type: 't', value: this.audio.samples },
      midi: { type: 't', value: this.midi.texture },
      note: { type: 't', value: this.midi.noteTexture },
    };

    this.textureLoader = new THREE.TextureLoader();
  }

  setPixelRatio(pixelRatio) {
    this.ratio = pixelRatio;
    this.renderer.setPixelRatio(1 / pixelRatio);
    this.resize();
  }

  setFrameskip(frameskip) {
    this.skip = frameskip;
  }

  /**
   * @param {HTMLCanvasElement} canvas
   */
  setCanvas(canvas) {
    if (!canvas) {
      return;
    }

    this.canvas = canvas;
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(1 / this.ratio);
    this.resize();
    window.addEventListener('resize', this.resize);
    window.addEventListener('mousemove', this.mousemove);

    this.frame = 0;
    this.animate();
  }

  /**
   * @returns {number}
   */
  get aspect() {
    return this.renderer.domElement.width / this.renderer.domElement.height;
  }

  /**
   * @param {string} shader
   */
  loadShader(shader) {
    if (this.plane) {
      this.scene.remove(this.plane);
    }

    // Create plane
    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: DEFAULT_VERTEX_SHADER,
      fragmentShader: shader,
      extensions: {
        derivatives: true,
        drawBuffers: false,
        fragDepth: false,
        shaderTextureLOD: false,
      },
    });
    this.plane = new THREE.Mesh(geometry, material);
    this.scene.add(this.plane);
  }

  /**
   * @param {string} name
   * @param {string} textureUrl
   */
  loadTexture(name, textureUrl) {
    const texture = isVideo(textureUrl) ? this.videoLoader.load(name, textureUrl) : this.textureLoader.load(textureUrl);
    if(texture){
      this.uniforms[name] = {
        type: 't',
        value: texture,
      };
    }
  }

  /**
   * @private
   * @param {MouseEvent} e
   */
  mousemove = e => {
    this.uniforms.mouse.value.x = e.clientX / window.innerWidth;
    this.uniforms.mouse.value.y = 1 - e.clientY / window.innerHeight;
  }

  /**
   * @private
   */
  resize = () => {
    const [width, height] = [window.innerWidth, window.innerHeight];
    this.renderer.setSize(width, height);
    this.targets.forEach(t => t.setSize(width / this.ratio, height / this.ratio));
    this.uniforms.resolution.value.x = width / this.ratio;
    this.uniforms.resolution.value.y = height / this.ratio;
  }

  animate = () => {
    this.frame++;
    if (!this.isPlaying) {
      return;
    }

    requestAnimationFrame(this.animate);
    if (this.frame % this.skip === 0) {
      this.render();
    }
  }

  play() {
    this.isPlaying = true;
    this.animate();
    this.audio.play();
  }

  stop() {
    this.isPlaying = false;
    this.audio.stop();
  }

  /**
   * @private
   */
  render() {
    this.uniforms.time.value = (Date.now() - this.start) / 1000;
    this.targets = [this.targets[1], this.targets[0]];
    this.uniforms.backbuffer.value = this.targets[0].texture;

    // Update audio
    if (this.audio.isPlaying) {
      this.audio.update();
      this.uniforms.volume.value = this.audio.getVolume();
    }

    this.renderer.render(this.scene, this.camera);
    this.renderer.render(this.scene, this.camera, this.targets[1], true);
  }
}
