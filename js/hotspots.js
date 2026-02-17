// ============================================
// hotspots.js – визуальные метки (спрайты-иконки) и тултипы
// ============================================
import * as THREE from 'three';
import { loadRoom } from './panorama.js';
import { openModal } from './modal.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let hotspotObjects = [];
let tooltipSprite = null;

// Создание текстуры-иконки (п.1)
function createIconTexture(type) {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // Фон: круг с градиентом, полупрозрачный
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    if (type === 'info') {
        gradient.addColorStop(0, 'rgba(76, 175, 80, 0.9)');
        gradient.addColorStop(1, 'rgba(46, 125, 50, 0.9)');
    } else {
        gradient.addColorStop(0, 'rgba(33, 150, 243, 0.9)');
        gradient.addColorStop(1, 'rgba(13, 71, 161, 0.9)');
    }
    ctx.beginPath();
    ctx.arc(32, 32, 28, 0, 2 * Math.PI);
    ctx.fillStyle = gradient;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Иконка-символ
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (type === 'info') {
        ctx.fillText('i', 32, 32);
    } else {
        ctx.fillText('➤', 32, 34);
    }

    return new THREE.CanvasTexture(canvas);
}

// Создание текстуры для тултипа (п.3)
function createTooltipTexture(text) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 48;
    ctx.fillStyle = 'rgba(20,20,20,0.85)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    return new THREE.CanvasTexture(canvas);
}

export function createHotspots(scene, hotspots, camera, renderer) {
    // Удаляем старые метки и тултип
    hotspotObjects.forEach(obj => scene.remove(obj));
    if (tooltipSprite) {
        scene.remove(tooltipSprite);
        tooltipSprite = null;
    }
    hotspotObjects = [];

    // Создаём новые метки (спрайты)
    hotspots.forEach(h => {
        const texture = createIconTexture(h.type);
        const material = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });
        const sprite = new THREE.Sprite(material);
        sprite.position.set(...h.position);
        sprite.scale.set(40, 40, 1);
        sprite.userData = h;

        scene.add(sprite);
        hotspotObjects.push(sprite);
    });

    // --- Тултипы при наведении (п.3) ---
    const onMouseMove = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(hotspotObjects);

         if (intersects.length > 0) {
            renderer.domElement.style.cursor = 'pointer';
        } else {
            renderer.domElement.style.cursor = 'default';
        }

        if (tooltipSprite) {
            scene.remove(tooltipSprite);
            tooltipSprite = null;
        }

        if (intersects.length > 0) {
            const data = intersects[0].object.userData;
            const text = data.title || (data.type === 'nav' ? `→ ${data.target}` : 'ℹ️ Подробнее');
            const texture = createTooltipTexture(text);
            const material = new THREE.SpriteMaterial({
                map: texture,
                depthTest: false,
                depthWrite: false
            });
            const sprite = new THREE.Sprite(material);
            // Позиция над меткой
            sprite.position.copy(intersects[0].object.position.clone().add(new THREE.Vector3(0, 35, 0)));
            sprite.scale.set(180, 34, 1);
            scene.add(sprite);
            tooltipSprite = sprite;
        }
    };

    const onMouseLeave = () => {
        if (tooltipSprite) {
            scene.remove(tooltipSprite);
            tooltipSprite = null;
        }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('mouseleave', onMouseLeave);

    // --- Клик по метке ---
    renderer.domElement.onclick = (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(hotspotObjects);

        if (intersects.length > 0) {
            const data = intersects[0].object.userData;
            if (data.type === 'nav') {
                loadRoom(data.target);
            } else if (data.type === 'info') {
                openModal(data, hotspots); 
            }
        }
    };
}