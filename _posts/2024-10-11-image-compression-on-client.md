---
title: Стиснення зображень на клієнті
description: Занотовую бібліотеку, яка робить стиснення зображень на клієнті
category: Программування
tags:
  - Images
  - JavaScript
  - S3
date: 2024-10-11
---
У мене час від часу виникає задача зберігати зображення в S3/R2, проте сховище не резинове, а потік зображень доволі великий. Одне з рішень – стискати зображення на бекенді, проте я мало бачу інформації про стискання зображень на клієнті, хоча це в браузері є таке API, як [Canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API), котре може робити масштабування. Пошук дав результат, я знайшов бібліотеку [browser-image-compression](https://www.npmjs.com/package/browser-image-compression) яка робить стискання в браузері клієнта. Розберемо опції.

Набір опцій наступний:

```js
const options: Options = { 
  maxSizeMB: number,            // максимальний обʼєм зображення в мегобайтах (за замовчуванням: Number.POSITIVE_INFINITY)
  maxWidthOrHeight: number,     // максимальна довжина та висота зображення (за замовчуванням: undefined)
                                // проте автоматично зображення скейлиться до максимально возможного розміру Canvas браузера.
                                // Перевірте максимальні значення Canvas.
  onProgress: Function,         // опційно, функція, яка отримує аргумент та передає прогрес зжимання (percentage, від 0 до 100) 
  useWebWorker: boolean,        // опційно, використовувати многопоточність завдяки воркеру, резервно масштабування робиться в головному потоці (default: true)
  libURL: string,               // опційно, посилання на JS файл бібліотеки для імпортування веб-воркера (за замовчуванням: https://cdn.jsdelivr.net/npm/browser-image-compression/dist/browser-image-compression.js)
  preserveExif: boolean,        // опційно, чи потрібно зберігати Exif метадані для JPEG  наприклад, Camera model, Focal length, та подібне (за замовчуванням: false)

  signal: AbortSignal,          // опційно, сигнал для відміни сжимання

  // наступні опції для продвинутих користувачів
  maxIteration: number,         // опційно, максимальна кількість кроків для зжимання зображення (за замовчуваням: 10)
  exifOrientation: number,      // опційно, дивіться https://stackoverflow.com/a/32490603/10395024
  fileType: string,             // опційно, переписати fileType наприклад, 'image/jpeg', 'image/png' (за замовчуванням: file.type)
  initialQuality: number,       // опційно, початкова якість, число між 0 та 1 (за замовчуванням: 1)
  alwaysKeepResolution: boolean // опційно, тільки зменшити якість, завжди зберігати оригінальні ширину та довжину (за замовчуванням: false)
}
```

Опцій достатньо, щоб перетворити 6 Мб зображення на 600 Кб. Працює доволі швидко, щоб вбудувати в процес перед завантаженням на сервер (можно в моменті додавання зображення). Користувач може і не помітити різниці по часу завантаження. Я ще додав правило по якому зображення до 1 Мб взагалі не обробляються, обробляються тільки ті, що більше 1 Мб.

Значно покращився UX, бо користувачу тепер не треба шукати інструмент для зменшення зображення – він вже вбудований в процес, S3/R2 сховиже тепер не заповнюється занадто швидко, а сервер не виконує зайвої роботи, по мережі передаються не мегобайти, а кілобайти. Виглядає як оптимальне рішення. Єдиний ймовірний недолік, що всеж таки ми зберегаємо не оригінальне зображення, а його зтиснуту версію. Якщо потрібен оригінал – таке рішення не підійде.