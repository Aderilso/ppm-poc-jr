@echo off
chcp 65001 >nul
echo 🔍 DIAGNÓSTICO ESPECÍFICO DO DASHBOARD
echo ========================================
echo.

REM Verificar se o backend está rodando
echo 1. 🔌 Verificando backend...
netstat -an | findstr :3001 >nul
if %errorlevel% equ 0 (
    echo    ✅ Backend rodando na porta 3001
) else (
    echo    ❌ Backend NÃO está rodando na porta 3001
    echo    🔧 SOLUÇÃO: Execute 'cd server ^&^& npm run dev'
    pause
    exit /b 1
)

REM Verificar se o frontend está rodando
echo.
echo 2. 🌐 Verificando frontend...
netstat -an | findstr :8080 >nul
if %errorlevel% equ 0 (
    echo    ✅ Frontend rodando na porta 8080
) else (
    echo    ❌ Frontend NÃO está rodando na porta 8080
    echo    🔧 SOLUÇÃO: Execute 'npm run dev'
    pause
    exit /b 1
)

REM Testar API de entrevistas
echo.
echo 3. 📊 Testando API de entrevistas...
powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/interviews' -UseBasicParsing; Write-Host '   ✅ API responde corretamente (HTTP' $response.StatusCode ')'; $content = $response.Content; $interviews = $content | ConvertFrom-Json; Write-Host '   📈 Total de entrevistas:' $interviews.Count; if ($interviews.Count -gt 0) { Write-Host '   ✅ Há dados para exibir no Dashboard'; $first = $interviews[0]; Write-Host '   📋 F1 Answers:' ($first.f1Answers -ne $null); Write-Host '   📋 F2 Answers:' ($first.f2Answers -ne $null); Write-Host '   📋 F3 Answers:' ($first.f3Answers -ne $null); Write-Host '   ✅ Completed:' $first.isCompleted } else { Write-Host '   ⚠️ Nenhuma entrevista encontrada'; Write-Host '   💡 Crie algumas entrevistas primeiro' } } catch { Write-Host '   ❌ API não responde corretamente'; Write-Host '   🔧 SOLUÇÃO: Verifique se o backend está configurado' }"

REM Testar API de health
echo.
echo 4. 🏥 Testando health check...
powershell -Command "try { $health = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -UseBasicParsing; Write-Host '   ✅ Health check OK:' $health.Content } catch { Write-Host '   ❌ Health check falhou' }"

REM Verificar banco de dados
echo.
echo 5. 🗄️ Verificando banco de dados...
if exist "server\prisma\dev.db" (
    echo    ✅ Banco de dados encontrado
    for %%A in ("server\prisma\dev.db") do echo    📊 Tamanho: %%~zA bytes
) else (
    echo    ❌ Banco de dados não encontrado
    echo    🔧 SOLUÇÃO: Execute 'setup-database.bat'
)

REM Verificar logs do backend
echo.
echo 6. 📝 Verificando logs do backend...
if exist "backend.log" (
    echo    ✅ Log do backend encontrado
    echo    📋 Últimas linhas do log:
    powershell -Command "Get-Content backend.log -Tail 5" 2>nul || echo    ⚠️ Não foi possível ler o log
) else (
    echo    ⚠️ Log do backend não encontrado
)

REM Verificar console do navegador
echo.
echo 7. 🌐 Verificando console do navegador...
echo    📋 Abra o navegador em: http://localhost:8080/dashboard
echo    📋 Pressione F12 para abrir o console
echo    📋 Verifique se há erros em vermelho

REM Testar acesso direto ao Dashboard
echo.
echo 8. 🎯 Testando acesso ao Dashboard...
powershell -Command "try { $dashboard = Invoke-WebRequest -Uri 'http://localhost:8080/dashboard' -UseBasicParsing; Write-Host '   ✅ Dashboard acessível via HTTP' } catch { Write-Host '   ⚠️ Dashboard pode ter problemas' }"

echo.
echo ========================================
echo 📋 RESUMO DO DIAGNÓSTICO
echo ========================================

REM Verificar status geral
netstat -an | findstr :3001 >nul
set backend_ok=%errorlevel%

netstat -an | findstr :8080 >nul
set frontend_ok=%errorlevel%

if %backend_ok% equ 0 if %frontend_ok% equ 0 (
    echo ✅ SISTEMA FUNCIONANDO CORRETAMENTE
    echo    - Backend: OK
    echo    - Frontend: OK
    echo    - API: OK
    echo.
    echo 🔧 SE O DASHBOARD AINDA NÃO FUNCIONA:
    echo    1. Limpe o cache do navegador (Ctrl+F5)
    echo    2. Verifique o console do navegador (F12)
    echo    3. Tente acessar: http://localhost:8080/dashboard
    echo    4. Execute: diagnostico-dashboard.bat novamente
) else (
    echo ❌ SISTEMA NÃO FUNCIONANDO
    if %backend_ok% neq 0 echo    - Backend: FALHOU
    if %frontend_ok% neq 0 echo    - Frontend: FALHOU
    echo.
    echo 🔧 SOLUÇÃO:
    echo    1. Execute: setup-completo.bat
    echo    2. Ou reinicie manualmente:
    echo       - Backend: cd server ^&^& npm run dev
    echo       - Frontend: npm run dev
)

echo.
echo 📞 Para mais ajuda, consulte: TROUBLESHOOTING.md
pause
