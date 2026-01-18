/* DESCRIPTION UTILS */

const ICON_BASE_URL = "https://unpkg.com/lucide-static@latest/icons";

const weatherFeelings = [
  {
    condition: (t, h) => t <= 0,
    color: "#1a5276",
    text: "Критичне переохолодження: ризик замерзання труб та пошкодження конструкцій будівлі.",
    iconUrl: `${ICON_BASE_URL}/snowflake.svg`,
  },
  {
    condition: (t, h) => t > 0 && t <= 5,
    color: "#21618c",
    text: "Екстремальний холод: високий ризик гіпотермії. Організм витрачає всі ресурси на обігрів.",
    iconUrl: `${ICON_BASE_URL}/thermometer-snowflake.svg`,
  },
  {
    condition: (t, h) => t > 5 && t <= 10,
    color: "#2874a6",
    text: "Дуже холодно: небезпечно для людей похилого віку та дітей. Ризик конденсату.",
    iconUrl: `${ICON_BASE_URL}/triangle-alert.svg`,
  },
  {
    condition: (t, h) => t > 10 && t < 16,
    color: "#2e86c1",
    text: "Сильний дискомфорт: організм не відновлюється під час сну. Потрібен обігрів.",
    iconUrl: `${ICON_BASE_URL}/thermometer.svg`,
  },
  {
    condition: (t, h) => t >= 16 && t < 18,
    color: "#5dade2",
    text: "Гранична прохолода: допустима для сну в теплій піжамі, але занизька для сидячої роботи.",
    iconUrl: `${ICON_BASE_URL}/shirt.svg`,
  },
  {
    condition: (t, h) => t >= 18 && t <= 20 && h >= 40 && h <= 60,
    color: "#2ecc71",
    text: "Здоровий мікроклімат: ідеально для сну та бадьорості. Слизові оболонки не пересихають.",
    iconUrl: `${ICON_BASE_URL}/shield-check.svg`,
  },
  {
    condition: (t, h) => t > 20 && t <= 23 && h >= 35 && h <= 55,
    color: "#27ae60",
    text: "Оптимальний комфорт: стандартна температура для домашнього відпочинку в легкому одязі.",
    iconUrl: `${ICON_BASE_URL}/smile.svg`,
  },
  {
    condition: (t, h) => t > 18 && t <= 24 && h < 30,
    color: "#f39c12",
    text: "Занадто сухо: подразнення очей та носоглотки. Рекомендовано увімкнути зволожувач.",
    iconUrl: `${ICON_BASE_URL}/droplets.svg`,
  },
  {
    condition: (t, h) => t >= 18 && t <= 24 && h > 65,
    color: "#9b59b6",
    text: "Сирість: ризик появи плісняви на стінах та важкість дихання. Потрібне провітрювання.",
    iconUrl: `${ICON_BASE_URL}/waves.svg`, // Символ вологості
  },
  {
    condition: (t, h) => t > 24 && t <= 27 && h <= 50,
    color: "#e67e22",
    text: "Теплувато: працездатність починає падати, організм може відчувати легку втому.",
    iconUrl: `${ICON_BASE_URL}/sun.svg`,
  },
  {
    condition: (t, h) => t > 24 && t <= 28 && h > 55,
    color: "#d35400",
    text: "Душно: поєднання тепла та вологи. Повітря здається 'важким'.",
    iconUrl: `${ICON_BASE_URL}/cloud-sun.svg`,
  },
  {
    condition: (t, h) => t > 28,
    color: "#e74c3c",
    text: "Спекотно: високе навантаження на серце. Необхідне активне охолодження.",
    iconUrl: `${ICON_BASE_URL}/flame.svg`,
  },
];

function getDetailedFeeling(temp, humidity) {
  const result = weatherFeelings.find((f) => f.condition(temp, humidity));
  return result
    ? result.text
    : "Стан адаптації: організм підлаштовується під умови.";
}

function getDetailedFeelingColor(temp, humidity) {
  const result = weatherFeelings.find((f) => f.condition(temp, humidity));
  return result ? result.color : "#000";
}

function getDetailedFeelingImage(temp, humidity) {
  const result = weatherFeelings.find((f) => f.condition(temp, humidity));
  return result
    ? `<img src="${result.iconUrl}" alt="${
        result.text ?? ""
      }" width="24" height="24" />`
    : "";
}

/* DATE TIME UTILS */

const rtf = new Intl.RelativeTimeFormat(document.documentElement.lang, {
  numeric: "auto",
});

function formatTimeAgo(date) {
  const now = new Date();
  const diffInMilliseconds = now - date;
  const seconds = Math.floor(diffInMilliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    return rtf.format(-years, "year");
  } else if (months > 0) {
    return rtf.format(-months, "month");
  } else if (days > 0) {
    return rtf.format(-days, "day");
  } else if (hours > 0) {
    return rtf.format(-hours, "hour");
  } else if (minutes > 0) {
    return rtf.format(-minutes, "minute");
  } else {
    return rtf.format(-seconds, "second");
  }
}

function formatDateTime(date) {
  const now = new Date();

  if (date.getDate() !== now.getDate()) {
    return (
      date.toLocaleDateString(document.documentElement.lang, {
        day: "numeric",
        month: "short",
      }) +
      " " +
      date.toLocaleTimeString(document.documentElement.lang, {
        hour: "2-digit",
        minute: "2-digit",
      })
    );
  }

  return date.toLocaleTimeString(document.documentElement.lang, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* MAIN */

const messages = new Map();

const dateOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
};

const options = {
  username: "website",
  password: "SKQCWqw6e8JW6Gj",
  clientId: `mqttjs_${Math.random().toString(16).substring(2, 8)}`,
};

const client = mqtt.connect(
  "wss://81e95e73d74f4efd837464022a52355a.s1.eu.hivemq.cloud:8884/mqtt",
  options
);

client.on("connect", function () {
  console.info("Connected to broker MQTT");
  client.subscribe("tele/tasmota_8D7614/SENSOR", function (err) {
    if (err) {
      console.info("Error", err);
    }
  });
});

client.on("message", function (topic, message) {
  const data = JSON.parse(message.toString());

  console.info("Message", data);

  messages.set(new Date(data.Time), data);

  const latestKey = Array.from(messages.keys()).sort().at(-1);
  const latestMessage = messages.get(latestKey);
  const date = new Date(latestMessage.Time);
  
  document.getElementById("sens-power").innerText = latestMessage.Switch1 === 'ON' ? 'Є живлення' : 'Немає живлення';
  document.getElementById("sens-power-img").innerHTML = latestMessage.Switch1 === 'ON' ? '<img src="https://unpkg.com/lucide-static@latest/icons/power.svg" alt="Є живлення" width="24" height="24" />' : '<img src="https://unpkg.com/lucide-static@latest/icons/power-off.svg" alt="Немає живлення" width="24" height="24" />';
  document.getElementById("sens-date").innerText = `${formatDateTime(
    date
  )} (${formatTimeAgo(date)})`;
  document.getElementById("sens-temp").innerText = `${
    latestMessage.BME280.Temperature > 0 ? "+" : "-"
  }${latestMessage.BME280.Temperature} °C`;
  document.getElementById("sens-hum").innerText = `${latestMessage.BME280.Humidity}%`;
  document.getElementById("sens-pres").innerText =
    latestMessage.BME280.Pressure;
  document.getElementById("sens-descr").innerText = getDetailedFeeling(
    latestMessage.BME280.Temperature,
    latestMessage.BME280.Humidity
  );
  document.getElementById("sens-descr").parentElement.style.color =
    getDetailedFeelingColor(
      latestMessage.BME280.Temperature,
      latestMessage.BME280.Humidity
    );
  document.getElementById("sens-img").innerHTML = getDetailedFeelingImage(
    latestMessage.BME280.Temperature,
    latestMessage.BME280.Humidity
  );
});

client.on("error", function (err) {
  console.error("Connection error: ", err);
});

/* CHART */

async function drawChart() {
  try {
    const response = await fetch(
      "https://api.github.com/repos/jmas/temperature-humidity-tracker/contents/chart_data.json",
      {
        headers: { Accept: "application/vnd.github.v3.raw" },
      }
    );

    if (!response.ok) throw new Error("Помилка завантаження даних");

    const jsonData = await response.json();

    const ctx = document.getElementById("sens-chart").getContext("2d");

    jsonData.labels = jsonData.labels.map((label) =>
      formatDateTime(new Date(label))
    );

    new Chart(ctx, {
      type: "line",
      data: jsonData,
      options: {
        responsive: true,
        scales: {
          x: {
            title: { display: true, text: "Час" },
          },
          y: {
            beginAtZero: false,
            title: { display: true, text: "Значення" },
          },
        },
        plugins: {
          legend: { position: "top" },
          title: { display: true, text: "Температура та Вологість" },
          tooltip: {
            callbacks: {
              title: (context) => {
                return jsonData.labels[context[0].dataIndex];
              },
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Помилка:", error);
    document.body.innerHTML += `<p style="color:red">Не вдалося завантажити дані: ${error.message}</p>`;
  }
}

drawChart();
