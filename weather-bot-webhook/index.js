// index.js
import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
app.use(bodyParser.json());

const OPENWEATHER_API_KEY = '0a19a98ddde4d277ee5f7daf614d0e9d';

app.post('/webhook', async (req, res) => {
  const intent = req.body.queryResult.intent.displayName;
  const city = req.body.queryResult.parameters['city'];

  try {
    let weatherData;

    if (intent === 'Current Weather Intent') {
      weatherData = await getCurrentWeather(city);
    } else if (intent === 'Forecast Weather Intent') {
      const date = req.body.queryResult.parameters['date'] || new Date();
      weatherData = await getWeatherForecast(city, date);
    }

    const response = {
      fulfillmentText: weatherData
    };

    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function getCurrentWeather(city) {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
  );

  const data = response.data;
  return `The current weather in ${city} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C.`;
}

async function getWeatherForecast(city, date) {
  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`
  );

  const forecastDate = new Date(date);
  const forecasts = response.data.list.filter(item => {
    const itemDate = new Date(item.dt * 1000);
    return itemDate >= forecastDate && itemDate <= new Date(forecastDate.getTime() + 8 * 24 * 60 * 60 * 1000);
  });

  let forecastText = `8-day forecast for ${city}:\n`;
  forecasts.forEach(item => {
    const date = new Date(item.dt * 1000).toDateString();
    forecastText += `${date}: ${item.weather[0].description}, Temp: ${item.main.temp}°C\n`;
  });

  return forecastText;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
