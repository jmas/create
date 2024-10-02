---
title: Створення власного User Provider для Laravel 11
description: Коли почав використовувати JWT Auth знадобилося створити Custom
  User Provider, який вміє отримувати користувача за email
category: Программування
tags:
  - PHP
  - Laravel
date: 2024-09-24
---
Я почав використовувати пакет [JWT Auth](https://jwt-auth.readthedocs.io/) для проєкта "частково статичний клон Reddit". І стикнувся зі сценарієм, коли в мене є JWT-токен з `email` і треба написати власний User Provider, щоб він вмів шукати користувача за `email` бо дефолтний User Provider працює лише з ID.

Контракт, котрий потрібно реалізувати наступний:

```php
<?php

namespace Illuminate\Contracts\Auth;

interface UserProvider
{
    public function retrieveById($identifier);

    public function retrieveByCredentials(array $credentials);

    public function validateCredentials(Authenticatable $user, array $credentials);

    public function retrieveByToken($identifier, $token);

    public function updateRememberToken(Authenticatable $user, $token);

    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false);
}
```

В цьому контракті нас цікавлять методи: `retrieveById()`, `retrieveByCredentials()`, `validateCredentials()` інші методи можно залишити пустими, так як вони потрібні для роботи з токеном для функціоналу `Remember me`, який я не використовую.

Створюємо файл профайдера `app/Providers/CustomUserProvider.php`:

```php
<?php

namespace App\Providers;

use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Auth\UserProvider as UserProviderContract;

class CustomUserProvider implements UserProviderContract
{
    public function retrieveById($identifier)
    {
        return User::where("email", $identifier)->first();
    }

    public function retrieveByCredentials(array $credentials)
    {
        return User::where("email", $credentials["email"])->first();
    }

    public function validateCredentials(
        Authenticatable $user,
        array $credentials
    ) {
        return !empty($credentials["email"]);
    }

    public function retrieveByToken($identifier, $token)
    {
        return null;
    }

    public function updateRememberToken(Authenticatable $user, $token)
    {
    }

    public function rehashPasswordIfRequired(
        Authenticatable $user,
        array $credentials,
        bool $force = false
    ) {
    }
}
```

Після чого треба зареєструвати новий провайдер в `app/Providers/AppServiceProvider.php`:

```php
<?php

namespace App\Providers;

//...

class AppServiceProvider extends ServiceProvider
{
    //...

    public function register(): void
    {
        Auth::provider("custom", function ($app, array $config) {
            return new CustomUserProvider();
        });
    }

    //...
}
```

Далі необхідно вказати в конфігу `config/auth.php`:

```php
<?php

return [
    //...

    "guards" => [
        "api" => [
            "driver" => "jwt",
            "provider" => "users",
        ],
    ],

    //...

    "providers" => [
        "users" => [
            "driver" => "custom",
            "model" => env("AUTH_MODEL", App\Models\User::class),
        ],
    ],

    //...
];
```
