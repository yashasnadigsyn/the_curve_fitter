document.addEventListener('DOMContentLoaded', function() {
  const knobs = document.querySelectorAll('.knob');
  const valueInputs = document.querySelectorAll('.value-input');
  const valuesContainer = document.getElementById('right-column-all-values'); // Get the container
let gradientDescentRun = false;


  // Predefined data points for the question
  function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const randomK0 = getRandomNumber(-100, 100);
  const randomK1 = getRandomNumber(-100, 100);
  const randomK2 = getRandomNumber(-100, 100);
  const randomK3 = getRandomNumber(-100, 100);
  const randomK4 = 0;
  const randomK5 = 0;
  console.log(randomK0, randomK1, randomK2, randomK3, randomK4, randomK5);

  const questionDataPoints = [];
  for (let x = -10; x <= 10; x += 0.5) {
    questionDataPoints.push({ x: x, y: calculateY(x, randomK0, randomK1, randomK2, randomK3, randomK4, randomK5) });
  }

  // Function to calculate y-values
  function calculateY(x, k0, k1, k2, k3, k4, k5) {
    return k0 + k1 * x + k2 * Math.pow(x, 2) + k3 * Math.pow(x, 3) + k4 * Math.pow(x, 4) + k5 * Math.pow(x, 5);
  }

  // Function to find the closest point on the curve for a given x-coordinate
  function findClosestPointOnCurve(xTarget, curveData) {
    let closestPoint = curveData[0];
    let minDistance = Math.abs(xTarget - closestPoint.x);

    for (let i = 1; i < curveData.length; i++) {
      const distance = Math.abs(xTarget - curveData[i].x);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = curveData[i];
      }
    }
    return closestPoint;
  }

  // Function to generate curve data based on knob values
  function generateCurveData() {
    const k0 = parseFloat(document.getElementById('k0').value);
    const k1 = parseFloat(document.getElementById('k1').value);
    const k2 = parseFloat(document.getElementById('k2').value);
    const k3 = parseFloat(document.getElementById('k3').value);
    const k4 = parseFloat(document.getElementById('k4').value);
    const k5 = parseFloat(document.getElementById('k5').value);

    const curveData = [];
    for (let x = -10; x <= 10; x += 0.5) {
      curveData.push({ x: x, y: calculateY(x, k0, k1, k2, k3, k4, k5) });
    }
    return curveData;
  }

  // Chart.js setup
  const ctx = document.getElementById('myChart').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'Question Data',
          data: questionDataPoints,
          backgroundColor: '#fffffb',
          borderWidth: 0,
          radius: 5,
          hoverRadius: 5
        },
        {
          label: 'User Curve',
          data: generateCurveData(),
          borderColor: '#fffffb',
          borderWidth: 2,
          fill: false,
          pointRadius: 0,
          showLine: true
        }
        // Don't add the vertical lines here
      ]
    },
    options: {
      scales: {
        x: {
          display: true,
          grid: {
            display: false
          }
        },
        y: {
          display: true,
          grid: {
            display: false
          }
        }
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          enabled: true,
          backgroundColor: 'black',
          callbacks: {
            label: function(context) {
              if (context.datasetIndex === 0) {
                return `(x: ${context.parsed.x.toFixed(2)}, y: ${context.parsed.y.toFixed(2)})`;
              } else {
                return '';
              }
            }
          }
        }
      },
      elements: {
        line: {
          tension: 0.3
        }
      },
      events: ['mousemove']
    }
  });

  // Update the chart when knob values change
  function updateChart() {
    const curveData = generateCurveData();
    chart.data.datasets[1].data = curveData;

    // Update vertical lines
    const verticalLinesData = questionDataPoints.map(dataPoint => {
      const closestCurvePoint = findClosestPointOnCurve(dataPoint.x, curveData);
      return [{ x: dataPoint.x, y: dataPoint.y }, { x: closestCurvePoint.x, y: closestCurvePoint.y }];
    });


    // Create the vertical lines if they don't exist, otherwise update them
    verticalLinesData.forEach((lineData, index) => {
      if (index + 2 >= chart.data.datasets.length) {
        // Add a new line dataset
        chart.data.datasets.push({
          type: 'line',
          data: lineData,
          borderColor: '#cfff04',
          borderWidth: 1,
          fill: false,
          pointRadius: 0,
          showLine: true
        });
      } else {
        // Update the existing line dataset
        chart.data.datasets[index + 2].data = lineData;
      }
    });

    chart.update();
    updateKnobValuesDisplay(); // Update the knob values display
  }

  function calculateMSELoss(curveData, questionData) {
    const n = questionData.length;
    let sumSquaredErrors = 0;

    for (let i = 0; i < n; i++) {
      const closestCurvePoint = findClosestPointOnCurve(questionData[i].x, curveData);
      const error = closestCurvePoint.y - questionData[i].y;
      sumSquaredErrors += error * error;
    }

    return sumSquaredErrors / n;
  }

function checkWinCondition(mseLoss) {
    const winThreshold = 0.1; // Adjust this value to define how close is "correct"
    return mseLoss < winThreshold;
  }

const originalKValues = {
    k0: randomK0,
    k1: randomK1,
    k2: randomK2,
    k3: randomK3,
    k4: randomK4,
    k5: randomK5
};


  // Function to update the knob values in the right column
function updateKnobValuesDisplay() {
    const knobValues = [
        { id: 'k0', color: '#0f0' },
        { id: 'k1', color: '#00f' },
        { id: 'k2', color: '#f0f' },
        { id: 'k3', color: '#ff0' },
        { id: 'k4', color: '#0ff' },
        { id: 'k5', color: '#f00' }
    ];

    valuesContainer.innerHTML = ''; // Clear previous values
    knobValues.forEach(knob => {
        const learnedValue = document.getElementById(knob.id).value;
        const valueElement = document.createElement('div');
        valueElement.className = 'knob-value';
        if (gradientDescentRun) {
            const originalValue = originalKValues[knob.id];
            valueElement.innerHTML = `
                <span style="color: ${knob.color}; font-size: 15px;">${knob.id}:</span>
                <span style="color: white;  font-size: 15px;">Original: ${originalValue}, </span>
                <span style="color: white;  font-size: 15px;">Learned: ${learnedValue}</span>
            `;
        } else {
            valueElement.innerHTML = `
                <span style="color: ${knob.color}; ">${knob.id}:</span>
                <span style="color: white; ">${learnedValue}</span>
            `;
        }
        valuesContainer.appendChild(valueElement);
    });

    // Calculate and display the MSE loss
    const mseLoss = calculateMSELoss(chart.data.datasets[1].data, questionDataPoints);
    const mseLossElement = document.createElement('div');
    mseLossElement.className = 'knob-value';
    mseLossElement.innerHTML = `<span style="color: white; font-size: 20px;">Loss: ${mseLoss.toFixed(2)}</span>`;
    valuesContainer.appendChild(mseLossElement);

    if (checkWinCondition(mseLoss)) {
        alert('Congratulations! You won!');
    }
}
  // Event listeners for knobs and inputs
  knobs.forEach((knob, index) => {
    knob.addEventListener('input', updateChart);
  });

  valueInputs.forEach((input, index) => {
    input.addEventListener('input', updateChart);
  });

function resetKnobValues() {
  alert("This is a simple game where you need to adjust the knobs to match the curve to the data points. The knobs control the coefficients of a polynomial curve(k0 + k1*x + k2*x^2 + k3*x^4 + k4*x^5 + k5*x^6). The goal is to minimize the Loss(MSE) between the curve and the data points. Adjust the knobs and try to get the MSE loss below 0.1 to win the game. Good luck!");
    const knobValues = [
      { id: 'k0', color: '#0f0' },
      { id: 'k1', color: '#00f' },
      { id: 'k2', color: '#f0f' },
      { id: 'k3', color: '#ff0' },
      { id: 'k4', color: '#0ff' },
      { id: 'k5', color: '#f00' }
    ];

    knobValues.forEach(knob => {
      document.getElementById(knob.id).value = 0; // Reset input value
    });

  // Initial chart update
  updateChart();
}

function runGradientDescent() {
    // Define the true function (hidden from the user)
    function trueFunction(x) {
        return randomK0 + randomK1 * x + randomK2 * x ** 2 + randomK3 * x ** 3 + randomK4 * x ** 4 + randomK5 * x ** 5;
    }

    // Generate noisy data points
    const xData = [];
    const yData = [];
    for (let i = 0; i <= 100; i++) {
        const x = i / 100;
        xData.push(x);
        yData.push(trueFunction(x) + (Math.random() * 6) - 3); // Add noise
    }

    // Initialize weights
    let k0 = 0;
    let k1 = 0;
    let k2 = 0;
    let k3 = 0;
    let k4 = 0;
    let k5 = 0;

    // Learning rate
    const learningRate = 0.01;

    // Number of iterations
    const iterations = 100000;

    // Function to calculate predicted y values
    function predict(x) {
        return k0 + k1 * x + k2 * x ** 2 + k3 * x ** 3 + k4 * x ** 4 + k5 * x ** 5;
    }

    // Function to calculate mean squared error loss
    function meanSquaredError() {
        let sumSquaredErrors = 0;
        for (let i = 0; i < xData.length; i++) {
            const error = predict(xData[i]) - yData[i];
            sumSquaredErrors += error ** 2;
        }
        return sumSquaredErrors / xData.length;
    }

    // Gradient Descent
    for (let i = 0; i < iterations; i++) {
        // Calculate gradients
        let k0Gradient = 0;
        let k1Gradient = 0;
        let k2Gradient = 0;
        let k3Gradient = 0;
        let k4Gradient = 0;
        let k5Gradient = 0;

        for (let j = 0; j < xData.length; j++) {
            const prediction = predict(xData[j]);
            const error = prediction - yData[j];
            k0Gradient += error;
            k1Gradient += error * xData[j];
            k2Gradient += error * xData[j] ** 2;
            k3Gradient += error * xData[j] ** 3;
            k4Gradient += error * xData[j] ** 4;
            k5Gradient += error * xData[j] ** 5;
        }

        k0Gradient *= 2 / xData.length;
        k1Gradient *= 2 / xData.length;
        k2Gradient *= 2 / xData.length;
        k3Gradient *= 2 / xData.length;
        k4Gradient *= 2 / xData.length;
        k5Gradient *= 2 / xData.length;

        // Update weights
        k0 -= learningRate * k0Gradient;
        k1 -= learningRate * k1Gradient;
        k2 -= learningRate * k2Gradient;
        k3 -= learningRate * k3Gradient;
        k4 -= learningRate * k4Gradient;
        k5 -= learningRate * k5Gradient;

        // Log progress
        const loss = meanSquaredError();    }

    // Update the knob values in the DOM
    document.getElementById('k0').value = k0.toFixed(4);
    document.getElementById('k1').value = k1.toFixed(4);
    document.getElementById('k2').value = k2.toFixed(4);
    document.getElementById('k3').value = k3.toFixed(4);
    document.getElementById('k4').value = k4.toFixed(4);
    document.getElementById('k5').value = k5.toFixed(4);

    // Update the chart
    updateChart();

    // Update the knob values display
gradientDescentRun = true;
    updateKnobValuesDisplay();
}

document.getElementById('right-column-curve-fitter').addEventListener('click', function() {
      runGradientDescent();
  alert(`We use Gradient Descent here to fit the curve to the data points. The actual curve equation is: y = ${randomK0} + ${randomK1}x + ${randomK2}x^2 + ${randomK3}x^3 + ${randomK4}x^4 + ${randomK5}x^5. The equation we got from Gradient descent is: y = ${document.getElementById('k0').value} + ${document.getElementById('k1').value}x + ${document.getElementById('k2').value}x^2 + ${document.getElementById('k3').value}x^3 + ${document.getElementById('k4').value}x^4 + ${document.getElementById('k5').value} x^5.`);
});

resetKnobValues();
});
