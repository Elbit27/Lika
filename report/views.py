from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.db.models import Count
from datetime import timedelta, date
from django.utils import timezone
from schedule.models import Poma  # если у тебя модель так называется
from django.shortcuts import render
from django.db.models.functions import ExtractWeekDay
import calendar



def report_page(request):
    return render(request, 'core/report.html')



@api_view(['GET'])
def report_data(request):
    period = request.GET.get('period', 'week')
    offset = int(request.GET.get('offset', 0))  # сдвиг периода
    today = timezone.now()

    if period == 'week':
        # Пн этой недели
        current_monday = today - timedelta(days=today.weekday())
        start_date = current_monday + timedelta(weeks=offset)
        end_date = start_date + timedelta(days=6)

    elif period == 'month':
        year = today.year
        month = today.month + offset
        # корректируем год и месяц, если вышли за пределы 1-12
        while month > 12:
            month -= 12
            year += 1
        while month < 1:
            month += 12
            year -= 1
        start_date = date(year, month, 1)
        last_day = calendar.monthrange(year, month)[1]
        end_date = date(year, month, last_day)

    elif period == 'year':
        year = today.year + offset
        start_date = date(year, 1, 1)
        end_date = date(year, 12, 31)

    else:
        # по умолчанию неделя
        current_monday = today - timedelta(days=today.weekday())
        start_date = current_monday
        end_date = start_date + timedelta(days=6)

    # группировка по дням недели (1=Mon ... 7=Sun)
    queryset = (
        Poma.objects
        .filter(created_at__date__gte=start_date, created_at__date__lte=end_date)
        .annotate(weekday=ExtractWeekDay('created_at'))
        .values('weekday')
        .annotate(count=Count('id'))
    )

    # соответствие чисел названиям дней (неделя с Пн)
    days_map = {1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat', 7: 'Sun'}
    # сдвигаем ExtractWeekDay: 1=Sun → 7, 2=Mon →1, ...
    data_dict = {i: 0 for i in range(1, 8)}
    for item in queryset:
        original = item['weekday']  # 1=Sun, 2=Mon ... 7=Sat
        shifted = original - 1 if original != 1 else 7
        data_dict[shifted] = item['count']

    result = [{'day': days_map[i], 'count': data_dict[i]} for i in range(1, 8)]

    return Response(result)
