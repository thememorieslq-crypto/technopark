import * as THREE from 'three';
import { loadRoom } from './panorama.js';
import { openModal, openImageModal } from './modal.js';
import { getLocalizedText } from './data.js';
import { getCurrentLang } from './locales.js';

// ========== ЗВУК ПРИ НАВЕДЕНИИ ==========
let hoverSound = null;
let lastHoveredHotspot = null;
let soundEnabled = true;

function initHoverSound() {
    if (hoverSound) return;
    
    try {
        hoverSound = new Audio('./assets/sounds/select.wav');
        hoverSound.volume = 0.1;
        hoverSound.preload = 'auto';
        
        hoverSound.onerror = () => {
            console.warn('Звуковой файл не загружен, путь: ./assets/sounds/select.wav');
            soundEnabled = false;
        };
    } catch(e) {
        console.warn('Звук не поддерживается:', e);
        soundEnabled = false;
    }
}

function playHoverSound() {
    if (!soundEnabled) return;
    if (!hoverSound) initHoverSound();
    if (!hoverSound) return;
    
    try {
        hoverSound.pause();
        hoverSound.currentTime = 0;
        hoverSound.play().catch(e => {});
    } catch(e) {}
}

// ========== ТУЛТИП ==========
let tooltipDiv = null;

function createTooltipDiv() {
    const div = document.createElement('div');
    div.id = 'custom-tooltip';
    div.style.position = 'fixed';
    div.style.backgroundColor = 'rgba(0,0,0,0.85)';
    div.style.color = '#fff';
    div.style.borderRadius = '8px';
    div.style.padding = '8px 12px';
    div.style.display = 'flex';
    div.style.alignItems = 'center';
    div.style.gap = '10px';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '14px';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '10000';
    div.style.whiteSpace = 'nowrap';
    div.style.backdropFilter = 'blur(4px)';
    div.style.border = '1px solid rgba(255,255,255,0.2)';
    div.style.transition = 'opacity 0.2s';
    div.style.opacity = '0';
    div.style.visibility = 'hidden';
    document.body.appendChild(div);
    return div;
}

function showTooltip(hotspotData, mouseX, mouseY) {
    if (!tooltipDiv) tooltipDiv = createTooltipDiv();
    
    const lang = getCurrentLang();
    let thumbnail = hotspotData.thumbnail || hotspotData.image || '';
    let title = hotspotData.title ? getLocalizedText(hotspotData.title, lang) : (hotspotData.type === 'nav' ? `→ ${hotspotData.target}` : 'Информация');
    
    let html = '';
    if (thumbnail) {
        html += `<img src="${thumbnail}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">`;
    } else {
        html += `<div style="width: 40px; height: 40px; background: ${hotspotData.type === 'info' ? '#4caf50' : '#2196f3'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">${hotspotData.type === 'info' ? 'i' : '→'}</div>`;
    }
    html += `<span>${escapeHtml(title)}</span>`;
    tooltipDiv.innerHTML = html;
    
    tooltipDiv.style.left = (mouseX + 15) + 'px';
    tooltipDiv.style.top = (mouseY + 15) + 'px';
    tooltipDiv.style.opacity = '1';
    tooltipDiv.style.visibility = 'visible';
}

function hideTooltip() {
    if (tooltipDiv) {
        tooltipDiv.style.opacity = '0';
        tooltipDiv.style.visibility = 'hidden';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== ОСНОВНАЯ ЧАСТЬ ==========
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hotspotObjects = [];
let tooltipSprite = null;

const iconTextureCache = {
    info: null,
    nav: null
};
const tooltipTextureCache = {};

let currentMouseMoveHandler = null;
let currentMouseLeaveHandler = null;
let currentClickHandler = null;

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

export function preloadIconTextures() {
    if (!iconTextureCache.info) {
        iconTextureCache.info = createIconTexture('info');
        iconTextureCache.nav = createIconTexture('nav');
    }
}

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

export function createHotspots(scene, hotspots, camera, renderer, filterTypes = null) {
    initHoverSound();
    
    hotspotObjects.forEach(obj => scene.remove(obj));
    hotspotObjects = [];

    if (currentMouseMoveHandler) {
        renderer.domElement.removeEventListener('mousemove', currentMouseMoveHandler);
    }
    if (currentMouseLeaveHandler) {
        renderer.domElement.removeEventListener('mouseleave', currentMouseLeaveHandler);
    }
    if (currentClickHandler) {
        renderer.domElement.removeEventListener('click', currentClickHandler);
    }

    preloadIconTextures();

    const visibleHotspots = filterTypes
        ? hotspots.filter(h => filterTypes.includes(h.type))
        : hotspots;

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

    if (tooltipSprite) tooltipSprite.visible = false;

    currentMouseMoveHandler = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hotspotObjects);

        renderer.domElement.style.cursor = intersects.length ? 'pointer' : 'default';

        if (intersects.length === 0) {
            hideTooltip();
            lastHoveredHotspot = null;
            return;
        }

        const data = intersects[0].object.userData;
        
        if (lastHoveredHotspot !== data) {
            lastHoveredHotspot = data;
            playHoverSound();
        }
        
        showTooltip(data, event.clientX, event.clientY);
    };

    currentMouseLeaveHandler = () => {
        hideTooltip();
        renderer.domElement.style.cursor = 'default';
        lastHoveredHotspot = null;
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