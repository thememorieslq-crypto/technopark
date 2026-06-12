import { loadRoom } from './panorama.js';
import { openModal, openImageModal } from './modal.js';
import { ROOMS_INDEX, getLocalizedText } from './data.js';
import { t, getCurrentLang } from './locales.js';

let searchModal = null;
let searchInput = null;
let searchResults = null;
let allEquipmentItems = [];
let allRooms = [];
let currentCategory = 'equipment';

// Собираем все поисковые элементы
function buildSearchIndex() {
    allEquipmentItems = [];
    allRooms = [];
    
    for (const [roomId, room] of Object.entries(ROOMS_INDEX)) {
        allRooms.push({
            id: roomId,
            name: room.name,
            type: 'room',
            underConstruction: room.underConstruction || false,
            roomId: roomId
        });
        
        if (!room.hotspots) continue;
        
        room.hotspots.forEach(hotspot => {
            if (hotspot.type === 'nav' || hotspot.type === 'zone') return;
            
            const item = {
                id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
                roomId: roomId,
                roomName: room.name,
                type: hotspot.type,
                title: hotspot.title,
                description: hotspot.description || '',
                data: hotspot
            };
            allEquipmentItems.push(item);
            
            if (hotspot.type === 'imageModal' && hotspot.subHotspots) {
                hotspot.subHotspots.forEach(sub => {
                    allEquipmentItems.push({
                        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
                        roomId: roomId,
                        roomName: room.name,
                        type: 'subHotspot',
                        title: sub.title,
                        description: sub.description || '',
                        data: sub,
                        parentImageModal: hotspot
                    });
                });
            }
        });
    }
    
    console.log(`Оборудование: ${allEquipmentItems.length} элементов`);
    console.log(`Аудитории: ${allRooms.length} комнат`);
}

function search(query) {
    if (!query || query.trim() === '') {
        return [];
    }
    
    const lowerQuery = query.toLowerCase().trim();
    const lang = getCurrentLang();
    
    if (currentCategory === 'equipment') {
        return allEquipmentItems.filter(item => {
            const title = getLocalizedText(item.title, lang).toLowerCase();
            const description = getLocalizedText(item.description, lang).toLowerCase();
            return title.includes(lowerQuery) || description.includes(lowerQuery);
        });
    } else {
        return allRooms.filter(room => {
            const roomName = getLocalizedText(room.name, lang).toLowerCase();
            return roomName.includes(lowerQuery);
        });
    }
}

function renderResults(results) {
    if (!searchResults) return;
    
    const lang = getCurrentLang();
    
    if (results.length === 0) {
        const noResultsText = currentCategory === 'equipment' ? t('nothingFoundEquipment') : t('nothingFoundRooms');
        searchResults.innerHTML = `<div class="no-results">${noResultsText}</div>`;
        return;
    }
    
    searchResults.innerHTML = '';
    
    if (currentCategory === 'equipment') {
        results.forEach(result => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            
            let typeLabel = '';
            let typeClass = '';
            if (result.type === 'info') {
                typeLabel = t('type3D');
                typeClass = '';
            } else if (result.type === 'imageModal') {
                typeLabel = t('typeTable');
                typeClass = 'imageModal';
            } else if (result.type === 'subHotspot') {
                typeLabel = t('typeItem');
                typeClass = '';
            }
            
            const title = getLocalizedText(result.title, lang);
            const description = getLocalizedText(result.description, lang);
            const roomName = getLocalizedText(result.roomName, lang);
            
            div.innerHTML = `
                <div class="search-result-title">
                    <span>${escapeHtml(title)}</span>
                    <span class="search-result-type ${typeClass}">${typeLabel}</span>
                </div>
                <div class="search-result-description">${description ? escapeHtml(description.substring(0, 100)) + (description.length > 100 ? '...' : '') : t('noDescription')}</div>
                <div class="search-result-room">📍 ${escapeHtml(roomName)}</div>
            `;
            
            div.onclick = async () => {
                closeSearchModal();
                await loadRoom(result.roomId);
                setTimeout(() => {
                    if (result.type === 'info') {
                        openModal(result.data, ROOMS_INDEX[result.roomId].hotspots);
                    } else if (result.type === 'imageModal') {
                        openImageModal(result.data);
                    } else if (result.type === 'subHotspot') {
                        openImageModal(result.parentImageModal);
                        setTimeout(() => {
                            const idx = result.parentImageModal.subHotspots.findIndex(s => {
                                const subTitle = getLocalizedText(s.title, lang);
                                const resultTitle = getLocalizedText(result.title, lang);
                                return subTitle === resultTitle;
                            });
                            if (idx !== -1) {
                                const event = new CustomEvent('openSubHotspot', { detail: { index: idx } });
                                window.dispatchEvent(event);
                            }
                        }, 300);
                    }
                }, 200);
            };
            searchResults.appendChild(div);
        });
    } else {
        // Отображение аудиторий
        results.forEach(room => {
            const div = document.createElement('div');
            div.className = 'search-result-item';
            const roomName = getLocalizedText(room.name, lang);
            const underConstruction = room.underConstruction ? ` 🚧 ` : '';
            
            div.innerHTML = `
                <div class="search-result-title">
                    <span>${escapeHtml(roomName)}${escapeHtml(underConstruction)}</span>
                    <span class="search-result-type room-type">${t('typeRoom')}</span>
                </div>
                <div class="search-result-description">${room.underConstruction ? t('underConstructionShort') : t('clickToEnter')}</div>
            `;
            
            div.onclick = async () => {
                closeSearchModal();
                await loadRoom(room.id);
            };
            searchResults.appendChild(div);
        });
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

function setCategory(category) {
    currentCategory = category;
    
    const equipmentTab = document.getElementById('tab-equipment');
    const roomsTab = document.getElementById('tab-rooms');
    
    if (equipmentTab && roomsTab) {
        if (category === 'equipment') {
            equipmentTab.classList.add('active');
            roomsTab.classList.remove('active');
        } else {
            roomsTab.classList.add('active');
            equipmentTab.classList.remove('active');
        }
    }
    
    // Обновляем заголовок
    const modalTitle = document.querySelector('#search-modal .search-modal-header h3');
    if (modalTitle) {
        modalTitle.innerHTML = category === 'equipment' ? `${t('equipment')}` : `${t('rooms')}`;
    }
    
    if (searchInput && searchResults) {
        const query = searchInput.value;
        if (query && query.trim() !== '') {
            const results = search(query);
            renderResults(results);
        } else {
            searchResults.innerHTML = '';
        }
    }
}

function openSearchModal() {
    if (!searchModal) return;
    searchModal.style.display = 'flex';
    setTimeout(() => {
        if (searchInput) searchInput.focus();
    }, 100);
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
    setCategory('equipment');
}

function closeSearchModal() {
    if (!searchModal) return;
    searchModal.style.display = 'none';
    if (searchInput) searchInput.value = '';
    if (searchResults) searchResults.innerHTML = '';
}

function initSearch() {
    buildSearchIndex();
    
    searchModal = document.getElementById('search-modal');
    searchInput = document.getElementById('search-input');
    searchResults = document.getElementById('search-results');
    const searchBtn = document.getElementById('search-btn');
    const closeBtn = document.getElementById('close-search-btn');
    const equipmentTab = document.getElementById('tab-equipment');
    const roomsTab = document.getElementById('tab-rooms');
    
    if (!searchModal || !searchInput || !searchResults) {
        console.warn('Элементы поиска не найдены');
        return;
    }
    
    if (searchInput) searchInput.placeholder = `${t('search')}...`;
    
    if (searchBtn) searchBtn.onclick = openSearchModal;
    if (closeBtn) closeBtn.onclick = closeSearchModal;
    
    if (equipmentTab) {
        equipmentTab.textContent = t('equipment');
        equipmentTab.onclick = () => setCategory('equipment');
    }
    if (roomsTab) {
        roomsTab.textContent = t('rooms');
        roomsTab.onclick = () => setCategory('rooms');
    }
    
    searchModal.onclick = (e) => {
        if (e.target === searchModal) closeSearchModal();
    };
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        const results = search(query);
        renderResults(results);
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchModal.style.display === 'flex') {
            closeSearchModal();
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openSearchModal();
        }
    });
    
    console.log('Поиск инициализирован (Ctrl+K)');
}

window.addEventListener('openSubHotspot', (e) => {
    const buttons = document.querySelectorAll('.image-hotspot');
    if (buttons[e.detail.index]) {
        buttons[e.detail.index].click();
    }
});

export { initSearch, buildSearchIndex };