let camera, controls, scene, renderer, effect;
let rock;
let posterGroup;
let scrollOffset = 0;
const start = Date.now();

async function initAsciiBackground() {
    try {
        console.log('Loading Three.js modules...');
        
        const THREE = await import('three');
        window.THREE = THREE;
        
        const { AsciiEffect } = await import('three/addons/effects/AsciiEffect.js');
        const { TrackballControls } = await import('three/addons/controls/TrackballControls.js');
        
        console.log('Three.js modules loaded, initializing...');
        init(THREE, AsciiEffect, TrackballControls);
        
    } catch (error) {
        console.error('Failed to load Three.js modules:', error);
    }
}

function init(THREE, AsciiEffect, TrackballControls) {
    console.log('Initializing ASCII background...');
    
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.y = 50;
    camera.position.z = 300;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0, 0, 0);

    const pointLight1 = new THREE.PointLight(0xffffff, 3, 0, 0);
    pointLight1.position.set(500, 500, 500);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xffffff, 1, 0, 0);
    pointLight2.position.set(-500, -500, -500);
    scene.add(pointLight2);

    createRock(THREE);
    createPosterGallery(THREE);

    renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);

    effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true, resolution: 0.15 });
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.domElement.style.color = 'black';
    effect.domElement.style.backgroundColor = 'white';
    
    effect.domElement.style.position = 'fixed';
    effect.domElement.style.top = '0';
    effect.domElement.style.left = '0';
    effect.domElement.style.width = '100vw';
    effect.domElement.style.height = '100vh';
    effect.domElement.style.zIndex = '1';
    
    effect.domElement.id = 'ascii-effect';
    
    effect.domElement.style.pointerEvents = 'auto';

    document.body.appendChild(effect.domElement);
    console.log('ASCII effect added to DOM');

    controls = new TrackballControls(camera, effect.domElement);
    controls.enabled = false;

    updateCameraFromScroll();

    setupScrollHandling();

    window.addEventListener('resize', onWindowResize);

    animate();
    
    console.log('ASCII background initialized successfully');
}

function createRock(THREE) {
    const rockGroup = new THREE.Group();

    const mainGeometry = new THREE.SphereGeometry(100, 8, 6);
    const vertices = mainGeometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
        vertices[i] *= (0.7 + Math.random() * 0.6);
        vertices[i + 1] *= (0.8 + Math.random() * 0.4);
        vertices[i + 2] *= (0.7 + Math.random() * 0.6);
    }
    mainGeometry.attributes.position.needsUpdate = true;
    mainGeometry.computeVertexNormals();

    const rockMaterial = new THREE.MeshLambertMaterial({
        color: 0x666666,
        flatShading: true
    });

    const mainRock = new THREE.Mesh(mainGeometry, rockMaterial);
    rockGroup.add(mainRock);

    for (let i = 0; i < 5; i++) {
        const smallGeometry = new THREE.SphereGeometry(20 + Math.random() * 30, 4, 3);
        const smallVertices = smallGeometry.attributes.position.array;

        for (let j = 0; j < smallVertices.length; j += 3) {
            smallVertices[j] *= (0.5 + Math.random() * 0.8);
            smallVertices[j + 1] *= (0.6 + Math.random() * 0.8);
            smallVertices[j + 2] *= (0.5 + Math.random() * 0.8);
        }
        smallGeometry.attributes.position.needsUpdate = true;
        smallGeometry.computeVertexNormals();

        const smallRock = new THREE.Mesh(smallGeometry, rockMaterial);
        smallRock.position.set(
            (Math.random() - 0.5) * 150,
            (Math.random() - 0.5) * 100,
            (Math.random() - 0.5) * 150
        );
        rockGroup.add(smallRock);
    }

    rock = rockGroup;
    rock.position.set(0, 0, 0);
    scene.add(rock);
}

function createPosterGallery(THREE) {
    posterGroup = new THREE.Group();

    const radius = 150;
    const posterCount = 4;

    for (let i = 0; i < posterCount; i++) {
        const angle = (i / posterCount) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;

        const geometry = new THREE.PlaneGeometry(70, 105);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            transparent: true
        });

        const poster = new THREE.Mesh(geometry, material);
        poster.position.set(x, 0, z);

        const outwardDirection = new THREE.Vector3(x, 0, z).normalize();
        const lookAtPoint = new THREE.Vector3().addVectors(poster.position, outwardDirection);
        poster.lookAt(lookAtPoint);

        posterGroup.add(poster);
    }

    posterGroup.visible = true;
    scene.add(posterGroup);

    setTimeout(() => {
        loadPosterTextures();
        createHTMLPosters();
    }, 500);
}

function showPosterGallery3D() {
    if (posterGroup) {
        posterGroup.visible = true;
        loadPosterTextures();
    }
}

function hidePosterGallery3D() {
    if (posterGroup) {
        posterGroup.visible = false;
    }
}

async function loadPosterTextures() {
    if (!window.THREE || !posterGroup) return;
    
    const posterProjects = [
        { image: '/images/lookbook.png' },
        { image: '/images/rock.jpg' },
        { image: '/images/fontainebleau.jpg' },
        { image: '/images/bloom.jpg' }
    ];
    
    const textureLoader = new window.THREE.TextureLoader();
    
    posterProjects.forEach((project, index) => {
        if (posterGroup.children[index]) {
            textureLoader.load(project.image, (texture) => {
                texture.generateMipmaps = false;
                texture.minFilter = window.THREE.LinearFilter;
                texture.magFilter = window.THREE.LinearFilter;
                
                posterGroup.children[index].material.map = texture;
                posterGroup.children[index].material.transparent = false;
                posterGroup.children[index].material.needsUpdate = true;
            }, undefined, (error) => {
                console.error('Error loading texture:', project.image, error);
            });
        }
    });
}

function setupScrollHandling() {
    window.addEventListener('wheel', (event) => {
        scrollOffset += event.deltaY * 0.3;
        scrollOffset = Math.max(0, Math.min(scrollOffset, 300));

        updateCameraFromScroll();
    }, { passive: true });

    let touchStartY = 0;
    window.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (event) => {
        const touchY = event.touches[0].clientY;
        const deltaY = touchStartY - touchY;
        scrollOffset += deltaY * 0.2;
        scrollOffset = Math.max(0, Math.min(scrollOffset, 300));
        updateCameraFromScroll();
        touchStartY = touchY;
    }, { passive: true });
}

function updateCameraFromScroll() {
    if (!camera) return;

    const progress = scrollOffset / 300;
    const distance = 300;

    const startAngle = 0;
    const endAngle = Math.PI / 2;

    const currentAngle = startAngle + (endAngle - startAngle) * progress;

    const currentY = Math.sin(currentAngle) * distance;
    const currentZ = Math.cos(currentAngle) * distance;

    camera.position.set(0, currentY, currentZ);
    camera.lookAt(0, 0, 0);
}

function updateProjectHeaderVisibility(progress) {
    const header = document.querySelector('.fixed.top-8.left-8');
    if (!header) return;
    
    const startScale = 8;
    const endScale = 1;
    const startTranslateX = -50;
    const endTranslateX = 0;
    
    const adjustedProgress = Math.max(0, Math.min(1, progress * 2));
    
    const currentScale = startScale - (startScale - endScale) * adjustedProgress;
    const currentTranslateX = startTranslateX - (startTranslateX - endTranslateX) * adjustedProgress;
    const currentOpacity = Math.min(1, adjustedProgress * 3);
    
    header.style.transform = `scale(${currentScale}) translateX(${currentTranslateX}px)`;
    header.style.opacity = currentOpacity;
    
    if (progress > 0.4) {
        header.classList.add('interactive');
    } else {
        header.classList.remove('interactive');
    }
}

function onWindowResize() {
    if (!camera || !renderer || !effect) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    effect.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    if (!rock || !effect || !scene || !camera || !controls) {
        requestAnimationFrame(animate);
        return;
    }
    
    const timer = Date.now() - start;

    rock.rotation.x = timer * 0.0002;
    rock.rotation.y = timer * 0.0001;
    rock.rotation.z = timer * 0.0003;

    if (posterGroup) {
        posterGroup.rotation.y = timer * 0.0005;
    }

    effect.render(scene, camera);
    
    requestAnimationFrame(animate);
}

window.showPosterGallery3D = showPosterGallery3D;
window.hidePosterGallery3D = hidePosterGallery3D;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAsciiBackground);
} else {
    initAsciiBackground();
}