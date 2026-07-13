// api/import.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Метод не поддерживается'
        });
    }

    try {
        const { table = 'tracks', data } = req.body;

        if (!data || data.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Нет данных для импорта'
            });
        }

        console.log('📥 Импорт данных:', {
            table,
            count: data.length,
            firstRow: data[0]
        });

        // Вставляем данные
        const { data: inserted, error } = await supabase
            .from(table)
            .insert(data)
            .select();

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                details: error
            });
        }

        console.log('✅ Импортировано:', inserted?.length);

        return res.status(200).json({
            success: true,
            imported: inserted?.length || 0,
            data: inserted
        });

    } catch (error) {
        console.error('❌ Import error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Внутренняя ошибка сервера',
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}