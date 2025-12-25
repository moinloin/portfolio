import * as THREE from "three";

// Constants
const MOBILE_SCALE_FACTOR = 0.5;
const MOBILE_PORTRAIT_MAX_WIDTH = 767;
const MOBILE_LANDSCAPE_MAX_WIDTH = 932;

export let rock;
export let asciiPlane;
export let currentScale = 1;

export function createRock(scene) {
    const rockGroup = new THREE.Group();

    const isMobilePortrait = window.innerWidth <= MOBILE_PORTRAIT_MAX_WIDTH && window.innerHeight > window.innerWidth;
    const isMobileLandscape = window.innerWidth <= MOBILE_LANDSCAPE_MAX_WIDTH && window.innerWidth > window.innerHeight;
    const isMobile = isMobilePortrait || isMobileLandscape;
    const scale = isMobile ? MOBILE_SCALE_FACTOR : 1;
    currentScale = scale;

    const mainGeometry = new THREE.SphereGeometry(100 * scale, 8, 6);
    const vertices = mainGeometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i] *= (0.7 + Math.random() * 0.6);
        vertices[i + 1] *= (0.8 + Math.random() * 0.4);
        vertices[i + 2] *= (0.7 + Math.random() * 0.6);
    }
    mainGeometry.attributes.position.needsUpdate = true;
    mainGeometry.computeVertexNormals();

    const rockMaterial = new THREE.MeshLambertMaterial({
        color: 0x666666,
        flatShading: true,
        transparent: true,
        opacity: 1
    });

    const mainRock = new THREE.Mesh(mainGeometry, rockMaterial);
    rockGroup.add(mainRock);

    for (let i = 0; i < 5; i++) {
        const smallGeometry = new THREE.SphereGeometry((20 + Math.random() * 30) * scale, 4, 3);
        const smallVertices = smallGeometry.attributes.position.array;

        for (let j = 0; j < smallVertices.length; j += 3) {
            smallVertices[j] *= (0.5 + Math.random() * 0.8);
            smallVertices[j + 1] *= (0.6 + Math.random() * 0.8);
            smallVertices[j + 2] *= (0.5 + Math.random() * 0.8);
        }
        smallGeometry.attributes.position.needsUpdate = true;
        smallGeometry.computeVertexNormals();

        const smallRock = new THREE.Mesh(smallGeometry, rockMaterial);
        smallRock.position.set(
            (Math.random() - 0.5) * 150 * scale,
            (Math.random() - 0.5) * 100 * scale,
            (Math.random() - 0.5) * 150 * scale
        );
        rockGroup.add(smallRock);
    }

    const box = new THREE.Box3().setFromObject(rockGroup);
    const center = box.getCenter(new THREE.Vector3());

    rockGroup.children.forEach(child => {
        child.position.sub(center);
    });

    rock = rockGroup;
    rock.position.set(0, 0, 0);
    scene.add(rock);
}

export function createAsciiPlane(scene) {
    const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);

    const vertices = geometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i + 2] = Math.random() * 20 - 10;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();

    const material = new THREE.MeshLambertMaterial({
        color: 0x888888,
        flatShading: true,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide
    });

    asciiPlane = new THREE.Mesh(geometry, material);
    asciiPlane.position.set(0, 0, 0);
    asciiPlane.rotation.x = -Math.PI / 2;
    asciiPlane.visible = false;
    scene.add(asciiPlane);
}
