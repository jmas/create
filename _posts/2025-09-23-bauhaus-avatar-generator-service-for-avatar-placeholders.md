---
title: Bauhaus Avatar Generator – сервіс для генерації автарів-плейсхолдерів
description: Сервіс дозволяє згенерувати унікальну картинку в стилі баухаус з
  власною кольоровою темою
category: Проєкти
tags:
  - JS
  - Image Generation
  - SVG
  - Cloudflare
date: 2025-09-23T00:00:00.000Z
---
Сервіс дозволяє згенерувати унікальну картинку в стилі баухаус з власною кольоровою темою. Створений для інтеграції з додатками де є багато користувачів і у деяких з них може не бути встановленого зображення профілю.

Сервіс базується на NPM-пакеті, який я зібрав за допомогою CursorAI та Cloudflare Worker в якості бекенду. Код воркеру знаходиться в репозиторії проєкту. Пакет можно юзати і без звертання до сервісу, напряму встановивши пакет.

Сайт сервісу з інструкцією як створити URL: [bauhaus-avatar-generator.pp.ua](https://bauhaus-avatar-generator.pp.ua)

Github проєкту: [github.com/jmas/bauhaus-avatar-generator](https://github.com/jmas/bauhaus-avatar-generator)

Приклад інтеграції:
```html
<img src="https://bauhaus-avatar-generator.pp.ua/username.svg" />
```

Приклад на TypeScript:
```tsx
import { generateSVG, GenerateOptions } from "bauhaus-avatar-generator";

// Generate with custom size
const avatar = generateSVG("alice", { size: 256 });

// Generate with custom colors and weights
const avatar2 = generateSVG("bob", {
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
  weights: [30, 25, 20, 15, 10],
  size: 300,
});
```