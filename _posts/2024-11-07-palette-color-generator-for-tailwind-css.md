---
title: Генератор кольорових палет для TailwindCSS
description: В замітці є код для вилучення палети з DOM та приклад встановлення
  палети у конфіг Tailwind
category: Программування
tags:
  - CSS
  - Tailwind
date: 2024-11-07
---
Мені знадобилося згенерувати палету для Tailwind, проте хотілося це зробити максимально просто.

Генератор палет знаходиться за посиланням [m2.material.io/design/color/the-color-system.html](https://m2.material.io/design/color/the-color-system.html#tools-for-picking-colors).

З його допомогою можно обрати головний колір палети та отримати відтінки цього кольору і комплементарні та додаткові кольори.

Я зробив сніппет, який домопоже автоматично діставати палети з документа через Chrome Developer Tools.

```js
function extract(el) {
    const _labels = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
    const _values = Array.from(el.querySelectorAll('.color-palette__cell-hex-value')).map(el => el.textContent);
    return [el, labels.reduce((result, label, index) => { result[label] = _values[labels.length - index - 1]; return result; }, {})];
}

Array.from(document.querySelectorAll('.color-palette__row')).forEach(el => console.log(extract(el)));
```

Отримані палети виглядають так:

```js
[
    { /* Посилання на елемент в документі, щоб легше ідентифікувати вилучену палету */ },
    {
        "50": "#ffebd8",
        "100": "#ffcca1",
        "200": "#f9ab69",
        "300": "#f28a33",
        "400": "#ee7104",
        "500": "#e75900",
        "600": "#e34d00",
        "700": "#dd3900",
        "800": "#d51f01",
        "900": "#ca0009"
    }
]
```

Цю палету достатньо вставновити в Tailwind наступним чином:

```js
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./resources/**/*.{js,ts,jsx,tsx,php}",
        "./resources/js/**/*.{js,ts,jsx,tsx,php}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: "#ffebd8",
                    100: "#ffcca1",
                    200: "#f9ab69",
                    300: "#f28a33",
                    400: "#ee7104",
                    500: "#e75900",
                    600: "#e34d00",
                    700: "#dd3900",
                    800: "#d51f01",
                    900: "#ca0009",
                },
            },
        },
    },
};
```