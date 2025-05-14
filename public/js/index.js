const cursor = document.getElementById("custom-cursor");
const projectList = document.getElementById("project-list");
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");
const logoLink = document.getElementById("logo-link");
const infoLink = document.getElementById("info-link");
const closeModalBtn = document.getElementById("close-modal-btn");
const bioText = document.getElementById("bio-text");

const imageCache = {};
let currentlyDisplayedProject = null;
let isMobile = window.innerWidth <= 768;
let isTablet = window.innerWidth > 768 && window.innerWidth <= 1180;

let cursorX = 0;
let cursorY = 0;
let rafPending = false;

function handleCursorActivate(active) {
  if (cursor && !isMobile && !isTablet) {
    cursor.style.width = active ? "60px" : "40px";
    cursor.style.height = active ? "60px" : "40px";
  }
}

function toggleModal(state, src = "", alt = "") {
  modal.classList.toggle("opacity-0", !state);
  modal.classList.toggle("invisible", !state);
  modal.classList.toggle("opacity-100", state);
  modal.classList.toggle("visible", state);

  if (state && src) {
    modalImage.src = src;
    modalImage.alt = alt;
  }

  if (state && (isTablet || !isMobile)) {
    const container = document.getElementById("project-image-container");
    if (container) {
      container.style.opacity = "0";
      container.style.visibility = "hidden";
    }
  }
}

function checkDeviceType() {
  const width = window.innerWidth;
  isMobile = width <= 768;
  isTablet = width > 768 && width <= 1180 ||
             (width === 1180 && window.innerHeight === 820) ||
             (width === 820 && window.innerHeight === 1180);

  if (isMobile || isTablet) {
    if (cursor) cursor.style.display = 'none';
    document.body.style.cursor = 'auto';
    document.querySelectorAll('a, button').forEach(el => {
      el.style.cursor = 'pointer';
    });
  } else {
    if (cursor) cursor.style.display = 'block';
    initCursorSettings();
  }
}

window.addEventListener('resize', checkDeviceType);

document.addEventListener("mousemove", (e) => {
  if (isMobile || isTablet) return;

  cursorX = e.clientX;
  cursorY = e.clientY;

  if (!rafPending && cursor) {
    rafPending = true;
    requestAnimationFrame(() => {
      cursor.style.left = `${cursorX}px`;
      cursor.style.top = `${cursorY}px`;
      rafPending = false;
    });
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") toggleModal(false);
});

if (logoLink) {
  logoLink.addEventListener("mouseenter", () => handleCursorActivate(true));
  logoLink.addEventListener("mouseleave", () => handleCursorActivate(false));
}

if (infoLink) {
  infoLink.addEventListener("mouseenter", () => handleCursorActivate(true));
  infoLink.addEventListener("mouseleave", () => handleCursorActivate(false));
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("mouseenter", () => handleCursorActivate(true));
  closeModalBtn.addEventListener("mouseleave", () => handleCursorActivate(false));

  closeModalBtn.addEventListener("click", () => {
    if (!isMobile && !isTablet && currentlyDisplayedProject) {
      const container = document.getElementById("project-image-container");
      if (container) {
        container.style.visibility = "visible";
        container.style.opacity = "1";
      }
    }
  });
}

const projects = [
  { id: 1, name: "lookbook", image: "../images/lookbook.png" },
  { id: 2, name: "rock", image: "./images/rock.jpg" },
  { id: 3, name: "fontainebleau", image: "./images/fontainebleau.jpg" },
  { id: 4, name: "bloom", image: "./images/bloom.jpg" }
];

function initializeProjects() {
  projects.forEach(project => {
    const img = new Image();
    img.src = project.image;
    imageCache[project.id] = img;

    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = project.name;
    a.className = "project-link";
    a.dataset.id = project.id;

    if (isMobile || isTablet) {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelectorAll(".project-link").forEach(link => link.classList.remove("active"));
        a.classList.add("active");
        toggleModal(true, project.image, project.name);
      });
    } else {
      a.addEventListener("mouseenter", () => {
        handleCursorActivate(true);
        document.querySelectorAll(".project-link").forEach(link => link.classList.remove("active"));
        a.classList.add("active");
        showProjectImage(project);
      });

      a.addEventListener("mouseleave", () => {
        setTimeout(() => {
          if (!document.querySelector(".project-link:hover")) {
            handleCursorActivate(false);
            hideProjectImage();
            a.classList.remove("active");
          }
        }, 50);
      });

      a.addEventListener("click", (e) => {
        e.preventDefault();
        toggleModal(true, project.image, project.name);
      });
    }

    li.appendChild(a);
    projectList.appendChild(li);
  });
}

function showProjectImage(project) {
  if (isMobile || isTablet) return;

  if (currentlyDisplayedProject && currentlyDisplayedProject.id === project.id) {
    return;
  }

  if (bioText.style.opacity !== "0") {
    bioText.style.opacity = "0";
    bioText.style.transform = "translateY(10px)";
  }

  const container = document.getElementById("project-image-container");

  if (container.firstChild && currentlyDisplayedProject && currentlyDisplayedProject.id !== project.id) {
    const currentDiv = container.firstChild;
    currentDiv.style.opacity = "0";
    currentDiv.style.transform = "translateY(10px)";

    setTimeout(() => {
      createAndShowProjectImage(container, project);
    }, 200);
  } else {
    createAndShowProjectImage(container, project);
  }

  currentlyDisplayedProject = project;
}

function createAndShowProjectImage(container, project) {
  if (isTablet) return;

  container.innerHTML = "";

  const div = document.createElement("div");
  div.className = "project-container";
  div.addEventListener("click", () => toggleModal(true, project.image, project.name));

  const img = document.createElement("img");

  if (imageCache[project.id] && imageCache[project.id].complete) {
    img.src = imageCache[project.id].src;
  } else {
    img.src = project.image;

    if (!imageCache[project.id]) {
      const cacheImg = new Image();
      cacheImg.src = project.image;
      imageCache[project.id] = cacheImg;
    }
  }

  img.alt = project.name;

  div.appendChild(img);
  container.appendChild(div);

  requestAnimationFrame(() => {
    div.style.opacity = "1";
    div.style.transform = "translateY(0)";
  });
}

function hideProjectImage() {
  if (!currentlyDisplayedProject) {
    return;
  }

  const container = document.getElementById("project-image-container");
  const projectDiv = container.firstChild;

  if (projectDiv) {
    projectDiv.style.opacity = "0";
    projectDiv.style.transform = "translateY(10px)";

    setTimeout(() => {
      if (!document.querySelector(".project-link.active")) {
        bioText.style.opacity = "1";
        bioText.style.transform = "translateY(0)";
      }

      if (!document.querySelector(".project-link.active")) {
        container.innerHTML = "";
        currentlyDisplayedProject = null;
      }
    }, 250);
  } else {
    bioText.style.opacity = "1";
    bioText.style.transform = "translateY(0)";
    currentlyDisplayedProject = null;
  }
}

function initCursorSettings() {
  if (cursor && !isMobile && !isTablet) {
    document.body.style.cursor = "none";

    document.querySelectorAll("a, button, input, textarea, select, [role='button']").forEach(el => {
      el.style.cursor = "none";
    });

    new MutationObserver(mutations => {
      for (const m of mutations) {
        if (!m.addedNodes.length) continue;

        for (const node of m.addedNodes) {
          if (node.nodeType !== 1) continue;

          if (["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT"].includes(node.tagName) ||
              node.getAttribute("role") === "button") {
            node.style.cursor = "none";
          }

          const interactiveChildren = node.querySelectorAll("a, button, input, textarea, select, [role='button']");
          for (const child of interactiveChildren) {
            child.style.cursor = "none";
          }
        }
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
}

function init() {
  checkDeviceType();
  initializeProjects();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}