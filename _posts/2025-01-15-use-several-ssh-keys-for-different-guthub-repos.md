---
title: Як використовувати декілька SSH ключів для різних репозиторіїв GitHub
description: У мене виникла проблема, коли у мене є персональний і робочий
  аккаунти GitHub і мені потрібно робити пуши в різні репозиторії
category: Программування
tags:
  - Github
  - SSH
date: 2025-01-15
---
Відкрити Terminal, перейти в `~/.ssh`.

```
cd ~/.ssh
ls -la
```

Генеруємо два ключа: персональний `id_rsa` і робочий `id_rsa_work`. Якщо персональний ключ `id_rsa` вже присутній, можемо видалити його щоб згенерувати новий.

Команда для **видалення** ключа:

```
rm id_rsa
rm id_rsa.pub
```

Команда для **генерації** ключа:

```
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Виконуємо інструкції, виконуємо команду два рази, щоб отримати  `id_rsa` та `id_rsa_work`.

Створюємо конфіг `~/.ssh/config`. Якщо на його місті присутня директорія, як було в моєму випадку, спочатку **видаляємо** директорію:

```
rm -Rf ~/.ssh/config
```

Створюємо конфіг:

```
nano ~/.ssh/config
```

 В конфіг додаємо наступну інформацію:
 
 ```
 Host github.com-personal
	HostName github.com
	User git
	IdentityFile ~/.ssh/id_rsa

Host github.com-work
	HostName github.com
	User git
	IdentityFile ~/.ssh/id_rsa_work
 ```
 
 Зберігаємо, натиснувши Command+X (на маку) і Y.
 
 Тепер нам потрібно налаштувати використання ключів для різних репозиторіїв.
 
 Переходимо в персональний репозиторій `cd ~/personal-github-repo` і нам потрібно переналаштувати `origin` на використання хоста `github.com-personal`.
 
Виконуємо команду яка покаже поточний `origin`, в моєму випадку це `git@github.com:jmas/personal-repo.git`.

```
git remote get-url origin
```

Копіюємо адресу репозиторію, видаляємо та встановлюємо новий `origin` наступною командою, проте міняємо в адресі хост на `github.com-personal`:

```
git remote remote origin
git remote add origin `git@github.com-personal:jmas/personal-repo.git`
```

Робимо теж саме для робочого репозиторія. На цьому конфігурацію завершено. В моєму випадку довелося видалити з налаштувань аккаунту Github попередній ключ і додати новий, щоб SSH авторизація запрацювала.