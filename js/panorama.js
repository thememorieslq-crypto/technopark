import * as THREE from 'three';
import { OrbitControls } from '../libs/three/examples/jsm/controls/OrbitControls.js';
import { createHotspots } from './hotspots.js';
import { TOUR_DATA, ROOMS_INDEX, getLocalizedText } from './data.js';
import { t, getCurrentLang, subscribeToLanguage } from './locales.js';

THREE.Cache.enabled = true;

let scene, camera, renderer, sphereMesh;
let controls;
let currentRoomId = null;
let currentRoomType = 'room';
let currentMaterial = null;

let nextSphereMesh = null;
let nextMaterial = null;
let crossfadeProgress = 1;
let isCrossfading = false;
let crossfadeStartTime = 0;
const CROSSFADE_DURATION = 600;

const textureCache = {};
let fadeOverlay;
let isLoading = false;
let fadeTimer = null;

let minFov = 30;
let maxFov = 120;
let currentFov = 75; 

export function initPanorama(container) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        currentFov, // используем currentFov
        container.clientWidth / container.clientHeight,
        1,
        1100
    );
    camera.position.set(0, 0, 0.1);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 1);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false; 
    controls.enablePan = false;
    controls.rotateSpeed = -0.4;

    controls.addEventListener('start', () => {
        document.body.classList.add('is-dragging');
    });
    controls.addEventListener('end', () => {
        document.body.classList.remove('is-dragging');
    });

    renderer.domElement.addEventListener('wheel', (e) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 1 : -1;
        currentFov += delta * 2; 
        currentFov = Math.min(maxFov, Math.max(minFov, currentFov));
        camera.fov = currentFov;
        camera.updateProjectionMatrix();
    }, { passive: false });

    let initialPinchDist = 0;
    let initialFov = currentFov;

    renderer.domElement.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            initialPinchDist = Math.sqrt(dx*dx + dy*dy);
            initialFov = currentFov;
        }
    }, { passive: true });

    renderer.domElement.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx*dx + dy*dy);
            const scale = dist / initialPinchDist;
            const sensitivity = 0.5;
            const newFov = initialFov - (scale - 1) * 30;
            currentFov = Math.min(maxFov, Math.max(minFov, newFov));
            camera.fov = currentFov;
            camera.updateProjectionMatrix();
        }
    }, { passive: false });

    const geometry = new THREE.SphereGeometry(500, 64, 64);
    geometry.scale(-1, 1, 1);
    sphereMesh = new THREE.Mesh(geometry);
    scene.add(sphereMesh);
    
    // Создаём вторую сферу для кроссфейда (скрыта)
    nextSphereMesh = new THREE.Mesh(geometry);
    nextSphereMesh.visible = false;
    scene.add(nextSphereMesh);

    window.addEventListener('resize', onWindowResize);
    animate();
    
    subscribeToLanguage(() => {
        if (currentRoomId) {
            loadRoom(currentRoomId);
        }
    });
}

function startCrossfade(newTexture) {
    if (!nextSphereMesh) return;
    
    if (nextMaterial) {
        nextMaterial.dispose();
    }
    nextMaterial = new THREE.MeshBasicMaterial({ 
        map: newTexture,
        transparent: true,
        opacity: 0
    });
    nextSphereMesh.material = nextMaterial;
    nextSphereMesh.visible = true;
    
    crossfadeProgress = 1;
    isCrossfading = true;
    crossfadeStartTime = performance.now();
}

function updateCrossfade() {
    if (!isCrossfading) return;
    
    const now = performance.now();
    const elapsed = now - crossfadeStartTime;
    
    if (elapsed >= CROSSFADE_DURATION) {
        isCrossfading = false;
        
        if (currentMaterial) {
            currentMaterial.dispose();
        }
        currentMaterial = nextMaterial;
        sphereMesh.material = currentMaterial;
        
        // Прячем вторую сферу
        nextSphereMesh.visible = false;
        nextMaterial = null;
        
        crossfadeProgress = 1;
        return;
    }
    
    crossfadeProgress = 1 - (elapsed / CROSSFADE_DURATION);
    
    if (nextMaterial) {
        nextMaterial.opacity = 1 - crossfadeProgress;
    }
    if (currentMaterial) {
        currentMaterial.opacity = crossfadeProgress;
    }
}

function fadeOut(callback) {
    if (!fadeOverlay) {
        callback();
        return;
    }
    fadeOverlay.style.opacity = '1';
    fadeTimer = setTimeout(() => {
        callback();
    }, 300);
}

function fadeIn() {
    if (!fadeOverlay) return;
    fadeOverlay.style.opacity = '0';
}

function preloadPanorama(roomId) {
    const room = ROOMS_INDEX[roomId];
    if (!room || textureCache[roomId]) return;
    const loader = new THREE.TextureLoader();
    loader.load(room.panorama, (tex) => {
        textureCache[roomId] = tex;
    });
}

export function loadRoom(roomId) {
    if (isLoading) return;
    isLoading = true;
    if (fadeTimer) clearTimeout(fadeTimer);

    if (currentMaterial && currentMaterial.map && textureCache[roomId]) {
        startCrossfade(textureCache[roomId]);
        _loadRoomInternal(roomId, true);
    } else {
        fadeOut(() => {
            _loadRoomInternal(roomId, false);
            isLoading = false;
        });
    }
}

function _loadRoomInternal(roomId, useCrossfade = false) {
    const roomData = ROOMS_INDEX[roomId];
    if (!roomData) {
        console.error(`❌ Комната ${roomId} не найдена`);
        if (!useCrossfade) fadeIn();
        return;
    }

    currentRoomId = roomId;
    currentRoomType = roomData.type || 'room';
    window.currentRoomId = roomId;

    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        if (roomData.parentId) {
            backBtn.style.display = 'block';
            backBtn.onclick = () => loadRoom(roomData.parentId);
        } else {
            backBtn.style.display = 'none';
        }
    }

    const loaderEl = document.getElementById('panorama-loader');
    if (loaderEl && !useCrossfade) loaderEl.classList.remove('hidden');

    if (roomData.underConstruction === true) {
        const lang = getCurrentLang();
        const canvas = document.createElement('canvas');
        canvas.width = 2048;
        canvas.height = 1024;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300);
        gradient.addColorStop(0, '#16213e');
        gradient.addColorStop(1, '#0f0f1a');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 350, 0, 2 * Math.PI);
        ctx.fill();

        ctx.font = 'bold 90px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t('underConstruction'), centerX, centerY + 60);
        ctx.font = '36px sans-serif';
        ctx.fillStyle = '#888888';
        ctx.fillText(t('underConstructionText'), centerX, centerY + 150);

        const texture = new THREE.CanvasTexture(canvas);
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        if (useCrossfade) {
            startCrossfade(texture);
        } else {
            if (currentMaterial) currentMaterial.dispose();
            currentMaterial = new THREE.MeshBasicMaterial({ map: texture });
            sphereMesh.material = currentMaterial;
        }

        createHotspots(scene, [], camera, renderer, null);
        if (loaderEl) loaderEl.classList.add('hidden');
        if (!useCrossfade) fadeIn();
        return;
    }

    const onTextureReady = (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        if (useCrossfade && currentMaterial) {
            startCrossfade(texture);
        } else {
            if (currentMaterial) currentMaterial.dispose();
            currentMaterial = new THREE.MeshBasicMaterial({ map: texture });
            sphereMesh.material = currentMaterial;
        }

        createHotspots(scene, roomData.hotspots, camera, renderer, null);

        if (loaderEl) loaderEl.classList.add('hidden');
        if (!useCrossfade) fadeIn();

        try {
            localStorage.setItem('lastRoom', roomId);
        } catch (e) {}

        setTimeout(() => {
            if (roomData.hotspots) {
                roomData.hotspots
                    .filter(h => h.type === 'zone' && h.target)
                    .forEach(h => preloadPanorama(h.target));
            }
        }, 200);
    };

    if (textureCache[roomId]) {
        onTextureReady(textureCache[roomId]);
        return;
    }

    if (TOUR_DATA.testMode) {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#888';
        ctx.fillRect(0, 0, canvas.width/2, canvas.height/2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 40px sans-serif';
        ctx.fillText(roomId, 100, 200);
        const tex = new THREE.CanvasTexture(canvas);
        onTextureReady(tex);
    } else {
        new THREE.TextureLoader().load(
            roomData.panorama,
            onTextureReady,
            undefined,
            (err) => {
                console.error(`Ошибка загрузки панорамы ${roomId}:`, err);
                if (loaderEl) loaderEl.classList.add('hidden');
                if (!useCrossfade) fadeIn();
            }
        );
    }
}

function onWindowResize() {
    const container = document.getElementById('app');
    if (!container || !camera || !renderer) return;
    
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
    
    if (currentRoomId) {
        const roomData = ROOMS_INDEX[currentRoomId];
        if (roomData && roomData.hotspots) {
            createHotspots(scene, roomData.hotspots, camera, renderer, null);
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Обновляем кроссфейд
    updateCrossfade();
    
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}
