---
title: API позиціонування прив’язки CSS або позіціювання поповерів
description: Нотатка про відносно новий браузерний Popover API, котрий виявився
  доволі складним у розумінні, проте дозволяє робити складні поповери
category: Программування
tags:
  - CSS
  - HTML
  - Popover API
date: 2024-09-26T00:00:00.000Z
---
Згадав про те що в браузерах завезли Popover API, котрий доволі стабільний, проте я його ніколи не використовував. Для поповерів використовував `<details>`, проте подивившись на поповери, вирішив спробувати. І знаєте, доволі обʼємний API, котрий дозволяє робити [складні випадаючі меню на простому HTML/CSS](https://css-irl.info/anchor-positioning-and-the-popover-api/).

Тож потенціал великий, а мені потрібно простий попап. І тут я стикнувся з тим, що в АПІ запхнули стільки всього, що зробили його доволі складним у розумінні. Проте я зумів зробити простий попап, який відпозіційовано по центру відносно кнопки:

```html
<button
    popovertarget="mypopover"
    style="anchor-name: --anchor_1"
>
	Show popover
</button>

<div
    id="mypopover"
    popover
    style="
        width: 200px;
        height: 200px;
        position-anchor: --anchor_1;
        margin: 0;
        top: anchor(--anchor_1 bottom);
        justify-self: anchor-center;
    "
>
    Popover content
</div>
```

- Повний гайд з купою прикладів за посиланням: [developer.chrome.com/blog/anchor-positioning-api](https://developer.chrome.com/blog/anchor-positioning-api);
- Ще непоганий гайд з прикладами: [oidaisdes.org/popover-api-accessibility.en](https://www.oidaisdes.org/popover-api-accessibility.en/)
