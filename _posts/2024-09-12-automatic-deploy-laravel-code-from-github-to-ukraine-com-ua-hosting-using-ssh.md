---
title: Автоматичний деплой Laravel коду з Github на хостінг за допомогою SSH
description: Хочу поділитися скриптом, який використовую для деплоя на хостінг
  ukraine.com.ua. Бажано мати бізнес-план хостінгу, бо на ньому є підтримка
  Supervisor та NodeJS, які використовуються у скрипті, хоча їх згадування можно
  прибрати та використовувати скрипт на звичайному хостінг-плані
category: Программування
tags:
  - Github
  - Workflow Actions
date: 2024-09-12T00:00:00.000Z
---
Хочу поділитися скриптом, який використовую для деплоя на хостінг [ukraine.com.ua](https://ukraine.com.ua). Бажано мати бізнес-план хостінгу, бо на ньому є підтримка Supervisor та NodeJS, які використовуються у скрипті, хоча їх згадування можно прибрати та використовувати скрипт на звичайному хостінг-плані.

## Робота, яку робить скрипт

1. Деплоїть код на хостінг через SSH
2. Робить встановлення залежностей Composer
3. Робить встановлення залежностей NPM та збірку ассетів через запуск `npm run build`
4. Запускає міграції `php artisan migrate --force`
5. Перезапускає два Supervisor процеси Laravel: планувальник (`php artisan schedule:work`) та обробник черги (`php artisan queue:work`)
6. Відправляє повідомлення у Telegram про успішний або не успішний деплой з посиланням на коміт

## Підготовка хостінгу

Ваш сайт на хостінгу має власну директорію `/home/USERNAME/WEBSITE/www/` де `USERNAME` та `WEBSITE`це будуть специфічна до вашого хостінгу інформація, котру можно взяти у розділі хостінгу _Налаштування сайту > Кореневий каталог_.

Потрібно через SSH створити директорію та клонувати Laravel код з Github. Для цього необхідно підключитися по SSH до сервера хостінгу та створити SSH ключ:

```bash
cd ~/.ssh
ssh-keygen -t rsa -b 2048
cat ~/.ssh/id_rsa.pub
```

Створений SSH-ключ потрібно додати в розділ: [Settings > SSH and GPG keys](https://github.com/settings/keys).

Далі потрібно створити директорію на сервері хостунгу в якому буде знаходитися Laravel-код і склонувати репозиторій з Github (тут портібно замінити `USERNAME`, `WEBSITE`, `GITHUB_USERNAME`, `GITHUB_REPO` на ваші власні):

```bash
mkdir /home/USERNAME/WEBSITE/source/
cd /home/USERNAME/WEBSITE/
git clone git@github.com:GITHUB_USERNAME/GITHUB_REPO.git source
```

Далі потрібно _видалити_ поточну директорію `www` (всі дані директорії `www` будуть видалені, тому не робіть це з директорією де є цінні файли) та замінити її на сімлінк на директорію `source/public/` (тут портібно замінити `USERNAME`, `WEBSITE` на ваші власні):

```bash
rm -rf /home/USERNAME/WEBSITE/www/
ln -s /home/USERNAME/WEBSITE/source/public /home/USERNAME/WEBSITE/www
```

Перейти у розділ хостінгу Supervisor та створити два процеси: планувальник (`php artisan schedule:work`), черги (`php artisan queue:work`).

Процес "обробник черги" (тут портібно замінити `USERNAME`, `WEBSITE` на ваші власні):

```bash
cd /home/USERNAME/WEBSITE/source/ && /usr/local/php83/bin/php -c /home/krokom/.system/php/www.WEBSITE.ini artisan queue:work
```

Процес "планувальник" (тут портібно замінити `USERNAME`, `WEBSITE` на ваші власні):

```bash
cd /home/USERNAME/WEBSITE/source/ && /usr/local/php83/bin/php -c /home/krokom/.system/php/www.WEBSITE.ini artisan schedule:work
```

## Підготовка скрипту

В репозиторії створюємо файл `.github/workflows/deploy-ssh.yaml` і додаємо змінні Github Actions в розділі: _Репозиторій > Settings > Secrets and variables > Actions_.

Потрібно додати наступні змінні:

* `HOST` – хост підключення по SSH, можно дізнатися в розділі хостінгу "SSH-доступ"
* `USERNAME` – імʼя користувача для підключення по SSH, можно дізнатися в розділі хостінгу "SSH-доступ"
* `PASSWORD` – пароль користувача для підключення по SSH, можно дізнатися в розділі хостінгу "SSH-доступ"
* `PORT` – порт для підключення по SSH, теж з розділу "SSH-доступ", зазвичай 22
* `HOSTING_USERNAME` – це імʼя користувача хостінгу, можно дізнатися з розділу хостінга _Налаштування сайту > Кореневий каталог_: `/home/USERNAME/WEBSITE/www/`
* `HOSTING_WEBSITE` – це імʼя користувача хостінгу, можно дізнатися з розділу хостінга _Налаштування сайту > Кореневий каталог_: `/home/USERNAME/WEBSITE/www/`
* `TELEGRAM_TOKEN` – ключ до вашого Telegram бота, який можно створити через бот [@BotFather](https://t.me/BotFather)
* `TELEGRAM_TO` – ID чата для відправки повідомлення, можно дізнатися свій ID в боті [@getmyid_bot](https://t.me/getmyid_bot), потім встановити чат з власним ботом

Код файлу `.github/workflows/deploy-ssh.yaml`:

{% raw %}
```yaml
name: Deploy SSH

on: [push]

jobs:
  build:
    name: Deploy
    runs-on: ubuntu-latest
    steps:
      - name: Apply changes on server, install deps, migrate, build assets
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          password: ${{ secrets.PASSWORD }}
          port: ${{ secrets.PORT }}
          script: |
            cd /home/${{ secrets.HOSTING_USERNAME }}/${{ secrets.HOSTING_WEBSITE }}/source
            git stash && git fetch --all && git reset --hard origin/main
            source ~/.bashrc && composer install
            php artisan migrate --force
            pkill -fx '/usr/local/php83/bin/php -c /home/${{ secrets.HOSTING_USERNAME }}/.system/php/www.${{ secrets.HOSTING_WEBSITE }}.ini artisan queue:work'
            pkill -fx '/usr/local/php83/bin/php -c /home/${{ secrets.HOSTING_USERNAME }}/.system/php/www.${{ secrets.HOSTING_WEBSITE }}.ini artisan schedule:work'
            npm ci && npm run build

  notify:
    name: Notify
    runs-on: ubuntu-latest
    if: always()
    needs: [build]
    steps:
      - name: Send status to telegram
        uses: appleboy/telegram-action@master
        with:
          to: ${{ secrets.TELEGRAM_TO }}
          token: ${{ secrets.TELEGRAM_TOKEN }}
          format: "html"
          message: |
            ${{ needs.build.result == 'success' && '🟢' || '🔴' }} <b>${{ needs.build.result }}</b> <a href="https://github.com/${{ github.repository }}/commit/${{github.sha}}">${{ github.event.commits[0].message }}</a> by <a href="https://github.com/${{ github.actor }}">@${{ github.actor }}</a>
```
{% endraw %}

## Висновок

Після додавання файлу `deploy-ssh.yaml` у репозиторій почне працювати Github Action, котрий можно побачити в секції _Github > Ваш репозиторій > Actions_. Можно відкрити задачу та подивитися стан виконання.

Код проєкту автоматично розгортається після кожного пушу в гілку `main`, а в Telegram надходить сповіщення, тож тепер можно знати про поточний стан кожного деплоя.
