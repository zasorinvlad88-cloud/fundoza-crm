-- ============================================================
-- ПОЛНОЕ ВОССТАНОВЛЕНИЕ БАЗЫ ДАННЫХ MUSIC CRM
-- ============================================================

-- Включаем UUID расширение
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ТАБЛИЦА ТРЕКОВ (основная)
-- ============================================================

DROP TABLE IF EXISTS tracks CASCADE;
CREATE TABLE tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    artist TEXT,
    album TEXT,
    duration TEXT,
    genre TEXT,
    year INTEGER,
    tags TEXT,
    bpm INTEGER,
    key TEXT,
    mood TEXT,
    description TEXT,
    file_url TEXT,
    plays INTEGER DEFAULT 0,
    upload_date TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Индексы для быстрого поиска
CREATE INDEX idx_tracks_name ON tracks(name);
CREATE INDEX idx_tracks_artist ON tracks(artist);
CREATE INDEX idx_tracks_genre ON tracks(genre);
CREATE INDEX idx_tracks_created_at ON tracks(created_at);

-- ============================================================
-- 2. ТАБЛИЦА КОНТАКТОВ
-- ============================================================

DROP TABLE IF EXISTS contacts CASCADE;
CREATE TABLE contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    company TEXT,
    position TEXT,
    source TEXT,
    status TEXT DEFAULT 'pending',
    subscribed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_contacts_email ON contacts(email);
CREATE INDEX idx_contacts_status ON contacts(status);

-- ============================================================
-- 3. ТАБЛИЦА ПЛЕЙЛИСТОВ
-- ============================================================

DROP TABLE IF EXISTS playlists CASCADE;
CREATE TABLE playlists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    cover_url TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 4. СВЯЗЬ ПЛЕЙЛИСТОВ И ТРЕКОВ
-- ============================================================

DROP TABLE IF EXISTS playlist_tracks CASCADE;
CREATE TABLE playlist_tracks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    playlist_id UUID REFERENCES playlists(id) ON DELETE CASCADE,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    position INTEGER DEFAULT 0,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(playlist_id, track_id)
);

CREATE INDEX idx_playlist_tracks_playlist ON playlist_tracks(playlist_id);
CREATE INDEX idx_playlist_tracks_track ON playlist_tracks(track_id);

-- ============================================================
-- 5. ТАБЛИЦА ГРУПП ПОЛУЧАТЕЛЕЙ
-- ============================================================

DROP TABLE IF EXISTS groups CASCADE;
CREATE TABLE groups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 6. СВЯЗЬ ГРУПП И КОНТАКТОВ
-- ============================================================

DROP TABLE IF EXISTS group_contacts CASCADE;
CREATE TABLE group_contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
    added_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(group_id, contact_id)
);

-- ============================================================
-- 7. ТАБЛИЦА РАССЫЛОК
-- ============================================================

DROP TABLE IF EXISTS mailings CASCADE;
CREATE TABLE mailings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    track_ids UUID[],
    playlist_id UUID REFERENCES playlists(id),
    group_id UUID REFERENCES groups(id),
    subject TEXT DEFAULT '🎵 Новые музыкальные треки',
    message TEXT,
    status TEXT DEFAULT 'pending',
    sent_by UUID,
    sent_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mailings_status ON mailings(status);
CREATE INDEX idx_mailings_sent_at ON mailings(sent_at);

-- ============================================================
-- 8. СТАТИСТИКА ПРОСЛУШИВАНИЙ
-- ============================================================

DROP TABLE IF EXISTS track_stats CASCADE;
CREATE TABLE track_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
    user_id UUID,
    ip_address TEXT,
    user_agent TEXT,
    played_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_track_stats_track ON track_stats(track_id);
CREATE INDEX idx_track_stats_played_at ON track_stats(played_at);

-- ============================================================
-- 9. ЛОГИ ИМПОРТА
-- ============================================================

DROP TABLE IF EXISTS import_logs CASCADE;
CREATE TABLE import_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename TEXT,
    rows_imported INTEGER,
    table_name TEXT,
    status TEXT DEFAULT 'success',
    error_message TEXT,
    imported_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- 10. НАЧАЛЬНЫЕ ДАННЫЕ (ДЕМО)
-- ============================================================

-- Добавляем демо-плейлисты
INSERT INTO playlists (name, description, is_public) VALUES
    ('Основной микс', 'Главный плейлист для рассылок', TRUE),
    ('Chill & Lo-fi', 'Спокойная музыка для релакса', TRUE),
    ('В работе', 'Треки на утверждении', FALSE);

-- Добавляем демо-группы
INSERT INTO groups (name, description) VALUES
    ('Премиум-подписчики', 'Платные подписчики с особыми привилегиями'),
    ('Ночной эфир', 'Слушатели ночных эфиров'),
    ('Тестовая группа', 'Для проверки рассылок');

-- Добавляем демо-контакты
INSERT INTO contacts (email, name, status) VALUES
    ('demo1@example.com', 'Иван Петров', 'pending'),
    ('demo2@example.com', 'Мария Смирнова', 'pending'),
    ('demo3@example.com', 'Алексей Иванов', 'pending');

-- Добавляем демо-треки
INSERT INTO tracks (name, artist, duration, genre, tags, plays) VALUES
    ('Neon Dreams', 'Synthwave Band', '3:24', 'Electronic', 'синтвейв, ретро', 0),
    ('Midnight Drive', 'Night Riders', '4:02', 'Synthwave', 'ночная атмосфера, 80-е', 0),
    ('Echoes', 'Ambient Masters', '2:58', 'Ambient', 'эмбиент, релакс', 0),
    ('Solar Flare', 'Space Sounds', '3:45', 'House', 'хаус, солнечный', 0),
    ('Deep Blue', 'Oceanic', '5:12', 'Downtempo', 'даунтемпо, чилл', 0),
    ('Velocity', 'Drum Code', '2:30', 'Drum & Bass', 'днб, энергичный', 0);

-- Связываем треки с плейлистом "Основной микс"
INSERT INTO playlist_tracks (playlist_id, track_id, position)
SELECT 
    (SELECT id FROM playlists WHERE name = 'Основной микс'),
    id,
    ROW_NUMBER() OVER (ORDER BY created_at)
FROM tracks
WHERE name IN ('Neon Dreams', 'Midnight Drive', 'Echoes');

-- Связываем контакты с группами
INSERT INTO group_contacts (group_id, contact_id)
SELECT 
    (SELECT id FROM groups WHERE name = 'Премиум-подписчики'),
    id
FROM contacts
WHERE email IN ('demo1@example.com', 'demo2@example.com');

INSERT INTO group_contacts (group_id, contact_id)
SELECT 
    (SELECT id FROM groups WHERE name = 'Ночной эфир'),
    id
FROM contacts
WHERE email IN ('demo2@example.com', 'demo3@example.com');

-- ============================================================
-- 11. ТРИГГЕРЫ И ФУНКЦИИ
-- ============================================================

-- Функция обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для всех таблиц с updated_at
CREATE TRIGGER update_tracks_updated_at 
BEFORE UPDATE ON tracks 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contacts_updated_at 
BEFORE UPDATE ON contacts 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_playlists_updated_at 
BEFORE UPDATE ON playlists 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mailings_updated_at 
BEFORE UPDATE ON mailings 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 12. ФУНКЦИЯ ДЛЯ СТАТИСТИКИ
-- ============================================================

-- Функция получения общей статистики
CREATE OR REPLACE FUNCTION get_stats()
RETURNS TABLE(
    total_tracks BIGINT,
    total_contacts BIGINT,
    total_playlists BIGINT,
    total_groups BIGINT,
    total_mailings_sent BIGINT,
    total_plays BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM tracks) AS total_tracks,
        (SELECT COUNT(*) FROM contacts) AS total_contacts,
        (SELECT COUNT(*) FROM playlists) AS total_playlists,
        (SELECT COUNT(*) FROM groups) AS total_groups,
        (SELECT COUNT(*) FROM mailings WHERE status = 'sent') AS total_mailings_sent,
        (SELECT SUM(plays) FROM tracks) AS total_plays;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 13. ПОЛИТИКИ БЕЗОПАСНОСТИ (RLS)
-- ============================================================

-- Включаем RLS
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE mailings ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_logs ENABLE ROW LEVEL SECURITY;

-- Создаём политики для анонимного доступа (для разработки)
-- В продакшене замените на более строгие политики

CREATE POLICY "Allow all for development" ON tracks FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON contacts FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON playlists FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON playlist_tracks FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON groups FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON group_contacts FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON mailings FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON track_stats FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON import_logs FOR ALL USING (true);

-- ============================================================
-- 14. НАСТРОЙКА STORAGE (для загрузки файлов)
-- ============================================================

-- Создаём bucket для треков
INSERT INTO storage.buckets (id, name, public) 
VALUES ('tracks', 'tracks', true)
ON CONFLICT (id) DO NOTHING;

-- Политики для storage
CREATE POLICY "Give all access to tracks" ON storage.objects
FOR ALL USING (bucket_id = 'tracks');

-- ============================================================
-- 15. ПРОВЕРКА СТРУКТУРЫ
-- ============================================================

-- Вывод всех таблиц
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Вывод всех колонок в tracks
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'tracks'
ORDER BY ordinal_position;

-- ============================================================
-- 16. ПРОВЕРКА ДАННЫХ
-- ============================================================

-- Проверка количества записей
SELECT 'tracks' as table_name, COUNT(*) as count FROM tracks
UNION ALL
SELECT 'contacts', COUNT(*) FROM contacts
UNION ALL
SELECT 'playlists', COUNT(*) FROM playlists
UNION ALL
SELECT 'groups', COUNT(*) FROM groups;

-- Проверка статистики
SELECT * FROM get_stats();