@echo off
cd /d "%~dp0"
if "%TIDE_ISSUER%"=="" echo Please set TIDE_ISSUER first. See SETUP_VI.md
if "%TIDE_AUDIENCE%"=="" echo Please set TIDE_AUDIENCE first. See SETUP_VI.md
python -m pip install -r api\requirements.txt
python -m uvicorn api.server:app --host 127.0.0.1 --port 8000
pause
