# ============================================
# server.py – простой HTTP-сервер для офлайн-тура
# Запуск: python server.py
# ============================================

import http.server
import socketserver
import os
import mimetypes

PORT = 8000

# Добавляем поддержку MIME-типов для .glb и .gltf
mimetypes.add_type('model/gltf-binary', '.glb')
mimetypes.add_type('model/gltf+json', '.gltf')

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Добавляем CORS-заголовок для доступа с других устройств
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def do_GET(self):
        # Перенаправляем корневой запрос на index.html
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

if __name__ == '__main__':
    # Убеждаемся, что мы в правильной директории (там, где лежит server.py)
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    handler = CustomHTTPRequestHandler
    with socketserver.TCPServer(("0.0.0.0", PORT), handler) as httpd:
        print("=================================")
        print("🚀 ТЕХНОПАРК 360 - СЕРВЕР ЗАПУЩЕН (Python)")
        print("=================================")
        print(f"📍 Открой в браузере: http://localhost:{PORT}")
        print(f"   http://127.0.0.1:{PORT}")
        print("   Для доступа с других устройств используйте IP-адрес этого компьютера")
        print("=================================")
        print("🛑 Для остановки нажми Ctrl+C")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nСервер остановлен.")