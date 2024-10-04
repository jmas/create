---
title: Як локалізувати Chirpy – тему для Jekyll
description: Занотовую як перевести на українську популірну тему Chirpy
category: Программування
tags:
  - Chirpy
  - Jekyll
date: 2024-10-04
---
В репозиторії Chirpy я швидко не зміг знайти як перекласти тему, проте написано що UI локазіловано. Проте виявилося що це дуже просто зробити.

Перелік локалізацій Chirpy знаходяться в репозиторії:  [github.com/cotes2020/jekyll-theme-chirpy/tree/master/_data/locales](https://github.com/cotes2020/jekyll-theme-chirpy/tree/master/_data/locales).

Обираємо потрібну локалізацію. В моєму витадку це `uk-UA` та встановлюємо її в конфігу сайту:

```yml
# Import the theme
theme: jekyll-theme-chirpy

# The language of the webpage › http://www.lingoes.net/en/translator/langcode.htm
# If it has the same name as one of the files in folder `_data/locales`, the layout language will also be changed,
# otherwise, the layout language will use the default value of 'en'.
lang: uk-UA

# Change to your timezone › https://kevinnovak.github.io/Time-Zone-Picker
timezone: Europe/Kiev
```

Ще я встановив коректну таймзону.