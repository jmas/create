---
title: Підхід до організації JS утіліт що спрощує рефакторинг
description: Занотовую спостереження або підхід який спростив мені рефакторинг
category: Программування
tags:
  - JavaScript
date: 2024-10-07
---
Для прикладу у мене є директорія з утілітами:

```
drwxr-xr-x  12 alex  staff   384  7 жов 12:49 .
drwxr-xr-x   7 alex  staff   224  2 жов 00:05 ..
-rw-r--r--   1 alex  staff    74  7 жов 00:54 local_store.js
-rw-r--r--   1 alex  staff    76  7 жов 00:54 session_store.js
-rw-r--r--   1 alex  staff   452  7 жов 12:51 store.js
```

Є базовий клас `Store` та похідні інстанси `LocalStore` та `SessionStore`.

Спочатку клас `Store` був не класом, а обʼєктом:

```js
export default {
  storage: sessionStorage,

  get(key, defaultValue = null) {
    if (this.storage[key]) {
      return JSON.parse(this.storage[key]);
    }

    return defaultValue;
  },

  set(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }
}
```

Котрий можно було імпортувати наступним чином:

```js
import sessionStore from './utils/store';
```

Далі знадобилося використовувати два окремих стора, `sessionStorage` та `localStorage`. Коли я модифікую обʼєкт напряму, вказуя потрібний стор – це впливає на інші частини застосунка. Тому треба реорганізувати обʼєк в клас, щоб мати можливість передавати потрібний стор в конструкторі.

Фінальна версія `Store` виглядає так:

```js
export default class Store {
  storage;

  constructor(storage = sessionStorage) {
    this.storage = storage;
  }

  get(key, defaultValue = null) {
    if (this.storage[key]) {
      return JSON.parse(this.storage[key]);
    }

    return defaultValue;
  }

  set(key, value) {
    this.storage.setItem(key, JSON.stringify(value));
  }

  has(key) {
    return this.storage.getItem(key) !== null;
  }

  remove(key) {
    this.storage.removeItem(key);
  }
}
```

А інстанси для окремих сторов так:

```js
import Store from "./store";

export default new Store(sessionStorage);
```

```js
import Store from "./store";

export default new Store(localStorage);
```

В місцях де використовується стор довелося зробити мінімальний рефакторинг, замінив імпорти:

```js
- import store from "./utils/store";
+ import store from "./utils/local_store";
```

Підіх полягає в наступному:

1. Поки нам не потрібен клас (конфігурувати обʼєкт) – робимо `export default` обʼєкту
2. Коли потрібно конфігурувати обʼєкт – створюємо клас, та робимо `export default` цього класу
3. Додаємо файли які роблять `export default` обʼєктів на основі класу

Таким чином єдине що потрібно змінювати в місцях використання – це імпорти. Це ще не DI, але спрощує рефкторинг.