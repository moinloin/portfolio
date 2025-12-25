import * as THREE from "three";

export let shaderAsciiScene, shaderAsciiCamera, shaderAsciiMesh;
export let mousePosition = { x: -1000, y: -1000 };

export function setupShaderBackground() {
    const cellWidth = 8;
    const cellHeight = 16;
    const gridCols = Math.ceil(window.innerWidth / cellWidth);
    const gridRows = Math.ceil(window.innerHeight / cellHeight);

    const chars = " .'`^\",:;!><-~+=*#%@";
    const charCount = chars.length;

    function createCharacterAtlas() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const charPixelSize = 32 * dpr;

        const canvas = document.createElement("canvas");
        canvas.width = charPixelSize * charCount;
        canvas.height = charPixelSize;

        const ctx = canvas.getContext("2d", {
            willReadFrequently: false,
            alpha: true
        });

        ctx.imageSmoothingEnabled = false;

        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "black";
        ctx.font = `bold ${30 * dpr}px "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < charCount; i++) {
            ctx.fillText(
                chars[i],
                charPixelSize * i + charPixelSize / 2,
                charPixelSize / 2
            );
        }

        return canvas;
    }

    const atlasCanvas = createCharacterAtlas();
    const atlasTexture = new THREE.CanvasTexture(atlasCanvas);
    atlasTexture.minFilter = THREE.NearestFilter;
    atlasTexture.magFilter = THREE.NearestFilter;

    const vertexShader = `
        varying vec2 vUv;

        void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;

    const fragmentShader = `
        uniform vec2 uGrid;
        uniform vec2 uResolution;
        uniform vec2 uMouse;
        uniform sampler2D uCharAtlas;
        uniform float uCharCount;
        uniform float uTime;

        varying vec2 vUv;

        float noise(vec2 st) {
            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
        }

        float smoothNoise(vec2 st) {
            vec2 i = floor(st);
            vec2 f = fract(st);
            f = f * f * (3.0 - 2.0 * f);

            float a = noise(i);
            float b = noise(i + vec2(1.0, 0.0));
            float c = noise(i + vec2(0.0, 1.0));
            float d = noise(i + vec2(1.0, 1.0));

            return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
        }

        float getPatternBrightness(vec2 uv) {
            vec2 center = vec2(0.5, 0.5);
            vec2 pos = uv - center;

            float dist = length(pos);

            float angle = atan(pos.y, pos.x);
            float waves = sin(dist * 15.0 - uTime * 0.5) * 0.5 + 0.5;
            waves += sin(angle * 8.0 + uTime * 0.3) * 0.3;

            float noiseScale1 = smoothNoise(uv * 3.0 + uTime * 0.1);
            float noiseScale2 = smoothNoise(uv * 7.0 - uTime * 0.15);
            float noiseScale3 = smoothNoise(uv * 12.0 + uTime * 0.08);

            float pattern = 0.0;

            pattern += (1.0 - dist * 1.2) * 0.4;

            pattern += waves * 0.25;

            pattern += noiseScale1 * 0.2;
            pattern += noiseScale2 * 0.1;
            pattern += noiseScale3 * 0.05;

            pattern = clamp(pattern, 0.0, 1.0);

            return pattern;
        }

        void main() {
            vec2 screenPos = vUv * uResolution;
            vec2 toMouse = screenPos - uMouse;
            float distToMouse = length(toMouse);

            vec2 repelOffset = vec2(0.0);
            float repelRadius = 1800.0;
            if (distToMouse < repelRadius && distToMouse > 0.1) {
                float strength = (repelRadius - distToMouse) / distToMouse;
                strength = min(strength, 2.5);
                vec2 repelDirection = normalize(toMouse);
                repelOffset = -repelDirection * strength * 4.0;
            }

            vec2 displacedUV = vUv + repelOffset / uResolution;

            vec2 gridCoord = floor(displacedUV * uGrid);
            vec2 cellUV = fract(displacedUV * uGrid);

            float brightness = getPatternBrightness(displacedUV);

            float charIndex = floor(brightness * (uCharCount - 1.0));

            vec2 atlasUV = vec2(
                (charIndex + cellUV.x) / uCharCount,
                cellUV.y
            );

            vec4 charColor = texture2D(uCharAtlas, atlasUV);

            gl_FragColor = charColor;
        }
    `;

    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
        uniforms: {
            uGrid: { value: new THREE.Vector2(gridCols, gridRows) },
            uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
            uMouse: { value: new THREE.Vector2(-1000, -1000) },
            uCharAtlas: { value: atlasTexture },
            uCharCount: { value: charCount },
            uTime: { value: 0.0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        depthTest: false,
        depthWrite: false
    });

    const mesh = new THREE.Mesh(geometry, material);

    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const scene = new THREE.Scene();
    scene.add(mesh);

    shaderAsciiScene = scene;
    shaderAsciiCamera = camera;
    shaderAsciiMesh = mesh;

    return { scene, camera, mesh };
}

export function setupMouseTracking() {
    window.addEventListener("mousemove", (event) => {
        mousePosition.x = event.clientX;
        mousePosition.y = event.clientY;
    });

    window.addEventListener("mouseleave", () => {
        mousePosition.x = -1000;
        mousePosition.y = -1000;
    });
}
