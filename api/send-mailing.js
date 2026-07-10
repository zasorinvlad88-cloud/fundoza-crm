// api/send-mailing.js
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Настройка SMTP (можно использовать SendGrid, Mailgun и т.д.)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { mailingId, trackIds, playlistId, groupId, contacts } = req.body;
        
        // Получаем информацию о треках
        const { data: tracks } = await supabase
            .from('tracks')
            .select('name, file_url')
            .in('id', trackIds);
        
        // Формируем письмо
        const trackList = tracks.map(t => 
            `<li><a href="${t.file_url}">${t.name}</a></li>`
        ).join('');
        
        const html = `
            <h2>Новые треки в плейлисте!</h2>
            <p>Вам доступны следующие треки:</p>
            <ul>${trackList}</ul>
            <p>Слушайте с удовольствием!</p>
        `;
        
        // Отправляем каждому контакту
        const sendPromises = contacts.map(email => {
            return transporter.sendMail({
                from: process.env.SMTP_FROM,
                to: email,
                subject: '🎵 Новые музыкальные треки',
                html: html
            });
        });
        
        await Promise.all(sendPromises);
        
        res.status(200).json({
            success: true,
            message: `Отправлено ${contacts.length} писем`
        });
    } catch (error) {
        console.error('Mailing error:', error);
        res.status(500).json({ error: error.message });
    }
}