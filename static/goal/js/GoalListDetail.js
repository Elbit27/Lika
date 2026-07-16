document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('goal-modal');
    const closeBtn = document.getElementById('close-modal-btn');

    document.querySelectorAll('.goal-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.classList.contains('btn-action-edit') || e.target.closest('.btn-step-action')) {
                return;
            }

            const goalId = this.dataset.id || this.querySelector('.goal-badge').textContent.replace(/[^\d]/g, '');
            if (!goalId) return;

            fetch(`/goal/api/goals/${goalId}/`)
                .then(response => response.json())
                .then(goal => {
                    document.getElementById('modal-title').textContent = goal.title;
                    document.getElementById('modal-desc').textContent = goal.description || 'Без описания';

                    const prizeWrapper = document.getElementById('modal-prize-wrapper');
                    if (goal.prize) {
                        document.getElementById('modal-prize').textContent = goal.prize;
                        prizeWrapper.style.display = 'block';
                    } else {
                        prizeWrapper.style.display = 'none';
                    }

                    const stepsList = document.getElementById('modal-steps-completed');
                    stepsList.innerHTML = '';
                    const completedSteps = goal.steps ? goal.steps.filter(step => step.completed === true) : [];

                    if (completedSteps.length > 0) {
                        completedSteps.forEach(step => {
                            const li = document.createElement('li');
                            li.className = 'modal-step-item';

                            let stepContent = `<div class="modal-step-title">${step.title}</div>`;
                            if (step.description) {
                                stepContent += `<p class="modal-step-desc">${step.description}</p>`;
                            }

                            li.innerHTML = stepContent;
                            stepsList.appendChild(li);
                        });
                    } else {
                        stepsList.innerHTML = '<li style="color: #999; font-style: italic;">Нет выполненных шагов.</li>';
                    }

                    const stepsListCompleted = document.getElementById('modal-steps-uncompleted');
                    stepsListCompleted.innerHTML = '';
                    const uncompletedSteps = goal.steps ? goal.steps.filter(step => step.completed === false) : [];

                    if (uncompletedSteps.length > 0) {
                        uncompletedSteps.forEach(step => {
                            const li = document.createElement('li');
                            li.className = 'modal-step-item';

                            let stepContent = `<div class="modal-step-title">${step.title}</div>`;
                            if (step.description) {
                                stepContent += `<p class="modal-step-desc">${step.description}</p>`;
                            }

                            li.innerHTML = stepContent;
                            stepsListCompleted.appendChild(li);
                        });
                    } else {
                        stepsListCompleted.innerHTML = '<li style="color: #999; font-style: italic;">Нет выполненных шагов.</li>';
                    }

                    modal.classList.add('active');
                })
                .catch(err => console.error('Ошибка при загрузке данных цели:', err));
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    document.querySelectorAll('.btn-step-complete').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Стопаем всплытие, чтобы не открывалось модальное окно цели

            const stepItem = this.closest('.step-item');
            const stepId = stepItem.dataset.stepId;
            const icon = this.querySelector('i');

            // Переключаем класс. Если в HTML его не было, добавит и вернет true
            const isCurrentlyCompleted = stepItem.classList.toggle('completed');

            // Визуально меняем иконку кружка на галочку
            if (isCurrentlyCompleted) {
                icon.classList.remove('bi-circle');
                icon.classList.add('bi-check-circle-fill');
            } else {
                icon.classList.remove('bi-check-circle-fill');
                icon.classList.add('bi-circle');
            }

            fetch(`/goal/api/steps/${stepId}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': CSRF_TOKEN
                },
                body: JSON.stringify({ completed: isCurrentlyCompleted }) // Отправляем {'completed': true} в DRF
            })
            .then(response => {
                if (response.ok) {
                    console.log(`Статус шага ${stepId} успешно обновлен в БД на ${isCurrentlyCompleted}`);

                    const goalCard = stepItem.closest('.goal-card');
                    if (goalCard && typeof recalculateProgress === 'function') {
                        recalculateProgress(goalCard);
                    }
                } else {
                    // Если база не изменилась, возвращаем интерфейс в исходное состояние
                    stepItem.classList.toggle('completed');
                    console.error('Бэкенд вернул ошибку при сохранении статуса. Проверьте сериализатор или URL.');
                }
            })
            .catch(err => console.error('Ошибка сети:', err));
        });
    });
});
