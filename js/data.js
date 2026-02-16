// ============================================
// data.js – конфигурация корпусов, этажей и комнат
// ============================================

export const TOUR_DATA = {
    // Режим тестирования
    testMode: false,

    // Корпуса
    buildings: [
        {
            // Центр Кванториума
            id: 'quantorium',
            name: 'Кванториум',
            floors: [
                {
                    // 1 Корпус
                    id: 'frame1',
                    name: '1 - Корпус',
                    rooms: [
                        {
                            id: 'room101-1',
                            name: '101',
                            panorama: '../assets/panoramas/first/101.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [0, 0, -500],
                                    model: '../assets/models/microscope.glb',
                                    title: 'Микроскоп',
                                    description: 'Описание микроскопа...'
                                }
                            ]
                        },
                        {
                            id: 'room102-1',
                            name: '102',
                            panorama: '../assets/panoramas/first/102.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [150, -100, -400],
                                    model: '../assets/models/helmet.glb',
                                    title: 'Шлем',
                                    description: 'Описание шлема...'
                                }
                            ]
                        }
                    ]
                },
                {
                    // 4 Корпус
                    id: 'frame4',
                    name: '4 - Корпус',
                    rooms: [
                        {
                            id: 'room201-1',
                            name: '201',
                            panorama: '../assets/panoramas/first/101.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [350, -100, -400],
                                    model: '../assets/models/tank.glb',
                                    title: 'Танк',
                                    description: 'Описание танка...'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            // Центр Технопарк
            id: 'technopark',
            name: 'Технопарк',
            floors: [
                {
                    // 3 Корпус
                    id: 'frame3',
                    name: '3 - Корпус',
                    rooms: [
                        {
                            id: 'room112-3',
                            name: '112',
                            panorama: '../assets/panoramas/third/112.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [250, -100, -400],
                                    model: '../assets/models/taxi.glb',
                                    title: 'Такси',
                                    description: 'Описание такси...'
                                }
                            ]
                        },
                        {
                            id: 'room107-3',
                            name: '107',
                            panorama: '../assets/panoramas/third/107.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [250, -100, -400],
                                    model: '../assets/models/taxi.glb',
                                    title: 'Такси',
                                    description: 'Описание такси...'
                                }
                            ]
                        }
                    ]
                },
            ]
        }
    ]
};



// Создадим индекс комнат для быстрого доступа
export const ROOMS_INDEX = {};

(function buildIndex() {
    for (const building of TOUR_DATA.buildings) {
        for (const floor of building.floors) {
            for (const room of floor.rooms) {
                ROOMS_INDEX[room.id] = room;
            }
        }
    }
})();