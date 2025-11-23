const isMobile = window.matchMedia("(max-width: 768px)").matches;

document.addEventListener("DOMContentLoaded", function() {
    createParticles();
    initBackTypewriter();
});

function createParticles() {
    const container = document.getElementById("particles");
    if (!container) return;

    for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        particle.style.left = Math.random() * 100 + "%";
        particle.style.top = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 20 + "s";
        particle.style.animationDuration = (20 + Math.random() * 10) + "s";
        container.appendChild(particle);
    }
}

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
