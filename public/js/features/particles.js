import { CONSTANTS } from "../core/constants.js";

export function createParticles() {
    const container = document.getElementById("particles");
    if (!container) return;

    for (let i = 0; i < CONSTANTS.PARTICLE_COUNT; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 20 + "s";
        particle.style.animationDuration = (20 + Math.random() * 10) + "s";
        container.appendChild(particle);
    }
}
