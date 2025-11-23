const isMobile = window.matchMedia("(max-width: 768px)").matches;

function animateTypewriter(element, originalText) {
    const chars = element.querySelectorAll(".typewriter-char");
    if (chars.length === 0 || element.dataset.animating === "true") return;

    element.dataset.animating = "true";
    let arrowElement = element.querySelector(".arrow");

    const getRandomChar = () => {
        const alphabet = "abcdefghijklmnopqrstuvwxyz";
        return alphabet[Math.floor(Math.random() * alphabet.length)];
    };

    chars.forEach((char, index) => {
        setTimeout(() => {
            char.textContent = getRandomChar();
        }, index * 15);
    });

    setTimeout(() => {
        chars.forEach((char, index) => {
            setTimeout(() => {
                let changeCount = 0;
                const maxChanges = 2;

                const changeInterval = setInterval(() => {
                    if (changeCount < maxChanges) {
                        char.textContent = getRandomChar();
                        changeCount++;
                    } else {
                        clearInterval(changeInterval);
                        char.textContent = originalText[index];

                        if (index === chars.length - 1) {
                            setTimeout(() => {
                                if (!arrowElement) {
                                    arrowElement = document.createElement("span");
                                    arrowElement.textContent = " ←";
                                    arrowElement.className = "typewriter-char arrow";
                                    element.appendChild(arrowElement);

                                    setTimeout(() => {
                                        arrowElement.classList.add("show");
                                    }, 10);
                                }
                                element.dataset.animating = "false";
                            }, 40);
                        }
                    }
                }, 30);
            }, index * 35);
        });
    }, 80);
}

function removeArrow(element) {
    const arrowElement = element.querySelector(".arrow");
    if (arrowElement) {
        arrowElement.classList.remove("show");
        setTimeout(() => {
            if (arrowElement && arrowElement.parentNode) {
                arrowElement.remove();
            }
        }, 300);
    }
}

function initBackTypewriter() {
    const backLink = document.getElementById("back-link");
    if (!backLink || isMobile) return;

    backLink.addEventListener("mouseenter", () => {
        animateTypewriter(backLink, "back");
    });
  
    backLink.addEventListener("mouseleave", () => {
        removeArrow(backLink);
    });
}

function setupMobileLayout() {
    if (!isMobile) return;

    const container = document.querySelector(".container");
    if (container) {
        container.style.paddingTop = "60px";
    }

    const experienceTitle = document.querySelector(".experience-title");
    const experienceTopic = document.querySelector(".experience-topic");
    const experienceText = document.querySelector(".experience-text");

    if (experienceTitle && experienceTopic && experienceText) {
        const experienceWrapper = document.createElement("div");
        experienceWrapper.className = "experience-wrapper";

        const topics = experienceTopic.textContent.split("\n").filter(item => item.trim() !== "");
        const years = experienceText.textContent.split("\n").filter(item => item.trim() !== "");

        if (topics.length === years.length) {
            topics.forEach((topic, index) => {
                const experienceItem = document.createElement("div");
                experienceItem.className = "experience-item";

                const topicSpan = document.createElement("span");
                topicSpan.textContent = topic.trim();

                const yearSpan = document.createElement("span");
                yearSpan.textContent = years[index].trim();

                experienceItem.appendChild(topicSpan);
                experienceItem.appendChild(yearSpan);
                experienceWrapper.appendChild(experienceItem);
            });

            if (experienceTitle.nextSibling) {
                experienceTitle.parentNode.insertBefore(experienceWrapper, experienceTitle.nextSibling);
            } else {
                experienceTitle.parentNode.appendChild(experienceWrapper);
            }

            experienceTopic.style.display = "none";
            experienceText.style.display = "none";
        }
    }

    const projectElements = document.querySelectorAll("[class^=\"project-topic\"], [class^=\"project-text\"]");
  
    projectElements.forEach(element => {
        if (element.className.includes("topic")) {
            const section = document.createElement("div");
            section.className = "project-section";
            element.parentNode.insertBefore(section, element);
            section.appendChild(element);

            const textNumber = element.className.match(/\d+/)[0];
            const textElement = document.querySelector(`.project-text${textNumber}`);
            if (textElement) {
                section.appendChild(textElement);
            }
        }
    });
}

document.addEventListener("DOMContentLoaded", () => {
    initBackTypewriter();
    setupMobileLayout();

    window.addEventListener("resize", () => {
        const newIsMobile = window.matchMedia("(max-width: 768px)").matches;
        if (isMobile !== newIsMobile) {
            initBackTypewriter();
        }
    });
});