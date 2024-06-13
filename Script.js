// Load the combined data and generate a heatmap
d3.csv("combined_real_estate_weather.csv").then(function(data) {
    var map = L.map('map').setView([37.8, -96], 4);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
    }).addTo(map);

    var heatArray = [];

    data.forEach(function(d) {
        if (d.latitude && d.longitude && d.temperature) {
            heatArray.push([+d.latitude, +d.longitude, +d.temperature]);
        }
    });

    var heat = L.heatLayer(heatArray, {
        radius: 20,
        blur: 35,
        maxZoom: 17,
    }).addTo(map);
});

function fetchWeatherData() {
    d3.csv("combined_real_estate_weather.csv").then(function(data) {
        var impactDiv = document.getElementById("weather-impact");
        impactDiv.innerHTML = "<h3>Weather Impact on Real Estate</h3>";

        data.forEach(function(d) {
            var info = `<p>Location: ${d.city}, ${d.state}<br>Temperature: ${d.temperature}°C<br>Humidity: ${d.humidity}%</p>`;
            impactDiv.innerHTML += info;
        });
    });
}
