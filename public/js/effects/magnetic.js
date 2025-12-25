import { CONSTANTS } from "../core/constants.js";

export function handleMagneticEffect(e) {
    document.querySelectorAll(".magnetic-letter").forEach(letter => {
        if (letter.closest("#info-link")) return;

        const rect = letter.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.sqrt((e.clientX - centerX) ** 2 + (e.clientY - centerY) ** 2);

        if (distance < CONSTANTS.MAGNETIC_DISTANCE) {
            const strength = Math.max(0, 1 - (distance / CONSTANTS.MAGNETIC_DISTANCE));
            const pullX = (e.clientX - centerX) * strength * CONSTANTS.MAGNETIC_STRENGTH;
            const pullY = (e.clientY - centerY) * strength * CONSTANTS.MAGNETIC_STRENGTH;

            letter.classList.add("magnetic");
            letter.style.transform = `translate(${pullX}px, ${pullY}px)`;
        } else {
            letter.classList.remove("magnetic");
            letter.style.transform = "translate(0px, 0px)";
        }
    });
}

export function storeOriginalPositions() {
    document.querySelectorAll(".magnetic-letter, #info-link .typewriter-char").forEach(letter => {
        if (!letter.dataset.originalPosition) {
            const rect = letter.getBoundingClientRect();
            letter.dataset.originalPosition = JSON.stringify({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                width: rect.width,
                height: rect.height,
                left: rect.left,
                top: rect.top
            });
            letter.dataset.originalStyle = letter.getAttribute("style") || "";
        }
    });
}
