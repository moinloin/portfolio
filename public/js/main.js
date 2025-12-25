import { CONSTANTS } from "./core/constants.js";
import { timeouts, currentProject } from "./core/state.js";
import { debounce } from "./core/utils.js";
import { initTypewriter, initAboutTypewriter } from "./effects/typewriter.js";
import { handleMagneticEffect, storeOriginalPositions } from "./effects/magnetic.js";
import { loadProjects } from "./features/projects.js";
import { preloadAllImages, hideProjectImage } from "./features/images.js";
import { toggleModal } from "./features/modal.js";
import { createParticles } from "./features/particles.js";

document.addEventListener("mousemove", handleMouseMove);
document.addEventListener("keydown", handleKeyDown);
window.addEventListener("resize", debounce(handleResize, CONSTANTS.RESIZE_DEBOUNCE));

document.addEventListener("DOMContentLoaded", function() {
    setupEventListeners();
    createParticles();
    loadProjects();
    initTypewriter();
    initAboutTypewriter();

    setTimeout(() => storeOriginalPositions(), 100);
    preloadAllImages();
});

function setupEventListeners() {
    const closeModalBtn = document.getElementById("close-modal-btn");
    if (closeModalBtn) {
        closeModalBtn.addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleModal(false);
        });
    }

    const projectList = document.getElementById("project-list");
    if (projectList) {
        projectList.addEventListener("mouseleave", function() {
            if (currentProject) {
                timeouts.hide = setTimeout(() => hideProjectImage(), CONSTANTS.IMAGE_HIDE_DELAY);
            }
        });

        projectList.addEventListener("mouseenter", function() {
            if (timeouts.hide) {
                clearTimeout(timeouts.hide);
                timeouts.hide = null;
            }
        });
    }
}

function handleMouseMove(e) {
    handleMagneticEffect(e);
}

function handleKeyDown(e) {
    if (e.key === "Escape") {
        toggleModal(false);
    }
}

function handleResize() {
    initAboutTypewriter();
}
