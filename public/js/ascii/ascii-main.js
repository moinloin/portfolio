import { initScene, onWindowResize } from "./scene.js";
import { createRock, createAsciiPlane } from "./geometries.js";
import { createPosterGallery, createVideoGallery, highlightPoster, unhighlightPoster, highlightVideo, unhighlightVideo } from "./galleries.js";
import { setupShaderBackground, setupMouseTracking, shaderAsciiMesh } from "./shaders.js";
import { animate, setupScrollHandling, updateCameraFromScroll } from "./animation.js";
import { scene } from "./scene.js";

export async function initAsciiBackground() {
    try {
        const THREE = await import("three");
        window.THREE = THREE;

        const AsciiEffectModule = await import("/js/lib/AsciiEffect.js");
        const AsciiEffect = AsciiEffectModule.default || AsciiEffectModule.AsciiEffect;
        const { TrackballControls } = await import("three/addons/controls/TrackballControls.js");

        init(AsciiEffect, TrackballControls);

    } catch (error) {
        console.error("Failed to load Three.js modules:", error);
    }
}

function init(AsciiEffect, TrackballControls) {
    initScene(AsciiEffect, TrackballControls);

    createRock(scene);
    createAsciiPlane(scene);
    createPosterGallery(scene);
    createVideoGallery(scene);

    setupShaderBackground();
    setupMouseTracking();

    updateCameraFromScroll();
    setupScrollHandling();

    window.addEventListener("resize", () => {
        onWindowResize(shaderAsciiMesh);
        updateCameraFromScroll();
    });

    animate();
}

// Export highlight functions to window for HTML access
window.highlightPoster = highlightPoster;
window.unhighlightPoster = unhighlightPoster;
window.highlightVideo = highlightVideo;
window.unhighlightVideo = unhighlightVideo;

// Scroll restoration
window.history.scrollRestoration = "manual";
window.scrollTo(0, 0);

// Auto-initialize on page load
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAsciiBackground);
} else {
    initAsciiBackground();
}
