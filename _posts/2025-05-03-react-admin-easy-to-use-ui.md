---
title: React Admin – інструмент для швидкого створення UI адмінки
description: Максимально абстрагований від дрібної роботи інструмент, який
  дозволяє за лічені хвилини створити інтерфейс для CRUD операцій і звʼязати
  його з бекендом
category: Программування
tags:
  - React
  - UI
  - PHP
  - JavaScript
  - CRUD
date: 2025-05-03
---
В попередньому пості я писав про [PHP-CRUD-API – інструмент для швидкого створення API](https://create.pp.ua/posts/fast-approach-of-creating-api-for-database-using-php-crud-api/), серед суміжних інструментів є дата провайдер для підключення до React Admin (скорочено RA) – інструменту для швидкого створення UI адмінки.

Головною відмінністю від фреймворків накшталт [Laravel Livewire](https://laravel-livewire.com/) / [Inertia](http://inertiajs.com/), [NextJS](https://nextjs.org/) є те що React Admin вимагає мінімальних затрат по часу. Наприклад, є ендпоінт котрий вертає JSON – RA пропонує компонент [ListGuesser](https://marmelab.com/react-admin/ListGuesser.html#listguesser) котрий перетворить ключі обʼєктів на назви стовпців таблиці і просто виведе дані. Окремою перевагою є [великий список інтеграцій з різними бекендами](https://marmelab.com/react-admin/DataProviderList.html). Навіть є [інтеграція з Google Таблицями](https://github.com/marmelab/ra-data-google-sheets) що дає можливість швидко робити PoC.

Схожими інструментами є [Payload CMS](https://payloadcms.com/), [Refine](https://refine.dev/). Payload CMS є адмінкою, лейаут котрої налаштовується через конфіг-файл. Недоліком є привʼязка до певного NodeJS бекенду і певної БД. Refine відвʼязаний від бекенду, проте також відвʼязаний від UI фреймворку, що ускладнює роботу. RA вдалося сфокусуватися на зменьшені часу на розробку.

Наступне [відео демонструє основи роботи з React Admin](https://www.youtube.com/watch?v=PyaSnpXssks), в ньому проілюстровані моменти підключення Data Provider, створення CRUD, створення та підключення Auth Provider.