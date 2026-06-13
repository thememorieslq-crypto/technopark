// ========== ПОДДЕРЖКА ЯЗЫКОВ ==========

export const LOCALES = {
    ru: {
        search: 'Поиск',
        back: '← Назад',
        close: 'Закрыть',
        allItems: 'Весь список предметов',
        clickOnItem: 'Кликните на предмет, чтобы рассмотреть 3D-модель',
        noDescription: 'Нет описания',
        searchPlaceholder: 'Введите название оборудования...',
        searchResults: 'Результаты поиска',
        nothingFound: 'Ничего не найдено',
        nothingFoundEquipment: 'Ничего не найдено',
        nothingFoundRooms: 'Аудитории не найдены',
        itemsInRoom: 'Предметы в этой локации:',
        noItems: 'Нет доступных предметов',
        underConstruction: 'В РАЗРАБОТКЕ',
        underConstructionText: 'Эта аудитория скоро появится',
        underConstructionShort: 'В разработке',
        clickToEnter: 'Нажмите для перехода',
        type3D: '3D модель',
        typeTable: 'Стол с экспонатами',
        typeItem: 'Экспонат',
        typeRoom: 'Аудитория',
        equipment: 'Оборудование',
        rooms: 'Аудитории'
    },
    en: {
        search: 'Search',
        back: '← Back',
        close: 'Close',
        allItems: 'All items in this room',
        clickOnItem: 'Click on an item to view the 3D model',
        noDescription: 'No description',
        searchPlaceholder: 'Enter equipment name...',
        searchResults: 'Search results',
        nothingFound: 'Nothing found',
        nothingFoundEquipment: 'Nothing found',
        nothingFoundRooms: 'No rooms found',
        itemsInRoom: 'Items in this room:',
        noItems: 'No items available',
        underConstruction: 'UNDER CONSTRUCTION',
        underConstructionText: 'This room will be available soon',
        underConstructionShort: 'Under construction',
        clickToEnter: 'Click to enter',
        type3D: '3D Model',
        typeTable: 'Table with exhibits',
        typeItem: 'Item',
        typeRoom: 'Room',
        equipment: 'Equipment',
        rooms: 'Rooms'
    }
};

let currentLang = 'ru';
let langListeners = [];

export function getCurrentLang() {
    return currentLang;
}

export function setLanguage(lang) {
    if (lang !== 'ru' && lang !== 'en') return;
    currentLang = lang;
    localStorage.setItem('language', lang);
    langListeners.forEach(listener => listener(currentLang));
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
}

export function toggleLanguage() {
    const newLang = currentLang === 'ru' ? 'en' : 'ru';
    setLanguage(newLang);
    return newLang;
}

export function t(key) {
    return LOCALES[currentLang][key] || LOCALES.ru[key] || key;
}

export function subscribeToLanguage(callback) {
    langListeners.push(callback);
    return () => {
        langListeners = langListeners.filter(cb => cb !== callback);
    };
}

export function forceUpdateUI() {
    langListeners.forEach(listener => listener(currentLang));
    window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: currentLang } }));
}

export function initLanguage() {
    const saved = localStorage.getItem('language');
    
    if (saved === 'en') {
        currentLang = 'en';
    } else {
        currentLang = 'ru';
        localStorage.setItem('language', 'ru');
    }
    
    addLanguageButton();
    forceUpdateUI();
}

function addLanguageButton() {
    const menu = document.getElementById('room-menu');
    if (!menu) return;
    
    if (document.getElementById('lang-btn')) return;
    
    const langBtn = document.createElement('button');
    langBtn.id = 'lang-btn';
    langBtn.textContent = currentLang === 'ru' ? 'RU' : 'EN';
    langBtn.style.cssText = `
        margin-left: 10px;
        background: rgba(20,20,20,0.9);
        color: white;
        border: 1px solid #555;
        border-radius: 4px;
        padding: 10px 16px;
        font-size: 14px;
        cursor: pointer;
    `;
    
    langBtn.onclick = () => {
        const newLang = toggleLanguage();
        langBtn.textContent = newLang === 'ru' ? 'RU' : 'EN';
    };
    
    const searchBtn = document.getElementById('search-btn');
    if (searchBtn) {
        searchBtn.insertAdjacentElement('afterend', langBtn);
    } else {
        menu.appendChild(langBtn);
    }
}