/* DESCRIPTION UTILS */

const weatherFeelings = [
  {
    condition: (t, h) => t <= 0,
    color: "#1a5276",
    text: "Критичне переохолодження: ризик замерзання труб та пошкодження конструкцій будівлі. Перебування без спецзасобів небезпечне.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="8"></line>
                <path d="M12 2v20M5 9l14 6M5 15l14-6"></path>
              </svg>`, // Сніжинка/мороз
  },
  {
    condition: (t, h) => t > 0 && t <= 5,
    color: "#21618c",
    text: "Екстремальний холод: високий ризик гіпотермії. Організм витрачає всі ресурси на обігрів. Необхідне термінове опалення.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10V8a2 2 0 0 0-2-2h-3.9a2 2 0 0 1-1.6-.8L10 2l-2.5 5.2a2 2 0 0 1-1.6.8H2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v4h4v-4h4v4h4v-4h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2z"></path>
                <path d="M10 2h4"></path>
              </svg>`, // Куртка/одяг
  },
  {
    condition: (t, h) => t > 5 && t <= 10,
    color: "#2874a6",
    text: "Дуже холодно: небезпечно для людей похилого віку та дітей. Високий ризик конденсату та швидкого розвитку грибка.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                <path d="M12 6v6l4 2"></path>
              </svg>`, // Годинник/час
  },
  {
    condition: (t, h) => t > 10 && t < 16,
    color: "#2e86c1",
    text: "Сильний дискомфорт: організм не відновлюється під час сну. Необхідний інтенсивний обігрів та теплий багатошаровий одяг.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="8"></line>
                <path d="M12 2v20M5 9l14 6M5 15l14-6"></path>
              </svg>`, // Термометр
  },
  {
    condition: (t, h) => t >= 16 && t < 18,
    color: "#5dade2",
    text: "Гранична прохолода: допустима температура для міцного сну в теплій піжамі, але занизька для сидячої роботи.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>`, // Змерзлі руки
  },
  {
    condition: (t, h) => t >= 18 && t <= 20 && h >= 40 && h <= 60,
    color: "#2ecc71",
    text: "Здоровий мікроклімат: ідеально для сну та бадьорості. Слизові оболонки не пересихають.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>`, // Щит/захист
  },
  {
    condition: (t, h) => t > 20 && t <= 23 && h >= 35 && h <= 55,
    color: "#27ae60",
    text: "Оптимальний комфорт: стандартна температура для домашнього відпочинку в легкому одязі.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>`, // Смайлик
  },
  {
    condition: (t, h) => t > 18 && t <= 24 && h < 30,
    color: "#f39c12",
    text: "Занадто сухо: подразнення очей та носоглотки. Рекомендовано увімкнути зволожувач.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7c0 4.42 3.58 8 8 8h3V5c0-1.1-.9-2-2-2h-3a3 3 0 0 0-3-3z"></path>
                <path d="M12 17a5 5 0 0 1-5-5V5a3 3 0 0 1 3-3h2"></path>
                <line x1="12" y1="20" x2="12" y2="22"></line>
              </svg>`, // Крапля (сухо)
  },
  {
    condition: (t, h) => t >= 18 && t <= 24 && h > 65,
    color: "#9b59b6",
    text: "Сирість: ризик появи плісняви на стінах та важкість дихання. Потрібне провітрювання.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7c0 4.42 3.58 8 8 8h3V5c0-1.1-.9-2-2-2h-3a3 3 0 0 0-3-3z"></path>
                <path d="M12 17a5 5 0 0 1-5-5V5a3 3 0 0 1 3-3h2"></path>
                <line x1="12" y1="20" x2="12" y2="22"></line>
              </svg>`, // Крапля (волого)
  },
  {
    condition: (t, h) => t > 24 && t <= 27 && h <= 50,
    color: "#e67e22",
    text: "Теплувато: працездатність починає падати, організм може відчувати легку втому.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="8"></line>
                <path d="M12 2v20M5 9l14 6M5 15l14-6"></path>
              </svg>`, // Сонечко
  },
  {
    condition: (t, h) => t > 24 && t <= 28 && h > 55,
    color: "#d35400",
    text: "Душно: поєднання тепла та вологи. Повітря здається 'важким', важко зосередитися.",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
              </svg>`, // Блискавка
  },
  {
    condition: (t, h) => t > 28,
    color: "#e74c3c",
    text: "Спекотно: високе навантаження на серце. Необхідне активне охолодження (кондиціонер/вентилятор).",
    svgIcon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12" y2="8"></line>
                <path d="M12 2v20M5 9l14 6M5 15l14-6"></path>
              </svg>`, // Сонце
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
  return result ? result.svgIcon : "";
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

  document.getElementById("sens-date").innerText = `${formatDateTime(
    date
  )} (${formatTimeAgo(date)})`;
  document.getElementById("sens-temp").innerText = `${
    latestMessage.BME280.Temperature > 0 ? "+" : "-"
  }${latestMessage.BME280.Temperature} °C`;
  document.getElementById("sens-hum").innerText = latestMessage.BME280.Humidity;
  document.getElementById("sens-pres").innerText =
    latestMessage.BME280.Pressure;
  document.getElementById("sens-descr").innerText = getDetailedFeeling(
    latestMessage.BME280.Temperature,
    latestMessage.BME280.Humidity
  );
  document.getElementById("sens-descr").style.color = getDetailedFeelingColor(
    latestMessage.BME280.Temperature,
    latestMessage.BME280.Humidity
  );
  document.getElementById("sens-img").style.color = getDetailedFeelingImage(
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
