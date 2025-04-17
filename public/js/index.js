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

let cursorX = 0;
let cursorY = 0;
let rafPending = false;

function handleCursorActivate(active) {
  cursor.style.width = active ? "60px" : "40px";
  cursor.style.height = active ? "60px" : "40px";
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
}

document.addEventListener("mousemove", (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;

  if (!rafPending) {
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

logoLink.addEventListener("mouseenter", () => handleCursorActivate(true));
logoLink.addEventListener("mouseleave", () => handleCursorActivate(false));
infoLink.addEventListener("mouseenter", () => handleCursorActivate(true));
infoLink.addEventListener("mouseleave", () => handleCursorActivate(false));
closeModalBtn.addEventListener("mouseenter", () => handleCursorActivate(true));
closeModalBtn.addEventListener("mouseleave", () => handleCursorActivate(false));

const projects = [
  { id: 1, name: "lookbook", image: "../images/lookbook.png" },
  { id: 2, name: "fontainebleau", image: "./images/fontainebleau.jpg" },
  { id: 3, name: "bloom", image: "./images/bloom.jpg" }
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

    a.addEventListener("click", (e) => e.preventDefault());
    li.appendChild(a);
    projectList.appendChild(li);
  });
}

function showProjectImage(project) {
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

function init() {
  initCursorSettings();
  initializeProjects();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}