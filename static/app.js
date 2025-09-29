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

    try {
        // Show a loading message without removing the canvas
        const canvas = document.getElementById('chart');
        if (!canvas) {
            graphContainer.innerHTML = '<canvas id="chart"></canvas>';
        }
        
        // Show loading message separately
        const loadingMsg = document.createElement('p');
        loadingMsg.className = 'loader';
        loadingMsg.textContent = 'Generating your graph...';
        loadingMsg.style.position = 'absolute';
        loadingMsg.style.top = '50%';
        loadingMsg.style.left = '50%';
        loadingMsg.style.transform = 'translate(-50%, -50%)';
        loadingMsg.style.zIndex = '1000';
        graphContainer.style.position = 'relative';
        graphContainer.appendChild(loadingMsg);

        const response = await fetch(`${API_BASE_URL}/data?column=${encodeURIComponent(selectedColumn)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Remove loading message
        if (loadingMsg.parentNode) {
            loadingMsg.parentNode.removeChild(loadingMsg);
        }

        
        const ctx = document.getElementById('chart').getContext('2d');
        
    
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
        // Remove loading message if it exists
        const loadingMsg = graphContainer.querySelector('.loader');
        if (loadingMsg) {
            loadingMsg.remove();
        }
        
        // Show error without removing canvas
        const errorMsg = document.createElement('p');
        errorMsg.textContent = 'An error occurred while generating the graph.';
        errorMsg.style.color = 'red';
        errorMsg.style.textAlign = 'center';
        errorMsg.style.marginTop = '20px';
        graphContainer.appendChild(errorMsg);
        
        console.error('Error fetching graph:', error);
    }
}