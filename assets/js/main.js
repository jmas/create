/* DESCRIPTION UTILS */

const weatherFeelings = [
  {
    condition: (t, h) => t <= 0,
    color: "#1a5276",
    text: "Критичне переохолодження: ризик замерзання труб та пошкодження конструкцій будівлі.",
    iconName: "snowflake",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10 20-1.25-2.5L6 18"/><path d="M20 4l-1.25 2.5L16 6"/><path d="m4 20 1.25-2.5L8 18"/><path d="M10 4l1.25 2.5L13 6"/><path d="m20 20-1.25-2.5L16 18"/><path d="M4 4l1.25 2.5L6 6"/><path d="m10 12 1.25 2.5L13 14"/><path d="m14 12-1.25 2.5L11 14"/><path d="M12 2v20"/><path d="M2 12h20"/></svg>`,
  },
  {
    condition: (t, h) => t > 0 && t <= 5,
    color: "#21618c",
    text: "Екстремальний холод: високий ризик гіпотермії. Необхідне термінове опалення.",
    iconName: "thermometer-snowflake",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12h10"/><path d="M9 4v16"/><path d="m3 9 3 3-3 3"/><path d="M12 6L9 9 6 6"/><path d="m6 18 3-3 3 3"/><path d="M14 4v10.54a4 4 0 1 0 4 0V4a2 2 0 0 0-4 0Z"/></svg>`,
  },
  {
    condition: (t, h) => t > 5 && t <= 10,
    color: "#2874a6",
    text: "Дуже холодно: небезпечно для людей похилого віку та дітей. Ризик конденсату.",
    iconName: "ice-cream", // Використовується як метафора холоду
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7 11 2 10h6l2-10Z"/><path d="M12 11a5.5 5.5 0 1 1 0-11 5.5 5.5 0 1 1 0 11Z"/></svg>`,
  },
  {
    condition: (t, h) => t > 10 && t < 16,
    color: "#2e86c1",
    text: "Сильний дискомфорт: організм не відновлюється під час сну. Потрібен обігрів.",
    iconName: "thermometer-cold",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 1 1 4 0Z"/></svg>`,
  },
  {
    condition: (t, h) => t >= 16 && t < 18,
    color: "#5dade2",
    text: "Гранична прохолода: допустима для сну в теплому одязі, але занизька для роботи.",
    iconName: "shirt",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`,
  },
  {
    condition: (t, h) => t >= 18 && t <= 20 && h >= 40 && h <= 60,
    color: "#2ecc71",
    text: "Здоровий мікроклімат: ідеально для сну та бадьорості. Слизові не пересихають.",
    iconName: "shield-check",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>`,
  },
  {
    condition: (t, h) => t > 20 && t <= 23 && h >= 35 && h <= 55,
    color: "#27ae60",
    text: "Оптимальний комфорт: стандартна температура для відпочинку в легкому одязі.",
    iconName: "smile",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 13a4 4 0 1 0 8 0"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
  },
  {
    condition: (t, h) => t > 18 && t <= 24 && h < 30,
    color: "#f39c12",
    text: "Занадто сухо: подразнення носоглотки. Рекомендовано зволожувач.",
    iconName: "droplets",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 16.3c2.2 0 4-1.8 4-4 0-3.3-4-6.3-4-6.3S3 9 3 12.3c0 2.2 1.8 4 4 4Z"/><path d="M17 18.3c1.7 0 3-1.3 3-3 0-2.5-3-4.8-3-4.8S14 12.8 14 15.3c0 1.7 1.3 3 3 3Z"/></svg>`,
  },
  {
    condition: (t, h) => t >= 18 && t <= 24 && h > 65,
    color: "#9b59b6",
    text: "Сирість: ризик появи плісняви. Потрібне провітрювання.",
    iconName: "wind",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2"/><path d="M9.6 4.6A2 2 0 1 1 11 8H2"/><path d="M12.6 19.4A2 2 0 1 0 14 16H2"/></svg>`,
  },
  {
    condition: (t, h) => t > 24 && t <= 27 && h <= 50,
    color: "#e67e22",
    text: "Теплувато: працездатність падає, організм відчуває втому.",
    iconName: "sun",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
  },
  {
    condition: (t, h) => t > 24 && t <= 28 && h > 55,
    color: "#d35400",
    text: "Душно: повітря здається 'важким', важко зосередитися.",
    iconName: "cloud-sun",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M13 22H7a5 5 0 1 1 4.9-6H13a3 3 0 0 1 0 6Z"/></svg>`,
  },
  {
    condition: (t, h) => t > 28,
    color: "#e74c3c",
    text: "Спекотно: високе навантаження на серце. Необхідне охолодження.",
    iconName: "flame",
    svgIcon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
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
