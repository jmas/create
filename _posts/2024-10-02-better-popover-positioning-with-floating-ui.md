---
title: Покращене позіціювання поповерів з Floating UI
description: Занатовую досвід роботи з Floating UI + Popover API в контексті Firefox
category: Программування
tags:
  - Popover API
  - Floating UI
  - JavaScript
date: 2024-10-02T00:00:00.000Z
---
Popover API є позитивною апішкою, проте робота з анкорінгом (привʼязкою поповера до кнопки-трігера) зроблена вкрай неінтуітивно і до того ж не працює в Firefox. Я подивився чим можно замінити роботу з анкорінгом, і знайшов [PopperJS](https://popper.js.org/docs/v2/) та більш новий [FloatingUI](https://floating-ui.com/).

В мене вже був досвід з PopperJS і не можу згадати який саме, проте помʼятаю що лібка свою роботу робила непогано. Хоча, є відголоски негативного досвіду, тож там не було все гладко.

Спробував FloatingUI і можу сказати, що це, мабуть, найзручніша бібліотека для налаштування динамічного позіціонування для поповерів, діалогів і такого іншого.

Я зробив обгортку на AlpineJS для того щоб поповер міг себе правильно спозіціонувати відносно кнопки.

```js
import {
  computePosition,
  autoUpdate,
  offset,
  flip,
  shift,
} from "@floating-ui/dom";

export default () => {
  let removeAutoUpdate = () => {};
  let removeToggleListener = () => {};

  return {
    init() {
      const listener = () => {
        const referenceEl = document.activeElement;
        const floatingEl = this.$root;

        removeAutoUpdate();

        const placement =
          this.$root.getAttribute("data-popover-placement") || "bottom-end";
        const offsetValue =
          parseInt(this.$root.getAttribute("data-popover-offset"), 10) || 4;

        removeAutoUpdate = autoUpdate(referenceEl, floatingEl, async () => {
          const { x, y } = await computePosition(referenceEl, floatingEl, {
            strategy: "fixed",
            placement,
            middleware: [offset(offsetValue), flip(), shift()],
          });

          Object.assign(floatingEl.style, {
            left: `${x}px`,
            top: `${y}px`,
          });
        });
      };

      this.$root.addEventListener("toggle", listener);

      removeToggleListener = () => {
        this.$root.removeEventListener("toggle", listener);
      };
    },

    destroy() {
      removeAutoUpdate();
      removeToggleListener();
    },
  };
};
```

Також приводжу фрагмент коду для визову поповера:

```html
<button class="button" popovertarget="notifications-popover">Show popover</button>

<div
    id="notifications-popover"
    class="popover popover-notifications"
    popover
    x-data="popover"
>
	...
</div>
```

Головне що обраний метод працює в Firefox.