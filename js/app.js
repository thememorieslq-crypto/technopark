import { initPanorama, loadRoom } from './panorama.js';
import { TOUR_DATA, ROOMS_INDEX } from './data.js';
import { initModal } from './modal.js';

initPanorama(document.getElementById('app'));
initModal();

let startRoom = 'room101-1';
try {
    const saved = localStorage.getItem('lastRoom');
    if (saved && ROOMS_INDEX[saved]) startRoom = saved;
} catch (e) {}
loadRoom(startRoom);

// ===== Иерархическое бургер-меню =====
function initRoomUI() {
    const list = document.getElementById('room-list');
    const burger = document.getElementById('burger-btn');

    burger.onclick = () => list.classList.toggle('show');
    list.innerHTML = '';

    TOUR_DATA.buildings.forEach(building => {
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'menu-building';

        const buildingHeader = document.createElement('div');
        buildingHeader.className = 'building-header';
        buildingHeader.innerHTML = `${building.name} <span class="toggle">▼</span>`;
        buildingDiv.appendChild(buildingHeader);

        const floorsContainer = document.createElement('div');
        floorsContainer.className = 'floors-container';
        floorsContainer.style.display = 'none';

        building.floors.forEach(floor => {
            const floorDiv = document.createElement('div');
            floorDiv.className = 'menu-floor';

            const floorHeader = document.createElement('div');
            floorHeader.className = 'floor-header';
            floorHeader.innerHTML = `${floor.name} <span class="toggle">▼</span>`;
            floorDiv.appendChild(floorHeader);

            const roomsContainer = document.createElement('div');
            roomsContainer.className = 'rooms-container';
            roomsContainer.style.display = 'none';

            floor.rooms
                .filter(room => room.type === 'room')
                .forEach(room => {
                    const roomBtn = document.createElement('button');
                    roomBtn.className = 'room-button';
                    roomBtn.innerHTML = `${room.name}`;
                    roomBtn.onclick = (e) => {
                        e.stopPropagation();
                        loadRoom(room.id);
                        list.classList.remove('show');
                    };
                    roomsContainer.appendChild(roomBtn);
                });

            floorDiv.appendChild(roomsContainer);

            floorHeader.addEventListener('click', (e) => {
                e.stopPropagation();
                const isHidden = roomsContainer.style.display === 'none';
                roomsContainer.style.display = isHidden ? 'block' : 'none';
                const span = floorHeader.querySelector('.toggle');
                if (span) span.textContent = isHidden ? '▲' : '▼';
            });

            floorsContainer.appendChild(floorDiv);
        });

        buildingDiv.appendChild(floorsContainer);

        buildingHeader.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = floorsContainer.style.display === 'none';
            floorsContainer.style.display = isHidden ? 'block' : 'none';
            const span = buildingHeader.querySelector('.toggle');
            if (span) span.textContent = isHidden ? '▲' : '▼';
        });

        list.appendChild(buildingDiv);
    });
}

initRoomUI();

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