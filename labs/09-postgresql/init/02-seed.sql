INSERT INTO alunos (nome, ra, periodo) VALUES
    ('Ana Souza',    '2021001', 8),
    ('Bruno Lima',   '2021002', 8),
    ('Carla Prado',  '2021003', 8)
ON CONFLICT (ra) DO NOTHING;
