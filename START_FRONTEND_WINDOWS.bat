@echo off
cd /d "%~dp0"
where node >nul 2>nul || (echo Install Node.js 22.12+ first. & pause & exit /b 1)
call npm install
if errorlevel 1 (echo Could not install Node dependencies. & pause & exit /b 1)
call npm run dev
pause
