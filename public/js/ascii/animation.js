import { camera, scene, renderer, effect, controls } from "./scene.js";
import { rock, asciiPlane } from "./geometries.js";
import { posterGroup, videoGroup, updatePosterOverlay, updateVideoOverlay } from "./galleries.js";
import { shaderAsciiScene, shaderAsciiCamera, shaderAsciiMesh, mousePosition } from "./shaders.js";

// Constants
const DESKTOP_SCROLL_OFFSET = 200;
const MOBILE_LANDSCAPE_SCROLL_OFFSET = 130;
const MOBILE_PORTRAIT_SCROLL_OFFSET = 144;
const MOBILE_PORTRAIT_MAX_WIDTH = 767;
const MOBILE_LANDSCAPE_MAX_WIDTH = 932;

// Animation state
const start = Date.now();
let showPlainBackground = false;

export function animate() {
    if (!rock || !effect || !scene || !camera || !controls) {
        requestAnimationFrame(animate);
        return;
    }

    const timer = Date.now() - start;

    rock.rotation.x = timer * 0.0002;
    rock.rotation.y = timer * 0.0001;
    rock.rotation.z = timer * 0.0003;

    if (asciiPlane) {
        asciiPlane.rotation.z = timer * 0.0003;
    }

    if (posterGroup) {
        posterGroup.rotation.y = timer * 0.0005;
    }

    if (videoGroup) {
        videoGroup.rotation.x = timer * -0.0005;
    }

    if (showPlainBackground && shaderAsciiMesh) {
        shaderAsciiMesh.material.uniforms.uMouse.value.set(mousePosition.x, window.innerHeight - mousePosition.y);
        shaderAsciiMesh.material.uniforms.uTime.value = timer * 0.001;

        renderer.autoClear = true;
        renderer.render(shaderAsciiScene, shaderAsciiCamera);
    } else if (!showPlainBackground) {
        effect.render(scene, camera);
    }

    updatePosterOverlay(camera);
    updateVideoOverlay(camera);

    requestAnimationFrame(animate);
}

export function setupScrollHandling() {
    window.addEventListener("scroll", () => {
        updateCameraFromScroll();
    }, { passive: true });
}

export function updateCameraFromScroll() {
    if (!camera) return;

    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    const zone1End = viewportHeight;
    const bufferZoneEnd = viewportHeight * 1.5;
    const zone2Start = bufferZoneEnd;
    const zone2End = viewportHeight * 2;

    let currentAngle;
    let distance;

    if (scrollY <= zone1End) {
        const progress = scrollY / viewportHeight;
        const startAngle = Math.PI / 2;
        const endAngle = 0;
        currentAngle = startAngle + (endAngle - startAngle) * progress;
        distance = 300;
    } else if (scrollY > zone1End && scrollY <= bufferZoneEnd) {
        currentAngle = 0;
        distance = 300;
    } else if (scrollY > bufferZoneEnd && scrollY < zone2End) {
        const zone2Progress = (scrollY - zone2Start) / (viewportHeight * 0.5);

        const rotationProgress = Math.min(1, zone2Progress * 2);
        const startAngle = 0;
        const endAngle = -Math.PI / 2;
        currentAngle = startAngle + (endAngle - startAngle) * rotationProgress;

        if (zone2Progress <= 0.5) {
            distance = 300;
        } else {
            const zoomProgress = (zone2Progress - 0.5) / 0.5;
            const startDistance = 300;
            const endDistance = 50;
            distance = startDistance - (startDistance - endDistance) * zoomProgress;
        }
    } else {
        currentAngle = -Math.PI / 2;
        distance = 50;
    }

    const currentY = Math.sin(currentAngle) * distance;
    const currentZ = Math.cos(currentAngle) * distance;

    camera.position.set(0, currentY, currentZ);
    camera.lookAt(0, 0, 0);

    if (scrollY > bufferZoneEnd && scrollY < zone2End) {
        const zone2Progress = (scrollY - zone2Start) / (viewportHeight * 0.5);

        showPlainBackground = false;

        if (effect && effect.domElement) {
            effect.domElement.style.display = "block";
            effect.domElement.style.visibility = "visible";
            effect.domElement.style.opacity = "1";
        }
        if (renderer && renderer.domElement) {
            renderer.domElement.style.display = "none";
        }

        if (zone2Progress <= 0.5) {
            if (rock) {
                rock.visible = true;
                rock.traverse((child) => {
                    if (child.material) child.material.opacity = 1;
                });
            }
            if (asciiPlane) asciiPlane.visible = false;
        } else {
            const fadeProgress = (zone2Progress - 0.5) / 0.5;

            if (rock) {
                rock.visible = true;
                rock.traverse((child) => {
                    if (child.material) {
                        child.material.transparent = true;
                        child.material.opacity = 1 - fadeProgress;
                    }
                });
            }

            if (asciiPlane) {
                asciiPlane.visible = true;
                asciiPlane.material.transparent = true;
                asciiPlane.material.opacity = fadeProgress;
            }
        }
    }

    if (scrollY >= zone2End) {
        showPlainBackground = true;

        if (rock) rock.visible = false;
        if (asciiPlane) asciiPlane.visible = false;

        if (effect && effect.domElement) {
            effect.domElement.style.display = "none";
            effect.domElement.style.opacity = "0";
        }
        if (renderer && renderer.domElement) {
            renderer.domElement.style.display = "block";
            renderer.domElement.style.opacity = "1";
        }
    } else if (scrollY < bufferZoneEnd) {
        showPlainBackground = false;

        if (rock) {
            rock.visible = true;
            rock.traverse((child) => {
                if (child.material) child.material.opacity = 1;
            });
        }
        if (asciiPlane) asciiPlane.visible = false;

        if (effect && effect.domElement) {
            effect.domElement.style.display = "block";
            effect.domElement.style.visibility = "visible";
            effect.domElement.style.opacity = "1";
        }
        if (renderer && renderer.domElement) {
            renderer.domElement.style.display = "none";
            renderer.domElement.style.opacity = "0";
        }
    }

    updateContentPosition(scrollY, viewportHeight);
}

function updateContentPosition(scrollY, viewportHeight) {
    const isMobilePortrait = window.innerWidth <= MOBILE_PORTRAIT_MAX_WIDTH && window.innerHeight > window.innerWidth;
    const isMobileLandscape = window.innerWidth > window.innerHeight && window.innerWidth <= MOBILE_LANDSCAPE_MAX_WIDTH;
    const offset = isMobilePortrait ? MOBILE_PORTRAIT_SCROLL_OFFSET : (isMobileLandscape ? MOBILE_LANDSCAPE_SCROLL_OFFSET : DESKTOP_SCROLL_OFFSET);

    const zone1End = viewportHeight;
    const bufferZoneEnd = viewportHeight * 1.5;
    const zone2Start = bufferZoneEnd;

    let logoTranslate, bioTranslate, projectsTranslate, projectOpacity;

    if (scrollY <= zone1End) {
        const progress = scrollY / viewportHeight;
        logoTranslate = -(viewportHeight - offset) * progress;
        bioTranslate = -(viewportHeight - offset) * progress;
        projectsTranslate = (viewportHeight - offset) * (1 - progress);
        projectOpacity = progress;
    } else if (scrollY > zone1End && scrollY <= bufferZoneEnd) {
        logoTranslate = -(viewportHeight - offset);
        bioTranslate = -(viewportHeight - offset);
        projectsTranslate = 0;
        projectOpacity = 1;
    } else {
        const zone2Progress = (scrollY - zone2Start) / (viewportHeight * 0.5);

        logoTranslate = -(viewportHeight - offset);
        bioTranslate = -(viewportHeight - offset);

        const projectProgress = Math.min(1, zone2Progress * 2);
        const additionalTranslate = -viewportHeight * projectProgress;
        projectsTranslate = additionalTranslate;

        projectOpacity = 1;
    }

    const logoLink = document.getElementById("logo-link");
    if (logoLink) {
        logoLink.style.transform = `translateY(${logoTranslate}px)`;
    }

    const bioMarquee = document.getElementById("bio-marquee");
    if (bioMarquee) {
        bioMarquee.style.transform = `translateY(${bioTranslate}px)`;
    }

    const projectsHeader = document.querySelector(".fixed.bottom-8.left-8");
    if (projectsHeader) {
        projectsHeader.style.transform = `translateY(${projectsTranslate}px)`;
        projectsHeader.style.opacity = projectOpacity;
    }

    const projectSidebar = document.querySelector(".w-1\\/4");
    if (projectSidebar) {
        projectSidebar.style.transform = `translateY(${projectsTranslate}px)`;
        projectSidebar.style.opacity = projectOpacity;
    }

    const bioText = document.getElementById("bio-text");
    if (bioText) {
        bioText.style.opacity = projectOpacity;
    }

    const contentGrid = document.getElementById("content-grid");
    if (contentGrid) {
        const gridStart = viewportHeight * 1.95;
        const fadeDuration = viewportHeight * 0.05;

        if (scrollY >= gridStart + fadeDuration) {
            contentGrid.style.opacity = 1;
            contentGrid.style.transform = "translateY(0)";
        } else if (scrollY >= gridStart) {
            const fadeProgress = (scrollY - gridStart) / fadeDuration;
            contentGrid.style.opacity = fadeProgress;
            contentGrid.style.transform = `translateY(${20 * (1 - fadeProgress)}px)`;
        } else {
            contentGrid.style.opacity = 0;
            contentGrid.style.transform = "translateY(20px)";
        }
    }
}

export { showPlainBackground };
