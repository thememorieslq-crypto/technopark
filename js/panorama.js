// ============================================
// panorama.js – 360-панорама, кэш, предзагрузка, лоадер
// ============================================
import * as THREE from 'three';
import { OrbitControls } from '../libs/three/examples/jsm/controls/OrbitControls.js';
import { createHotspots } from './hotspots.js';
import { TOUR_DATA } from './data.js';

// Включаем встроенный кэш текстур Three.js (п.5)
THREE.Cache.enabled = true;

let scene, camera, renderer, sphere;
let controls;
let currentRoomId = null;

// Кэш для предзагруженных текстур (п.6)
const textureCache = {};

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
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // оптимизация (п.7)
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.rotateSpeed = 0.8;

    window.addEventListener('resize', onWindowResize);
    animate();
}

function onWindowResize() {
    const container = document.getElementById('app');
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Предзагрузка соседней панорамы (п.6)
function preloadPanorama(roomId) {
    const room = TOUR_DATA.rooms[roomId];
    if (!room || textureCache[roomId]) return;
    const loader = new THREE.TextureLoader();
    loader.load(room.panorama, (tex) => {
        textureCache[roomId] = tex;
        console.log(`✅ Предзагружена ${roomId}`);
    });
}

export function loadRoom(roomId) {
    const roomData = TOUR_DATA.rooms[roomId];
    if (!roomData) {
        console.error(`❌ Комната ${roomId} не найдена`);
        return;
    }

    currentRoomId = roomId;

    // Показать лоадер панорамы (п.2)
    const loaderEl = document.getElementById('panorama-loader');
    if (loaderEl) loaderEl.classList.remove('hidden');

    // Удалить старую панораму
    if (sphere) scene.remove(sphere);

    const geometry = new THREE.SphereGeometry(500, 64, 64);
    geometry.scale(-1, 1, 1);

    const onTextureReady = (texture) => {
        const material = new THREE.MeshBasicMaterial({ map: texture });
        sphere = new THREE.Mesh(geometry, material);
        scene.add(sphere);

        createHotspots(scene, roomData.hotspots, camera, renderer);

        // Скрыть лоадер
        if (loaderEl) loaderEl.classList.add('hidden');

        // Сохраняем последнюю комнату (опционально)
        try {
            localStorage.setItem('lastRoom', roomId);
        } catch (e) {}

        // Предзагружаем комнаты, на которые ведут навигационные метки
        setTimeout(() => {
            roomData.hotspots
                .filter(h => h.type === 'nav' && h.target)
                .forEach(h => preloadPanorama(h.target));
        }, 200);
    };

    // Используем кэш, если есть
    if (textureCache[roomId]) {
        onTextureReady(textureCache[roomId]);
        return;
    }

    // Загружаем новую текстуру
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
            }
        );
    }
}

function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) renderer.render(scene, camera);
}