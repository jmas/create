---
title: Дизайн API для частково статичного клону Reddit
description: Докладний дизайн бази даних, структури статичних файлів в R2 та API
  для частково статичного клону Reddit
category: Думки
tags:
  - PHP
  - Cloudflare
  - MySQL
date: 2024-09-23T00:00:00.000Z
---
Як виглядає API для частково статичного клону Reddit, якщо АПІ писати самому. Я вже визначився з тим, що основний контент буде в JSON Feed і буде лежати в статиці в [Cloudflare R2](https://developers.cloudflare.com/r2/), проте я схиляюся до думки, що підписки, коментарі, реакції доцільніше тримати в динаміці. В [попередньому пості](https://create.pp.ua/%D0%B4%D1%83%D0%BC%D0%BA%D0%B8/2024/09/23/thoughts-about-tech-stack-for-reddit-clone) я писав про те що таку динаміку добре класти в Supabase, проте подумав що дешевше буде мати власноруч написані скріпти десь на хостінгу. Таким чином, якщо хостінг буде падати або працювати нестабільно користувачі все одно зможуть читати фіди, просто соціальний функціонал буде недоступний. А ми виграємо в тому що у нас розвʼязані руки в тому де хостити соціальний функціонал і кости на утримання сервера будуть значно нижчими.

Тож як повинен виглядати АПІ який буде розполагатися на власному хостінгу?

## Хеші

```
USER_HASH = SHA1(email + SALT)
POST_HASH = SHA1(POST_ID + SALT)
```

## Структура БД

```
updates
-------
record_type enum(POST|REPOST|COMMENT|REACT|SUBSCRIBE) INDEX
record_id INDEX
created_at INDEX

subscriptions
-------------
subscription_id INDEX
user_id USER_HASH INDEX
feed_url INDEX

posts
-----
post_id INDEX
user_id USER_HASH INDEX
feed_url
title
body
media_url

reposts
-------
repost_id INDEX
user_id USER_HASH INDEX
post_id INDEX
feed_url

comments
--------
comment_id INDEX
user_id USER_HASH INDEX
record_type enum(POST|COMMENT) INDEX
record_id INDEX
body
media_url

reactions
---------
reaction_id INDEX
user_id USER_HASH INDEX
type REACTION_TYPE
value INTEGER
record_type enum(POST|COMMENT) INDEX
record_id INDEX

counts
------
record_type enum(POST|COMMENT) INDEX
record_id INDEX
type REACTION_TYPE
value INTEGER
```

- `REACTION_TYPE` = `THUMBS_UP|THUMBS_DOWN|LAUGH|HOORAY|CONFUSED|HEART|ROCKET|EYES|VIEW|OPENING|COMMENT|REPOST`

**Статика в R2:**

Нехай в статиці буде мінімальний набір даних для функціонування сайту на читання. Все інше буде лежати в динаміці.

```
/u/{USER_HASH}/updates.json
/u/{USER_HASH}/{YEAR}/{MONTH}/{DAY}/updates.json
/u/{USER_HASH}/subscriptions.json
/p/{POST_HASH}/content.json
```

## Авторизація

Авторизацію доцільно тримати в Cloudflare функції, щоб користувач міг увійти, щоб отримати `:userhash` та власний список підписок. Це мінімум щоб почати читати сайт. Якщо користувач не залогінен – використовувати список підписок за замовчуванням – це список "спільні стрічки".

**Редірект на сторінку авторизації Google:**
```
> POST /login/google
< Status: 301
< Location: {URL_TO_OAUTH_PAGE}
```

**JWT-токен авторизованного користувача:**
```
> GET /login/google?code={OAUTH_CODE}
< Body: {"token": "{AUTH_JWT_TOKEN}"}
```

## Підписки

**Створити одну або більше підписок:**
```
> POST /subscriptions
> Authorization: Bearer {AUTH_JWT_TOKEN}
> Body: ["{FEED_URL}", "{FEED_URL}"]
< Status: 200
```

**Видалити підписку:**
```
> DELETE /subscriptions?feed_url={FEED_URL}
> Authorization: Bearer {AUTH_JWT_TOKEN}
< Status: 200
```

- `{FEED_URL}` – посилання на підписку `/u/{USER_HASH}`, `/t/{TOPIC}`, `/m/{MIRROR}`

## Пости

**Створити пост:**
```
> POST /posts
> Authorization: Bearer {AUTH_JWT_TOKEN}
> Body: {"title: "{TITLE}", "body": "{BODY}"}
< Status: 200
< Body: {"post_id": "{POST_ID}"}
```

**Редагувати пост:**
```
> PATCH /posts?post_id={POST_ID}
> Authorization: Bearer {AUTH_JWT_TOKEN}
> Body: {"title: "{TITLE}", "body": "{BODY}"}
< Status: 200
< Body: {"post_id": "{POST_ID}"}
```

**Видалити пост:**
```
> DELETE /posts?post_id={POST_ID}
> Authorization: Bearer {AUTH_JWT_TOKEN}
< Status: 200
```

## Коментарі

**Створити коментар:**
```
> POST /comments
> Authorization: Bearer {AUTH_JWT_TOKEN}
> Body: {"post_id": "{POST_ID}", "record_id": "{RECORD_ID}", "BODY": "{BODY}"}
< Status: 200
< Body: {"comment_id": "{COMMENT_ID}"}
```

**Редагувати коментар:**
```
> PATCH /comments?comment_id={COMMENT_ID}
> Authorization: Bearer {AUTH_JWT_TOKEN}
> Body: {"post_id": "{POST_ID}", "record_id": "{RECORD_ID}", "BODY": "{BODY}"}
< Status: 200
< Body: {"comment_id": "{COMMENT_ID}"}
```

**Видалити коментар:**
```
> DELETE /comments?comment_id={COMMENT_ID}
> Authorization: Bearer {AUTH_JWT_TOKEN}
< Status: 200
```

**Список коментарів:**
```
> GET /comments?record_type={RECORD_TYPE}&record_id[]={RECORD_ID}&record_id[]={RECORD_ID}
> Authorization: Bearer {AUTH_JWT_TOKEN}
< Status: 200
< Body: [{"record_type": "{RECORD_TYPE}", "record_id": "{RECORD_ID}", "comment_id": "{COMMENT_ID}", "body": "{BODY}"}]
```

- `{RECORD_TYPE}` – `post`, `comment`
- `{RECORD_ID}` – ID поста або коментаря

## Реакції

**Створити реакцію:**
```
> POST /reactions
> Authorization: Bearer {AUTH_JWT_TOKEN}
> Body: {"record_id": "{RECORD_ID}", "record_type": "{RECORD_TYPE}", "type": "{REACTION_TYPE}"}
< Status: 200
< Body: {"reaction_id": "{REACTION_ID}"}
```

**Змінити реакцію:**
```
> PATCH /reactions
> Body: {"record_id": "{RECORD_ID}", "record_type": "{RECORD_TYPE}", "type": "{REACTION_TYPE}"}
< Status: 200
< Body: [{"record_type": "{RECORD_TYPE}", "record_id": "{RECORD_ID}", "type": "{REACTION_TYPE}"}]
```

**Видалити реакцію:**
```
> DELETE /reactions?record_id={RECORD_ID}&record_type={RECORD_TYPE}
< Status: 200
< Body: [{"record_type": "{RECORD_TYPE}", "record_id": "{RECORD_ID}", "type": "{REACTION_TYPE}"}]
```

**Список реакцій:**
```
> GET /reactions?record_type={RECORD_TYPE}&record_id[]={RECORD_ID}&record_id[]={RECORD_ID}
< Status: 200
< Body: [{"record_type": "{RECORD_TYPE}", "record_id": "{RECORD_ID}", "user_id": "{USER_ID}", "type": "{REACTION_TYPE}", "value": 0}]
```

- `{RECORD_TYPE}` – `post`, `comment`
- `{RECORD_ID}` – ID поста або коментаря
- `REACTION_TYPE` = `THUMBS_UP|THUMBS_DOWN|LAUGH|HOORAY|CONFUSED|HEART|ROCKET|EYES|VIEW|OPENING|COMMENT|REPOST`

## Підрахунки

**Список підрахунків:**
```
> GET /counts?record_type={RECORD_TYPE}&record_id[]={RECORD_ID}&record_id[]={RECORD_ID}
< Status: 200
< Body: [{"record_type": "{RECORD_TYPE}", "record_id": "{RECORD_ID}", "user_id": "{USER_ID}", "type": "{REACTION_TYPE}", "value": 0}]
```

- `{RECORD_TYPE}` – `post`, `comment`
- `{RECORD_ID}` – ID поста або коментаря

Ще в контексті підрахунків буде такий параметр посту як `engagement` = `SUM(reactions)`
