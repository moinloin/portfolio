import { CONSTANTS } from "../core/constants.js";
import { cache, currentProject, timeouts, setCurrentProject } from "../core/state.js";
import { toggleModal } from "./modal.js";

export function preloadImage(src) {
    return new Promise((resolve, reject) => {
        if (cache.images.has(src)) {
            resolve(cache.images.get(src));
            return;
        }

        const img = new Image();
        img.onload = () => {
            cache.images.set(src, img);
            resolve(img);
        };
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = src;
    });
}

export async function preloadAllImages() {
    const { projects } = await import("../core/state.js");
    const imageProjects = projects.filter(p => p.type === "image");

    imageProjects.forEach(project => {
        const imageSrc = project.preview || project.image;
        preloadImage(imageSrc).then(img => {
            cache.preloaded.set(project.id, img);
        }).catch(() => {});
    });
}

export function showProjectImage(project) {
    if (currentProject?.id === project.id) return;

    const container = document.getElementById("project-image-container");
    const bioText = document.getElementById("bio-text");

    if (timeouts.imageTransition) {
        clearTimeout(timeouts.imageTransition);
    }

    bioText.style.opacity = "0";
    bioText.style.transform = "translateY(10px)";

    if (currentProject && currentProject.id !== project.id) {
        const currentDiv = container.firstChild;
        if (currentDiv) {
            currentDiv.style.opacity = "0";
            currentDiv.style.transform = "translateY(10px)";
        }

        timeouts.imageTransition = setTimeout(() => {
            createAndShowProjectImage(container, project);
        }, CONSTANTS.IMAGE_TRANSITION_DELAY);
    } else {
        createAndShowProjectImage(container, project);
    }

    setCurrentProject(project);
}

export function hideProjectImage() {
    const bioText = document.getElementById("bio-text");
    const container = document.getElementById("project-image-container");

    if (timeouts.imageTransition) {
        clearTimeout(timeouts.imageTransition);
    }

    if (timeouts.hide) {
        clearTimeout(timeouts.hide);
        timeouts.hide = null;
    }

    if (container.firstChild) {
        container.firstChild.style.opacity = "0";
        container.firstChild.style.transform = "translateY(10px)";

        timeouts.imageTransition = setTimeout(() => {
            container.innerHTML = "";
            bioText.style.opacity = "1";
            bioText.style.transform = "translateY(0)";
            setCurrentProject(null);
        }, 300);
    } else {
        bioText.style.opacity = "1";
        bioText.style.transform = "translateY(0)";
        setCurrentProject(null);
    }
}

function createAndShowProjectImage(container, project) {
    container.innerHTML = "";

    const div = document.createElement("div");
    div.className = "project-container h-screen w-full flex justify-end items-center";

    div.addEventListener("click", function() {
        toggleModal(true, project);
    });

    div.addEventListener("mouseleave", function() {
        timeouts.hide = setTimeout(() => hideProjectImage(), CONSTANTS.IMAGE_HIDE_DELAY);
    });

    div.addEventListener("mouseenter", function() {
        if (timeouts.hide) {
            clearTimeout(timeouts.hide);
            timeouts.hide = null;
        }
    });

    const cachedImg = cache.preloaded.get(project.id) || cache.images.get(project.image);

    if (cachedImg) {
        displayCachedImage(div, cachedImg, project);
    } else {
        loadAndDisplayImage(div, project);
    }

    container.appendChild(div);
}

export function displayCachedImage(div, img, project) {
    const clonedImg = img.cloneNode();
    clonedImg.alt = project.alt || project.name;
    clonedImg.className = "h-screen w-auto object-contain";
    clonedImg.style.opacity = "0";
    clonedImg.style.transition = "opacity 0.05s ease";

    div.appendChild(clonedImg);

    requestAnimationFrame(() => {
        clonedImg.style.opacity = "1";
        div.style.opacity = "1";
        div.style.transform = "translateY(0)";
    });
}

export function loadAndDisplayImage(div, project) {
    try {
        const usePreview = project.preview && project.preview !== project.image;
        const imgSrc = usePreview ? project.preview : project.image;

        if (!imgSrc) {
            console.error("Image source missing for project:", project);
            div.style.display = "none";
            return;
        }

        const img = document.createElement("img");
        img.alt = project.alt || project.name;
        img.className = "h-screen w-auto object-contain";
        img.style.opacity = "0";
        img.style.transition = "opacity 0.05s ease";

        if (usePreview) {
            img.style.filter = "blur(0px)";
        }

        const loadingDiv = document.createElement("div");
        loadingDiv.className = "flex items-center justify-center h-screen w-full";
        const spinner = document.createElement("div");
        spinner.className = "loading-spinner";
        loadingDiv.appendChild(spinner);
        div.appendChild(loadingDiv);

        img.onload = function() {
            cache.images.set(imgSrc, img);
            cache.preloaded.set(project.id, img);

            div.innerHTML = "";
            div.appendChild(img);

            requestAnimationFrame(() => {
                img.style.opacity = "1";
                div.style.opacity = "1";
                div.style.transform = "translateY(0)";
            });

            if (usePreview && project.image !== project.preview) {
                preloadFullImage(project.image, project.id);
            }
        };

        img.onerror = function(error) {
            console.error("Failed to load image:", imgSrc, error);
            div.style.display = "none";
        };

        img.src = imgSrc;
    } catch (error) {
        console.error("Error in loadAndDisplayImage:", error);
        div.style.display = "none";
    }
}

export function preloadFullImage(imagePath, projectId) {
    if (cache.images.has(imagePath)) return;

    const img = new Image();
    img.onload = function() {
        cache.images.set(imagePath, img);
        cache.preloaded.set(projectId, img);
    };
    img.src = imagePath;
}
