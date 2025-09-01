@echo off
chcp 65001 >nul
echo 🔄 REINICIANDO SISTEMA PPM
echo ================================

echo.
echo 🛑 Parando processos existentes...

REM Parar processos Node.js
taskkill /f /im node.exe >nul 2>&1
echo ✅ Processos Node.js parados

REM Aguardar
timeout /t 2 /nobreak >nul

echo.
echo 🚀 Iniciando backend...
cd server
start "Backend PPM" cmd /k "npm run dev"
cd ..

REM Aguardar backend inicializar
echo ⏳ Aguardando backend inicializar...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 Iniciando frontend...
start "Frontend PPM" cmd /k "npm run dev"

echo.
echo ✅ SISTEMA REINICIADO!
echo ================================
echo.
echo 🔗 URLs:
echo - Frontend: http://localhost:8080 (ou 8081)
echo - Backend: http://localhost:3001
echo - Prisma Studio: http://localhost:5555
echo.
echo 📋 Verificar status: execute diagnostico.bat
echo.
pause
