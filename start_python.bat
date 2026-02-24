@echo off
title Технопарк 360 - Python-сервер
cd /d %~dp0

:: Проверяем, доступен ли Python в системе
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo Python не найден в PATH. Установите Python или используйте Node.js сервер.
    pause
    exit /b
)

:: Открываем страницу в браузере
start http://localhost:8000

:: Запускаем Python-сервер
python server.py

pause