import { TOUR_DATA } from "./data.js";
import { getLocalizedText } from './data.js';
import { t, getCurrentLang, subscribeToLanguage, forceUpdateUI } from './locales.js';

let overlay, modelViewer, modalTitle, modalText, modelLoader;
let currentItems = [];
let currentIndex = 0;
let currentLoadHandler = null;
let loaderTimeout = null;

let imageContainer, imageElement, hotspotsContainer;
let currentSubHotspots = [];
let isImageModalMode = false;

const modelCache = new Map();

let subHotspotTooltip = null;

// ========== ЗВУК ДЛЯ ПОДХОТСПОТОВ ==========
let subHoverSound = null;
let lastHoveredSubSpot = null;
let subSoundEnabled = true;

function initSubHoverSound() {
    if (subHoverSound) return;
    
    try {
        subHoverSound = new Audio('path'); // путь для звука
        subHoverSound.volume = 0.4;
        subHoverSound.preload = 'auto';
        subHoverSound.onerror = () => {
            console.warn('Звуковой файл hover.mp3 не загружен');
            subSoundEnabled = false;
        };
    } catch(e) {
        console.warn('Звук не поддерживается:', e);
        subSoundEnabled = false;
    }
}

function playSubHoverSound() {
    if (!subSoundEnabled) return;
    if (!subHoverSound) initSubHoverSound();
    if (!subHoverSound) return;
    
    try {
        subHoverSound.pause();
        subHoverSound.currentTime = 0;
        subHoverSound.play().catch(e => {});
    } catch(e) {}
}

// ========== ЗВУКИ ДЛЯ ОТКРЫТИЯ/ЗАКРЫТИЯ МОДАЛКИ ==========
let openSound = null;
let closeSound = null;
let soundsEnabled = true;

function initModalSounds() {
    if (openSound) return;
    
    try {
        openSound = new Audio('./assets/sounds/whoosh.wav');
        openSound.volume = 0.2;
        openSound.preload = 'auto';
        openSound.onerror = () => {
            console.warn('Файл не загружен');
            soundsEnabled = false;
        };
        
        closeSound = new Audio('./assets/sounds/whoosh.wav');
        closeSound.volume = 0.2;
        closeSound.preload = 'auto';
        closeSound.onerror = () => {
            console.warn('Файл не загружен');
            soundsEnabled = false;
        };
    } catch(e) {
        console.warn('Звук не поддерживается:', e);
        soundsEnabled = false;
    }
}

function playOpenSound() {
    if (!soundsEnabled) return;
    if (!openSound) initModalSounds();
    if (!openSound) return;
    try {
        openSound.pause();
        openSound.currentTime = 0;
        openSound.play().catch(e => {});
    } catch(e) {}
}

function playCloseSound() {
    if (!soundsEnabled) return;
    if (!closeSound) initModalSounds();
    if (!closeSound) return;
    try {
        closeSound.pause();
        closeSound.currentTime = 0;
        closeSound.play().catch(e => {});
    } catch(e) {}
}

// ========== ТУЛТИП ДЛЯ ПОДХОТСПОТОВ ==========
function createSubHotspotTooltip() {
    const div = document.createElement('div');
    div.id = 'subhotspot-tooltip';
    div.style.position = 'fixed';
    div.style.backgroundColor = 'rgba(0,0,0,0.85)';
    div.style.color = '#fff';
    div.style.borderRadius = '8px';
    div.style.padding = '8px 12px';
    div.style.fontFamily = 'sans-serif';
    div.style.fontSize = '14px';
    div.style.pointerEvents = 'none';
    div.style.zIndex = '10001';
    div.style.backdropFilter = 'blur(4px)';
    div.style.border = '1px solid rgba(255,255,255,0.2)';
    div.style.transition = 'opacity 0.2s';
    div.style.opacity = '0';
    div.style.visibility = 'hidden';
    div.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
    document.body.appendChild(div);
    return div;
}

function showSubHotspotTooltip(spot, x, y) {
    if (!subHotspotTooltip) subHotspotTooltip = createSubHotspotTooltip();
    
    const lang = getCurrentLang();
    let thumbnail = spot.thumbnail || '';
    let title = getLocalizedText(spot.title, lang);
    
    let html = '';
    if (thumbnail) {
        html += `<div style="display: flex; flex-direction: column; align-items: center; gap: 8px; max-width: 150px;">
                    <img src="${thumbnail}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <span style="text-align: center; word-break: break-word;">${escapeHtml(title)}</span>
                 </div>`;
    } else {
        html += `<span style="max-width: 200px; white-space: normal; word-break: break-word;">${escapeHtml(title)}</span>`;
    }
    
    subHotspotTooltip.innerHTML = html;
    subHotspotTooltip.style.left = (x + 15) + 'px';
    subHotspotTooltip.style.top = (y + 15) + 'px';
    subHotspotTooltip.style.opacity = '1';
    subHotspotTooltip.style.visibility = 'visible';
}

function hideSubHotspotTooltip() {
    if (subHotspotTooltip) {
        subHotspotTooltip.style.opacity = '0';
        subHotspotTooltip.style.visibility = 'hidden';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

export function initModal() {
    initModalSounds();
    initSubHoverSound();
    
    overlay = document.getElementById("overlay");
    modelViewer = document.getElementById("model-viewer");
    modalTitle = document.getElementById("modal-title");
    modalText = document.getElementById("modal-text");
    modelLoader = document.getElementById('model-loader');

    if (modelViewer && !modelViewer.hasAttribute('loading')) {
        modelViewer.setAttribute('loading', 'lazy');
        modelViewer.setAttribute('reveal', 'interaction');
        modelViewer.setAttribute('compression', 'draco');
    }

    const closeBtn = document.getElementById("close-modal");
    if (closeBtn) closeBtn.onclick = closeModal;

    if (!document.getElementById("prev-model")) {
        const modal3d = document.querySelector('.modal-3d');
        modal3d.insertAdjacentHTML('beforeend', `
            <button class="nav-btn" id="prev-model">❮</button>
            <button class="nav-btn" id="next-model">❯</button>
            <div id="models-list-overlay"></div>
        `);
    }

    document.getElementById("prev-model").onclick = (e) => { e.stopPropagation(); switchModel(-1); };
    document.getElementById("next-model").onclick = (e) => { e.stopPropagation(); switchModel(1); };
    
    // ========== СОЗДАЁМ КНОПКУ "ВЕСЬ СПИСОК ПРЕДМЕТОВ" ==========
    const modalInfo = document.querySelector('.modal-info');
    if (modalInfo && !document.getElementById('show-all-btn')) {
        const showAllBtn = document.createElement('button');
        showAllBtn.id = 'show-all-btn';
        showAllBtn.textContent = t('allItems');
        showAllBtn.style.cssText = 'margin-top: auto; padding: 15px; background: #f0f0f0; border: none; border-radius: 10px; cursor: pointer; font-weight: bold;';
        showAllBtn.onclick = (e) => {
            e.stopPropagation();
            document.getElementById("models-list-overlay").classList.toggle('active');
        };
        modalInfo.appendChild(showAllBtn);
    }
    
    // ========== СОЗДАЁМ КНОПКУ "НАЗАД" ==========
    if (modalInfo && !document.getElementById('modal-back-btn')) {
        const backBtn = document.createElement('button');
        backBtn.id = 'modal-back-btn';
        backBtn.textContent = t('back');
        backBtn.style.cssText = 'margin-bottom: 15px; padding: 8px 16px; background: #333; color: white; border: none; border-radius: 8px; cursor: pointer; align-self: flex-start;';
        backBtn.onclick = (e) => {
            e.stopPropagation();
            if (isImageModalMode && modelViewer.style.display === 'block') {
                modelViewer.style.display = 'none';
                imageContainer.style.display = 'flex';
                const prevBtn = document.getElementById("prev-model");
                const nextBtn = document.getElementById("next-model");
                if (prevBtn) prevBtn.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'none';
            } else if (isImageModalMode && imageContainer.style.display === 'flex') {
                closeModal();
            } else {
                closeModal();
            }
        };
        modalInfo.insertBefore(backBtn, modalInfo.firstChild);
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape") closeModal();
    });
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    const modal3d = document.querySelector('.modal-3d');
    const imageWrapper = document.createElement('div');
    imageWrapper.id = 'image-modal-content';
    imageWrapper.style.display = 'none';
    imageWrapper.style.position = 'relative';
    imageWrapper.style.width = '100%';
    imageWrapper.style.height = '100%';
    imageWrapper.style.background = '#1a1a1a';
    imageWrapper.style.display = 'flex';
    imageWrapper.style.alignItems = 'center';
    imageWrapper.style.justifyContent = 'center';

    imageElement = document.createElement('img');
    imageElement.style.maxWidth = '100%';
    imageElement.style.maxHeight = '100%';
    imageElement.style.objectFit = 'contain';
    imageElement.style.cursor = 'default';

    hotspotsContainer = document.createElement('div');
    hotspotsContainer.style.position = 'absolute';
    hotspotsContainer.style.top = '0';
    hotspotsContainer.style.left = '0';
    hotspotsContainer.style.width = '100%';
    hotspotsContainer.style.height = '100%';
    hotspotsContainer.style.pointerEvents = 'none';

    imageWrapper.appendChild(imageElement);
    imageWrapper.appendChild(hotspotsContainer);
    modal3d.appendChild(imageWrapper);
    imageContainer = imageWrapper;
    
    // ========== ПОДПИСКА НА СМЕНУ ЯЗЫКА ==========
    subscribeToLanguage(() => {
        const showAllBtnElem = document.getElementById("show-all-btn");
        if (showAllBtnElem) showAllBtnElem.innerText = t('allItems');
        
        const modalBackBtnElem = document.getElementById("modal-back-btn");
        if (modalBackBtnElem) modalBackBtnElem.textContent = t('back');
        
        if (overlay && overlay.style.display === 'flex') {
            const data = currentItems[currentIndex];
            if (data) {
                modalTitle.innerText = getLocalizedText(data.title, getCurrentLang());
                modalText.innerText = getLocalizedText(data.description, getCurrentLang());
            }
            if (isImageModalMode && modalText) {
                modalText.innerText = t('clickOnItem');
            }
            renderList();
        }
    });
    
    forceUpdateUI();
}

function preloadModel(modelUrl) {
    if (modelCache.has(modelUrl)) return;
    const hiddenViewer = document.createElement('model-viewer');
    hiddenViewer.style.display = 'none';
    hiddenViewer.src = modelUrl;
    hiddenViewer.loading = 'eager';
    hiddenViewer.reveal = 'auto';
    document.body.appendChild(hiddenViewer);
    hiddenViewer.addEventListener('load', () => {
        modelCache.set(modelUrl, true);
        setTimeout(() => hiddenViewer.remove(), 10000);
    });
}

export function openImageModal(hotspotData) {
    playOpenSound();
    
    isImageModalMode = true; 
    modelViewer.style.display = 'none';
    imageContainer.style.display = 'flex';
    imageElement.src = hotspotData.image;
    
    const prevBtn = document.getElementById("prev-model");
    const nextBtn = document.getElementById("next-model");
    if (prevBtn) prevBtn.style.display = 'none';
    if (nextBtn) nextBtn.style.display = 'none';

    currentSubHotspots = hotspotData.subHotspots || [];
    currentItems = currentSubHotspots; 
    currentIndex = 0;

    generateImageHotspots(currentSubHotspots);
    
    const lang = getCurrentLang();
    modalTitle.innerText = getLocalizedText(hotspotData.title, lang);
    modalText.innerText = t('clickOnItem');
    
    renderList(); 
    overlay.style.display = "flex";

    if (hotspotData.subHotspots && hotspotData.subHotspots.length) {
        hotspotData.subHotspots.forEach(spot => {
            if (spot.model && !modelCache.has(spot.model)) {
                preloadModel(spot.model);
            }
        });
    }
}

function generateImageHotspots(subHotspots) {
    hotspotsContainer.innerHTML = '';
    
    subHotspots.forEach((spot, idx) => {
        const btn = document.createElement('button');
        btn.className = 'image-hotspot';
        btn.style.position = 'absolute';
        btn.style.left = `${spot.x}%`;
        btn.style.top = `${spot.y}%`;
        btn.style.transform = 'translate(-50%, -50%)';
        btn.style.width = '40px';
        btn.style.height = '40px';
        btn.style.borderRadius = '50%';
        btn.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
        btn.style.border = '2px solid white';
        btn.style.color = 'white';
        btn.style.fontSize = '20px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
        btn.style.zIndex = '10';
        btn.style.transition = 'transform 0.2s, background-color 0.2s';
        btn.textContent = 'i';
        
        btn.addEventListener('mouseenter', (e) => {
            if (lastHoveredSubSpot !== spot) {
                lastHoveredSubSpot = spot;
                playSubHoverSound();
            }
            showSubHotspotTooltip(spot, e.clientX, e.clientY);
        });
        btn.addEventListener('mousemove', (e) => {
            showSubHotspotTooltip(spot, e.clientX, e.clientY);
        });
        btn.addEventListener('mouseleave', () => {
            hideSubHotspotTooltip();
            lastHoveredSubSpot = null;
        });
        
        let touchTimer = null;
        btn.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            playSubHoverSound();
            touchTimer = setTimeout(() => {
                showSubHotspotTooltip(spot, touch.clientX, touch.clientY);
            }, 500);
        });
        btn.addEventListener('touchend', () => {
            if (touchTimer) clearTimeout(touchTimer);
            hideSubHotspotTooltip();
        });
        btn.addEventListener('touchmove', () => {
            if (touchTimer) clearTimeout(touchTimer);
            hideSubHotspotTooltip();
        });
        
        btn.onclick = (e) => {
            e.stopPropagation();
            currentIndex = idx;
            updateModalContent();
        };
        
        hotspotsContainer.appendChild(btn);
    });
}

export function closeModal() {
    playCloseSound();
    
    overlay.style.display = "none";
    modelViewer.style.display = 'block';
    imageContainer.style.display = 'none';
    document.getElementById("models-list-overlay").classList.remove('active');
    hotspotsContainer.innerHTML = '';
    hideSubHotspotTooltip();
    isImageModalMode = false; 

    const prevBtn = document.getElementById("prev-model");
    const nextBtn = document.getElementById("next-model");
    if (prevBtn) prevBtn.style.display = 'block';
    if (nextBtn) nextBtn.style.display = 'block';
}

export function openModal(hotspotData, allRoomHotspots = []) {
    playOpenSound();
    
    isImageModalMode = false;
    imageContainer.style.display = 'none';
    modelViewer.style.display = 'block';

    if (!Array.isArray(allRoomHotspots) || allRoomHotspots.length === 0) {
        currentItems = [hotspotData];
    } else {
        currentItems = allRoomHotspots.filter(h => h.type === 'info');
    }
    currentIndex = currentItems.findIndex(item => item.model === hotspotData.model);
    if (currentIndex === -1) currentIndex = 0;
    
    renderList();
    updateModalContent();
    overlay.style.flexDirection = "row";
    overlay.style.display = "flex";
}

function updateModalContent() {
    const data = currentItems[currentIndex];
    if (!data) return;
    
    const lang = getCurrentLang();

    if (isImageModalMode) {
        imageContainer.style.display = 'none';
        modelViewer.style.display = 'block';

        const prevBtn = document.getElementById("prev-model");
        const nextBtn = document.getElementById("next-model");
        if (prevBtn) prevBtn.style.display = currentItems.length > 1 ? 'block' : 'none';
        if (nextBtn) nextBtn.style.display = currentItems.length > 1 ? 'block' : 'none';
    }

    modalTitle.innerText = getLocalizedText(data.title, lang);
    modalText.innerText = getLocalizedText(data.description, lang);
    
    if (currentLoadHandler) {
        modelViewer.removeEventListener('load', currentLoadHandler);
    }
    if (loaderTimeout) clearTimeout(loaderTimeout);
    
    modelViewer.src = data.model;
    renderList(); 
}

function switchModel(direction) {
    if (currentItems.length === 0) return;
    currentIndex = (currentIndex + direction + currentItems.length) % currentItems.length;
    updateModalContent();
}

function renderList() {
    const listContainer = document.getElementById("models-list-overlay");
    if (!listContainer) return;
    
    const lang = getCurrentLang();
    listContainer.innerHTML = `<h3>${t('itemsInRoom')}</h3>`;
    
    if (currentItems.length === 0) {
        listContainer.innerHTML += `<div>${t('noItems')}</div>`;
        return;
    }

    currentItems.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'model-item-link' + (index === currentIndex ? ' active-item' : '');
        row.innerText = getLocalizedText(item.title, lang) || `${t('typeItem')} ${index + 1}`;
        row.onclick = (e) => {
            e.stopPropagation();
            currentIndex = index;
            updateModalContent();
            listContainer.classList.remove('active');
        };
        listContainer.appendChild(row);
    });
}

export function preloadRoomModels(hotspots) {
    hotspots.forEach(hs => {
        if (hs.model) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = hs.model;
            document.head.appendChild(link);
            preloadModel(hs.model);
        }
    });
}