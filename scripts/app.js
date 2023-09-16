const body = document.querySelector("body");

const searchButton = document.querySelector(".search-button");
const searchInput = document.querySelector("#search");
const weatherContainer = document.querySelector(".weather");

const cache = JSON.parse(localStorage.getItem("cache")) || {};

const fetchWeatherData = async (query) => {
  weatherContainer.classList.add("loading");
  const time = Math.round(Date.now() / 1000);
  invalidateCache();
  if (query in cache) {
    console.log(
      `cache hit - no need to fetch data for ${query} previously fetched less than 60 seconds ago`
    );
    return cache[query].data;
  }
  console.log("cache miss");
  const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=28fe7b5f9a78838c639143fc517e4343`;
  const res = await fetch(endpoint, { mode: "cors" });
  if (res.status !== 200) {
    alert("Cannot fetch data check for any typos");
    weatherContainer.classList.remove("loading");
    throw new Error("cannot fetch data");
  }
  const data = await res.json();
  cache[query] = { time, data };
  localStorage.setItem("cache", JSON.stringify(cache));
  console.log(cache);
  return data;
};

const invalidateCache = () => {
  const time = Math.round(Date.now() / 1000);
  for (const [key, value] of Object.entries(cache)) {
    if (time - value.time > 60) {
      delete cache[key];
    }
  }
  localStorage.setItem("cache", JSON.stringify(cache));
};

const updateUI = (data) => {
  weatherContainer.classList.remove("loading");
  const { name, main, weather } = data;
  const { temp, feels_like, humidity } = main;
  const { description, icon } = weather[0];
  const cityEl = document.querySelector(".city");
  const temperatureEl = document.querySelector(".temp");
  const descriptionEl = document.querySelector(".description");

  cityEl.textContent = name;
  temperatureEl.textContent = `${temp}°C`;
  descriptionEl.textContent = description
    .split(" ")
    .map((word) => {
      return word[0].toUpperCase() + word.slice(1);
    })
    .join(" ");
};

searchButton.addEventListener("click", () => {
  const query = searchInput.value.toLowerCase();
  const time = Math.round(Date.now() / 1000);
  if (query in cache && cache[query] > time - 60) {
    console.log(
      `cache hit - no need to fetch data for ${query} previously fetched ${
        time - cache[query]
      } seconds ago`
    );
    return;
  }
  fetchWeatherData(query).then((data) => {
    updateUI(data);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const query = "london";
  fetchWeatherData(query).then((data) => {
    updateUI(data);
  });
});
