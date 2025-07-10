// Global variables
let currentTheme = 'dark';
let currentModel = 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';
let currentApiKey = '';
let currentTemperature = 0.2;

// DOM elements
const settingsPanel = document.getElementById('settingsPanel');
const loadingOverlay = document.getElementById('loadingOverlay');
const notificationContainer = document.getElementById('notificationContainer');

// Tab system data
const topics = {
    Physics: ["Mechanics", "Thermodynamics", "Electromagnetism", "Optics", "Quantum Physics", "Relativity"],
    Chemistry: ["Stoichiometry", "Thermochemistry", "Chemical Equilibrium", "Acids & Bases", "Electrochemistry", "Organic Chemistry"],
    Mathematics: ["Algebra", "Calculus", "Statistics", "Geometry", "Trigonometry", "Linear Algebra"],
    Biology: ["Genetics", "Ecology", "Cellular Biology", "Physiology", "Evolution", "Biochemistry"],
    Engineering: ["Fluid Mechanics", "Structural Analysis", "Circuit Theory", "Signal Processing", "Control Systems", "Thermodynamics"]
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadUserSettings();
});

function initializeApp() {
    // Initialize tabs
    showTab('problem-solver');
    
    // Set default theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    // Initialize topics for formula reference
    updateTopics();
}

function setupEventListeners() {
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            showTab(tabId);
        });
    });

    // Settings form changes
    document.getElementById('apiKey').addEventListener('input', (e) => {
        currentApiKey = e.target.value;
        saveUserSettings();
    });

    document.getElementById('modelSelect').addEventListener('change', (e) => {
        currentModel = e.target.value;
        saveUserSettings();
    });

    document.getElementById('temperature').addEventListener('input', (e) => {
        currentTemperature = parseFloat(e.target.value);
        saveUserSettings();
    });

    // Close settings when clicking outside
    document.addEventListener('click', (e) => {
        if (!settingsPanel.contains(e.target) && !e.target.closest('.settings-btn')) {
            if (settingsPanel.classList.contains('open')) {
                toggleSettings();
            }
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 'Enter':
                    e.preventDefault();
                    const activeTab = document.querySelector('.tab-content.active');
                    if (activeTab) {
                        const primaryBtn = activeTab.querySelector('.btn-primary');
                        if (primaryBtn) primaryBtn.click();
                    }
                    break;
                case ',':
                    e.preventDefault();
                    toggleSettings();
                    break;
            }
        }
    });
}

// Tab Management
function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabId).classList.add('active');

    // Add active class to selected tab button
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
}

// Settings Management
function toggleSettings() {
    settingsPanel.classList.toggle('open');
}

function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    const themeIcon = document.querySelector('.theme-btn i');
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    
    saveUserSettings();
}

function updateTempValue(value) {
    document.getElementById('tempValue').textContent = value;
    currentTemperature = parseFloat(value);
}

function saveUserSettings() {
    const settings = {
        theme: currentTheme,
        apiKey: currentApiKey,
        model: currentModel,
        temperature: currentTemperature
    };
    localStorage.setItem('stemSolverSettings', JSON.stringify(settings));
}

function loadUserSettings() {
    const saved = localStorage.getItem('stemSolverSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        currentTheme = settings.theme || 'dark';
        currentApiKey = settings.apiKey || '';
        currentModel = settings.model || 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free';
        currentTemperature = settings.temperature || 0.2;

        // Apply settings to UI
        document.documentElement.setAttribute('data-theme', currentTheme);
        document.getElementById('apiKey').value = currentApiKey;
        document.getElementById('modelSelect').value = currentModel;
        document.getElementById('temperature').value = currentTemperature;
        document.getElementById('tempValue').textContent = currentTemperature;

        const themeIcon = document.querySelector('.theme-btn i');
        themeIcon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

// Utility Functions
function showLoading(show = true) {
    if (show) {
        loadingOverlay.classList.add('show');
    } else {
        loadingOverlay.classList.remove('show');
    }
}

function showNotification(message, type = 'success', duration = 5000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    notification.innerHTML = `
        <div>${message}</div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Auto remove after duration
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

function formatMarkdown(text) {
    // Simple markdown formatting for display
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

// API Functions
async function makeApiCall(endpoint, data) {
    try {
        const response = await fetch(`/api/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                api_key: currentApiKey,
                model: currentModel,
                temperature: currentTemperature
            })
        });

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Unknown error occurred');
        }
        
        return result.result;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}

// Problem Solver Functions
async function solveProblem() {
    const problemText = document.getElementById('problemText').value.trim();
    const subject = document.getElementById('subject').value;
    const difficulty = document.getElementById('difficulty').value;
    const showSteps = document.getElementById('showSteps').checked;
    const includeTheory = document.getElementById('includeTheory').checked;
    const includeDiagrams = document.getElementById('includeDiagrams').checked;

    if (!problemText) {
        showNotification('Please enter a problem to solve', 'error');
        return;
    }

    showLoading(true);

    try {
        const solution = await makeApiCall('solve-problem', {
            problem: problemText,
            subject: subject,
            difficulty: difficulty,
            show_steps: showSteps,
            include_theory: includeTheory,
            include_diagrams: includeDiagrams
        });

        document.getElementById('problemSolution').innerHTML = formatMarkdown(solution);
        document.getElementById('problemResult').style.display = 'block';
        
        // Scroll to result
        document.getElementById('problemResult').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
        });

        showNotification('Problem solved successfully!', 'success');
    } catch (error) {
        showNotification(`Error solving problem: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

function clearProblem() {
    document.getElementById('problemText').value = '';
    document.getElementById('problemResult').style.display = 'none';
}

// Concept Explainer Functions
async function explainConcept() {
    const conceptName = document.getElementById('conceptName').value.trim();
    const subject = document.getElementById('conceptSubject').value;
    const level = document.getElementById('conceptLevel').value;
    const includeExamples = document.getElementById('includeExamples').checked;
    const includeHistory = document.getElementById('includeHistory').checked;

    if (!conceptName) {
        showNotification('Please enter a concept to explain', 'error');
        return;
    }

    showLoading(true);

    try {
        const explanation = await makeApiCall('explain-concept', {
            concept: conceptName,
            subject: subject,
            level: level,
            include_examples: includeExamples,
            include_history: includeHistory
        });

        document.getElementById('conceptExplanation').innerHTML = formatMarkdown(explanation);
        document.getElementById('conceptResult').style.display = 'block';
        
        // Scroll to result
        document.getElementById('conceptResult').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
        });

        showNotification('Concept explained successfully!', 'success');
    } catch (error) {
        showNotification(`Error explaining concept: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Formula Reference Functions
function updateTopics() {
    const subject = document.getElementById('formulaSubject').value;
    const topicSelect = document.getElementById('formulaTopic');
    
    // Clear existing options
    topicSelect.innerHTML = '';
    
    // Add new options
    topics[subject].forEach(topic => {
        const option = document.createElement('option');
        option.value = topic;
        option.textContent = topic;
        topicSelect.appendChild(option);
    });
}

async function getFormulas() {
    const subject = document.getElementById('formulaSubject').value;
    const topic = document.getElementById('formulaTopic').value;
    const search = document.getElementById('formulaSearch').value.trim();

    showLoading(true);

    try {
        const formulas = await makeApiCall('get-formulas', {
            subject: subject,
            topic: topic,
            search: search
        });

        document.getElementById('formulaContent').innerHTML = formatMarkdown(formulas);
        document.getElementById('formulaResult').style.display = 'block';
        
        // Scroll to result
        document.getElementById('formulaResult').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
        });

        showNotification('Formulas loaded successfully!', 'success');
    } catch (error) {
        showNotification(`Error loading formulas: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Study Tips Functions
async function getStudyTips() {
    const subject = document.getElementById('studySubject').value;
    const learningStyle = document.getElementById('learningStyle').value;
    const goal = document.getElementById('studyGoal').value;
    
    // Get selected challenges
    const challengeCheckboxes = document.querySelectorAll('#study-tips input[type="checkbox"]:checked');
    const challenges = Array.from(challengeCheckboxes).map(cb => cb.value);

    showLoading(true);

    try {
        const tips = await makeApiCall('study-tips', {
            subject: subject,
            learning_style: learningStyle,
            goal: goal,
            challenges: challenges
        });

        document.getElementById('studyTips').innerHTML = formatMarkdown(tips);
        document.getElementById('studyResult').style.display = 'block';
        
        // Scroll to result
        document.getElementById('studyResult').scrollIntoView({ 
            behavior: 'smooth',
            block: 'start' 
        });

        showNotification('Study tips generated successfully!', 'success');
    } catch (error) {
        showNotification(`Error generating study tips: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
}

// Download Functions
function downloadSolution(type) {
    let content = '';
    let filename = '';
    let title = '';
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    
    switch(type) {
        case 'problem':
            content = document.getElementById('problemSolution').innerText;
            title = document.getElementById('problemText').value.slice(0, 50);
            filename = `problem_solution_${timestamp}.txt`;
            break;
        case 'concept':
            content = document.getElementById('conceptExplanation').innerText;
            title = document.getElementById('conceptName').value;
            filename = `concept_explanation_${timestamp}.txt`;
            break;
        case 'formula':
            content = document.getElementById('formulaContent').innerText;
            title = `${document.getElementById('formulaSubject').value} - ${document.getElementById('formulaTopic').value}`;
            filename = `formula_reference_${timestamp}.txt`;
            break;
        case 'study':
            content = document.getElementById('studyTips').innerText;
            title = `Study Tips - ${document.getElementById('studySubject').value}`;
            filename = `study_tips_${timestamp}.txt`;
            break;
    }
    
    const fullContent = `${title}\n${'='.repeat(title.length)}\n\n${content}`;
    
    const blob = new Blob([fullContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('File downloaded successfully!', 'success');
}

// Keyboard Navigation
document.addEventListener('keydown', function(e) {
    // Tab navigation with keyboard
    if (e.altKey) {
        const tabs = ['problem-solver', 'concept-explainer', 'formula-reference', 'study-tips'];
        const currentTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        const currentIndex = tabs.indexOf(currentTab);
        
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const nextIndex = (currentIndex + 1) % tabs.length;
            showTab(tabs[nextIndex]);
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
            showTab(tabs[prevIndex]);
        }
    }
});

// Auto-save user input
function setupAutoSave() {
    const inputs = [
        'problemText', 'conceptName', 'formulaSearch'
    ];
    
    inputs.forEach(inputId => {
        const element = document.getElementById(inputId);
        if (element) {
            element.addEventListener('input', function() {
                localStorage.setItem(`autosave_${inputId}`, this.value);
            });
            
            // Restore saved content
            const saved = localStorage.getItem(`autosave_${inputId}`);
            if (saved) {
                element.value = saved;
            }
        }
    });
}

// Initialize auto-save after DOM is loaded
document.addEventListener('DOMContentLoaded', setupAutoSave);

// Service Worker Registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/static/js/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}

// Error boundary for unhandled errors
window.addEventListener('error', function(e) {
    console.error('Unhandled error:', e.error);
    showNotification('An unexpected error occurred. Please try again.', 'error');
});

// Online/Offline status
window.addEventListener('online', function() {
    showNotification('Connection restored!', 'success', 3000);
});

window.addEventListener('offline', function() {
    showNotification('You are offline. Some features may not work.', 'warning', 5000);
});

// Performance monitoring
const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    entries.forEach((entry) => {
        if (entry.duration > 100) {
            console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
        }
    });
});

observer.observe({ entryTypes: ['measure', 'navigation'] });