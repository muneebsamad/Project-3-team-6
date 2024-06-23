// Function to fetch data from realestate_data.json file
async function fetchData() {
    try {
        const data = await d3.json('sch.json');
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

// Function to analyze and visualize data
async function analyzeData() {
    try {
        const data = await fetchData();
        console.log(data);

        // Now `data` is an array of objects, each representing a row from the JSON

        // Render all visualizations
        renderPriceDistribution(data);
        renderAgencyPerformance(data);
    } catch (error) {
        // Handle errors gracefully, e.g., show an error message to the user
        console.error('Error analyzing data:', error);
    }
}

// Helper function to render Price Distribution (Histogram) using D3.js
function renderPriceDistribution(data) {
    const prices = data.map(entry => entry['TransactionPrice']);
    const histogram = d3.histogram()
        .value(d => d)
        .domain(d3.extent(prices))
        .thresholds(20);

    const bins = histogram(prices);

    const x = d3.scaleLinear()
        .domain([bins[0].x0, bins[bins.length - 1].x1])
        .range([0, 500]);

    const y = d3.scaleLinear()
        .domain([0, d3.max(bins, d => d.length)])
        .nice()
        .range([200, 0]);

    const svg = d3.select('#priceDistributionChart')
        .append('svg')
        .attr('width', 600)
        .attr('height', 250)
        .append('g')
        .attr('transform', 'translate(50,20)');

    svg.append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,200)')
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y));

    svg.selectAll('.bar')
        .data(bins)
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.x0) + 1)
        .attr('y', d => y(d.length))
        .attr('width', d => x(d.x1) - x(d.x0) - 1)
        .attr('height', d => 200 - y(d.length));

    svg.append('text')
        .attr('x', 250)
        .attr('y', 240)
        .style('text-anchor', 'middle')
        .text('Transaction Price');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -100)
        .attr('y', -30)
        .style('text-anchor', 'middle')
        .text('Frequency');
}

// Helper function to render Agency Performance (Box Plot) using D3.js
function renderAgencyPerformance(data) {
    const agencies = [...new Set(data.map(entry => entry['AgencyName']))];
    const topAgencies = agencies.slice(0, 3); // Top 3 agencies by transaction volume
    const agencyData = topAgencies.map(agency => {
        const agencyTransactions = data.filter(entry => entry['AgencyName'] === agency);
        const prices = agencyTransactions.map(entry => entry['TransactionPrice']);
        return prices;
    });

    const svg = d3.select('#agencyPerformanceChart')
        .append('svg')
        .attr('width', 600)
        .attr('height', 300);

    const margin = {top: 10, right: 30, bottom: 30, left: 40};
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const x = d3.scaleBand()
        .domain(topAgencies)
        .rangeRound([margin.left, width - margin.right])
        .paddingInner(0.1);

    const y = d3.scaleLinear()
        .domain([d3.min(agencyData.flat()), d3.max(agencyData.flat())])
        .rangeRound([height - margin.bottom, margin.top]);

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.selectAll('.box')
        .data(agencyData)
        .enter().append('rect')
        .attr('class', 'box')
        .attr('x', (d, i) => x(topAgencies[i]))
        .attr('y', d => y(d3.max(d)))
        .attr('width', x.bandwidth())
        .attr('height', d => y(d3.min(d)) - y(d3.max(d)));

    svg.append('text')
        .attr('x', width / 2)
        .attr('y', height + 30)
        .style('text-anchor', 'middle')
        .text('Agency Name');

    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -30)
        .style('text-anchor', 'middle')
        .text('Transaction Price');
}

// Call analyzeData() to start data analysis and visualization
analyzeData();
