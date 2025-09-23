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
date: 2025-09-23
---
Сервіс дозволяє згенерувати унікальну картинку в стилі баухаус з власною кольоровою темою. Створений для інтеграції з додатками де є багато користувачів і у деяких з них може не бути встановленого зображення профілю.

Сервіс базується на NPM-пакеті, який я зібрав за допомогою CursorAI та Cloudflare Worker в якості бекенду. Код воркеру знаходиться в репозиторії проєкту. Пакет можно юзати і без звертання до сервісу, напряму встановивши пакет.

Сайт сервісу з інструкцією як створити URL: https://bauhaus-avatar-generator.pp.ua
Github проєкту: https://github.com/jmas/bauhaus-avatar-generator

Приклад інтеграції:
```html
<img src="https://bauhaus-avatar-generator.pp.ua/username.svg" />
```

Приклад на React:
```tsx
import React from "react";
import { generateSVG, GenerateOptions } from "bauhaus-avatar-generator";

interface AvatarProps {
  input: string;
  options?: GenerateOptions;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  input,
  options = { size: 200 },
  className,
}) => {
  const svg = generateSVG(input, options);

  return (
    <div className={className} dangerouslySetInnerHTML={{ __html: svg }} />
  );
};

// Usage
<Avatar input="user@example.com" options={{ size: 150 }} />;
<Avatar
  input="user@example.com"
  options={{
    size: 150,
    colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
    weights: [40, 30, 30],
  }}
/>;
```