---
title: Враження від використання Resources, Observers в Laravel та їх
  використання для пришвидшення завантаження контенту в SPA
description: Ділюся досвідом використання Resources, Observers та оптимізацією
  завантаження контенту
category: Программування
tags:
  - Laravel
  - Cloudflare
  - Observers
  - Resources
date: 2024-10-16
---
Ресурс або Resource – це спеціалізований клас в Laravel, який використовується переважно в API для формування відповіді цього самого API.

Це, на перший погляд, може здатися зайвою абстракцією, бо чи не простіше повертати звичайний JSON з контроллера. Проте досвід підказує, що ця абстракція дає додаткову гнучкість та уніфікацію. Можно думати про ресурс як про View у контексті API.

Наприклад, є модель `Post` у неї є відносина `image(): BelongsTo` з моделлю `Image`. Сам `Image` має атрибут `url`. Я хочу отримувати в API пост, проте не хочу показувати атрібути моделі `Image`, хочу просто щоб в полі `post.image` лежав URL з моделі `Image`.

Наш ресурс `PostResource` буде виглядати наступним чином:

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PostResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "image" => $this->image?->url,
        ];
    }
}
```

Таким чином ми не показуємо фронтенду зайвих даних і спрощуємо структуру даних, які потрібні на фронті. Плюс маємо абстракцію де можемо робити прийнятну для фронтенду структуру, не міняючи контролер.

В масштабі це виглядає ще цікавіше. Для прикладу, мені потрібно показати стрічку постів. Маємо сутність `Update`, яка має відносину `BelongsTo` з `Post`. В ресурсі `UpdateResource` ми звертаємося до `PostResource` щоб відформатувати поле `post`.

```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UpdateResource extends JsonResource
{
    public static $wrap = null;

    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "post" => (new PostResource($this->post))->toArray($request),
        ];
    }
}
```

Таким чином я отримав подібність до вкладених View для API, що виявилося дуже зручним підходом.

Спостерігач, або Observer – спеціалізований клас в Laravel, в котрому я можу описати так звані хуки, за допомогою яких можу відслідковувати життєвий стан будь якої моделі і робити додаткові дії відповідно до змін які відбуваються з моделлю.

Покажу один конкретний приклад, який робить дамп моделі за допомоги ресурсу в S3/R2, щоб зробити завантаження контенту на клієнті не з сервера, а з CDN, що знімає навантаження на сервер та пришвидшує завантаження, тому що статика.

Ресурс я вже описав раніше, показую Observer.

```php
<?php

namespace App\Observers;

use App\Http\Resources\PostResource;
use App\Models\Post;
use App\Utils\ContentPaths;
use App\Utils\ContentStorage;

class PostObserver
{
    public function created(Post $post): void
    {
        $post->refresh();

        $path = app(ContentPaths::class)->getPostPath($post->getFilename());

        app(ContentStorage::class)->store(
            $path,
            (new PostResource($post))->toJson()
        );
    }

    public function updated(Post $post): void
    {
        $post->refresh();

        $path = app(ContentPaths::class)->getPostPath($post->getFilename());

        app(ContentStorage::class)->store(
            $path,
            (new PostResource($post))->toJson()
        );
    }
}
```

Цей спостерігач зареєстрований в `AppServiceProvider.php`.

```php
<?php

namespace App\Providers;

use App\Observers\PostObserver;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Post::observe(PostObserver::class);
    }
}
```

В самому спостерігачі я підписуюсь на події `created` та `updated` і за допомогою класів `ContentPaths` та `ContentStorage` роблю дамп ресурса `PostResource` в CDN.

Цікавий момент, що `$post->getFilename()` формує назву файлу по ID моделі `sha1('post:' . $this->id) . '.json'`.

На фронтенді я маю ID посту з URL і отримую пост з CDN:

```js
const { data } = await cdn.get(await contentPaths.getExternalPath(id));
```

В данному прикладі `cdn` це інстанс Axios зі сконфігурованим URL на R2. Функція `getExternalPath` робить ту саму работу, що ми робили раніше на бекенді – формує адресу до файлу по ID поста, використовуя SHA-1.

```js
async getExternalPath(id) {
  return `/p/${await digest(`post:${id}`, "SHA-1")}.json`;
}
```

В результаті за допомогою ресурсу та спостерігача я отримую автоматичний дамп моделі в CDN. Додатково я маю можливість отримати динамічну версію моделі в JSON напряму з API. Будь які зміни в форматі я додаю в ресурс, що впливає одразу на API та на CDN версію моделі.