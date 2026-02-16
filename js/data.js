// ============================================
// data.js – конфигурация корпусов, этажей и комнат
// ============================================

export const TOUR_DATA = {
    // Режим тестирования
    testMode: false,

    // Корпуса
    buildings: [
        {
            // 1 корпус 
            id: 'building1',
            name: '1 Корпус',
            floors: [
                {
                    // 1 этаж 
                    id: 'floor1_1',
                    name: '1 этаж',
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
                    // 2 этаж 
                    id: 'floor1_2',
                    name: '2 этаж',
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
            // 3 корпус 
            id: 'building3',
            name: '3 Корпус',
            floors: [
                {
                    // 1 этаж 
                    id: 'floor3_1',
                    name: 'Технопарк',
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
                            hotspots: []
                        }
                    ]
                },
                {
                    // 2 этаж 
                    id: 'floor3_2',
                    name: 'Кванториум',
                    rooms: [
                        {
                            id: 'room209-3',
                            name: '209',
                            panorama: '../assets/panoramas/209.jpg',
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
                            id: 'room212-3',
                            name: '212',
                            panorama: '../assets/panoramas/212.jpg',
                            hotspots: []
                        }
                    ]
                }
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