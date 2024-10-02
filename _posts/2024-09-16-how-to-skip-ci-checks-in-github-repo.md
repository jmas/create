---
title: Як пропустити CI перевірки в репозиторії Github?
description: Чому потрібно пропускати запуск перевірок CI? Як пропускати CI
  перевірки в Github
category: Программування
tags:
  - Reprose
  - Krokom.app
date: 2024-09-16
---
Чому потрібно пропускати запуск перевірок CI? Для прикладу, у мене є репозиторій [jmas/dev-blog](https://github.com/jmas/dev-blog) де хоститься цей сайт. Кожен коміт провокує запуск CI і подальшу збірку та деплой. Коли я редагую сайт через [Reprose](https://reprose.pp.ua), то кожна зміна, як то запис конфігурації, створює окремий коміт. Проте конфіг Reprose потрібен тільки фронтовій апці і не впливає на контент самого сайту. Тому коли відбувається запис конфігурації в репозиторій запускати перевірки немає сенсу.

В офіційних доках Github є згадування про декілька способів пропустити запуск CI:

* [Додавання в кінці commit message через дві строки `skip-checks: true`](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)
* [Додавання команди `[skip ci]` в commit message](https://docs.github.com/en/actions/managing-workflow-runs-and-deployments/managing-workflow-runs/skipping-workflow-runs)

Я перевірив обидва. Додавання `skip-checks: true` не спрацювало. Додавання `[skip ci]` працює коректно.  Наводжу два коміти:

* [Коміт з вимкненням перевірок CI черезя `skip-checks: true`](https://github.com/jmas/dev-blog/commit/ad17a51e71123704f433d67ee5a153dffd8a5056)
* [Коміт з вимкненням перевірок CI через `[skip ci]`](https://github.com/jmas/dev-blog/commit/7eaf1cee07dbd05f2d48602ae03b5fdadac37d62)

Можно звернути увагу на зелену галочку в першому коміті і її відсутність в другому. Це свідчить що спосіб `skip-checks: true`  в моєму випадку не спрацював і треба використовувати `[skip ci]`.

Якщо є ідеї чому перший спосіб не працює – пишіть в коментарях.
