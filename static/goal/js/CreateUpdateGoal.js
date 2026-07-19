document.addEventListener('DOMContentLoaded', () => {
    const stepsContainer = document.getElementById('steps-container');
    const addStepBtn = document.getElementById('add-step-btn');
    const goalForm = document.getElementById('goal-form');

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

    // adding new step listener
    if (addStepBtn) {
        addStepBtn.addEventListener('click', () => {
            if (stepsContainer) {
                stepsContainer.appendChild(createStepHTML());
            }
        });
    }

    if (goalForm) {
        goalForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const goalIdElement = document.getElementById('goal-id');
            const goalId = goalIdElement ? goalIdElement.value : '';

            const stepsData = [];
            document.querySelectorAll('.step-card').forEach(card => {
                const titleInput = card.querySelector('.step-title');
                const descInput = card.querySelector('.step-description');
                const stepId = card.dataset.stepId ? parseInt(card.dataset.stepId) : null;
                const isCompleted = card.dataset.completed === 'true';

                if (titleInput) {
                    stepsData.push({
                        id: stepId,
                        title: titleInput.value,
                        description: descInput ? descInput.value : '',
                        completed: isCompleted
                    });
                }
            });

            const cardColorElement = document.getElementById('card_color');
            const cardColorValue = cardColorElement ? cardColorElement.value : 'white';

            const payload = {
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                card_color: cardColorValue,
                prize: document.getElementById('prize') ? document.getElementById('prize').value : '',
                steps: stepsData
            };

            const isEdit = !!goalId;
            const url = !isEdit ? '/goal/api/goals/' : `/goal/api/goals/${goalId}/`;
            const method = isEdit ? 'PUT' : 'POST';
            const token = typeof CSRF_TOKEN !== 'undefined' ? CSRF_TOKEN : getCookie('csrftoken');

            try {
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': token
                    },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    alert(isEdit ? 'Цель успешно обновлена!' : 'Цель успешно создана!');
                    window.location.href = '/goal/';
                } else {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        const errorData = await response.json();
                        console.error('Ошибки валидации от DRF:', errorData);
                        alert('Ошибка заполнения полей: ' + JSON.stringify(errorData));
                    } else {
                        const errorHtml = await response.text();
                        console.error('Сервер вернул HTML вместо JSON. Первые 300 символов:\n', errorHtml.substring(0, 300));
                        alert(`Критическая ошибка сервера (${response.status}). Проверьте логи терминала Django.`);
                    }
                }
            } catch (error) {
                console.error('Сетевая ошибка запроса:', error);
                alert('Не удалось связаться с сервером. Убедитесь, что Django запущен.');
            }
        });
    }
});


window.deleteGame = async function(gameId) {
    if (!confirm("Вы уверены, что хотите удалить эту карточку цели? Это действие необратимо.")) {
        return;
    }

    try {
        const response = await fetch(`/game/${gameId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert("Карточка цели успешно удалена");
            window.location.href = '/goal/';
        } else {
            const data = await response.json();
            alert("Ошибка при удалении: " + (data.error || "Неизвестная ошибка"));
        }
    } catch (e) {
        console.error("Ошибка запроса:", e);
        alert("Не удалось связаться с сервером.");
    }
};

// getting CSRF token
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
