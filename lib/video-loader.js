'use babel';
import * as THREE from 'three';

export default class VideoLoader {
  load(id, url) {
    let sameIdVideos = Array.from(document.getElementsByTagName('video')).filter(e => e.id === id);
    let sameIdVideo = sameIdVideos.length > 0 ? sameIdVideos[0] : null;
    let video;

    if (sameIdVideo) {
      video = sameIdVideo;
      if (video.name === url) {
        return null;
      }
      video.name = url;
      video.src = url;
    } else {
      video = document.createElement('video');
      document.body.appendChild(video);
      video.id = id;
      video.name = url;
      video.src = url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.style.top = 999999;
    }
    const texture = new THREE.VideoTexture(video);
    texture.format = THREE.RGBFormat;
    return texture;
  }
}
