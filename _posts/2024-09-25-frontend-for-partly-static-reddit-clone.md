---
title: Як виглядає фронтент для частково статичного клона Reddit
description: Я маю позитивний досвід роботи з Jekyll та Tailwind, що спокушає
  мене й надалі використовувати ці технології для будівництва статичного клону
  Reddit
category: Думки
tags:
  - Jekyll
  - Reddit
  - Tailwind
  - Vite
  - Hotwire Turbo
date: 2024-09-25T00:00:00.000Z
---
Я маю позитивний досвід роботи з Jekyll та Tailwind, що спокушає мене й надалі використовувати ці технології для будівництва статичного клону Reddit. Хочу занотувати й інші бібліотеки з котрими в мене позитивний досвід роботи в контексті Jekyll.

## Vite плагін Jekyll для зборки JS/CSS

Jekyll доволі спортанський двіжок, тому спочатку я подумав, що мені доведеться робити зборку ассетів десь поряд, але знайшов корисний плагін для зборки, який повністю покриває мої вимоги: зборку JS/CSS, перезборку при змінах, підтримка Tailwind. Єдиним недоліком є що інколи не бачить зміни в CSS файлах і доводиться примсово змінювати CSS, щоб тригернути перезбірку. Мабуть, це тому що інколи зміни в декольких файлах відбуваються дуже шивдко і наступна зміна відбовається в момент, коли працює збірка попередньої зміни. Треба погратися з опцією Vite [watch.skipWrite](https://rollupjs.org/configuration-options/#watch-skipwrite).

- Посилання: [ElMassimo/jekyll-vite](https://github.com/ElMassimo/jekyll-vite).

## Tailwind як фреймворк для CSS

Зізнаюся, я недооцінював [Tailwind](https://tailwindcss.com/). Точніше, я до нього ставився скіптично через те що доводиться писати купу классів в HTML, через що шаблони перетворюються на смітник. Проте, я почав використовувати директиву [`@apply`](https://tailwindcss.com/docs/functions-and-directives#apply) і переніс увесь жах списків классів у CSS фали. Тепер використовую підхід: спочатку пишу список классів в шаблоні, потім коли потрібно перевикористати список – виношу в клас. До самого фреймворку нарікань немає, працюю зі стандартним `tailwind.config.js`, лише додав до конфігу `vite.config.ts` наступне:

```ts
import { defineConfig } from "vite";
import RubyPlugin from "vite-plugin-ruby";
import tailwindcss from "tailwindcss";

export default defineConfig({
  plugins: [RubyPlugin()],
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
});
```

- Посилання: [tailwindcss.com](https://tailwindcss.com/).

## AlpineJS як JS фреймворк

Я дізнався про AlpineJS десь в 2022-2023, написав декілька успішних проєктів з його використанням і вважаю його практичним замінником React та Vue. З моєї точки зору, він написаний настільки елегантно і має настільки мінімалістичний API, котрий покриває практично всі мої вимоги, що мені важко його з чимось порівнювати. Щось схоже є в Vue 1, AngularJS, LitHTML, проте все влаштовано набагато зрозуміліше, з меньшою кількістю кроків та сутностей.

Як і в Tailwind, AlpineJS дозволяє писати JS прям в HTML. Проте у мене наступний підхід: прості конструкції, які не заважають читанню коду, я залишаю в HTML, а основний код пишу в "компонентах". Чому компоненти в лапках? Бо це прості функції. Як приклад, [компонент головної сторінки Reprose](https://github.com/jmas/reprose/blob/main/_frontend/components/home/home.js):

```js
import auth from "../../utils/auth";

window.home = () => ({
  init() {
    if (auth.check()) {
      location.href = "/finder";
    }
  },

  login() {
    location.href = "/auth";
  },

  logout() {
    auth.clear();
    location.reload();
  },
});
```

Можно подивитися [як працювати з AlpineJS на прикладах репозиторія Reprose](https://github.com/jmas/reprose/tree/main/_frontend) – директорія `_frontend`. Можу виділити компонент [autocomplete.js](https://github.com/jmas/reprose/blob/main/_frontend/components/autocomplete/autocomplete.js) – це обгортка над [Awesomplete](https://projects.verou.me/awesomplete/) яка далася мені через велику напругу, проте я зрозумів що посилання на підключаємі бібліотеки не треба класти в стейт компонента, тому що AlpineJS намагається всі внутрощі компонента обгорнути в [Proxy()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy). Проксі це темна сторона AlpineJS, датабіндінг котрий вимагає знати про нього і вміти працювати з ним, наприклад знати про [Alpine.raw()](https://ryangjchandler.co.uk/posts/alpine-3-tips-and-tricks#content-5-unfurl--unwrap-proxy-with-alpineraw).

- Посилання: [alpinejs.dev](https://alpinejs.dev/).

## Single-Page Application завдяки Hotwire Turbo

Ця бібліотека додає обробники до всіх динамічних елементів на сторінці (посилання, форми) та робить перехід між сторінками через підгрузку контента через `fetch()`, тобто ви фактично залишаєтеся на тій самій сторінці, але підвантажування нового HTML відбувається в фоні. Ще бібліотека вміє завантажувати новий контент при наведенні курсора на посилання, що пришвидшує завантаження контенту та створює у користувача враження миттєвості при переході на іншу сторінку.

Додається нескладно і майже нічого не вимагає при конфігурації "за замовчуванням":

```js
import * as Turbo from "@hotwired/turbo"
```

Проте, треба знати про [`<turbo-frame>`](https://turbo.hotwired.dev/handbok/frames), це такі активні частки сторінки в котрі може підвантажуватися контент з інших сторінок і туди можно перенаправляти посилання та форми.

- Посилання: [turbo.hotwired.dev](https://turbo.hotwired.dev/).

## Генератор статичного сайту Jekyll

Дуже позитивні емоції, коли я згадую про Jekyll, тому що здається, що його потенценіал як зборщика для фронтенду недооцінений. Ми звикли до Vite/Webpack, нас не страшить репозторій з купою файлів на React, проте я засумував за простотою. Jekyll повертає відчуття передбачуванності – створив файл `index.html`, запустив `bundle exec jekyll serve` і побачив сторінку. Потрібні щаблони? Є темплейт-система [Liquid](https://jekyllrb.com/docs/liquid/) котра пропонує достатній набор конструкцій.

Проте щось окрім статики Jekyll згенерувати не здатен. Я використовую Jekyll як основу для створення статичного HTML каркасу в який буде підвантажвуватися контент з API на PHP або з Cloudflare R2. Не весь контент на сайті потребує динаміки. Складаю в Jekyll максимально все що рідко змінюється. Наприклад, є відносно динамічний список категорій – можно запускати перезбірку статики раз на день. По крон-Action в гітхабі брати `categories.json` з API та класти в `collections/categories.json`, створювати комміт, що буде запускати перезбірку. Таким чином розділ категорій буде відносно оновлений. Теж саме можно робити з тегами.

- Посилання: [jekyllrb.com](https://jekyllrb.com/);
- Тема, яка демонструє можливості Jekyll: [cotes2020/jekyll-theme-chirpy](https://github.com/cotes2020/jekyll-theme-chirpy);
- Reprose як приклад статичного редактора, який активно використовую Github API: [jmas/reprose](https://github.com/jmas/reprose), [reprose.pp.ua](https://reprose.pp.ua).

## Аудит імпортів з `vite-bundle-visualizer`, перенесення в динамічні імпорті

Потрібно не забувати виносити великі бібліотеки в окремі файли-чанки і підвантажувати їх динамічними [import()](https://vitejs.dev/guide/features#dynamic-import). Я наштовхнувся на проблему, що перезбірка Vite займає десь 10 секунд. Це мене не влаштувало і я вирішив подивитися що кладеться в бандл. Для цього я знайшов визуалізатор імпортів і знайшов, що більше 50% бандлу займав markdown редактор. Я одразу переніс його в [динамічний іморт](https://github.com/jmas/reprose/blob/main/_frontend/components/editor/editor.js#L28) – на UX це практично не вплинуло, проте швидість збірки тепер складає 1-3 секунди.

Запускається так – потрібно перейти у корінь проєкту де знаходиться `vite.config.ts` та запустити:

```bash
% npx vite-bundle-visualizer
vite v5.4.5 building for production...
✓ 256 modules transformed.
../public/vite/.vite/manifest-assets.json         0.00 kB │ gzip:   0.02 kB
../public/vite/.vite/manifest.json                0.90 kB │ gzip:   0.28 kB
../public/vite/assets/application-Bk0TIr6i.css   46.72 kB │ gzip:   8.62 kB
../public/vite/assets/index-BpMRkEUb.js         118.42 kB │ gzip:  26.67 kB │ map:   291.08 kB
../public/vite/assets/application-ztsoOpTm.js   230.53 kB │ gzip:  74.87 kB │ map:   925.13 kB
../public/vite/assets/easymde-BlVlLp7H.js       329.78 kB │ gzip: 109.50 kB │ map: 1,215.71 kB
✓ built in 2.45s

Generated at /var/folders/r1/k93_bcbd3jb2rph8_sqx7qnw0000gn/T/tmp-88006-5lpxzr7YHJ59/stats.html
```

- Посилання: [vite-bundle-visualizer](https://www.npmjs.com/package/vite-bundle-visualizer)

## Бібліотека для вставки SVG іконок для Jekyll

Бібліотека ще не протестована, проте в будь якому темплейтері шукаю плагін, який додає директиву для вставки SVG-іконок. Майже завжди знаходиться такий. Для Laravel Blade я використовую: [blade-ui-kit/blade-icons](https://github.com/blade-ui-kit/blade-icons). Залишаю посилання на бібліотеку в пості, щоб мати можливість повернутися та згадати про знахідку.

Посилання: [sdumetz/jekyll-inline-svg](https://github.com/sdumetz/jekyll-inline-svg)

## Велика колекція SVG іконок Tabler Icons

Огромна колекція SVG іконок, які вписуються майже в будь який дизайн. Вже декілька років працюю з цим ресурсом та робив їм донат. В колекції є майже все що мені потрібно в повсякденній розробці. Тим паче що з часом ще краще починаєш орієнтуватися в наборі, що сильно спрощує вибір.

Посилання: [tabler-icons.io](https://tabler-icons.io/)

## SVG-анімовані спіннери

Набор якісних анімованих SVG-спінерів. Можно підібрати під ситуацію. Подобається, що такий анімований спіннер можно покласти як SVG-бекграунд і спіннер буде працювати.

Посилання: [n3r4zzurr0/svg-spinners](https://github.com/n3r4zzurr0/svg-spinners)
