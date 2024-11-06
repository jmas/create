---
title: Редактор WYSIWYG для работи з Markdown та бібліотеки для обробки Markdown
description: Збірка бібліотек для роботи з Markdown
category: Программування
tags:
  - Markdown
  - PHP
  - JavaScript
  - Prosemirror
  - Commonmark
date: 2024-11-06
---
Я працюю з редактором [TipTap](https://tiptap.dev/), який побудований на основі іншого редактора Prosemirror і пропонує спрощений API та розширення для роботи з ним. Мої враження від роботи з TipTap суто позитивні. Він зміг вдовольнити всі мої вимоги.

**Мої вимоги наступні:**

- Схема контента. Редактор повинен контролювати та очищувати весь контент який потрапляє в нього і приводити його до певної схеми
- API підтримки обʼєктів-вставок. Редактор повинен підтримувати роботу елементами-обʼєктами, які утримують в середені вставку накшталт відео з Ютуба. Повинен бути простий і зручний API роботи з такими обʼєктами: парсінг таких обʼєктів з контента та збереження вставок у фінальних даних
- Консистентність при збереженні, завантаженні, вставці контента 
- Підтримка всіх стандартних вставок, накшталт Image
- Експорт контента як Markdown
- Зручна кастомізація зовнішньго вигляду
- Простота конфігурації

По всім цим параментрам TipTap/Prosemirror показав себе відмінно. Щодо консистентності контенту, то це більше заслуга Prosemirror, проте TipTap зробив Prosemirror супер-простим в конфігурації. Я спробував [PlateJS](https://platejs.org/), котрий виглядає потужно, проте коли я його конфігурую, в мене складається враження що поріг входу далеко не такий низький, як здається. Плюс слабка документація та підтримка спільнотою робить цей редактор складно конфігуруємим.

## Які доробки я приніс в TipTap

- Додав завантаження файлів при вставці контента ([Як автоматично завантажувати зображення в редактор Tiptap при вставці](https://create.pp.ua/posts/how-to-autoupload-images-in-tiptap-editor-during-paste/))
- Написав власний тулбар
- Додав експорт в Markdown через розширення [aguingand/tiptap-markdown](https://github.com/aguingand/tiptap-markdown). Розширення рекомендую, працює бездоганно
- Створив розширення для обробки кастомних вставок. Використовую розширення [posva/markdown-it-custom-block](https://github.com/posva/markdown-it-custom-block) для markdown-it, котрий використовується в `tiptap-markdown`. Код розширення наведу нижче
- Створив окремий рендерер для кастомних вставок для Commonmark PHP. Код наведу нижче

В результаті у мене вийшов WYSIWYG редактор, який підтримує кастомні вставки і PHP рендерер, котрий вміє рендерити ці кастомні вставки в потрібний мені HTML.

## Розширення TipTap для підтримки кастомних вставок

Кастомна вставка це markdown-конструкція, схожа на конструкцію для вставки зображення, має тип та URL. Потрібна для вставки і виводу віджетів, накшталт Ютуб відео.

```markdown
@[external](https://youtube.com/...)
```

Конструкція має тип `external` та посилання на Ютуб. Конструкція вставки відрізняється від конструкції зображення лише знаком `@` замість `!`.

Для роботи розширення потрібно додати бібліотеку [posva/markdown-it-custom-block](https://github.com/posva/markdown-it-custom-block).

Розширення дозволяє обробляти вставку (`paste`) посилань в редактор та заміняє їх на вставки. Вставки представляє у вигляді веб-компонента `<c-external url="..."></c-external>`.  Розширення може розбирати вхідний контент, шукати конструкції `@[...](...)` та перетворювати їх на вставки. Розширення підтримує експорт контента в Markdown.

```js
import { Node, nodePasteRule } from "@tiptap/core";
import customBlock from "markdown-it-custom-block";

export const URL_REGEX_GLOBAL =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g;

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        external: {
            setExternal: (options: any) => ReturnType;
        };
    }
}

export interface ExternalOptions {
    url: string;
}

export const External = Node.create<ExternalOptions>({
    name: "external",

    addOptions() {
        return {
            url: "",
        };
    },

    inline() {
        return false;
    },

    group() {
        return "block";
    },

    draggable: true,

    addAttributes() {
        return {
            url: {
                default: null,
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: "c-external",
            },
        ];
    },

    addCommands() {
        return {
            setExternal:
                (options: ExternalOptions) =>
                ({ commands }) => {
                    if (!options.url) {
                        return false;
                    }

                    commands.insertContent({
                        type: this.name,
                        attrs: options,
                    });
                },
        };
    },

    addPasteRules() {
        return [
            nodePasteRule({
                find: URL_REGEX_GLOBAL,
                type: this.type,
                getAttributes: (match) => {
                    return { url: match.input };
                },
            }),
        ];
    },

    addStorage() {
        return {
            markdown: {
                serialize: (state, node) => {
                    state.write(
                        "@[external](" +
                            node.attrs.url.replace(/[\(\)]/g, "\\$&") +
                            ")",
                    );
                    state.write("\n");
                    state.write("\n");
                },
                parse: {
                    setup: (markdownit) => {
                        markdownit.use(customBlock, {
                            external(arg) {
                                return `<c-external url="${arg}"></c-external>`;
                            },
                        });
                    },
                },
            },
        };
    },

    renderHTML({ HTMLAttributes }) {
        return ["c-external", HTMLAttributes];
    },
});
```

## Розширення Commonmark PHP для відображення вставок

Контент я намагаюся рендеити в одному місці. Мав негативний досвід, коли є декілька точок рендерінгу контента і це дуже ускладнює життя. Тому я використовую [Commonmark PHP](https://commonmark.thephpleague.com/) і Laravel хелпер. Проте я додав власне розширення `CustomBlockExtension`, яке оброблює кастомні вставки, як блоки. Тобто конструкція вставки повинна займати одну строку і не повинна бути інлайновою.

```php
Str::markdown(
    $this->body,
    [
        "html_input" => "strip",
        "allow_unsafe_links" => false,
        "external_link" => [
            "internal_hosts" => [
                parse_url(env("APP_URL"), PHP_URL_HOST),
            ],
            "open_in_new_window" => true,
            "nofollow" => "external",
            "noopener" => "external",
            "noreferrer" => "external",
        ],
    ],
    [new CustomBlockExtension(), new ExternalLinkExtension()]
);
```

Код `CustomBlockExtension` знаходиться за посиланням: [gist.github.com/jmas/9f6c0fa7275cd59b16358b229f189e82](https://gist.github.com/jmas/9f6c0fa7275cd59b16358b229f189e82).