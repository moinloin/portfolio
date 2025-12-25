export let projects = [];
export let currentProject = null;
export let isTyping = false;

export const timeouts = {
    typewriter: null,
    imageTransition: null,
    hide: null,
};

export const cache = {
    images: new Map(),
    preloaded: new Map(),
};

export function setProjects(newProjects) {
    projects = newProjects;
}

export function setCurrentProject(project) {
    currentProject = project;
}

export function setIsTyping(value) {
    isTyping = value;
}
