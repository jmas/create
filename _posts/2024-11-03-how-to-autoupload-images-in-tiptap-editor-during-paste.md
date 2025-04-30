---
title: "Як автоматично завантажувати зображення в редактор Tiptap при вставці "
description: Автоматична вставка HTML конетнта з зображеннями потребує їх
  завантаження на сервер, розбираюся як це зробити.
category: Программування
tags:
  - TipTap
  - JavaScript
  - Uploading
date: 2024-11-03
---
Для завнтаження зображень в редакторі Tiptap використовується розширення [`Image`](https://tiptap.dev/docs/editor/extensions/nodes/image). Воно просте та зручне, проте коли потрібно вставити контент в редактор через вставку контента, то виникає проблема, що зображення знаходиться десь в іншому місці, а не на потрібному нам сервері. Тому потрібно при вставці автоматично завантажувати зображення на сервер.

Розширення `Image` дозволяє обробляти та відображати елемент `<img />`. Додамо функцію `handlePaste`, яка зможе обробляти вставку контента.

## Вставлення файлу зображення в Tiptap

За замовчуванням ви не можете вставити файл зображення в Tiptap, тому нам потрібно написати код, щоб дозволити таку поведінку.

`handlePaste` — це функція, яка надається для використання з ProseMirror (редактор форматованого тексту, який Tiptap використовує під капотом) та використовується для перевизначення поведінки вставки.

```js
new Editor({
 element: document.querySelector('.editor'),
 extensions: [
  StarterKit,
  Image,
 ],
 editorProps: {
  handlePaste: function(view, event, slice) {
   // ми робимо щось тут
   return false; // ми нічого не обробляємо – використовуй звичайну поведінку
  }
 },
 content: `
  <p>Hello World!</p>
 `,
});
```

Сфокусуємося на цьому фрагменті:

```js
handlePaste: function(view, event, slice, moved) {
  // ми робимо щось тут
  return false; // ми нічого не обробляємо – використовуй звичайну поведінку
}
```

Коли ми повертаємо `false` з функції, буде працювати стандартна поведінка. Нам потрібно обробляти вставку зображення, тому давайте перевіримо, чи подія вставки містить зображення.

```js
handlePaste: function(view, event, slice) {
  const items = Array.from(event.clipboardData?.items || []);      
  for (const item of items) {
    if (item.type.indexOf("image") === 0) {
      // обробляємо вставлене зображення
      return true; // кажемо, що ми обробимо цю вставку
    }
  }
  return false;
},
```

Якщо тип MIME починається з «image», ми знаємо, що вставлений файл містить зображення.

Тепер функція `handlePaste` перевіряє, чи буфер обміну містить файл і цей файл є зображенням, і якщо він є, то запобігає поведінці за замовчуванням.

## Обробка зображення

Тепер нам потрібно отримати зображення та завантажити його на сервер.

```js
handlePaste: function(view, event, slice) {
  const items = Array.from(event.clipboardData?.items || []);      
  for (const item of items) {
    if (item.type.indexOf("image") === 0) {
      let filesize = ((item.size/1024)/1024).toFixed(4); // обримуємо розмір зображення в MB
      if (filesize < 10) { // перевіремо, що зображення меньше за 10MB
        // перевіряємо розміри зображення
        let _URL = window.URL || window.webkitURL;
        let img = new Image(); /* global Image */
        img.src = _URL.createObjectURL(item);
        img.onload = function () {
          if (this.width > 5000 || this.height > 5000) {
            window.alert("Ваші зображення мають бути менше 5000 пікселів у висоту та ширину.");
          } else {
            // зображення підходить для завантаження
            // uploadImage буде вашою функцією для завантаження зображення на сервер або кудись у s3
            uploadImage(file).then(function(response) { // відповідь – це URL-адреса зображення, де воно було збережено
              // робимо щось з відповідью
            }).catch(function(error) {
              if (error) {
                window.alert("Під час завантаження вашого зображення виникла проблема. Повторіть спробу.");
              }
            });
          }
        };
      } else {
        window.alert("Зображення мають бути у форматі jpg або png і розміром менше 10 Мб.");
      }
      return true; // оброблено
    }
  }
  return false; // не оброблено, використовуй поведінку за замовчуванням
},
```

Функція `uploadImage`, буде викликати API на вашому сервері який отримає та завантажить файл. Якщо ви використовуєте Axios, функція може виглядати так:

```js
function uploadImage(file) {
  const data = new FormData();
  data.append('file', file);
  return axios.post('/documents/image/upload', data);
};
```

## Відображення вставленого зображення в редакторі

Тепер ви завантажили зображення, ви повинні отримати відповідь із URL-адресою збереженого файлу. Настав час відобразити його в редакторі.

```js
handlePaste: function(view, event, slice) {
  const items = Array.from(event.clipboardData?.items || []);      
  for (const item of items) {
    if (item.type.indexOf("image") === 0) {
      let filesize = ((item.size/1024)/1024).toFixed(4); // обримуємо розмір зображення в MB
      if (filesize < 10) { // перевіремо, що зображення меньше за 10MB
        // перевіряємо розміри зображення
        let _URL = window.URL || window.webkitURL;
        let img = new Image(); /* global Image */
        img.src = _URL.createObjectURL(item);
        img.onload = function () {
          if (this.width > 5000 || this.height > 5000) {
            window.alert("Ваші зображення мають бути менше 5000 пікселів у висоту та ширину.");
          } else {
            // зображення підходить для завантаження
            // uploadImage буде вашою функцією для завантаження зображення на сервер або кудись у s3
            uploadImage(file).then(function(response) { // відповідь – це URL-адреса зображення, де воно було збережено
              // розміщаємо щойно завантажений файл в місце де він був вставлений
              const node = schema.nodes.image.create({ src: response }); // створюємо елемент зображення
              const transaction = view.state.tr.replaceSelectionWith(node); // розміщаємо елемент в коректну позицію
              view.dispatch(transaction);
            }).catch(function(error) {
              if (error) {
                window.alert("Під час завантаження вашого зображення виникла проблема. Повторіть спробу.");
              }
            });
          }
        };
      } else {
        window.alert("Зображення мають бути у форматі jpg або png і розміром менше 10 Мб.");
      }
      return true; // оброблено
    }
  }
  return false; // не оброблено, використовуй поведінку за замовчуванням
},
```

## Вставлення елементів `<img />` у HTML

Тепер користувачі можуть завантажувати зображення, копіюючи та вставляючи їх у редактор. Але є інший спосіб, яким зображення можуть опинитися в редакторі, і це коли ви вставляєте HTML.

Якщо ви вставите в редактор деякий HTML, який містить елементи `<img />`, ці елементи залишаться, а зображення відображається.

І ця поведінка не дуже коректна, тому що ми хочемо щоб всі зображення були завантажені на наш сервер, щоб не залежити від іншого сервера, тому що файли на іншому сервері можуть бути видалені.

## Запобігання вставці зображень із HTML

З причин, наведених вище, я вирішив, що для мене краще заборонити вставляти `<img />` із HTML і дозволити лише пряме завантаження.

І для цього ми можемо використати функцію `transformPastedHTML` у `editorProps`. Ви не знайдете цю функцію в документації Tiptap, оскільки це інша функція ProseMirror.

За допомогою цієї функції ви можете - і ви, напевно, здогадалися про це - вносити зміни до вставленого HTML. І в цьому випадку ми можемо видалити теги `<img />` за допомогою регулярного виразу.

```js
editorProps: {
  handlePaste: function(view, event, slice) {
   // ...
  },
  transformPastedHTML(html) {
    return html.replace(/<img.*?>/g, ""); // видалити будь які зображення з HTML
  },
},
```

Проте можно і не видаляти зображення, якщо вони завантаженні на наш сервер. Тож давайте змінимо наш регулярний вираз на `/<img.*?>/g на /<img.*?src="(?<imgSrc>.*?)".*?>/g`, щоб ми могли отримати `src` зображення.

```js
editorProps: {
  handlePaste: function(view, event, slice) {
   // ...
  },
  transformPastedHTML(html) {
    return html.replace(/<img.*?src="(?<imgSrc>.*?)".*?>/gm, function(match, imgSrc) {
      if (imgSrc.startsWith('https://images.your-image-hosting.com')) { // зображення з нашого сервера
        return match; // залишаємо зображення
      }
      return ""; // видаляємо зображення
    });
  },
},
```

## Фінальний код

Ось готовий код для:

- Завантаження вставлених зображеннь та їх відображення
- Заборона вставки зображень з HTML

Текст та коментарі англійською.

```js
new Editor({
 element: document.querySelector('.editor'),
 extensions: [
  StarterKit,
  Image,
 ],
 editorProps: {
  handlePaste: function(view, event, slice) {
    const items = Array.from(event.clipboardData?.items || []);      
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        let filesize = ((item.size/1024)/1024).toFixed(4); // get the filesize in MB
        if (filesize < 10) { // check image under 10MB
          // check the dimensions
          let _URL = window.URL || window.webkitURL;
          let img = new Image(); /* global Image */
          img.src = _URL.createObjectURL(item);
          img.onload = function () {
            if (this.width > 5000 || this.height > 5000) {
              window.alert("Your images need to be less than 5000 pixels in height and width."); // display alert
            } else {
              // valid image so upload to server
              // uploadImage will be your function to upload the image to the server or s3 bucket somewhere
              uploadImage(file).then(function(response) { // response is the image url for where it has been saved
                // place the now uploaded image in the editor where it was pasted
                const node = schema.nodes.image.create({ src: response }); // creates the image element
                const transaction = view.state.tr.replaceSelectionWith(node); // places it in the correct position
                view.dispatch(transaction);
              }).catch(function(error) {
                if (error) {
                  window.alert("There was a problem uploading your image, please try again.");
                }
              });
            }
          };
        } else {
          window.alert("Images need to be less than 10mb in size.");
        }
        return true; // handled
      }
    }
    return false; // not handled use default behaviour
  },
  transformPastedHTML(html) {
    return html.replace(/<img.*?src="(?<imgSrc>.*?)".*?>/g, function(match, imgSrc) {
      if (imgSrc.startsWith('https://images.your-image-hosting.com')) { // your saved images
        return match; // keep the img
      }
      return ""; // replace it
    });
  },
 },
 content: `
  <p>Hello World!</p>
 `,
});
```

*Довільний переклад посту: <https://www.codemzy.com/blog/tiptap-pasting-images>*