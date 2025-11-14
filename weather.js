// Author: Caleb Okrzesik
// Purpose: Weather App with responsive, bright color palette back end

const API_KEY = "cdd84496d31e6a4c46b264f7db6a324f";

function setCustomImage(url) {
    const img = document.getElementById("customImage");
    img.src = url;
    img.style.display = "block";
}

async function getWeather() {
    const city = document.getElementById("cityInput").value.trim();
    const currentDiv = document.getElementById("currentWeather");
    const forecastDiv = document.getElementById("forecast");

    if (!city) {
        alert("Please enter a city name.");
        return;
    }

    // Get selected unit, fallback to metric
    const unitRadio = document.querySelector('input[name="unit"]:checked');
    const unit = unitRadio ? unitRadio.value : "metric";
    const unitSymbol = unit === "metric" ? "°C" : "°F";

    const currentURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${unit}`;
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=${unit}`;

    try {
        // Current Weather
        const res = await fetch(currentURL);
        const data = await res.json();

        if (data.cod != 200) {
            alert(data.message);
            return;
        }

        const temp = data.main.temp;
        const desc = data.weather[0].description;
        const humidity = data.main.humidity;

        currentDiv.innerText =
            `Temperature: ${temp}${unitSymbol}\n` +
            `Condition: ${desc}\n` +
            `Humidity: ${humidity}%`;

        // Forecast
        const fRes = await fetch(forecastURL);
        const fData = await fRes.json();

        const daily = {};

        fData.list.forEach(entry => {
            if (entry.dt_txt.includes("12:00:00")) {
                const date = entry.dt_txt.split(" ")[0];
                daily[date] = {
                    temp: entry.main.temp,
                    desc: entry.weather[0].description
                };
            }
        });

        forecastDiv.innerHTML = "";

        for (let d in daily) {
            const box = document.createElement("div");
            box.className = "forecast-day";
            box.innerHTML =
                `<strong>${d}</strong><br>` +
                `${daily[d].temp}${unitSymbol} — ${daily[d].desc}`;
            forecastDiv.appendChild(box);
        }

    } catch (err) {
        alert("Error: " + err.message);
    }
}
