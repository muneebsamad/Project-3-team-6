// Script.js
document.addEventListener('DOMContentLoaded', function() {
    // Load data from CSV files
    Promise.all([
        d3.csv('cleaned_combined_real_estate_weather.csv'),
        d3.csv('combined_state_avg_data.csv')
    ]).then(function(data) {
        let realEstateData = data[0];
        let stateAvgData = data[1];

        // Convert temperature_range to numeric values if necessary
        realEstateData.forEach(function(d) {
            d.temperature_range = +d.temperature_range;
        });

        // Calculate average real estate price by state
        let avgPriceByState = d3.rollup(realEstateData, 
            v => d3.mean(v, d => d.price),
            d => d.state
        );

        // Merge with state average temperature data
        avgPriceByState.forEach(function(value, key) {
            let avgTemp = stateAvgData.find(d => d.state === key).avg_temperature;
            avgPriceByState.set(key, { state: key, avg_price: value, avg_temperature: avgTemp });
        });

        // Convert to array for Plotly
        let avgPriceData = Array.from(avgPriceByState, ([key, value]) => value);

        // Create choropleth map using Plotly
        let mapData = [{
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: avgPriceData.map(d => d.state),
            z: avgPriceData.map(d => d.avg_price),
            text: avgPriceData.map(d => `${d.state}<br>Avg Price: $${d.avg_price.toFixed(2)}<br>Avg Temp: ${d.avg_temperature}°F`),
            colorscale: 'Viridis',
            colorbar: {
                title: 'Average Price',
                tickprefix: '$',
                ticksuffix: ''
            }
        }];

        let mapLayout = {
            title: 'Average Real Estate Price by State',
            geo: {
                scope: 'usa',
                showlakes: true,
                lakecolor: 'rgb(255, 255, 255)'
            }
        };

        Plotly.newPlot('choropleth-map', mapData, mapLayout);

        // Create scatter plot using Plotly
        let scatterData = [{
            x: avgPriceData.map(d => d.avg_temperature),
            y: avgPriceData.map(d => d.avg_price),
            mode: 'markers',
            text: avgPriceData.map(d => d.state),
            marker: {
                size: 12,
                color: avgPriceData.map(d => d.avg_price),
                colorscale: 'Viridis',
                opacity: 0.8,
                colorbar: {
                    title: 'Average Price',
                    tickprefix: '$',
                    ticksuffix: ''
                }
            }
        }];

        let scatterLayout = {
            title: 'Average Real Estate Price vs. Average Temperature',
            xaxis: {
                title: 'Average Temperature (°F)'
            },
            yaxis: {
                title: 'Average Price ($)'
            }
        };

        Plotly.newPlot('scatter-plot', scatterData, scatterLayout);

        // Group real estate data by temperature range
        let tempRangeGroups = d3.groups(realEstateData, d => d.temperature_range);

        // Calculate average price for each temperature range
        let avgPriceByTempRange = tempRangeGroups.map(group => ({
            temperature_range: group[0],
            avg_price: d3.mean(group[1], d => d.price)
        }));

        // Sort by temperature range for clarity
        avgPriceByTempRange.sort((a, b) => a.temperature_range - b.temperature_range);

        // Create bar chart using Plotly
        let barData = [{
            x: avgPriceByTempRange.map(d => d.temperature_range),
            y: avgPriceByTempRange.map(d => d.avg_price),
            type: 'bar',
            text: avgPriceByTempRange.map(d => `$${d.avg_price.toFixed(2)}`),
            marker: {
                color: 'blue'
            }
        }];

        let barLayout = {
            title: 'Average Real Estate Price by Temperature Range',
            xaxis: {
                title: 'Temperature Range'
            },
            yaxis: {
                title: 'Average Price ($)'
            }
        };

        Plotly.newPlot('bar-chart', barData, barLayout);

    }).catch(function(error) {
        console.log('Error loading data:', error);
    });
});
