@echo off
title Технопарк 360 - Сервер
cd /d %~dp0

start http://localhost:8000
.\node\node.exe server.js

pause