// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Global variables
let geoJsonLayer;
let countriesData = [];

// Simplified GeoJSON for countries - we'll fetch this separately
const geoJsonUrl = 'https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson';

// Load country GeoJSON data
fetch(geoJsonUrl)
    .then(response => response.json())
    .then(geojson => {
        console.log("GeoJSON loaded successfully");
        // Store the GeoJSON data
        window.countryGeoJson = geojson;
        // Load the Big Mac data
        loadDatesList();
    })
    .catch(error => {
        console.error("Error loading GeoJSON:", error);
        showError("Failed to load map data. Please refresh the page.");
    });

// Load dates list first
function loadDatesList() {
    fetch('/data')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.dates && data.dates.length > 0) {
                // Populate date dropdown
                const dateSelect = document.getElementById('date-select');
                dateSelect.innerHTML = '';
                
                data.dates.forEach(date => {
                    const option = document.createElement('option');
                    option.value = date;
                    option.textContent = formatDate(date);
                    dateSelect.appendChild(option);
                });
                
                // Select the latest date
                dateSelect.value = data.dates[data.dates.length - 1];
                
                // Load data for this date
                loadBigMacData(dateSelect.value);
            }
        })
        .catch(error => {
            console.error("Error loading dates:", error);
            showError("Failed to load date information. Please refresh the page.");
        });
}

// Load Big Mac data for a specific date
function loadBigMacData(date) {
    fetch(`/data?date=${date}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Store the data
            countriesData = data.map_data;
            console.log(`Loaded ${countriesData.length} countries for date ${date}`);
            
            // Update country dropdown
            updateCountryDropdown();
            
            // Draw the map
            drawMap();
        })
        .catch(error => {
            console.error("Error loading Big Mac data:", error);
            showError("Failed to load Big Mac data. Please try again.");
        });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Update country dropdown
function updateCountryDropdown() {
    const countrySelect = document.getElementById('country-select');
    
    // Clear previous options
    countrySelect.innerHTML = '<option value="">-- Select a country --</option>';
    
    // Sort countries by name
    const sortedCountries = [...countriesData].sort((a, b) => a.name.localeCompare(b.name));
    
    // Add countries to dropdown
    sortedCountries.forEach(country => {
        const option = document.createElement('option');
        option.value = country.id;
        option.textContent = country.name;
        countrySelect.appendChild(option);
    });
}

// Draw the map with Big Mac data
function drawMap() {
    // Clear previous layer
    if (geoJsonLayer) {
        map.removeLayer(geoJsonLayer);
    }
    
    if (!window.countryGeoJson) {
        console.error("GeoJSON data not loaded yet");
        return;
    }
    
    // Create new layer
    geoJsonLayer = L.geoJSON(window.countryGeoJson, {
        style: function(feature) {
            // Find country data
            const countryData = countriesData.find(c => c.id === feature.properties['ISO3166-1-Alpha-3']);
            
            return {
                fillColor: countryData ? getColor(countryData.value) : '#F5F5F5',
                weight: 1,
                opacity: 1,
                color: 'white',
                fillOpacity: countryData ? 0.75 : 0.3
            };
        },
        onEachFeature: function(feature, layer) {
            // Find country data
            const countryData = countriesData.find(c => c.id === feature.properties['ISO3166-1-Alpha-3']);
            
            // Add popup
            if (countryData) {
                layer.bindPopup(`
                    <strong>${countryData.name}</strong><br>
                    Big Mac Price (USD): $${countryData.value.toFixed(2)}<br>
                    Local Price: ${countryData.currency} ${countryData.local_price.toFixed(2)}
                `);
                
                // Add click event
                layer.on('click', function() {
                    document.getElementById('country-select').value = countryData.id;
                    showCountryDetail(countryData.id);
                });
            }
        }
    }).addTo(map);
    
    // Add legend
    addLegend();
}

// Get color based on price value - A more nuanced Diverging Scale
function getColor(price) {
    const p = parseFloat(price);
    if (isNaN(p)) return '#2C3E50'; // Neutral navy for missing data
    
    // Scale from low (greenish) to high (reddish) or deep blue as current
    // Let's use a nice YlOrRd or Viridis-like scale
    return p > 7 ? '#800026' :
           p > 6 ? '#BD0026' :
           p > 5 ? '#E31A1C' :
           p > 4 ? '#FC4E2A' :
           p > 3 ? '#FD8D3C' :
           p > 2 ? '#FEB24C' :
           p > 1 ? '#FED976' :
                   '#FFEDA0';
}

// Add legend to map
function addLegend() {
    // Remove existing legend if present
    document.querySelectorAll('.legend').forEach(el => el.remove());
    
    const legend = L.control({position: 'bottomright'});
    
    legend.onAdd = function() {
        const div = L.DomUtil.create('div', 'legend');
        const grades = [0, 1, 2, 3, 4, 5, 6];
        
        div.innerHTML = '<h6>Big Mac Price (USD)</h6>';
        
        for (let i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 0.1) + '"></i> ' +
                '$' + grades[i] + (grades[i + 1] ? '&ndash;$' + grades[i + 1] + '<br>' : '+');
        }
        
        return div;
    };
    
    legend.addTo(map);
}

// Show error message
function showError(message) {
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    
    // Hide after 5 seconds
    setTimeout(() => {
        errorElement.style.display = 'none';
    }, 5000);
}

// Show country detail
function showCountryDetail(countryCode) {
    if (!countryCode) {
        document.getElementById('country-detail').style.display = 'none';
        return;
    }
    
    console.log(`Fetching details for country: ${countryCode}`);
    
    fetch(`/country/${countryCode}`)
        .then(response => {
            console.log("Response status:", response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Received data:", data);
            
            if (!data || data.length === 0) {
                console.log("No data received for country");
                document.getElementById('country-detail').style.display = 'none';
                showError(`No historical data available for this country.`);
                return;
            }
            
            const latestData = data[data.length - 1];
            document.getElementById('country-name').textContent = latestData.name;
            document.getElementById('country-code-badge').textContent = latestData.iso_a3;
            
            let infoHtml = `
                <div class="row g-4 mb-5">
                    <div class="col-md-4">
                        <div class="p-4 rounded-4 bg-white bg-opacity-5 border border-light border-opacity-10 text-center shadow-sm h-100">
                            <p class="text-muted small fw-bold mb-2">BIG MAC PRICE (USD)</p>
                            <h3 class="text-accent fw-bold mb-0">$${parseFloat(latestData.dollar_price).toFixed(2)}</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-4 rounded-4 bg-white bg-opacity-5 border border-light border-opacity-10 text-center shadow-sm h-100">
                            <p class="text-muted small fw-bold mb-2">LOCAL PRICE</p>
                            <h3 class="text-accent fw-bold mb-0">${latestData.currency_code} ${parseFloat(latestData.local_price).toFixed(2)}</h3>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="p-4 rounded-4 bg-white bg-opacity-5 border border-light border-opacity-10 text-center shadow-sm h-100">
                            <p class="text-muted small fw-bold mb-2">EXCHANGE RATE</p>
                            <h3 class="text-accent fw-bold mb-0">${latestData.dollar_ex ? parseFloat(latestData.dollar_ex).toFixed(2) : 'N/A'}</h3>
                        </div>
                    </div>
                </div>
            `;
            
            if (data.length > 1) {
                infoHtml += `
                    <div class="mt-5 pt-3">
                        <h4 class="text-white fw-bold mb-4">Historical Pricing Data</h4>
                        <div class="table-responsive rounded-4 border border-light border-opacity-10 overflow-hidden shadow-sm">
                            <table class="table table-hover table-dark mb-0 align-middle">
                                <thead class="glass-header">
                                    <tr class="text-accent small fw-bold">
                                        <th class="py-3 px-4 border-0">DATE</th>
                                        <th class="py-3 px-4 border-0">USD PRICE</th>
                                        <th class="py-3 px-4 border-0">LOCAL PRICE</th>
                                        <th class="py-3 px-4 border-0">EXCHANGE RATE</th>
                                    </tr>
                                </thead>
                                <tbody>
                `;
                
                data.forEach(item => {
                    infoHtml += `
                        <tr class="border-light border-opacity-10">
                            <td class="py-3 px-4 text-white">${formatDate(item.date)}</td>
                            <td class="py-3 px-4 text-accent fw-bold">$${parseFloat(item.dollar_price).toFixed(2)}</td>
                            <td class="py-3 px-4">${parseFloat(item.local_price).toFixed(2)}</td>
                            <td class="py-3 px-4 text-white">${item.dollar_ex ? parseFloat(item.dollar_ex).toFixed(2) : 'N/A'}</td>
                        </tr>
                    `;
                });
                
                infoHtml += `
                            </tbody>
                        </table>
                    </div>
                `;
            }
            
            document.getElementById('country-info').innerHTML = infoHtml;
            document.getElementById('country-detail').style.display = 'block';
        })
        .catch(error => {
            console.error("Error loading country details:", error);
            showError("Failed to load country details. Please try again.");
        });
}

// Event listeners
document.getElementById('reset-map').addEventListener('click', function() {
    map.setView([20, 0], 2);
    document.getElementById('country-select').value = '';
    document.getElementById('country-detail').style.display = 'none';
});

document.getElementById('date-select').addEventListener('change', function() {
    loadBigMacData(this.value);
});

document.getElementById('country-select').addEventListener('change', function() {
    const countryCode = this.value;
    showCountryDetail(countryCode);
    
    if (countryCode && geoJsonLayer) {
        // Find and focus on selected country
        geoJsonLayer.eachLayer(function(layer) {
            if (layer.feature && layer.feature.properties && 
                layer.feature.properties['ISO3166-1-Alpha-3'] === countryCode) {
                map.fitBounds(layer.getBounds());
                layer.openPopup();
            }
        });
    }
});