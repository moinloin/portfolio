import { CONSTANTS } from "../core/constants.js";
import { isTyping, timeouts, setIsTyping } from "../core/state.js";

export function initTypewriter() {
    const element = document.querySelector(".typewriter-text");
    if (!element) return;

    const originalText = element.textContent;
    element.textContent = "";
    element.classList.add("initialized");

    setTimeout(() => {
        typeWriterForward(element, originalText);
    }, 150);

    window.typewriterElement = element;
    window.originalText = originalText;
}

export function typeWriterForward(element, text, callback, reverse = false) {
    if (timeouts.typewriter) {
        clearTimeout(timeouts.typewriter);
        timeouts.typewriter = null;
    }

    setIsTyping(true);
    element.textContent = "";
    element.classList.add("typing");
    element.classList.remove("finished");

    const textToType = reverse ? text.split("").reverse().join("") : text;
    let currentIndex = 0;

    const typeNextLetter = () => {
        if (!isTyping) return;

        if (currentIndex < textToType.length) {
            element.textContent += textToType[currentIndex];
            currentIndex++;

            const randomDelay = Math.random() * 150 + 50;

            timeouts.typewriter = setTimeout(typeNextLetter, randomDelay);
        } else {
            element.classList.remove("typing");
            element.classList.add("finished");
            setIsTyping(false);
            timeouts.typewriter = null;

            if (callback) callback();
        }
    };

    typeNextLetter();
}

export function animateTypewriter(element, originalText, arrowSelector = null) {
    const chars = element.querySelectorAll(".typewriter-char");
    if (chars.length === 0 || element.dataset.animating === "true") return;

    element.dataset.animating = "true";
    const arrow = arrowSelector ? element.querySelector(arrowSelector) : null;

    const getRandomChar = () => {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    };

    chars.forEach((char, index) => {
        setTimeout(() => {
            char.textContent = getRandomChar();
        }, index * CONSTANTS.TYPEWRITER.CHAR_DELAY);
    });

    setTimeout(() => {
        chars.forEach((char, index) => {
            setTimeout(() => {
                let changeCount = 0;
                const maxChanges = CONSTANTS.TYPEWRITER.RANDOM_CHANGES;

                const changeInterval = setInterval(() => {
                    if (changeCount < maxChanges) {
                        char.textContent = getRandomChar();
                        changeCount++;
                    } else {
                        clearInterval(changeInterval);
                        char.textContent = originalText[index];

                        if (index === chars.length - 1) {
                            setTimeout(() => {
                                if (arrow) arrow.style.opacity = "1";
                                element.dataset.animating = "false";
                            }, arrow ? CONSTANTS.TYPEWRITER.FINISH_DELAY_WITH_ARROW : CONSTANTS.TYPEWRITER.FINISH_DELAY_NO_ARROW);
                        }
                    }
                }, CONSTANTS.TYPEWRITER.CHANGE_INTERVAL);
            }, index * CONSTANTS.TYPEWRITER.LETTER_DELAY);
        });
    }, CONSTANTS.TYPEWRITER.START_DELAY);
}

export function animateProjectTypewriter(element, originalText) {
    animateTypewriter(element, originalText);
}

export function initAboutTypewriter() {
    const aboutLink = document.getElementById("info-link");
    if (!aboutLink) return;

    aboutLink.addEventListener("mouseenter", () => animateAboutTypewriter(aboutLink, "about"));
    aboutLink.addEventListener("mouseleave", () => hideAboutArrow(aboutLink));
}

export function animateAboutTypewriter(element, originalText) {
    animateTypewriter(element, originalText, ".about-arrow");
}

export function hideAboutArrow(element) {
    const arrow = element.querySelector(".about-arrow");
    if (arrow) {
        arrow.style.opacity = "0";
    }
}

export function initRepoTypewriter() {
    const repoLink = document.getElementById("github-link");
    if (repoLink) {
        repoLink.addEventListener("mouseenter", () => animateRepoTypewriter(repoLink, "repository"));
        repoLink.addEventListener("mouseleave", () => hideRepoArrow(repoLink));
    }

    const websiteLink = document.getElementById("website-link");
    if (websiteLink && websiteLink.style.display !== "none") {
        websiteLink.addEventListener("mouseenter", () => animateWebsiteTypewriter(websiteLink, "website"));
        websiteLink.addEventListener("mouseleave", () => hideWebsiteArrow(websiteLink));
    }
}

export function animateRepoTypewriter(element, originalText) {
    animateTypewriter(element, originalText, ".repo-arrow");
}

export function hideRepoArrow(element) {
    const arrow = element.querySelector(".repo-arrow");
    if (arrow) {
        arrow.style.opacity = "0";
    }
}

export function animateWebsiteTypewriter(element, originalText) {
    animateTypewriter(element, originalText, ".website-arrow");
}

export function hideWebsiteArrow(element) {
    const arrow = element.querySelector(".website-arrow");
    if (arrow) {
        arrow.style.opacity = "0";
    }
}
