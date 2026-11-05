-- 02-seed.sql — dados FICTÍCIOS de teste
-- Autor: Bruno Silveira · Unifeg 2026B
-- ON CONFLICT torna o script idempotente: rodar duas vezes não duplica nada.

INSERT INTO alunos (nome, ra, curso, periodo) VALUES
    ('Helena Martins',   'BS2026-001', 'Ciência da Computação',  8),
    ('Rafael Quintino',  'BS2026-002', 'Ciência da Computação',  8),
    ('Marina Tavares',   'BS2026-003', 'Ciência da Computação',  6),
    ('Otávio Rezende',   'BS2026-004', 'Sistemas de Informação', 4),
    ('Luíza Fonseca',    'BS2026-005', 'Engenharia de Software', 2)
ON CONFLICT (ra) DO NOTHING;
