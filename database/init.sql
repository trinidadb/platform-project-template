CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    active BOOLEAN NOT NULL,
    birth_date DATE
);

INSERT INTO users (id, name, email, active, birth_date)
VALUES 
    ('994fc575-dc38-4718-9fc5-6a23c0ae0832', 'John Doe', 'john.doe@example.com', true, '1995-11-15'),
    ('af488024-dc38-4718-9fc5-6a23c0ae0832', 'Test name', 'test@example.com', true, '2000-10-10');