// js/mailing-engine.js
async function sendMailing() {
    const trackIds = $('.track-select:checked').map(function() {
        return $(this).data('id');
    }).get();
    
    if (!trackIds.length) {
        showToast('❌ Выберите хотя бы один трек');
        return;
    }
    
    // Получаем выбранный плейлист и группу
    const playlistId = $('#playlistSelect').val();
    const groupId = $('#groupSelect').val();
    
    if (!playlistId || !groupId) {
        showToast('❌ Выберите плейлист и группу');
        return;
    }
    
    // Проверяем, есть ли контакты в группе
    const { data: contacts, error } = await supabase
        .from('group_contacts')
        .select('contact_email')
        .eq('group_id', groupId);
    
    if (error || !contacts?.length) {
        showToast('❌ В группе нет контактов');
        return;
    }
    
    // Создаем задание на рассылку
    const { data: mailing, error: createError } = await supabase
        .from('mailings')
        .insert([{
            track_ids: trackIds,
            playlist_id: playlistId,
            group_id: groupId,
            status: 'pending',
            created_at: new Date().toISOString()
        }])
        .select()
        .single();
    
    if (createError) {
        console.error('Ошибка создания рассылки:', createError);
        showToast('❌ Ошибка создания рассылки');
        return;
    }
    
    // Отправляем на API для обработки
    try {
        const response = await fetch('/api/send-mailing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                mailingId: mailing.id,
                trackIds,
                playlistId,
                groupId,
                contacts: contacts.map(c => c.contact_email)
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast(`🚀 Рассылка запущена! Отправлено ${contacts.length} получателям`);
            
            // Обновляем статус
            await supabase
                .from('mailings')
                .update({ status: 'sent', sent_at: new Date().toISOString() })
                .eq('id', mailing.id);
        } else {
            showToast('❌ Ошибка отправки: ' + result.error);
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showToast('❌ Ошибка отправки');
    }
}

// Загрузка плейлистов и групп
async function loadPlaylistsAndGroups() {
    // Плейлисты
    const { data: playlists } = await supabase
        .from('playlists')
        .select('id, name');
    
    const playlistSelect = document.getElementById('playlistSelect');
    playlistSelect.innerHTML = '<option value="">Выберите плейлист</option>';
    playlists.forEach(p => {
        playlistSelect.innerHTML += `<option value="${p.id}">${p.name}</option>`;
    });
    
    // Группы
    const { data: groups } = await supabase
        .from('groups')
        .select('id, name');
    
    const groupSelect = document.getElementById('groupSelect');
    groupSelect.innerHTML = '<option value="">Выберите группу</option>';
    groups.forEach(g => {
        groupSelect.innerHTML += `<option value="${g.id}">${g.name}</option>`;
    });
}

// Загружаем при инициализации
document.addEventListener('DOMContentLoaded', loadPlaylistsAndGroups);