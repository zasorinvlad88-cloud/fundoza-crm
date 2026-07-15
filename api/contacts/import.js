// api/contacts/import.js
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
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
        const { contacts } = req.body;

        if (!contacts || contacts.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Нет контактов для импорта'
            });
        }

        console.log(`📥 Импорт ${contacts.length} контактов...`);

        // Вставляем данные (обновляем при конфликте по email)
        const { data, error } = await supabase
            .from('contacts')
            .upsert(contacts, { 
                onConflict: 'email',
                ignoreDuplicates: false 
            })
            .select();

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                success: false,
                error: error.message,
                details: error
            });
        }

        console.log(`✅ Импортировано ${data?.length || 0} контактов`);

        return res.status(200).json({
            success: true,
            imported: data?.length || 0,
            data: data
        });

    } catch (error) {
        console.error('❌ Import error:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Внутренняя ошибка сервера'
        });
    }
}