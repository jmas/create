---
title: Відправка форм та показ помилок в кращий спосіб
description: Тестую приємний підхід до відправки форм, котрий використовує
  валідацію вбудованую в браузер для показу помилок
category: Программування
tags:
  - JavaScript
  - Browser API
  - Client-side form validation
  - Laravel
  - AxiosJS
  - AlpineJS
date: 2024-10-02
---
В проєктах я часто зтикаюся з валідацією, котру постійно потрібно налаштовувати. Вона складна, вона незручна. Я згадав про те що в браузері вже вбудована валідація форм, коли додати до поля `required` то форму неможливо відправити та показується поповер який явно інформує користувача про проблему з цим конкретним полем. Проте це клієнтська валідація, а ми працюємо з сервером. З першого погляду, ця валідація не підходе коли ми відправляємо запит на сервер, а вже потім хочемо показати помилку в конкретному полі.

Для того щоб показувати помилки ми зазвичай робимо окремі теги, які знаходяться одразу під інпутом, накшталт:

```html
<input type="text" name="email" />
<span class="error">Такий email вже зареєстровано</span>
```

Проте, подивившись на документацію [Client-side form validation](https://developer.mozilla.org/en-US/docs/Learn/Forms/Form_validation) можно знайти функції `setCustomValidity()` та `reportValidity()`.

Функція [`setCustomValidity()` ](https://developer.mozilla.org/en-US/docs/Web/API/HTMLObjectElement/setCustomValidity) дозволяє встановити текст помилки для конкретного інпута.

Функція [`reportValidity()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reportValidity) змушує форму показати поповер з текстом помилки у першому інпуту який її має.

Я вирішив зробити наступне: я відправляю форму на бекенд через [AxiosJS](https://axios-http.com/docs/intro), роблю валідацію у [Laravel FormRequest](https://laravel.com/docs/11.x/validation#form-request-validation), отримую помилки на фронтенді у вигляді обʼєкта з назвами полів та текстами помилок. Для кожного інпута у формі я намагаюся знайти відповідний текст помилки. Після чого встановлюю інпуту помилку через `setCustomValidity()`. Після того як помилки встановлено викликаю `reportValidity()` і браузер показує помилки користувачу. Додатково я ще встановлюю формі `data-message` (загальний текст помилки) та `data-busy` (встановлюється у моменті відправлення запиту на сервер), котрі можно відображати через стилі.

Код функції `sendForm()` в `utils/send_form.js`:

```js
import { AxiosError } from "axios";

function setFormErrors(form, errors) {
  Array.from(form.elements).forEach((element) => {
    const name = element.getAttribute("name");

    if (!name) {
      return;
    }

    if (errors[name]) {
      element.setCustomValidity(errors[name][0]);
    } else {
      element.setCustomValidity("");
    }
  });
}

export async function sendForm(url, form, api) {
  form.removeAttribute("data-message");
  form.toggleAttribute("data-busy", true);

  setFormErrors(form, {});

  try {
    return await api.post(url, new FormData(form));
  } catch (error) {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message || error.message;
      const errors = error.response?.data?.errors || {};

      form.setAttribute("data-message", message);

      setFormErrors(form, errors);

      form.reportValidity();
    } else {
      throw error;
    }
  } finally {
    form.toggleAttribute("data-busy", false);
  }
}
```

Приклад виклику у компоненті AlpineJS `componsnets/postform.js`:

```js
import { sendForm } from "../utils/send_form";
import api from "../utils/api";

export default () => {
  return {
    async submit() {
      await sendForm("/posts", this.$root, api);
    },
  };
};
```

Важливим моментом є те, що в інстансі [AxiosJS](https://axios-http.com/docs/intro) треба вказати, що клієнт очикує JSON від Laravel в `utils/api.js`:

```js
const instance = axios.create({
  baseURL: 'http://localhost', // URL бекенда
  timeout: 5000,
  headers: {
    accept: "application/json",
  },
});

export default instance;
```