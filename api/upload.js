// api/upload.js
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // Используйте service_role для загрузки
);

export const config = {
    api: {
        bodyParser: false // Отключаем для multer
    }
};

const upload = multer({ storage: multer.memoryStorage() });

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        // Получаем файл
        const file = await new Promise((resolve, reject) => {
            upload.single('file')(req, res, (err) => {
                if (err) reject(err);
                else resolve(req.file);
            });
        });
        
        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Генерируем имя файла
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        
        // Загружаем в Supabase Storage
        const { data, error } = await supabase
            .storage
            .from('tracks')
            .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: '3600'
            });
        
        if (error) throw error;
        
        // Получаем публичный URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('tracks')
            .getPublicUrl(fileName);
        
        res.status(200).json({
            success: true,
            fileUrl: publicUrl
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: error.message });
    }
}