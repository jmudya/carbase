# CarBase: сайт з адмінкою для carbaseusa.com

Що в папці:
- index.html: сам сайт
- data/cars.json і data/settings.json: авто, телефони, пошта, соцмережі
- uploads/: фото авто
- admin/: адмінка (відкривається за адресою carbaseusa.com/admin)

## Крок 1. GitHub (місце, де лежать файли сайту)
1. Зареєструйтесь на github.com (безкоштовно).
2. Створіть новий репозиторій (New repository), назва, наприклад, carbase-site.
3. Натисніть "uploading an existing file" і перетягніть ВМІСТ цієї папки (index.html, admin, data, uploads), а не саму папку. Натисніть Commit changes.

## Крок 2. Netlify (хостинг)
1. Зареєструйтесь на netlify.com через GitHub.
2. Add new project, Import an existing project, GitHub, оберіть carbase-site.
3. Build command залиште порожнім, Publish directory теж порожнім. Deploy.
4. Сайт відкриється за адресою щось.netlify.app.

## Крок 3. Домен carbaseusa.com
1. Netlify, Domain management, Add a domain, впишіть carbaseusa.com. Netlify DNS НЕ вмикайте.
2. GoDaddy, My Products, carbaseusa.com, DNS:
   - видаліть стару A-запис "Parked", якщо є;
   - додайте A: Name @, Value 75.2.60.5;
   - додайте CNAME: Name www, Value щось.netlify.app (ваша адреса з Netlify).
3. Зачекайте від кількох хвилин до кількох годин. https Netlify увімкне сам.

## Крок 4. Вхід в адмінку
1. GitHub, Settings, Developer settings, OAuth Apps, New OAuth App.
   - Homepage URL: https://carbaseusa.com
   - Authorization callback URL: https://api.netlify.com/auth/done
2. Скопіюйте Client ID і створіть Client secret.
3. Netlify, Project configuration, Access and security, OAuth, Install provider, GitHub: вставте Client ID і Secret.
4. У GitHub відкрийте файл admin/config.yml, натисніть олівець і замініть USERNAME/REPO на ваш логін і назву репозиторію (наприклад ivan/carbase-site). Commit.
5. Відкрийте carbaseusa.com/admin, натисніть Login with GitHub.

## Як користуватись адмінкою
- Website, Cars: додавати, змінювати, видаляти авто, ставити Sold, додавати до 20 фото і посилання на відео.
- Website, Contacts and links: телефони (через | ), пошта, години, соцмережі.
- Після натискання Publish сайт оновиться приблизно за 1 хвилину.

## Заявки з форми
Netlify, Forms, форма inquiry з'явиться після першого деплою. Там же Settings and usage, Form notifications, Add notification, Email: вкажіть пошту для заявок.

Назви пунктів у Netlify і GitHub можуть трохи відрізнятися.
