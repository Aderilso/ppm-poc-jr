#!/bin/bash

echo "🔍 DIAGNÓSTICO ESPECÍFICO DO DASHBOARD"
echo "========================================"
echo ""

# Verificar se o backend está rodando
echo "1. 🔌 Verificando backend..."
if lsof -i :3001 &> /dev/null; then
    echo "   ✅ Backend rodando na porta 3001"
else
    echo "   ❌ Backend NÃO está rodando na porta 3001"
    echo "   🔧 SOLUÇÃO: Execute 'cd server && npm run dev'"
    exit 1
fi

# Verificar se o frontend está rodando
echo ""
echo "2. 🌐 Verificando frontend..."
if lsof -i :8080 &> /dev/null; then
    echo "   ✅ Frontend rodando na porta 8080"
else
    echo "   ❌ Frontend NÃO está rodando na porta 8080"
    echo "   🔧 SOLUÇÃO: Execute 'npm run dev'"
    exit 1
fi

# Testar API de entrevistas
echo ""
echo "3. 📊 Testando API de entrevistas..."
response=$(curl -s -w "%{http_code}" http://localhost:3001/api/interviews)
http_code="${response: -3}"
content="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "   ✅ API responde corretamente (HTTP $http_code)"
    interview_count=$(echo "$content" | jq '. | length' 2>/dev/null || echo "0")
    echo "   📈 Total de entrevistas: $interview_count"
    
    if [ "$interview_count" -gt 0 ]; then
        echo "   ✅ Há dados para exibir no Dashboard"
        
        # Verificar estrutura dos dados
        echo ""
        echo "4. 🔍 Analisando estrutura dos dados..."
        first_interview=$(echo "$content" | jq '.[0]' 2>/dev/null)
        
        if [ "$first_interview" != "null" ]; then
            echo "   ✅ Estrutura de dados válida"
            
            # Verificar campos importantes
            has_f1=$(echo "$first_interview" | jq '.f1Answers != null' 2>/dev/null)
            has_f2=$(echo "$first_interview" | jq '.f2Answers != null' 2>/dev/null)
            has_f3=$(echo "$first_interview" | jq '.f3Answers != null' 2>/dev/null)
            is_completed=$(echo "$first_interview" | jq '.isCompleted' 2>/dev/null)
            
            echo "   📋 F1 Answers: $has_f1"
            echo "   📋 F2 Answers: $has_f2"
            echo "   📋 F3 Answers: $has_f3"
            echo "   ✅ Completed: $is_completed"
            
        else
            echo "   ⚠️ Estrutura de dados pode estar corrompida"
        fi
    else
        echo "   ⚠️ Nenhuma entrevista encontrada"
        echo "   💡 Crie algumas entrevistas primeiro"
    fi
else
    echo "   ❌ API não responde corretamente (HTTP $http_code)"
    echo "   🔧 SOLUÇÃO: Verifique se o backend está configurado"
fi

# Testar API de health
echo ""
echo "5. 🏥 Testando health check..."
health_response=$(curl -s http://localhost:3001/api/health)
if [ $? -eq 0 ]; then
    echo "   ✅ Health check OK: $health_response"
else
    echo "   ❌ Health check falhou"
fi

# Verificar banco de dados
echo ""
echo "6. 🗄️ Verificando banco de dados..."
if [ -f "server/prisma/dev.db" ]; then
    echo "   ✅ Banco de dados encontrado"
    db_size=$(du -h server/prisma/dev.db | cut -f1)
    echo "   📊 Tamanho: $db_size"
else
    echo "   ❌ Banco de dados não encontrado"
    echo "   🔧 SOLUÇÃO: Execute './setup-database.sh'"
fi

# Verificar logs do backend
echo ""
echo "7. 📝 Verificando logs do backend..."
if [ -f "backend.log" ]; then
    echo "   ✅ Log do backend encontrado"
    echo "   📋 Últimas linhas do log:"
    tail -5 backend.log 2>/dev/null || echo "   ⚠️ Não foi possível ler o log"
else
    echo "   ⚠️ Log do backend não encontrado"
fi

# Verificar console do navegador
echo ""
echo "8. 🌐 Verificando console do navegador..."
echo "   📋 Abra o navegador em: http://localhost:8080/dashboard"
echo "   📋 Pressione F12 para abrir o console"
echo "   📋 Verifique se há erros em vermelho"

# Testar acesso direto ao Dashboard
echo ""
echo "9. 🎯 Testando acesso ao Dashboard..."
dashboard_response=$(curl -s -w "%{http_code}" http://localhost:8080/dashboard)
dashboard_http_code="${dashboard_response: -3}"

if [ "$dashboard_http_code" = "200" ]; then
    echo "   ✅ Dashboard acessível via HTTP"
else
    echo "   ⚠️ Dashboard pode ter problemas (HTTP $dashboard_http_code)"
fi

echo ""
echo "========================================"
echo "📋 RESUMO DO DIAGNÓSTICO"
echo "========================================"

if lsof -i :3001 &> /dev/null && lsof -i :8080 &> /dev/null; then
    if [ "$http_code" = "200" ] && [ "$interview_count" -gt 0 ]; then
        echo "✅ SISTEMA FUNCIONANDO CORRETAMENTE"
        echo "   - Backend: OK"
        echo "   - Frontend: OK"
        echo "   - API: OK"
        echo "   - Dados: $interview_count entrevistas"
        echo ""
        echo "🔧 SE O DASHBOARD AINDA NÃO FUNCIONA:"
        echo "   1. Limpe o cache do navegador (Ctrl+F5)"
        echo "   2. Verifique o console do navegador (F12)"
        echo "   3. Tente acessar: http://localhost:8080/dashboard"
    else
        echo "⚠️ SISTEMA PARCIALMENTE FUNCIONANDO"
        echo "   - Backend: OK"
        echo "   - Frontend: OK"
        echo "   - API: $http_code"
        echo "   - Dados: $interview_count entrevistas"
        echo ""
        echo "🔧 PRÓXIMOS PASSOS:"
        echo "   1. Crie algumas entrevistas primeiro"
        echo "   2. Verifique se o banco está configurado"
        echo "   3. Execute: cd server && npx prisma studio"
    fi
else
    echo "❌ SISTEMA NÃO FUNCIONANDO"
    echo "   - Backend: $(lsof -i :3001 &> /dev/null && echo "OK" || echo "FALHOU")"
    echo "   - Frontend: $(lsof -i :8080 &> /dev/null && echo "OK" || echo "FALHOU")"
    echo ""
    echo "🔧 SOLUÇÃO:"
    echo "   1. Execute: ./setup-completo.sh"
    echo "   2. Ou reinicie manualmente:"
    echo "      - Backend: cd server && npm run dev"
    echo "      - Frontend: npm run dev"
fi

echo ""
echo "📞 Para mais ajuda, consulte: TROUBLESHOOTING.md"
