import { TOUR_DATA } from "./data.js";

let overlay, modelViewer, modalTitle, modalText, modelLoader;
let currentItems = [];
let currentIndex = 0;
let currentLoadHandler = null;
let loaderTimeout = null;

// Для изображений
let imageContainer, imageElement, hotspotsContainer;
let currentSubHotspots = [];

// ОПТИМИЗАЦИЯ: кэш предзагруженных 3D-моделей
const modelCache = new Map(); // key = src, value = true (загружена)

export function initModal() {
    overlay = document.getElementById("overlay");
    modelViewer = document.getElementById("model-viewer");
    modalTitle = document.getElementById("modal-title");
    modalText = document.getElementById("modal-text");
    modelLoader = document.getElementById('model-loader');

    // ОПТИМИЗАЦИЯ: добавляем атрибуты для model-viewer прямо в JS, если их нет
    if (modelViewer && !modelViewer.hasAttribute('loading')) {
        modelViewer.setAttribute('loading', 'lazy');
        modelViewer.setAttribute('reveal', 'interaction');
        modelViewer.setAttribute('compression', 'draco'); // если модели сжаты Draco
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
        const modalInfo = document.querySelector('.modal-info');
        modalInfo.insertAdjacentHTML('beforeend', `<button id="show-all-btn">Весь список предметов</button>`);
    }

    document.getElementById("prev-model").onclick = (e) => { e.stopPropagation(); switchModel(-1); };
    document.getElementById("next-model").onclick = (e) => { e.stopPropagation(); switchModel(1); };
    document.getElementById("show-all-btn").onclick = (e) => {
        e.stopPropagation();
        document.getElementById("models-list-overlay").classList.toggle('active');
    };

    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape") closeModal();
    });
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };

    // Контейнер для изображения
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
}

// ОПТИМИЗАЦИЯ: функция предзагрузки модели в фоне
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
    modelViewer.style.display = 'none';
    imageContainer.style.display = 'flex';
    imageElement.src = hotspotData.image;
    currentSubHotspots = hotspotData.subHotspots;
    generateImageHotspots(hotspotData.subHotspots);
    modalTitle.innerText = hotspotData.title;
    modalText.innerText = 'Кликните на предмет, чтобы рассмотреть 3D-модель';
    overlay.style.display = "flex";

    // ОПТИМИЗАЦИЯ: предзагружаем 3D-модели всех подхотспотов
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
        btn.style.backgroundColor = 'rgba(76, 175, 80, 0.8)';
        btn.style.border = '2px solid white';
        btn.style.color = 'white';
        btn.style.fontSize = '20px';
        btn.style.fontWeight = 'bold';
        btn.style.cursor = 'pointer';
        btn.style.pointerEvents = 'auto';
        btn.style.zIndex = '10';
        btn.textContent = 'i';
        btn.title = spot.title;
        btn.onclick = (e) => {
            e.stopPropagation();
            open3DModel(spot);
        };
        hotspotsContainer.appendChild(btn);
    });
}

function open3DModel(modelData) {
    imageContainer.style.display = 'none';
    modelViewer.style.display = 'block';
    modalTitle.innerText = modelData.title;
    modalText.innerText = modelData.description;
    // ОПТИМИЗАЦИЯ: если модель уже была предзагружена, браузер возьмёт из кэша
    modelViewer.src = modelData.model;
}

export function closeModal() {
    overlay.style.display = "none";
    modelViewer.style.display = 'block';
    imageContainer.style.display = 'none';
    document.getElementById("models-list-overlay").classList.remove('active');
    hotspotsContainer.innerHTML = '';
    // ОПТИМИЗАЦИЯ: сбросим src model-viewer, чтобы остановить рендеринг
    modelViewer.src = '';
}

export function openModal(hotspotData, allRoomHotspots = []) {
    if (!Array.isArray(allRoomHotspots) || allRoomHotspots.length === 0) {
        currentItems = [hotspotData];
    } else {
        currentItems = allRoomHotspots.filter(h => h.type === 'info');
    }
    currentIndex = currentItems.findIndex(item => item.model === hotspotData.model);
    if (currentIndex === -1) currentIndex = 0;
    renderList();
    updateModalContent();
    overlay.style.display = "flex";
}

function updateModalContent() {
    const data = currentItems[currentIndex];
    if (!data) return;
    modalTitle.innerText = data.title;
    modalText.innerText = data.description;
    if (currentLoadHandler) {
        modelViewer.removeEventListener('load', currentLoadHandler);
    }
    if (loaderTimeout) clearTimeout(loaderTimeout);
    modelViewer.src = data.model;
    renderList();
}

function switchModel(direction) {
    currentIndex = (currentIndex + direction + currentItems.length) % currentItems.length;
    updateModalContent();
}

function renderList() {
    const listContainer = document.getElementById("models-list-overlay");
    if (!listContainer) return;
    listContainer.innerHTML = '<h3>Предметы в этой локации:</h3>';
    currentItems.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'model-item-link' + (index === currentIndex ? ' active-item' : '');
        row.innerText = item.title || `Предмет ${index + 1}`;
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
            // ОПТИМИЗАЦИЯ: также предзагружаем модель в фоне через скрытый viewer
            preloadModel(hs.model);
        }
    });
}