// ============================================
// app.js – главный модуль, интерфейс, адаптация
// ============================================
import { initPanorama, loadRoom } from './panorama.js';
import { TOUR_DATA } from './data.js';
import { initModal } from './modal.js';

// ===== Инициализация =====
initPanorama(document.getElementById('app'));
initModal();

// Загружаем последнюю посещённую комнату (опционально, для удобства)
let startRoom = 'room1';
try {
    const saved = localStorage.getItem('lastRoom');
    if (saved && TOUR_DATA.rooms[saved]) startRoom = saved;
} catch (e) {}
loadRoom(startRoom);

// ===== Улучшенное бургер-меню с группировкой и иконками (п.4) =====
function initRoomUI() {
    const list = document.getElementById('room-list');
    const burger = document.getElementById('burger-btn');

    burger.onclick = () => list.classList.toggle('show');
    list.innerHTML = '';

    if (TOUR_DATA.categories && TOUR_DATA.categories.length) {
        TOUR_DATA.categories.forEach(cat => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'menu-category';
            categoryDiv.innerHTML = `<span class="category-title">${cat.name}</span>`;
            cat.rooms.forEach(roomId => {
                const room = TOUR_DATA.rooms[roomId];
                if (!room) return;
                const btn = document.createElement('button');
                // Иконка-эмодзи + название
                btn.innerHTML = `${roomId}`;
                btn.onclick = () => {
                    loadRoom(roomId);
                    list.classList.remove('show');
                };
                categoryDiv.appendChild(btn);
            });
            list.appendChild(categoryDiv);
        });
    } else {
        // Фоллбэк
        Object.keys(TOUR_DATA.rooms).forEach(roomId => {
            const btn = document.createElement('button');
            btn.innerHTML = `📍 ${roomId}`;
            btn.onclick = () => {
                loadRoom(roomId);
                list.classList.remove('show');
            };
            list.appendChild(btn);
        });
    }
}
initRoomUI();

// ===== Адаптивность интерфейса (п.7) =====
function setViewportScale() {
    const viewport = document.querySelector('meta[name=viewport]');
    if (!viewport) {
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
    }
}
setViewportScale();

// Дополнительная адаптация размеров шрифтов и кнопок через CSS (стили ниже)