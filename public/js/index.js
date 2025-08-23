let projects = [];
let currentProject = null;
let isMobile = window.innerWidth <= 768;
let isVideoActive = false;
let isTyping = false;
let isTransitioning = false;

let timeouts = {
  typewriter: null,
  imageTransition: null,
  hide: null
};

let cache = {
  images: new Map(),
  preloaded: new Map()
};

let physics = {
  animationId: null,
  letters: [],
  aboutLetters: [],
  lastFrame: 0,
  fps: 60,
  interval: 1000 / 60
};

let cursor = {
  x: window.innerWidth / 2,
  y: window.innerHeight / 2
};

document.addEventListener('mousemove', handleMouseMove);
document.addEventListener('keydown', handleKeyDown);
window.addEventListener('resize', debounce(handleResize, 250));

document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners();
  createParticles();
  loadProjects();
  initTypewriter();
  initAboutTypewriter();
  setupExploreButton();

  setTimeout(() => storeOriginalPositions(), 100);
  setTimeout(() => showExploreButton(), 12000);
  setTimeout(() => preloadAllImages(), 1000);
});

function setupEventListeners() {
  const closeModalBtn = document.getElementById('close-modal-btn');
  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      toggleModal(false);
    });
  }

  const projectList = document.getElementById('project-list');
  if (projectList) {
    projectList.addEventListener('mouseleave', function() {
      if (!isMobile && currentProject) {
        timeouts.hide = setTimeout(() => hideProjectImage(), 100);
      }
    });

    projectList.addEventListener('mouseenter', function() {
      if (timeouts.hide) {
        clearTimeout(timeouts.hide);
        timeouts.hide = null;
      }
    });
  }
}

function handleMouseMove(e) {
  cursor.x = e.clientX;
  cursor.y = e.clientY;

  if (isMobile || isTransitioning) return;

  const moveX = (e.clientX / window.innerWidth - 0.5) * 100;
  const moveY = (e.clientY / window.innerHeight - 0.5) * 100;

  const gridBackground = document.getElementById('grid-background');
  if (gridBackground && isVideoActive) {
    gridBackground.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
  }

  const videoBackground = document.getElementById('video-background');
  if (videoBackground && isVideoActive) {
    videoBackground.style.transform = `translate(${-moveX * 0.7}px, ${-moveY * 0.7}px)`;
  }

  if (!isVideoActive) {
    handleMagneticEffect(e);
  }
}

function handleMagneticEffect(e) {
  document.querySelectorAll('.magnetic-letter').forEach(letter => {
    if (letter.closest('#info-link')) return;

    const rect = letter.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distance = Math.sqrt((e.clientX - centerX) ** 2 + (e.clientY - centerY) ** 2);

    if (distance < 50) {
      const strength = Math.max(0, 1 - (distance / 50));
      const pullX = (e.clientX - centerX) * strength * 0.4;
      const pullY = (e.clientY - centerY) * strength * 0.4;

      letter.classList.add('magnetic');
      letter.style.transform = `translate(${pullX}px, ${pullY}px)`;
    } else {
      letter.classList.remove('magnetic');
      letter.style.transform = 'translate(0px, 0px)';
    }
  });
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    toggleModal(false);
  }
}

function handleResize() {
  const wasIsMobile = isMobile;
  isMobile = window.innerWidth <= 768;

  if (wasIsMobile !== isMobile) {
    initAboutTypewriter();
  }
}

function createParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

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

async function loadProjects() {
  try {
    const response = await fetch('/data/projects.json');
    if (!response.ok) throw new Error('Failed to load projects');
    projects = await response.json();
  } catch (error) {
    console.error('Error loading projects:', error);
    projects = getFallbackProjects();
  }

  renderProjects();
  projects.filter(p => p.type === 'image').forEach(p => {
    const src = p.preview || p.image;
    preloadImage(src);
  });
}

function getFallbackProjects() {
  return [
    { id: 1, name: "lookbook", category: "poster", type: "image", image: "/images/lookbook.png", alt: "Lookbook poster design" },
    { id: 2, name: "rock", category: "poster", type: "image", image: "/images/rock.jpg", alt: "Rock climbing poster" },
    { id: 3, name: "fontainebleau", category: "poster", type: "image", image: "/images/fontainebleau.jpg", alt: "Fontainebleau bouldering poster" },
    { id: 4, name: "bloom", category: "poster", type: "image", image: "/images/bloom.jpg", alt: "Bloom poster design" },
    { id: 6, name: "portfolio", category: "code", type: "github", github: "moinloin/portfolio", title: "portfolio", description: "A collection of projects and experiences.", stars: "1", forks: "0", language: "HTML" },
    { id: 7, name: "deployment", category: "code", type: "github", github: "moinloin/VM-deployment", title: "VM-deployment", description: "Automated API for provisioning Proxmox VMs.", stars: "1", forks: "0", language: "Python" }
  ];
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    if (cache.images.has(src)) {
      resolve(cache.images.get(src));
      return;
    }

    const img = new Image();
    img.onload = () => {
      cache.images.set(src, img);
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
      const imageSrc = project.preview || project.image;
      preloadImage(imageSrc).then(img => {
        cache.preloaded.set(project.id, img);
      }).catch(() => {});
    }, index * 100);
  });
}

function renderProjects() {
  const posterList = document.getElementById('poster-list');
  const codeList = document.getElementById('code-list');
  const mainList = document.getElementById('project-list');
  
  if (posterList) posterList.innerHTML = '';
  if (codeList) codeList.innerHTML = '';
  if (mainList) mainList.innerHTML = '';

  const posterProjects = projects.filter(p => p.category === 'poster');
  const codeProjects = projects.filter(p => p.category === 'code');
  const mainProjects = projects.filter(p => p.category !== 'poster' && p.category !== 'code');

  posterProjects.forEach((project, index) => {
    const listItem = createProjectListItem(project, index, 'poster');
    if (posterList) posterList.appendChild(listItem);
  });

  codeProjects.forEach((project, index) => {
    const listItem = createProjectListItem(project, index, 'code');
    if (codeList) codeList.appendChild(listItem);
  });

  mainProjects.forEach((project, index) => {
    const listItem = createProjectListItem(project, index, 'main');
    if (mainList) mainList.appendChild(listItem);
  });
}

function createProjectListItem(project, index, category) {
  const li = document.createElement('li');
  li.style.opacity = '0';
  li.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

  const link = document.createElement('a');
  link.href = '#';
  link.className = category === 'main' ? 'project-link' : 'project-link top-project-link';
  link.setAttribute('aria-label', `View ${project.name} project`);

  project.name.split('').forEach(char => {
    const span = document.createElement('span');
    span.className = 'typewriter-char';
    span.textContent = char;
    link.appendChild(span);
  });

  attachProjectEventListeners(link, project, category);
  li.appendChild(link);

  return li;
}

function attachProjectEventListeners(link, project, category) {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    if (isVideoActive) return;
    toggleModal(true, project);
  });

  link.addEventListener('mouseenter', function() {
    if (isVideoActive || isMobile) return;

    animateProjectTypewriter(link, project.name);

    if (project.type === 'image') {
      if (timeouts.hide) {
        clearTimeout(timeouts.hide);
        timeouts.hide = null;
      }

      if (category === 'poster') {
        showPosterPreview(project);
      } else {
        showProjectImage(project);
      }
    }
  });

  link.addEventListener('mouseleave', function() {
    if (isVideoActive || isMobile || project.type !== 'image') return;

    timeouts.hide = setTimeout(() => {
      if (category === 'poster') {
        hidePosterPreview();
      } else {
        hideProjectImage();
      }
    }, 100);
  });
}

function showProjectImage(project) {
  if (currentProject?.id === project.id) return;

  const container = document.getElementById('project-image-container');
  const bioText = document.getElementById('bio-text');

  if (timeouts.imageTransition) {
    clearTimeout(timeouts.imageTransition);
  }

  bioText.style.opacity = '0';
  bioText.style.transform = 'translateY(10px)';

  if (currentProject && currentProject.id !== project.id) {
    const currentDiv = container.firstChild;
    if (currentDiv) {
      currentDiv.style.opacity = '0';
      currentDiv.style.transform = 'translateY(10px)';
    }

    timeouts.imageTransition = setTimeout(() => {
      createAndShowProjectImage(container, project);
    }, 150);
  } else {
    setTimeout(() => {
      createAndShowProjectImage(container, project);
    }, 50);
  }

  currentProject = project;
}

function createAndShowProjectImage(container, project) {
  container.innerHTML = '';

  const div = document.createElement('div');
  div.className = 'project-container h-screen w-full flex justify-end items-center';

  div.addEventListener('click', function() {
    if (isVideoActive) return;
    toggleModal(true, project);
  });

  div.addEventListener('mouseleave', function() {
    timeouts.hide = setTimeout(() => hideProjectImage(), 100);
  });

  div.addEventListener('mouseenter', function() {
    if (timeouts.hide) {
      clearTimeout(timeouts.hide);
      timeouts.hide = null;
    }
  });

  const cachedImg = cache.preloaded.get(project.id) || cache.images.get(project.image);
  
  if (cachedImg) {
    displayCachedImage(div, cachedImg, project);
  } else {
    loadAndDisplayImage(div, project);
  }

  container.appendChild(div);
}

function displayCachedImage(div, img, project) {
  const clonedImg = img.cloneNode();
  clonedImg.alt = project.alt || project.name;
  clonedImg.className = 'h-screen w-auto object-contain';
  clonedImg.style.opacity = '0';
  clonedImg.style.transition = 'opacity 0.2s ease';

  requestAnimationFrame(() => {
    clonedImg.style.opacity = '1';
    div.style.opacity = '1';
    div.style.transform = 'translateY(0)';
  });

  div.appendChild(clonedImg);
}

function loadAndDisplayImage(div, project) {
  const img = document.createElement('img');
  img.alt = project.alt || project.name;
  img.className = 'h-screen w-auto object-contain';
  img.style.opacity = '0';
  img.style.transition = 'opacity 0.2s ease';

  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'flex items-center justify-center h-screen w-full';
  const spinner = document.createElement('div');
  spinner.className = 'loading-spinner';
  loadingDiv.appendChild(spinner);
  div.appendChild(loadingDiv);

  img.onload = function() {
    cache.images.set(project.image, img);
    cache.preloaded.set(project.id, img);

    div.innerHTML = '';
    div.appendChild(img);

    requestAnimationFrame(() => {
      img.style.opacity = '1';
      div.style.opacity = '1';
      div.style.transform = 'translateY(0)';
    });
  };

  img.onerror = function() {
    div.style.display = 'none';
  };

  img.src = project.image;
}

function hideProjectImage() {
  const bioText = document.getElementById('bio-text');
  const container = document.getElementById('project-image-container');

  if (timeouts.imageTransition) {
    clearTimeout(timeouts.imageTransition);
  }

  if (timeouts.hide) {
    clearTimeout(timeouts.hide);
    timeouts.hide = null;
  }

  if (container.firstChild) {
    container.firstChild.style.opacity = '0';
    container.firstChild.style.transform = 'translateY(10px)';

    timeouts.imageTransition = setTimeout(() => {
      container.innerHTML = '';
      bioText.style.opacity = '1';
      bioText.style.transform = 'translateY(0)';
      currentProject = null;
    }, 300);
  } else {
    bioText.style.opacity = '1';
    bioText.style.transform = 'translateY(0)';
    currentProject = null;
  }
}

function showPosterPreview(project) {
  let container = document.getElementById('poster-preview-container');
  if (!container) return;

  if (timeouts.hide) {
    clearTimeout(timeouts.hide);
    timeouts.hide = null;
  }

  container.innerHTML = '';

  const previewSrc = project.preview || project.image;
  const newContainer = container.cloneNode(false);
  container.parentNode.replaceChild(newContainer, container);
  
  container = newContainer;

  newContainer.addEventListener('mouseenter', function() {
    if (timeouts.hide) {
      clearTimeout(timeouts.hide);
      timeouts.hide = null;
    }
  });
  
  newContainer.addEventListener('mouseleave', function() {
    timeouts.hide = setTimeout(() => hidePosterPreview(), 100);
  });
  
  const cachedImg = cache.preloaded.get(project.id) || cache.images.get(previewSrc);
  
  if (cachedImg) {
    displayPosterPreview(newContainer, cachedImg, project);
  } else {
    loadPosterPreview(newContainer, project, previewSrc);
  }
}

function displayPosterPreview(container, img, project) {
  const clonedImg = img.cloneNode();
  clonedImg.alt = project.alt || project.name;
  Object.assign(clonedImg.style, {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
    transition: 'opacity 0.2s ease',
    opacity: '1'
  });

  container.appendChild(clonedImg);
  container.style.opacity = '1';
}

function loadPosterPreview(container, project, src) {
  const img = document.createElement('img');
  img.alt = project.alt || project.name;
  Object.assign(img.style, {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    borderRadius: '8px',
    transition: 'opacity 0.2s ease',
    opacity: '0'
  });

  img.onload = function() {
    cache.images.set(src, img);
    cache.preloaded.set(project.id, img);
    img.style.opacity = '1';
    container.style.opacity = '1';
  };

  img.onerror = function() {};

  container.appendChild(img);
  img.src = src;
}

function hidePosterPreview() {
  const container = document.getElementById('poster-preview-container');
  if (!container) return;

  container.style.opacity = '0';
  setTimeout(() => container.innerHTML = '', 300);
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

    displayModalContent(project);
  } else {
    modal.classList.remove('visible');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function displayModalContent(project) {
  const modalImage = document.getElementById('modal-image');
  const modalVideo = document.getElementById('modal-video');
  const modalGithub = document.getElementById('modal-github');
  const loadingSpinner = document.getElementById('loading-spinner');

  switch (project.type) {
    case 'image':
      const img = new Image();
      img.onload = function() {
        loadingSpinner.style.display = 'none';
        modalImage.src = project.image;
        modalImage.alt = project.alt || project.name;
        modalImage.style.display = 'block';
      };
      img.onerror = () => loadingSpinner.style.display = 'none';
      img.src = project.image;
      break;

    case 'video':
      loadingSpinner.style.display = 'none';
      modalVideo.style.display = 'block';
      modalVideo.querySelector('source').src = project.video;
      modalVideo.querySelector('video').load();
      break;

    case 'github':
      setTimeout(() => {
        loadingSpinner.style.display = 'none';
        modalGithub.style.display = 'block';

        document.getElementById('github-name').textContent = project.title || project.name;
        document.getElementById('github-description').textContent = project.description || '';
        document.getElementById('github-language').textContent = project.language || '-';
        document.getElementById('github-link').href = `https://github.com/${project.github}`;

        setTimeout(() => initRepoTypewriter(), 100);
      }, 500);
      break;
  }
}

function setupExploreButton() {
  const button = document.querySelector('.explore-button');
  if (!button) return;

  button.style.pointerEvents = 'none';

  button.addEventListener('mouseenter', function() {
    if (button.style.pointerEvents !== 'none') {
      button.style.opacity = '0.8';
      button.style.transform = 'translateY(-1px)';
    }
  });

  button.addEventListener('mouseleave', function() {
    if (button.style.pointerEvents !== 'none') {
      button.style.opacity = '0.7';
      button.style.transform = 'translateY(0)';
    }
  });

  button.addEventListener('click', function(e) {
    handleExploreClick(e);
  });
}

function handleExploreClick(e) {
  e.preventDefault();
  e.stopPropagation();

  const button = document.querySelector('.explore-button');
  const buttonText = document.querySelector('.explore-button-text');

  button.style.animation = 'buttonMorph 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

  if (!isVideoActive) {
    activateVideoMode(buttonText);
  } else {
    deactivateVideoMode(buttonText);
  }

  setTimeout(() => button.style.animation = '', 600);
}

function activateVideoMode(buttonText) {
  stopAllTyping();

  if (window.typewriterElement) {
    window.typewriterElement.textContent = '';
  }

  hideExploreButton();
  createVideoBackground();
  animateButtonText(buttonText, '← back');

  isVideoActive = true;
  initializeLetterPhysics();
  startPhysicsAnimation();
}

function deactivateVideoMode(buttonText) {
  stopAllTyping();

  if (window.typewriterElement) {
    window.typewriterElement.textContent = '';
  }

  isTransitioning = true;
  hideExploreButton();
  hideVideoBackground();
  animateButtonText(buttonText, 'explore →');

  isVideoActive = false;

  const gridBackground = document.getElementById('grid-background');
  if (gridBackground) {
    gridBackground.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease';
    gridBackground.style.transform = 'translate(0, 0)';

    setTimeout(() => {
      gridBackground.style.transition = 'transform 0.1s ease-out';
      isTransitioning = false;
    }, 800);
  }

  stopPhysicsAnimation();
  resetLettersToOriginalPositions();

  setTimeout(() => {
    if (window.typewriterElement && window.originalText) {
      typeWriterForward(window.typewriterElement, window.originalText, null, false);
    }
  }, 300);
}

function createVideoBackground() {
  const videoBackground = document.getElementById('video-background');
  const gridBackground = document.getElementById('grid-background');
  const particles = document.getElementById('particles');

  const video = document.createElement('video');
  Object.assign(video, {
    src: '/videos/background.mp4',
    autoplay: true,
    loop: true,
    muted: true,
    playsInline: true
  });

  Object.assign(video.style, {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  });

  video.addEventListener('loadeddata', function() {
    videoBackground.style.opacity = '1';
    gridBackground.style.opacity = '0';
    particles.style.opacity = '0';
    document.body.classList.add('video-active');

    hidePosterPreview();
    hideProjectImage();

    setTimeout(() => {
      if (window.typewriterElement && window.originalText) {
        typeWriterForward(window.typewriterElement, window.originalText, null, true);
      }
      setTimeout(() => showExploreButton(), 500);
    }, 100);
  });

  videoBackground.innerHTML = '';
  videoBackground.appendChild(video);
}

function hideVideoBackground() {
  const videoBackground = document.getElementById('video-background');
  const gridBackground = document.getElementById('grid-background');
  const particles = document.getElementById('particles');
  
  videoBackground.style.transition = 'opacity 0.8s ease';
  gridBackground.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease';
  particles.style.transition = 'opacity 0.8s ease';
  
  videoBackground.style.opacity = '0';
  gridBackground.style.opacity = '1';
  particles.style.opacity = '0';
  document.body.classList.remove('video-active');

  setTimeout(() => {
    videoBackground.innerHTML = '';
    gridBackground.style.transition = 'transform 0.1s ease-out';
    particles.style.transition = 'transform 0.15s ease-out, opacity 1s';
  }, 800);
}

function initializeLetterPhysics() {
  document.querySelectorAll('.magnetic-letter').forEach(letter => {
    const originalPos = JSON.parse(letter.dataset.originalPosition);

    letter.physics = {
      originalX: originalPos.x,
      originalY: originalPos.y,
      x: originalPos.x,
      y: originalPos.y,
      vx: 0,
      vy: 0,
      angularMomentum: (Math.random() - 0.5) * 300,
      mass: 0.3 + Math.random() * 0.2,
      rotation: 0,
      scale: 1,
      opacity: 1,
      width: originalPos.width,
      height: originalPos.height
    };
    
    Object.assign(letter.style, {
      position: 'fixed',
      left: originalPos.left + 'px',
      top: originalPos.top + 'px',
      transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
      zIndex: '5000'
    });
  });

  document.querySelectorAll('#info-link .typewriter-char').forEach(letter => {
    const originalPos = JSON.parse(letter.dataset.originalPosition);
    
    letter.physics = {
      originalX: originalPos.x,
      originalY: originalPos.y,
      x: originalPos.x,
      y: originalPos.y,
      vx: 0,
      vy: 0,
      angularMomentum: (Math.random() - 0.5) * 250,
      mass: 0.2 + Math.random() * 0.2,
      rotation: 0,
      scale: 1,
      opacity: 1,
      width: originalPos.width,
      height: originalPos.height
    };

    Object.assign(letter.style, {
      position: 'fixed',
      left: originalPos.left + 'px',
      top: originalPos.top + 'px',
      transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
      zIndex: '5000'
    });
  });
}

function startPhysicsAnimation() {
  if (!physics.animationId && isVideoActive) {
    physics.letters = Array.from(document.querySelectorAll('.magnetic-letter'));
    physics.aboutLetters = Array.from(document.querySelectorAll('#info-link .typewriter-char'));
    physics.lastFrame = 0;
    animatePhysics(0);
  }
}

function stopPhysicsAnimation() {
  if (physics.animationId) {
    cancelAnimationFrame(physics.animationId);
    physics.animationId = null;
  }
}

function animatePhysics(currentTime) {
  if (!isVideoActive) {
    physics.animationId = null;
    return;
  }
  
  if (currentTime - physics.lastFrame < physics.interval) {
    physics.animationId = requestAnimationFrame((time) => animatePhysics(time));
    return;
  }
  
  physics.lastFrame = currentTime;

  physics.letters.forEach(letter => {
    updateLetterPhysics(letter, cursor.x, cursor.y);
  });

  physics.aboutLetters.forEach(letter => {
    updateLetterPhysics(letter, cursor.x, cursor.y, true);
  });

  physics.animationId = requestAnimationFrame((time) => animatePhysics(time));
}

function updateLetterPhysics(letter, cursorX, cursorY, isAboutLetter = false) {
  const range = 400;
  const mass = 5000;

  if (!letter.physics) return;

  const physics = letter.physics;
  const dx = cursorX - physics.x;
  const dy = cursorY - physics.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < range && distance > 0.1) {
    const distanceSquared = distance * distance;
    const force = (mass * physics.mass) / distanceSquared;
    const invDistance = 1 / distance;
    const normalizedDx = dx * invDistance;
    const normalizedDy = dy * invDistance;
    
    const gravAccelX = (force * normalizedDx) / physics.mass;
    const gravAccelY = (force * normalizedDy) / physics.mass;
    
    const orbitalSpeed = physics.angularMomentum * invDistance;
    const orbitalVx = -normalizedDy * orbitalSpeed * 0.08;
    const orbitalVy = normalizedDx * orbitalSpeed * 0.08;
    
    physics.vx += gravAccelX * 0.004 + orbitalVx;
    physics.vy += gravAccelY * 0.004 + orbitalVy;
    
    const maxSpeed = 12;
    const currentSpeed = Math.sqrt(physics.vx * physics.vx + physics.vy * physics.vy);
    if (currentSpeed > maxSpeed) {
      physics.vx = (physics.vx / currentSpeed) * maxSpeed;
      physics.vy = (physics.vy / currentSpeed) * maxSpeed;
    }
    
    physics.x += physics.vx;
    physics.y += physics.vy;
    
    const margin = 100;
    physics.x = Math.max(margin, Math.min(window.innerWidth - margin, physics.x));
    physics.y = Math.max(margin, Math.min(window.innerHeight - margin, physics.y));
    
    physics.scale = 1;
    physics.opacity = 1;
    
    const rotationSpeed = (range - distance) / range * (isAboutLetter ? 12 : 10);
    physics.rotation += rotationSpeed + Math.atan2(physics.vy, physics.vx) * (isAboutLetter ? 1.8 : 2);
    
    applyPhysicsStyles(letter, physics);
  } else {
    physics.vx *= 0.99;
    physics.vy *= 0.99;
    physics.x += physics.vx;
    physics.y += physics.vy;
    
    const driftForce = 0.0001;
    physics.vx += dx * driftForce;
    physics.vy += dy * driftForce;
    
    physics.scale = 1;
    physics.opacity = 1;
    physics.rotation += isAboutLetter ? 0.08 : 0.1;
    
    applyPhysicsStyles(letter, physics);
  }
}

function applyPhysicsStyles(letter, physics) {
  letter.classList.add('magnetic');

  if (!physics.width) {
    physics.width = letter.offsetWidth;
    physics.height = letter.offsetHeight;
  }

  Object.assign(letter.style, {
    left: (physics.x - physics.width / 2) + 'px',
    top: (physics.y - physics.height / 2) + 'px',
    transform: `rotate(${physics.rotation}deg) scale(${physics.scale})`,
    opacity: physics.opacity,
    display: 'inline-block',
    zIndex: Math.max(5000, 8000 - Math.floor(Math.sqrt((cursor.x - physics.x) ** 2 + (cursor.y - physics.y) ** 2)))
  });
}

function resetLettersToOriginalPositions() {
  document.querySelectorAll('.magnetic-letter, #info-link .typewriter-char').forEach((letter) => {
    if (letter.physics) {
      const originalPos = JSON.parse(letter.dataset.originalPosition);

      Object.assign(letter.physics, {
        vx: 0,
        vy: 0,
        rotation: 0,
        scale: 1,
        opacity: 1
      });

      Object.assign(letter.style, {
        transition: 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
        left: originalPos.left + 'px',
        top: originalPos.top + 'px',
        transform: 'translate3d(0, 0, 0) rotate(0deg) scale(1)',
        opacity: '1',
        zIndex: ''
      });

      setTimeout(() => {
        Object.assign(letter.style, {
          transition: '',
          position: '',
          left: '',
          top: '',
          transform: '',
          zIndex: '',
          display: ''
        });

        if (letter.dataset.originalStyle) {
          letter.setAttribute('style', letter.dataset.originalStyle);
        } else {
          letter.removeAttribute('style');
        }

        letter.physics = undefined;
        letter.classList.remove('magnetic');
      }, 1200);
    }
  });
}

function storeOriginalPositions() {
  document.querySelectorAll('.magnetic-letter, #info-link .typewriter-char').forEach(letter => {
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
      letter.dataset.originalStyle = letter.getAttribute('style') || '';
    }
  });
}

function initTypewriter() {
  const element = document.querySelector('.typewriter-text');
  if (!element) return;

  const originalText = element.textContent;
  element.textContent = '';
  element.classList.add('initialized');

  setTimeout(() => {
    typeWriterForward(element, originalText);
  }, 150);

  window.typewriterElement = element;
  window.originalText = originalText;
}

function typeWriterForward(element, text, callback, reverse = false) {
  if (timeouts.typewriter) {
    clearTimeout(timeouts.typewriter);
    timeouts.typewriter = null;
  }

  isTyping = true;
  element.textContent = '';
  element.classList.add('typing');
  element.classList.remove('finished');

  const textToType = reverse ? text.split('').reverse().join('') : text;
  let currentIndex = 0;

  const typeNextLetter = () => {
    if (!isTyping) return;

    if (currentIndex < textToType.length) {
      element.textContent += textToType[currentIndex];
      currentIndex++;

      const randomDelay = Math.random() * 150 + 50;

      if (!reverse && currentIndex >= Math.floor(textToType.length * 0.7)) {
        showExploreButton();
      }

      timeouts.typewriter = setTimeout(typeNextLetter, randomDelay);
    } else {
      element.classList.remove('typing');
      element.classList.add('finished');
      isTyping = false;
      timeouts.typewriter = null;

      if (callback) callback();
    }
  };

  typeNextLetter();
}

function stopAllTyping() {
  isTyping = false;
  if (timeouts.typewriter) {
    clearTimeout(timeouts.typewriter);
    timeouts.typewriter = null;
  }
}

function showExploreButton() {
  const button = document.querySelector('.explore-button');
  if (button) {
    button.style.opacity = '0.7';
    button.style.pointerEvents = 'auto';
  }
}

function hideExploreButton() {
  const button = document.querySelector('.explore-button');
  if (button) {
    button.style.opacity = '0';
    button.style.pointerEvents = 'none';
  }
}

function animateButtonText(textElement, newText, callback) {
  if (!textElement) return;

  setTimeout(() => {
    textElement.classList.add('slide-out');

    setTimeout(() => {
      textElement.textContent = newText;
      textElement.classList.remove('slide-out');
      textElement.classList.add('slide-in');

      setTimeout(() => {
        textElement.classList.remove('slide-in');
        if (callback) callback();
      }, 400);
    }, 200);
  }, 100);
}

function animateProjectTypewriter(element, originalText) {
  const chars = element.querySelectorAll('.typewriter-char');
  if (chars.length === 0 || element.dataset.animating === 'true') return;
  
  element.dataset.animating = 'true';
  
  const getRandomChar = () => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
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
                element.dataset.animating = 'false';
              }, 40);
            }
          }
        }, 30);
      }, index * 35);
    });
  }, 80);
}

function initAboutTypewriter() {
  const aboutLink = document.getElementById('info-link');
  if (!aboutLink || isMobile) return;

  aboutLink.addEventListener('mouseenter', () => animateAboutTypewriter(aboutLink, 'about'));
  aboutLink.addEventListener('mouseleave', () => hideAboutArrow(aboutLink));
}

function animateAboutTypewriter(element, originalText) {
  const chars = element.querySelectorAll('.typewriter-char');
  if (chars.length === 0 || element.dataset.animating === 'true') return;
  
  element.dataset.animating = 'true';
  const arrow = element.querySelector('.about-arrow');

  const getRandomChar = () => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
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
                if (arrow) arrow.style.opacity = '1';
                element.dataset.animating = 'false';
              }, 50);
            }
          }
        }, 30);
      }, index * 35);
    });
  }, 80);
}

function hideAboutArrow(element) {
  const arrow = element.querySelector('.about-arrow');
  if (arrow) {
    arrow.style.opacity = '0';
  }
}

function initRepoTypewriter() {
  const repoLink = document.getElementById('github-link');
  if (!repoLink || isMobile) return;

  repoLink.addEventListener('mouseenter', () => animateRepoTypewriter(repoLink, 'repository'));
  repoLink.addEventListener('mouseleave', () => hideRepoArrow(repoLink));
}

function animateRepoTypewriter(element, originalText) {
  const chars = element.querySelectorAll('.typewriter-char');
  if (chars.length === 0 || element.dataset.animating === 'true') return;

  element.dataset.animating = 'true';
  const arrow = element.querySelector('.repo-arrow');

  const getRandomChar = () => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
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
                if (arrow) arrow.style.opacity = '1';
                element.dataset.animating = 'false';
              }, 50);
            }
          }
        }, 30);
      }, index * 35);
    });
  }, 80);
}

function hideRepoArrow(element) {
  const arrow = element.querySelector('.repo-arrow');
  if (arrow) {
    arrow.style.opacity = '0';
  }
}

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