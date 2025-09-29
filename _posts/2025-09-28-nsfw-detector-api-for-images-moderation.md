---
title: Детектор NSFW для розпізновання зображень з шкідливим для роботи контентом
description: Скріпт базується на nsfwjs і є враппером для розгортання на Deno Deploy
category: Проєкти
tags:
  - DenoJS
  - JavaScript
  - NSFW
date: 2025-09-28
---
Зробив незамисловатий враппер, який являє собою детектор NSFW контента, тобто зображень сексуального та порнографічного характера. Цей детектор базується на TensorFlow AI модельці, яка представлена у вигляді пакету [nsfwjs](https://github.com/infinitered/nsfwjs).

Приклад запиту:

```js
const formdata = new FormData();
formdata.append("image", fileInput.files[0], "(m=eGM68f)(mh=YGlybUU_5R6MVJfb)0.jpg");

const requestOptions = {
  method: "POST",
  body: formdata,
  redirect: "follow"
};

fetch("https://nsfw-detector.ujournal.com.ua/", requestOptions)
  .then((response) => response.json())
  .then((result) => console.log(result))
  .catch((error) => console.error(error));
```

Приклад відповіді:

```json
{
    "predictions": [
        {
            "className": "Porn",
            "probability": 0.98
        },
        {
            "className": "Sexy",
            "probability": 0.01
        },
        {
            "className": "Hentai",
            "probability": 0.01
        },
        {
            "className": "Neutral",
            "probability": 0
        },
        {
            "className": "Drawing",
            "probability": 0
        }
    ],
    "isNSFW": true,
    "confidence": 0.98,
    "processingTime": 2802
}
```

З приклада бачимо, що окрім обмеженого результата у вигляді флага `isNSFW`, маємо ще список `predictions` з докладною оцінкою по кожному класу. З тестів зрозумів, що деякі зображення хибно відносяться до Neutral, особливо ті, де багато одягу та лише маленькі фрагменти тіла. Проте, людина точно визначить це зображення, як порнографічне. Тому навіть малі значення `probability` в класі `Porn` повинні викликати увагу.

І загальна думка: моделька доволі дешева і доволі ефективна. Я захостив її на Deno Deploy і планую використовувати в CRON скрипті для неспішної модерації контента.

Посилання на Github: [github.com/jmas/nsfw-detector-api](https://github.com/jmas/nsfw-detector-api)

URL сервісу: [nsfw-detector.ujournal.com.ua](https://nsfw-detector.ujournal.com.ua)