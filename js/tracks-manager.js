// js/tracks-manager.js
// Загрузка файлов
document.getElementById('fileInput').addEventListener('change', async function(e) {
    const files = e.target.files;
    if (!files.length) return;

    for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Загрузка через Vercel Serverless
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            
            if (result.success) {
                // Добавляем трек в Supabase
                await supabase
                    .from('tracks')
                    .insert([{
                        name: file.name.replace(/\.[^.]+$/, ''),
                        duration: '3:00', // Можно вычислить через AudioContext
                        tags: 'новый',
                        file_url: result.fileUrl
                    }]);
            }
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            showToast('❌ Ошибка загрузки файла');
        }
    }
    
    // Обновляем таблицу
    window.tracksTable.ajax.reload();
    showToast(`✅ Загружено ${files.length} треков`);
});

// Удаление трека
window.deleteTrack = async function(id) {
    if (!confirm('Удалить трек?')) return;
    
    try {
        await supabase
            .from('tracks')
            .delete()
            .eq('id', id);
        
        window.tracksTable.ajax.reload();
        showToast('🗑️ Трек удален');
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showToast('❌ Ошибка удаления');
    }
};

// Удаление выбранных
async function deleteSelectedTracks() {
    const ids = $('.track-select:checked').map(function() {
        return $(this).data('id');
    }).get();
    
    if (!ids.length) {
        showToast('ℹ️ Выберите треки для удаления');
        return;
    }
    
    if (!confirm(`Удалить ${ids.length} треков?`)) return;
    
    try {
        await supabase
            .from('tracks')
            .delete()
            .in('id', ids);
        
        window.tracksTable.ajax.reload();
        showToast(`🗑️ Удалено ${ids.length} треков`);
    } catch (error) {
        console.error('Ошибка удаления:', error);
        showToast('❌ Ошибка удаления');
    }
}