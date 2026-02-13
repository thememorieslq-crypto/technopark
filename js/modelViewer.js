// ============================================
// modelViewer.js – сцена для интерактивной 3D-модели
// ============================================
import * as THREE from "three";
import { OrbitControls } from "../libs/three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "../libs/three/examples/jsm/loaders/GLTFLoader.js";
import { TOUR_DATA } from "./data.js";

let scene, camera, renderer, controls;
let modelGroup; // группа для хранения текущей модели

export function initModelViewer() {
    const container = document.getElementById("model-container");
    if (!container) return;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    camera = new THREE.PerspectiveCamera(
        45,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(1, 1.5, 3);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = false;
    controls.enableZoom = true;

    // Базовое освещение
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const mainLight = new THREE.DirectionalLight(0xffffff, 1);
    mainLight.position.set(2, 2, 2);
    scene.add(mainLight);
    const backLight = new THREE.DirectionalLight(0xcccccc, 0.5);
    backLight.position.set(-2, 0, -2);
    scene.add(backLight);

    // Группа для моделей – её мы будем очищать при загрузке новой
    modelGroup = new THREE.Group();
    scene.add(modelGroup);

    window.addEventListener('resize', onWindowResize);
    animate();
}

// Адаптация размера холста под контейнер
function onWindowResize() {
    const container = document.getElementById("model-container");
    if (!container || !camera || !renderer) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

// Загружает .glb или, в тестовом режиме/при ошибке, создаёт куб
    export function loadModel(url) {
        while (modelGroup.children.length > 0) {
            modelGroup.remove(modelGroup.children[0]);
        }

        if (TOUR_DATA.testMode || !url) {
            createPlaceholderModel();
            return;
        }

        const loader = new GLTFLoader();
        
        // Важно: используем полный путь от корня сервера
        const fullUrl = url.startsWith('http') ? url : url;
        
        loader.load(
            fullUrl,
            (gltf) => {
                modelGroup.add(gltf.scene);
            },
            undefined,
            (error) => {
                console.error("Ошибка загрузки GLB:", error);
                createPlaceholderModel();
            }
        );
    }

// Создаёт простой куб для тестового режима
function createPlaceholderModel() {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
        color: 0x44aa88,
        emissive: 0x224433
    });
    const cube = new THREE.Mesh(geometry, material);
    cube.rotation.x = 0.3;
    cube.rotation.y = 0.5;
    modelGroup.add(cube);
}

// Анимационный цикл
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}