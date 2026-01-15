document.addEventListener("DOMContentLoaded", async () => {
    const canvas = document.getElementById("reportChart");
    const weekLabel = document.querySelector(".week-switch span");
    const prevBtn = document.getElementById("prevWeek");
    const nextBtn = document.getElementById("nextWeek");
    const periodBtns = document.querySelectorAll(".period-btn");

    if (!canvas || !weekLabel || !prevBtn || !nextBtn) return;

    const ctx = canvas.getContext("2d");
    let chart;

    let currentPeriod = "week"; // week / month / year
    let offset = 0; // сдвиг текущего периода

    function formatDate(date) {
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return date.toLocaleDateString("en-US", options);
    }

    async function fetchData() {
        const res = await fetch(`/api/v1/report/data/?period=${currentPeriod}&offset=${offset}`);
        return await res.json();
    }

    function renderChart(labels, values) {
        if (chart) chart.destroy();

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Pomodoros",
                    data: values,
                    backgroundColor: "rgba(255, 153, 153, 0.3)",
                    borderColor: "rgba(255, 153, 153, 1)",
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });
    }

    function updatePeriodLabel() {
        const today = new Date();
        let startDate, endDate;

        if (currentPeriod === "week") {
            const currentMonday = new Date(today);
            currentMonday.setDate(today.getDate() - today.getDay() + 1 + offset * 7);
            startDate = currentMonday;
            endDate = new Date(currentMonday);
            endDate.setDate(startDate.getDate() + 6);

            if (offset === 0) weekLabel.textContent = "This Week";
            else if (offset === -1) weekLabel.textContent = "Last Week";
            else weekLabel.textContent = `${formatDate(startDate)} — ${formatDate(endDate)}`;

            nextBtn.disabled = offset >= 0;
        }
        else if (currentPeriod === "month") {
            startDate = new Date(today.getFullYear(), today.getMonth() + offset, 1);
            endDate = new Date(today.getFullYear(), today.getMonth() + offset + 1, 0);
            weekLabel.textContent = `${formatDate(startDate)} — ${formatDate(endDate)}`;
            nextBtn.disabled = offset >= 0;
        }
        else if (currentPeriod === "year") {
            startDate = new Date(today.getFullYear() + offset, 0, 1);
            endDate = new Date(today.getFullYear() + offset, 11, 31);
            weekLabel.textContent = `${formatDate(startDate)} — ${formatDate(endDate)}`;
            nextBtn.disabled = offset >= 0;
        }
    }

    async function updateChart() {
        const data = await fetchData();
        let labels = [];
        let values = [];

        if (currentPeriod === "week") {
            labels = data.map(d => d.day);
            values = data.map(d => d.count);
        }

        else if (currentPeriod === "month") {
            labels = ["1–7", "8–14", "15–21", "22–End"];
            values = [0, 0, 0, 0];

            // безопасно вычисляем целевой месяц
            const today = new Date();
            const rawMonth = today.getMonth() + offset;

            const targetYear = today.getFullYear() + Math.floor(rawMonth / 12);
            const targetMonth = ((rawMonth % 12) + 12) % 12; // 0..11

            const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();

            data.forEach(d => {
                const parsed = new Date(d.date);

                // фильтрация по месяцу и году
                if (parsed.getFullYear() !== targetYear ||
                    parsed.getMonth() !== targetMonth) {
                    return;
                }

                const day = parsed.getDate();
                const count = Number(d.count) || 0;

                if (day >= 1 && day <= 7) values[0] += count;
                else if (day >= 8 && day <= 14) values[1] += count;
                else if (day >= 15 && day <= 21) values[2] += count;
                else if (day >= 22 && day <= lastDay) values[3] += count;
            });

            console.log("month:", targetMonth + 1, "year:", targetYear);
            console.log("values:", values);
        }


        else if (currentPeriod === "year") {
            labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            values = Array(12).fill(0);

            data.forEach(d => {
                const month = new Date(d.date).getMonth();
                values[month] += d.count;
            });
        }

        renderChart(labels, values);
        updatePeriodLabel();
    }


    // Кнопки периода
    periodBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            periodBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            currentPeriod = btn.dataset.period;
            offset = 0;

            updateChart();
        });
    });

    // Стрелки
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

    updateChart();
});
