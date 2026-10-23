@echo off
cd /d "%~dp0dist"
start "" http://localhost:8080
python -m http.server 8080
