// Funções para interagir com APIs externas

// Busca coordenadas da cidade via Open-Meteo
export async function getCityCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
  const response = await fetch(url);
  const data = await response.json();
  return data.results ? data.results[0] : null;
}

// Busca dados climáticos via Open-Meteo
export async function getWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max&timezone=auto`;
  const response = await fetch(url);
  return await response.json();
}

// Busca dados astronômicos via AstronomyAPI
export async function getAstronomyData(latitude, longitude) {
  const today = new Date();
  const startDate = today.toISOString().split("T")[0];
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 6);
  const endDate = nextWeek.toISOString().split("T")[0];
  const time = today.toTimeString().split(" ")[0];

  const authString = btoa(`${ASTRONOMY_APP_ID}:${ASTRONOMY_APP_SECRET}`);
  const url = `https://api.astronomyapi.com/api/v2/bodies/positions?latitude=${Number(latitude)}&longitude=${Number(longitude)}&elevation=0&from_date=${startDate}&to_date=${endDate}&time=${time}&output=rows`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Authorization: `Basic ${authString}` },
  });

  const text = await response.text();
  console.log("Status AstronomyAPI:", response.status);
  console.log("Resposta AstronomyAPI:", text);

  if (!response.ok) {
    throw new Error(`Erro AstronomyAPI: ${response.status}`);
  }

  return JSON.parse(text);
}
