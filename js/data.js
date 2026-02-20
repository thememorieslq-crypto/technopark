export const TOUR_DATA = {
    testMode: false,
    buildings: [
        {
            id: 'quantorium',
            name: 'Кванториум',
            floors: [
                {
                    id: 'frame1',
                    name: '1 - Корпус',
                    rooms: [
                        // Основная комната 101
                        {
                            id: 'room101-1',
                            name: '101',
                            type: 'room',
                            panorama: '../assets/panoramas/first/101.jpg',
                            hotspots: [
                                {
                                    type: 'zone',
                                    position: [0, 0, -500],
                                    target: 'zone_microscope_101',
                                    title: 'Стол с микроскопом'
                                }
                            ]
                        },
                        // Зона для микроскопа
                        {
                            id: 'zone_microscope_101',
                            name: 'Стол микроскопа',
                            type: 'zone',
                            parentId: 'room101-1',       // связь с родительской комнатой
                            panorama: '../assets/panoramas/first/101.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [150, -100, -400],
                                    model: '../assets/models/microscope.glb',
                                    title: 'Микроскоп',
                                    description: 'Описание микроскопа...'
                                }
                            ]
                        },

                        // Основная комната 102
                        {
                            id: 'room102-1',
                            name: '102',
                            type: 'room',
                            panorama: '../assets/panoramas/first/102.jpg',
                            hotspots: [
                                {
                                    type: 'zone',
                                    position: [150, -100, -400],
                                    target: 'zone_helmet_102',
                                    title: 'Стол со шлемом'
                                }
                            ]
                        },
                        // Зона для шлема
                        {
                            id: 'zone_helmet_102',
                            name: 'Стол со шлемом',
                            type: 'zone',
                            parentId: 'room102-1',
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
                    id: 'frame4',
                    name: '4 - Корпус',
                    rooms: [
                        // Основная комната 201
                        {
                            id: 'room201-1',
                            name: '201',
                            type: 'room',
                            panorama: '../assets/panoramas/first/101.jpg',
                            hotspots: [
                                {
                                    type: 'zone',
                                    position: [350, -100, -400],
                                    target: 'zone_tank_201',
                                    title: 'Стол с танком'
                                }
                            ]
                        },
                        // Зона для танка
                        {
                            id: 'zone_tank_201',
                            name: 'Стол с танком',
                            type: 'zone',
                            parentId: 'room201-1',
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
            id: 'technopark',
            name: 'Технопарк',
            floors: [
                {
                    id: 'frame3',
                    name: '3 - Корпус',
                    rooms: [
                        // Основная комната 107
                        {
                            id: 'room107-3',
                            name: '107',
                            type: 'room',
                            panorama: '../assets/panoramas/third/107.jpg',
                            hotspots: [
                                {
                                    type: 'zone',
                                    position: [250, -100, -400],
                                    target: 'zone_taxi_107',
                                    title: 'Стол с такси'
                                },
                                {
                                    type: 'zone',
                                    position: [150, -100, -400],
                                    target: 'zone_helmet_107',
                                    title: 'Стол со шлемом'
                                }
                            ]
                        },
                        // Зона для такси (107)
                        {
                            id: 'zone_taxi_107',
                            name: 'Стол с такси',
                            type: 'zone',
                            parentId: 'room107-3',
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
                        },
                        // Зона для шлема (107)
                        {
                            id: 'zone_helmet_107',
                            name: 'Стол со шлемом',
                            type: 'zone',
                            parentId: 'room107-3',
                            panorama: '../assets/panoramas/third/107.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [150, -100, -400],
                                    model: '../assets/models/helmet.glb',
                                    title: 'Шлем',
                                    description: 'Описание шлема...'
                                }
                            ]
                        },

                        // Основная комната 112
                        {
                            id: 'room112-3',
                            name: '112',
                            type: 'room',
                            panorama: '../assets/panoramas/third/112.jpg',
                            hotspots: [
                                {
                                    type: 'zone',
                                    position: [250, -100, -400],
                                    target: 'zone_taxi_112',
                                    title: 'Стол с такси'
                                },
                                {
                                    type: 'zone',
                                    position: [150, -100, -400],
                                    target: 'zone_helmet_112',
                                    title: 'Стол со шлемом'
                                }
                            ]
                        },
                        // Зона для такси (112)
                        {
                            id: 'zone_taxi_112',
                            name: 'Стол с такси',
                            type: 'zone',
                            parentId: 'room112-3',
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
                        // Зона для шлема (112)
                        {
                            id: 'zone_helmet_112',
                            name: 'Стол со шлемом',
                            type: 'zone',
                            parentId: 'room112-3',
                            panorama: '../assets/panoramas/third/112.jpg',
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
                }
            ]
        }
    ]
};

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