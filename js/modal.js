import { TOUR_DATA } from "./data.js";

let overlay, modelViewer, modalTitle, modalText, modelLoader;
let currentItems = [];
let currentIndex = 0;

let currentLoadHandler = null;
let loaderTimeout = null;

export function initModal() {
    overlay = document.getElementById("overlay");
    modelViewer = document.getElementById("model-viewer");
    modalTitle = document.getElementById("modal-title");
    modalText = document.getElementById("modal-text");
    modelLoader = document.getElementById('model-loader');

    const closeBtn = document.getElementById("close-modal");
    if (closeBtn) closeBtn.onclick = closeModal;

    // Добавляем кнопки управления (если их еще нет в HTML)
    if (!document.getElementById("prev-model")) {
        const modal3d = document.querySelector('.modal-3d');
        modal3d.insertAdjacentHTML('beforeend', `
            <button class="nav-btn" id="prev-model">❮</button>
            <button class="nav-btn" id="next-model">❯</button>
            <div id="models-list-overlay"></div>
        `);

        const modalInfo = document.querySelector('.modal-info');
        modalInfo.insertAdjacentHTML('beforeend', `
            <button id="show-all-btn">Весь список предметов</button>
        `);
    }

    // Слушатели кнопок
    document.getElementById("prev-model").onclick = (e) => { e.stopPropagation(); switchModel(-1); };
    document.getElementById("next-model").onclick = (e) => { e.stopPropagation(); switchModel(1); };
    document.getElementById("show-all-btn").onclick = (e) => {
        e.stopPropagation();
        document.getElementById("models-list-overlay").classList.toggle('active');
    };

    // Закрытие по ESC
    window.addEventListener('keydown', (e) => {
        if (e.key === "Escape") closeModal();
    });

    // Закрытие по клику на фон
    overlay.onclick = (e) => { if (e.target === overlay) closeModal(); };
}

export function openModal(hotspotData, allRoomHotspots = []) {
    // Безопасная фильтрация
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

    // Сброс загрузки
    modelLoader.classList.remove('hidden');

    // Удаляем предыдущий обработчик load
    if (currentLoadHandler) {
        modelViewer.removeEventListener('load', currentLoadHandler);
    }

    // Добавляем новый обработчик (однократный)
    currentLoadHandler = () => {
        modelLoader.classList.add('hidden');
    };
    modelViewer.addEventListener('load', currentLoadHandler, { once: true });

    // Очищаем предыдущий таймер
    if (loaderTimeout) clearTimeout(loaderTimeout);
    // Если модель не загрузилась за 5 секунд – скрываем лоадер принудительно
    loaderTimeout = setTimeout(() => {
        modelLoader.classList.add('hidden');
    }, 5000);

    modelViewer.src = data.model;

    // Подсвечиваем активный элемент в списке
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

export function closeModal() {
    overlay.style.display = "none";
    document.getElementById("models-list-overlay").classList.remove('active');
    // Останавливаем загрузку модели, если она идёт? model-viewer сам управляет.
}

export function preloadRoomModels(hotspots) {
    hotspots.forEach(hs => {
        if (hs.model) {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = hs.model;
            document.head.appendChild(link);
        }
    });
}