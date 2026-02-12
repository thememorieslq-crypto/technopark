// ============================================
// app.js – главный скрипт приложения
// ============================================
import { initPanorama, loadRoom } from "./panorama.js";
import { TOUR_DATA } from "./data.js";
import { initModal } from "./modal.js";

// 1. Запуск 360-панорамы
initPanorama(document.getElementById("app"));

// 2. Инициализация модального окна с 3D-просмотрщиком
initModal();

// 3. Загрузка стартовой комнаты
loadRoom("room1");

// 4. Интерфейс бургер-меню для выбора комнат
function initRoomUI() {
    const list = document.getElementById("room-list");
    const burger = document.getElementById("burger-btn");

    burger.onclick = () => {
        list.classList.toggle("show");
    };

    // Автоматически создаём кнопки для всех комнат из TOUR_DATA
    Object.keys(TOUR_DATA.rooms).forEach(roomId => {
        const btn = document.createElement("button");
        btn.textContent = roomId;
        btn.onclick = () => {
            loadRoom(roomId);
            list.classList.remove("show"); // закрыть меню
        };
        list.appendChild(btn);
    });
}

initRoomUI();

// Для отладки – можно менять testMode в консоли
window.TOUR_DATA = TOUR_DATA;