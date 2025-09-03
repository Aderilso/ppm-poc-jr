-- Script para atualizar status das entrevistas diretamente no banco
-- Atualiza entrevistas que têm F1, F2 e F3 preenchidos para status CONCLUÍDA

-- Verificar entrevistas existentes e seus status
SELECT 
    id,
    isCompleted,
    CASE 
        WHEN f1Answers IS NOT NULL AND f1Answers != '' THEN 'F1: PREENCHIDO'
        ELSE 'F1: VAZIO'
    END as f1_status,
    CASE 
        WHEN f2Answers IS NOT NULL AND f2Answers != '' THEN 'F2: PREENCHIDO'
        ELSE 'F2: VAZIO'
    END as f2_status,
    CASE 
        WHEN f3Answers IS NOT NULL AND f3Answers != '' THEN 'F3: PREENCHIDO'
        ELSE 'F3: VAZIO'
    END as f3_status,
    respondentName,
    respondentDepartment
FROM interviews;

-- Atualizar entrevistas que têm todos os formulários preenchidos
UPDATE interviews 
SET 
    isCompleted = 1,
    completedAt = datetime('now')
WHERE 
    f1Answers IS NOT NULL 
    AND f1Answers != '' 
    AND f2Answers IS NOT NULL 
    AND f2Answers != '' 
    AND f3Answers IS NOT NULL 
    AND f3Answers != ''
    AND isCompleted = 0;

-- Verificar resultado da atualização
SELECT 
    id,
    isCompleted,
    completedAt,
    CASE 
        WHEN f1Answers IS NOT NULL AND f1Answers != '' THEN 'F1: PREENCHIDO'
        ELSE 'F1: VAZIO'
    END as f1_status,
    CASE 
        WHEN f2Answers IS NOT NULL AND f2Answers != '' THEN 'F2: PREENCHIDO'
        ELSE 'F2: VAZIO'
    END as f2_status,
    CASE 
        WHEN f3Answers IS NOT NULL AND f3Answers != '' THEN 'F3: PREENCHIDO'
        ELSE 'F3: VAZIO'
    END as f3_status,
    respondentName,
    respondentDepartment
FROM interviews
ORDER BY isCompleted DESC, createdAt DESC;
