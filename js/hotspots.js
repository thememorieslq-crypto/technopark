import * as THREE from 'three';
import { loadRoom } from './panorama.js';
import { openModal, openImageModal } from './modal.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hotspotObjects = [];
let tooltipSprite = null;          // Один переиспользуемый спрайт
let tooltipMaterial = null;        // Материал для него

// Кэши текстур
const iconTextureCache = {
    info: null,
    nav: null
};
const tooltipTextureCache = {};

// Ссылки на обработчики
let currentMouseMoveHandler = null;
let currentMouseLeaveHandler = null;
let currentClickHandler = null;

// --------------------------------------------------------------
// 1. Создание текстур иконок (кэшируются по типу)
// --------------------------------------------------------------
function createIconTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    if (type === 'info') {
        gradient.addColorStop(0, 'rgba(76, 175, 80, 0.9)');
        gradient.addColorStop(1, 'rgba(46, 125, 50, 0.9)');
    } else {
        gradient.addColorStop(0, 'rgba(33, 150, 243, 0.9)');
        gradient.addColorStop(1, 'rgba(13, 71, 161, 0.9)');
    }
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (type === 'info') {
        ctx.fillText('i', 32, 32);
    } else {
        ctx.fillText('➤', 32, 34);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
}

// Предзагрузка текстур иконок (вызывается один раз при старте)
export function preloadIconTextures() {
    if (!iconTextureCache.info) {
        iconTextureCache.info = createIconTexture('info');
        iconTextureCache.nav = createIconTexture('nav');
    }
}

// --------------------------------------------------------------
// 2. Получение текстуры тултипа из кэша (по тексту)
// --------------------------------------------------------------
function getTooltipTexture(text) {
    if (!tooltipTextureCache[text]) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 48;
        ctx.fillStyle = 'rgba(20,20,20,0.85)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;
        tooltipTextureCache[text] = texture;
    }
    return tooltipTextureCache[text];
}

// --------------------------------------------------------------
// 3. Инициализация единого спрайта тултипа
// --------------------------------------------------------------
function initTooltipSprite(scene) {
    if (tooltipSprite) return;
    tooltipMaterial = new THREE.SpriteMaterial({
        map: getTooltipTexture(''), // временная текстура
        depthTest: false,
        depthWrite: false,
        transparent: true
    });
    tooltipSprite = new THREE.Sprite(tooltipMaterial);
    tooltipSprite.visible = false;
    scene.add(tooltipSprite);
}

// --------------------------------------------------------------
// 4. Основная функция: создание хотспотов в текущей комнате
// --------------------------------------------------------------
export function createHotspots(scene, hotspots, camera, renderer, filterTypes = null) {
    // Удаляем старые метки
    hotspotObjects.forEach(obj => scene.remove(obj));
    hotspotObjects = [];

    // Удаляем предыдущие обработчики
    if (currentMouseMoveHandler) {
        renderer.domElement.removeEventListener('mousemove', currentMouseMoveHandler);
    }
    if (currentMouseLeaveHandler) {
        renderer.domElement.removeEventListener('mouseleave', currentMouseLeaveHandler);
    }
    if (currentClickHandler) {
        renderer.domElement.removeEventListener('click', currentClickHandler);
    }

    // Убедимся, что текстуры иконок загружены
    preloadIconTextures();

    const visibleHotspots = filterTypes
        ? hotspots.filter(h => filterTypes.includes(h.type))
        : hotspots;

    // Создаём новые спрайты, переиспользуя текстуры иконок
    visibleHotspots.forEach(h => {
        const texture = (h.type === 'info') ? iconTextureCache.info : iconTextureCache.nav;
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(...h.position);
        sprite.scale.set(40, 40, 1);
        sprite.userData = h;
        scene.add(sprite);
        hotspotObjects.push(sprite);
    });

    // Инициализируем (или сбрасываем) тултип-спрайт
    initTooltipSprite(scene);
    if (tooltipSprite) tooltipSprite.visible = false;

    // --- Обработчик движения мыши (оптимизированный) ---
    currentMouseMoveHandler = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hotspotObjects);

        renderer.domElement.style.cursor = intersects.length ? 'pointer' : 'default';

        if (!tooltipSprite) return;

        if (intersects.length === 0) {
            tooltipSprite.visible = false;
            return;
        }

        const data = intersects[0].object.userData;
        const text = data.title || (data.type === 'nav' ? `→ ${data.target}` : 'ℹ️ Подробнее');

        const texture = getTooltipTexture(text);
        if (tooltipSprite.material.map !== texture) {
            tooltipSprite.material.map = texture;
            tooltipSprite.material.needsUpdate = true;
        }

        const pos = intersects[0].object.position.clone().add(new THREE.Vector3(0, 35, 0));
        tooltipSprite.position.copy(pos);
        tooltipSprite.scale.set(180, 34, 1);
        tooltipSprite.visible = true;
    };

    currentMouseLeaveHandler = () => {
        if (tooltipSprite) tooltipSprite.visible = false;
        renderer.domElement.style.cursor = 'default';
    };

    currentClickHandler = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hotspotObjects);
        if (intersects.length === 0) return;

        const data = intersects[0].object.userData;
        if (data.type === 'nav' || data.type === 'zone') {
            loadRoom(data.target);
        } else if (data.type === 'info') {
            openModal(data, hotspots);
        } else if (data.type === 'imageModal') {
            openImageModal(data);
        }
    };

    renderer.domElement.addEventListener('mousemove', currentMouseMoveHandler);
    renderer.domElement.addEventListener('mouseleave', currentMouseLeaveHandler);
    renderer.domElement.addEventListener('click', currentClickHandler);
}