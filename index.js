const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const getWeather = require("./getWeather");

const app = express();
const db = new sqlite3.Database("./weather.db");

// When someone visits our tiny house, show them a simple form
app.get("/", (req, res) => {
  res.send(
    '<form method="GET" action="/weather"><input type="text" name="city" placeholder="Enter city" /><button type="submit">Get Weather</button></form>'
  );
});

// When someone submits the form, show the weather
app.get("/weather", async (req, res) => {
  const city = req.query.city;

  if (!city) {
    return res.status(400).send("City name is required");
  }

  // Ask for the weather info
  try {
    const weatherData = await getWeather(city);

    // Save the weather data to the database (optional)
    db.run(
      `INSERT INTO weather (city, data) VALUES (?, ?)`,
      [city, JSON.stringify(weatherData)],
      function (err) {
        if (err) {
          return console.log(err.message);
        }
      }
    );

    // Show the weather info to the visitor
    res.send(`
      <h1>Weather for ${city}</h1>
      <p>Temperature: ${weatherData.current.temperature}°C</p>
      <p>Description: ${weatherData.current.weather_descriptions.join(", ")}</p>
      <p>Humidity: ${weatherData.current.humidity}%</p>
      <p><a href="/">Search again</a></p>
    `);
  } catch (error) {
    res.status(500).send("Error retrieving weather data");
  }
});

// Open the tiny house for visitors
app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
