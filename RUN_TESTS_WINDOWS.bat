@echo off
cd /d "%~dp0"
python -m pip install -r api\requirements.txt
python -m pytest api\tests -q
node --check src\main.js
npm install
npm run build
pause
