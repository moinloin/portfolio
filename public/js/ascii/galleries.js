import * as THREE from "three";
import { currentScale } from "./geometries.js";

// Constants
const MOBILE_SCALE_FACTOR = 0.5;
const MOBILE_PORTRAIT_MAX_WIDTH = 767;
const MOBILE_LANDSCAPE_MAX_WIDTH = 932;
const POSTER_HALF_WIDTH = 35;
const POSTER_HALF_HEIGHT = 52.5;
const VIDEO_HALF_WIDTH = 40;
const VIDEO_HALF_HEIGHT = 22.5;

export let posterGroup;
export let videoGroup;
export let highlightedPosterData = null;
export let highlightedVideoData = null;

export function createPosterGallery(scene) {
    posterGroup = new THREE.Group();

    const isMobilePortrait = window.innerWidth <= MOBILE_PORTRAIT_MAX_WIDTH && window.innerHeight > window.innerWidth;
    const isMobileLandscape = window.innerWidth <= MOBILE_LANDSCAPE_MAX_WIDTH && window.innerWidth > window.innerHeight;
    const isMobile = isMobilePortrait || isMobileLandscape;
    const scale = isMobile ? MOBILE_SCALE_FACTOR : 1;

    const radius = 150 * scale;
    const posterCount = 4;
    const posterNames = ["lookbook", "rock", "fontainebleau", "bloom"];

    for (let i = 0; i < posterCount; i++) {
        const angle = (i / posterCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const geometry = new THREE.PlaneGeometry(70 * scale, 105 * scale);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true
        });

        const poster = new THREE.Mesh(geometry, material);
        poster.position.set(x, 0, z);
        poster.userData.name = posterNames[i];
        poster.userData.index = i;

        const outwardDirection = new THREE.Vector3(x, 0, z).normalize();
        const lookAtPoint = new THREE.Vector3().addVectors(poster.position, outwardDirection);
        poster.lookAt(lookAtPoint);

        posterGroup.add(poster);
    }

    posterGroup.visible = true;
    scene.add(posterGroup);

    setTimeout(() => {
        loadPosterTextures();
    }, 500);
}

async function loadPosterTextures() {
    if (!window.THREE || !posterGroup) return;

    const posterProjects = [
        { image: "/images/lookbook.png" },
        { image: "/images/rock.jpg" },
        { image: "/images/fontainebleau.jpg" },
        { image: "/images/bloom.jpg" }
    ];

    const textureLoader = new window.THREE.TextureLoader();

    posterProjects.forEach((project, index) => {
        if (posterGroup.children[index]) {
            textureLoader.load(project.image, (texture) => {
                texture.generateMipmaps = false;
                texture.minFilter = window.THREE.LinearFilter;
                texture.magFilter = window.THREE.LinearFilter;

                posterGroup.children[index].material.map = texture;
                posterGroup.children[index].material.transparent = false;
                posterGroup.children[index].material.needsUpdate = true;
            }, undefined, (error) => {
                console.error("Error loading texture:", project.image, error);
            });
        }
    });
}

export function createVideoGallery(scene) {
    videoGroup = new THREE.Group();

    const isMobilePortrait = window.innerWidth <= MOBILE_PORTRAIT_MAX_WIDTH && window.innerHeight > window.innerWidth;
    const isMobileLandscape = window.innerWidth <= MOBILE_LANDSCAPE_MAX_WIDTH && window.innerWidth > window.innerHeight;
    const isMobile = isMobilePortrait || isMobileLandscape;
    const scale = isMobile ? MOBILE_SCALE_FACTOR : 1;

    const radius = 130 * scale;
    const videoCount = 1;
    const videoNames = ["a island Road Trip"];

    for (let i = 0; i < videoCount; i++) {
        const angle = (i / videoCount) * Math.PI * 2;
        const y = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const geometry = new THREE.PlaneGeometry(80 * scale, 45 * scale);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true
        });

        const video = new THREE.Mesh(geometry, material);
        video.position.set(0, y, z);
        video.userData.name = videoNames[i];
        video.userData.index = i;

        const outwardDirection = new THREE.Vector3(0, y, z).normalize();
        const lookAtPoint = new THREE.Vector3().addVectors(video.position, outwardDirection);
        video.lookAt(lookAtPoint);

        videoGroup.add(video);
    }

    videoGroup.visible = true;
    scene.add(videoGroup);

    setTimeout(() => {
        loadVideoTextures();
    }, 500);
}

async function loadVideoTextures() {
    if (!window.THREE || !videoGroup) return;

    const videoProjects = [
        { image: "/images/island-road-trip.jpg" }
    ];

    const textureLoader = new window.THREE.TextureLoader();

    videoProjects.forEach((project, index) => {
        if (videoGroup.children[index]) {
            textureLoader.load(project.image, (texture) => {
                texture.generateMipmaps = false;
                texture.minFilter = window.THREE.LinearFilter;
                texture.magFilter = window.THREE.LinearFilter;

                videoGroup.children[index].material.map = texture;
                videoGroup.children[index].material.transparent = false;
                videoGroup.children[index].material.needsUpdate = true;
            }, undefined, (error) => {
                console.error("Error loading texture:", project.image, error);
            });
        }
    });
}

export function highlightPoster(posterName) {
    if (!posterGroup) return;

    unhighlightPoster();

    const poster = posterGroup.children.find(p => p.userData.name === posterName);
    if (!poster) return;

    poster.visible = false;
    highlightedPosterData = { poster, posterName };

    let overlay = document.getElementById("poster-image-overlay");
    if (!overlay) {
        overlay = document.createElement("img");
        overlay.id = "poster-image-overlay";
        overlay.style.position = "fixed";
        overlay.style.pointerEvents = "none";
        overlay.style.zIndex = "3";
        overlay.style.transition = "transform 0.1s ease-out";
        document.body.appendChild(overlay);
    }

    const imageMap = {
        "lookbook": "/images/lookbook.png",
        "rock": "/images/rock.jpg",
        "fontainebleau": "/images/fontainebleau.jpg",
        "bloom": "/images/bloom.jpg"
    };

    overlay.src = imageMap[posterName];
    overlay.style.display = "block";
}

export function unhighlightPoster() {
    if (highlightedPosterData) {
        highlightedPosterData.poster.visible = true;
        highlightedPosterData = null;
    }

    const overlay = document.getElementById("poster-image-overlay");
    if (overlay) {
        overlay.style.display = "none";
    }
}

export function highlightVideo(videoName) {
    if (!videoGroup) return;

    unhighlightVideo();

    const video = videoGroup.children.find(v => v.userData.name === videoName);
    if (!video) return;

    video.visible = false;
    highlightedVideoData = { video, videoName };

    let overlay = document.getElementById("video-image-overlay");
    if (!overlay) {
        overlay = document.createElement("img");
        overlay.id = "video-image-overlay";
        overlay.style.position = "fixed";
        overlay.style.pointerEvents = "none";
        overlay.style.zIndex = "3";
        overlay.style.transition = "transform 0.1s ease-out";
        document.body.appendChild(overlay);
    }

    const imageMap = {
        "a island Road Trip": "/images/island-road-trip.jpg"
    };

    overlay.src = imageMap[videoName];
    overlay.style.display = "block";
}

export function unhighlightVideo() {
    if (highlightedVideoData) {
        highlightedVideoData.video.visible = true;
        highlightedVideoData = null;
    }

    const overlay = document.getElementById("video-image-overlay");
    if (overlay) {
        overlay.style.display = "none";
    }
}

export function updatePosterOverlay(camera) {
    if (!highlightedPosterData) return;

    const overlay = document.getElementById("poster-image-overlay");
    if (overlay && camera) {
        const poster = highlightedPosterData.poster;
        const scale = currentScale;

        const worldPos = new window.THREE.Vector3();
        poster.getWorldPosition(worldPos);

        const topLeft = new window.THREE.Vector3(-POSTER_HALF_WIDTH * scale, POSTER_HALF_HEIGHT * scale, 0);
        const topRight = new window.THREE.Vector3(POSTER_HALF_WIDTH * scale, POSTER_HALF_HEIGHT * scale, 0);
        const bottomLeft = new window.THREE.Vector3(-POSTER_HALF_WIDTH * scale, -POSTER_HALF_HEIGHT * scale, 0);
        const bottomRight = new window.THREE.Vector3(POSTER_HALF_WIDTH * scale, -POSTER_HALF_HEIGHT * scale, 0);

        topLeft.applyMatrix4(poster.matrixWorld);
        topRight.applyMatrix4(poster.matrixWorld);
        bottomLeft.applyMatrix4(poster.matrixWorld);
        bottomRight.applyMatrix4(poster.matrixWorld);

        const tlScreen = topLeft.project(camera);
        const trScreen = topRight.project(camera);
        const blScreen = bottomLeft.project(camera);
        const brScreen = bottomRight.project(camera);

        const tlx = (tlScreen.x * 0.5 + 0.5) * window.innerWidth;
        const tly = (-tlScreen.y * 0.5 + 0.5) * window.innerHeight;
        const trx = (trScreen.x * 0.5 + 0.5) * window.innerWidth;
        const try_ = (-trScreen.y * 0.5 + 0.5) * window.innerHeight;
        const blx = (blScreen.x * 0.5 + 0.5) * window.innerWidth;
        const bly = (-blScreen.y * 0.5 + 0.5) * window.innerHeight;
        const brx = (brScreen.x * 0.5 + 0.5) * window.innerWidth;
        const bry = (-brScreen.y * 0.5 + 0.5) * window.innerHeight;

        const posterWidth = Math.sqrt(Math.pow(trx - tlx, 2) + Math.pow(try_ - tly, 2));
        const posterHeight = Math.sqrt(Math.pow(bly - tly, 2) + Math.pow(blx - tlx, 2));
        const centerX = (tlx + trx + blx + brx) / 4;
        const centerY = (tly + try_ + bly + bry) / 4;

        const posterNormal = new window.THREE.Vector3(0, 0, 1);
        posterNormal.applyQuaternion(new window.THREE.Quaternion().setFromRotationMatrix(poster.matrixWorld));
        const cameraDirection = new window.THREE.Vector3();
        cameraDirection.subVectors(worldPos, camera.position).normalize();
        const dotProduct = posterNormal.dot(cameraDirection);
        const isFacingAway = dotProduct > 0;

        const posterDistance = camera.position.distanceTo(worldPos);
        const rockDistance = camera.position.distanceTo(new window.THREE.Vector3(0, 0, 0));

        const zIndex = posterDistance > rockDistance ? "0" : "3";

        overlay.style.left = `${centerX}px`;
        overlay.style.top = `${centerY}px`;
        overlay.style.width = `${posterWidth}px`;
        overlay.style.height = `${posterHeight}px`;
        overlay.style.zIndex = zIndex;
        overlay.style.opacity = "1";
        overlay.style.transform = `translate(-50%, -50%) scaleX(${isFacingAway ? -1 : 1})`;
    }
}

export function updateVideoOverlay(camera) {
    if (!highlightedVideoData) return;

    const overlay = document.getElementById("video-image-overlay");
    if (overlay && camera) {
        const video = highlightedVideoData.video;
        const scale = currentScale;

        const worldPos = new window.THREE.Vector3();
        video.getWorldPosition(worldPos);

        const topLeft = new window.THREE.Vector3(-VIDEO_HALF_WIDTH * scale, VIDEO_HALF_HEIGHT * scale, 0);
        const topRight = new window.THREE.Vector3(VIDEO_HALF_WIDTH * scale, VIDEO_HALF_HEIGHT * scale, 0);
        const bottomLeft = new window.THREE.Vector3(-VIDEO_HALF_WIDTH * scale, -VIDEO_HALF_HEIGHT * scale, 0);
        const bottomRight = new window.THREE.Vector3(VIDEO_HALF_WIDTH * scale, -VIDEO_HALF_HEIGHT * scale, 0);

        topLeft.applyMatrix4(video.matrixWorld);
        topRight.applyMatrix4(video.matrixWorld);
        bottomLeft.applyMatrix4(video.matrixWorld);
        bottomRight.applyMatrix4(video.matrixWorld);

        const tlScreen = topLeft.project(camera);
        const trScreen = topRight.project(camera);
        const blScreen = bottomLeft.project(camera);
        const brScreen = bottomRight.project(camera);

        const tlx = (tlScreen.x * 0.5 + 0.5) * window.innerWidth;
        const tly = (-tlScreen.y * 0.5 + 0.5) * window.innerHeight;
        const trx = (trScreen.x * 0.5 + 0.5) * window.innerWidth;
        const try_ = (-trScreen.y * 0.5 + 0.5) * window.innerHeight;
        const blx = (blScreen.x * 0.5 + 0.5) * window.innerWidth;
        const bly = (-blScreen.y * 0.5 + 0.5) * window.innerHeight;
        const brx = (brScreen.x * 0.5 + 0.5) * window.innerWidth;
        const bry = (-brScreen.y * 0.5 + 0.5) * window.innerHeight;

        const videoWidth = Math.sqrt(Math.pow(trx - tlx, 2) + Math.pow(try_ - tly, 2));
        const videoHeight = Math.sqrt(Math.pow(bly - tly, 2) + Math.pow(blx - tlx, 2));
        const centerX = (tlx + trx + blx + brx) / 4;
        const centerY = (tly + try_ + bly + bry) / 4;

        const videoNormal = new window.THREE.Vector3(0, 0, 1);
        videoNormal.applyQuaternion(new window.THREE.Quaternion().setFromRotationMatrix(video.matrixWorld));
        const cameraDirection = new window.THREE.Vector3();
        cameraDirection.subVectors(worldPos, camera.position).normalize();
        const dotProduct = videoNormal.dot(cameraDirection);
        const isFacingAway = dotProduct > 0;

        overlay.style.left = `${centerX}px`;
        overlay.style.top = `${centerY}px`;
        overlay.style.width = `${videoWidth}px`;
        overlay.style.height = `${videoHeight}px`;
        overlay.style.zIndex = "0";
        overlay.style.opacity = "1";
        overlay.style.transform = `translate(-50%, -50%) scaleX(${isFacingAway ? -1 : 1})`;
    }
}
