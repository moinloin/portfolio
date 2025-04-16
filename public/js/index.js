const cursor = document.getElementById("custom-cursor");
const projectList = document.getElementById("project-list");
const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");
const logoLink = document.getElementById("logo-link");
const infoLink = document.getElementById("info-link");
const closeModalBtn = document.getElementById("close-modal-btn");

function handleCursorActivate(active) {
  cursor.style.width = active ? "60px" : "40px";
  cursor.style.height = active ? "60px" : "40px";
}

function toggleModal(state, src = "", alt = "") {
  modal.classList.toggle("opacity-0", !state);
  modal.classList.toggle("invisible", !state);
  modal.classList.toggle("opacity-100", state);
  modal.classList.toggle("visible", state);
  modalImage.src = src;
  modalImage.alt = alt;
}

document.addEventListener("mousemove", (e) => {
  cursor.style.left = `${e.clientX}px`;
  cursor.style.top = `${e.clientY}px`;
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
  { id: 2, name: "fontainebleau", image: "./images/fontainebleau.jpg" }
];

projects.forEach(project => {
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = "#";
  a.textContent = project.name;
  a.className = "text-xl font-light transition-all duration-300 project-link";
  a.style.cursor = "none";
  a.dataset.id = project.id;

  a.addEventListener("mouseenter", () => {
    handleCursorActivate(true);
    showProjectImage(project);
    document.querySelectorAll(".project-link").forEach(link => link.classList.remove("active"));
    a.classList.add("active");
  });

  a.addEventListener("mouseleave", () => {
    handleCursorActivate(false);
    hideProjectImage();
    a.classList.remove("active");
  });

  a.addEventListener("click", (e) => e.preventDefault());
  li.appendChild(a);
  projectList.appendChild(li);
});

function showProjectImage(project) {
  document.getElementById("bio-text").style.opacity = "0";
  const container = document.getElementById("project-image-container");
  container.innerHTML = "";

  const div = document.createElement("div");
  div.className = "h-full w-full flex justify-end items-center";
  div.style.cursor = "none";
  div.addEventListener("click", () => toggleModal(true, project.image, project.name));

  const img = document.createElement("img");
  img.src = project.image;
  img.alt = project.name;
  img.className = "h-full w-auto object-contain";
  img.style.animation = "fadeIn 0.5s ease-out";

  div.appendChild(img);
  container.appendChild(div);
}

function hideProjectImage() {
  document.getElementById("bio-text").style.opacity = "1";
  document.getElementById("project-image-container").innerHTML = "";
}

document.body.style.cursor = "none";
document.querySelectorAll("a, button, input, textarea, select, [role='button']").forEach(el => {
  el.style.cursor = "none";
});

new MutationObserver(mutations => {
  mutations.forEach(m => {
    m.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        if (["A", "BUTTON", "INPUT", "TEXTAREA", "SELECT"].includes(node.tagName) || node.getAttribute("role") === "button") {
          node.style.cursor = "none";
        }
        node.querySelectorAll("a, button, input, textarea, select, [role='button']").forEach(child => {
          child.style.cursor = "none";
        });
      }
    });
  });
}).observe(document.body, { childList: true, subtree: true });