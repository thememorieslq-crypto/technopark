export const TOUR_DATA = {
    testMode: false,
    buildings: [
        {
            id: 'quantorium',
            name: { ru: 'Кванториум', en: 'Quantorium' },
            floors: [
                {
                    id: 'frame1',
                    name: { ru: '1 - Корпус', en: '1 - Building' },
                    rooms: [
                        {
                            id: 'room101-1',
                            name: { ru: '101', en: '101' },
                            type: 'room',
                            underConstruction: true,
                            panorama: '../assets/panoramas/temp1/101.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [0, 0, -500],
                                    title: { ru: 'Стол с микроскопом', en: 'Microscope Table' },
                                    image: '../assets/images/table_101.jpg',
                                    subHotspots: [
                                        {
                                            x: 30,
                                            y: 45,
                                            model: '../assets/models/microscope.glb',
                                            title: { ru: 'Микроскоп', en: 'Microscope' },
                                            description: { ru: 'Описание микроскопа...', en: 'Microscope description...' }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            id: 'room102-1',
                            name: { ru: '102', en: '102' },
                            type: 'room',
                            underConstruction: true,
                            panorama: '../assets/panoramas/temp1/102.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [150, -100, -400],
                                    title: { ru: 'Стол со шлемом', en: 'Helmet Table' },
                                    image: '../assets/panoramas/temp1/102.jpg',
                                    subHotspots: [
                                        {
                                            x: 55,
                                            y: 40,
                                            model: '../assets/models/helmet.glb',
                                            title: { ru: 'Шлем', en: 'Helmet' },
                                            description: { ru: 'Описание шлема...', en: 'Helmet description...' }
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'frame4',
                    name: { ru: '4 - Корпус', en: '4 - Building' },
                    rooms: [
                        {
                            id: 'room201-4',
                            name: { ru: '201', en: '201' },
                            type: 'room',
                            underConstruction: true,
                            panorama: '../assets/panoramas/temp1/201.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [150, -100, -400],
                                    title: { ru: 'Стол со шлемом', en: 'Helmet Table' },
                                    image: '../assets/panoramas/temp1/201.jpg',
                                    subHotspots: [
                                        {
                                            x: 55,
                                            y: 40,
                                            model: '../assets/models/helmet.glb',
                                            title: { ru: 'Шлем', en: 'Helmet' },
                                            description: { ru: 'Описание шлема...', en: 'Helmet description...' }
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
            name: { ru: 'Технопарк', en: 'Technopark' },
            floors: [
                {
                    id: 'frame3',
                    name: { ru: '3 - Корпус', en: '3 - Building' },
                    rooms: [
                        {
                            id: 'room107-3',
                            name: { ru: '107', en: '107' },
                            type: 'room',
                            panorama: '../assets/panoramas/technopark/107/107.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [100, -200, -400],
                                    title: { ru: 'Цифровой USB-микроскоп', en: 'Digital USB Microscope' },
                                    description: {
                                        ru: 'Цифровой USB-микроскоп — это оптико-электронный прибор для получения и вывода на внешний экран увеличенных изображений микрообъектов, оснащенный встроенной LED-подсветкой, ручной фокусировкой и предметным столиком с зажимами для фиксации образцов.',
                                        en: 'Digital USB microscope is an optical-electronic device for obtaining and displaying enlarged images of micro-objects on an external screen, equipped with built-in LED lighting, manual focusing and a stage with clamps for fixing samples.'
                                    },
                                    thumbnail: '../assets/thumbnails/microscope_small.jpg',
                                    model: '../assets/models/107/microscope.glb'
                                }
                            ]
                        },
                        {
                            id: 'room110-3',
                            name: { ru: '110', en: '110' },
                            type: 'room',
                            panorama: '../assets/panoramas/technopark/110/110.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [400, -150, -150],
                                    title: { ru: 'Анатомический стол «Пирогов»', en: 'Pirogov Anatomical Table' },
                                    description: {
                                        ru: 'Интерактивный анатомический стол «Пирогов» — это уникальный обучающий комплекс для визуализации трехмерной анатомии человеческого тела. Оборудование оснащено сенсорным экраном высокого разрешения и позволяет детально изучать системы органов, проводить виртуальные диссекции (вскрытия), сопоставлять данные КТ/МРТ и исследовать различные патологии в режиме реального времени. Комплекс разработан для медицинских вузов, колледжей и профильных классов.',
                                        en: 'The Pirogov Interactive Anatomical Table is a unique educational complex for visualizing three-dimensional human anatomy. The equipment features a high-resolution touch screen and allows detailed study of organ systems, virtual dissections, CT/MRI data comparison, and real-time pathology analysis. The complex is designed for medical universities, colleges and specialized classes.'
                                    },
                                    thumbnail: '../assets/thumbnails/table.jpg',
                                    model: '../assets/models/110/Anatomage-table.glb'
                                }
                            ]
                        },
                        {
                            id: 'room111-3',
                            name: { ru: '111', en: '111' },
                            type: 'room',
                            panorama: '../assets/panoramas/technopark/111/111.jpg',
                            hotspots: [
                                {
                                    type: 'info',
                                    position: [520, -270, -400],
                                    title: { ru: 'Шлем VR HTC Vive Pro', en: 'HTC Vive Pro VR Headset' },
                                    description: {
                                        ru: 'Шлем виртуальной реальности HTC Vive Pro — профессиональное VR-устройство, разработанное для детальной визуализации, работы с 3D-графикой и интерактивного обучения. Он оснащен дисплеями высокого разрешения для четкости изображения, встроенными наушниками с объемным звуком и эргономичным жестким оголовьем для комфортной длительной работы.',
                                        en: 'The HTC Vive Pro virtual reality headset is a professional VR device designed for detailed visualization, 3D graphics work and interactive learning. It features high-resolution displays for crisp images, built-in headphones with spatial audio and an ergonomic rigid headband for comfortable extended use.'
                                    },
                                    thumbnail: '../assets/thumbnails/VR_HTC_VIVE_PRO.jpg',
                                    model: '../assets/models/111/htc_vive_pro.glb'
                                }
                            ]
                        },
                        {
                            id: 'room112-3',
                            name: { ru: '112', en: '112' },
                            type: 'room',
                            panorama: '../assets/panoramas/technopark/112/112.jpg',
                            hotspots: [
                                {
                                    type: 'imageModal',
                                    position: [-650, -100, 350],
                                    title: { ru: 'Автономные мобильные роботы', en: 'Autonomous Mobile Robots' },
                                    image: '../assets/panoramas/technopark/112/112_table.jpg',
                                    subHotspots: [
                                        {
                                            x: 57,
                                            y: 72,
                                            model: '../assets/models/112/robokit.glb',
                                            title: { ru: 'Робо-кит', en: 'Robo-Kit' },
                                            description: {
                                                ru: 'Автономные мобильные роботы (АМР или AMR — Autonomous Mobile Robots) — это «высшая лига» программируемых машинок. В отличие от обычных радиоуправляемых моделей или простых роботов, которые едут строго по линии, АМР умеют принимать решения самостоятельно.',
                                                en: 'Autonomous Mobile Robots (AMR) are the "major league" of programmable machines. Unlike conventional radio-controlled models or simple robots that follow a strict line, AMRs can make decisions on their own.'
                                            },
                                            thumbnail: '../assets/thumbnails/Robot-Kit.jpg'
                                        },
                                        {
                                            x: 33,
                                            y: 71,
                                            model: '../assets/models/112/robot.glb',
                                            title: { ru: 'Робот', en: 'Robot' },
                                            description: {
                                                ru: 'Автономные мобильные роботы (АМР или AMR — Autonomous Mobile Robots) — это «высшая лига» программируемых машинок. В отличие от обычных радиоуправляемых моделей или простых роботов, которые едут строго по линии, АМР умеют принимать решения самостоятельно.',
                                                en: 'Autonomous Mobile Robots (AMR) are the "major league" of programmable machines. Unlike conventional radio-controlled models or simple robots that follow a strict line, AMRs can make decisions on their own.'
                                            },
                                            thumbnail: '../assets/thumbnails/Robot.jpg'
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

// ========== ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ЛОКАЛИЗОВАННОГО ТЕКСТА ==========
export function getLocalizedText(obj, lang) {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'object') {
        return obj[lang] || obj.ru || '';
    }
    return String(obj);
}