let projects = [];

async function loadProjects() {
  try {
    const response = await fetch('/data/projects.json');
    if (!response.ok) throw new Error('Failed to load projects');
    projects = await response.json();
    renderProjects();
    projects.filter(p => p.type === 'image').forEach(p => {
      preloadImage(p.image);
    });
  } catch (error) {
    console.error('Error loading projects:', error);
    projects = [
      { id: 1, name: "lookbook", category: "poster", type: "image", image: "/images/lookbook.png", alt: "Lookbook poster design" },
      { id: 2, name: "rock", category: "poster", type: "image", image: "/images/rock.jpg", alt: "Rock climbing poster" },
      { id: 3, name: "fontainebleau", category: "poster", type: "image", image: "/images/fontainebleau.jpg", alt: "Fontainebleau bouldering poster" },
      { id: 4, name: "bloom", category: "poster", type: "image", image: "/images/bloom.jpg", alt: "Bloom poster design" },
      { id: 6, name: "portfolio", category: "code", type: "github", github: "moinloin/portfolio", title: "portfolio", description: "A collection of projects and experiences.", stars: "1", forks: "0", language: "HTML" },
      { id: 7, name: "deployment", category: "code", type: "github", github: "moinloin/VM-deployment", title: "VM-deployment", description: "Automated API for provisioning Proxmox VMs.", stars: "1", forks: "0", language: "Python" }
    ];
    renderProjects();
  }
}

let currentFilter = 'all';
let currentlyDisplayedProject = null;
let isMobile = window.innerWidth <= 768;
let imageTransitionTimeout = null;
let hideTimeout = null;
let preloadedImages = new Map();
let imageCache = new Map();

const cursor = document.getElementById("custom-cursor");
let cursorX = 0, cursorY = 0;

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    if (imageCache.has(src)) {
      resolve(imageCache.get(src));
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    
    img.src = src;
  });
}

function preloadAllImages() {
  const imageProjects = projects.filter(p => p.type === 'image');
  
  imageProjects.forEach((project, index) => {
    setTimeout(() => {
      preloadImage(project.image).then(img => {
        preloadedImages.set(project.id, img);
        console.log(`Preloaded: ${project.name}`);
      }).catch(err => {
        console.warn(`Failed to preload ${project.name}:`, err);
      });
    }, index * 100);
  });
}

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

function setupFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentFilter = btn.dataset.category;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      renderProjects();
    });

    btn.addEventListener('mouseenter', () => handleCursorHover(true));
    btn.addEventListener('mouseleave', () => handleCursorHover(false));
    
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}

function toggleModal(state, project = null) {
  const modal = document.getElementById('modal');
  const modalImage = document.getElementById('modal-image');
  const modalVideo = document.getElementById('modal-video');
  const modalGithub = document.getElementById('modal-github');
  const loadingSpinner = document.getElementById('loading-spinner');

  if (state && project) {
    modal.classList.add('visible');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    modalImage.style.display = 'none';
    modalVideo.style.display = 'none';
    modalGithub.style.display = 'none';
    loadingSpinner.style.display = 'block';

    if (project.type === 'image') {
      const img = new Image();
      img.onload = () => {
        loadingSpinner.style.display = 'none';
        modalImage.src = project.image;
        modalImage.alt = project.alt || project.name;
        modalImage.style.display = 'block';
      };
      img.onerror = () => {
        loadingSpinner.style.display = 'none';
        console.error('Failed to load modal image:', project.image);
      };
      img.src = project.image;
    } else if (project.type === 'video') {
      loadingSpinner.style.display = 'none';
      modalVideo.style.display = 'block';
      modalVideo.querySelector('source').src = project.video;
      modalVideo.querySelector('video').load();
    } else if (project.type === 'github') {
      setTimeout(() => {
        loadingSpinner.style.display = 'none';
        modalGithub.style.display = 'block';

        document.getElementById('github-name').textContent = project.title || project.name;
        document.getElementById('github-description').textContent = project.description || '';
        document.getElementById('github-stars').textContent = project.stars || '0';
        document.getElementById('github-forks').textContent = project.forks || '0';
        document.getElementById('github-language').textContent = project.language || '-';

        document.getElementById('github-link').href = `https://github.com/${project.github}`;
      }, 500);
    }
  } else {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
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
      a.setAttribute('aria-label', `View ${project.name} project`);

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
            hideProjectImage();
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
    }, 150);
  } else {
    setTimeout(() => {
      createAndShowProjectImage(container, project);
    }, 50);
  }

  currentlyDisplayedProject = project;
}

function createAndShowProjectImage(container, project) {
  container.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'project-container h-screen w-full flex justify-end items-center cursor-none';
  div.addEventListener('click', () => toggleModal(true, project));

  div.addEventListener('mouseleave', () => {
    if (!document.querySelector('.project-link:hover')) {
      hideTimeout = setTimeout(() => {
        hideProjectImage();
      }, 150);
    }
  });

  div.addEventListener('mouseenter', () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  });

  // Check if image is already preloaded
  const cachedImg = preloadedImages.get(project.id) || imageCache.get(project.image);
  
  if (cachedImg) {
    // Use preloaded image immediately
    const img = cachedImg.cloneNode();
    img.alt = project.alt || project.name;
    img.className = 'h-screen w-auto object-contain';
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s ease';
    
    // Show immediately since it's cached
    requestAnimationFrame(() => {
      img.style.opacity = '1';
      div.style.opacity = '1';
      div.style.transform = 'translateY(0)';
    });
    
    div.appendChild(img);
    container.appendChild(div);
  } else {
    // Show loading state first, then load image
    const img = document.createElement('img');
    img.alt = project.alt || project.name;
    img.className = 'h-screen w-auto object-contain';
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s ease';
    
    // Add loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'flex items-center justify-center h-screen w-full';
    loadingDiv.innerHTML = '<div class="loading-spinner"></div>';
    div.appendChild(loadingDiv);
    container.appendChild(div);

    img.onload = () => {
      // Cache the loaded image
      imageCache.set(project.image, img);
      preloadedImages.set(project.id, img);
      
      // Replace loading with image
      div.innerHTML = '';
      div.appendChild(img);
      
      requestAnimationFrame(() => {
        img.style.opacity = '1';
        div.style.opacity = '1';
        div.style.transform = 'translateY(0)';
      });
    };
    
    img.onerror = () => {
      console.error('Failed to load preview image:', project.image);
      div.style.display = 'none';
    };

    // Start loading
    img.src = project.image;
  }
}

function hideProjectImage() {
  const bioText = document.getElementById('bio-text');
  const container = document.getElementById('project-image-container');

  if (imageTransitionTimeout) {
    clearTimeout(imageTransitionTimeout);
  }

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  if (container.firstChild) {
    container.firstChild.style.opacity = '0';
    container.firstChild.style.transform = 'translateY(10px)';

    imageTransitionTimeout = setTimeout(() => {
      container.innerHTML = '';
      bioText.style.opacity = '1';
      bioText.style.transform = 'translateY(0)';
      currentlyDisplayedProject = null;
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
  // Add explicit click handler to ensure modal closes
  closeModalBtn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleModal(false);
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    toggleModal(false);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const projectList = document.getElementById('project-list');

  projectList.addEventListener('mouseleave', () => {
    if (!isMobile && currentlyDisplayedProject) {
      hideTimeout = setTimeout(() => {
        hideProjectImage();
      }, 100);
    }
  });

  projectList.addEventListener('mouseenter', () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  });
});

// Initialize the app
function initApp() {
  createParticles();
  setupFilterButtons();
  loadProjects();
  
  // Start aggressive preloading after a short delay
  setTimeout(() => {
    preloadAllImages();
  }, 1000);
  
  // Set up keyboard navigation for modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleModal(false);
    }
  });
}

// Start the app when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Debounced resize handler
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const debouncedResize = debounce(() => {
  isMobile = window.innerWidth <= 768;
  if (isMobile) {
    cursor.style.display = 'none';
  } else {
    cursor.style.display = 'block';
  }
}, 250);

window.addEventListener('resize', debouncedResize);