// script.js

// Animation variables
let animationFrameId = null;
let isPlaying = false;
let currentTimePosition = 0;
let animationSpeed = 1.0;
let maxTime = 0;
let allWaveformData = {};
let compareChart1Instance = null;
let compareChart2Instance = null;
let currentView = 'waveform'; // Track which view is currently active: 'waveform' or 'comparison'

// Initialize playback controls
document.addEventListener('DOMContentLoaded', () => {
    // Get playback control elements
    const playBtn = document.getElementById('playBtn');
    const backwardBtn = document.getElementById('backwardBtn');
    const forwardBtn = document.getElementById('forwardBtn');
    const timeSlider = document.getElementById('timeSlider');
    const speedSlider = document.getElementById('animationSpeed');
    const speedValue = document.getElementById('speedValue');
    const currentTimeElement = document.getElementById('currentTime');
    const totalTimeElement = document.getElementById('totalTime');

    // Event listeners for playback control buttons
    playBtn.addEventListener('click', togglePlayback);
    backwardBtn.addEventListener('click', stepBackward);
    forwardBtn.addEventListener('click', stepForward);
    timeSlider.addEventListener('input', updateTimePosition);
    speedSlider.addEventListener('input', updateSpeed);

    // Initial disable of controls until waveform is generated
    disablePlaybackControls(true);
    
    // Initialize comparison toggle button
    const toggleComparisonBtn = document.getElementById('toggleComparisonBtn');
    if (toggleComparisonBtn) {
        toggleComparisonBtn.addEventListener('click', toggleComparisonSection);
    }
    
    // Initialize back button in comparison view
    const backToWaveformsBtn = document.getElementById('backToWaveformsBtn');
    if (backToWaveformsBtn) {
        backToWaveformsBtn.addEventListener('click', () => {
            // Hide comparison and show waveform when back button is clicked
            document.getElementById('comparisonSection').style.display = 'none';
            document.getElementById('waveform').style.display = 'block';
            document.getElementById('toggleComparisonBtn').textContent = 'Show Comparison View';
            currentView = 'waveform';
            
            // If animation is playing, update the main charts
            if (isPlaying) {
                renderAnimatedWaveforms(currentTimePosition);
            }
        });
    }
});

// Function to toggle the comparison section visibility
function toggleComparisonSection() {
    const comparisonSection = document.getElementById('comparisonSection');
    const waveformSection = document.getElementById('waveform');
    const toggleBtn = document.getElementById('toggleComparisonBtn');
    
    if (comparisonSection.style.display === 'none' || !comparisonSection.style.display) {
        // Show comparison view and hide waveform
        comparisonSection.style.display = 'block';
        waveformSection.style.display = 'none';
        toggleBtn.textContent = 'Hide Comparison View';
        currentView = 'comparison';
        
        // Auto-generate comparison if binary input exists
        const binaryInput = document.getElementById('binaryInput').value;
        if (binaryInput && binaryInput.match(/^[01]+$/)) {
            compareCharts(); // Auto-run comparison with current selections
            
            // If animation is playing, continue it on the comparison charts
            if (isPlaying) {
                updateComparisonChartsToCurrentTime();
            }
        }
    } else {
        // Hide comparison view and show waveform
        comparisonSection.style.display = 'none';
        waveformSection.style.display = 'block';
        toggleBtn.textContent = 'Show Comparison View';
        currentView = 'waveform';
        
        // If animation is playing, continue it on the main waveform charts
        if (isPlaying) {
            renderAnimatedWaveforms(currentTimePosition);
        }
    }
}

function togglePlayback() {
    const playBtn = document.getElementById('playBtn');
    
    if (isPlaying) {
        pauseAnimation();
        playBtn.textContent = 'Play';
    } else {
        startAnimation();
        playBtn.textContent = 'Pause';
    }
    
    isPlaying = !isPlaying;
}

function startAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    const startTime = performance.now();
    const initialPosition = currentTimePosition;
    
    function animate(timestamp) {
        const elapsed = (timestamp - startTime) * animationSpeed / 1000;
        currentTimePosition = Math.min(initialPosition + elapsed, maxTime);
        
        updateTimeDisplay();
        
        if (currentTimePosition >= maxTime) {
            pauseAnimation();
            document.getElementById('playBtn').textContent = 'Play';
            isPlaying = false;
            return;
        }
        
        // Render animations based on current view
        if (currentView === 'waveform') {
            renderAnimatedWaveforms(currentTimePosition);
        } else {
            updateComparisonChartsToCurrentTime();
        }
        
        animationFrameId = requestAnimationFrame(animate);
    }
    
    animationFrameId = requestAnimationFrame(animate);
}

function pauseAnimation() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function stepForward() {
    const stepSize = 1.0; // 1 second step
    currentTimePosition = Math.min(currentTimePosition + stepSize, maxTime);
    updateTimeDisplay();
    
    // Update charts based on current view
    if (currentView === 'waveform') {
        renderAnimatedWaveforms(currentTimePosition);
    } else {
        updateComparisonChartsToCurrentTime();
    }
}

function stepBackward() {
    const stepSize = 1.0; // 1 second step
    currentTimePosition = Math.max(currentTimePosition - stepSize, 0);
    updateTimeDisplay();
    
    // Update charts based on current view
    if (currentView === 'waveform') {
        renderAnimatedWaveforms(currentTimePosition);
    } else {
        updateComparisonChartsToCurrentTime();
    }
}

function updateTimePosition() {
    const timeSlider = document.getElementById('timeSlider');
    // Convert slider percentage to time
    currentTimePosition = (timeSlider.value / 100) * maxTime;
    updateTimeDisplay();
    
    // Update charts based on current view
    if (currentView === 'waveform') {
        renderAnimatedWaveforms(currentTimePosition);
    } else {
        updateComparisonChartsToCurrentTime();
    }
}

function updateSpeed() {
    const speedSlider = document.getElementById('animationSpeed');
    const speedValue = document.getElementById('speedValue');
    
    animationSpeed = parseFloat(speedSlider.value);
    speedValue.textContent = animationSpeed.toFixed(1) + 'x';
    
    // Restart animation if it's currently playing to apply new speed
    if (isPlaying) {
        pauseAnimation();
        startAnimation();
    }
}

function updateTimeDisplay() {
    const timeSlider = document.getElementById('timeSlider');
    const currentTimeElement = document.getElementById('currentTime');
    const totalTimeElement = document.getElementById('totalTime');
    
    // Update time display
    currentTimeElement.textContent = currentTimePosition.toFixed(1) + 's';
    totalTimeElement.textContent = maxTime.toFixed(1) + 's';
    
    // Update slider position
    timeSlider.value = (currentTimePosition / maxTime) * 100;
}

function disablePlaybackControls(disabled) {
    document.getElementById('playBtn').disabled = disabled;
    document.getElementById('backwardBtn').disabled = disabled;
    document.getElementById('forwardBtn').disabled = disabled;
    document.getElementById('timeSlider').disabled = disabled;
    document.getElementById('animationSpeed').disabled = disabled;
}

function renderAnimatedWaveforms(upToTime) {
    if (!allWaveformData.nrzL) return;
    
    // Render each waveform up to the current time
    renderAnimatedWaveform('nrzLChart', 'NRZ-L', allWaveformData.nrzL, upToTime);
    renderAnimatedWaveform('nrzIChart', 'NRZ-I', allWaveformData.nrzI, upToTime);
    renderAnimatedWaveform('rzChart', 'RZ', allWaveformData.rz, upToTime);
    renderAnimatedWaveform('amiChart', 'AMI', allWaveformData.ami, upToTime);
    renderAnimatedWaveform('pseudoternaryChart', 'Pseudoternary', allWaveformData.pseudoternary, upToTime);
    renderAnimatedWaveform('manchesterChart', 'Manchester', allWaveformData.manchester, upToTime);
}

function changeViewMode() {
    const viewMode = document.getElementById('viewMode').value;
    const waveformContainer = document.getElementById('waveform');
    
    // Remove existing layout classes
    waveformContainer.classList.remove('one-column');
    
    // Add the appropriate class based on view mode
    if (viewMode === 'one-column') {
        waveformContainer.classList.add('one-column');
        // Show all charts
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            container.style.display = 'flex';
        });
    } else {
        // Show only the selected chart
        const chartContainers = document.querySelectorAll('.chart-container');
        chartContainers.forEach(container => {
            container.style.display = 'none';
        });
        const selectedContainer = document.getElementById(`${viewMode}Container`);
        if (selectedContainer) {
            selectedContainer.style.display = 'flex';
        }
    }
}

function compareCharts() {
    const chart1 = document.getElementById('compareChart1').value;
    const chart2 = document.getElementById('compareChart2').value;

    // Get the binary input
    const binaryInput = document.getElementById('binaryInput').value;
    if (!binaryInput.match(/^[01]+$/)) {
        alert("Please enter a valid binary sequence (0s and 1s only).");
        return;
    }

    const binaryArray = binaryInput.split('').map(bit => parseInt(bit));

    // Generate data for the selected charts
    let chart1Data, chart2Data;
    switch (chart1) {
        case 'nrzL':
            chart1Data = generateNRZL(binaryArray);
            break;
        case 'nrzI':
            chart1Data = generateNRZI(binaryArray);
            break;
        case 'rz':
            chart1Data = generateRZ(binaryArray);
            break;
        case 'ami':
            chart1Data = generateAMI(binaryArray);
            break;
        case 'pseudoternary':
            chart1Data = generatePseudoternary(binaryArray);
            break;
        case 'manchester':
            chart1Data = generateManchester(binaryArray);
            break;
    }

    switch (chart2) {
        case 'nrzL':
            chart2Data = generateNRZL(binaryArray);
            break;
        case 'nrzI':
            chart2Data = generateNRZI(binaryArray);
            break;
        case 'rz':
            chart2Data = generateRZ(binaryArray);
            break;
        case 'ami':
            chart2Data = generateAMI(binaryArray);
            break;
        case 'pseudoternary':
            chart2Data = generatePseudoternary(binaryArray);
            break;
        case 'manchester':
            chart2Data = generateManchester(binaryArray);
            break;
    }

    // Store data for animation
    allWaveformData.compareChart1 = chart1Data;
    allWaveformData.compareChart2 = chart2Data;

    // Destroy previous chart instances if they exist
    if (compareChart1Instance) compareChart1Instance.destroy();
    if (compareChart2Instance) compareChart2Instance.destroy();

    // Render the selected charts in the comparison containers
    const compareChart1Container = document.getElementById('compareChart1Container');
    const compareChart2Container = document.getElementById('compareChart2Container');

    compareChart1Container.innerHTML = '<canvas id="compareChart1Canvas"></canvas>';
    compareChart2Container.innerHTML = '<canvas id="compareChart2Canvas"></canvas>';

    compareChart1Instance = renderWaveform('compareChart1Canvas', chart1, chart1Data);
    compareChart2Instance = renderWaveform('compareChart2Canvas', chart2, chart2Data);

    // Display the comparison row
    document.querySelector('.comparison-row').style.display = 'flex';
    
    // If currently animating, update comparison charts to current time
    if (isPlaying || currentTimePosition > 0) {
        updateComparisonChartsToCurrentTime();
    }
}

// Function to update comparison charts based on current time
function updateComparisonChartsToCurrentTime() {
    if (!allWaveformData.compareChart1 || !allWaveformData.compareChart2) return;
    
    renderAnimatedWaveform('compareChart1Canvas', '', allWaveformData.compareChart1, currentTimePosition);
    renderAnimatedWaveform('compareChart2Canvas', '', allWaveformData.compareChart2, currentTimePosition);
}

function generateWaveforms() {
    const binaryInput = document.getElementById('binaryInput').value;
    if (!binaryInput.match(/^[01]+$/)) {
        alert("Please enter a valid binary sequence (0s and 1s only).");
        return;
    }

    // Destroy old charts if they exist
    if (nrzLChartInstance) nrzLChartInstance.destroy();
    if (nrzIChartInstance) nrzIChartInstance.destroy();
    if (rzChartInstance) rzChartInstance.destroy();
    if (amiChartInstance) amiChartInstance.destroy();
    if (pseudoternaryChartInstance) pseudoternaryChartInstance.destroy();
    if (manchesterChartInstance) manchesterChartInstance.destroy();

    const binaryArray = binaryInput.split('').map(bit => parseInt(bit));

    // Reset animation state
    pauseAnimation();
    currentTimePosition = 0;
    isPlaying = false;
    document.getElementById('playBtn').textContent = 'Play';

    // Generate waveforms
    const nrzLData = generateNRZL(binaryArray);
    const nrzIData = generateNRZI(binaryArray);
    const rzData = generateRZ(binaryArray);
    const amiData = generateAMI(binaryArray);
    const pseudoternaryData = generatePseudoternary(binaryArray);
    const manchesterData = generateManchester(binaryArray);

    // Store all data for animation
    allWaveformData = {
        nrzL: nrzLData,
        nrzI: nrzIData,
        rz: rzData,
        ami: amiData,
        pseudoternary: pseudoternaryData,
        manchester: manchesterData
    };

    // Update max time based on binary sequence length
    maxTime = binaryArray.length;
    updateTimeDisplay();
    
    // Enable playback controls
    disablePlaybackControls(false);

    // Render waveforms
    nrzLChartInstance = renderWaveform('nrzLChart', 'NRZ-L', nrzLData);
    nrzIChartInstance = renderWaveform('nrzIChart', 'NRZ-I', nrzIData);
    rzChartInstance = renderWaveform('rzChart', 'RZ', rzData);
    amiChartInstance = renderWaveform('amiChart', 'AMI', amiData);
    pseudoternaryChartInstance = renderWaveform('pseudoternaryChart', 'Pseudoternary', pseudoternaryData);
    manchesterChartInstance = renderWaveform('manchesterChart', 'Manchester', manchesterData);
}

function generateNRZL(binaryArray) {
    const data = [];
    binaryArray.forEach((bit, index) => {
        const startTime = index; // Each bit occupies 1 second
        data.push({ x: startTime, y: bit === 1 ? 1 : -1 }); // Start of the bit
        data.push({ x: startTime + 1, y: bit === 1 ? 1 : -1 }); // End of the bit
    });
    return data;
}

function generateNRZI(binaryArray) {
    const data = [];
    let lastLevel = -1; // Start with low voltage
    binaryArray.forEach((bit, index) => {
        const startTime = index; // Each bit occupies 1 second
        if (bit === 1) {
            lastLevel = -lastLevel; // Invert the voltage for '1'
        }
        data.push({ x: startTime, y: lastLevel }); // Start of the bit
        data.push({ x: startTime + 1, y: lastLevel }); // End of the bit
    });
    return data;
}

function generateRZ(binaryArray) {
    const data = [];
    binaryArray.forEach((bit, index) => {
        const startTime = index; // Each bit occupies 1 second
        if (bit === 1) {
            data.push({ x: startTime, y: 1 }); // Start high
            data.push({ x: startTime + 0.5, y: 1 }); // Mid high
            data.push({ x: startTime + 0.5, y: 0 }); // Return to zero
            data.push({ x: startTime + 1, y: 0 }); // End of the bit
        } else {
            data.push({ x: startTime, y: 0 }); // Start low
            data.push({ x: startTime + 1, y: 0 }); // End of the bit
        }
    });
    return data;
}

function generateAMI(binaryArray) {
    const data = [];
    let lastPolarity = 1; // Start with positive polarity
    binaryArray.forEach((bit, index) => {
        const startTime = index; // Each bit occupies 1 second
        if (bit === 1) {
            data.push({ x: startTime, y: lastPolarity }); // Start of the bit
            data.push({ x: startTime + 1, y: lastPolarity }); // End of the bit
            lastPolarity = -lastPolarity; // Alternate polarity for the next '1'
        } else {
            data.push({ x: startTime, y: 0 }); // Start of the bit
            data.push({ x: startTime + 1, y: 0 }); // End of the bit
        }
    });
    return data;
}

function generatePseudoternary(binaryArray) {
    const data = [];
    let lastPolarity = 1; // Start with positive polarity
    binaryArray.forEach((bit, index) => {
        const startTime = index; // Each bit occupies 1 second
        if (bit === 0) {
            data.push({ x: startTime, y: lastPolarity }); // Start of the bit
            data.push({ x: startTime + 1, y: lastPolarity }); // End of the bit
            lastPolarity = -lastPolarity; // Alternate polarity for the next '0'
        } else {
            data.push({ x: startTime, y: 0 }); // Start of the bit
            data.push({ x: startTime + 1, y: 0 }); // End of the bit
        }
    });
    return data;
}

function generateManchester(binaryArray) {
    const data = [];
    binaryArray.forEach((bit, index) => {
        const startTime = index; // Each bit occupies 1 second
        if (bit === 1) {
            data.push({ x: startTime, y: 1 }); // Start high
            data.push({ x: startTime + 0.5, y: 1 }); // Mid high
            data.push({ x: startTime + 0.5, y: -1 }); // Transition to low
            data.push({ x: startTime + 1, y: -1 }); // End of the bit
        } else {
            data.push({ x: startTime, y: -1 }); // Start low
            data.push({ x: startTime + 0.5, y: -1 }); // Mid low
            data.push({ x: startTime + 0.5, y: 1 }); // Transition to high
            data.push({ x: startTime + 1, y: 1 }); // End of the bit
        }
    });
    return data;
}

function calculateBaselineWandering(data) {
    if (!data || data.length === 0) return 0;
    
    // Calculate average voltage level
    const sum = data.reduce((acc, point) => acc + point.y, 0);
    const average = sum / data.length;
    
    // Calculate percentage of baseline wandering
    // Assuming the signal should be centered around 0
    const maxAmplitude = Math.max(...data.map(point => Math.abs(point.y)));
    const wanderingPercentage = (Math.abs(average) / maxAmplitude) * 100;
    
    return wanderingPercentage;
}

function renderWaveform(canvasId, label, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    const wanderingPercentage = calculateBaselineWandering(data);
    
    // Calculate average voltage level for baseline
    const sum = data.reduce((acc, point) => acc + point.y, 0);
    const average = sum / data.length;
    
    // Create a container for the chart and wandering info
    const container = document.getElementById(`${canvasId}Container`);
    if (container) {
        // Add or update wandering info element
        let wanderingInfo = container.querySelector('.wandering-info');
        if (!wanderingInfo) {
            wanderingInfo = document.createElement('div');
            wanderingInfo.className = 'wandering-info';
            container.appendChild(wanderingInfo);
        }
        
        // Update wandering info text with detailed information
        if (wanderingPercentage > 0.1) {
            const impact = wanderingPercentage > 5 ? 'High' : 
                          wanderingPercentage > 2 ? 'Moderate' : 'Low';
            
            wanderingInfo.innerHTML = `
                <div class="wandering-details">
                    <div class="wandering-title">Baseline Wandering Analysis</div>
                    <div class="wandering-metric">Wandering Percentage: ${wanderingPercentage.toFixed(2)}%</div>
                    <div class="wandering-metric">Average Voltage: ${average.toFixed(3)}V</div>
                    <div class="wandering-metric">Impact Level: ${impact}</div>
                    <div class="wandering-note">${getWanderingNote(label, wanderingPercentage)}</div>
                </div>
            `;
            wanderingInfo.style.display = 'block';
        } else {
            wanderingInfo.style.display = 'none';
        }
    }
    
    return new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [
                {
                    label: label,
                    data: data,
                    steppedLine: 'before',
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 0
                },
                {
                    label: 'Baseline',
                    data: data.map(point => ({ x: point.x, y: average })),
                    borderColor: 'rgba(255, 0, 0, 0.5)',
                    borderWidth: 1,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0,
                    hidden: wanderingPercentage <= 0.1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            aspectRatio: 2,
            layout: {
                padding: {
                    top: 10,
                    right: 10,
                    bottom: 10,
                    left: 10
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    title: {
                        display: true,
                        text: 'Time (seconds)'
                    },
                    min: 0,
                    max: data.length > 0 ? Math.ceil(data[data.length - 1].x) : 10
                },
                y: {
                    min: -1.5,
                    max: 1.5,
                    title: {
                        display: true,
                        text: 'Voltage Level'
                    }
                }
            },
            animation: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'line'
                    }
                }
            }
        }
    });
}

function getWanderingNote(label, percentage) {
    if (percentage <= 0.1) return "No significant baseline wandering detected.";
    
    switch(label) {
        case 'NRZ-L':
            return "Long sequences of 1s or 0s can cause baseline wandering. Consider using AMI or Manchester encoding for better baseline stability.";
        case 'NRZ-I':
            return "Baseline wandering may occur with certain bit patterns. Consider using AMI or Manchester encoding for better baseline stability.";
        case 'RZ':
            return "Return-to-zero feature helps reduce baseline wandering, but it may still occur with imbalanced data.";
        case 'AMI':
            return "Alternate Mark Inversion helps maintain baseline stability by alternating pulse polarities.";
        case 'Pseudoternary':
            return "Similar to AMI, pseudoternary encoding helps maintain baseline stability through alternating pulses.";
        case 'Manchester':
            return "Manchester encoding inherently maintains baseline stability due to its transition-based encoding.";
        default:
            return "Baseline wandering may affect signal integrity and clock recovery.";
    }
}

// Function to render animated waveforms
function renderAnimatedWaveform(canvasId, label, data, upToTime) {
    const chart = getChartInstance(canvasId);
    if (!chart) return;
    
    // Filter data up to current time for animation
    const visibleData = data.filter(point => point.x <= upToTime);
    
    // Update chart data
    chart.data.datasets[0].data = visibleData;
    chart.update('none'); // Update without animation
}

// Helper function to get chart instance from canvas ID
function getChartInstance(canvasId) {
    switch(canvasId) {
        case 'nrzLChart': return nrzLChartInstance;
        case 'nrzIChart': return nrzIChartInstance;
        case 'rzChart': return rzChartInstance;
        case 'amiChart': return amiChartInstance;
        case 'pseudoternaryChart': return pseudoternaryChartInstance;
        case 'manchesterChart': return manchesterChartInstance;
        case 'compareChart1Canvas': 
        case 'compareChart2Canvas':
            // Find the chart instance for comparison charts
            return Chart.getChart(canvasId);
        default: return null;
    }
}

// Store chart instances
let nrzLChartInstance = null;
let nrzIChartInstance = null;
let rzChartInstance = null;
let amiChartInstance = null;
let pseudoternaryChartInstance = null;
let manchesterChartInstance = null;

// Function to toggle description visibility
function toggleDescription(descId) {
    const description = document.getElementById(descId);
    description.classList.toggle('active');
    
    // Update button icon
    const button = description.previousElementSibling;
    const icon = button.querySelector('i');
    if (description.classList.contains('active')) {
        icon.classList.remove('fa-info-circle');
        icon.classList.add('fa-times-circle');
    } else {
        icon.classList.remove('fa-times-circle');
        icon.classList.add('fa-info-circle');
    }
}