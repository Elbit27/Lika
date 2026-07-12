document.addEventListener('DOMContentLoaded', () => {
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step-btn');
    const goalForm = document.getElementById('goal-form');

    // Функция для безопасного получения CSRF-токена из куки Django
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Функция генерации HTML-разметки для нового шага цели
    function createStepHTML() {
        const stepDiv = document.createElement('div');
        stepDiv.className = 'step-card';
        stepDiv.innerHTML = `
            <div class="step-header">
                <h3>Новый шаг</h3>
                <button type="button" class="btn-delete" onclick="this.closest('.step-card').remove()">Удалить</button>
            </div>
            <div class="form-group">
                <label>Название шага</label>
                <input type="text" class="step-title" required>
            </div>
            <div class="form-group">
                <label>Описание шага</label>
                <textarea class="step-description" rows="2"></textarea>
            </div>
        `;
        return stepDiv;
    }

    // Слушатель клика на кнопку добавления нового шага
    if (addStepBtn) {
        addStepBtn.addEventListener('click', () => {
            if (stepsContainer) {
                stepsContainer.appendChild(createStepHTML());
            }
        });
    }

    // Обработка отправки формы создания / редактирования цели
    if (goalForm) {
        goalForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Проверяем наличие ID (если редактируем существующую цель)
            const goalIdElement = document.getElementById('goal-id');
            const goalId = goalIdElement ? goalIdElement.value : '';

            // Сбор данных по всем добавленным карточкам шагов
            const stepsData = [];
            document.querySelectorAll('.step-card').forEach(card => {
                const titleInput = card.querySelector('.step-title');
                const descInput = card.querySelector('.step-description');

                if (titleInput) {
                    stepsData.push({
                        title: titleInput.value,
                        description: descInput ? descInput.value : ''
                    });
                }
            });

            const cardColorElement = document.getElementById('card_color');
            // Если элемент найден — берем его строку ('white', 'blue' и т.д.), иначе ставим дефолтную 'white'
            const cardColorValue = cardColorElement ? cardColorElement.value : 'white';

            const payload = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                card_color: cardColorValue,
                prize: document.getElementById('prize') ? document.getElementById('prize').value : '',
                steps: stepsData // Передаем как красивый вложенный массив
            };

            const isEdit = !!goalId;
            // Конечные эндпоинты в соответствии с вашим urls.py
            const url = !isEdit ? '/goal/api/goals/' : `/goal/api/goals/${goalId}/`;
            const method = isEdit ? 'PUT' : 'POST';

            // Берем CSRF-токен из глобальной переменной Django шаблона или из куки
            const token = typeof CSRF_TOKEN !== 'undefined' ? CSRF_TOKEN : getCookie('csrftoken');

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json', // Обязательно для JSONParser на бэке
                        'X-CSRFToken': token
                    },
                    body: JSON.stringify(payload) // Сериализуем объект в JSON-строку
                });

                if (response.ok) {
                    alert(isEdit ? 'Цель успешно обновлена!' : 'Цель успешно создана!');
                    window.location.href = '/goal/'; // Редирект на список ваших целей
                } else {
                    // Обработка валидационных ошибок бэкенда (400 Bad Request и др.)
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        console.error('Ошибки валидации от DRF:', errorData);
                        alert('Ошибка заполнения полей: ' + JSON.stringify(errorData));
                    } else {
                        // Защита на случай, если сервер упал в 500 ошибку и выдал HTML
                        const errorHtml = await response.text();
                        console.error('Сервер вернул HTML вместо JSON. Первые 300 символов:\n', errorHtml.substring(0, 300));
                        alert(`Критическая ошибка сервера (${response.status}). Проверьте логи терминала Django.`);
                    }
                }
            } catch (error) {
                // Ошибка, если бэкенд вообще отключен или заблокирован по CORS
                console.error('Сетевая ошибка запроса:', error);
                alert('Не удалось связаться с сервером. Убедитесь, что Django запущен.');
            }
        });
    }
});
