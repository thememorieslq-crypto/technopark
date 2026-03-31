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
                        {
                            id: 'room101-1',
                            name: '101',
                            type: 'room',
                            panorama: '../assets/panoramas/first/101.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [0, 0, -500], 
                                    title: 'Стол с микроскопом',
                                    image: '../assets/images/table_101.jpg', 
                                    subHotspots: [
                                        {
                                            x: 30,   
                                            y: 45,   
                                            model: '../assets/models/microscope.glb',
                                            title: 'Микроскоп',
                                            description: 'Описание микроскопа...'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 'room102-1',
                            name: '102',
                            type: 'room',
                            panorama: '../assets/panoramas/first/102.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [150, -100, -400],
                                    title: 'Стол со шлемом',
                                    image: '../assets/panoramas/first/102.jpg',
                                    subHotspots: [
                                        {
                                            x: 55,
                                            y: 40,
                                            model: '../assets/models/helmet.glb',
                                            title: 'Шлем',
                                            description: 'Описание шлема...'
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'frame4',
                    name: '4 - Корпус',
                    rooms: [
                        {
                            id: 'room201-4',
                            name: '201',
                            type: 'room',
                            panorama: '../assets/panoramas/first/201.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [150, -100, -400],
                                    title: 'Стол со шлемом',
                                    image: '../assets/panoramas/first/201.jpg',
                                    subHotspots: [
                                        {
                                            x: 55,
                                            y: 40,
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
        },
        {
            id: 'technopark',
            name: 'Технопарк',
            floors: [
                {
                    id: 'frame3',
                    name: '3 - Корпус',
                    rooms: [
                        {
                            id: 'room107-3',
                            name: '107',
                            type: 'room',
                            panorama: '../assets/panoramas/technopark/107/107.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [150, -100, -400],
                                    title: 'Стол со шлемом',
                                    image: '../assets/panoramas/technopark/107/107.jpg',
                                    subHotspots: [
                                        {
                                            x: 55,
                                            y: 40,
                                            model: '../assets/models/helmet.glb',
                                            title: 'Шлем',
                                            description: 'Описание шлема...'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 'room110-3',
                            name: '110',
                            type: 'room',
                            panorama: '../assets/panoramas/technopark/110/110.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [150, -100, -400],
                                    title: 'Стол со шлемом',
                                    image: '../assets/panoramas/technopark/110/100.jpg',
                                    subHotspots: [
                                        {
                                            x: 55,
                                            y: 40,
                                            model: '../assets/models/helmet.glb',
                                            title: 'Шлем',
                                            description: 'Описание шлема...'
                                        }
                                    ]
                                }
                            ]
                        },

                        {
                            id: 'room111-3',
                            name: '111',
                            type: 'room',
                            panorama: '../assets/panoramas/technopark/111/111.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [150, -100, -400],
                                    title: 'Стол со шлемом',
                                    image: '../assets/panoramas/technopark/111/111.jpg',
                                    subHotspots: [
                                        {
                                            x: 55,
                                            y: 40,
                                            model: '../assets/models/helmet.glb',
                                            title: 'Шлем',
                                            description: 'Описание шлема...'
                                        }
                                    ]
                                }
                            ]
                        },


                        {
                            id: 'room112-3',
                            name: '112',
                            type: 'room',
                            panorama: '../assets/panoramas/technopark/112/112.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [-650, -100, 350],
                                    title: 'Автономные мобильные роботы',
                                    image: '../assets/panoramas/technopark/112/112_table.jpg',
                                    subHotspots: [
                                        {
                                            x: 57,
                                            y: 72,
                                            model: '../assets/models/robokit.glb',
                                            title: 'Робо-кит',
                                            description: 'Автономные мобильные роботы (АМР или AMR — Autonomous Mobile Robots) — это «высшая лига» программируемых машинок. В отличие от обычных радиоуправляемых моделей или простых роботов, которые едут строго по линии, АМР умеют принимать решения самостоятельно.'
                                        },

                                        {
                                            x: 33,
                                            y: 71,
                                            model: '../assets/models/robot.glb',
                                            title: 'Робот',
                                            description: 'Автономные мобильные роботы (АМР или AMR — Autonomous Mobile Robots) — это «высшая лига» программируемых машинок. В отличие от обычных радиоуправляемых моделей или простых роботов, которые едут строго по линии, АМР умеют принимать решения самостоятельно.'
                                        }
                                    ]
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