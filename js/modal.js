// ============================================
// modal.js – управление модальным окном через <model-viewer>
// ============================================
import { TOUR_DATA } from "./data.js";

let overlay, modelViewer, modalTitle, modalText;

export function initModal() {
    overlay = document.getElementById("overlay");
    modelViewer = document.getElementById("model-viewer");
    modalTitle = document.getElementById("modal-title");
    modalText = document.getElementById("modal-text");

    // Закрытие по крестику
    document.getElementById("close-modal").onclick = closeModal;

    // Закрытие по клику на overlay (фон)
    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) closeModal();
    });

    // Сброс модели при закрытии (чтобы не мигала старая)
    window.closeModal = closeModal; // для onclick в разметке (если нужно)
}

// Открыть модалку с моделью
export function openModal(data) {
    // Устанавливаем заголовок и описание
    modalTitle.innerText = data.title || "Интерактивная модель";
    modalText.innerText = data.description || "Нет описания";

    // Показываем overlay
    overlay.style.display = "flex";

    const modelLoader = document.getElementById('model-loader');
    modelLoader.classList.remove('hidden');

    // Сбрасываем src
    modelViewer.src = null;

    if (!TOUR_DATA.testMode && data.model) {
        // Вешаем обработчик загрузки на model-viewer
        modelViewer.addEventListener('load', function onLoad() {
            modelLoader.classList.add('hidden');
            modelViewer.removeEventListener('load', onLoad);
        }, { once: true });

        setTimeout(() => {
            modelViewer.src = data.model;
        }, 50);
    } else {
        // Тестовый режим — скрываем лоадер сразу
        modelLoader.classList.add('hidden');
        modalText.innerText = (TOUR_DATA.testMode ? '[ТЕСТ] ' : '') + (data.description || '');
    }
}

// Закрыть модалку
export function closeModal() {
    overlay.style.display = "none";
    modelViewer.src = null; // освобождаем ресурсы
}