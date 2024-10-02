---
title: Використання черг на спільному (shared) хостингу з Laravel
description: Іноді потрібно використовувати спільний хостинг, який не дозволяє
  інсталювати супервізор для запуску черги.
category: Программування
tags:
  - PHP
  - Laravel
  - Queuing
  - Scheduling
date: 2024-09-24T00:00:00.000Z
---
Іноді потрібно використовувати спільний хостинг, який не дозволяє інсталювати супервізор для запуску черги.

Типовим прикладом цього є сервери, розгорнуті лише з доступом через Cpanel.

Одним із підходів до роботи з чергою, яка не залежить від часу (наприклад, надсилання електронних листів), є додавання завдання до планувальника, який запускає робочу чергу щохвилини;

```php
$schedule->command('queue:work --stop-when-empty')
             ->everyMinute()
             ->withoutOverlapping();
```

Додавши цей код до планувальника в `app\Console\Kernel.php` (або в `bootstrap/app.php` у Laravel 11), а потім налаштувавши завдання cron для запуску планувальника, ви гарантуєте, що чергу обслуговуватиметься щохвилини.

Для серверів Cpanel інструкція Cron буде виглядати так:

```
* * * * * /usr/local/bin/php /home/{account_name}/live/artisan schedule:run
```

де `{account_name}` — обліковий запис користувача, під яким запущена cpanel, а live — папка Laravel.

Переклад замітки: [talltips.novate.co.uk/laravel/using-queues-on-shared-hosting-with-laravel](https://talltips.novate.co.uk/laravel/using-queues-on-shared-hosting-with-laravel)
