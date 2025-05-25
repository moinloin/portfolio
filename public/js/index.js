const projects = [
  { id: 1, name: "lookbook", category: "poster", type: "image", image: "/images/lookbook.png" },
  { id: 2, name: "rock", category: "poster", type: "image", image: "/images/rock.jpg" },
  { id: 3, name: "fontainebleau", category: "poster", type: "image", image: "/images/fontainebleau.jpg" },
  { id: 4, name: "bloom", category: "poster", type: "image", image: "/images/bloom.jpg" },

  { id: 6, name: "portfolio", category: "code", type: "github", github: "moinloin/portfolio" },
  { id: 7, name: "deployment", category: "code", type: "github", github: "moinloin/VM-deployment" },
];

let currentFilter = 'all';
let currentlyDisplayedProject = null;
let isMobile = window.innerWidth <= 768;
let imageTransitionTimeout = null;
let hideTimeout = null;

const cursor = document.getElementById("custom-cursor");
let cursorX = 0, cursorY = 0;

document.addEventListener("mousemove", (e) => {
  if (isMobile) return;
  cursorX = e.clientX;
  cursorY = e.clientY;
  requestAnimationFrame(() => {
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
  });
});

function handleCursorHover(hovering) {
  if (!isMobile) {
    cursor.classList.toggle('hover', hovering);
  }
}

function createParticles() {
  const container = document.getElementById('particles');
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 20 + 's';
    particle.style.animationDuration = (20 + Math.random() * 10) + 's';
    container.appendChild(particle);
  }
}

document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.category;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProjects();
  });

  btn.addEventListener('mouseenter', () => handleCursorHover(true));
  btn.addEventListener('mouseleave', () => handleCursorHover(false));
});

function toggleModal(state, project = null) {
  const modal = document.getElementById('modal');
  const modalImage = document.getElementById('modal-image');
  const modalVideo = document.getElementById('modal-video');
  const modalGithub = document.getElementById('modal-github');
  const loadingSpinner = document.getElementById('loading-spinner');

  if (state && project) {
    modal.classList.add('visible');

    modalImage.style.display = 'none';
    modalVideo.style.display = 'none';
    modalGithub.style.display = 'none';
    loadingSpinner.style.display = 'block';

    if (project.type === 'image') {
      const img = new Image();
      img.onload = () => {
        loadingSpinner.style.display = 'none';
        modalImage.src = project.image;
        modalImage.style.display = 'block';
      };
      img.src = project.image;
    } else if (project.type === 'video') {
      loadingSpinner.style.display = 'none';
      modalVideo.style.display = 'block';
      modalVideo.querySelector('source').src = project.video;
      modalVideo.querySelector('video').load();
    } else if (project.type === 'github') {
      // Real GitHub data based on repository information
      setTimeout(() => {
        loadingSpinner.style.display = 'none';
        modalGithub.style.display = 'block';

        // Set project-specific data based on real repositories
        if (project.name === 'portfolio') {
          document.getElementById('github-name').textContent = 'portfolio';
          document.getElementById('github-description').textContent = 'A collection of projects, experiences, and learnings that reflect my professional and personal growth.';
          document.getElementById('github-stars').textContent = '1';
          document.getElementById('github-forks').textContent = '0';
          document.getElementById('github-language').textContent = 'HTML';
        } else if (project.name === 'deployment') {
          document.getElementById('github-name').textContent = 'VM-deployment';
          document.getElementById('github-description').textContent = 'Fully automated API for provisioning and configuring Proxmox VMs – powered by Flask, Terraform & Ansible. Runs in Docker and handles both creation and post-configuration of virtual machines.';
          document.getElementById('github-stars').textContent = '1';
          document.getElementById('github-forks').textContent = '0';
          document.getElementById('github-language').textContent = 'Python';
        }

        document.getElementById('github-link').href = `https://github.com/${project.github}`;
      }, 500);
    }
  } else {
    modal.classList.remove('visible');
  }
}

function renderProjects() {
  const projectList = document.getElementById('project-list');
  projectList.innerHTML = '';

  const filteredProjects = currentFilter === 'all'
    ? projects
    : projects.filter(p => p.category === currentFilter);

  const categoryOrder = ['poster', 'code'];
  const groupedProjects = {};

  categoryOrder.forEach(cat => {
    groupedProjects[cat] = filteredProjects.filter(p => p.category === cat);
  });

  let projectIndex = 0;

  categoryOrder.forEach((category, categoryIndex) => {
    if (!groupedProjects[category] || groupedProjects[category].length === 0) return;

    groupedProjects[category].forEach((project, index) => {
      const li = document.createElement('li');
      li.style.opacity = '0';
      li.style.animation = `fadeIn 0.5s ease forwards ${projectIndex * 0.1}s`;

      const a = document.createElement('a');
      a.href = '#';
      a.className = 'project-link';
      a.textContent = project.name;

      if (project.category === 'code') {
        a.classList.add('glitch');
      }

      a.addEventListener('click', (e) => {
        e.preventDefault();
        toggleModal(true, project);
      });

      a.addEventListener('mouseenter', () => {
        handleCursorHover(true);
        if (!isMobile && project.type === 'image') {
          if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
          }
          showProjectImage(project);
        }
      });

      a.addEventListener('mouseleave', () => {
        handleCursorHover(false);
        if (!isMobile && project.type === 'image') {
          hideTimeout = setTimeout(() => {
            if (!document.querySelector('.project-link:hover')) {
              hideProjectImage();
            }
          }, 100);
        }
      });

      li.appendChild(a);
      projectList.appendChild(li);
      projectIndex++;
    });

    const remainingCategories = categoryOrder.slice(categoryIndex + 1).filter(cat =>
      groupedProjects[cat] && groupedProjects[cat].length > 0
    );

    if (remainingCategories.length > 0 && currentFilter === 'all') {
      const separator = document.createElement('li');
      separator.className = 'separator';
      separator.style.opacity = '0';
      separator.style.animation = `fadeIn 0.5s ease forwards ${projectIndex * 0.1}s`;

      separator.innerHTML = '<div class="separator-line"></div>';

      projectList.appendChild(separator);
      projectIndex++;
    }
  });
}

function showProjectImage(project) {
  if (currentlyDisplayedProject?.id === project.id) return;

  const bioText = document.getElementById('bio-text');
  const container = document.getElementById('project-image-container');

  if (imageTransitionTimeout) {
    clearTimeout(imageTransitionTimeout);
  }

  bioText.style.opacity = '0';
  bioText.style.transform = 'translateY(10px)';

  if (currentlyDisplayedProject && currentlyDisplayedProject.id !== project.id) {
    const currentDiv = container.firstChild;
    if (currentDiv) {
      currentDiv.style.opacity = '0';
      currentDiv.style.transform = 'translateY(10px)';
    }

    imageTransitionTimeout = setTimeout(() => {
      createAndShowProjectImage(container, project);
    }, 200);
  } else {
    createAndShowProjectImage(container, project);
  }

  currentlyDisplayedProject = project;
}

function createAndShowProjectImage(container, project) {
  container.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'project-container h-screen w-full flex justify-end items-center cursor-none';
  div.addEventListener('click', () => toggleModal(true, project));

  const img = document.createElement('img');
  img.src = project.image;
  img.alt = project.name;
  img.className = 'h-screen w-auto object-contain';

  div.appendChild(img);
  container.appendChild(div);

  requestAnimationFrame(() => {
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
  });
}

function hideProjectImage() {
  const bioText = document.getElementById('bio-text');
  const container = document.getElementById('project-image-container');

  if (imageTransitionTimeout) {
    clearTimeout(imageTransitionTimeout);
  }

  if (container.firstChild) {
    container.firstChild.style.opacity = '0';
    container.firstChild.style.transform = 'translateY(10px)';

    imageTransitionTimeout = setTimeout(() => {
      if (!document.querySelector('.project-link:hover')) {
        container.innerHTML = '';
        bioText.style.opacity = '1';
        bioText.style.transform = 'translateY(0)';
        currentlyDisplayedProject = null;
      }
    }, 300);
  } else {
    bioText.style.opacity = '1';
    bioText.style.transform = 'translateY(0)';
    currentlyDisplayedProject = null;
  }
}

document.querySelectorAll('.header-link').forEach(link => {
  link.addEventListener('mouseenter', () => handleCursorHover(true));
  link.addEventListener('mouseleave', () => handleCursorHover(false));
});

const closeModalBtn = document.getElementById('close-modal-btn');
if (closeModalBtn) {
  closeModalBtn.addEventListener('mouseenter', () => handleCursorHover(true));
  closeModalBtn.addEventListener('mouseleave', () => handleCursorHover(false));
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleModal(false);
  }
});

createParticles();
renderProjects();

window.addEventListener('resize', () => {
  isMobile = window.innerWidth <= 768;
  if (isMobile) {
    cursor.style.display = 'none';
  } else {
    cursor.style.display = 'block';
  }
});