// ...existing code...

// Make all scenario tabs clickable
document.querySelectorAll('.tablinks').forEach(tab => {
  tab.addEventListener('click', function() {
    const scenarioId = this.getAttribute('data-scenario');
    openScenario(scenarioId);
  });
});

function openScenario(scenarioId) {
  // Hide all scenario contents
  document.querySelectorAll('.tabcontent').forEach(content => {
    content.style.display = 'none';
  });
  
  // Remove active class from all tabs
  document.querySelectorAll('.tablinks').forEach(tab => {
    tab.classList.remove('active');
  });
  
  // Show the current tab and add active class
  document.getElementById(scenarioId).style.display = 'block';
  document.querySelector(`[data-scenario="${scenarioId}"]`).classList.add('active');
  
  // Reset calculator for the new scenario
  clearCalculator();
}

// Ensure all calculator buttons work
document.querySelectorAll('.calc-button').forEach(button => {
  button.addEventListener('click', function() {
    handleButtonClick(this.textContent);
  });
});

function handleButtonClick(value) {
  const display = document.querySelector('.calc-display');
  
  switch(value) {
    case 'C':
      clearCalculator();
      break;
    case '=':
      calculateResult();
      break;
    default:
      // Handle digits and operators
      display.textContent = display.textContent === '0' ? value : display.textContent + value;
  }
}

function clearCalculator() {
  document.querySelector('.calc-display').textContent = '0';
}

function calculateResult() {
  const display = document.querySelector('.calc-display');
  try {
    // Using Function constructor for safe evaluation of math expressions
    display.textContent = Function('"use strict";return (' + display.textContent + ')')();
  } catch (error) {
    display.textContent = 'Error';
  }
}

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
  // Open the first scenario by default
  openScenario('scenario1');
});
// ...existing code...
