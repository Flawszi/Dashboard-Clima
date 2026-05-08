// -> Documentação do código JavaScript do dashboard climático e astronômico.

//Inicialização das variaveis utilizadas
// O 'currentView' controla qual aba está ativa no dashboard: "today" para hoje ou "week" para semana.
const form = document.getElementById("searchForm");

const cityInput = document.getElementById("cityInput");

const tabs = document.querySelectorAll(".tab");

const todayView = document.getElementById("todayView");

const weekView = document.getElementById("weekView");

const weekGrid = document.getElementById("weekGrid");

const todayAstroSection = document.getElementById("todayAstroSection");

const weekAstroGrid = document.getElementById("weekAstroGrid");

const statusMessage = document.getElementById("statusMessage");

const ASTRONOMY_APP_ID = "bfe2f7de-7f4c-405c-a98f-16f5dc1a0951";

const ASTRONOMY_APP_SECRET =
  "d558e187b9e956b0f68df55b9557899e92c001e95b653a9c6c9acd15a8443d0635defe8dd9d72f2f496f5ab75db4097d932672068e0a6a3aaa307bc86b878e5549cb6f3749ac11615697a09169885bf5c4f6d2bb64f727091a67cdaf70296544c515b144cd924032719725c82861156cAL";

const favoritesList = document.getElementById("favoritesList");

const favoriteButton = document.getElementById("favoriteButton");

let currentView = "today";

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// Objeto que relaciona os códigos meteorológicos da Open-Meteo, com uma descrição em português e um emoji correspondente.
const weatherMap = {
  0: { text: "Céu limpo", emoji: "☀️" },
  1: { text: "Predominantemente limpo", emoji: "🌤️" },
  2: { text: "Parcialmente nublado", emoji: "⛅" },
  3: { text: "Nublado", emoji: "☁️" },
  45: { text: "Neblina", emoji: "🌫️" },
  48: { text: "Geada com neblina", emoji: "🌫️" },
  51: { text: "Garoa leve", emoji: "🌦️" },
  53: { text: "Garoa moderada", emoji: "🌦️" },
  55: { text: "Garoa intensa", emoji: "🌧️" },
  56: { text: "Garoa congelante leve", emoji: "🌧️" },
  57: { text: "Garoa congelante intensa", emoji: "🌧️" },
  61: { text: "Chuva fraca", emoji: "🌦️" },
  63: { text: "Chuva moderada", emoji: "🌧️" },
  65: { text: "Chuva forte", emoji: "🌧️" },
  66: { text: "Chuva congelante leve", emoji: "🌧️" },
  67: { text: "Chuva congelante forte", emoji: "🌧️" },
  71: { text: "Neve fraca", emoji: "🌨️" },
  73: { text: "Neve moderada", emoji: "🌨️" },
  75: { text: "Neve forte", emoji: "❄️" },
  77: { text: "Cristais de neve", emoji: "❄️" },
  80: { text: "Pancadas de chuva fracas", emoji: "🌦️" },
  81: { text: "Pancadas de chuva moderadas", emoji: "🌧️" },
  82: { text: "Pancadas de chuva fortes", emoji: "⛈️" },
  85: { text: "Pancadas de neve fracas", emoji: "🌨️" },
  86: { text: "Pancadas de neve fortes", emoji: "❄️" },
  95: { text: "Trovoada", emoji: "⛈️" },
  96: { text: "Trovoada com granizo leve", emoji: "⛈️" },
  99: { text: "Trovoada com granizo forte", emoji: "⛈️" },
};

// Percorre todas as abas do dashboard. Quando o usuário clicar em uma aba, a visualização atual será alterada entre "Hoje" e "Semana".
tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    currentView = tab.dataset.view;

    tabs.forEach((t) => t.classList.remove("active"));

    tab.classList.add("active");

    if (currentView === "today") {
      todayView.classList.add("active");
      weekView.classList.remove("active");

      // mostra os cards astronômicos de hoje
      todayAstroSection.style.display = "block";
    } else {
      weekView.classList.add("active");
      todayView.classList.remove("active");

      // esconde os cards astronômicos de hoje para não repetir
      todayAstroSection.style.display = "none";
    }
  });
});
//  evento de submit para o formulario, para quando for pesquisado um país

form.addEventListener("submit", async (event) => {
  // Impede que o formulário recarregue a página ao ser enviado.
  event.preventDefault();

  const city = cityInput.value.trim();

  // função de if que ao digitar o nome de uma cidade nula ou inválida, vai redirecionar a outra função para retornar
  if (!city) {
    showStatus("Digite o nome de uma cidade.");
    return;
  }

  // função que vai tentar executar a busca da cidade, e ao acessar uma cidade (coordenadas) certas, vai ser exibida corretamente.
  // Se o lugar (place) for invalida ou nula, exibira a mensagem de erro.
  try {
    showStatus("Buscando cidade e dados climáticos...");

    const place = await getCityCoordinates(city);
    console.log(place, "qwrwr");

    if (!place) {
      showStatus("Cidade não encontrada. Tente outro nome.");
      return;
    }

    // aqui mostra o que vai ser exibido ao executar a cidade encontrada (localização, o tempo hoje e daqui uma semana)
    const weatherData = await getWeather(place.latitude, place.longitude);

    renderLocation(place);

    renderToday(weatherData);
    renderWeek(weatherData);

    // vai tentar pegar os dados astronomicos com base na latitude e longitude do lugar e exibir uma mensagem de sucesso se for o caso
    //  vai pegar e exibir um erro caso os dados nao forem carregados corretamente
    // foi utilizado o number para que o valor nao seja em String, ja que a latitude em texto pode gerar erro

    try {
      showStatus("Buscando cidade e dados astronomicos...");
      const astronomyData = await getAstronomyData(
        Number(place.latitude),
        Number(place.longitude),
      );

      renderAstro(astronomyData);
      renderAstroWeek(astronomyData);
    } catch (astroError) {
      console.error("Erro na AstronomyAPI:", astroError);
      showAstroError("Não foi possível carregar os dados astronômicos.");
    }

    hideStatus();

    // Tratando um erro (catch), neste caso, se houver erro ao buscar algum dado
    hideStatus();
  } catch (error) {
    console.error(error);
    showStatus("Ocorreu um erro ao buscar os dados.");

    renderAstro();
  }
});

// função que vai buscar os dados na api do open-meteo (internet), com base nas coordenadas da cidade obtidas.
// Na parte do if, se nao houver resultados na api, vai retorna nulo. Se houver algo, vai exibir o primeiro resultado ([0])
async function getCityCoordinates(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;

  const response = await fetch(url);

  const data = await response.json();

  if (!data.results || !data.results.length) return null;

  return data.results[0];
}

// função de obter o tempo local com base na latitude e longitude, vai pegar os dados na api e retorna-lo
async function getWeather(latitude, longitude) {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m` +
    `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max` +
    `&timezone=auto`;

  const response = await fetch(url);

  return await response.json();
}

// função que renderiza um lugar, obtendo o titulo (nome da cidade) e o subtitulo (país),com base nos ids decididos no html.
// Para caso nao seja informado, que seja exibido uma mensagem
function renderLocation(place) {
  const title = document.getElementById("locationTitle");
  const subtitle = document.getElementById("locationSubtitle");

  title.textContent = `${place.name}${place.admin1 ? ", " + place.admin1 : ""}`;

  // se houver country_code, adiciona entre parênteses
  const countryDisplay = place.country_code
    ? `(${place.country_code.toUpperCase()}) ${place.country}`
    : place.country || "Localização não informada";

  subtitle.textContent = countryDisplay;
  updateFavoriteButtonState(cityInput.value.trim());
}

function updateFavoriteButtonState(city) {
  const normalizedCity = capitalizeCityName(city);
  const isFavorite = normalizedCity && favorites.includes(normalizedCity);

  favoriteButton.classList.toggle("favorited", isFavorite);
  favoriteButton.textContent = isFavorite ? "★" : "☆";
}

// Função que renderiza os dados meteorológicos atuais, atualizando temperatura, vento, chuva, umidade e horário local no dashboard.
function renderToday(data) {
  // pega os dados no momento atual
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

// função que renderiza os dados do conteudo que vao ser exibidos no dashboard (temperatura, horario local, direção de vento etc...), durante semana
// Cria cards e os preenche com dados meteorologicos dos dias da semana (Até 7 dias)

function renderWeek(data) {
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

// Função que converte o código climático da Open-Meteo em uma descrição textual e um emoji correspondente.
function getWeatherInfo(code) {
  return (
    weatherMap[code] || {
      text: "Condição desconhecida",
      emoji: "❔",
    }
  );
}

// Função que vai receber os graus da direção do vento obtida, e converter para a direção que corresponde e retornar-la.
function getWindDirection(degrees) {
  const directions = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];

  const index = Math.round(degrees / 45) % 8;

  return `${directions[index]} (${degrees}°)`;
}

// Função que converte uma data em texto para o nome do dia da semana em português.
function getWeekDay(dateString) {
  const date = new Date(dateString + "T12:00:00");

  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
  });
}

// Função que vai obter (formatar) e retornar uma data para o sistema brasileiro de horario
function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}

// função que vai exibir a data completa do dia
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR");
}

// função de aparecer a exibição um status, removendo a classe de 'escondido'
function showStatus(message) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden");
}
// função que esconde o status da mensagem
function hideStatus() {
  statusMessage.classList.add("hidden");
}

// Quando o site terminar de carregar, São Paulo será pesquisada e mostrada automaticamente.
window.addEventListener("DOMContentLoaded", () => {
  cityInput.value = "São Paulo";

  form.dispatchEvent(new Event("submit"));

  renderFavorites();
});

// função que obtem os dados da api Astronomy-api com base na latitude e longitude, começando pela autenticação e por fim o lançamento
// de um erro se a resposta não for normal.

// função async (assíncrona, ou seja, precisa esperar a resposta da api) pega os dados astronomicos, usando a latitude e longitude para a localização
async function getAstronomyData(latitude, longitude) {
  const today = new Date();

  const startDate = today.toISOString().split("T")[0];

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 6);

  const endDate = nextWeek.toISOString().split("T")[0];

  const time = today.toTimeString().split(" ")[0];

  const authString = btoa(`${ASTRONOMY_APP_ID}:${ASTRONOMY_APP_SECRET}`);

  const url =
    `https://api.astronomyapi.com/api/v2/bodies/positions` +
    `?latitude=${Number(latitude)}` +
    `&longitude=${Number(longitude)}` +
    `&elevation=0` +
    `&from_date=${startDate}` +
    `&to_date=${endDate}` +
    `&time=${time}` +
    `&output=rows`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Basic ${authString}`,
    },
  });

  const text = await response.text();

  console.log("Status AstronomyAPI:", response.status);
  console.log("Resposta AstronomyAPI:", text);

  if (!response.ok) {
    throw new Error(`Erro AstronomyAPI: ${response.status}`);
  }

  return JSON.parse(text);
}

// Função que renderiza os dados astronômicos de hoje. A AstronomyAPI está usando output=rows, os dados vêm em data.data.rows.
// O (?.) evita erros caso alguma parte da resposta não exista.
function renderAstro(data) {
  // A API está retornando os dados em data.data.rows
  const rows = data?.data?.rows || [];

  // aqui vai tentar achar a Lua e o Sol dentro da row, utilizando find (percorre uma lista e mostra o primeiro item), utilizando item (itens dentro da row)
  // A API identifica os astros dentro de body.id
  const moon = rows.find((item) => item?.body?.id === "moon");
  const sun = rows.find((item) => item?.body?.id === "sun");

  // vai criar uma lista com alguns planetas. Utilizando filter, que percorre uma lista da API e retorna todos os itens que satisfazem uma condição
  // O 'includes' serve para verificar se o id do astro esta dentro da lista, mantendo-o
  const planets = rows.filter((item) =>
    ["mercury", "venus", "mars", "jupiter", "saturn"].includes(item?.body?.id),
  );

  // Se a lua for encontrada, a lista positions vai pegar a primeira posição
  if (moon) {
    const moonPosition = moon?.positions?.[0];

    const moonPhaseEnglish = moonPosition?.extraInfo?.phase?.string;

    const moonEmoji = getMoonPhaseEmoji(moonPhaseEnglish);

    document.getElementById("moonPhase").textContent =
      `${moonEmoji} ${translateMoonPhase(moonPhaseEnglish)}`;

    // Essa linha pega onde a constelação da lua está, retornando o nome
    document.getElementById("moonConstellation").textContent =
      `Constelação: ${translateConstellation(
        moonPosition?.position?.constellation?.name,
      )}`;
  }

  // Se o sol for encontrado, a lista positions vai pegar a primeira posição
  if (sun) {
    const sunPosition = sun.positions?.[0]?.position;

    // Pegando o elemento pelo id (sunConstellation), a API vai tentar retornar a constelação do sol
    document.getElementById("sunConstellation").textContent =
      `Constelação: ${sunPosition?.constellation?.name || "--"}`;

    // Pegando o elemento pelo id (sunAltitude), a API vai tentar retornar a altitude do sol no céu
    // a altitude seria o angulo observacional em meio ao horizonte, se for negativo, esta abaixo do horizonte
    document.getElementById("sunAltitude").textContent =
      `Altitude: ${sunPosition?.horizontal?.altitude?.string || "--"}`;
  }

  // Aonde a lista de planetas aparecerá
  const planetList = document.getElementById("planetList");

  // Limpa a lista prévia
  planetList.innerHTML = "";

  // o forEach executa uma função para cada item na lista, no caso, planetas
  planets.forEach((planet) => {
    // Cada planeta tem uma lista positions, então pegamos a primeira posição
    const planetPosition = planet.positions?.[0]?.position;

    // cria um paragrafo
    const p = document.createElement("p");

    // Mostra o texto da linha do planeta; traduzindo o nome do planeta com base no ID e juntando a constelação
    p.textContent = `${translatePlanetName(planet.body.id)}: ${translateConstellation(
      planetPosition?.constellation?.name,
    )}`;

    // O 'p' é colocado dentro da div dos planetas
    planetList.appendChild(p);
  });
}

// função que renderiza os dados astronômicos da semana
function renderAstroWeek(data) {
  // se 'data' existir, acessa data.data.rowso. '?' evita erro caso alguma parte nao exista
  // Se rows nao existir, retorna um array vazio
  const rows = data?.data?.rows || [];

  // procura a Lua dentro da lista de astros. O find percorre a lista e retorna o primeiro item encontrado
  // body.id identifica qual astro é
  const moon = rows.find((item) => item?.body?.id === "moon");

  // procura o Sol
  const sun = rows.find((item) => item?.body?.id === "sun");

  // cria uma lista apenas com alguns planetas. O filter percorre toda a lista e retorna somente os planetas desejados
  const planets = rows.filter((item) =>
    ["mercury", "venus", "mars", "jupiter", "saturn"].includes(item?.body?.id),
  );

  // pega a div do HTML onde os cards da semana astronômica aparecerão
  const weekAstroGrid = document.getElementById("weekAstroGrid");

  // limpa os cards antigos antes de criar novos
  weekAstroGrid.innerHTML = "";

  // se nao houver dados da Lua ou positions mostra uma mensagem de erro e para a função
  if (!moon || !moon.positions || moon.positions.length === 0) {
    weekAstroGrid.innerHTML =
      "<p>Dados astronômicos da semana não disponíveis.</p>";

    return;
  }

  // percorre cada posição da Lua. cada posição representa um dia/horário retornado pela API
  moon.positions.forEach((moonDay, index) => {
    // pega os dados do Sol usando o mesmo índice
    const sunDay = sun?.positions?.[index];

    // cria os textos dos planetas. o map percorre cada planeta e transforma em texto
    const planetsText = planets
      .map((planet) => {
        // pega os dados do planeta naquele mesmo dia
        const planetDay = planet.positions?.[index];

        // retorna o texto do planeta
        return `
          ${translatePlanetName(planet.body.id)}:
          ${translateConstellation(planetDay?.position?.constellation?.name)}
        `;
      })

      // junta todos os textos usando quebra de linha HTML
      .join("<br>");

    // pega somente a data. o split divide o texto em partes usando "T"
    // [0] pega só a parte da data
    const dateOnly = moonDay.date.split("T")[0];

    // cria um card HTML
    const card = document.createElement("article");

    // adiciona a classe CSS
    card.className = "week-card";

    // conteúdo interno do card
    card.innerHTML = `
    
      <h3 class="day-name">
        ${getWeekDay(dateOnly)}
      </h3>

      <span class="date">
        ${formatDate(dateOnly)}
      </span>

      <ul>

        <li>
          <strong>Lua:</strong>
          ${getMoonPhaseEmoji(moonDay?.extraInfo?.phase?.string)}
${translateMoonPhase(moonDay?.extraInfo?.phase?.string)}
        </li>

        <li>
          <strong>Constelação da Lua:</strong>
          ${translateConstellation(moonDay.position?.constellation?.name || "--")}  
        </li>

        <li>
          <strong>Constelação do Sol:</strong>
          ${translateConstellation(sunDay?.position?.constellation?.name || "--")}
        </li>

        <li>
          <strong>Altitude do Sol:</strong>
          ${sunDay?.position?.horizontal?.altitude?.string || "--"}
        </li>

        <li>
          <strong>Outros Planetas:</strong><br>
          ${planetsText || "--"}
        </li>

      </ul>
    `;

    // adiciona o card dentro da grid
    weekAstroGrid.appendChild(card);
  });
}

// função que traduz o nome dos planetas do inglês para português
function translatePlanetName(id) {
  const names = {
    mercury: "Mercúrio",
    venus: "Vênus",
    mars: "Marte",
    jupiter: "Júpiter",
    saturn: "Saturno",
  };

  return names[id] || id;
}

// função para exibir erro na seção astronômica, tambem limpa os dados astronomicos
function showAstroError(message) {
  document.getElementById("moonPhase").textContent = "--";
  document.getElementById("moonConstellation").textContent = message;
  document.getElementById("sunConstellation").textContent = "--";
  document.getElementById("sunAltitude").textContent = "--";
  document.getElementById("planetList").textContent = message;
}

//função que traduz as fases da lua para portugues. Se a fase não existir no objeto, retorna o texto original ou "Fase não disponível".
function translateMoonPhase(phase) {
  const phases = {
    "New Moon": "Lua Nova",
    "Waxing Crescent": "Lua Crescente",
    "First Quarter": "Quarto Crescente",
    "Waxing Gibbous": "Gibosa Crescente",
    "Full Moon": "Lua Cheia",
    "Waning Gibbous": "Gibosa Minguante",
    "Last Quarter": "Quarto Minguante",
    "Waning Crescent": "Lua Minguante",
  };

  return phases[phase] || phase || "Fase não disponível";
}

// função que traduz o nome das constelações do inglês para português
function translateConstellation(name) {
  // objeto com os nomes das constelações
  const constellations = {
    Aries: "Áries",
    Taurus: "Touro",
    Gemini: "Gêmeos",
    Cancer: "Câncer",
    Leo: "Leão",
    Virgo: "Virgem",
    Libra: "Libra",
    Scorpio: "Escorpião",
    Sagittarius: "Sagitário",
    Capricornus: "Capricórnio",
    Aquarius: "Aquário",
    Pisces: "Peixes",

    Ophiuchus: "Ofiúco",
    Orion: "Órion",
    Cassiopeia: "Cassiopeia",
    Andromeda: "Andrômeda",
    Pegasus: "Pégaso",

    Cygnus: "Cisne",
    Lyra: "Lira",
    Draco: "Dragão",
    Hercules: "Hércules",
    Perseus: "Perseu",
    Cetus: "Baleia",
    Phoenix: "Fênix",
    Hydra: "Hidra",
    Lupus: "Lobo",
    Aquila: "Águia",
  };

  // retorna a constelação traduzida
  // se não existir no objeto, retorna o nome original
  return constellations[name] || name || "--";
}

// função que retorna um emoji correspondente à fase da Lua
function getMoonPhaseEmoji(phase) {
  const emojis = {
    "New Moon": "🌑",

    "Waxing Crescent": "🌒",

    "First Quarter": "🌓",

    "Waxing Gibbous": "🌔",

    "Full Moon": "🌕",

    "Waning Gibbous": "🌖",

    "Last Quarter": "🌗",

    "Waning Crescent": "🌘",
  };

  // retorna o emoji correspondente, se não encontrar, retorna uma Lua padrão
  return emojis[phase] || "🌙";
}

// função que converte o código ISO do país em emoji de bandeira
// ex: "BR" -> 🇧🇷, "US" -> 🇺🇸
function getCountryFlag(countryCode) {
  // mapa completo de códigos de país para emojis de bandeira
  const flagMap = {
    BR: "🇧🇷", 
    US: "🇺🇸",
    ES: "🇪🇸",
    FR: "🇫🇷",
    DE: "🇩🇪",
    IT: "🇮🇹",
    PT: "🇵🇹",
    GB: "🇬🇧",
    JP: "🇯🇵",
    CN: "🇨🇳",
    IN: "🇮🇳",
    AU: "🇦🇺",
    CA: "🇨🇦",
    RU: "🇷🇺",
    MX: "🇲🇽",
    KR: "🇰🇷",
    NZ: "🇳🇿",
    SG: "🇸🇬",
    AR: "🇦🇷",
    CL: "🇨🇱",
    CO: "🇨🇴",
    PE: "🇵🇪",
    VE: "🇻🇪",
    IE: "🇮🇪",
    NL: "🇳🇱",
    SE: "🇸🇪",
    NO: "🇳🇴",
    DK: "🇩🇰",
    FI: "🇫🇮",
    PL: "🇵🇱",
    CZ: "🇨🇿",
    TR: "🇹🇷",
    GR: "🇬🇷",
    ZA: "🇿🇦",
    EG: "🇪🇬",
    NG: "🇳🇬",
    TH: "🇹🇭",
    MY: "🇲🇾",
    PH: "🇵🇭",
    ID: "🇮🇩",
    VN: "🇻🇳",
    BD: "🇧🇩",
  };

  if (!countryCode) {
    return "🌍";
  }

  // converte para uppercase e busca no mapa
  const code = String(countryCode).toUpperCase().trim();
  return flagMap[code] || "🌍";
}

function capitalizeCityName(text) {
  return String(text)
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

// função que renderiza os favoritos na tela
function renderFavorites() {
  favoritesList.innerHTML = "";

  favorites.forEach((favorite, index) => {
    const displayName = capitalizeCityName(favorite);

    // container para o favorito e o botão remover
    const container = document.createElement("div");
    container.className = "favorite-container";

    // botão do favorito
    const button = document.createElement("button");
    button.className = "favorite-item";
    button.textContent = displayName;

    // ao clicar no favorito, pesquisa automaticamente
    button.addEventListener("click", () => {
      cityInput.value = favorite;
      form.dispatchEvent(new Event("submit"));
    });

    // botão para remover
    const removeButton = document.createElement("button");
    removeButton.className = "remove-favorite";
    removeButton.textContent = "×"; // símbolo de x
    removeButton.title = "Remover favorito";

    // ao clicar, remove da lista e salva
    removeButton.addEventListener("click", () => {
      favorites.splice(index, 1); // remove do array
      localStorage.setItem("favorites", JSON.stringify(favorites)); // salva
      renderFavorites(); // re-renderiza
      updateFavoriteButtonState(cityInput.value.trim());
    });

    container.appendChild(button);
    container.appendChild(removeButton);
    favoritesList.appendChild(container);
  });
}

favoriteButton.addEventListener("click", () => {
  const city = cityInput.value.trim();

  // impede favoritos vazios
  if (!city) return;

  const normalizedCity = capitalizeCityName(city);

  // impede favoritos repetidos
  if (favorites.includes(normalizedCity)) return;

  favorites.push(normalizedCity);

  // salva no navegador
  localStorage.setItem("favorites", JSON.stringify(favorites));

  renderFavorites();
  updateFavoriteButtonState(normalizedCity);
});

// Carrega os favoritos salvos ao iniciar a página
renderFavorites();
updateFavoriteButtonState(cityInput.value.trim());
