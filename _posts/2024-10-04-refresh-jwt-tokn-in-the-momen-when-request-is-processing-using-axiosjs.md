---
title: Оновлення JWT токену авторизації в моменті виконання запиту використовуя
  AxiosJS
description: Якщо сервер відповів 401 Unauthorized це означає що час JWT токена
  закінчився і потрібно створити новий токен, як це зробити?
category: Программування
tags:
  - JWT
  - JavaScript
  - Laravel
  - AxiosJS
date: 2024-10-04
---
Я використовую JWT токен для авторизації запитів від користувача. JWT токен передбачає, що час від часу його треба міняти (токен має час придатності). В мене час придатності складає 1 годину.

Тож коли сервер відповів 401 Unauthorized це означає що час придатності токена сплив і потрібно сходити на сервер та обміняти старий токен на новий. Якщо це трапляється кожну годину, а ця процедура вимагає залученності користувача, то це виглядає не дуже зручно. Кожну годину користувач буде превходити у застосунок. Ні, це незручний UX. Заміну старого токену на новий можно прозводити в моменті запиту на сервер, для цього я використовую AxiosJS, котрий має зручний API для перехоплення запитів.

Такий вигляд має файл відповідальний за створення нового істансу AxiosJS `utils/api.js` з коментарями:

```js
import axios from "axios";
import auth from "./auth";

const instance = axios.create({
  baseURL: 'http://localhost',
  timeout: 5000,
  headers: {
    accept: "application/json",
  },
});

// Перехоплюємо всі запити на сервер
instance.interceptors.request.use(
  async (config) => {
    // Перевіряємо чи є авторизаційний токен в localStorage, якщо є то встановлюємо в якості заголовку
    if (auth.check()) {
      config.headers.set("authorization", `Bearer ${auth.get("access_token")}`);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Перехоплюємо всі відповіді від сервера
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
	  // Якщо статус каже про те що користувач не авторизований
    if (error.response.status === 401) {
		  // Робимо запит на отримання нового токена, використовуя старий токен
      const response = await instance.post("/auth");
			
			// Запомʼятовуємо новий токен в localStorage
      if (response.status === 200) {
        auth.set(response.data);

        return instance.request(error.config);
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
```