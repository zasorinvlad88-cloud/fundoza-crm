// api/import.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    // Только POST запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Method not allowed' 
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
        
        // Проверяем, есть ли обязательные поля
        const requiredFields = ['name'];
        const missingFields = requiredFields.filter(field => {
            return !data.some(row => row[field] && row[field].trim() !== '');
        });
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                success: false,
                error: `Отсутствуют обязательные поля: ${missingFields.join(', ')}`
            });
        }
        
        // Вставляем данные в Supabase
        const { data: inserted, error } = await supabase
            .from(table)
            .insert(data)
            .select();
        
        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({
                success: false,
                error: error.message
            });
        }
        
        return res.status(200).json({
            success: true,
            imported: inserted?.length || 0,
            data: inserted
        });
        
    } catch (error) {
        console.error('Import error:', error);
        return res.status(500).json({
            success: false,
            error: error.message
        });
    }
}