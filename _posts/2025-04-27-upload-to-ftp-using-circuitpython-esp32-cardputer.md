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
date: 2025-04-27
---
Вже давно граюся з ESP32, котрий отртимує широкі можливості при використанні CircuitPython. CircuitPython це спеціальна версія мови программування Python опитимізована під велику кількість мікроконтролерів і дуже спрощує створення програм під мікроконтролери.

Я використовую [Cardputer](https://arduino.ua/prod7437-portativnii-mini-komputer-m5stack-cardputer-kit-z-m5stamps3) на базі контролеру ESP32 S3, який має клавіатуру та екран, проте достатньо мати будь яку Dev плату ESP32 з підтримкою USB.

Завантажити CiruitPython можно через [M5 Burner](https://docs.m5stack.com/en/download). В програмі треба зліва обрати потрібну плату – Cardputer і знайти Circuitpython. Далі потрібно підключити плату по USB, увімкнути та затиснути кнопку на боці корпусу `GO` і натиснути `Reset`, потім відтиснути `GO`. Контролер перезавантажиться і M5Burner зможе ідентифікувати плату.

Тепер можно завантажити пакет CircuitPython та встановити. Після встановлення та перезавантаження контроллер іденифікується як USB-накопичувач. На цьому накопичувачі нас цікавлять два файли `settings.toml` та `code.py`.

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
import time
import adafruit_connection_manager
import wifi
import adafruit_requests
import socketpool

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
sock.connect(("ftp1.camera-ftp.com", 21))  # Підключення до FTP-сервера

print(f"\nUSER...")

sock.send(f"USER {FTP_USERNAME}\r\n".encode())
b = bytearray(512)
response = sock.recv_into(b, 512)
print(b.decode('ascii'))

print(f"\nPASS...")

b = bytearray(512)
sock.send(f"PASS {FTP_PASSWORD}\r\n".encode())
response = sock.recv_into(b, 512)
print(b.decode('ascii'))

print(f"\nRad image file data...")

with open(REMOTE_FILENAME, "rb") as image_file:
  image_data = image_file.read()

b = bytearray(512)
sock.send(b"PASV\r\n")
response = sock.recv_into(b, 512)
response_str = b.decode('ascii')
print(response_str)
if "227 Entering Passive Mode" in response_str:
    # Витягуємо IP і порт з відповіді
    parts = response_str.split('(')[1].split(')')[0].split(',')
    ip_address = ".".join(parts[:4])
    port = int(parts[4]) * 256 + int(parts[5])
    print(f"Data connection to {ip_address}:{port}")

    data_sock = pool.socket()
    data_sock.connect((ip_address, port))

    print(f"\nSTOR...")

    # Вивантажуємо файл
    b = bytearray(512)
    sock.send(f"STOR {REMOTE_FILENAME}\r\n".encode())
    response = sock.recv_into(b, 512)
    print(b.decode('ascii'))

    print(f"\nSend image data...")

    data_sock.send(image_data)
    data_sock.close()
else:
    print("Error: PASV command failed.")

print(f"\nQUIT...")

b = bytearray(512)
sock.send(b"QUIT\r\n")
response = sock.recv_into(b, 512)
print(b.decode('ascii'))

print(f"\nEnd")

sock.close()
 ```
 
 Покладіть в корінь накопичувача будь який не порожній файл `test.jpg`.
 
 Код підключеться до FTP та завантажить файл. Можно використовувати для завантаження фотографій з камери або для вивантаження даних з датчика.