// Funções de renderização da interface

import {
  getWeatherInfo,
  getWindDirection,
  getWeekDay,
  formatDate,
  formatDateTime,
  translatePlanetName,
  translateMoonPhase,
  translateConstellation,
  getMoonPhaseEmoji,
  showStatus,
  hideStatus,
} from "./utils.js";
import { weatherMap } from "./config.js";

// Renderiza localização (cidade e país)
export function renderLocation(place) {
  const title = document.getElementById("locationTitle");
  const subtitle = document.getElementById("locationSubtitle");

  title.textContent = `${place.name}${place.admin1 ? ", " + place.admin1 : ""}`;

  const countryDisplay = place.country_code
    ? `(${place.country_code.toUpperCase()}) ${place.country}`
    : place.country || "Localização não informada";

  subtitle.textContent = countryDisplay;
}

// Renderiza dados climáticos atuais
export function renderToday(data) {
  const current = data.current;
  const daily = data.daily;
  const weather = getWeatherInfo(current.weather_code);

  document.getElementById("weatherDescription").textContent = weather.text;
  document.getElementById("weatherEmoji").textContent = weather.emoji;
  document.getElementById("currentTemp").textContent =
    `${current.temperature_2m} °C`;
  document.getElementById("feelsLike").textContent =
    `Sensação: ${current.apparent_temperature} °C`;
  document.getElementById("currentRain").textContent =
    `${current.precipitation} mm`;
  document.getElementById("rainChance").textContent =
    `Probabilidade: ${daily.precipitation_probability_max[0]}%`;
  document.getElementById("currentWind").textContent =
    `${current.wind_speed_10m} km/h`;
  document.getElementById("windDirection").textContent =
    `Direção: ${getWindDirection(current.wind_direction_10m)}`;
  document.getElementById("humidity").textContent =
    `${current.relative_humidity_2m}%`;
  document.getElementById("maxTemp").textContent =
    `${daily.temperature_2m_max[0]} °C`;
  document.getElementById("minTemp").textContent =
    `${daily.temperature_2m_min[0]} °C`;
  document.getElementById("localTime").textContent = formatDateTime(
    current.time,
  );
}

// Renderiza previsão semanal
export function renderWeek(data) {
  const weekGrid = document.getElementById("weekGrid");
  weekGrid.innerHTML = "";

  const {
    time,
    weather_code,
    temperature_2m_max,
    temperature_2m_min,
    precipitation_sum,
    precipitation_probability_max,
    wind_speed_10m_max,
  } = data.daily;

  time.forEach((date, index) => {
    const weather = getWeatherInfo(weather_code[index]);
    const card = document.createElement("article");
    card.className = "week-card";

    card.innerHTML = `
      <h3 class="day-name">${getWeekDay(date)}</h3>
      <span class="date">${formatDate(date)}</span>
      <div class="week-emoji">${weather.emoji}</div>
      <ul>
        <li><strong>Clima:</strong> ${weather.text}</li>
        <li><strong>Máx:</strong> ${temperature_2m_max[index]} °C</li>
        <li><strong>Mín:</strong> ${temperature_2m_min[index]} °C</li>
        <li><strong>Chuva:</strong> ${precipitation_sum[index]} mm</li>
        <li><strong>Chance:</strong> ${precipitation_probability_max[index]}%</li>
        <li><strong>Vento:</strong> ${wind_speed_10m_max[index]} km/h</li>
      </ul>
    `;

    weekGrid.appendChild(card);
  });
}

// Renderiza dados astronômicos de hoje
export function renderAstro(data) {
  const rows = data?.data?.rows || [];
  const moon = rows.find((item) => item?.body?.id === "moon");
  const sun = rows.find((item) => item?.body?.id === "sun");
  const planets = rows.filter((item) =>
    ["mercury", "venus", "mars", "jupiter", "saturn"].includes(item?.body?.id),
  );

  if (moon) {
    const moonPosition = moon?.positions?.[0];
    const moonPhaseEnglish = moonPosition?.extraInfo?.phase?.string;
    const moonEmoji = getMoonPhaseEmoji(moonPhaseEnglish);

    document.getElementById("moonPhase").textContent =
      `${moonEmoji} ${translateMoonPhase(moonPhaseEnglish)}`;
    document.getElementById("moonConstellation").textContent =
      `Constelação: ${translateConstellation(moonPosition?.position?.constellation?.name)}`;
  }

  if (sun) {
    const sunPosition = sun.positions?.[0]?.position;
    document.getElementById("sunConstellation").textContent =
      `Constelação: ${sunPosition?.constellation?.name || "--"}`;
    document.getElementById("sunAltitude").textContent =
      `Altitude: ${sunPosition?.horizontal?.altitude?.string || "--"}`;
  }

  const planetList = document.getElementById("planetList");
  planetList.innerHTML = "";
  planets.forEach((planet) => {
    const planetPosition = planet.positions?.[0]?.position;
    const p = document.createElement("p");
    p.textContent = `${translatePlanetName(planet.body.id)}: ${translateConstellation(planetPosition?.constellation?.name)}`;
    planetList.appendChild(p);
  });
}

// Renderiza dados astronômicos da semana
export function renderAstroWeek(data) {
  const rows = data?.data?.rows || [];
  const moon = rows.find((item) => item?.body?.id === "moon");
  const sun = rows.find((item) => item?.body?.id === "sun");
  const planets = rows.filter((item) =>
    ["mercury", "venus", "mars", "jupiter", "saturn"].includes(item?.body?.id),
  );

  const weekAstroGrid = document.getElementById("weekAstroGrid");
  weekAstroGrid.innerHTML = "";

  if (!moon || !moon.positions || moon.positions.length === 0) {
    weekAstroGrid.innerHTML =
      "<p>Dados astronômicos da semana não disponíveis.</p>";
    return;
  }

  moon.positions.forEach((moonDay, index) => {
    const sunDay = sun?.positions?.[index];
    const planetsText = planets
      .map((planet) => {
        const planetDay = planet.positions?.[index];
        return `${translatePlanetName(planet.body.id)}: ${translateConstellation(planetDay?.position?.constellation?.name)}`;
      })
      .join("<br>");

    const dateOnly = moonDay.date.split("T")[0];
    const card = document.createElement("article");
    card.className = "week-card";

    card.innerHTML = `
      <h3 class="day-name">${getWeekDay(dateOnly)}</h3>
      <span class="date">${formatDate(dateOnly)}</span>
      <ul>
        <li><strong>Lua:</strong> ${getMoonPhaseEmoji(moonDay?.extraInfo?.phase?.string)} ${translateMoonPhase(moonDay?.extraInfo?.phase?.string)}</li>
        <li><strong>Constelação da Lua:</strong> ${translateConstellation(moonDay.position?.constellation?.name || "--")}</li>
        <li><strong>Constelação do Sol:</strong> ${translateConstellation(sunDay?.position?.constellation?.name || "--")}</li>
        <li><strong>Altitude do Sol:</strong> ${sunDay?.position?.horizontal?.altitude?.string || "--"}</li>
        <li><strong>Outros Planetas:</strong><br>${planetsText || "--"}</li>
      </ul>
    `;

    weekAstroGrid.appendChild(card);
  });
}

// Exibe erro nos dados astronômicos
export function showAstroError(message) {
  document.getElementById("moonPhase").textContent = "--";
  document.getElementById("moonConstellation").textContent = message;
  document.getElementById("sunConstellation").textContent = "--";
  document.getElementById("sunAltitude").textContent = "--";
  document.getElementById("planetList").textContent = message;
}
