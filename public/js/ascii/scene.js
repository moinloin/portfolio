import * as THREE from "three";

export let camera, scene, renderer, effect, controls;

export function initScene(AsciiEffect, TrackballControls) {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(0, 300, 50);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0, 0, 0);

    const pointLight1 = new THREE.PointLight(0xffffff, 3, 0, 0);
    pointLight1.position.set(500, 500, 500);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 0, 0);
    pointLight2.position.set(-500, -500, -500);
    scene.add(pointLight2);

    renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    effect = new AsciiEffect(renderer, " .:-+*=%@#", { invert: true });
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.domElement.style.color = "black";
    effect.domElement.style.backgroundColor = "transparent";

    effect.domElement.style.position = "fixed";
    effect.domElement.style.top = "0";
    effect.domElement.style.left = "0";
    effect.domElement.style.width = "100vw";
    effect.domElement.style.height = "100vh";
    effect.domElement.style.zIndex = "1";

    effect.domElement.id = "ascii-effect";
    effect.domElement.style.pointerEvents = "none";

    const bgLayer = document.createElement("div");
    bgLayer.style.position = "fixed";
    bgLayer.style.top = "0";
    bgLayer.style.left = "0";
    bgLayer.style.width = "100vw";
    bgLayer.style.height = "100vh";
    bgLayer.style.backgroundColor = "white";
    bgLayer.style.zIndex = "-1";
    document.body.appendChild(bgLayer);

    document.body.appendChild(effect.domElement);

    renderer.domElement.style.position = "fixed";
    renderer.domElement.style.top = "0";
    renderer.domElement.style.left = "0";
    renderer.domElement.style.width = "100vw";
    renderer.domElement.style.height = "100vh";
    renderer.domElement.style.zIndex = "1";
    renderer.domElement.style.display = "none";
    renderer.domElement.id = "shader-canvas";
    document.body.appendChild(renderer.domElement);

    controls = new TrackballControls(camera, effect.domElement);
    controls.enabled = false;
}

export function onWindowResize(shaderAsciiMesh) {
    if (!camera || !renderer || !effect) return;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
    effect.setSize(window.innerWidth, window.innerHeight);

    if (shaderAsciiMesh) {
        const cellWidth = 8;
        const cellHeight = 16;
        const gridCols = Math.ceil(window.innerWidth / cellWidth);
        const gridRows = Math.ceil(window.innerHeight / cellHeight);

        shaderAsciiMesh.material.uniforms.uGrid.value.set(gridCols, gridRows);
        shaderAsciiMesh.material.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}
