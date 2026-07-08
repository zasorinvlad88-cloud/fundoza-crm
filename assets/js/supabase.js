const SUPABASE_URL = "https://hyjclbhebdrtljlemstv.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh5amNsYmhlYmRydGxqbGVtc3R2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0NzEyMDYsImV4cCI6MjA5OTA0NzIwNn0.hEc6K93MOe5q0U-hBdIk3rV1rO1m6d8zGsVezQ6i5aY";

const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);