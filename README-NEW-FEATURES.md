# Нові функції: короткі нотатки

## Що де налаштовується (carbaseusa.com/admin)
- **Customer reviews**: відгуки клієнтів. Поки відгуків немає, розділу й пункту меню на сайті немає.
- **Prices and calculators**:
  - Delivery within the USA: ваші тарифи. Поки всі тарифи не внесено, показується лише форма заявки;
  - Delivery to Ukraine: ваші ціни (комісія, доставка, океан, збори аукціонів, брокер, курс євро). Мито, акциз і ПДВ уже мають стандартні значення, їх можна змінити.
- **Contacts and links**: нове поле Google review link (кнопка «Leave a review»).

## Сповіщення в Telegram (миттєві заявки на телефон)
1. У Telegram напишіть @BotFather, команда /newbot. Збережіть токен бота.
2. Напишіть своєму боту будь-яке повідомлення.
3. Відкрийте в браузері https://api.telegram.org/bot<ТОКЕН>/getUpdates і знайдіть "chat":{"id": число}. Це ваш chat id.
4. Netlify, Project configuration, Environment variables, додайте:
   TELEGRAM_BOT_TOKEN = токен
   TELEGRAM_CHAT_ID = число
5. Після цього зробіть публікацію (Publish deploy), щоб функція підхопила змінні.

## SMS (необов'язково, платно через Twilio)
Додайте в Environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM (номер Twilio), NOTIFY_SMS_TO (ваш номер у форматі +1...).
Для бізнес-SMS у США Twilio вимагає реєстрації (A2P 10DLC).
