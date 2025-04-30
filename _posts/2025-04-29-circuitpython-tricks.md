---
title: Трюки CircuitPython
description: Колекція сніпетів коду для CircuitPython
category: Программування
tags:
  - CircuitPython
  - Python
  - ESP32
date: 2025-04-29T00:00:00.000Z
---
Переклад GitHub репозиторія [todbot/circuitpython-tricks](https://github.com/todbot/circuitpython-tricks).

## Вхідні дані

### Зчитування цифрового входу як кнопки

```python
import board
from digitalio import DigitalInOut, Pull
button = DigitalInOut(board.D3) # за замовчуванням для введення
button.pull = Pull.UP # увімкнути внутрішній підтягувальний резистор
print(button.value)  # False == натиснуто
```

Також можна зробити:

```python
import time, board, digitalio
button = digitalio.DigitalInOut(board.D3)
button.switch_to_input(digitalio.Pull.UP)
while True:
    print("button pressed:", button.value == False) # False == натиснуто
    time.sleep(0.1)
```

### Зчитування потенціометра

```python
import board
import analogio
potknob = analogio.AnalogIn(board.A1)
position = potknob.value  # діапазон від 0 до 65535
pos = potknob.value // 256  # створити діапазон 0-255
```

Примітка: хоча `AnalogIn.value` є 16-бітним (від 0 до 65535), що відповідає напрузі від 0 В до 3.3 В, АЦП мікроконтролера може мати обмеження у роздільній здатності та діапазоні напруги. Це зменшує те, що бачить CircuitPython. Наприклад, АЦП у ESP32 є 12-бітним з приблизним діапазоном від 0.1 В до 2.5 В (тобто значення змінюється приблизно від 200 до 50 000 з кроком у 16).  

### Зчитайування Touch Pin / Capsense

```python
import touchio
import board
touch_pin = touchio.TouchIn(board.GP6)
# on Pico / RP2040, need 1M pull-down on each input
if touch_pin.value:
    print("touched!")
```

Ви також можете отримати "аналогове" значення дотику за допомогою `touch_pin.raw_value`, щоб здійснювати базове виявлення наближення або навіть реалізувати поведінку, подібну до терменвокса.  

### Зчитування даних обертового енкодера

```python
import board
import rotaryio
encoder = rotaryio.IncrementalEncoder(board.GP0, board.GP1) # повинні бути послідовними на Pico
print(encoder.position)  # починається з нуля, стає негативним або позиційним
```

### Зняття відскоку з штифта / кнопки

```python
import board
from digitalio import DigitalInOut, Pull
from adafruit_debouncer import Debouncer
button_in = DigitalInOut(board.D3) # defaults to input
button_in.pull = Pull.UP # turn on internal pull-up resistor
button = Debouncer(button_in)
while True:
    button.update()
    if button.fell:
        print("press!")
    if button.rose:
      print("release!")
```

Примітка: більшість плат мають вбудований модуль `keypad`, який може виконувати дебаунсинг клавіш набагато ефективніше.

### Налаштування та усунення дребезгу списку пінів

Якщо у вашій платі CircuitPython має бібліотеку `keypad` (а більшість плат мають), я рекомендую її використовувати. Вона призначена не лише для матриць клавіш! Вона працює ефективніше і, оскільки є вбудованою, зменшує залежність від зовнішніх бібліотек.

```python
import board
import keypad
button_pins = (board.GP0, board.GP1, board.GP2, board.GP3, board.GP4)
buttons = keypad.Keys(button_pins, value_when_pressed=False, pull=True)

while True:
    button = buttons.events.get()  # перевірити, чи є якісь події натискання клавіш
    if button:                     # Є події!
      if button.pressed:
        print("button", button.key_number, "натиснуто!")
      if button.released:
        print("button", button.key_number, "відтиснуто!")
```

Інакше ви можете використовувати `adafruit_debouncer`:

```python
import board
from digitalio import DigitalInOut, Pull
from adafruit_debouncer import Debouncer
button_pins = (board.GP0, board.GP1, board.GP2, board.GP3, board.GP4)
buttons = []   # will hold list of Debouncer objects
for pin in button_pins:   # set up each pin
    tmp_pin = DigitalInOut(pin) # defaults to input
    tmp_pin.pull = Pull.UP      # turn on internal pull-up resistor
    buttons.append( Debouncer(tmp_pin) )
while True:
    for i in range(len(buttons)):
        buttons[i].update()
        if buttons[i].fell:
            print("button",i,"pressed!")
        if buttons[i].rose:
            print("button",i,"released!")
```

І ви також можете використовувати `adafruit_debouncer` для сенсорних пінів:

```python
import board, touchio, adafruit_debouncer
touchpad = adafruit_debouncer.Debouncer(touchio.TouchIn(board.GP1))
while True:
    touchpad.update()
    if touchpad.rose:  print("touched!")
    if touchpad.fell:  print("released!")
```

## Виходи

### Виведення HIGH / LOW на піні (наприклад, для світлодіода)

```python
import board
import digitalio
ledpin = digitalio.DigitalInOut(board.D2)
ledpin.direction = digitalio.Direction.OUTPUT
ledpin.value = True
```

Можна також виконати:

```python
ledpin = digitalio.DigitalInOut(board.D2)
ledpin.switch_to_output(value=True)
```

### Виведення аналогового значення на пін DAC

Різні плати мають DAC на різних пінах.

```python
import board
import analogio
dac = analogio.AnalogOut(board.A0)  # on Trinket M0 & QT Py
dac.value = 32768   # mid-point of 0-65535
```

### Виведення "аналогового" значення на пін PWM

```python
import board
import pwmio
out1 = pwmio.PWMOut(board.MOSI, frequency=25000, duty_cycle=0)
out1.duty_cycle = 32768  # mid-point 0-65535 = 50 % duty-cycle
```

### Керування світлодіодами Neopixel / WS2812

```python
import neopixel
leds = neopixel.NeoPixel(board.NEOPIXEL, 16, brightness=0.2)
leds[0] = 0xff00ff  # first LED of 16 defined
leds[0] = (255,0,255)  # equivalent
leds.fill( 0x00ff00 )  # set all to green
```

### Керування сервоприводом за допомогою списку анімацій

```python
# servo_animation_code.py -- show simple servo animation list
import time, random, board
from pwmio import PWMOut
from adafruit_motor import servo

# your servo will likely have different min_pulse & max_pulse settings
servoA = servo.Servo(PWMOut(board.RX, frequency=50), min_pulse=500, max_pulse=2250)

# the animation to play
animation = (
    # (angle, time to stay at that angle)
    (0, 2.0),
    (90, 2.0),
    (120, 2.0),
    (180, 2.0)
)
ani_pos = 0 # where in list to start our animation

while True:
    angle, secs = animation[ ani_pos ]
    print("servo moving to", angle, secs)
    servoA.angle = angle
    time.sleep( secs )
    ani_pos = (ani_pos + 1) % len(animation) # go to next, loop if at end
```

## Neopixels / Dotstars

### Світити кожним світлодіодом по черзі

Ви можете отримати доступ до кожного світлодіода за допомогою методів масиву Python на об'єкті `leds`. І ви можете встановити колір світлодіода, використовуючи або кортеж RGB ((255,0,80)), або шістнадцятковий RGB колір як 24-бітове число (`0xff0050`).

```python
import time, board, neopixel

led_pin = board.GP5   # which pin the LED strip is on
num_leds = 10
colors = ( (255,0,0), (0,255,0), (0,0,255), 0xffffff, 0x000000 )

leds = neopixel.NeoPixel(led_pin, num_leds, brightness=0.1)

i = 0
while True:
    print("led:",i)
    for c in colors:
        leds[i] = c
        time.sleep(0.2)
    i = (i+1) % num_leds
```

### Рухаючийся райдужний ефект на вбудованому `board.NEOPIXEL`

У CircuitPython 7 модуль `rainbowio` має функцію `colorwheel()`. На жаль, модуль `rainbowio` недоступний в усіх збірках. У CircuitPython 6 функція `colorwheel()` є вбудованою функцією, частиною `_pixelbuf` або `adafruit_pypixelbuf`.

Функція `colorwheel()` приймає єдине значення від 0 до 255 для відтінку та повертає кортеж (R, G, B), що відповідає заданому відтінку 0-255. Це не повна функція `HSV_to_RGB()`, але часто все, що вам потрібно — це "відтінок до RGB", де припускається, що насиченість = 255, а значення = 255. Її можна використовувати з `neopixel`, `adafruit_dotstar` або в будь-якому місці, де потрібен кортеж (R, G, B) з трьох байтів. Ось один із способів її використання.

```python
# CircuitPython 7 with or without rainbowio module
import time, board, neopixel
try:
    from rainbowio import colorwheel
except:
    def colorwheel(pos):
        if pos < 0 or pos > 255:  return (0, 0, 0)
        if pos < 85: return (255 - pos * 3, pos * 3, 0)
        if pos < 170: pos -= 85; return (0, 255 - pos * 3, pos * 3)
        pos -= 170; return (pos * 3, 0, 255 - pos * 3)

led = neopixel.NeoPixel(board.NEOPIXEL, 1, brightness=0.4)
while True:
    led.fill( colorwheel((time.monotonic()*50)%255) )
    time.sleep(0.05)
```

### Створення рухаючогося райдужного градієнта по стрічці LED

```python
import time, board, neopixel, rainbowio
num_leds = 16
leds = neopixel.NeoPixel(board.D2, num_leds, brightness=0.4, auto_write=False )
delta_hue = 256//num_leds
speed = 10  # higher numbers = faster rainbow spinning
i=0
while True:
  for l in range(len(leds)):
    leds[l] = rainbowio.colorwheel( int(i*speed + l * delta_hue) % 255  )
  leds.show()  # only write to LEDs after updating them all
  i = (i+1) % 255
  time.sleep(0.05)
```

Коротша версія з використанням спискового виразу Python. Трюк з `leds[:]` — це спосіб одночасно присвоїти новий список кольорів всім світлодіодам.

```python
import supervisor, board, neopixel, rainbowio
num_leds = 16
speed = 10  # lower is faster, higher is slower
leds = neopixel.NeoPixel(board.D2, 16, brightness=0.4)
while True:
  t = supervisor.ticks_ms() / speed
  leds[:] = [rainbowio.colorwheel( t + i*(255/len(leds)) ) for i in range(len(leds))]
```

```python
import supervisor, board, neopixel, rainbowio
num_leds = 16
speed = 10  # lower is faster, higher is slower
leds = neopixel.NeoPixel(board.D2, 16, brightness=0.4)
while True:
  t = supervisor.ticks_ms() / speed
  leds[:] = [rainbowio.colorwheel( t + i*(255/len(leds)) ) for i in range(len(leds))]
```

### Згасити всі світлодіоди на певну величину для ефектів переслідування

```python
import time
import board, neopixel
num_leds = 16
leds = neopixel.NeoPixel(board.D2, num_leds, brightness=0.4, auto_write=False )
my_color = (55,200,230)
dim_by = 20  # dim amount, higher = shorter tails
pos = 0
while True:
  leds[pos] = my_color
  leds[:] = [[max(i-dim_by,0) for i in l] for l in leds] # dim all by (dim_by,dim_by,dim_by)
  pos = (pos+1) % num_leds  # move to next position
  leds.show()  # only write to LEDs after updating them all
  time.sleep(0.05)
```

## Аудіо

Якщо ви звикли до Arduino, створення звуку зазвичай обмежувалося простими пісеньками за допомогою функції `tone()` в Arduino. Ви можете зробити це і в CircuitPython за допомогою `pwmio` та `simpleio`, але CircuitPython також може відтворювати файли WAV та MP3, ставши повноцінним аудіо-синтезатором з `synthio`.

У CircuitPython є кілька основних бібліотек для виведення аудіо:

- `pwmio` — використовуйте майже будь-який пін GPIO для виведення простих пісеньок, без WAV/MP3/synthio.
- `audioio` — використовує вбудований DAC для виведення WAV, MP3, synthio.
- `audiopwmio` — як вище, але використовує PWM, як в Arduino `analogWrite()`, потребує RC-фільтра для перетворення в аналоговий сигнал.
- `audiobusio` — виводить високоякісний аудіо-потік даних I2S, потребує зовнішнього апаратного декодера I2S.

Різні пристрої мають різні доступні аудіо-модулі. Зазвичай шаблон такий:

- `SAMD51` (наприклад, плати "M4") — `audioio` (DAC) та `audiobusio` (I2S).
- `RP2040` (наприклад, Pico) — `audiopwmio` (PWM) та `audiobusio` (I2S).
- `ESP32` (наприклад, QTPy ESP32) — лише `audiobusio` (I2S).

Для відтворення файлів WAV та MP3 їх зазвичай потрібно перезберегти в формат, який підтримується CircuitPython.

### Створення простих тонів

Для пристроїв, які мають лише можливість `pwmio`, можна створювати прості тони. Для цього можна використовувати бібліотеку `simpleio`:

```python
# a short piezo song using tone()
import time, board, simpleio
while True:
    for f in (262, 294, 330, 349, 392, 440, 494, 523):
        simpleio.tone(board.A0, f, 0.25)
    time.sleep(1)
```

### Відтворення файлу WAV

Файли WAV найпростіші для відтворення в CircuitPython. Найкоротший код для відтворення файлу WAV на Pico RP2040 виглядає так:

```python
import time, board, audiocore, audiopwmio
audio = audiopwmio.PWMAudioOut(board.GP0)
wave = audiocore.WaveFile("laser2.wav")
audio.play(wave)
while True:
  pass   # wait for audio to finish playing
```

Деталі та інші способи нижче.

### Аудіо виведення за допомогою PWM

Це використовує бібліотеку `audiopwmio`, яка доступна тільки для плат на базі RP2040, таких як Raspberry Pi Pico, та плат на базі NRF52840, таких як Adafruit Feather nRF52840 Express. На платах на базі RP2040 будь-який пін може бути піном для аудіо PWM. Дивіться `audiopwmio Support Matrix`, щоб дізнатися, які плати підтримують `audiopwmio`.

```python
import time, board
from audiocore import WaveFile
from audiopwmio import PWMAudioOut as AudioOut
wave = WaveFile("laser2.wav")  # can also be filehandle from open()
audio = AudioOut(board.GP0) # must be PWM-capable pin
while True:
    print("audio is playing:",audio.playing)
    if not audio.playing:
      audio.play(wave)
      wave.sample_rate = int(wave.sample_rate * 0.90) # play 10% slower each time
    time.sleep(0.1)
```

**Примітки:**

- При відтворенні аудіо буде невеликий "поп", коли аудіо починає відтворюватися, оскільки драйвер PWM переводить лінію GPIO з неактивного стану в PWM-режим. Наразі немає способу уникнути цього. Якщо відтворюється кілька WAV-файлів, рекомендується використовувати `AudioMixer`, щоб підтримувати аудіо систему між відтвореннями WAV. Таким чином, ви будете чути тільки стартовий "поп".
- Якщо ви хочете стерео-виведення на платах, які це підтримують, то можна передати два піні, наприклад: `audio = audiopwmio.PWMAudioOut(left_channel=board.GP14, right_channel=board.GP15)`.
- Виведення PWM повинно бути відфільтроване та перетворене на лінійний рівень для використання. Використовуйте RC-ланцюг для цього, дивіться цю просту схему або цю тему в Twitter для деталей.
- Об'єкт `WaveFile()` може приймати або потік файлів (вихід від `open('filewav', 'rb')`), або рядок з іменем файлу (наприклад, `wav = WaveFile("laser2.wav")`).

### Аудіо виведення за допомогою DAC

Деякі плати CircuitPython (SAMD51 "M4" та SAMD21 "M0") мають вбудовані DAC, які підтримуються. Код той самий, що й вище, лише змінюється рядок імпорту. Дивіться `audioio Support Matrix`, щоб дізнатися, які плати підтримують `audioio`.

```python
import time, board
import audiocore, audioio # DAC
wave_file = open("laser2.wav", "rb")
wave = audiocore.WaveFile(wave_file)
audio = audioio.AudioOut(board.A0)  # must be DAC-capable pin, A0 on QTPy Haxpress
while True:
  print("audio is playing:",audio.playing)
  if not audio.playing:
    audio.play(wave)
    wave.sample_rate = int(wave.sample_rate * 0.90) # play 10% slower each time
  time.sleep(0.1)
```

Примітка: якщо ви хочете стерео-виведення на платах, які це підтримують (переважно SAMD51 "M4"), ви можете передати два піні, наприклад: `audio = audioio.AudioOut(left_channel=board.A0, right_channel=board.A1)`.

### Аудіо виведення за допомогою I2S

На відміну від PWM або DAC, більшість плат CircuitPython підтримують керування зовнішньою аудіо платою через I2S. Це також дасть вам вищу якість звуку, ніж DAC або PWM. Дивіться `audiobusio Support Matrix`, щоб дізнатися, які плати підтримують `audiobusio`.

```python
# for e.g. Pico RP2040 pins bit_clock & word_select pins must be adjacent
import board, audiobusio, audiocore
audio = audiobusio.I2SOut(bit_clock=board.GP0, word_select=board.GP1, data=board.GP2)
audio.play( audiocore.WaveFile("laser2.wav") )
```

### Використовуйте **audiomixer**, щоб запобігти тріщинам в аудіо

За замовчуванням буфер, що використовується аудіо-системою, є досить малим. Це означає, що ви почуєте спотворене аудіо, якщо CircuitPython виконує інші операції (наприклад, запис на CIRCUITPY, оновлення дисплея). Щоб уникнути цього, ви можете використовувати `audiomixer`, щоб збільшити розмір аудіо-буфера. Почніть з `buffer_size=2048`. Більший буфер означає більшу затримку між тим, коли звук ініціюється, і коли він чується.

`AudioMixer` також відмінно підходить, якщо ви хочете відтворювати кілька WAV-файлів одночасно.

```python
import time, board
from audiocore import WaveFile
from audioio import AudioOut
import audiomixer
wave = WaveFile("laser2.wav", "rb")
audio = AudioOut(board.A0) # assuming QTPy M0 or Itsy M4
mixer = audiomixer.Mixer(voice_count=1, sample_rate=22050, channel_count=1,
                         bits_per_sample=16, samples_signed=True, buffer_size=2048)
audio.play(mixer)  # never touch "audio" after this, use "mixer"
while True:
    print("mixer voice is playing:", mixer.voice[0].playing)
    if not mixer.voice[0].playing:
      time.sleep(1)
      print("playing again")
      mixer.voice[0].play(wave)
    time.sleep(0.1)
```

### Відтворення кількох звуків за допомогою `audiomixer`

Цей приклад припускає, що WAV-файли моно, з частотою дискретизації 22050 Гц та підписаними 16-бітовими зразками.

```python
import time, board, audiocore, audiomixer
from audiopwmio import PWMAudioOut as AudioOut

wav_files = ("loop1.wav", "loop2.wav", "loop3.wav")
wavs = [None] * len(wav_files)  # holds the loaded WAVs

audio = AudioOut(board.GP2)  # RP2040 example
mixer = audiomixer.Mixer(voice_count=len(wav_files), sample_rate=22050, channel_count=1,
                         bits_per_sample=16, samples_signed=True, buffer_size=2048)
audio.play(mixer)  # attach mixer to audio playback

for i in range(len(wav_files)):
    print("i:",i)
    wavs[i] = audiocore.WaveFile(open(wav_files[i], "rb"))
    mixer.voice[i].play( wavs[i], loop=True) # start each one playing

while True:
    print("doing something else while all loops play")
    time.sleep(1)
```

**Примітка:** Плати M0 не мають `audiomixer`.

Примітка: Кількість одночасних звуків обмежена частотою дискретизації та швидкістю зчитування флеш-пам'яті. Орієнтовні правила:

- Вбудована флеш-пам'ять: 10 звуків 22 кГц одночасно
- SPI SD карти: 2 звуки 22 кГц одночасно

Також дивіться численні приклади в `larger-tricks`.

### Відтворення файлів MP3

Після того, як ви налаштуєте виведення аудіо (безпосередньо або через `AudioMixer`), ви зможете відтворювати файли WAV або MP3 через нього, або відтворювати обидва файли одночасно.

Наприклад, ось приклад, який використовує `I2SOut` для підключення до `PCM5102` на Raspberry Pi Pico RP2040 для одночасного відтворення як WAV, так і MP3:

```python
import board, audiobusio, audiocore, audiomp3
num_voices = 2

i2s_bclk, i2s_wsel, i2s_data = board.GP9, board.GP10, board.GP11 # BCLK, LCLK, DIN on PCM5102

audio = audiobusio.I2SOut(bit_clock=i2s_bclk, word_select=i2s_wsel, data=i2s_data)
mixer = audiomixer.Mixer(voice_count=num_voices, sample_rate=22050, channel_count=1,
                         bits_per_sample=16, samples_signed=True)
audio.play(mixer) # attach mixer to audio playback

wav_file = "/amen1_22k_s16.wav" # in 'circuitpython-tricks/larger-tricks/breakbeat_wavs'
mp3_file = "/vocalchops476663_22k_128k.mp3" # in 'circuitpython-tricks/larger-tricks/wav'
# https://freesound.org/people/f-r-a-g-i-l-e/sounds/476663/

wave = audiocore.WaveFile(open(wav_file, "rb"))
mp3 = audiomp3.MP3Decoder(open(mp3_file, "rb"))
mixer.voice[0].play( wave )
mixer.voice[1].play( mp3 )

while True:
    pass   # both audio files play
```

Примітка: Для файлів MP3 майте на увазі, що оскільки декодування MP3 здійснюється програмно, вам, ймовірно, доведеться перетискувати MP3 до нижчого бітрейту та частоти дискретизації (макс. 128 кбіт/с та 22 050 Гц), щоб вони могли відтворюватися на пристроях CircuitPython нижчого класу, таких як Pico / RP2040.

Примітка: Для файлів MP3 та налаштування `loop=True` при відтворенні є невелика затримка під час циклічного відтворення. Файли WAV повторюються без перерви.

Приклад плат з `pwmio`, але без аудіо, — це плати на базі `ESP32-S2`, такі як `FunHouse`, де ви не можете відтворювати WAV-файли, але можете генерувати пісеньки. Більший приклад можна знайти за цим посиланням: [gist](https://gist.github.com/todbot/f35bb5ceed013a277688b2ca333244d5).

## USB

### Перейменувати диск CIRCUITPY на щось інше

Наприклад, якщо у вас є кілька однакових пристроїв. Мітка може містити до 11 символів. Це потрібно записати в `boot.py`, а не в `code.py`, і ви повинні перезавантажити плату.

```python
# this goes in boot.py not code.py!
new_name = "TRINKEYPY0"
import storage
storage.remount("/", readonly=False)
m = storage.getmount("/")
m.label = new_name
storage.remount("/", readonly=True)
```

### Визначити, чи підключений USB чи ні

```python
import supervisor
if supervisor.runtime.usb_connected:
  led.value = True   # USB
else:
  led.value = False  # no USB
```

Старіший спосіб, який намагається змонтувати CIRCUITPY для читання та запису, і якщо це не вдається, то USB підключений:

```python
def is_usb_connected():
    import storage
    try:
        storage.remount('/', readonly=False)  # attempt to mount readwrite
        storage.remount('/', readonly=True)  # attempt to mount readonly
    except RuntimeError as e:
        return True
    return False
is_usb = "USB" if is_usb_connected() else "NO USB"
print("USB:", is_usb)
```

### Отримати розмір диска CIRCUITPY та вільний простір

```python
import os
fs_stat = os.statvfs('/')
print("Disk size in MB", fs_stat[0] * fs_stat[2] / 1024 / 1024)
print("Free space in MB", fs_stat[0] * fs_stat[3] / 1024 / 1024)
```

### Програмно скинути до завантажувача UF2

```python
import microcontroller
microcontroller.on_next_reset(microcontroller.RunMode.UF2)
microcontroller.reset()
```

**Примітка:** у старих версіях CircuitPython використовуйте `RunMode.BOOTLOADER`, а для плат з кількома завантажувачами (як-от ESP32-S2):

```python
import microcontroller
microcontroller.on_next_reset(microcontroller.RunMode.BOOTLOADER)
microcontroller.reset()
```

## USB Serial

### Вивести в USB серійний порт

```python
print("hello there")  # prints a newline
print("waiting...", end='')   # does not print newline
for i in range(256):  print(i, end=', ')   # comma-separated numbers
```

### Читати ввід користувача з USB серійного порту, блокуючи

```python
while True:
    print("Type something: ", end='')
    my_str = input()  # type and press ENTER or RETURN
    print("You entered: ", my_str)
```

### Читати ввід користувача з USB серійного порту, неблокуючи (переважно)

```python
import time
import supervisor
print("Type something when you're ready")
last_time = time.monotonic()
while True:
    if supervisor.runtime.serial_bytes_available:
        my_str = input()
        print("You entered:", my_str)
    if time.monotonic() - last_time > 1:  # every second, print
        last_time = time.monotonic()
        print(int(last_time),"waiting...")
```

### Читати клавіші з USB серійного порту

```python
import time, sys, supervisor
print("type charactcers")
while True:
    n = supervisor.runtime.serial_bytes_available
    if n > 0:  # we read something!
        s = sys.stdin.read(n)  # actually read it in
        # print both text & hex version of recv'd chars (see control chars!)
        print("got:", " ".join("{:s} {:02x}".format(c,ord(c)) for c in s))
    time.sleep(0.01) # do something else
```

### Читати ввід користувача з USB серійного порту, неблокуючи

```python
class USBSerialReader:
    """ Read a line from USB Serial (up to end_char), non-blocking, with optional echo """
    def __init__(self):
        self.s = ''
    def read(self,end_char='\n', echo=True):
        import sys, supervisor
        n = supervisor.runtime.serial_bytes_available
        if n > 0:                    # we got bytes!
            s = sys.stdin.read(n)    # actually read it in
            if echo: sys.stdout.write(s)  # echo back to human
            self.s = self.s + s      # keep building the string up
            if s.endswith(end_char): # got our end_char!
                rstr = self.s        # save for return
                self.s = ''          # reset str to beginning
                return rstr
        return None                  # no end_char yet

usb_reader = USBSerialReader()
print("type something and press the end_char")
while True:
    mystr = usb_reader.read()  # read until newline, echo back chars
    #mystr = usb_reader.read(end_char='\t', echo=False) # trigger on tab, no echo
    if mystr:
        print("got:",mystr)
    time.sleep(0.01)  # do something time critical
```

## USB MIDI

CircuitPython може бути MIDI контролером або відповідати на MIDI! Adafruit надає клас `adafruit_midi` для полегшення роботи, але він досить складний, порівняно з тим, як простий насправді MIDI.

Для виведення MIDI ви можете вибрати роботу з сирими масивами байтів, оскільки більшість MIDI повідомлень складаються лише з 1, 2 або 3 байтів. Для читання MIDI ви можете знайти SmolMIDI від Winterbloom швидшим для розбору MIDI повідомлень, оскільки за своєю суттю він робить менше.

### Відправка MIDI за допомогою `adafruit_midi`

```python
import usb_midi
import adafruit_midi
from adafruit_midi.note_on import NoteOn
from adafruit_midi.note_off import NoteOff
midi_out_channel = 3 # human version of MIDI out channel (1-16)
midi = adafruit_midi.MIDI( midi_out=usb_midi.ports[1], out_channel=midi_out_channel-1)

def play_note(note,velocity=127):
    midi.send(NoteOn(note, velocity))  # 127 = highest velocity
    time.sleep(0.1)
    midi.send(NoteOff(note, 0))  # 0 = lowest velocity
```

**Примітка:** Цей шаблон також працює для відправки серійного (5-контактного) MIDI, див. нижче.

### Відправка MIDI за допомогою масиву байтів

Відправка MIDI за допомогою масиву байтів на нижчому рівні також досить проста і може забезпечити більшу швидкість для додатків, чутливих до часу. Цей код еквівалентний наведеному вище, без використання `adafruit_midi`.

```python
import usb_midi
midi_out = usb_midi.ports[1]
midi_out_channel = 3   # MIDI out channel (1-16)
note_on_status = (0x90 | (midi_out_channel-1))
note_off_status = (0x80 | (midi_out_channel-1))

def play_note(note,velocity=127):
    midi_out.write( bytearray([note_on_status, note, velocity]) )
    time.sleep(0.1)
    midi_out.write( bytearray([note_off_status, note, 0]) )
```

### MIDI через серійний UART

Не зовсім USB, але це MIDI! Як `adafruit_midi`, так і техніка з масивами байтів також працюють для серійного MIDI (так званого "5-контактного MIDI"). За допомогою простого MIDI вихідного кола ви можете керувати старими апаратними синтезаторами.

```python
import busio
midi_out_channel = 3  # MIDI out channel (1-16)
note_on_status = (0x90 | (midi_out_channel-1))
note_off_status = (0x80 | (midi_out_channel-1))
# must pick board pins that are UART TX and RX pins
midi_uart = busio.UART(tx=board.GP16, rx=board.GP17, baudrate=31250)

def play_note(note,velocity=127):
    midi_uart.write( bytearray([note_on_status, note, velocity]) )
    time.sleep(0.1)
    midi_uart.write( bytearray([note_off_status, note, 0]) )
```

### Приймання MIDI

```python
import usb_midi        # built-in library
import adafruit_midi   # install with 'circup install adafruit_midi'
from adafruit_midi.note_on import NoteOn
from adafruit_midi.note_off import NoteOff

midi_usb = adafruit_midi.MIDI(midi_in=usb_midi.ports[0])
while True:
    msg = midi_usb.receive()
    if msg:
        if isinstance(msg, NoteOn):
            print("usb noteOn:",msg.note, msg.velocity)
        elif isinstance(msg, NoteOff):
            print("usb noteOff:",msg.note, msg.velocity)
```

**Примітка:** з `adafruit_midi` потрібно імпортувати кожен тип MIDI повідомлення, який ви хочете обробляти.

### Одночасне приймання MIDI через USB та MIDI через серійний UART

MIDI є MIDI, тож ви можете використовувати або `midi_uart`, або `usb_midi.ports[]`, створені вище, разом з adafruit_midi. Ось приклад приймання MIDI як з USB, так і з серійного порту на QTPy RP2040. Зверніть увагу: для приймання серійного MIDI потрібне відповідне вхідне коло з оптоізолятором, наприклад, таке для QTPy або таке для MacroPad RP2040.

```python
import board, busio
import usb_midi        # built-in library
import adafruit_midi   # install with 'circup install adafruit_midi'
from adafruit_midi.note_on import NoteOn
from adafruit_midi.note_off import NoteOff

uart = busio.UART(tx=board.TX, rx=board.RX, baudrate=31250, timeout=0.001)
midi_usb = adafruit_midi.MIDI( midi_in=usb_midi.ports[0],  midi_out=usb_midi.ports[1] )
midi_serial = adafruit_midi.MIDI( midi_in=uart, midi_out=uart )

while True:
    msg = midi_usb.receive()
    if msg:
        if isinstance(msg, NoteOn):
            print("usb noteOn:",msg.note, msg.velocity)
        elif isinstance(msg, NoteOff):
            print("usb noteOff:",msg.note, msg.velocity)
    msg = midi_serial.receive()
    if msg:
        if isinstance(msg, NoteOn):
            print("serial noteOn:",msg.note, msg.velocity)
        elif isinstance(msg, NoteOff):
            print("serial noteOff:",msg.note, msg.velocity)
```

Якщо вам не важливо, звідки надходять MIDI-повідомлення, ви можете об'єднати два блоки if, використовуючи "оператор моржа" (`:=`).

```python
while True:
    while msg := midi_usb.receive() or midi_uart.receive():
        if isinstance(msg, NoteOn) and msg.velocity != 0:
            note_on(msg.note, msg.velocity)
        elif isinstance(msg,NoteOff) or isinstance(msg,NoteOn) and msg.velocity==0:
            note_off(msg.note, msg.velocity)
```

### Увімкнути USB MIDI у файлі `boot.py` (для ESP32-S2 та STM32F4)

Деякі пристрої на CircuitPython, зокрема на базі ESP32-S2, не мають достатньо USB-ендапойнтів для ввімкнення всіх USB-функцій, тому USB MIDI за замовчуванням вимкнено. Щоб його увімкнути, найпростіше — вимкнути підтримку USB HID (клавіатура/миша). Це потрібно зробити у файлі boot.py і перезавантажити плату.

```python
# boot.py
import usb_hid
import usb_midi
usb_hid.disable()
usb_midi.enable()
print("enabled USB MIDI, disabled USB HID")
```

## Wi-Fi / Мережеве з'єднання

### Сканування Wi-Fi мереж, відсортованих за рівнем сигналу

**Примітка:** це для плат із вбудованим Wi-Fi (ESP32)

```python
import wifi
networks = []
for network in wifi.radio.start_scanning_networks():
    networks.append(network)
wifi.radio.stop_scanning_networks()
networks = sorted(networks, key=lambda net: net.rssi, reverse=True)
for network in networks:
    print("ssid:",network.ssid, "rssi:",network.rssi)
```

### Підключитися до Wi-Fi мережі з найсильнішим сигналом

```python
import wifi

def join_best_network(good_networks, print_info=False):
    """join best network based on signal strength of scanned nets"""
    networks = []
    for network in wifi.radio.start_scanning_networks():
        networks.append(network)
    wifi.radio.stop_scanning_networks()
    networks = sorted(networks, key=lambda net: net.rssi, reverse=True)
    for network in networks:
        if print_info: print("network:",network.ssid)
        if network.ssid in good_networks:
            if print_info: print("connecting to WiFi:", network.ssid)
            try:
                wifi.radio.connect(network.ssid, good_networks[network.ssid])
                return True
            except ConnectionError as e:
                if print_info: print("connect error:",e)
    return False

good_networks = {"todbot1":"FiOnTheFly",  # ssid, password
                 "todbot2":"WhyFlyWiFi",}
connected = join_best_network(good_networks, print_info=True)
if connected:
    print("connected!")
```

### Пінг IP-адреси

**Примітка:** це для плат з вбудованим Wi-Fi (ESP32)

```python
import os
import time
import wifi
import ipaddress

ip_to_ping = "1.1.1.1"

wifi.radio.connect(ssid=os.getenv('CIRCUITPY_WIFI_SSID'),
                   password=os.getenv('CIRCUITPY_WIFI_PASSWORD'))

print("my IP addr:", wifi.radio.ipv4_address)
print("pinging ",ip_to_ping)
ip1 = ipaddress.ip_address(ip_to_ping)
while True:
    print("ping:", wifi.radio.ping(ip1))
    time.sleep(1)
```

### Отримати IP-адресу віддаленого хоста

```python
import os, wifi, socketpool

wifi.radio.connect(ssid=os.getenv('CIRCUITPY_WIFI_SSID'),
                   password=os.getenv('CIRCUITPY_WIFI_PASSWORD'))
print("my IP addr:", wifi.radio.ipv4_address)

hostname = "todbot.com"

pool = socketpool.SocketPool(wifi.radio)
addrinfo = pool.getaddrinfo(host=hostname, port=443) # port is required
print("addrinfo", addrinfo)

ipaddr = addrinfo[0][4][0]

print(f"'{hostname}' ip address is '{ipaddr}'")
```

### Отримати файл JSON

Примітка: це для плат з вбудованим Wi-Fi (ESP32).

```python
import os
import time
import wifi
import socketpool
import ssl
import adafruit_requests

wifi.radio.connect(ssid=os.getenv('CIRCUITPY_WIFI_SSID'),
                   password=os.getenv('CIRCUITPY_WIFI_PASSWORD'))
print("my IP addr:", wifi.radio.ipv4_address)
pool = socketpool.SocketPool(wifi.radio)
session = adafruit_requests.Session(pool, ssl.create_default_context())
while True:
    response = session.get("https://todbot.com/tst/randcolor.php")
    data = response.json()
    print("data:",data)
    time.sleep(5)
```

### Надавати веб-сторінку через HTTP

**Примітка:** це для плат з вбудованим Wi-Fi (ESP32)

Бібліотека `adafruit_httpserver` робить це досить простим і має гарні приклади. Ви можете вказати їй використовувати `server.serve_forever()` і виконувати всі обчислення в функціях `@server.route()`, або використовувати `server.poll()` всередині циклу while. Також є бібліотека Ampule.

```python
import time, os, wifi, socketpool
from adafruit_httpserver.server import HTTPServer
from adafruit_httpserver.response import HTTPResponse

my_port = 1234  # set this to your liking
wifi.radio.connect(ssid=os.getenv('CIRCUITPY_WIFI_SSID'),
                   password=os.getenv('CIRCUITPY_WIFI_PASSWORD'))
server = HTTPServer(socketpool.SocketPool(wifi.radio))

@server.route("/")  # magic that attaches this function to "server" object
def base(request):
    my_str = f"<html><body><h1> Hello! Current time.monotonic is {time.monotonic()}</h1></body></html>"
    return HTTPResponse(body=my_str, content_type="text/html")
    # or for static content: return HTTPResponse(filename="/index.html")

print(f"Listening on http://{wifi.radio.ipv4_address}:{my_port}")
server.serve_forever(str(wifi.radio.ipv4_address), port=my_port) # never returns
```

### Встановити час RTC з NTP

**Примітка:** це для плат з вбудованим Wi-Fi (ESP32)

**Примітка:** Вам потрібно встановити my_tz_offset, щоб відповідати вашому регіону.

```python
# copied from:
# https://docs.circuitpython.org/projects/ntp/en/latest/examples.html
import time, os, rtc
import socketpool, wifi
import adafruit_ntp

my_tz_offset = -7  # PDT

wifi.radio.connect(ssid=os.getenv('CIRCUITPY_WIFI_SSID'),
                   password=os.getenv('CIRCUITPY_WIFI_PASSWORD'))
print("Connected, getting NTP time")
pool = socketpool.SocketPool(wifi.radio)
ntp = adafruit_ntp.NTP(pool, tz_offset=my_tz_offset)

rtc.RTC().datetime = ntp.datetime

while True:
    print("current datetime:", time.localtime())
    time.sleep(5)
```

### Встановити час RTC з сервісу часу

**Примітка:** це для плат з вбудованим Wi-Fi (ESP32)

Це використовує чудовий і безкоштовний сайт WorldTimeAPI.org, і цей приклад отримуватиме поточний місцевий час (включаючи часовий пояс і UTC зсув) на основі геолокації IP-адреси вашого пристрою.

```python
import time, os, rtc
import wifi, ssl, socketpool
import adafruit_requests

wifi.radio.connect(ssid=os.getenv('CIRCUITPY_WIFI_SSID'),
                   password=os.getenv('CIRCUITPY_WIFI_PASSWORD'))
print("Connected, getting WorldTimeAPI time")
pool = socketpool.SocketPool(wifi.radio)
request = adafruit_requests.Session(pool, ssl.create_default_context())

print("Getting current time:")
response = request.get("http://worldtimeapi.org/api/ip")
time_data = response.json()
tz_hour_offset = int(time_data['utc_offset'][0:3])
tz_min_offset = int(time_data['utc_offset'][4:6])
if (tz_hour_offset < 0):
    tz_min_offset *= -1
unixtime = int(time_data['unixtime'] + (tz_hour_offset * 60 * 60)) + (tz_min_offset * 60)

print(time_data)
print("URL time: ", response.headers['date'])

rtc.RTC().datetime = time.localtime( unixtime ) # create time struct and set RTC with it

while True:
  print("current datetime: ", time.localtime()) # time.* now reflects current local time
  time.sleep(5)
```

### Що таке цей `settings.toml`?

Це конфігураційний файл, який знаходиться поряд із вашим code.py і використовується для збереження облікових даних WiFi та інших глобальних налаштувань. Він також використовується (неявно) багатьма бібліотеками Adafruit, які працюють з WiFi. Ви можете використовувати його (як у наведених вище прикладах) без цих бібліотек. Імена налаштувань, що використовуються в CircuitPython, задокументовані в CircuitPython Web Workflow.

Примітка: Ви можете використовувати будь-які імена змінних для своїх облікових даних WiFi (поширена пара — `WIFI_SSID` та `WIFI_PASSWORD`), але якщо ви використовуєте імена `CIRCUITPY_WIFI_*`, це також запустить Web Workflow.

Використовувати його можна ось так для базової підключеності до WiFi:

```python
# settings.toml
CIRCUITPY_WIFI_SSID = "PrettyFlyForAWiFi"
CIRCUITPY_WIFI_PASSWORD = "mysecretpassword"

# code.py
import os, wifi
print("connecting...")
wifi.radio.connect(ssid=os.getenv('CIRCUITPY_WIFI_SSID'),
                   password=os.getenv('CIRCUITPY_WIFI_PASSWORD'))
print("my IP addr:", wifi.radio.ipv4_address)
```

### Що таке цей `secrets.py`?

Це старіша версія ідеї `settings.toml`. Ви можете побачити старіший код, який використовує його.

## Дисплеї (LCD / OLED / E-Ink) та displayio

displayio — це рідний драйвер на системному рівні для дисплеїв у CircuitPython. Кілька плат CircuitPython (FunHouse, MagTag, PyGamer, CLUE) мають дисплеї на основі displayio та вбудований об'єкт board.DISPLAY, який попередньо налаштований для цього дисплея. Або ж можна додати власний дисплей на I2C або SPI.

Отримати за замовчуванням дисплей та змінити його орієнтацію Плати, як-от FunHouse, MagTag, PyGamer, CLUE, мають вбудовані дисплеї. Параметр display.rotation працює з усіма дисплеями, не тільки з вбудованими.

```python
import board
display = board.DISPLAY
print(display.rotation) # print current rotation
display.rotation = 0    # valid values 0,90,180,270
```

### Вивести зображення

#### Використання `displayio.OnDiskBitmap`

CircuitPython має вбудований парсер BMP, званий displayio.OnDiskBitmap: Зображення повинні бути у непотcompressed, палітизованому форматі BMP3. (як створювати BMP3 зображення)

```python
import board, displayio
display = board.DISPLAY

maingroup = displayio.Group() # everything goes in maingroup
display.root_group = maingroup # show our maingroup (clears the screen)

bitmap = displayio.OnDiskBitmap(open("my_image.bmp", "rb"))
image = displayio.TileGrid(bitmap, pixel_shader=bitmap.pixel_shader)
maingroup.append(image) # shows the image
```

#### Використання `adafruit_imageload`

Ви також можете використовувати бібліотеку adafruit_imageload, яка підтримує дещо більше типів BMP файлів (але вони все одно повинні бути палітизованими BMP3 форматами, а також палітизованими PNG та GIF файлами). Який формат файлу вибрати?

- BMP зображення більші, але завантажуються швидше.
- PNG зображення приблизно в 2 рази менші за BMP і майже так само швидко завантажуються.
- GIF зображення трохи більші за PNG, але значно повільніше завантажуються.

```python
import board, displayio
import adafruit_imageload
display = board.DISPLAY
maingroup = displayio.Group() # everything goes in maingroup
display.root_group = maingroup # set the root group to display
bitmap, palette = adafruit_imageload.load("my_image.png")
image = displayio.TileGrid(bitmap, pixel_shader=palette)
maingroup.append(image) # shows the image
```

#### Як структурований displayio

- Бібліотека displayio в CircuitPython працює таким чином:
- Зображення Bitmap (та його Palette) розміщується всередині TileGrid.
- TileGrid розміщується всередині Group.
- Group відображається на Display.

### Display background bitmap

Корисно для відображення однотонного фону, який можна швидко змінити.

```python
import time, board, displayio
display = board.DISPLAY         # get default display (FunHouse,Pygamer,etc)
maingroup = displayio.Group()   # Create a main group to hold everything
display.root_group = maingroup  # put it on the display

# make bitmap that spans entire display, with 3 colors
background = displayio.Bitmap(display.width, display.height, 3)

# make a 3 color palette to match
mypal = displayio.Palette(3)
mypal[0] = 0x000000 # set colors (black)
mypal[1] = 0x999900 # dark yellow
mypal[2] = 0x009999 # dark cyan

# Put background into main group, using palette to map palette ids to colors
maingroup.append(displayio.TileGrid(background, pixel_shader=mypal))

time.sleep(2)
background.fill(2)  # change background to dark cyan (mypal[2])
time.sleep(2)
background.fill(1)  # change background to dark yellow (mypal[1])
```

Another way is to use `vectorio`:

```python
import board, displayio, vectorio

display = board.DISPLAY  # built-in display
maingroup = displayio.Group()   # a main group that holds everything
display.root_group = maingroup  # put maingroup on the display

mypal = displayio.Palette(1)
mypal[0] = 0x999900
background = vectorio.Rectangle(pixel_shader=mypal, width=display.width, height=display.height, x=0, y=0)
maingroup.append(background)
```

Або можна також використовувати `adafruit_display_shapes`:

```python
import board, displayio
from adafruit_display_shapes.rect import Rect

display = board.DISPLAY
maingroup = displayio.Group()   # a main group that holds everything
display.root_group = maingroup  # add it to display

background = Rect(0,0, display.width, display.height, fill=0x000000 ) # background color
maingroup.append(background)
```

### Слайдшоу зображень

```python
import time, board, displayio
import adafruit_imageload

display = board.DISPLAY      # get display object (built-in on some boards)
screen = displayio.Group()   # main group that holds all on-screen content
display.root_group = screen  # add it to display

file_names = [ '/images/cat1.bmp', '/images/cat2.bmp' ]  # list of filenames

screen.append(displayio.Group())  # placeholder, will be replaced w/ screen[0] below
while True:
    for fname in file_names:
        image, palette = adafruit_imageload.load(fname)
        screen[0] = displayio.TileGrid(image, pixel_shader=palette)
        time.sleep(1)
```

**Примітка:** Зображення повинні бути в палітизованому форматі BMP3. Для отримання додаткової інформації див. "Підготовка зображень для CircuitPython".

### Вирішення помилки "Занадто швидке оновлення" для E-Ink

Дисплеї E-Ink пошкоджуються, якщо їх оновлювати занадто часто. CircuitPython це обмежує, але також надає `display.time_to_refresh` — кількість секунд, яку потрібно почекати перед тим, як дисплей можна буде оновити. Одним із рішень є затримка на деякий час довше, ніж це значення, і ви ніколи не отримаєте помилку. Іншим варіантом є очікування, поки `time_to_refresh` не стане рівним нулю, як показано нижче.

```python
import time, board, displayio, terminalio
from adafruit_display_text import label
mylabel = label.Label(terminalio.FONT, text="demo", x=20,y=20,
                      background_color=0x000000, color=0xffffff )
display = board.DISPLAY  # e.g. for MagTag
display.root_group = mylabel
while True:
    if display.time_to_refresh == 0:
        display.refresh()
    mylabel.text = str(time.monotonic())
    time.sleep(0.1)
```

### Вимкнути REPL на вбудованому дисплеї

Якщо у вас є плата з вбудованим дисплеєм (наприклад, Feather TFT, Cardputer, FunHouse тощо), CircuitPython налаштує дисплей для вас і виведе REPL на ньому. Але якщо ви хочете отримати більш акуратний вигляд для вашого проєкту, ви можете вимкнути виведення REPL на вбудованому дисплеї, додавши це на початок ваших файлів `boot.py` та `code.py`.

```python
# put at top of both boot.py & code.py 
import board
board.DISPLAY.root_group = None
```