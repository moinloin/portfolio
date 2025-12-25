import { projects, setProjects, timeouts } from "../core/state.js";
import { preloadImage, showProjectImage, hideProjectImage } from "./images.js";
import { animateProjectTypewriter } from "../effects/typewriter.js";
import { toggleModal } from "./modal.js";

export async function loadProjects() {
    try {
        const response = await fetch("/data/projects.json");
        if (!response.ok) throw new Error("Failed to load projects");
        const loadedProjects = await response.json();
        setProjects(loadedProjects);
    } catch (error) {
        console.error("Error loading projects:", error);
        setProjects(getFallbackProjects());
    }

    renderProjects();
    projects.filter(p => p.type === "image").forEach(p => {
        const src = p.preview || p.image;
        preloadImage(src);
    });
}

export function getFallbackProjects() {
    return [
        { id: 1, name: "lookbook", category: "poster", type: "image", image: "/images/lookbook.png", alt: "Lookbook poster design" },
        { id: 2, name: "rock", category: "poster", type: "image", image: "/images/rock.jpg", alt: "Rock climbing poster" },
        { id: 3, name: "fontainebleau", category: "poster", type: "image", image: "/images/fontainebleau.jpg", alt: "Fontainebleau bouldering poster" },
        { id: 4, name: "bloom", category: "poster", type: "image", image: "/images/bloom.jpg", alt: "Bloom poster design" },
        { id: 6, name: "portfolio", category: "code", type: "github", github: "moinloin/portfolio", title: "portfolio", description: "A collection of projects and experiences.", stars: "1", forks: "0", language: "HTML" },
        { id: 7, name: "deployment", category: "code", type: "github", github: "moinloin/VM-deployment", title: "vm deployment", description: "Automated API for provisioning Proxmox VMs.", stars: "1", forks: "0", language: "Python" }
    ];
}

export function renderProjects() {
    const posterList = document.getElementById("poster-list");
    const videoList = document.getElementById("video-list");
    const codeList = document.getElementById("code-list");
    const mainList = document.getElementById("project-list");

    if (posterList) posterList.innerHTML = "";
    if (videoList) videoList.innerHTML = "";
    if (codeList) codeList.innerHTML = "";
    if (mainList) mainList.innerHTML = "";

    const posterProjects = projects.filter(p => p.category === "poster");
    const videoProjects = projects.filter(p => p.category === "video");
    const codeProjects = projects.filter(p => p.category === "code");
    const mainProjects = projects.filter(p => p.category !== "poster" && p.category !== "video" && p.category !== "code");

    posterProjects.forEach((project, index) => {
        const listItem = createProjectListItem(project, index, "poster");
        if (posterList) posterList.appendChild(listItem);
    });

    videoProjects.forEach((project, index) => {
        const listItem = createProjectListItem(project, index, "video");
        if (videoList) videoList.appendChild(listItem);
    });

    codeProjects.forEach((project, index) => {
        const listItem = createProjectListItem(project, index, "code");
        if (codeList) codeList.appendChild(listItem);
    });

    mainProjects.forEach((project, index) => {
        const listItem = createProjectListItem(project, index, "main");
        if (mainList) mainList.appendChild(listItem);
    });
}

export function createProjectListItem(project, index, category) {
    const li = document.createElement("li");
    li.style.opacity = "0";
    li.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

    const link = document.createElement("a");
    link.href = "#";
    link.className = category === "main" ? "project-link" : "project-link top-project-link";
    link.setAttribute("aria-label", `View ${project.name} project`);

    project.name.split("").forEach(char => {
        const span = document.createElement("span");
        span.className = "typewriter-char";
        span.textContent = char;
        link.appendChild(span);
    });

    attachProjectEventListeners(link, project, category);
    li.appendChild(link);

    return li;
}

function attachProjectEventListeners(link, project, category) {
    link.addEventListener("click", function(e) {
        e.preventDefault();
        toggleModal(true, project);
    });

    link.addEventListener("mouseenter", function() {
        animateProjectTypewriter(link, project.name);

        if (project.type === "image" || (category === "video" && project.image)) {
            if (timeouts.hide) {
                clearTimeout(timeouts.hide);
                timeouts.hide = null;
            }

            if (category === "poster") {
                showPosterPreview(project);
            } else if (category === "video") {
                showVideoPreview(project);
            } else {
                showProjectImage(project);
            }
        }
    });

    link.addEventListener("mouseleave", function() {
        if (project.type !== "image" && !(category === "video" && project.image)) return;

        timeouts.hide = setTimeout(() => {
            if (category === "poster") {
                hidePosterPreview();
            } else if (category === "video") {
                hideVideoPreview();
            } else {
                hideProjectImage();
            }
        }, 100);
    });
}

function showPosterPreview(project) {
    if (timeouts.hide) {
        clearTimeout(timeouts.hide);
        timeouts.hide = null;
    }

    if (window.highlightPoster) {
        window.highlightPoster(project.name);
    }
}

function hidePosterPreview() {
    if (window.unhighlightPoster) {
        window.unhighlightPoster();
    }
}

function showVideoPreview(project) {
    if (timeouts.hide) {
        clearTimeout(timeouts.hide);
        timeouts.hide = null;
    }

    if (window.highlightVideo) {
        window.highlightVideo(project.name);
    }
}

function hideVideoPreview() {
    if (window.unhighlightVideo) {
        window.unhighlightVideo();
    }
}
