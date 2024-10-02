---
title: Установка української локалі в Laravel 11 та автоматичних перекладів
description: Занотовую як поставити українську локаль в Laravel 11 та
  налаштувати автоматичні переклади
category: Программування
tags:
  - Laravel
date: 2024-10-01
---
Щоб встановити українську локаль – перейдіть в `.env` та вкажіть:

```
APP_LOCALE=uk
```

Щоб встановити українську локаль в Laravel 11 потрібно встановити пакет [`laravel/lang`](https://laravel-lang.com/packages-lang.html) – додає переклад помилок.

```
composer require --dev laravel-lang/lang
php artisan lang:update
```

Автоматичні переклади можно робити з чудовим пакетом: [`laravel-locale-finder`](https://github.com/singlequote/laravel-locale-finder) – він автоматично визначиє конструкції `__('...')`, `@lang('...')`, створює файли перекладів та робить переклад через Google Translate (через безкоштовний API).

```
composer require singlequote/laravel-locale-finder --dev
php artisan locale:find --locales=en,uk
```

Щоб мати переклад полів в помилках, і якщо використовується похідний клас від `FormRequest` для валідації запитів до контроллера, то в цьому класі можно вказати назви полів:

```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePostRequest extends FormRequest
{
    //...

    public function attributes(): array
    {
        return [
            "title" => __("Title"),
            "body" => __("Body"),
            "feed_id" => __("Feed"),
        ];
    }
}
```
