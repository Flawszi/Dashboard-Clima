// Gerenciamento de cidades favoritas

let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

// Renderiza a lista de favoritos
export function renderFavorites() {
  const favoritesList = document.getElementById("favoritesList");
  favoritesList.innerHTML = "";

  favorites.forEach((favorite, index) => {
    const container = document.createElement("div");
    container.className = "favorite-container";

    const button = document.createElement("button");
    button.className = "favorite-item";
    button.textContent = favorite;
    button.addEventListener("click", () => {
      const cityInput = document.getElementById("cityInput");
      const form = document.getElementById("searchForm");
      cityInput.value = favorite;
      form.dispatchEvent(new Event("submit"));
    });

    const removeButton = document.createElement("button");
    removeButton.className = "remove-favorite";
    removeButton.textContent = "×";
    removeButton.title = "Remover favorito";
    removeButton.addEventListener("click", () => {
      favorites.splice(index, 1);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      renderFavorites();
    });

    container.appendChild(button);
    container.appendChild(removeButton);
    favoritesList.appendChild(container);
  });
}

// Adiciona cidade aos favoritos
export function addFavorite(city) {
  if (!city || favorites.includes(city)) return;
  favorites.push(city);
  localStorage.setItem("favorites", JSON.stringify(favorites));
  renderFavorites();
}

// Inicializa eventos dos favoritos
export function initFavorites() {
  const favoriteButton = document.getElementById("favoriteButton");
  favoriteButton.addEventListener("click", () => {
    const cityInput = document.getElementById("cityInput");
    const city = cityInput.value.trim();
    addFavorite(city);
  });

  renderFavorites();
}
