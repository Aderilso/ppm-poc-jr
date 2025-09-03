-- Script para consolidar entrevistas separadas em uma única entrevista completa
-- Problema: Cada formulário foi salvo em uma entrevista separada

-- Verificar dados atuais
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

-- ESTRATÉGIA 1: Consolidar na primeira entrevista (cmf40aut - tem F1)
-- Copiar F2 da segunda entrevista (cmf40brb)
-- Copiar F3 da terceira entrevista (cmf40cg6)

-- Atualizar primeira entrevista com F2
UPDATE interviews 
SET f2Answers = (
    SELECT f2Answers 
    FROM interviews 
    WHERE id = 'cmf40brb'
)
WHERE id = 'cmf40aut';

-- Atualizar primeira entrevista com F3
UPDATE interviews 
SET f3Answers = (
    SELECT f3Answers 
    FROM interviews 
    WHERE id = 'cmf40cg6'
)
WHERE id = 'cmf40aut';

-- Marcar primeira entrevista como concluída
UPDATE interviews 
SET 
    isCompleted = 1,
    completedAt = datetime('now')
WHERE id = 'cmf40aut';

-- Verificar resultado da consolidação
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
WHERE id = 'cmf40aut';

-- Opcional: Deletar entrevistas separadas após consolidação
-- DELETE FROM interviews WHERE id IN ('cmf40brb', 'cmf40cg6');
