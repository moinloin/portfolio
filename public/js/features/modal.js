import { initRepoTypewriter } from "../effects/typewriter.js";

export function toggleModal(state, project = null) {
    const modal = document.getElementById("modal");
    if (!modal) {
        console.error("Modal element not found");
        return;
    }

    const modalImage = document.getElementById("modal-image");
    const modalVideo = document.getElementById("modal-video");
    const modalGithub = document.getElementById("modal-github");
    const loadingSpinner = document.getElementById("loading-spinner");

    if (state && project) {
        modal.classList.add("visible");
        modal.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";

        if (modalImage) modalImage.style.display = "none";
        if (modalVideo) modalVideo.style.display = "none";
        if (modalGithub) modalGithub.style.display = "none";
        if (loadingSpinner) loadingSpinner.style.display = "block";

        try {
            displayModalContent(project);
        } catch (error) {
            console.error("Error displaying modal content:", error);
            if (loadingSpinner) loadingSpinner.style.display = "none";
            toggleModal(false);
        }
    } else {
        modal.classList.remove("visible");
        modal.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }
}

export function displayModalContent(project) {
    const modalImage = document.getElementById("modal-image");
    const modalVideo = document.getElementById("modal-video");
    const modalGithub = document.getElementById("modal-github");
    const loadingSpinner = document.getElementById("loading-spinner");

    switch (project.type) {
    case "image":
        if (!project.image) {
            console.error("Image path missing for project:", project);
            if (loadingSpinner) loadingSpinner.style.display = "none";
            return;
        }
        const img = new Image();
        img.onload = function() {
            if (loadingSpinner) loadingSpinner.style.display = "none";
            if (modalImage) {
                modalImage.src = project.image;
                modalImage.alt = project.alt || project.name;
                modalImage.style.display = "block";
            }
        };
        img.onerror = (error) => {
            console.error("Failed to load image:", project.image, error);
            if (loadingSpinner) loadingSpinner.style.display = "none";
            toggleModal(false);
        };
        img.src = project.image;
        break;

    case "video":
        try {
            if (!project.video) {
                console.error("Video path missing for project:", project);
                if (loadingSpinner) loadingSpinner.style.display = "none";
                return;
            }
            if (loadingSpinner) loadingSpinner.style.display = "none";
            if (modalVideo) {
                const source = modalVideo.querySelector("source");
                const video = modalVideo.querySelector("video");
                if (source && video) {
                    modalVideo.style.display = "block";
                    source.src = project.video;
                    video.load();
                }
            }
        } catch (error) {
            console.error("Error loading video:", error);
            if (loadingSpinner) loadingSpinner.style.display = "none";
        }
        break;

    case "github":
        setTimeout(() => {
            try {
                if (loadingSpinner) loadingSpinner.style.display = "none";
                if (modalGithub) modalGithub.style.display = "block";

                const githubName = document.getElementById("github-name");
                const githubDesc = document.getElementById("github-description");
                const githubLang = document.getElementById("github-language");
                const githubLink = document.getElementById("github-link");

                if (githubName) githubName.textContent = project.title || project.name;
                if (githubDesc) githubDesc.textContent = project.description || "";
                if (githubLang) githubLang.textContent = project.language || "-";
                if (githubLink && project.github) {
                    githubLink.href = `https://github.com/${project.github}`;
                }

                const websiteLink = document.getElementById("website-link");
                if (websiteLink) {
                    if (project.website) {
                        websiteLink.href = project.website;
                        websiteLink.style.display = "inline-block";
                    } else {
                        websiteLink.style.display = "none";
                    }
                }

                setTimeout(() => initRepoTypewriter(), 100);
            } catch (error) {
                console.error("Error displaying GitHub project:", error);
                if (loadingSpinner) loadingSpinner.style.display = "none";
            }
        }, 500);
        break;

    default:
        console.error("Unknown project type:", project.type);
        if (loadingSpinner) loadingSpinner.style.display = "none";
    }
}
