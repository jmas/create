---
layout: page
title: Сенсори
permalink: /sensor/
icon: fas fa-thermometer-half
order: "5"
---

<dl>
  <dt>Температура:</dt>
  <dd id="sendor-temp"></dd>
  <dt>Вологість:</dt>
  <dd id="sendor-hum"></dd>
  <dt>Тиск:</dt>
  <dd id="sendor-pres"></dd>
</dl>

<script src="https://unpkg.com/mqtt/dist/mqtt.min.js"></script>
<script>
const options = {
    username: 'website',
    password: 'SKQCWqw6e8JW6Gj',
    // Optional: set a unique client ID
    clientId: `mqttjs_${Math.random().toString(16).substring(2, 8)}`
};

    const client = mqtt.connect('wss://81e95e73d74f4efd837464022a52355a.s1.eu.hivemq.cloud:8884/mqtt', options); // Use 'ws://' for WebSocket connections in the browser

    client.on('connect', function () {
        console.log('Connected to broker MQTT');
        client.subscribe('tasmota/discovery/DCB4D98D7614/sensors', function (err) {
            if (!err) {
                // client.publish('presence', 'Hello mqtt from browser!');
            }
        });
    });

    client.on('message', function (topic, message) {
        document.getElementById('sens-temp').innerText = message.sn.BME280.Temperature;
        document.getElementById('sens-hum').innerText = message.sn.BME280.Humidity;
        document.getElementById('sens-pres').innerText = message.sn.BME280.Pressure;
        console.log(topic, message, message.toString());
    });

    client.on('error', function (err) {
        console.error("Connection error: ", err);
    });
</script>

