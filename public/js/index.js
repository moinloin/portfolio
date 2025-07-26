let projects = [];

function sanitizeText(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

async function loadProjects() {
  try {
    const response = await fetch('/data/projects.json');
    if (!response.ok) throw new Error('Failed to load projects');
    projects = await response.json();
    renderProjects();
    projects.filter(p => p.type === 'image').forEach(p => {
      if (p.preview) {
        preloadImage(p.preview);
      } else {
        preloadImage(p.image);
      }
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

let currentlyDisplayedProject = null;
let isMobile = window.innerWidth <= 768;
let imageTransitionTimeout = null;
let hideTimeout = null;
let preloadedImages = new Map();
let imageCache = new Map();


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
      const imageSrc = project.preview || project.image;
      preloadImage(imageSrc).then(img => {
        preloadedImages.set(project.id, img);
        console.log(`Preloaded: ${project.name}`);
      }).catch(err => {
        console.warn(`Failed to preload ${project.name}:`, err);
      });
    }, index * 100);
  });
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
  const posterList = document.getElementById('poster-list');
  const codeList = document.getElementById('code-list');
  
  if (projectList) projectList.innerHTML = '';
  if (posterList) posterList.innerHTML = '';
  if (codeList) codeList.innerHTML = '';

  const posterProjects = projects.filter(p => p.category === 'poster');
  const codeProjects = projects.filter(p => p.category === 'code');

  posterProjects.forEach((project, index) => {
    const li = document.createElement('li');
    li.style.opacity = '0';
    li.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

    const a = document.createElement('a');
    a.href = '#';
    a.className = 'project-link top-project-link';
    a.setAttribute('aria-label', `View ${project.name} project`);
    
    project.name.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'typewriter-char';
      span.textContent = char;
      a.appendChild(span);
    });

    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (isVideoActive) return;
      
      toggleModal(true, project);
    });

    a.addEventListener('mouseenter', () => {
      if (isVideoActive) return;
      
      animateProjectTypewriter(a, project.name);
      if (!isMobile && project.type === 'image') {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
        showPosterPreview(project);
      }
    });

    a.addEventListener('mouseleave', (e) => {
      if (isVideoActive) return;
      
      if (!isMobile && project.type === 'image') {
        hideTimeout = setTimeout(() => {
          hidePosterPreview();
        }, 100);
      }
    });

    li.appendChild(a);
    if (posterList) posterList.appendChild(li);
  });

  codeProjects.forEach((project, index) => {
    const li = document.createElement('li');
    li.style.opacity = '0';
    li.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

    const a = document.createElement('a');
    a.href = '#';
    a.className = 'project-link top-project-link';
    a.setAttribute('aria-label', `View ${project.name} project`);
    
    project.name.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'typewriter-char';
      span.textContent = char;
      a.appendChild(span);
    });

    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (isVideoActive) return;
      
      toggleModal(true, project);
    });

    a.addEventListener('mouseenter', () => {
      if (isVideoActive) return;
      
      animateProjectTypewriter(a, project.name);
    });

    a.addEventListener('mouseleave', () => {
    });

    li.appendChild(a);
    if (codeList) codeList.appendChild(li);
  });

  const remainingProjects = projects.filter(p => p.category !== 'poster' && p.category !== 'code');
  remainingProjects.forEach((project, index) => {
    const li = document.createElement('li');
    li.style.opacity = '0';
    li.style.animation = `fadeIn 0.5s ease forwards ${index * 0.1}s`;

    const a = document.createElement('a');
    a.href = '#';
    a.className = 'project-link';
    a.setAttribute('aria-label', `View ${project.name} project`);
    
    project.name.split('').forEach(char => {
      const span = document.createElement('span');
      span.className = 'typewriter-char';
      span.textContent = char;
      a.appendChild(span);
    });

    a.addEventListener('click', (e) => {
      e.preventDefault();
      if (isVideoActive) return;
      
      toggleModal(true, project);
    });

    a.addEventListener('mouseenter', () => {
      if (isVideoActive) return;
      
      animateProjectTypewriter(a, project.name);
      if (!isMobile && project.type === 'image') {
        if (hideTimeout) {
          clearTimeout(hideTimeout);
          hideTimeout = null;
        }
        showProjectImage(project);
      }
    });

    a.addEventListener('mouseleave', () => {
      if (isVideoActive) return;
      
      if (!isMobile && project.type === 'image') {
        hideTimeout = setTimeout(() => {
          hideProjectImage();
        }, 100);
      }
    });

    li.appendChild(a);
    if (projectList) projectList.appendChild(li);
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
  div.className = 'project-container h-screen w-full flex justify-end items-center';
  div.addEventListener('click', () => {
    if (isVideoActive) return;
    
    toggleModal(true, project);
  });

  div.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
      hideProjectImage();
    }, 100);
  });

  div.addEventListener('mouseenter', () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  });

  const cachedImg = preloadedImages.get(project.id) || imageCache.get(project.image);
  
  if (cachedImg) {
    const img = cachedImg.cloneNode();
    img.alt = project.alt || project.name;
    img.className = 'h-screen w-auto object-contain';
    img.style.opacity = '0';
    img.style.transition = 'opacity 0.2s ease';
    
    requestAnimationFrame(() => {
      img.style.opacity = '1';
      div.style.opacity = '1';
      div.style.transform = 'translateY(0)';
    });
    
    div.appendChild(img);
    container.appendChild(div);
  } else {
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
    container.appendChild(div);

    img.onload = () => {
      imageCache.set(project.image, img);
      preloadedImages.set(project.id, img);
      
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

function showPosterPreview(project) {
  const container = document.getElementById('poster-preview-container');
  if (!container) return;

  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }

  container.innerHTML = '';

  const previewSrc = project.preview || project.image;
  
  const newContainer = container.cloneNode(false);
  container.parentNode.replaceChild(newContainer, container);
  
  newContainer.addEventListener('mouseenter', () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  });
  
  newContainer.addEventListener('mouseleave', () => {
    hideTimeout = setTimeout(() => {
      hidePosterPreview();
    }, 100);
  });
  
  const cachedImg = preloadedImages.get(project.id) || imageCache.get(previewSrc);
  
  if (cachedImg) {
    const img = cachedImg.cloneNode();
    img.alt = project.alt || project.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.transition = 'opacity 0.2s ease';
    img.style.opacity = '1';
    
    newContainer.appendChild(img);
    newContainer.style.opacity = '1';
  } else {
    const img = document.createElement('img');
    img.alt = project.alt || project.name;
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.transition = 'opacity 0.2s ease';
    img.style.opacity = '0';
    
    img.onload = () => {
      imageCache.set(previewSrc, img);
      preloadedImages.set(project.id, img);
      
      img.style.opacity = '1';
      newContainer.style.opacity = '1';
    };
    
    img.onerror = () => {
      console.error('Failed to load poster preview:', previewSrc);
    };

    newContainer.appendChild(img);
    img.src = previewSrc;
  }
}

function hidePosterPreview() {
  const container = document.getElementById('poster-preview-container');
  if (!container) return;

  container.style.opacity = '0';
  
  setTimeout(() => {
    container.innerHTML = '';
  }, 300);
}

let currentCursorX = window.innerWidth / 2;
let currentCursorY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
  if (isMobile) return;

  currentCursorX = e.clientX;
  currentCursorY = e.clientY;

  const moveX = (e.clientX / window.innerWidth - 0.5) * 100;
  const moveY = (e.clientY / window.innerHeight - 0.5) * 100;
  
  const gridBackground = document.getElementById('grid-background');
  const videoBackground = document.getElementById('video-background');
  
  if (gridBackground) {
    gridBackground.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
  }
  
  if (videoBackground && isVideoActive) {
    videoBackground.style.transform = `translate(${-moveX * 0.7}px, ${-moveY * 0.7}px)`;
  }
});

let blackHoleAnimationId = null;

function animateBlackHolePhysics() {
  if (!isVideoActive) {
    blackHoleAnimationId = null;
    return;
  }

  document.querySelectorAll('.magnetic-letter').forEach(letter => {
    updateLetterBlackHolePhysics(letter, currentCursorX, currentCursorY);
  });

  document.querySelectorAll('#info-link .typewriter-char').forEach(letter => {
    updateAboutLetterBlackHolePhysics(letter, currentCursorX, currentCursorY);
  });

  blackHoleAnimationId = requestAnimationFrame(animateBlackHolePhysics);
}

function startBlackHoleAnimation() {
  if (!blackHoleAnimationId && isVideoActive) {
    animateBlackHolePhysics();
  }
}

function stopBlackHoleAnimation() {
  if (blackHoleAnimationId) {
    cancelAnimationFrame(blackHoleAnimationId);
    blackHoleAnimationId = null;
  }
}

function updateLetterBlackHolePhysics(letter, cursorX, cursorY) {
  const eventHorizonRadius = 60;
  const gravitationalRange = 800;
  const blackHoleMass = 1000;
  
  if (!letter.physics) {
    const rect = letter.getBoundingClientRect();
    letter.physics = {
      originalX: rect.left + rect.width / 2,
      originalY: rect.top + rect.height / 2,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: 0,
      vy: 0,
      angularMomentum: (Math.random() - 0.5) * 200,
      mass: 0.5 + Math.random() * 0.3,
      rotation: 0,
      scale: 1,
      opacity: 1,
      consumed: false,
      enteredEventHorizon: false
    };
  }
  
  const physics = letter.physics;
  
  if (physics.consumed) {
    letter.style.display = 'none';
    return;
  }
  
  const dx = cursorX - physics.x;
  const dy = cursorY - physics.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < gravitationalRange && distance > 1) {
    const gravitationalForce = (blackHoleMass * physics.mass) / (distance * distance);
    
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    const gravAccelX = (gravitationalForce * normalizedDx) / physics.mass;
    const gravAccelY = (gravitationalForce * normalizedDy) / physics.mass;
    
    const orbitalSpeed = physics.angularMomentum / distance;
    const orbitalVx = -normalizedDy * orbitalSpeed * 0.01;
    const orbitalVy = normalizedDx * orbitalSpeed * 0.01;
    
    physics.vx += gravAccelX * 0.0002 + orbitalVx;
    physics.vy += gravAccelY * 0.0002 + orbitalVy;
    
    const maxSpeed = 3;
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
    
    if (distance < eventHorizonRadius) {
      if (!physics.enteredEventHorizon) {
        physics.enteredEventHorizon = true;
      }
      
      const horizonProgress = 1 - (distance / eventHorizonRadius);
      physics.scale = 1 + horizonProgress * 2;
      physics.opacity = 1 - horizonProgress * 0.7;
      
      if (distance < 15) {
        physics.consumed = true;
        letter.style.display = 'none';
        return;
      }
    } else {
      const distanceEffect = Math.max(0, 1 - (distance / gravitationalRange));
      physics.scale = 1 + distanceEffect * 0.2;
      physics.opacity = 1;
    }
    
    const rotationSpeed = (gravitationalRange - distance) / gravitationalRange * 10;
    physics.rotation += rotationSpeed + Math.atan2(physics.vy, physics.vx) * 2;
    
    const timeDilation = distance < eventHorizonRadius * 2 ? 
      Math.max(0.3, distance / (eventHorizonRadius * 2)) : 1;
    
    letter.classList.add('magnetic');
    letter.style.left = physics.x + 'px';
    letter.style.top = physics.y + 'px';
    letter.style.transform = `translate(-50%, -50%) rotate(${physics.rotation}deg) scale(${physics.scale})`;
    letter.style.opacity = physics.opacity;
    letter.style.zIndex = 1000 + Math.floor((gravitationalRange - distance) / 10);
    
    physics.vx *= timeDilation;
    physics.vy *= timeDilation;
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
    physics.rotation += 0.1;
    
    letter.style.left = physics.x + 'px';
    letter.style.top = physics.y + 'px';
    letter.style.transform = `translate(-50%, -50%) rotate(${physics.rotation}deg) scale(${physics.scale})`;
    letter.style.opacity = physics.opacity;
  }
}

function updateAboutLetterBlackHolePhysics(letter, cursorX, cursorY) {
  const eventHorizonRadius = 60;
  const gravitationalRange = 800;
  const blackHoleMass = 1000;
  
  if (!letter.physics) {
    const rect = letter.getBoundingClientRect();
    letter.physics = {
      originalX: rect.left + rect.width / 2,
      originalY: rect.top + rect.height / 2,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: 0,
      vy: 0,
      angularMomentum: (Math.random() - 0.5) * 150,
      mass: 0.4 + Math.random() * 0.3,
      rotation: 0,
      scale: 1,
      opacity: 1,
      consumed: false,
      enteredEventHorizon: false
    };
  }
  
  const physics = letter.physics;
  
  if (physics.consumed) {
    letter.style.display = 'none';
    return;
  }
  
  const dx = cursorX - physics.x;
  const dy = cursorY - physics.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance < gravitationalRange && distance > 1) {
    const gravitationalForce = (blackHoleMass * physics.mass) / (distance * distance);
    const normalizedDx = dx / distance;
    const normalizedDy = dy / distance;
    
    const gravAccelX = (gravitationalForce * normalizedDx) / physics.mass;
    const gravAccelY = (gravitationalForce * normalizedDy) / physics.mass;
    
    const orbitalSpeed = physics.angularMomentum / distance;
    const orbitalVx = -normalizedDy * orbitalSpeed * 0.01;
    const orbitalVy = normalizedDx * orbitalSpeed * 0.01;
    
    physics.vx += gravAccelX * 0.0002 + orbitalVx;
    physics.vy += gravAccelY * 0.0002 + orbitalVy;
    
    const maxSpeed = 3;
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
    
    if (distance < eventHorizonRadius) {
      if (!physics.enteredEventHorizon) {
        physics.enteredEventHorizon = true;
      }
      
      const horizonProgress = 1 - (distance / eventHorizonRadius);
      physics.scale = 1 + horizonProgress * 2.5;
      physics.opacity = 1 - horizonProgress * 0.8;
      
      if (distance < 15) {
        physics.consumed = true;
        letter.style.display = 'none';
        return;
      }
    } else {
      const distanceEffect = Math.max(0, 1 - (distance / gravitationalRange));
      physics.scale = 1 + distanceEffect * 0.15;
      physics.opacity = 1;
    }
    
    const rotationSpeed = (gravitationalRange - distance) / gravitationalRange * 12;
    physics.rotation += rotationSpeed + Math.atan2(physics.vy, physics.vx) * 1.8;
    
    const timeDilation = distance < eventHorizonRadius * 2 ? 
      Math.max(0.3, distance / (eventHorizonRadius * 2)) : 1;
    
    letter.style.left = physics.x + 'px';
    letter.style.top = physics.y + 'px';
    letter.style.transform = `translate(-50%, -50%) rotate(${physics.rotation}deg) scale(${physics.scale})`;
    letter.style.opacity = physics.opacity;
    letter.style.zIndex = 1000 + Math.floor((gravitationalRange - distance) / 10);
    
    physics.vx *= timeDilation;
    physics.vy *= timeDilation;
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
    physics.rotation += 0.08;
    
    letter.style.left = physics.x + 'px';
    letter.style.top = physics.y + 'px';
    letter.style.transform = `translate(-50%, -50%) rotate(${physics.rotation}deg) scale(${physics.scale})`;
    letter.style.opacity = physics.opacity;
  }
}

document.addEventListener('mousemove', (e) => {
  if (isMobile) return;

  if (!isVideoActive) {
    document.querySelectorAll('.magnetic-letter').forEach(letter => {
      if (letter.closest('#info-link')) return;

      const rect = letter.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

      if (distance < 50) {
        const pullStrength = Math.max(0, 1 - (distance / 50));
        const pullX = (e.clientX - centerX) * pullStrength * 0.4;
        const pullY = (e.clientY - centerY) * pullStrength * 0.4;

        letter.classList.add('magnetic');
        letter.style.transform = `translate(${pullX}px, ${pullY}px)`;
      } else {
        letter.classList.remove('magnetic');
        letter.style.transform = 'translate(0px, 0px)';
      }
    });
  }
});


let isVideoActive = false;
let isTyping = false;
let currentTypewriterTimeout = null;

function setupExploreButton() {
  const centerBtn = document.querySelector('.explore-button');

  if (!centerBtn) return;

  centerBtn.style.pointerEvents = 'none';

  centerBtn.addEventListener('mouseenter', () => {
    if (centerBtn.style.pointerEvents !== 'none') {
      centerBtn.style.opacity = '0.8';
      centerBtn.style.transform = 'translateY(-1px)';
    }
  });

  centerBtn.addEventListener('mouseleave', () => {
    if (centerBtn.style.pointerEvents !== 'none') {
      centerBtn.style.opacity = '0.7';
      centerBtn.style.transform = 'translateY(0)';
    }
  });

  centerBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    const videoBackground = document.getElementById('video-background');
    const gridBackground = document.getElementById('grid-background');
    const particles = document.getElementById('particles');
    const buttonText = centerBtn.querySelector('.explore-button-text');

    centerBtn.style.animation = 'buttonMorph 0.6s cubic-bezier(0.4, 0, 0.2, 1)';

    if (!isVideoActive) {
      stopAllTyping();

      if (window.typewriterElement) {
        window.typewriterElement.textContent = '';
      }

      hideExploreButton();

      const video = document.createElement('video');
      video.src = '/videos/background.mp4';
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = '100%';
      video.style.height = '100%';
      video.style.objectFit = 'cover';

      video.addEventListener('loadeddata', () => {
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
          setTimeout(() => {
            showExploreButton();
          }, 500);
        }, 100);
      });

      videoBackground.innerHTML = '';
      videoBackground.appendChild(video);

      isVideoActive = true;
      
      initializeLetterPhysics();
      
      startBlackHoleAnimation();

      animateButtonText(buttonText, '← back');

    } else {
      stopAllTyping();

      if (window.typewriterElement) {
        window.typewriterElement.textContent = '';
      }

      hideExploreButton();

      videoBackground.style.opacity = '0';
      gridBackground.style.opacity = '1';
      particles.style.opacity = '0';
      document.body.classList.remove('video-active');

      stopBlackHoleAnimation();
      
      resetLettersToOriginalPositions();

      setTimeout(() => {
        if (window.typewriterElement && window.originalText) {
          typeWriterForward(window.typewriterElement, window.originalText, null, false);
        }
      }, 300);

      isVideoActive = false;

      animateButtonText(buttonText, 'explore →');
    }

    setTimeout(() => {
      centerBtn.style.animation = '';
    }, 600);
  });
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

function stopAllTyping() {
  isTyping = false;
  if (currentTypewriterTimeout) {
    clearTimeout(currentTypewriterTimeout);
    currentTypewriterTimeout = null;
  }
}

const closeModalBtn = document.getElementById('close-modal-btn');
if (closeModalBtn) {
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
  
  if (projectList) {
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
  }
});

function typeWriterForward(element, text, callback, reverse = false) {
  if (currentTypewriterTimeout) {
    clearTimeout(currentTypewriterTimeout);
    currentTypewriterTimeout = null;
  }

  isTyping = true;
  element.textContent = '';
  element.classList.add('typing');
  element.classList.remove('finished');

  const textToType = reverse ? text.split('').reverse().join('') : text;
  let currentIndex = 0;

  function typeNextLetter() {
    if (!isTyping) return;

    if (currentIndex < textToType.length) {
      element.textContent += textToType[currentIndex];
      currentIndex++;

      const randomDelay = Math.random() * 150 + 50;

      if (!reverse && currentIndex >= Math.floor(textToType.length * 0.7)) {
        showExploreButton();
      }

      currentTypewriterTimeout = setTimeout(typeNextLetter, randomDelay);
    } else {
        element.classList.remove('typing');
      element.classList.add('finished');
      isTyping = false;
      currentTypewriterTimeout = null;

      if (callback) callback();
    }
  }

  typeNextLetter();
}

function typeWriterBackward(element, callback) {
  element.classList.add('typing');
  element.classList.remove('finished');

  const text = element.textContent;
  let currentLength = text.length;

  function removeNextLetter() {
    if (currentLength > 0) {
      element.textContent = text.substring(0, currentLength - 1);
      currentLength--;

      const randomDelay = Math.random() * 70 + 30;

      setTimeout(removeNextLetter, randomDelay);
    } else {
      element.classList.remove('typing');
      if (callback) callback();
    }
  }

  removeNextLetter();
}

function initTypewriter() {
  const typewriterElement = document.querySelector('.typewriter-text');
  if (!typewriterElement) return;

  const originalText = typewriterElement.textContent;

  typewriterElement.textContent = '';
  typewriterElement.classList.add('initialized');

  setTimeout(() => {
    typeWriterForward(typewriterElement, originalText);
  }, 150);

  window.typewriterElement = typewriterElement;
  window.originalText = originalText;
}

function showExploreButton() {
  const exploreBtn = document.querySelector('.explore-button');
  if (exploreBtn) {
    exploreBtn.style.opacity = '0.7';
    exploreBtn.style.pointerEvents = 'auto';
  }
}

function hideExploreButton() {
  const exploreBtn = document.querySelector('.explore-button');
  if (exploreBtn) {
    exploreBtn.style.opacity = '0';
    exploreBtn.style.pointerEvents = 'none';
  }
}

function triggerTypewriterReverse(callback) {
  if (window.typewriterElement) {
    typeWriterBackward(window.typewriterElement, callback);
  }
}

function initializeLetterPhysics() {
  document.querySelectorAll('.magnetic-letter').forEach(letter => {
    const rect = letter.getBoundingClientRect();
    letter.physics = {
      originalX: rect.left + rect.width / 2,
      originalY: rect.top + rect.height / 2,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: 0,
      vy: 0,
      angularMomentum: (Math.random() - 0.5) * 200,
      mass: 0.5 + Math.random() * 0.3,
      rotation: 0,
      scale: 1,
      opacity: 1,
      consumed: false,
      enteredEventHorizon: false
    };
  });

  document.querySelectorAll('#info-link .typewriter-char').forEach(letter => {
    const rect = letter.getBoundingClientRect();
    letter.physics = {
      originalX: rect.left + rect.width / 2,
      originalY: rect.top + rect.height / 2,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      vx: 0,
      vy: 0,
      angularMomentum: (Math.random() - 0.5) * 150,
      mass: 0.4 + Math.random() * 0.3,
      rotation: 0,
      scale: 1,
      opacity: 1,
      consumed: false,
      enteredEventHorizon: false
    };
  });
}

function resetLettersToOriginalPositions() {
  document.querySelectorAll('.magnetic-letter').forEach((letter, index) => {
    if (letter.physics) {
      letter.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      
      letter.style.position = 'static';
      letter.style.left = '';
      letter.style.top = '';
      letter.style.transform = '';
      letter.style.opacity = '1';
      letter.style.zIndex = '';
      
      setTimeout(() => {
        letter.physics = undefined;
        letter.style.transition = '';
        letter.style.position = '';
        letter.style.display = '';
        letter.classList.remove('magnetic');
      }, 800);
    }
  });

  document.querySelectorAll('#info-link .typewriter-char').forEach((letter, index) => {
    if (letter.physics) {
      letter.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
      
      letter.style.position = 'static';
      letter.style.left = '';
      letter.style.top = '';
      letter.style.transform = '';
      letter.style.opacity = '1';
      letter.style.zIndex = '';
      
      setTimeout(() => {
        letter.physics = undefined;
        letter.style.transition = '';
        letter.style.position = '';
        letter.style.display = '';
      }, 800);
    }
  });
}


function initApp() {
  createParticles();
  loadProjects();
  initTypewriter();
  setupExploreButton();

  setTimeout(() => {
    showExploreButton();
  }, 12000);
  
  setTimeout(() => {
    preloadAllImages();
  }, 1000);
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      toggleModal(false);
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
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

const debouncedResize = debounce(() => {
  isMobile = window.innerWidth <= 768;
}, 250);

window.addEventListener('resize', debouncedResize);

function animateProjectTypewriter(element, originalText) {
  const chars = element.querySelectorAll('.typewriter-char');
  if (chars.length === 0) return;
  
  let isAnimating = element.dataset.animating === 'true';
  if (isAnimating) return;
  
  element.dataset.animating = 'true';
  
  function getRandomChar() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  
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

function animateAboutTypewriter(element, originalText) {
  const chars = element.querySelectorAll('.typewriter-char');
  if (chars.length === 0) return;
  
  let isAnimating = element.dataset.animating === 'true';
  if (isAnimating) return;
  
  element.dataset.animating = 'true';
  let arrowElement = element.querySelector('.arrow');
  
  function getRandomChar() {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  
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
                  arrowElement = document.createElement('span');
                  arrowElement.textContent = ' →';
                  arrowElement.className = 'typewriter-char arrow';
                  element.appendChild(arrowElement);
                  
                  setTimeout(() => {
                    arrowElement.classList.add('show');
                  }, 10);
                }
                element.dataset.animating = 'false';
              }, 40);
            }
          }
        }, 30);
      }, index * 35);
    });
  }, 80);
}

function removeArrow(element) {
  const arrowElement = element.querySelector('.arrow');
  if (arrowElement) {
    arrowElement.classList.remove('show');
    setTimeout(() => {
      if (arrowElement && arrowElement.parentNode) {
        arrowElement.remove();
      }
    }, 300);
  }
}

function initAboutTypewriter() {
  const aboutLink = document.getElementById('info-link');
  if (!aboutLink) return;
  
  aboutLink.addEventListener('mouseenter', () => animateAboutTypewriter(aboutLink, 'about'));
  aboutLink.addEventListener('mouseleave', () => removeArrow(aboutLink));
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAboutTypewriter);
} else {
  initAboutTypewriter();
}