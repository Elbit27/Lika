document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById("reportChart");
    const weekLabel = document.querySelector(".week-switch span");
    const prevBtn = document.getElementById("prevWeek");
    const nextBtn = document.getElementById("nextWeek");
    const periodBtns = document.querySelectorAll(".period-btn");

    if (!canvas || !weekLabel || !prevBtn || !nextBtn) return;

    const ctx = canvas.getContext("2d");
    let chart;
    let currentPeriod = "week";
    let offset = 0;

    // Вспомогательная функция для красивого формата дат
    function formatDate(date) {
        return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "short" });
    }

    async function fetchData() {
        try {
            const res = await fetch(`/report/data/?period=${currentPeriod}&offset=${offset}`);
            if (!res.ok) throw new Error("Ошибка загрузки данных");
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    function renderChart(labels, values) {
        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Завершенные Pomodoro",
                    data: values,
                    backgroundColor: "rgba(155, 17, 30, 0.4)", // Твой акцентный красный с прозрачностью
                    borderColor: "rgba(155, 17, 30, 1)",
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { stepSize: 1, color: "#768390" },
                        grid: { color: "rgba(255, 255, 255, 0.05)" }
                    },
                    x: {
                        ticks: { color: "#768390" },
                        grid: { display: false }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }

    function updatePeriodLabel() {
        const today = new Date();
        let startDate, endDate;

        if (currentPeriod === "week") {
            startDate = new Date(today);
            // Находим понедельник текущей недели с учетом смещения
            const dayDiff = today.getDay() === 0 ? 6 : today.getDay() - 1;
            startDate.setDate(today.getDate() - dayDiff + (offset * 7));

            endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + 6);

            weekLabel.textContent = offset === 0 ? "Эта неделя" : `${formatDate(startDate)} — ${formatDate(endDate)}`;
        }
        else if (currentPeriod === "month") {
            startDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);

            const monthName = startDate.toLocaleString('ru-RU', { month: 'long', year: 'numeric' });
            weekLabel.textContent = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        }
        else if (currentPeriod === "year") {
            const targetYear = today.getFullYear() + offset;
            weekLabel.textContent = `${targetYear} год`;
        }

        // Блокируем кнопку "вперед", если мы в текущем периоде
        nextBtn.disabled = offset >= 0;
    }

    async function updateChart() {
        const data = await fetchData();
        let labels = [];
        let values = [];

        if (currentPeriod === "week") {
            // Бэкенд возвращает [{day: 'Mon', count: 5}, ...]
            labels = data.map(d => d.day);
            values = data.map(d => d.count);
        }
        else if (currentPeriod === "month") {
            labels = ["1-7", "8-14", "15-21", "22+"];
            values = [0, 0, 0, 0];

            data.forEach(d => {
                const day = new Date(d.date).getDate();
                if (day <= 7) values[0] += d.count;
                else if (day <= 14) values[1] += d.count;
                else if (day <= 21) values[2] += d.count;
                else values[3] += d.count;
            });
        }
        else if (currentPeriod === "year") {
            labels = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен", "Окт", "Ноя", "Дек"];
            values = Array(12).fill(0);

            data.forEach(d => {
                const monthIndex = new Date(d.date).getMonth();
                values[monthIndex] += d.count;
            });
        }

        renderChart(labels, values);
        updatePeriodLabel();
    }

    // Слушатели для переключения периодов (Неделя/Месяц/Год)
    periodBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            periodBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            currentPeriod = btn.dataset.period;
            offset = 0; // Сбрасываем смещение при смене периода
            updateChart();
        });
    });

    // Навигация (Назад/Вперед)
    prevBtn.addEventListener("click", () => {
        offset -= 1;
        updateChart();
    });

    nextBtn.addEventListener("click", () => {
        if (offset < 0) {
            offset += 1;
            updateChart();
        }
    });

    // Инициализация при загрузке
    updateChart();
});