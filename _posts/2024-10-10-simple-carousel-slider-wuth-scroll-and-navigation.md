---
title: Простий карусель-слайдер з підтримкою скрола та навігації
description: Занотовую приклад каруселі-слайдера на AlpineJS
category: Программування
tags:
  - JavaScript
  - AlpineJS
date: 2024-10-10
---
Зазвичай каруселі роблять за допомогою відємного margin та маніпуляції цим margin через кнопки навігації.

Я подумав, що не треба перевигадувати слайдер, який ітак підтримується браузером з коробки, це звичайний Scroll та умовний Scroll API.

Якщо покласти елементи в flexbox-контейнер, дати кожному слайду width 100% від контейнера та скролити за допомогою навігації у право чи ліво на width контейнера, то як раз отримаємо звичайну карусель. Тим паче ми можемо використовувати scroll snap, що дасть можливість "докручувати" карусель до потрібного слайда.

З браузероного Scroll API мені потрібна тільки функція `element.scrollTo()`, яка може прокручувати контейнер в потрібному напрямку на порібну кількість пікселів, а така опція як `behavior: "smooth"` додає плавності прокрутці.

Розглянемо наступний HTML:

```html
<div class="carousel" x-data="carousel">
    <div class="carousel-items" x-ref="items">
        <div class="carousel-item">1</div>
        <div class="carousel-item">2</div>
        <div class="carousel-item">3</div>
    </div>
    <button
        type="button"
        class="carousel-button carousel-button-start"
        x-bind:disabled="scrolledStart"
        x-on:click="prev"
    >
        &larr;
    </button>
    <button
        type="button"
        class="carousel-button carousel-button-end"
        x-bind:disabled="scrolledEnd"
        x-on:click="next"
    >
        &rarr;
    </button>
</div>
```

HTML складається з загального контейнера `carousel`, контейнера `carousel-items` який утримує слайди, та навігаційні кнопоки `carousel-button carousel-button-start` "попередній слайд", `carousel-button carousel-button-end` "наступний слайд".

Контейнеру задамо `postion`, щоб мати змогу позіціонувати кнопки відносно цього блоку.

```css
.carousel {
    position: relative;
}
```

Далі додамо стили контейнеру, який утримує слайди. Цей контейнер повинен мати відображення flexbox, щоб мати змогу розтушувати елементи всередені в горізонтальну лінію. Ще додамо `overflow` для скрола по горізонталі і заборонемо скрол по вертикалі. Також `scroll-snap-type` дасть змогу "докручувати" слайдер до потрібного слайду.

```css
.carousel-items {
    display: flex;
    width: 100%;
    flex-direction: row;
    gap: .75rem;
    overflow-y: hidden;
    overflow-x: scroll;
    scrollbar-width: none;
    scroll-snap-type: x mandatory;
}
```

Для елементів всередені `carousel-items` дамо ширину 100% контейнера, елемент буде мати пропорційну висоту 16:9.

```css
.carousel-item {
    display: flex;
    aspect-ratio: 16 / 9;
    min-width: 100%;
    align-items: center;
    justify-content: center;
    border-radius: .5rem;
    background-color: silver;
    scroll-snap-align: start;
}
```

Щодо кнопок, то їх спозіціонуємо у відповідні частини контейнера (зліва і зправа).

```css
.carousel-button {
    position: absolute;
    top: 0;
    bottom: 0;
    margin-top: auto;
    margin-bottom: auto;
    height: 2rem;
    width: 2rem;
    border-radius: 9999px;
    background-color: #000;
    padding: .25rem;
    color: rgb(255 255 255);
}

.carousel-button.carousel-button-start {
    left: .75rem;
}

.carousel-button.carousel-button-end {
    right: .75rem;
}
```

Перейдемо до JS, він буде написаний з використанням фреймворка [AlpineJS](https://alpinejs.dev/), проте цей код можно легко переписати на чистому JS.

```js
window.carousel = () => {
  let handleScroll, timer, cleanup;

  return {
    scrolledStart: false, // Флаг, який каже що контейнер .carousel-items проскролено до лівої межі
    scrolledEnd: false, // Флаг, який каже що контейнер .carousel-items проскролено до правої межі

    init() {
      // Функція, яка викликається щоразу як скорлиться контейнер .carousel-items, відслідковує
			// позицію скрола та встановлює флаги scrolledStart, scrolledEnd у відповідні значення
      handleScroll = () => {
        if (timer) {
          clearTimeout(timer);
        }

        timer = setTimeout(() => {
          this.scrolledEnd =
            Math.ceil(
              this.$refs.items.scrollLeft + this.$refs.items.clientWidth,
            ) >= Math.ceil(this.$refs.items.scrollWidth);
          this.scrolledStart = this.$refs.items.scrollLeft <= 0;
        }, 10);
      };

      handleScroll();

      this.$refs.items.addEventListener("scroll", handleScroll, false);
      addEventListener("resize", handleScroll, false);

      cleanup = () => {
        this.$refs.items.removeEventListener("scroll", handleScroll, false);
        removeEventListener("resize", handleScroll, false);
      };
    },

    destroy() {
      cleanup();
    },

    // Функція яка скролить контейнер .carousel-items на один слайд вправо (вперед)
    next() {
      const left =
        this.$refs.items.scrollLeft + this.$refs.items.clientWidth >=
        Math.ceil(this.$refs.items.scrollWidth)
          ? this.$refs.items.scrollWidth - this.$refs.items.clientWidth
          : this.$refs.items.scrollLeft + this.$refs.items.clientWidth;

      this.$refs.items.scrollTo({
        top: 0,
        left,
        behavior: "smooth",
      });
    },

    // Функція яка скролить контейнер .carousel-items на один слайд вліво (назад)
    prev() {
      const left =
        this.$refs.items.scrollLeft - this.$refs.items.clientWidth > 0
          ? this.$refs.items.scrollLeft - this.$refs.items.clientWidth
          : 0;

      this.$refs.items.scrollTo({
        top: 0,
        left,
        behavior: "smooth",
      });
    },
  };
};
```

Загальний результат можно переглянути за посиланням: [jsfiddle.net/jmas/g3r05pzu/13/](https://jsfiddle.net/jmas/g3r05pzu/13/).

<script async src="//jsfiddle.net/jmas/g3r05pzu/12/embed/"></script>