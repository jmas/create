---
title: Автоматичний імпорт для AplineJS компонентів використовуя ViteJS
description: Занотовую спосіб автоматично підвантажувати AlpineJS компонентів,
  використовуя динамічний імпорт в ViteJS
category: Программування
tags:
  - JavaScript
  - ViteJS
  - AlpineJS
date: 2024-09-30
---
ViteJS має декілька вбудованих функцій, які допомогають працювати з файлами в директорії проєкта.

## [`import.meta.glob()`](https://vitejs.dev/guide/features#glob-import)

Дозволяє підвантажити всі файли за паттерном в JS обʼєкт.

## [`import()`](https://vitejs.dev/guide/features#dynamic-import)

Дозволяє імпортувати та динамічно підвантажити контент файлу.

Поєднавши ці дві функції я отримав можливість автоматичного завантаження AlpineJS компонентів, просто створивши директорію, а в ній файл.

Далі функція, яка автоматично зареєструє в скоупі [`window`](https://developer.mozilla.org/en-US/docs/Web/API/Window) функції з результатів роботи `import.meta.glob()`:

```js
export function registerModules(modules) {
  Object.entries(modules).forEach(
    ([path, _module]) =>
      (window[path.split("/").slice(2, -1)] = _module.default),
  );
}
```

Приклад реєстрації компонентів:

```js
registerModules(
  import.meta.glob("../components/**/index.js", {
    eager: true,
  }),
);
```

Особливість роботи `import.meta.glob()` полягає в тому, що паттерн в функцію потрібно передавати в явному вигляді, а не як змінну, тому що Vite не може розрулити що знаходиться в змінній, бо, вирогідно що данний імпорт Vite шукає за чимось накшталт регулярки і на данному етапі зборки у Vite немає можливості побудувати AST, або запустити рантайм, або це банально дорога операція.
