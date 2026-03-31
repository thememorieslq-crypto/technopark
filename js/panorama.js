import * as THREE from 'three';
import { OrbitControls } from '../libs/three/examples/jsm/controls/OrbitControls.js';
import { createHotspots } from './hotspots.js';
import { TOUR_DATA } from './data.js';
import { ROOMS_INDEX } from './data.js';

THREE.Cache.enabled = true;

let scene, camera, renderer, sphere;
let controls;
let currentRoomId = null;
let currentRoomType = 'room';

const textureCache = {};
let fadeOverlay;

// Флаги для предотвращения множественных вызовов
let isLoading = false;
let fadeTimer = null;

export function initPanorama(container) {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        1,
        1100
    );
    camera.position.set(0, 0, 0.1);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

    fadeOverlay = document.createElement('div');
    fadeOverlay.id = 'fade-overlay';
    fadeOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: black;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
        z-index: 1800;
    `;
    document.body.appendChild(fadeOverlay);

    window.addEventListener('resize', onWindowResize);
    animate();
}

function fadeOut(callback) {
    if (!fadeOverlay) {
        callback();
        return;
    }
    fadeOverlay.style.opacity = '1';
    fadeTimer = setTimeout(() => {
        callback();
    }, 500);
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

    fadeOut(() => {
        _loadRoomInternal(roomId);
        isLoading = false;
    });
}

function _loadRoomInternal(roomId) {
    const roomData = ROOMS_INDEX[roomId];
    if (!roomData) {
        console.error(`❌ Комната ${roomId} не найдена`);
        fadeIn();
        return;
    }

    currentRoomId = roomId;
    currentRoomType = roomData.type || 'room';

    // Управление кнопкой "Назад" через parentId
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
    if (loaderEl) loaderEl.classList.remove('hidden');

    if (sphere) scene.remove(sphere);

    const geometry = new THREE.SphereGeometry(500, 64, 64);
    geometry.scale(-1, 1, 1);

    const onTextureReady = (texture) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        createHotspots(scene, roomData.hotspots, camera, renderer, null);

        if (loaderEl) loaderEl.classList.add('hidden');
        fadeIn();

        try {
            localStorage.setItem('lastRoom', roomId);
        } catch (e) {}

        setTimeout(() => {
            roomData.hotspots
                .filter(h => h.type === 'nav' && h.target)
                .forEach(h => preloadPanorama(h.target));
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
                fadeIn();
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
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}