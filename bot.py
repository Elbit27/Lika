import os
import django
import telebot
from django.conf import settings


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from schedule.models import Poma, Item
from django.contrib.auth.models import User

bot = telebot.TeleBot(settings.TELEGRAM_BOT_TOKEN)


@bot.message_handler(commands=['start'])
def start(message):
    bot.reply_to(message, "Привет! Чтобы добавить помидорку, напиши название проекта.\nНапример: 'Программирование'")


@bot.message_handler(func=lambda message: True)
def add_poma(message):
    project_name = message.text.strip()

    # Для простоты берем первого пользователя или ищем по логину
    # В идеале здесь должна быть привязка chat_id к User
    user = User.objects.first()

    # Ищем проект (Item) у пользователя
    item = Item.objects.filter(name__iexact=project_name, user=user).first()

    if item:
        # Создаем запись Poma
        import datetime
        day_name = datetime.datetime.now().strftime('%A')  # Получаем текущий день (Monday, etc.)

        Poma.objects.create(
            item=item,
            day=day_name
        )
        bot.reply_to(message, f"✅ Помидорка добавлена в проект '{item.name}'!")
    else:
        bot.reply_to(message, f"❌ Проект '{project_name}' не найден. Сначала создай его на сайте.")


if __name__ == '__main__':
    print("Бот запущен...")
    bot.polling(none_stop=True)