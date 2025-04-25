// --- Performance Utilities ---
const usdFmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
const pctFmt = new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 0 });

// Fix the debounce function - add missing closing brace
function debounce(fn, delay=150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function makeCell(text) {
  const td = document.createElement('td');
  td.textContent = text;
  return td;
}

function makeRow(values) {
  const tr = document.createElement('tr');
  values.forEach(v => tr.appendChild(makeCell(v)));
  return tr;
}

/**
 * Updates button text temporarily to provide user feedback
 * @param {string} buttonId - ID of the button element
 * @param {string} newText - Text to display on the button
 * @param {number} [duration=2000] - Duration in ms before reverting to original text
 */
function updateButtonText(buttonId, newText, duration = 2000) {
  const button = document.getElementById(buttonId);
  if (!button) return;
  
  const originalText = button.textContent;
  button.textContent = newText;
  setTimeout(() => {
    button.textContent = originalText;
  }, duration);
}

// Helper function for copying text with improved error handling
function copyToClipboard(text, buttonId) {
  navigator.clipboard.writeText(text)
    .then(() => {
      updateButtonText(buttonId, 'Copied!');
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
      updateButtonText(buttonId, 'Copy Failed!');
    });
}

/**
 * Switch between tabs
 * @param {string} tabId - ID of the tab to switch to
 */
function switchTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active');
  });
  
  // Deactivate all tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show the selected tab content
  const selectedContent = document.getElementById(tabId);
  if (selectedContent) {
    selectedContent.classList.add('active');
  }
  
  // Activate the selected tab button
  const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
  if (selectedBtn) {
    selectedBtn.classList.add('active');
  }
}

// Event Delegation for improved performance
document.body.addEventListener('click', e => {
  // Handle tab switching
  if (e.target.matches('.tab-btn')) {
    switchTab(e.target.dataset.tab);
  }
  
  // Handle calculate buttons
  if (e.target.matches('.calculate-btn')) {
    const scenarioNum = +e.target.dataset.scenario;
    if (!isNaN(scenarioNum) && scenarioNum >= 1 && scenarioNum <= 4) {
      calculateScenario(scenarioNum);
    }
  }
  
  // Handle save buttons
  if (e.target.matches('.save-btn')) {
    const scenarioNum = +e.target.dataset.scenario;
    if (!isNaN(scenarioNum) && scenarioNum >= 1 && scenarioNum <= 4) {
      saveScenario(scenarioNum);
    }
  }
  
  // Handle clone buttons
  if (e.target.matches('.clone-btn')) {
    const scenarioNum = +e.target.dataset.scenario;
    if (!isNaN(scenarioNum) && scenarioNum >= 2 && scenarioNum <= 4) {
      cloneScenarioOne(scenarioNum);
    }
  }
  
  // Handle comparison button
  if (e.target.id === 'generate-comparison-btn') {
    generateComparison();
  }
  
  // Handle copy comparison button
  if (e.target.id === 'copy-comparison-btn') {
    copyComparison();
  }
});

// Global variables to store saved scenarios and node specifications
let savedScenarios = {
    1: null,
    2: null,
    3: null,
    4: null
};

// Node specifications data from CSV files
const nodeSpecsData = {
    "Taiwan CHT": [
        {
            title: "Taiwan CHT",
            specs: {
                "# of GPU Cluster": "31",
                "GPU Node Spec": "Processor : Intel  Xeon Platinum 8558 Processor 260M Cache, 2.10 GHz , 48 cores x 2\nMemory :  64 GB DIMMs x 32 ( Total : 2.048 TB )\nStorage (OS) : 960GB NVMe SSD x 1\nStorage (DATA) : 7.6TB NVMe SSD  x 8 \nGPU : NVIDIA H100 80GB HBM3 x 8 ( Total : 640 GB GPU memory )\nNVSwitch : 4th generation NVLinks x 4 ( Provide : 900 Gb/s GPU-to-GPU bandwidth )\nIB Adapters ( Computing )  : NVIDIA ConnectX-7 Single Port InfiniBand Card x 8\nIB Adapters ( Storage ) : NVIDIA ConnectX-7 Single Port InfiniBand Card x 2 \nEthernet Adapters (In-Band )  : NVIDIA 100G Dual Port x 1",
                "In-Band Ethernet Network Spec": "200Gb/s",
                "IB Network Spec": "400Gb/s",
                "IB Management": "UFM",
                "Internet Speed": "1G",
                "Share Storage IB Network Spec": "400Gb/s",
                "Share Storage Availiable Capacity": "207TB",
                "Share Storage Performance": "Read Throughput : 260 GB/s\nWrite Throughtput : 130 GB/s"
            }
        }
    ],
    "Taiwan FET": [
        {
            title: "Taiwan FET - HGX",
            specs: {
                "# of GPU Cluster": "23",
                "GPU Node Spec": "Processor : Intel  Xeon Platinum 8558 Processor 260M Cache, 2.10 GHz , 48 cores x 2\nMemory :  64 GB DIMMs x 32 ( Total : 2.048 TB )\nStorage (OS) : 960GB NVMe SSD x 1\nStorage (DATA) : 7.6TB NVMe SSD  x 8 \nGPU : NVIDIA H100 80GB HBM3 x 8 ( Total : 640 GB GPU memory )\nNVSwitch : 4th generation NVLinks x 4 ( Provide : 900 GB/s GPU-to-GPU bandwidth )\nIB Adapters ( Computing )  : NVIDIA ConnectX-7 Single Port InfiniBand Card x 8\nIB Adapters ( Storage )  : NVIDIA ConnectX-7 Single Port InfiniBand Card x 2\nEthernet Adapters (In-Band )  : NVIDIA 100G Dual Port ( ConnectX-6 )  x 1",
                "In-Band Ethernet Network Spec": "200Gb/s  ( 100Gbps x 2 , LACP )",
                "IB Network Spec": "400Gb/s",
                "IB Management": "UFM",
                "Internet Speed": "1G",
                "Share Storage IB Network Spec": "400Gb/s",
                "Share Storage Availiable Capacity": "519TB",
                "Share Storage Performance": "Read Throughput : 90 GB/s\nWrite Throughtput : 65 GB/s"
            }
        },
        {
            title: "Taiwan FET - DGX",
            specs: {
                "# of GPU Cluster": "8",
                "GPU Node Spec": "Processor : Intel  Xeon Platinum  8480C Processor 105M Cache, 2.00 GHz x 2\nMemory :  64 GB DIMMs x 32 ( Total : 2.048 TB )\nStorage (OS) : 1.92TB NVMe SSD x 2\nStorage (DATA) : 3.84TB NVMe SSD  x 8 \nGPU : NVIDIA H100 80GB HBM3 x 8 ( Total : 640 GB GPU memory )\nNVSwitch : 4th generation NVLinks x 4 ( Provide : 900 GB/s GPU-to-GPU bandwidth )\nIB Adapters ( Computing )  : NVIDIA ConnectX-7 Single Port InfiniBand Card x 8\nIB Adapters ( Storage )  : NVIDIA ConnectX-7 Single Port InfiniBand Card x 2\nEthernet Adapters (In-Band )  : Intel E810-C 100G Dual-Port x 1",
                "In-Band Ethernet Network Spec": "200Gb/s ( 100Gbps x 2 , LACP )",
                "IB Network Spec": "400Gb/s",
                "IB Management": "UFM",
                "Internet Speed": "1G",
                "Share Storage IB Network Spec": "400Gb/s",
                "Share Storage Availiable Capacity": "519TB",
                "Share Storage Performance": "Read Throughput : 90 GB/s\nWrite Throughtput : 65 GB/s"
            }
        },
        {
            title: "Taiwan FET - Liquid Cooling",
            specs: {
                "# of GPU Cluster": "4",
                "GPU Node Spec": "Processor : Intel(R) Xeon(R) Platinum 8480+ x 2\nMemory :  64 GB DIMMs x 32 ( Total : 2.048 TB )\nStorage (OS) : 960GB NVMe SSD x 2\nStorage (DATA) : 7.68TB NVMe SSD  x 6\nGPU : NVIDIA H200 141GB x 8 ( Total : 1128 GB GPU memory )\nNVSwitch : 4th generation NVLinks x 4 ( Provide : 900 GB/s GPU-to-GPU bandwidth )\nIB Adapters ( Computing )  :  NVIDIA ConnectX-7 Single Port InfiniBand Card x 8\nIB Adapters ( Storage )  :  NVIDIA ConnectX-7 Single Port InfiniBand Card x 1\nEthernet Adapters (In-Band )  : Nvidia MT43244 BlueField-3 x 2",
                "In-Band Ethernet Network Spec": "100Gb",
                "IB Network Spec": "400Gb",
                "IB Management": "-",
                "Internet Speed": "1Gb",
                "Share Storage IB Network Spec": "400Gb",
                "Share Storage Availiable Capacity": "-",
                "Share Storage Performance": "-"
            }
        }
    ],
    "Thailand (SuperNap)": [
        {
            title: "Thailand - Supernap",
            specs: {
                "# of GPU Cluster": "4",
                "GPU Node Spec": "Processor : Intel  Xeon Platinum 8558 Processor 260M Cache, 2.10 GHz , 48 cores x 2\nMemory :  64 GB DIMMs x 32 ( Total : 2.048 TB )\nStorage (OS) : 960GB NVMe SSD x 1\nStorage (DATA) : 7.6TB NVMe SSD  x 8 \nGPU : NVIDIA H100 80GB HBM3 x 8 ( Total : 640 GB GPU memory )\nNVSwitch : 4th generation NVLinks x 4 ( Provide : 900 GB/s GPU-to-GPU bandwidth )\nIB Adapters ( Computing )  : NVIDIA ConnectX-7 Single Port InfiniBand Card x 8\nIB Adapters ( Storage ) : NVIDIA ConnectX-7 Single Port InfiniBand Card x 1\nEthernet  Adapters (In-Band ) : Intel Controller X550 Dual Port x 1",
                "In-Band Ethernet Network Spec": "10Gb",
                "IB Network Spec": "400Gb",
                "IB Management": "UFM",
                "Internet Speed": "1Gb",
                "Share Storage IB Network Spec": "400Gb/s ( Down )",
                "Share Storage Availiable Capacity": "-",
                "Share Storage Performance": "-"
            }
        }
    ],
    "Denver, CO": [
        {
            title: "Denver - H200 - Supermicro",
            specs: {
                "# of GPU Cluster": "4 Nodes / 32 Cards",
                "GPU Node Spec": "Processor :  Intel 8568Y x 2 Memory :  64 GB DIMMs x 32 ( Total : 2.048 TB ) Storage (OS) : 960GB NVMe SSD x 2 Storage (DATA) : 7.6TB NVMe SSD  x 8  GPU : NVIDIA H200 x 8  IB Adapters ( Computing )  : NVIDIA ConnectX-7 Single Port InfiniBand Card x 8 Ethernet Adapters ( Storage and In-Band )  : NVIDIA BlueField-3 3220 DPU  (BF3220 200G) x 1",
                "In-Band Ethernet Network Spec": "200Gb/s",
                "IB Network Spec": "400Gb/s",
                "IB Management": "UFM",
                "Internet Speed": "10G",
                "Share Storage Ethernet Network Spec": "200Gb/s",
                "Share Storage Availiable Capacity": "6PB",
                "Share Storage Performance": ""
            }
        },
        {
            title: "Denver - HPE",
            specs: {
                "# of GPU Cluster": "16",
                "GPU Node Spec": "Processor : Intel 8570 x 2 Memory :  64 GB DIMMs x 32 ( Total : 2.048 TB ) Storage (OS) : 960GB NVMe SSD x 2 Storage (DATA) : 3.84TB NVMe SSD  x 8  GPU : NVIDIA H200 x 8  IB Adapters ( Computing )  : NVIDIA ConnectX-7 Single Port InfiniBand Card x 8 Ethernet Adapters ( Storage and In-Band )  : NVIDIA BlueField-3 3220 DPU  (BF3220 200G) x 1",
                "In-Band Ethernet Network Spec": "200Gb/s",
                "IB Network Spec": "400Gb/s",
                "IB Management": "UFM",
                "Internet Speed": "10G",
                "Share Storage Ethernet Network Spec": "200Gb/s",
                "Share Storage Availiable Capacity": "6PB",
                "Share Storage Performance": ""
            }
        }
    ]
};

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab system
    switchTab('scenario-1');
    
    // Initialize scenarios
    initializeScenarios();
    
    // Initialize node specs data from localStorage
    initializeNodeSpecsData();
    
    // Add copy buttons to each scenario tab
    addCopyButtonsToScenarios();
    
    // Set up comparison button
    document.getElementById('generate-comparison-btn')?.addEventListener('click', generateComparison);
    
    // Set up copy button
    document.getElementById('copy-comparison-btn')?.addEventListener('click', copyComparison);
});

/**
 * Set up all scenario-related functionality
 */
function initializeScenarios() {
    // Initialize form controls for all 4 scenarios
    for (let i = 1; i <= 4; i++) {
        // Initialize toggle functions for location and node inputs
        const idcSelect = document.getElementById(`scenario-${i}-idc-location`);
        if (idcSelect) {
            idcSelect.addEventListener('change', () => toggleOtherIdcInput(i));
            toggleOtherIdcInput(i); // Initialize visibility state
        }
        
        const nodeSelect = document.getElementById(`scenario-${i}-node-type`);
        if (nodeSelect) {
            nodeSelect.addEventListener('change', () => toggleOtherNodeInput(i));
            toggleOtherNodeInput(i); // Initialize visibility state
        }
    }
    
    // Set up partner margin tab buttons
    document.getElementById('calculate-partner-btn')?.addEventListener('click', calculatePartnerScenario);
    document.getElementById('calculate-partner-margin-btn')?.addEventListener('click', calculatePartnerMargin);
}

/**
 * Toggle the "Other" input field for IDC location with improved null checking
 */
function toggleOtherIdcInput(scenarioNum) {
    const idcSelect = document.getElementById(`scenario-${scenarioNum}-idc-location`);
    const otherIdcContainer = document.getElementById(`scenario-${scenarioNum}-other-idc-container`);
    
    if (!idcSelect || !otherIdcContainer) return;
    
    const isOtherSelected = idcSelect.value === 'Other';
    otherIdcContainer.classList.toggle('hidden', !isOtherSelected);
    
    // Clear the custom input when switching away from "Other"
    if (!isOtherSelected) {
        const otherIdcInput = document.getElementById(`scenario-${scenarioNum}-other-idc`);
        if (otherIdcInput) otherIdcInput.value = '';
    }
}

/**
 * Toggle the "Other" input field for Node Type with improved null checking
 */
function toggleOtherNodeInput(scenarioNum) {
    const nodeSelect = document.getElementById(`scenario-${scenarioNum}-node-type`);
    const otherNodeContainer = document.getElementById(`scenario-${scenarioNum}-other-node-container`);
    
    if (!nodeSelect || !otherNodeContainer) return;
    
    const isOtherSelected = nodeSelect.value === 'Other';
    otherNodeContainer.classList.toggle('hidden', !isOtherSelected);
    
    // Clear the custom input when switching away from "Other"
    if (!isOtherSelected) {
        const otherNodeInput = document.getElementById(`scenario-${scenarioNum}-other-node`);
        if (otherNodeInput) otherNodeInput.value = '';
    }
}

/**
 * Initialize node specs data with improved error handling and data merging
 */
function initializeNodeSpecsData() {
    try {
        const savedNodeSpecs = localStorage.getItem('nodeSpecsData');
        if (!savedNodeSpecs) return;
        
        const parsedData = JSON.parse(savedNodeSpecs);
        
        // More efficient merge strategy
        for (const location in parsedData) {
            // If location doesn't exist in default data, add it entirely
            if (!nodeSpecsData[location]) {
                nodeSpecsData[location] = parsedData[location];
                continue;
            }
            
            // For existing locations, create a map of titles for faster lookup
            const existingTitlesMap = new Map(
                nodeSpecsData[location].map(item => [item.title, true])
            );
            
            // Only add items with new titles
            parsedData[location].forEach(item => {
                if (!existingTitlesMap.has(item.title)) {
                    nodeSpecsData[location].push(item);
                }
            });
        }
    } catch (e) {
        console.error('Error initializing node specs data:', e);
    }
}

// Function to add copy buttons to each scenario tab
function addCopyButtonsToScenarios() {
    // Add copy buttons to scenarios 1-4
    for (let i = 1; i <= 4; i++) {
        const resultsSection = document.querySelector(`#scenario-${i} .results-section`);
        if (resultsSection) {
            const copyBtn = document.createElement('button');
            copyBtn.id = `copy-scenario-${i}-btn`;
            copyBtn.className = 'copy-btn';
            copyBtn.textContent = 'Copy Summary';
            copyBtn.addEventListener('click', function() {
                copyScenarioSummary(i);
            });
            resultsSection.appendChild(copyBtn);
        }
    }
    
    // Add copy button to partner margin tab
    const partnerResultsSection = document.querySelector('#partner-margin .results-section');
    if (partnerResultsSection) {
        const copyBtn = document.createElement('button');
        copyBtn.id = 'copy-partner-btn';
        copyBtn.className = 'copy-btn';
        copyBtn.textContent = 'Copy Summary';
        copyBtn.addEventListener('click', function() {
            copyPartnerSummary();
        });
        partnerResultsSection.appendChild(copyBtn);
    }
}

// Function to copy scenario summary to clipboard with improved error handling
function copyScenarioSummary(scenarioNum) {
  const summaryElement = document.getElementById(`scenario-${scenarioNum}-summary`);
  if (summaryElement) {
    copyToClipboard(summaryElement.textContent, `copy-scenario-${scenarioNum}-btn`);
  }
}

// Function to copy partner summary to clipboard with improved error handling
function copyPartnerSummary() {
  const summaryElement = document.getElementById('partner-summary');
  const marginSummaryElement = document.getElementById('partner-margin-summary');
  
  let textToCopy = '';
  if (summaryElement) {
    textToCopy += summaryElement.textContent + '\n';
  }
  if (marginSummaryElement) {
    textToCopy += marginSummaryElement.textContent;
  }
  
  copyToClipboard(textToCopy, 'copy-partner-btn');
}

// Function to calculate storage tier and cost
function getStorageTierInfo(capacity) {
  if (capacity <= 0) return { tier: '', costPerGB: 0 };
  
  if (capacity <= 100) {
    return { 
      tier: 'Tier 1 (1 TB - 99 TB)', 
      costPerGB: 0.08,
      sku: 'GMI-STORAGE-T1 1TB-100TB'
    };
  } else if (capacity < 500) {
    return { 
      tier: 'Tier 2 (100 TB - 499 TB)', 
      costPerGB: 0.07,
      sku: 'GMI-STORAGE-T1 100 TB - 499 TB'
    };
  } else if (capacity < 1500) {
    return { 
      tier: 'Tier 3 (500+ TB)', 
      costPerGB: 0.06,
      sku: 'GMI-STORAGE-T1-500 TB - 1.49 PB'
    };
  } else {
    return { 
      tier: 'Tier 4 (1500+ TB)', 
      costPerGB: 0.05,
      sku: 'GMI-STORAGE-T1-1.5 PB - 5 PB'
    };
  }
}

// Function to calculate scenario - single implementation
function calculateScenario(scenarioNum) {
  // Get input values
  const scenarioName = document.getElementById(`scenario-${scenarioNum}-name`).value;
  const idcLocation = document.getElementById(`scenario-${scenarioNum}-idc-location`).value;
  const otherIdcInput = document.getElementById(`scenario-${scenarioNum}-other-idc`);
  // Use custom IDC location if "Other" is selected
  const actualIdcLocation = idcLocation === 'Other' && otherIdcInput ? 
                           (otherIdcInput.value.trim() || 'Custom Location') : 
                           idcLocation;

  const nodeType = document.getElementById(`scenario-${scenarioNum}-node-type`).value;
  const otherNodeInput = document.getElementById(`scenario-${scenarioNum}-other-node`);
  // Use custom Node type if "Other" is selected
  const actualNodeType = nodeType === 'Other' && otherNodeInput ? 
                        (otherNodeInput.value.trim() || 'Custom Node') : 
                        nodeType;

  const hourlyRate = Math.max(0.01, parseFloat(document.getElementById(`scenario-${scenarioNum}-hourly-rate`).value) || 0.01);
  const downPaymentPercentage = parseFloat(document.getElementById(`scenario-${scenarioNum}-down-payment`).value);
  const numSystems = parseInt(document.getElementById(`scenario-${scenarioNum}-num-systems`).value);
  const termLength = parseInt(document.getElementById(`scenario-${scenarioNum}-term-length`).value);
  const storageCapacity = parseInt(document.getElementById(`scenario-${scenarioNum}-storage-capacity`).value);

  // Constants
  const HOURS_PER_MONTH = 730;
  const CARDS_PER_SYSTEM = 8;

  // Derived values
  const totalCards = numSystems * CARDS_PER_SYSTEM;
  const storageInfo = getStorageTierInfo(storageCapacity);

  // Calculate costs
  const monthlyCardCost = hourlyRate * HOURS_PER_MONTH;
  const monthlySystemCost = monthlyCardCost * CARDS_PER_SYSTEM;
  const totalMonthlyCost = monthlySystemCost * numSystems;
  let totalContractValue = totalMonthlyCost * termLength;
  
  // Add storage costs if applicable
  let monthlyStorageCost = 0;
  let annualStorageCost = 0;
  if (storageCapacity > 0) {
    monthlyStorageCost = storageCapacity * 1024 * storageInfo.costPerGB;
    annualStorageCost = monthlyStorageCost * 12;
    totalContractValue += monthlyStorageCost * termLength;
  }
  
  // Calculate down payment and monthly payments
  const downPayment = totalContractValue * (downPaymentPercentage / 100);
  const remainingAmount = totalContractValue - downPayment;
  const monthlyPayment = remainingAmount / termLength;
  
  // Build summary using template literals for readability
  let summary = `GMI Cloud Spec Summary:
- Scenario Name: ${scenarioName}
- IDC Location: ${actualIdcLocation}
- Node Type: ${actualNodeType}
- Number of Systems: ${numSystems.toLocaleString()} (Total Cards: ${totalCards.toLocaleString()})
- Term Length: ${termLength} months`;

  if (storageCapacity > 0) {
    summary += `
- Storage Capacity: ${storageCapacity.toLocaleString()} TB External Storage
- Storage SKU: ${storageInfo.sku}
- Storage Qty: ${storageCapacity.toLocaleString()} TB
- Cost per GB/Month: $${storageInfo.costPerGB.toFixed(2)}
- Monthly Storage Cost: ${usdFmt.format(monthlyStorageCost)}
- Annual Storage Cost: ${usdFmt.format(annualStorageCost)}`;
  }

  summary += `

Solution Pricing:
- Hourly Rate per Card: $${hourlyRate.toFixed(2)}`;
  
  if (storageCapacity > 0) {
    summary += `
- Storage ${storageInfo.tier} Monthly Cost: ${usdFmt.format(monthlyStorageCost)}`;
  }
  
  summary += `
- ${downPaymentPercentage}% Down Payment: ${usdFmt.format(downPayment)}
- Adjusted Monthly Payment: ${usdFmt.format(monthlyPayment)}
- Total Contract Value: ${usdFmt.format(totalContractValue)}`;

  // Display the summary
  document.getElementById(`scenario-${scenarioNum}-summary`).textContent = summary;
  
  // Return the calculated data
  return {
    scenarioName,
    idcLocation: actualIdcLocation,
    nodeType: actualNodeType,
    hourlyRate,
    downPaymentPercentage,
    numSystems,
    termLength,
    storageCapacity,
    totalCards,
    storageTier: storageInfo.tier,
    storageGbCost: storageInfo.costPerGB,
    downPayment,
    monthlyPayment,
    totalContractValue,
    summary
  };
}

// Function to calculate partner scenario (similar to regular scenario calculation)
function calculatePartnerScenario() {
    // Get input values
    const scenarioName = document.getElementById('partner-scenario-name').value;
    const idcLocation = document.getElementById('partner-idc-location').value;
    const otherIdcInput = document.getElementById('partner-other-idc');
    // Use custom IDC location if "Other" is selected
    const actualIdcLocation = idcLocation === 'Other' && otherIdcInput ? 
                             (otherIdcInput.value.trim() || 'Custom Location') : 
                             idcLocation;
    
    const nodeType = document.getElementById('partner-node-type').value;
    const otherNodeInput = document.getElementById('partner-other-node');
    // Use custom Node type if "Other" is selected
    const actualNodeType = nodeType === 'Other' && otherNodeInput ? 
                          (otherNodeInput.value.trim() || 'Custom Node') : 
                          nodeType;
    
    const hourlyRate = parseFloat(document.getElementById('partner-hourly-rate').value);
    const downPaymentPercentage = parseFloat(document.getElementById('partner-down-payment').value);
    const numSystems = parseInt(document.getElementById('partner-num-systems').value);
    const termLength = parseInt(document.getElementById('partner-term-length').value);
    const storageCapacity = parseInt(document.getElementById('partner-storage-capacity').value);
    
    // Calculate derived values
    const totalCards = numSystems * 8; // 8 cards per system
    
    // Calculate storage tier and cost
    let storageTier = '';
    let storageGbCost = 0;
    
    if (storageCapacity > 0) {
        if (storageCapacity < 100) {
            storageTier = 'Tier 1 (1 TB - 99 TB)';
            storageGbCost = 0.10;
        } else if (storageCapacity < 500) {
            storageTier = 'Tier 2 (100 TB - 499 TB)';
            storageGbCost = 0.07;
        } else {
            storageTier = 'Tier 3 (500+ TB)';
            storageGbCost = 0.05;
        }
    }
    
    // Calculate costs
    const hoursPerMonth = 730; // Average hours in a month
    const monthlyCardCost = hourlyRate * hoursPerMonth;
    const monthlySystemCost = monthlyCardCost * 8; // 8 cards per system
    const totalMonthlyCost = monthlySystemCost * numSystems;
    const totalContractValue = totalMonthlyCost * termLength;
    
    // Add storage costs if applicable
    let storageMonthlyGbCost = 0;
    if (storageCapacity > 0) {
        storageMonthlyGbCost = storageCapacity * 1024 * storageGbCost; // Convert TB to GB
        totalContractValue += storageMonthlyGbCost * termLength;
    }
    
    // Calculate down payment and monthly payments
    const downPayment = totalContractValue * (downPaymentPercentage / 100);
    const remainingAmount = totalContractValue - downPayment;
    const monthlyPayment = remainingAmount / termLength;
    
    
    // Format the output
    let summary = `GMI Cloud Spec Summary:
- Scenario Name: ${scenarioName}
- IDC Location: ${actualIdcLocation}
- Node Type: ${actualNodeType}
- Number of Systems: ${numSystems.toLocaleString()} (Total Cards: ${totalCards.toLocaleString()})
- Term Length: ${termLength} months`;

    if (storageCapacity > 0) {
        // Determine Storage SKU based on capacity
        let storageSku = '';
        if (storageCapacity <= 100) {
            storageSku = 'GMI-STORAGE-T1 1TB-100TB';
        } else if (storageCapacity < 500) {
            storageSku = 'GMI-STORAGE-T1 100 TB - 499 TB';
        } else if (storageCapacity < 1500) {
            storageSku = 'GMI-STORAGE-T1-500 TB - 1.49 PB';
        } else {
            storageSku = 'GMI-STORAGE-T1-1.5 PB - 5 PB';
        }
        const storageQty = storageCapacity; // in TB
        const annualStorageCost = storageMonthlyGbCost * 12;
        summary += `
- Storage Capacity: ${storageCapacity.toLocaleString()} TB External Storage
- Storage SKU: ${storageSku}
- Storage Qty: ${storageQty.toLocaleString()} TB
- Cost per GB/Month: $${storageGbCost.toFixed(2)}
- Monthly Storage Cost: $${storageMonthlyGbCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
- Annual Storage Cost: $${annualStorageCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }

    summary += `

Solution Pricing:
- Hourly Rate per Card: $${hourlyRate.toFixed(2)}`;
    if (storageCapacity > 0) {
        summary += `
- Storage ${storageTier} Monthly Cost: $${storageMonthlyGbCost.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    summary += `
- ${downPaymentPercentage}% Down Payment: $${downPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
- Adjusted Monthly Payment: $${monthlyPayment.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
- Total Contract Value: $${totalContractValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    // Display the summary
    document.getElementById('partner-summary').textContent = summary;
    
    // Auto-populate the Transfer Price field with the Total Contract Value
    document.getElementById('partner-transfer-price').value = totalContractValue.toFixed(2);
    
    // Return the calculated data
    return {
        scenarioName,
        idcLocation: actualIdcLocation,
        nodeType: actualNodeType,
        hourlyRate,
        downPaymentPercentage,
        numSystems,
        termLength,
        storageCapacity,
        totalCards,
        storageTier,
        storageGbCost,
        downPayment,
        monthlyPayment,
        totalContractValue,
        summary
    };
}

// Function to calculate partner margin
function calculatePartnerMargin() {
    // First calculate the regular scenario
    const scenarioData = calculatePartnerScenario();
    
    // Get partner-specific input values
    const transferPrice = parseFloat(document.getElementById('partner-transfer-price').value);
    const partnerMarkup = parseFloat(document.getElementById('partner-markup').value);
    
    // Calculate partner margin values
    const partnerSellingPrice = transferPrice * (1 + (partnerMarkup / 100));
    const partnerMarginAmount = partnerSellingPrice - transferPrice;
    const partnerMarginPercentage = (partnerMarginAmount / partnerSellingPrice) * 100;
    
    // Calculate GMI margin
    const gmiCost = scenarioData.totalContractValue;
    
    // Calculate hourly rates
    const totalHours = 730 * scenarioData.termLength * scenarioData.totalCards;
    const transferPricePerGpuHr = transferPrice / totalHours;
    const partnerSellingPricePerGpuHr = partnerSellingPrice / totalHours;
    
    // Format the partner margin output
    const marginSummary = `————————————

Partner Margin Profile:

- Transfer Price to Partner: $${transferPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
- Transfer Price to Partner: $${transferPricePerGpuHr.toFixed(2)} GPU/HR
- Partner Markup: ${partnerMarkup}%
- Partner Selling Price: $${partnerSellingPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
- Partner Selling Price: $${partnerSellingPricePerGpuHr.toFixed(2)} per GPU/HR
- Partner Margin: $${partnerMarginAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} (${partnerMarginPercentage.toFixed(2)}%)
- Total Margin: $${partnerMarginAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    // Display the margin summary
    document.getElementById('partner-margin-summary').textContent = marginSummary;
}

// Function to save scenario
function saveScenario(scenarioNum) {
    const scenarioData = calculateScenario(scenarioNum);
    savedScenarios[scenarioNum] = scenarioData;
    
    // Show confirmation
    const saveBtn = document.getElementById(`save-scenario-${scenarioNum}-btn`);
    const originalText = saveBtn.textContent;
    saveBtn.textContent = 'Saved!';
    setTimeout(() => {
        saveBtn.textContent = originalText;
    }, 2000);
}

// Function to generate comparison
function generateComparison() {
    // Check if any scenarios are saved
    const savedScenarioNums = Object.keys(savedScenarios).filter(num => savedScenarios[num] !== null);
    
    if (savedScenarioNums.length === 0) {
        alert('Please save at least one scenario before generating a comparison.');
        return;
    }
    
    // Generate comparison grid
    const comparisonGrid = document.getElementById('comparison-grid');
    comparisonGrid.innerHTML = '';
    
    // Create table for comparison
    const table = document.createElement('table');
    table.className = 'comparison-table';
    
    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Parameter</th>';
    
    savedScenarioNums.forEach(num => {
        headerRow.innerHTML += `<th>Scenario ${num}: ${savedScenarios[num].scenarioName}</th>`;
    });
    
    table.appendChild(headerRow);
    
    // Create rows for each parameter
    const parameters = [
        { name: 'IDC Location', key: 'idcLocation' },
        { name: 'Node Type', key: 'nodeType' },
        { name: 'Number of Systems', key: 'numSystems' },
        { name: 'Total Cards', key: 'totalCards' },
        { name: 'Term Length (months)', key: 'termLength' },
        { name: 'Hourly Rate per Card', key: 'hourlyRate', format: value => `$${value.toFixed(2)}` },
        { name: 'Down Payment %', key: 'downPaymentPercentage', format: value => `${value}%` },
        { name: 'Down Payment', key: 'downPayment', format: value => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` },
        { name: 'Monthly Payment', key: 'monthlyPayment', format: value => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` },
        { name: 'Total Contract Value', key: 'totalContractValue', format: value => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}` }
    ];
    
    parameters.forEach(param => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${param.name}</td>`;
        
        savedScenarioNums.forEach(num => {
            const value = savedScenarios[num][param.key];
            const displayValue = param.format ? param.format(value) : value;
            row.innerHTML += `<td>${displayValue}</td>`;
        });
        
        table.appendChild(row);
    });
    
    comparisonGrid.appendChild(table);
    
    // Generate options analysis
    generateOptionsAnalysis(savedScenarioNums);
}

// Function to generate options analysis
function generateOptionsAnalysis(savedScenarioNums) {
    const optionsAnalysis = document.getElementById('options-analysis');
    optionsAnalysis.innerHTML = '';
    
    // Create table for options analysis
    const table = document.createElement('table');
    table.className = 'options-table';
    
    // Create header row
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th>Metric</th>';
    
    savedScenarioNums.forEach(num => {
        headerRow.innerHTML += `<th>Scenario ${num}</th>`;
    });
    
    table.appendChild(headerRow);
    
    // Create rows for each analysis metric
    const metrics = [
        { 
            name: 'Monthly Cost per Card', 
            calculate: (scenario) => {
                const monthlyCardCost = scenario.hourlyRate * 730; // 730 hours per month
                return monthlyCardCost;
            },
            format: value => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
        },
        { 
            name: 'Monthly Cost per System', 
            calculate: (scenario) => {
                const monthlyCardCost = scenario.hourlyRate * 730; // 730 hours per month
                return monthlyCardCost * 8; // 8 cards per system
            },
            format: value => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
        },
        { 
            name: 'Total Monthly Cost', 
            calculate: (scenario) => {
                const monthlyCardCost = scenario.hourlyRate * 730; // 730 hours per month
                return monthlyCardCost * 8 * scenario.numSystems; // 8 cards per system
            },
            format: value => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
        },
        { 
            name: 'Cost per Card for Full Term', 
            calculate: (scenario) => {
                const monthlyCardCost = scenario.hourlyRate * 730; // 730 hours per month
                return monthlyCardCost * scenario.termLength;
            },
            format: value => `$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
        },
        { 
            name: 'Best Value Option', 
            calculate: (scenario) => {
                // This will be determined after comparing all scenarios
                return null;
            },
            format: value => value ? 'Yes' : ''
        }
    ];
    
    // Calculate values for each metric
    const metricValues = {};
    metrics.forEach(metric => {
        metricValues[metric.name] = {};
        savedScenarioNums.forEach(num => {
            metricValues[metric.name][num] = metric.calculate(savedScenarios[num]);
        });
    });
    
    // Determine best value option (lowest cost per card for full term)
    const costPerCardMetric = 'Cost per Card for Full Term';
    let lowestCost = Infinity;
    let bestValueScenario = null;
    
    savedScenarioNums.forEach(num => {
        const cost = metricValues[costPerCardMetric][num];
        if (cost < lowestCost) {
            lowestCost = cost;
            bestValueScenario = num;
        }
    });
    
    // Set best value option
    savedScenarioNums.forEach(num => {
        metricValues['Best Value Option'][num] = (num === bestValueScenario);
    });
    
    // Create rows for the table
    metrics.forEach(metric => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${metric.name}</td>`;
        
        savedScenarioNums.forEach(num => {
            const value = metricValues[metric.name][num];
            const displayValue = metric.format(value);
            
            // Add class for best value option
            let className = '';
            if (metric.name === 'Best Value Option' && value) {
                className = 'best-value';
            }
            
            row.innerHTML += `<td class="${className}">${displayValue}</td>`;
        });
        
        table.appendChild(row);
    });
    
    optionsAnalysis.appendChild(table);
    
    // Add scenario summaries
    const summariesDiv = document.createElement('div');
    summariesDiv.className = 'scenario-summaries';
    
    savedScenarioNums.forEach(num => {
        const summaryDiv = document.createElement('div');
        summaryDiv.className = 'scenario-summary';
        summaryDiv.innerHTML = `<h3>Scenario ${num}: ${savedScenarios[num].scenarioName}</h3>
                               <pre>${savedScenarios[num].summary}</pre>`;
        summariesDiv.appendChild(summaryDiv);
    });
    
    optionsAnalysis.appendChild(summariesDiv);
}

// Function to copy comparison
function copyComparison() {
    const comparisonGrid = document.getElementById('comparison-grid').innerText;
    const optionsAnalysis = document.getElementById('options-analysis').innerText;
    
    const textToCopy = `${comparisonGrid}\n\n${optionsAnalysis}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Show confirmation
        const copyBtn = document.getElementById('copy-comparison-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        setTimeout(() => {
            copyBtn.textContent = originalText;
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy to clipboard. Please try again.');
    });
}

// Function to load node specs
function loadNodeSpecs() {
    const idcLocation = document.getElementById('specs-idc-location').value;
    const specsContainer = document.getElementById('specs-container');
    specsContainer.innerHTML = '';
    
    if (nodeSpecsData[idcLocation]) {
        nodeSpecsData[idcLocation].forEach(cluster => {
            const clusterDiv = document.createElement('div');
            clusterDiv.className = 'cluster-specs';
            
            let clusterHtml = `<h3>${cluster.title}</h3>
                              <table class="specs-table">`;
            
            for (const [key, value] of Object.entries(cluster.specs)) {
                clusterHtml += `<tr>
                                <td>${key}</td>
                                <td>${value}</td>
                              </tr>`;
            }
            
            clusterHtml += `</table>`;
            clusterDiv.innerHTML = clusterHtml;
            specsContainer.appendChild(clusterDiv);
        });
    } else {
        specsContainer.innerHTML = '<p>No specifications available for this location.</p>';
    }
}

/**
 * Clone settings from Scenario 1 to another scenario
 * @param {number} targetScenarioNum - The scenario number to clone to (2, 3, or 4)
 */
function cloneScenarioOne(targetScenarioNum) {
    if (targetScenarioNum < 2 || targetScenarioNum > 4) return;
    
    try {
        // Get all input values from scenario 1
        const sourceName = document.getElementById('scenario-1-name').value;
        const sourceIdcLocation = document.getElementById('scenario-1-idc-location').value;
        const sourceOtherIdc = document.getElementById('scenario-1-other-idc')?.value || '';
        const sourceNodeType = document.getElementById('scenario-1-node-type').value;
        const sourceOtherNode = document.getElementById('scenario-1-other-node')?.value || '';
        const sourceHourlyRate = document.getElementById('scenario-1-hourly-rate').value;
        const sourceDownPayment = document.getElementById('scenario-1-down-payment').value;
        const sourceNumSystems = document.getElementById('scenario-1-num-systems').value;
        const sourceTermLength = document.getElementById('scenario-1-term-length').value;
        const sourceStorageCapacity = document.getElementById('scenario-1-storage-capacity').value;
        
        // Generate sequential name
        let newName = sourceName;
        if (targetScenarioNum === 2) {
            newName = sourceName + ' 1';
        } else if (targetScenarioNum === 3) {
            newName = sourceName + ' 2';
        } else if (targetScenarioNum === 4) {
            newName = sourceName + ' 3';
        }
        
        // Set values in target scenario
        document.getElementById(`scenario-${targetScenarioNum}-name`).value = newName;
        document.getElementById(`scenario-${targetScenarioNum}-idc-location`).value = sourceIdcLocation;
        document.getElementById(`scenario-${targetScenarioNum}-node-type`).value = sourceNodeType;
        document.getElementById(`scenario-${targetScenarioNum}-hourly-rate`).value = sourceHourlyRate;
        document.getElementById(`scenario-${targetScenarioNum}-down-payment`).value = sourceDownPayment;
        document.getElementById(`scenario-${targetScenarioNum}-num-systems`).value = sourceNumSystems;
        document.getElementById(`scenario-${targetScenarioNum}-term-length`).value = sourceTermLength;
        document.getElementById(`scenario-${targetScenarioNum}-storage-capacity`).value = sourceStorageCapacity;
        
        // Handle "Other" values for IDC location and Node type
        const otherIdcInput = document.getElementById(`scenario-${targetScenarioNum}-other-idc`);
        if (otherIdcInput && sourceIdcLocation === 'Other') {
            otherIdcInput.value = sourceOtherIdc;
        }
        
        const otherNodeInput = document.getElementById(`scenario-${targetScenarioNum}-other-node`);
        if (otherNodeInput && sourceNodeType === 'Other') {
            otherNodeInput.value = sourceOtherNode;
        }
        
        // Update visibility of "Other" input fields
        toggleOtherIdcInput(targetScenarioNum);
        toggleOtherNodeInput(targetScenarioNum);
        
        // Auto calculate the scenario to show updated results
        calculateScenario(targetScenarioNum);
        
        // Provide visual feedback on button
        const cloneBtn = document.getElementById(`clone-scenario-${targetScenarioNum}-btn`);
        const originalText = cloneBtn.textContent;
        cloneBtn.textContent = 'Cloned!';
        setTimeout(() => {
            cloneBtn.textContent = originalText;
        }, 2000);
        
    } catch (error) {
        console.error('Error cloning scenario:', error);
    }
}
