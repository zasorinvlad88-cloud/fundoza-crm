// js/datatables-config.js
$(document).ready(function() {
    const table = $('#tracksTable').DataTable({
        ajax: {
            url: '/api/get-tracks', // Ваш Serverless endpoint
            dataSrc: 'data'
        },
        columns: [
            { 
                data: null,
                render: function(data) {
                    return `<input type="checkbox" class="track-select" data-id="${data.id}">`;
                },
                orderable: false
            },
            { 
                data: 'name',
                render: function(data) {
                    return `<i class="fas fa-music" style="color:#7c3aed;"></i> ${data}`;
                }
            },
            { data: 'duration' },
            { 
                data: 'tags',
                render: function(data) {
                    return `<span class="badge bg-secondary">${data || '—'}</span>`;
                }
            },
            {
                data: null,
                render: function(data) {
                    return `<button class="btn btn-sm btn-danger" onclick="deleteTrack('${data.id}')">
                        <i class="fas fa-trash"></i>
                    </button>`;
                },
                orderable: false
            }
        ],
        order: [[1, 'asc']],
        pageLength: 25,
        responsive: true,
        dom: 'Bfrtip',
        buttons: [
            {
                text: '<i class="fas fa-upload"></i> Загрузить',
                action: function() { $('#fileInput').click(); }
            },
            {
                text: '<i class="fas fa-trash"></i> Удалить выбранные',
                action: deleteSelectedTracks
            }
        ]
    });

    // Обновление счетчика выбранных
    $('#tracksTable tbody').on('change', '.track-select', function() {
        const count = $('.track-select:checked').length;
        $('#selectedCount').text(count);
    });

    // Выбрать все
    $('#selectAll').on('change', function() {
        $('.track-select').prop('checked', this.checked);
        $('#selectedCount').text(this.checked ? $('.track-select').length : 0);
    });

    window.tracksTable = table;
});