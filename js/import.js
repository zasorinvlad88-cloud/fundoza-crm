// js/import.js

/**
 * Music CRM — Импорт данных из Excel
 * Полная логика работы с файлами, маппингом и отправкой в Supabase
 */

// ============================================================
// 1. ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
// ============================================================

let importedData = [];
let mappingConfig = {};
let currentFile = null;

// ============================================================
// 2. ЗАГРУЗКА ФАЙЛА
// ============================================================

function loadExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const json = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
                
                if (json.length === 0) {
                    reject(new Error('Файл пуст или не содержит данных'));
                    return;
                }
                
                resolve({
                    headers: Object.keys(json[0]),
                    rows: json,
                    data: json,
                    sheetName: workbook.SheetNames[0]
                });
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = function() {
            reject(new Error('Ошибка чтения файла'));
        };
        
        reader.readAsArrayBuffer(file);
    });
}

// ============================================================
// 3. ВАЛИДАЦИЯ ДАННЫХ
// ============================================================

function validateData(rows, mapping) {
    const errors = [];
    const validRows = [];
    const requiredFields = ['name']; // Обязательные поля
    
    rows.forEach((row, index) => {
        const mappedRow = {};
        let isValid = true;
        
        // Маппим данные
        Object.keys(mapping).forEach(dbField => {
            const excelField = mapping[dbField];
            mappedRow[dbField] = row[excelField] || '';
        });
        
        // Проверяем обязательные поля
        requiredFields.forEach(field => {
            if (!mappedRow[field] || mappedRow[field].trim() === '') {
                isValid = false;
                errors.push(`Строка ${index + 2}: отсутствует поле "${field}"`);
            }
        });
        
        if (isValid) {
            validRows.push(mappedRow);
        }
    });
    
    return {
        valid: validRows,
        errors: errors,
        total: rows.length,
        validCount: validRows.length
    };
}

// ============================================================
// 4. ОТПРАВКА В SUPABASE
// ============================================================

async function importToSupabase(data, tableName = 'tracks') {
    if (!data || data.length === 0) {
        throw new Error('Нет данных для импорта');
    }
    
    try {
        const response = await fetch('/api/import', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                table: tableName,
                data: data
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Ошибка импорта');
        }
        
        return result;
    } catch (error) {
        console.error('Ошибка импорта:', error);
        throw error;
    }
}

// ============================================================
// 5. ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================================

// Автоматическое определение маппинга по совпадению имен
function autoMapping(headers, dbFields) {
    const mapping = {};
    
    headers.forEach(header => {
        const lowerHeader = header.toLowerCase().trim();
        
        // Ищем совпадение
        const matchedField = dbFields.find(field => {
            const lowerField = field.toLowerCase().trim();
            return lowerField === lowerHeader || 
                   lowerHeader.includes(lowerField) || 
                   lowerField.includes(lowerHeader);
        });
        
        if (matchedField) {
            mapping[matchedField] = header;
        }
    });
    
    return mapping;
}

// Экспорт данных в Excel
function exportToExcel(data, filename = 'exported_data.xlsx') {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Data');
    XLSX.writeFile(wb, filename);
}

// ============================================================
// 6. UI ФУНКЦИИ
// ============================================================

// Отображение маппинга в интерфейсе
function renderMapping(headers, dbFields) {
    const container = document.getElementById('mappingContainer');
    if (!container) return;
    
    const autoMapped = autoMapping(headers, dbFields);
    
    let html = '<div class="table-responsive"><table class="table">';
    html += `<thead><tr>
        <th>Колонка в Excel</th>
        <th>Поле в БД</th>
        <th>Пример</th>
    </tr></thead><tbody>`;
    
    headers.forEach((header, index) => {
        const sample = importedData.length > 0 ? importedData[0][header] : '';
        
        html += `<tr>
            <td><strong>${header}</strong></td>
            <td>
                <select class="form-select form-select-sm mapping-select" data-header="${header}">
                    <option value="">— Не использовать —</option>
                    ${dbFields.map(field => {
                        const selected = autoMapped[field] === header ? 'selected' : '';
                        return `<option value="${field}" ${selected}>${field}</option>`;
                    }).join('')}
                </select>
            </td>
            <td style="color: #a7a9be; font-size: 13px;">${String(sample).substring(0, 30)}</td>
        </tr>`;
    });
    
    html += '</tbody></table></div>';
    container.innerHTML = html;
    
    // Сохраняем маппинг при изменении
    document.querySelectorAll('.mapping-select').forEach(select => {
        select.addEventListener('change', function() {
            const header = this.dataset.header;
            const value = this.value;
            
            // Обновляем глобальный маппинг
            if (value) {
                mappingConfig[value] = header;
            } else {
                // Удаляем из маппинга
                Object.keys(mappingConfig).forEach(key => {
                    if (mappingConfig[key] === header) {
                        delete mappingConfig[key];
                    }
                });
            }
        });
    });
}

// Показать статус импорта
function showImportStatus(result) {
    const statusDiv = document.getElementById('importStatus');
    if (!statusDiv) return;
    
    if (result.success) {
        statusDiv.innerHTML = `
            <div class="alert alert-success">
                <i class="bi bi-check-circle"></i>
                Импортировано ${result.imported} записей
            </div>
        `;
    } else {
        statusDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-circle"></i>
                ${result.error || 'Ошибка импорта'}
            </div>
        `;
    }
}

// ============================================================
// 7. ЭКСПОРТ API
// ============================================================

// Экспортируем функции для использования в HTML
window.importModule = {
    loadExcelFile,
    validateData,
    importToSupabase,
    autoMapping,
    exportToExcel,
    renderMapping,
    showImportStatus
};

console.log('📦 Модуль импорта загружен');