// STEM Solver App JavaScript
class STEMSolver {
    constructor() {
        this.API_BASE = window.location.origin;
        this.currentTab = 'solver';
        this.isLoading = false;
        this.history = JSON.parse(localStorage.getItem('stemHistory') || '[]');
        this.settings = JSON.parse(localStorage.getItem('stemSettings') || '{}');
        this.subjects = {};
        this.examples = {};
        
        this.init();
    }

    // Initialize the application
    async init() {
        this.showLoadingScreen();
        await this.loadSubjects();
        await this.loadExamples();
        this.setupEventListeners();
        this.loadSettings();
        this.updateHistory();
        this.updateTopics();
        this.hideLoadingScreen();
        this.initMathJax();
        this.startPeriodicTasks();
    }

    // Show loading screen
    showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('active');
    }

    // Hide loading screen
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loading-screen');
            loadingScreen.classList.remove('active');
        }, 1500);
    }

    // Load subjects and topics from API
    async loadSubjects() {
        try {
            const response = await fetch(`${this.API_BASE}/api/subjects`);
            const data = await response.json();
            this.subjects = data.subjects;
        } catch (error) {
            console.error('Failed to load subjects:', error);
            this.showNotification('Failed to load subjects', 'error');
        }
    }

    // Load example problems from API
    async loadExamples() {
        try {
            const response = await fetch(`${this.API_BASE}/api/examples`);
            const data = await response.json();
            this.examples = data.examples;
        } catch (error) {
            console.error('Failed to load examples:', error);
            this.showNotification('Failed to load examples', 'error');
        }
    }

    // Setup all event listeners
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Settings modal
        document.getElementById('settings-btn').addEventListener('click', () => {
            this.openSettings();
        });

        // Temperature slider
        const tempSlider = document.getElementById('temperature');
        const tempValue = document.getElementById('temp-value');
        tempSlider.addEventListener('input', (e) => {
            tempValue.textContent = e.target.value;
        });

        // Subject items in sidebar
        document.querySelectorAll('.subject-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const subject = e.currentTarget.dataset.subject;
                this.selectSubject(subject);
            });
        });

        // Password visibility toggle
        window.togglePasswordVisibility = (inputId) => {
            const input = document.getElementById(inputId);
            const icon = input.nextElementSibling.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fas fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fas fa-eye';
            }
        };

        // Global button functions
        window.solveProblem = () => this.solveProblem();
        window.explainConcept = () => this.explainConcept();
        window.getFormulas = () => this.getFormulas();
        window.getStudyTips = () => this.getStudyTips();
        window.loadExample = () => this.loadExample();
        window.clearProblem = () => this.clearProblem();
        window.updateTopics = () => this.updateTopics();
        window.closeModal = () => this.closeModal();

        // Copy and download functions
        window.copySolution = () => this.copyToClipboard('solution-content');
        window.downloadSolution = () => this.downloadContent('solution-content', 'solution.txt');
        window.shareSolution = () => this.shareSolution();
        window.copyExplanation = () => this.copyToClipboard('explanation-content');
        window.downloadExplanation = () => this.downloadContent('explanation-content', 'explanation.txt');
        window.copyFormulas = () => this.copyToClipboard('formulas-content');
        window.downloadFormulas = () => this.downloadContent('formulas-content', 'formulas.txt');
        window.copyStudyTips = () => this.copyToClipboard('study-tips-content');
        window.downloadStudyTips = () => this.downloadContent('study-tips-content', 'study-tips.txt');

        // Concept input with suggestions
        const conceptInput = document.getElementById('concept-input');
        if (conceptInput) {
            conceptInput.addEventListener('input', this.debounce((e) => {
                this.showConceptSuggestions(e.target.value);
            }, 300));
        }

        // Click outside to close suggestions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.form-group')) {
                document.querySelectorAll('.concept-suggestions').forEach(el => {
                    el.classList.remove('active');
                });
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.switchTab('solver');
                        break;
                    case '2':
                        e.preventDefault();
                        this.switchTab('explainer');
                        break;
                    case '3':
                        e.preventDefault();
                        this.switchTab('formulas');
                        break;
                    case '4':
                        e.preventDefault();
                        this.switchTab('study-tips');
                        break;
                    case 'Enter':
                        e.preventDefault();
                        this.handleQuickAction();
                        break;
                }
            }
        });
    }

    // Switch between tabs
    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.tab === tabName) {
                item.classList.add('active');
            }
        });

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
            this.currentTab = tabName;
        }

        // Add animation effect
        this.addTabSwitchAnimation();
    }

    // Add animation when switching tabs
    addTabSwitchAnimation() {
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.style.opacity = '0';
            activeTab.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                activeTab.style.transition = 'all 0.3s ease';
                activeTab.style.opacity = '1';
                activeTab.style.transform = 'translateY(0)';
            }, 50);
        }
    }

    // Toggle theme between light and dark
    toggleTheme() {
        const body = document.body;
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');
        
        const currentTheme = body.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        body.setAttribute('data-theme', newTheme);
        icon.className = newTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        
        // Save preference
        this.settings.theme = newTheme;
        this.saveSettings();
        
        this.showNotification(`Switched to ${newTheme} theme`, 'success');
    }

    // Select subject and update form
    selectSubject(subject) {
        const activeSubjects = document.querySelectorAll('.subject-item');
        activeSubjects.forEach(item => item.classList.remove('active'));
        
        const selectedItem = document.querySelector(`[data-subject="${subject}"]`);
        if (selectedItem) {
            selectedItem.classList.add('active');
        }

        // Update form selectors based on current tab
        const subjectSelectors = [
            'solver-subject',
            'explainer-subject',
            'formula-subject',
            'study-subject'
        ];

        subjectSelectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (selector) {
                selector.value = subject;
            }
        });

        this.updateTopics();
    }

    // Update topics based on selected subject
    updateTopics() {
        const formulaSubject = document.getElementById('formula-subject');
        const formulaTopic = document.getElementById('formula-topic');
        
        if (formulaSubject && formulaTopic) {
            const selectedSubject = formulaSubject.value;
            const topics = this.subjects[selectedSubject] || [];
            
            formulaTopic.innerHTML = '';
            topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic;
                option.textContent = topic;
                formulaTopic.appendChild(option);
            });
        }
    }

    // Solve problem
    async solveProblem() {
        const problem = document.getElementById('problem-input').value.trim();
        if (!problem) {
            this.showNotification('Please enter a problem to solve', 'warning');
            return;
        }

        const btn = document.getElementById('solve-btn');
        const container = document.getElementById('solution-container');
        const content = document.getElementById('solution-content');

        this.setLoadingState(btn, true);
        this.showProgressBar();

        try {
            const requestData = {
                problem: problem,
                subject: document.getElementById('solver-subject').value,
                difficulty: document.getElementById('solver-difficulty').value,
                show_steps: document.getElementById('show-steps').checked,
                include_theory: document.getElementById('include-theory').checked,
                include_diagrams: document.getElementById('include-diagrams').checked,
                model: document.getElementById('model-select').value,
                temperature: parseFloat(document.getElementById('temperature').value),
                api_key: document.getElementById('api-key').value || null
            };

            const response = await fetch(`${this.API_BASE}/api/solve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (data.success) {
                content.innerHTML = this.formatContent(data.solution);
                container.classList.remove('hidden');
                this.scrollToElement(container);
                
                // Add to history
                this.addToHistory({
                    type: 'problem',
                    problem: problem,
                    solution: data.solution,
                    subject: data.subject,
                    timestamp: new Date().toISOString()
                });

                this.showNotification('Problem solved successfully!', 'success');
                this.renderMath();
            } else {
                this.showNotification(data.error || 'Failed to solve problem', 'error');
            }
        } catch (error) {
            console.error('Error solving problem:', error);
            this.showNotification('Network error occurred', 'error');
        } finally {
            this.setLoadingState(btn, false);
            this.hideProgressBar();
        }
    }

    // Explain concept
    async explainConcept() {
        const concept = document.getElementById('concept-input').value.trim();
        if (!concept) {
            this.showNotification('Please enter a concept to explain', 'warning');
            return;
        }

        const btn = document.getElementById('explain-btn');
        const container = document.getElementById('explanation-container');
        const content = document.getElementById('explanation-content');

        this.setLoadingState(btn, true);
        this.showProgressBar();

        try {
            const requestData = {
                concept: concept,
                subject: document.getElementById('explainer-subject').value,
                level: document.getElementById('explainer-level').value,
                include_examples: document.getElementById('include-examples').checked,
                include_history: document.getElementById('include-history').checked,
                model: document.getElementById('model-select').value,
                temperature: parseFloat(document.getElementById('temperature').value),
                api_key: document.getElementById('api-key').value || null
            };

            const response = await fetch(`${this.API_BASE}/api/explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (data.success) {
                content.innerHTML = this.formatContent(data.explanation);
                container.classList.remove('hidden');
                this.scrollToElement(container);
                
                this.addToHistory({
                    type: 'concept',
                    concept: concept,
                    explanation: data.explanation,
                    subject: data.subject,
                    timestamp: new Date().toISOString()
                });

                this.showNotification('Concept explained successfully!', 'success');
                this.renderMath();
            } else {
                this.showNotification(data.error || 'Failed to explain concept', 'error');
            }
        } catch (error) {
            console.error('Error explaining concept:', error);
            this.showNotification('Network error occurred', 'error');
        } finally {
            this.setLoadingState(btn, false);
            this.hideProgressBar();
        }
    }

    // Get formulas
    async getFormulas() {
        const btn = document.getElementById('formulas-btn');
        const container = document.getElementById('formulas-container');
        const content = document.getElementById('formulas-content');

        this.setLoadingState(btn, true);
        this.showProgressBar();

        try {
            const requestData = {
                subject: document.getElementById('formula-subject').value,
                topic: document.getElementById('formula-topic').value,
                search_term: document.getElementById('formula-search').value.trim(),
                model: document.getElementById('model-select').value,
                api_key: document.getElementById('api-key').value || null
            };

            const response = await fetch(`${this.API_BASE}/api/formulas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (data.success) {
                content.innerHTML = this.formatContent(data.formulas);
                container.classList.remove('hidden');
                this.scrollToElement(container);
                
                this.showNotification('Formulas loaded successfully!', 'success');
                this.renderMath();
            } else {
                this.showNotification(data.error || 'Failed to get formulas', 'error');
            }
        } catch (error) {
            console.error('Error getting formulas:', error);
            this.showNotification('Network error occurred', 'error');
        } finally {
            this.setLoadingState(btn, false);
            this.hideProgressBar();
        }
    }

    // Get study tips
    async getStudyTips() {
        const btn = document.getElementById('study-tips-btn');
        const container = document.getElementById('study-tips-container');
        const content = document.getElementById('study-tips-content');

        this.setLoadingState(btn, true);
        this.showProgressBar();

        try {
            const challenges = Array.from(document.querySelectorAll('input[name="challenges"]:checked'))
                .map(checkbox => checkbox.value);

            const requestData = {
                subject: document.getElementById('study-subject').value,
                learning_style: document.getElementById('learning-style').value,
                study_goal: document.getElementById('study-goal').value,
                challenges: challenges,
                model: document.getElementById('model-select').value,
                api_key: document.getElementById('api-key').value || null
            };

            const response = await fetch(`${this.API_BASE}/api/study-tips`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();

            if (data.success) {
                content.innerHTML = this.formatContent(data.study_tips);
                container.classList.remove('hidden');
                this.scrollToElement(container);
                
                this.showNotification('Study tips generated successfully!', 'success');
                this.renderMath();
            } else {
                this.showNotification(data.error || 'Failed to get study tips', 'error');
            }
        } catch (error) {
            console.error('Error getting study tips:', error);
            this.showNotification('Network error occurred', 'error');
        } finally {
            this.setLoadingState(btn, false);
            this.hideProgressBar();
        }
    }

    // Load example problem
    loadExample() {
        const subject = document.getElementById('solver-subject').value;
        const example = this.examples[subject];
        
        if (example) {
            document.getElementById('problem-input').value = example;
            this.showNotification('Example problem loaded!', 'success');
        } else {
            this.showNotification('No example available for this subject', 'warning');
        }
    }

    // Clear problem input
    clearProblem() {
        document.getElementById('problem-input').value = '';
        const container = document.getElementById('solution-container');
        if (container) {
            container.classList.add('hidden');
        }
        this.showNotification('Problem cleared', 'success');
    }

    // Format content with proper styling
    formatContent(content) {
        // Convert markdown-like formatting to HTML
        let formatted = content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');

        // Wrap in paragraph tags
        formatted = '<p>' + formatted + '</p>';

        // Handle headers
        formatted = formatted.replace(/^### (.*?)$/gm, '<h3>$1</h3>');
        formatted = formatted.replace(/^## (.*?)$/gm, '<h2>$1</h2>');
        formatted = formatted.replace(/^# (.*?)$/gm, '<h1>$1</h1>');

        return formatted;
    }

    // Set loading state for buttons
    setLoadingState(button, isLoading) {
        if (isLoading) {
            button.classList.add('loading');
            button.disabled = true;
        } else {
            button.classList.remove('loading');
            button.disabled = false;
        }
    }

    // Show progress bar
    showProgressBar() {
        const progressBar = document.getElementById('progress-bar');
        const progressFill = progressBar.querySelector('.progress-bar-fill');
        
        progressBar.classList.remove('hidden');
        progressFill.style.width = '0%';
        
        // Animate progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress > 90) {
                progress = 90;
                clearInterval(interval);
            }
            progressFill.style.width = progress + '%';
        }, 200);
        
        this.progressInterval = interval;
    }

    // Hide progress bar
    hideProgressBar() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }
        
        const progressBar = document.getElementById('progress-bar');
        const progressFill = progressBar.querySelector('.progress-bar-fill');
        
        progressFill.style.width = '100%';
        
        setTimeout(() => {
            progressBar.classList.add('hidden');
            progressFill.style.width = '0%';
        }, 500);
    }

    // Show notification
    showNotification(message, type = 'info') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        container.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Get notification icon based on type
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Scroll to element smoothly
    scrollToElement(element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }

    // Copy content to clipboard
    async copyToClipboard(contentId) {
        const content = document.getElementById(contentId);
        if (content) {
            const text = content.textContent || content.innerText;
            try {
                await navigator.clipboard.writeText(text);
                this.showNotification('Content copied to clipboard!', 'success');
            } catch (error) {
                console.error('Copy failed:', error);
                this.showNotification('Failed to copy content', 'error');
            }
        }
    }

    // Download content as file
    downloadContent(contentId, filename) {
        const content = document.getElementById(contentId);
        if (content) {
            const text = content.textContent || content.innerText;
            const blob = new Blob([text], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Content downloaded!', 'success');
        }
    }

    // Share solution
    async shareSolution() {
        const content = document.getElementById('solution-content');
        if (content && navigator.share) {
            try {
                await navigator.share({
                    title: 'STEM Problem Solution',
                    text: content.textContent || content.innerText,
                    url: window.location.href
                });
                this.showNotification('Solution shared!', 'success');
            } catch (error) {
                console.error('Share failed:', error);
                this.copyToClipboard('solution-content');
            }
        } else {
            this.copyToClipboard('solution-content');
        }
    }

    // Add item to history
    addToHistory(item) {
        this.history.unshift(item);
        this.history = this.history.slice(0, 50); // Keep only last 50 items
        this.saveHistory();
        this.updateHistory();
    }

    // Update history display
    updateHistory() {
        const container = document.getElementById('recent-problems');
        if (!container) return;

        if (this.history.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-folder-open"></i>
                    <p>No recent problems</p>
                </div>
            `;
            return;
        }

        const historyHTML = this.history.slice(0, 5).map((item, index) => {
            const title = item.problem || item.concept || 'Recent Item';
            const time = new Date(item.timestamp).toLocaleTimeString();
            return `
                <div class="history-item" onclick="app.loadHistoryItem(${index})">
                    <div class="history-title">${title.substring(0, 50)}${title.length > 50 ? '...' : ''}</div>
                    <div class="history-time">${time}</div>
                </div>
            `;
        }).join('');

        container.innerHTML = historyHTML;
    }

    // Load history item
    loadHistoryItem(index) {
        const item = this.history[index];
        if (!item) return;

        if (item.type === 'problem') {
            this.switchTab('solver');
            document.getElementById('problem-input').value = item.problem;
            document.getElementById('solver-subject').value = item.subject;
        } else if (item.type === 'concept') {
            this.switchTab('explainer');
            document.getElementById('concept-input').value = item.concept;
            document.getElementById('explainer-subject').value = item.subject;
        }

        this.showNotification('History item loaded!', 'success');
    }

    // Show concept suggestions
    showConceptSuggestions(query) {
        const suggestions = document.getElementById('concept-suggestions');
        if (!suggestions || !query) {
            if (suggestions) suggestions.classList.remove('active');
            return;
        }

        // Sample concept suggestions - in a real app, this would come from an API
        const conceptSuggestions = {
            'physics': ['Quantum Entanglement', 'Special Relativity', 'Wave-Particle Duality', 'Thermodynamics'],
            'chemistry': ['Chemical Bonding', 'Stoichiometry', 'Acid-Base Reactions', 'Organic Synthesis'],
            'mathematics': ['Calculus', 'Linear Algebra', 'Statistics', 'Differential Equations'],
            'biology': ['DNA Replication', 'Photosynthesis', 'Evolution', 'Cell Division'],
            'computer': ['Algorithms', 'Data Structures', 'Machine Learning', 'Object-Oriented Programming']
        };

        const matches = [];
        Object.values(conceptSuggestions).flat().forEach(concept => {
            if (concept.toLowerCase().includes(query.toLowerCase())) {
                matches.push(concept);
            }
        });

        if (matches.length > 0) {
            suggestions.innerHTML = matches.slice(0, 5).map(concept => 
                `<div class="suggestion-item" onclick="app.selectConcept('${concept}')">${concept}</div>`
            ).join('');
            suggestions.classList.add('active');
        } else {
            suggestions.classList.remove('active');
        }
    }

    // Select concept from suggestions
    selectConcept(concept) {
        document.getElementById('concept-input').value = concept;
        document.getElementById('concept-suggestions').classList.remove('active');
    }

    // Open settings modal
    openSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('hidden');
        
        // Load current settings
        document.getElementById('dark-mode-toggle').checked = this.settings.theme === 'dark';
        document.getElementById('animations-toggle').checked = this.settings.animations !== false;
        document.getElementById('sound-toggle').checked = this.settings.sound !== false;
        document.getElementById('completion-notifications').checked = this.settings.notifications !== false;
        document.getElementById('auto-save').checked = this.settings.autoSave !== false;
        document.getElementById('preload-examples').checked = this.settings.preloadExamples === true;
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('settings-modal');
        modal.classList.add('hidden');
        
        // Save settings
        this.settings.theme = document.getElementById('dark-mode-toggle').checked ? 'dark' : 'light';
        this.settings.animations = document.getElementById('animations-toggle').checked;
        this.settings.sound = document.getElementById('sound-toggle').checked;
        this.settings.notifications = document.getElementById('completion-notifications').checked;
        this.settings.autoSave = document.getElementById('auto-save').checked;
        this.settings.preloadExamples = document.getElementById('preload-examples').checked;
        
        this.saveSettings();
        this.applySettings();
    }

    // Handle quick action based on current tab
    handleQuickAction() {
        switch (this.currentTab) {
            case 'solver':
                this.solveProblem();
                break;
            case 'explainer':
                this.explainConcept();
                break;
            case 'formulas':
                this.getFormulas();
                break;
            case 'study-tips':
                this.getStudyTips();
                break;
        }
    }

    // Initialize MathJax
    initMathJax() {
        if (window.MathJax) {
            window.MathJax.startup.defaultReady();
        }
    }

    // Re-render math after content update
    renderMath() {
        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }
    }

    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('stemSettings', JSON.stringify(this.settings));
    }

    // Load settings from localStorage
    loadSettings() {
        this.settings = {
            theme: 'light',
            animations: true,
            sound: true,
            notifications: true,
            autoSave: true,
            preloadExamples: false,
            ...this.settings
        };
        this.applySettings();
    }

    // Apply settings to the UI
    applySettings() {
        document.body.setAttribute('data-theme', this.settings.theme);
        
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = this.settings.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }

        if (!this.settings.animations) {
            document.body.style.setProperty('--transition-fast', '0ms');
            document.body.style.setProperty('--transition-normal', '0ms');
            document.body.style.setProperty('--transition-slow', '0ms');
        }
    }

    // Save history to localStorage
    saveHistory() {
        localStorage.setItem('stemHistory', JSON.stringify(this.history));
    }

    // Start periodic tasks
    startPeriodicTasks() {
        // Auto-save every 30 seconds
        setInterval(() => {
            if (this.settings.autoSave) {
                this.saveHistory();
                this.saveSettings();
            }
        }, 30000);

        // Update time displays
        setInterval(() => {
            this.updateTimeDisplays();
        }, 60000);
    }

    // Update time displays
    updateTimeDisplays() {
        document.querySelectorAll('.history-time').forEach(timeEl => {
            // Update relative time displays if needed
        });
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new STEMSolver();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && window.app) {
        window.app.renderMath();
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    // Adjust layout if needed
});

// Add some helper CSS classes dynamically
const style = document.createElement('style');
style.textContent = `
    .history-item {
        padding: 8px 12px;
        margin: 4px 0;
        background: var(--bg-card);
        border-radius: var(--radius-md);
        cursor: pointer;
        transition: all var(--transition-fast);
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .history-item:hover {
        background: rgba(108, 92, 231, 0.1);
        transform: translateY(-1px);
    }

    .history-title {
        font-size: var(--font-sm);
        font-weight: 500;
        color: var(--text-primary);
        margin-bottom: 2px;
    }

    .history-time {
        font-size: var(--font-xs);
        color: var(--text-muted);
    }

    .concept-suggestions {
        position: relative;
        margin-top: 4px;
    }

    .form-group {
        position: relative;
    }
`;
document.head.appendChild(style);