---
title: Web Push через Laravel
description: Занатовую бібліотеку, яка потрібна для створення веб-пушів в Laravel
category: Программування
tags:
  - PHP
  - Laravel
date: 2024-09-25
---
Веб-пуші це спосіб доставки повідомлень прямо у браузер клієнта через [Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API). Я планую використовувати веб-пуші для доставки сповіщень в статичному клоні Reddit. Я не буду одразу будувати складну систему нотіфікацій та їх збереження на сервері, а додам два канали [нотіфікацій в Laravel](https://laravel.com/docs/11.x/notifications): email та web-push та буду відправляти нотіфікації в моменті, коли сталася дія, так ми будемо економити на запитах до бекенду.

**Ресурси для запровадження Web Push нотифікацій:**

- [Обзорна статя як працює Web Push](https://web.dev/articles/push-notifications-overview);
- [Вичерпна інформація про те як зробити Web Push з точки зору клієнта](https://web.dev/explore/notifications);
- [Пакет для Laravel для запровадження канала доставки сповіщень через Web Push](https://laravel-notification-channels.com/pusher-push-notifications/);
- [Guthub репозиторій laravel-notification-channels/webpush](https://github.com/laravel-notification-channels/webpush) з прикладами кода.

**Дії, які будуть супроводжуватися нотифікаціями:**

- Новий пост в стрічці на яку підписані;
- Новий коментар в пості в якому ви автор;
- Новий коментар до коментаря в якому ви автор;
- Нова реакція на пост в якому ви автор;
- Нова реакція на коментар в якому ви автор.
