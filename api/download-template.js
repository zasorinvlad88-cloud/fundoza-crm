// api/download-template.js
import XLSX from 'xlsx';

export default async function handler(req, res) {
    try {
        // Создаем данные
        const data = [
            ['name', 'artist', 'album', 'duration', 'genre', 'year', 'tags', 'email', 'phone'],
            ['Название трека', 'Исполнитель', 'Альбом', '3:45', 'Rock', '2024', 'рок, альтернатива', 'artist@example.com', '+79001234567'],
            ['Пример трека 2', 'Исполнитель 2', 'Альбом 2', '4:20', 'Pop', '2023', 'поп, диско', 'demo2@example.com', '+79001234568'],
        ];
        
        // Создаем Excel
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        ws['!cols'] = [
            { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 12 },
            { wch: 15 }, { wch: 10 }, { wch: 30 }, { wch: 25 }, { wch: 18 }
        ];
        XLSX.utils.book_append_sheet(wb, ws, 'Tracks');
        
        // Генерируем буфер
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        // Отправляем файл
        res.setHeader('Content-Disposition', 'attachment; filename=music_crm_template.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}