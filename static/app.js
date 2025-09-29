// Configuration
const API_BASE_URL = 'http://127.0.0.1:5001/'; 


window.onload = function() {
    populateDropdown();
};


async function populateDropdown() {
    const select = document.getElementById('column-select');
    try {
        const response = await fetch(`${API_BASE_URL}/columns`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const columns = await response.json();

        select.innerHTML = ''; 

        
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Select an indicator';
        defaultOption.selected = true;
        defaultOption.disabled = true;
        select.appendChild(defaultOption);

        // Add all the column options
        columns.forEach(column => {
            const option = document.createElement('option');
            option.value = column;
            option.textContent = column;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching columns:', error);
        select.innerHTML = '<option value="">Error loading data</option>';
    }
}


async function generateGraph() {
    const select = document.getElementById('column-select');
    const selectedColumn = select.value;
    const graphContainer = document.getElementById('graph-container');

    if (!selectedColumn) {
        graphContainer.innerHTML = '<p>Please select a dataset first.</p>';
        return;
    }

    // Show a loading message
    graphContainer.innerHTML = '<p class="loader">Generating your graph...</p>';

    try {
        const response = await fetch(`${API_BASE_URL}/data?column=${encodeURIComponent(selectedColumn)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Create the chart using Chart.js
        const ctx = document.getElementById('chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.myChart instanceof Chart) {
            window.myChart.destroy();
        }

        window.myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.years,
                datasets: [{
                    label: data.column,
                    data: data.values,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1,
                    fill: false,
                    spanGaps: true  // This connects points across null values
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: `${data.column} Over Time`
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Year'
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: data.column
                        }
                    }
                }
            }
        });

    } catch (error) {
        graphContainer.innerHTML = '<p>An error occurred while generating the graph.</p>';
        console.error('Error fetching graph:', error);
    }
}