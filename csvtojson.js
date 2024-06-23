const fs = require('fs');
const { csvParse } = require('d3-dsv');

// Function to convert CSV to JSON
async function csvToJson(csvFilePath) {
    try {
        console.log('Reading CSV file...');
        const csvData = await fs.promises.readFile(csvFilePath, 'utf-8');
        console.log('CSV data:', csvData); // Log CSV data to check if it's read correctly

        console.log('Parsing CSV into JSON...');
        const jsonData = csvParse(csvData);
        console.log('JSON data:', jsonData); // Log JSON data to check if it's parsed correctly

        // Return JSON data
        return jsonData;
    } catch (error) {
        console.error('Error converting CSV to JSON:', error);
        return null;
    }
}

// Example usage:
const csvFilePath = 'refined_properties.csv'; // Replace with your CSV file path

// Dynamically import index.js (assuming it's an ESM module)
(async () => {
    try {
        const indexModule = await import('./index.js');
        console.log('Imported module:', indexModule);
        // Use imported module if needed
    } catch (error) {
        console.error('Error importing index.js:', error);
    }

    // Convert CSV to JSON
    csvToJson(csvFilePath)
        .then(jsonData => {
            if (jsonData) {
                // Optionally, use the jsonData for further processing
                // For example, save it to a JSON file
                fs.writeFileSync('output.json', JSON.stringify(jsonData, null, 2));
                console.log('Conversion complete. JSON file saved.');
            } else {
                console.log('Conversion failed. JSON data is null.');
            }
        })
        .catch(error => console.error('Error:', error));
})();
