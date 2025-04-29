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