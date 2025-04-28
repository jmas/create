---
title: Завантаження зображення на FTP використовуючи CircuitPython на Cardputer
description: Скріпт для завантаження файлу, використовуючи з ESP32 Cardputer і
  CircuitPython. Може підійти для завантаження зображення з камери
category: Программування
tags:
  - CircuitPython
  - Python
  - ESP32
  - Cardputer
date: 2025-04-27T00:00:00.000Z
---
Вже давно граюся з ESP32, котрий отртимує широкі можливості при використанні CircuitPython. CircuitPython це спеціальна версія мови программування Python опитимізована під велику кількість мікроконтролерів і дуже спрощує створення програм під мікроконтролери.

Я використовую [Cardputer](https://arduino.ua/prod7437-portativnii-mini-komputer-m5stack-cardputer-kit-z-m5stamps3) на базі контролеру ESP32 S3, який має клавіатуру та екран, проте достатньо мати будь яку Dev плату ESP32 з підтримкою USB.

Завантажити CiruitPython можно через [M5Burner](https://docs.m5stack.com/en/download). В програмі треба зліва обрати потрібну плату – Cardputer і знайти Circuitpython. Далі потрібно підключити плату по USB, увімкнути та затиснути кнопку на боці корпусу `GO` і натиснути `Reset`, потім відтиснути `GO`. Контролер перезавантажиться і M5Burner зможе ідентифікувати плату.

Тепер можно завантажити пакет CircuitPython та встановити. Після встановлення та перезавантаження контроллер іденифікується як USB-накопичувач. На цьому накопичувачі нас цікавлять два файли `settings.toml` та `code.py`. Для редагування файлів я рекомендую виокристовувати [VSCode](https://code.visualstudio.com/) та розширення [CircuitPython](https://marketplace.visualstudio.com/items/?itemName=joedevivo.vscode-circuitpython). Після встановлення розширення відкрийте накопичувач в якості проєкту VSCode і після цього встановіть необхідні бібліотеки, натиснувши `Ctrl+P` та введіть `> CircuitPython: Show Available Libraries` і виберіть наступні: `adafruit_connection_manager`, `adafruit_requests`.

В файлі `settings.toml` додайте налаштування підключення до Wi-Fi:

```toml
CIRCUITPY_WIFI_SSID="<Назва Wi-Fi точки>"
CIRCUITPY_WIFI_PASSWORD="<Пароль>"
FTP_SERVER="<FTP сервер>"
FTP_PORT=21
FTP_USERNAME="<FTP юзернейм>"
FTP_PASSWORD="<FTP пароль>"
REMOTE_FILENAME="test.jpg"
```

В файлі  `code.py` додайте наступний код:
 
```py
import os
import adafruit_connection_manager
import wifi
import adafruit_requests
import socketpool
import errno
import time

WIFI_SSID = os.getenv("CIRCUITPY_WIFI_SSID")
WIFI_PASSWORD = os.getenv("CIRCUITPY_WIFI_PASSWORD")

FTP_SERVER = os.getenv("FTP_SERVER")
FTP_PORT = os.getenv("FTP_PORT")
FTP_USERNAME = os.getenv("FTP_USERNAME")
FTP_PASSWORD = os.getenv("FTP_PASSWORD")
REMOTE_FILENAME = os.getenv("REMOTE_FILENAME")

pool = adafruit_connection_manager.get_radio_socketpool(wifi.radio)
ssl_context = adafruit_connection_manager.get_radio_ssl_context(wifi.radio)
requests = adafruit_requests.Session(pool, ssl_context)
rssi = wifi.radio.ap_info.rssi

pool = socketpool.SocketPool(wifi.radio)

print(f"Connect: {FTP_SERVER}:{FTP_PORT}")

sock = pool.socket()
sock.connect((FTP_SERVER, FTP_PORT))  # Підключення до FTP-сервера

print("\nUSER...")

sock.send(f"USER {FTP_USERNAME}\r\n".encode())
b = bytearray(512)
response = sock.recv_into(b, 512)
print(b.decode('ascii'))

print("\nPASS...")

b = bytearray(512)
sock.send(f"PASS {FTP_PASSWORD}\r\n".encode())
response = sock.recv_into(b, 512)
print(b.decode('ascii'))

b = bytearray(512)
sock.send(b"PASV\r\n")
response = sock.recv_into(b, 512)
response_str = b.decode('ascii')
print(response_str)

def send_all(sock, data):
    total_sent = 0
    while total_sent < len(data):
        try:
            sent = sock.send(data[total_sent:])
            if sent == 0:
                raise RuntimeError("socket connection broken")
            total_sent += sent
        except OSError as e:
            if e.errno == errno.EAGAIN:
                # Немає місця в буфері, треба почекати
                time.sleep(0.01)  # невелика пауза і спробувати знову
            else:
                raise  # якщо інша помилка — підняти її

if "227 Entering Passive Mode" in response_str:
    # Витягуємо IP і порт з відповіді
    parts = response_str.split('(')[1].split(')')[0].split(',')
    ip_address = ".".join(parts[:4])
    port = int(parts[4]) * 256 + int(parts[5])
    print(f"Data connection to {ip_address}:{port}")

    data_sock = pool.socket()
    data_sock.connect((ip_address, port))

    print("\nSTOR...")

    # Вивантажуємо файл
    b = bytearray(512)
    sock.send(f"STOR {REMOTE_FILENAME}\r\n".encode())
    response = sock.recv_into(b, 512)
    print(b.decode('ascii'))

    print("\nSend image data...")

    with open(REMOTE_FILENAME, "rb") as f:
        while True:
            chunk = f.read(512)
            if not chunk:
                break  # кінець файлу
            send_all(data_sock, chunk)

    data_sock.close()
else:
    print("Error: PASV command failed.")

print("\nQUIT...")

b = bytearray(512)
sock.send(b"QUIT\r\n")
response = sock.recv_into(b, 512)
print(b.decode('ascii'))

print("\nEnd")

sock.close()
```
 
Покладіть в корінь накопичувача будь який не порожній файл `test.jpg`.
 
Код підключеться до FTP та завантажить файл. Можно використовувати для завантаження фотографій з камери або для вивантаження даних з датчика.