let camera, controls, scene, renderer, effect;
let rock;
let posterGroup;
let highlightedPosterData = null;
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
    camera.position.set(0, 300, 50);
    camera.lookAt(0, 0, 0);

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

    effect = new AsciiEffect(renderer, ' .:-+*=%@#', { invert: true });
    effect.setSize(window.innerWidth, window.innerHeight);
    effect.domElement.style.color = 'black';
    effect.domElement.style.backgroundColor = 'transparent';
    
    effect.domElement.style.position = 'fixed';
    effect.domElement.style.top = '0';
    effect.domElement.style.left = '0';
    effect.domElement.style.width = '100vw';
    effect.domElement.style.height = '100vh';
    effect.domElement.style.zIndex = '1';
    
    effect.domElement.id = 'ascii-effect';
    
    effect.domElement.style.pointerEvents = 'auto';

    // Add white background layer below everything
    const bgLayer = document.createElement('div');
    bgLayer.style.position = 'fixed';
    bgLayer.style.top = '0';
    bgLayer.style.left = '0';
    bgLayer.style.width = '100vw';
    bgLayer.style.height = '100vh';
    bgLayer.style.backgroundColor = 'white';
    bgLayer.style.zIndex = '-1';
    document.body.appendChild(bgLayer);

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

    // Calculate bounding box to center the rock properly
    const box = new THREE.Box3().setFromObject(rockGroup);
    const center = box.getCenter(new THREE.Vector3());

    // Offset all children by the negative of the center to truly center the group
    rockGroup.children.forEach(child => {
        child.position.sub(center);
    });

    rock = rockGroup;
    rock.position.set(0, 0, 0);
    scene.add(rock);
}

function createPosterGallery(THREE) {
    posterGroup = new THREE.Group();

    const radius = 150;
    const posterCount = 4;
    const posterNames = ['lookbook', 'rock', 'fontainebleau', 'bloom'];

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
        poster.userData.name = posterNames[i];
        poster.userData.index = i;

        const outwardDirection = new THREE.Vector3(x, 0, z).normalize();
        const lookAtPoint = new THREE.Vector3().addVectors(poster.position, outwardDirection);
        poster.lookAt(lookAtPoint);

        posterGroup.add(poster);
    }

    posterGroup.visible = true;
    scene.add(posterGroup);

    setTimeout(() => {
        loadPosterTextures();
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

function highlightPoster(posterName) {
    if (!posterGroup) return;

    unhighlightPoster();

    const poster = posterGroup.children.find(p => p.userData.name === posterName);
    if (!poster) return;

    poster.visible = false;
    highlightedPosterData = { poster, posterName };

    // Create image overlay
    let overlay = document.getElementById('poster-image-overlay');
    if (!overlay) {
        overlay = document.createElement('img');
        overlay.id = 'poster-image-overlay';
        overlay.style.position = 'fixed';
        overlay.style.pointerEvents = 'none';
        overlay.style.zIndex = '3';
        overlay.style.transition = 'transform 0.1s ease-out';
        document.body.appendChild(overlay);
    }

    const imageMap = {
        'lookbook': '/images/lookbook.png',
        'rock': '/images/rock.jpg',
        'fontainebleau': '/images/fontainebleau.jpg',
        'bloom': '/images/bloom.jpg'
    };

    overlay.src = imageMap[posterName];
    overlay.style.display = 'block';
}

function unhighlightPoster() {
    if (highlightedPosterData) {
        highlightedPosterData.poster.visible = true;
        highlightedPosterData = null;
    }

    const overlay = document.getElementById('poster-image-overlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

function setupScrollHandling() {
    window.addEventListener('scroll', () => {
        updateCameraFromScroll();
    }, { passive: true });
}

function updateCameraFromScroll() {
    if (!camera) return;

    const maxScroll = window.innerHeight;
    const progress = Math.min(1, window.scrollY / maxScroll);
    const distance = 300;

    const startAngle = Math.PI / 2;
    const endAngle = 0;

    const currentAngle = startAngle + (endAngle - startAngle) * progress;

    const currentY = Math.sin(currentAngle) * distance;
    const currentZ = Math.cos(currentAngle) * distance;

    camera.position.set(0, currentY, currentZ);
    camera.lookAt(0, 0, 0);

    updateContentPosition(progress);
}

function updateContentPosition(progress) {
    const translate = -(window.innerHeight - 200) * progress;
    document.querySelector('header').style.transform = `translateY(${translate}px)`;
    document.getElementById('bio-marquee').style.transform = `translateY(${translate}px)`;

    // Projects section comes in from below the screen
    const projectsHeader = document.querySelector('.fixed.bottom-8.left-8');
    if (projectsHeader) {
        const projectsTranslate = (window.innerHeight - 200) * (1 - progress);
        projectsHeader.style.transform = `translateY(${projectsTranslate}px)`;
        projectsHeader.style.opacity = progress;
    }
}

function updateProjectHeaderVisibility(progress) {
    const header = document.querySelector('.fixed.bottom-8.left-8');
    if (!header) return;

    // Keep it always visible
    header.style.opacity = 1;
    header.style.transform = 'none';
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

    // Update image overlay position and rotation
    if (highlightedPosterData) {
        const overlay = document.getElementById('poster-image-overlay');
        if (overlay && camera) {
            const poster = highlightedPosterData.poster;

            // Get world position
            const worldPos = new window.THREE.Vector3();
            poster.getWorldPosition(worldPos);

            // Calculate screen size by projecting all four corners
            // Poster geometry is 70 wide x 105 tall
            const topLeft = new window.THREE.Vector3(-35, 52.5, 0);
            const topRight = new window.THREE.Vector3(35, 52.5, 0);
            const bottomLeft = new window.THREE.Vector3(-35, -52.5, 0);
            const bottomRight = new window.THREE.Vector3(35, -52.5, 0);

            topLeft.applyMatrix4(poster.matrixWorld);
            topRight.applyMatrix4(poster.matrixWorld);
            bottomLeft.applyMatrix4(poster.matrixWorld);
            bottomRight.applyMatrix4(poster.matrixWorld);

            const tlScreen = topLeft.project(camera);
            const trScreen = topRight.project(camera);
            const blScreen = bottomLeft.project(camera);
            const brScreen = bottomRight.project(camera);

            const tlx = (tlScreen.x * 0.5 + 0.5) * window.innerWidth;
            const tly = (-tlScreen.y * 0.5 + 0.5) * window.innerHeight;
            const trx = (trScreen.x * 0.5 + 0.5) * window.innerWidth;
            const try_ = (-trScreen.y * 0.5 + 0.5) * window.innerHeight;
            const blx = (blScreen.x * 0.5 + 0.5) * window.innerWidth;
            const bly = (-blScreen.y * 0.5 + 0.5) * window.innerHeight;
            const brx = (brScreen.x * 0.5 + 0.5) * window.innerWidth;
            const bry = (-brScreen.y * 0.5 + 0.5) * window.innerHeight;

            // Calculate actual width and height from adjacent corners (not bounding box)
            const posterWidth = Math.sqrt(Math.pow(trx - tlx, 2) + Math.pow(try_ - tly, 2));
            const posterHeight = Math.sqrt(Math.pow(bly - tly, 2) + Math.pow(blx - tlx, 2));
            const centerX = (tlx + trx + blx + brx) / 4;
            const centerY = (tly + try_ + bly + bry) / 4;

            // Check if poster is facing away from camera (should be mirrored)
            const posterNormal = new window.THREE.Vector3(0, 0, 1);
            posterNormal.applyQuaternion(new window.THREE.Quaternion().setFromRotationMatrix(poster.matrixWorld));
            const cameraDirection = new window.THREE.Vector3();
            cameraDirection.subVectors(worldPos, camera.position).normalize();
            const dotProduct = posterNormal.dot(cameraDirection);
            const isFacingAway = dotProduct > 0;

            // Calculate depth to determine z-index layering
            const posterDistance = camera.position.distanceTo(worldPos);
            const rockDistance = camera.position.distanceTo(new window.THREE.Vector3(0, 0, 0));

            // If poster is behind rock, put it below ASCII (z-index 0), otherwise above (z-index 3)
            const zIndex = posterDistance > rockDistance ? '0' : '3';

            overlay.style.left = `${centerX}px`;
            overlay.style.top = `${centerY}px`;
            overlay.style.width = `${posterWidth}px`;
            overlay.style.height = `${posterHeight}px`;
            overlay.style.zIndex = zIndex;
            overlay.style.opacity = '1';
            overlay.style.transform = `translate(-50%, -50%) scaleX(${isFacingAway ? -1 : 1})`;
        }
    }

    requestAnimationFrame(animate);
}

window.showPosterGallery3D = showPosterGallery3D;
window.hidePosterGallery3D = hidePosterGallery3D;
window.highlightPoster = highlightPoster;
window.unhighlightPoster = unhighlightPoster;

// Reset scroll position on page load
window.history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAsciiBackground);
} else {
    initAsciiBackground();
}