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
  const randomK1 = 0;
  const randomK2 = 0;
  const randomK3 = 0;
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

// True curve parameters
const true_k0 = randomK0;
const true_k1 = randomK1;
const true_k2 = randomK2;
const true_k3 = randomK3;
const true_k4 = randomK4;
const true_k5 = randomK5;

// Generate data points from the true curve
const x = Array.from({ length: 100 }, (_, i) => -1 + i * 2 / 99);
const y = x.map(xi => true_k0 + true_k1 * xi + true_k2 * xi**2 + true_k3 * xi**3 + true_k4 * xi**4 + true_k5 * xi**5);

// Initialize parameters
let k0 = 0, k1 = 0, k2 = 0, k3 = 0, k4 = 0, k5 = 0;
const num_iterations = 100;

// Define the cost function (Mean Squared Error)
function costFunction(k0, k1, k2, k3, k4, k5, x, y) {
    const y_pred = x.map(xi => k0 + k1 * xi + k2 * xi**2 + k3 * xi**3 + k4 * xi**4 + k5 * xi**5);
    return y_pred.reduce((sum, yi, i) => sum + (y[i] - yi)**2, 0) / y.length;
}

// Define the gradient of the cost function
function gradient(k0, k1, k2, k3, k4, k5, x, y) {
    const y_pred = x.map(xi => k0 + k1 * xi + k2 * xi**2 + k3 * xi**3 + k4 * xi**4 + k5 * xi**5);
    const dk0 = -2 * x.reduce((sum, xi, i) => sum + (y[i] - y_pred[i]), 0) / x.length;
    const dk1 = -2 * x.reduce((sum, xi, i) => sum + (y[i] - y_pred[i]) * xi, 0) / x.length;
    const dk2 = -2 * x.reduce((sum, xi, i) => sum + (y[i] - y_pred[i]) * xi**2, 0) / x.length;
    const dk3 = -2 * x.reduce((sum, xi, i) => sum + (y[i] - y_pred[i]) * xi**3, 0) / x.length;
    const dk4 = -2 * x.reduce((sum, xi, i) => sum + (y[i] - y_pred[i]) * xi**4, 0) / x.length;
    const dk5 = -2 * x.reduce((sum, xi, i) => sum + (y[i] - y_pred[i]) * xi**5, 0) / x.length;
    return [dk0, dk1, dk2, dk3, dk4, dk5];
}

// Define the Hessian of the cost function
function hessian(k0, k1, k2, k3, k4, k5, x, y) {
    const y_pred = x.map(xi => k0 + k1 * xi + k2 * xi**2 + k3 * xi**3 + k4 * xi**4 + k5 * xi**5);
    const dk0_dk0 = 2 * x.reduce((sum, xi) => sum + 1, 0) / x.length;
    const dk0_dk1 = 2 * x.reduce((sum, xi) => sum + xi, 0) / x.length;
    const dk0_dk2 = 2 * x.reduce((sum, xi) => sum + xi**2, 0) / x.length;
    const dk0_dk3 = 2 * x.reduce((sum, xi) => sum + xi**3, 0) / x.length;
    const dk0_dk4 = 2 * x.reduce((sum, xi) => sum + xi**4, 0) / x.length;
    const dk0_dk5 = 2 * x.reduce((sum, xi) => sum + xi**5, 0) / x.length;
    const dk1_dk1 = 2 * x.reduce((sum, xi) => sum + xi**2, 0) / x.length;
    const dk1_dk2 = 2 * x.reduce((sum, xi) => sum + xi**3, 0) / x.length;
    const dk1_dk3 = 2 * x.reduce((sum, xi) => sum + xi**4, 0) / x.length;
    const dk1_dk4 = 2 * x.reduce((sum, xi) => sum + xi**5, 0) / x.length;
    const dk1_dk5 = 2 * x.reduce((sum, xi) => sum + xi**6, 0) / x.length;
    const dk2_dk2 = 2 * x.reduce((sum, xi) => sum + xi**4, 0) / x.length;
    const dk2_dk3 = 2 * x.reduce((sum, xi) => sum + xi**5, 0) / x.length;
    const dk2_dk4 = 2 * x.reduce((sum, xi) => sum + xi**6, 0) / x.length;
    const dk2_dk5 = 2 * x.reduce((sum, xi) => sum + xi**7, 0) / x.length;
    const dk3_dk3 = 2 * x.reduce((sum, xi) => sum + xi**6, 0) / x.length;
    const dk3_dk4 = 2 * x.reduce((sum, xi) => sum + xi**7, 0) / x.length;
    const dk3_dk5 = 2 * x.reduce((sum, xi) => sum + xi**8, 0) / x.length;
    const dk4_dk4 = 2 * x.reduce((sum, xi) => sum + xi**8, 0) / x.length;
    const dk4_dk5 = 2 * x.reduce((sum, xi) => sum + xi**9, 0) / x.length;
    const dk5_dk5 = 2 * x.reduce((sum, xi) => sum + xi**10, 0) / x.length;

    return [
        [dk0_dk0, dk0_dk1, dk0_dk2, dk0_dk3, dk0_dk4, dk0_dk5],
        [dk0_dk1, dk1_dk1, dk1_dk2, dk1_dk3, dk1_dk4, dk1_dk5],
        [dk0_dk2, dk1_dk2, dk2_dk2, dk2_dk3, dk2_dk4, dk2_dk5],
        [dk0_dk3, dk1_dk3, dk2_dk3, dk3_dk3, dk3_dk4, dk3_dk5],
        [dk0_dk4, dk1_dk4, dk2_dk4, dk3_dk4, dk4_dk4, dk4_dk5],
        [dk0_dk5, dk1_dk5, dk2_dk5, dk3_dk5, dk4_dk5, dk5_dk5]
    ];
}

// Function to invert a matrix using Gaussian elimination
function invertMatrix(matrix) {
    const n = matrix.length;
    const augmented = matrix.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => i === j ? 1 : 0)]);

    for (let i = 0; i < n; i++) {
        const factor = 1 / augmented[i][i];
        for (let j = 0; j < 2 * n; j++) {
            augmented[i][j] *= factor;
        }
        for (let k = 0; k < n; k++) {
            if (k !== i) {
                const factor = augmented[k][i];
                for (let j = 0; j < 2 * n; j++) {
                    augmented[k][j] -= factor * augmented[i][j];
                }
            }
        }
    }

    return augmented.map(row => row.slice(n));
}

// Newton's method
for (let iteration = 0; iteration < num_iterations; iteration++) {
    // Compute the gradient and Hessian
    const grad = gradient(k0, k1, k2, k3, k4, k5, x, y);
    const hess = hessian(k0, k1, k2, k3, k4, k5, x, y);

    // Invert the Hessian matrix
    const hessInv = invertMatrix(hess);

    // Compute the update vector
    const delta = [
        hessInv[0][0] * grad[0] + hessInv[0][1] * grad[1] + hessInv[0][2] * grad[2] + hessInv[0][3] * grad[3] + hessInv[0][4] * grad[4] + hessInv[0][5] * grad[5],
        hessInv[1][0] * grad[0] + hessInv[1][1] * grad[1] + hessInv[1][2] * grad[2] + hessInv[1][3] * grad[3] + hessInv[1][4] * grad[4] + hessInv[1][5] * grad[5],
        hessInv[2][0] * grad[0] + hessInv[2][1] * grad[1] + hessInv[2][2] * grad[2] + hessInv[2][3] * grad[3] + hessInv[2][4] * grad[4] + hessInv[2][5] * grad[5],
        hessInv[3][0] * grad[0] + hessInv[3][1] * grad[1] + hessInv[3][2] * grad[2] + hessInv[3][3] * grad[3] + hessInv[3][4] * grad[4] + hessInv[3][5] * grad[5],
        hessInv[4][0] * grad[0] + hessInv[4][1] * grad[1] + hessInv[4][2] * grad[2] + hessInv[4][3] * grad[3] + hessInv[4][4] * grad[4] + hessInv[4][5] * grad[5],
        hessInv[5][0] * grad[0] + hessInv[5][1] * grad[1] + hessInv[5][2] * grad[2] + hessInv[5][3] * grad[3] + hessInv[5][4] * grad[4] + hessInv[5][5] * grad[5]
    ];

    // Update parameters
    k0 -= delta[0];
    k1 -= delta[1];
    k2 -= delta[2];
    k3 -= delta[3];
    k4 -= delta[4];
    k5 -= delta[5];

    // Print progress
    if (iteration % 10 === 0) {
        console.log(`Iteration ${iteration}: k0 = ${k0}, k1 = ${k1}, k2 = ${k2}, k3 = ${k3}, k4 = ${k4}, k5 = ${k5}`);
    }
}

console.log(`Final coefficients: k0 = ${k0}, k1 = ${k1}, k2 = ${k2}, k3 = ${k3}, k4 = ${k4}, k5 = ${k5}`);
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
  alert(`We use Newton's Method here to fit the curve to the data points. The actual curve equation is: y = ${randomK0} + ${randomK1}x + ${randomK2}x^2 + ${randomK3}x^3 + ${randomK4}x^4 + ${randomK5}x^5. The equation we got from Gradient descent is: y = ${document.getElementById('k0').value} + ${document.getElementById('k1').value}x + ${document.getElementById('k2').value}x^2 + ${document.getElementById('k3').value}x^3 + ${document.getElementById('k4').value}x^4 + ${document.getElementById('k5').value} x^5.`);
});

resetKnobValues();
});
