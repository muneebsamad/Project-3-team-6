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

        // Calculate average real estate price by state_code
        let avgPriceByState = d3.rollup(realEstateData, 
            v => d3.mean(v, d => d.price),
            d => d.state_code
        );

        // Merge with state average temperature data
        avgPriceByState.forEach(function(value, key) {
            let avgTemp = stateAvgData.find(d => d.state_code === key).avg_temperature;
            avgPriceByState.set(key, { state_code: key, avg_price: value, avg_temperature: avgTemp });
        });

        // Convert to array for Plotly
        let avgPriceData = Array.from(avgPriceByState, ([key, value]) => value);

        // Create choropleth map using Plotly
        let mapData = {
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: avgPriceData.map(d => d.state_code),
            z: avgPriceData.map(d => d.avg_price),
            text: avgPriceData.map(d => `${d.state_code}<br>Avg Price: $${d.avg_price.toFixed(2)}<br>Avg Temp: ${d.avg_temperature}°F`),
            autocolorscale: true
        };

        let mapLayout = {
            title: 'Average Real Estate Price by State',
            geo: {
                scope: 'usa',
                showlakes: true,
                lakecolor: 'rgb(255, 255, 255)'
            }
        };

        Plotly.newPlot('choropleth-map', [mapData], mapLayout, {showLink: false});
        console.log(mapData);

        // Prepare data for correlation matrix
        let correlationMatrix = [];
        avgPriceData.forEach(function(d1) {
            let row = {
                state_code: d1.state_code,
                avg_price: d1.avg_price,
                avg_temperature: d1.avg_temperature
            };
            avgPriceData.forEach(function(d2) {
                row[d2.state_code] = d3.mean(realEstateData.filter(e => e.state_code === d1.state_code), e => e.price * d2.avg_price);
            });
            correlationMatrix.push(row);
        });

        // Extract correlation values into matrix format
        let stateCodes = avgPriceData.map(d => d.state_code);
        let matrix = stateCodes.map(row => stateCodes.map(col => correlationMatrix.find(c => c.state_code === row)[col]));

        // Create correlation matrix heatmap using Plotly
        let correlationData = {
            type: 'heatmap',
            x: stateCodes,
            y: stateCodes,
            z: matrix,
            colorscale: 'Viridis',
            colorbar: {
                title: 'Correlation'
            }
        };

        let correlationLayout = {
            title: 'Correlation Matrix of Average Real Estate Price vs. Average Temperature',
            xaxis: {
                title: 'State'
            },
            yaxis: {
                title: 'State'
            }
        };

        Plotly.newPlot('correlation-matrix', [correlationData], correlationLayout);
        console.log(correlationMatrix);

        // Add event listeners for filters
        document.getElementById('property-type-select').addEventListener('change', updateFilters);
        document.getElementById('price-range-slider').addEventListener('input', updateFilters);
        document.getElementById('bedrooms-select').addEventListener('change', updateFilters);

        function updateFilters() {
            let propertyType = document.getElementById('property-type-select').value;
            let minPrice = +document.getElementById('price-range-slider').value;
            let minBedrooms = +document.getElementById('bedrooms-select').value;

            let filteredData = realEstateData.filter(function(d) {
                return (propertyType === 'all' || d.property_type === propertyType) &&
                       d.price >= minPrice &&
                       (minBedrooms === 'all' || d.bedroom_number >= minBedrooms);
            });

            // Update choropleth map data
            let avgPriceByStateFiltered = d3.rollup(filteredData, 
                v => d3.mean(v, d => d.price),
                d => d.state_code
            );

            avgPriceByStateFiltered.forEach(function(value, key) {
                let avgTemp = stateAvgData.find(d => d.state_code === key).avg_temperature;
                avgPriceByStateFiltered.set(key, { state_code: key, avg_price: value, avg_temperature: avgTemp });
            });

            let avgPriceDataFiltered = Array.from(avgPriceByStateFiltered, ([key, value]) => value);

            mapData.locations = avgPriceDataFiltered.map(d => d.state_code);
            mapData.z = avgPriceDataFiltered.map(d => d.avg_price);
            mapData.text = avgPriceDataFiltered.map(d => `${d.state_code}<br>Avg Price: $${d.avg_price.toFixed(2)}<br>Avg Temp: ${d.avg_temperature}°F`);

            Plotly.react('choropleth-map', [mapData], mapLayout);

            // Update correlation matrix data
            let correlationMatrixFiltered = [];
            avgPriceDataFiltered.forEach(function(d1) {
                let row = {
                    state_code: d1.state_code,
                    avg_price: d1.avg_price,
                    avg_temperature: d1.avg_temperature
                };
                avgPriceDataFiltered.forEach(function(d2) {
                    row[d2.state_code] = d3.mean(filteredData.filter(e => e.state_code === d1.state_code), e => e.price * d2.avg_price);
                });
                correlationMatrixFiltered.push(row);
            });

            matrix = avgPriceDataFiltered.map(row => avgPriceDataFiltered.map(col => correlationMatrixFiltered.find(c => c.state_code === row.state_code)[col.state_code]));

            correlationData.x = avgPriceDataFiltered.map(d => d.state_code);
            correlationData.y = avgPriceDataFiltered.map(d => d.state_code);
            correlationData.z = matrix;

            Plotly.react('correlation-matrix', [correlationData], correlationLayout);
        }
        
    }).catch(function(error) {
        console.log('Error loading data:', error);
    });
});
