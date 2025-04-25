/**
 * Initializes the calculator and ensures all scenarios work correctly
 */
document.addEventListener('DOMContentLoaded', function() {
  // Ensure all tab buttons work properly
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
      const tabId = this.getAttribute('data-tab');
      switchTab(tabId);
    });
  });

  // Initialize calculator for all scenarios
  for (let i = 1; i <= 4; i++) {
    // Set up calculate button
    const calculateBtn = document.getElementById(`calculate-scenario-${i}-btn`);
    if (calculateBtn) {
      calculateBtn.addEventListener('click', function() {
        calculateScenario(i);
      });
    }
    
    // Set up save button
    const saveBtn = document.getElementById(`save-scenario-${i}-btn`);
    if (saveBtn) {
      saveBtn.addEventListener('click', function() {
        saveScenario(i);
      });
    }
    
    // Set up clone button for scenarios 2-4
    if (i > 1) {
      const cloneBtn = document.getElementById(`clone-scenario-${i}-btn`);
      if (cloneBtn) {
        cloneBtn.addEventListener('click', function() {
          cloneScenarioOne(i);
        });
      }
    }
  }

  // Show scenario 1 by default
  switchTab('scenario-1');
});
