// ============================================
// server.js – простой HTTP-сервер для офлайн-тура
// Запуск: node server.js
// ============================================

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json'
};

const server = http.createServer((req, res) => {
    console.log('Запрос:', req.url);

    // Безопасность: предотвращаем выход за пределы папки
    let filePath = path.join(__dirname, req.url);
    
    // Проверяем, не вышли ли мы за пределы
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    // Если запрос корневой - отдаём index.html
    if (filePath === __dirname || req.url === '/') {
        filePath = path.join(__dirname, 'index.html');
    }

    // Определяем MIME-тип
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'text/plain';

    // Читаем файл и отдаём
    fs.readFile(filePath, (err, data) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // Файл не найден
                res.writeHead(404);
                res.end('File not found');
            } else {
                // Другая ошибка
                res.writeHead(500);
                res.end('Server error');
            }
        } else {
            // Успех - отдаём файл
            res.writeHead(200, { 
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*'  // CORS для .glb
            });
            res.end(data);
        }
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log('=================================');
    console.log('🚀 ТЕХНОПАРК 360 - СЕРВЕР ЗАПУЩЕН');
    console.log('=================================');
    console.log('📍 Открой в браузере:');
    console.log(`   http://localhost:${PORT}`);
    console.log('   http://127.0.0.1:' + PORT);
    console.log('=================================');
    console.log('🛑 Для остановки нажми Ctrl+C');
});