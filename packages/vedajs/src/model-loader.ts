import * as THREE from 'three';
import { IPassModel } from './constants';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

interface ICache {
    url: string;
    obj: THREE.Object3D;
}

const extractPaths = (url: string) => {
    const match = url.match(/^(.*\\)(.*)$/) || url.match(/^(.*\/)(.*)\/?$/); // windows local file // other
    if (!match) {
        return null;
    }

    return {
        path: match[1],
        basename: match[2],
    };
};

export default class ModelLoader {
    private cache: { [url: string]: ICache | null } = {};

    private objLoader = new OBJLoader();
    private mtlLoader = new MTLLoader();

    async load(model: IPassModel): Promise<THREE.Object3D> {
        const url = model.PATH;
        const key = `${model.PATH}:${model.MATERIAL || '_'}`;

        const cache = this.cache[key];
        if (cache) {
            return Promise.resolve(cache.obj);
        }

        let obj;
        if (/\.obj\/?$/.test(url)) {
            obj = await this.loadObjAndMtl(model);
        } else {
            throw new TypeError('Unsupported model URL: ' + url);
        }

        obj = this.fixObj(obj);
        this.cache[url] = { url, obj };

        return obj;
    }

    private async loadObjAndMtl(model: IPassModel): Promise<THREE.Object3D> {
        if (model.MATERIAL) {
            const materials = await this.loadMtl(model.MATERIAL);
            materials.preload();

            this.objLoader.setMaterials(materials);
            // } else {
            // this.objLoader.setMaterials(null as any);
        }

        return this.loadObj(model.PATH);
    }

    private loadMtl(url: string): Promise<MTLLoader.MaterialCreator> {
        const paths = extractPaths(url);
        if (paths === null) {
            return Promise.reject(new TypeError('Invalid URL: ' + url));
        }

        this.mtlLoader.setPath(paths.path);
        return new Promise((resolve, reject) => {
            this.mtlLoader.load(paths.basename, resolve, undefined, reject);
        });
    }

    private loadObj(url: string): Promise<THREE.Group> {
        return new Promise((resolve, reject) => {
            this.objLoader.load(url, resolve, undefined, reject);
        });
    }

    private fixObj(obj: THREE.Object3D) {
        let box: THREE.Box3 | null = null;
        obj.traverse((o) => {
            if (
                o instanceof THREE.Mesh &&
                o.geometry instanceof THREE.BufferGeometry
            ) {
                o.geometry.computeBoundingBox();
                if (o.geometry.boundingBox === null) {
                    return;
                }
                if (box === null) {
                    box = o.geometry.boundingBox;
                } else {
                    box.union(o.geometry.boundingBox);
                }
            }
        });

        // Return if children is empty
        if (box === null) {
            return obj;
        }
        box = box as THREE.Box3;

        const sphere = new THREE.Sphere();
        box.getBoundingSphere(sphere);
        const scale = 1 / sphere.radius;
        const offset = sphere.center;

        obj.traverse((o) => {
            if (
                o instanceof THREE.Mesh &&
                o.geometry instanceof THREE.BufferGeometry
            ) {
                o.geometry.translate(-offset.x, -offset.y, -offset.z);
                o.geometry.scale(scale, scale, scale);
                o.updateMatrix();
            }
        });

        return obj;
    }
}
