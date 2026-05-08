// Funções utilitárias para formatação e tradução

// Converte graus de direção do vento em texto
export function getWindDirection(degrees) {
  const directions = ["N", "NE", "L", "SE", "S", "SO", "O", "NO"];
  const index = Math.round(degrees / 45) % 8;
  return `${directions[index]} (${degrees}°)`;
}

// Converte data string para nome do dia da semana em português
export function getWeekDay(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { weekday: "long" });
}

// Formata data para dd/mm
export function formatDate(dateString) {
  const date = new Date(dateString + "T12:00:00");
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// Formata data e hora completa
export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString("pt-BR");
}

// Traduz nome dos planetas
export function translatePlanetName(id) {
  const names = {
    mercury: "Mercúrio",
    venus: "Vênus",
    mars: "Marte",
    jupiter: "Júpiter",
    saturn: "Saturno",
  };
  return names[id] || id;
}

// Traduz fases da lua
export function translateMoonPhase(phase) {
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

// Traduz constelações
export function translateConstellation(name) {
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
  return constellations[name] || name || "--";
}

// Retorna emoji da fase da lua
export function getMoonPhaseEmoji(phase) {
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
  return emojis[phase] || "🌙";
}

// Converte código de país em emoji de bandeira
export function getCountryFlag(countryCode) {
  if (!countryCode) return "🌍";
  const code = String(countryCode).toUpperCase().trim();
  return flagMap[code] || "🌍";
}

// Funções de status
export function showStatus(message) {
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.textContent = message;
  statusMessage.classList.remove("hidden");
}

export function hideStatus() {
  const statusMessage = document.getElementById("statusMessage");
  statusMessage.classList.add("hidden");
}
