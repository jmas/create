---
title: Як отримати виписку з рахунку Monobank використовуючи Monobank API
description: Розбираю декілька запитів для отримання виписки за рахунком через Monobank API
category: Программування
tags:
  - Monobank
  - Банкінг
  - NodeJS
date: 2025-04-28T00:00:00.000Z
---
Вирішив витягти і збергіти у форматі CSV дані за власним рахунком. Потім ці дані можно візуалізувати у вигляді графіку і проаналізувати витрати з метою оптимізації.

Скрипт використовує NodeJS. Процес отримання даних складається з двох кроків.

## Крок 1: Отримання Monobank Token

Щоб отримати токен потрібно перейти на сторінку [API Монобанку](https://api.monobank.ua/index.html) і увійти, відсконував QR код через додаток монобанку.

На сторінці потрібно створити новий токен, скопіювати і далі використовувати в наступному коді.

## Крок 2: Отримання ID аккаунту

```js
import fs from 'node:fs';

const TOKEN = '<Monobank Token>';

async function getClientInfo() {
  const response = await fetch('https://api.monobank.ua/personal/client-info', {
    headers: {
      'X-Token': TOKEN
    }
  });
  return await response.json();
}
```

## Крок 3: Отримання виписки за аккаунтом за останній тиждень

```js
async function getAccountStatement(account, from, to) {
  const response = await fetch('https://api.monobank.ua/personal/statement/{account}/{from}/{to}'.replace('{account}', account).replace('{from}', from).replace('{to}', to), {
    headers: {
      'X-Token': TOKEN
    }
  });
  return await response.json();
}
```

## Як користуватися?

Викликати функцію `console.log(await getClientInfo())` і отримати список аккаунтів і обрати ID потрібного. Далі виконати наступну функцію `console.log(await getAccountStatement('ACCOUNT_ID', new Date().getTime() - 24 * 60 * 60 * 1000 * 7, new Date().getTime())` і ви отримаєте виписку за отсанній тиждень.

## Як зберегти в CSV

Наступний код збереже виписку у CSV файл `data.csv`.

```js
try {
    const data = await getAccountStatement('ACCOUNT_ID', new Date().getTime() - 24 * 60 * 60 * 1000 * 7, new Date().getTime());
    const result = data.map((item) => `${item.time};${item.description};${item.amount};${item.balance}`).join('\n');
    fs.writeFileSync('./data.csv', result);
  } catch (error) {
    console.log(error);
  }
```

В ідеалі можно автоматизувати витягання виписки і формувати графік для подальшого аналізу витрат.