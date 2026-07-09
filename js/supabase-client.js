// js/supabase-client.js
const SUPABASE_URL = 'https://fundoza-crm-y11w.vercel.app/';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5amNsYmhlYmRydGxqbGVtc3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NzEyMDYsImV4cCI6MjA5OTA0NzIwNn0.hEc6K93MOe5q0U-hBdIk3rV1rO1m6d8zGsVezQ6i5aY';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Таблицы в Supabase:
// tracks (id, name, duration, tags, file_url, created_at)
// playlists (id, name, created_at)
// playlist_tracks (playlist_id, track_id)
// groups (id, name, created_at)
// group_contacts (group_id, contact_email)
// mailings (id, track_ids[], playlist_id, group_id, status, sent_at)