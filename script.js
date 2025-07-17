// GitHub Stars Dashboard - Main Application Logic
class StarsDashboard {
    constructor() {
        this.repositories = [];
        this.filteredRepositories = [];
        this.currentView = 'grid';
        this.currentTheme = 'dark';
        this.filters = {
            search: '',
            category: '',
            language: '',
            sort: 'stars'
        };
        
        this.init();
    }

    async init() {
        this.bindEvents();
        this.loadTheme();
        await this.loadData();
        this.renderDashboard();
    }

    bindEvents() {
        // Theme toggle
        document.getElementById('theme-toggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // View toggle
        document.getElementById('view-toggle').addEventListener('click', () => {
            this.toggleView();
        });

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Filters
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.filters.category = e.target.value;
            this.applyFilters();
        });

        document.getElementById('language-filter').addEventListener('change', (e) => {
            this.filters.language = e.target.value;
            this.applyFilters();
        });

        document.getElementById('sort-filter').addEventListener('change', (e) => {
            this.filters.sort = e.target.value;
            this.applyFilters();
        });
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.currentTheme = savedTheme;
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeToggle();
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        this.updateThemeToggle();
    }

    updateThemeToggle() {
        const themeToggle = document.getElementById('theme-toggle');
        const themeIcon = themeToggle.querySelector('.theme-icon');
        themeIcon.textContent = this.currentTheme === 'dark' ? '☀️' : '🌙';
    }

    toggleView() {
        this.currentView = this.currentView === 'grid' ? 'list' : 'grid';
        const repositoriesContainer = document.getElementById('repositories');
        repositoriesContainer.className = `repositories ${this.currentView}-view`;
        
        const viewToggle = document.getElementById('view-toggle');
        const viewIcon = viewToggle.querySelector('.view-icon');
        viewIcon.textContent = this.currentView === 'grid' ? '☰' : '▦';
    }

    async loadData() {
        try {
            const response = await fetch('data/starred.json');
            
            if (!response.ok) {
                throw new Error('Failed to load data');
            }
            
            const data = await response.json();
            this.repositories = data.repositories || [];
            this.filteredRepositories = [...this.repositories];
            
            this.populateFilterOptions();
            this.updateStats(data);
            this.hideLoading();
            
        } catch (error) {
            console.error('Error loading data:', error);
            this.showError();
        }
    }

    populateFilterOptions() {
        const categories = [...new Set(this.repositories.flatMap(repo => repo.categories || []))].sort();
        const languages = [...new Set(this.repositories.map(repo => repo.language).filter(Boolean))].sort();

        this.populateSelect('category-filter', categories);
        this.populateSelect('language-filter', languages);
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        const defaultOption = select.querySelector('option[value=""]');
        
        // Clear existing options except the default
        select.innerHTML = '';
        select.appendChild(defaultOption);
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }

    updateStats(data) {
        document.getElementById('total-repos').textContent = data.total || this.repositories.length;
        document.getElementById('total-languages').textContent = Object.keys(data.analytics?.byLanguage || {}).length;
        document.getElementById('total-categories').textContent = Object.keys(data.analytics?.byCategory || {}).length;
        
        this.renderAnalytics(data.analytics);
    }

    renderAnalytics(analytics) {
        if (!analytics) return;

        this.renderLanguageDonutChart('language-chart', analytics.byLanguage);
        this.renderCategoryCards('category-chart', analytics.byCategory);
    }

    renderChart(containerId, data, title) {
        const container = document.getElementById(containerId);
        if (!data || Object.keys(data).length === 0) {
            container.innerHTML = `<p>No ${title.toLowerCase()} data available</p>`;
            return;
        }

        const sortedData = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 10);
        const total = Object.values(data).reduce((sum, count) => sum + count, 0);

        const html = sortedData.map(([key, value]) => {
            const percentage = ((value / total) * 100).toFixed(1);
            return `
                <div class="chart-bar">
                    <div class="chart-label">${key}</div>
                    <div class="chart-bar-container">
                        <div class="chart-bar-fill" style="width: ${percentage}%"></div>
                        <span class="chart-value">${value}</span>
                    </div>
                </div>
            `;
        }).join('');

        container.innerHTML = html;
    }

    renderLanguageDonutChart(containerId, data) {
        const container = document.getElementById(containerId);
        if (!data || Object.keys(data).length === 0) {
            container.innerHTML = '<p>No language data available</p>';
            return;
        }

        // Filter out 'Unknown' and get top 8 languages
        const filteredData = Object.entries(data)
            .filter(([key]) => key !== 'Unknown')
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);
        
        const total = filteredData.reduce((sum, [, count]) => sum + count, 0);
        
        // Create SVG donut chart
        const size = 200;
        const strokeWidth = 30;
        const radius = (size - strokeWidth) / 2;
        const centerX = size / 2;
        const centerY = size / 2;
        
        let cumulativePercentage = 0;
        
        const segments = filteredData.map(([language, count]) => {
            const percentage = count / total;
            const startAngle = cumulativePercentage * 2 * Math.PI;
            const endAngle = (cumulativePercentage + percentage) * 2 * Math.PI;
            
            const startX = centerX + radius * Math.cos(startAngle - Math.PI / 2);
            const startY = centerY + radius * Math.sin(startAngle - Math.PI / 2);
            const endX = centerX + radius * Math.cos(endAngle - Math.PI / 2);
            const endY = centerY + radius * Math.sin(endAngle - Math.PI / 2);
            
            const largeArcFlag = percentage > 0.5 ? 1 : 0;
            
            const pathData = `
                M ${centerX} ${centerY}
                L ${startX} ${startY}
                A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY}
                Z
            `;
            
            cumulativePercentage += percentage;
            
            return {
                language,
                count,
                percentage: (percentage * 100).toFixed(1),
                pathData,
                color: this.getLanguageColor(language)
            };
        });
        
        const html = `
            <div class="donut-chart-container">
                <svg width="${size}" height="${size}" class="donut-chart">
                    ${segments.map((segment, index) => `
                        <path
                            d="${segment.pathData}"
                            fill="${segment.color}"
                            stroke="var(--bg-primary)"
                            stroke-width="2"
                            class="donut-segment"
                            data-language="${segment.language}"
                            data-count="${segment.count}"
                            data-percentage="${segment.percentage}"
                        />
                    `).join('')}
                    <circle
                        cx="${centerX}"
                        cy="${centerY}"
                        r="${radius - strokeWidth}"
                        fill="var(--bg-primary)"
                    />
                </svg>
                <div class="donut-center">
                    <div class="donut-total">${total}</div>
                    <div class="donut-label">Languages</div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add hover interactions
        const segments_elements = container.querySelectorAll('.donut-segment');
        const centerLabel = container.querySelector('.donut-label');
        const centerTotal = container.querySelector('.donut-total');
        
        segments_elements.forEach(element => {
            element.addEventListener('mouseenter', (e) => {
                const language = element.dataset.language;
                const count = element.dataset.count;
                const percentage = element.dataset.percentage;
                
                centerLabel.textContent = language;
                centerTotal.textContent = `${count} (${percentage}%)`;
                
                // Highlight corresponding elements
                segments_elements.forEach(el => {
                    if (el.dataset.language === language) {
                        el.classList.add('highlighted');
                    } else {
                        el.classList.add('dimmed');
                    }
                });
            });
            
            element.addEventListener('mouseleave', () => {
                centerLabel.textContent = 'Languages';
                centerTotal.textContent = total;
                
                segments_elements.forEach(el => {
                    el.classList.remove('highlighted', 'dimmed');
                });
            });
            
            // Click to filter
            element.addEventListener('click', () => {
                const language = element.dataset.language;
                this.filters.language = language;
                document.getElementById('language-filter').value = language;
                this.applyFilters();
            });
        });
    }

    renderCategoryCards(containerId, data) {
        const container = document.getElementById(containerId);
        if (!data || Object.keys(data).length === 0) {
            container.innerHTML = '<p>No category data available</p>';
            return;
        }

        // Filter out programming languages from categories
        const programmingLanguages = new Set([
            'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'C#', 
            'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'HTML', 
            'CSS', 'Shell', 'Dockerfile', 'Vue', 'Unknown'
        ]);
        
        const categoryData = Object.entries(data)
            .filter(([category]) => !programmingLanguages.has(category))
            .sort((a, b) => b[1] - a[1]);
        
        const maxCount = Math.max(...categoryData.map(([, count]) => count));
        const minCount = Math.min(...categoryData.map(([, count]) => count));
        
        const categoryIcons = {
            'Web Frameworks': '🌐',
            'CLI Tools': '⌨️',
            'DevOps': '🚀',
            'AI/ML': '🤖',
            'Learning Resources': '📚',
            'Awesome Lists': '📋',
            'Databases': '🗄️',
            'Developer Tools': '🔧',
            'Libraries': '📦',
            'Templates': '📄',
            'Security': '🔒',
            'Testing': '🧪',
            'Uncategorized': '📁'
        };
        
        const html = `
            <div class="word-cloud">
                ${categoryData.map(([category, count]) => {
                    // Calculate font size based on count (between 0.7em and 1.4em for better fit)
                    const fontSizeRatio = maxCount > minCount ? (count - minCount) / (maxCount - minCount) : 0;
                    const fontSize = 0.7 + (fontSizeRatio * 0.7);
                    
                    // Calculate opacity based on count
                    const opacity = 0.7 + (fontSizeRatio * 0.3);
                    
                    return `
                        <span class="word-cloud-item" 
                              data-category="${category}"
                              style="font-size: ${fontSize}em; opacity: ${opacity};"
                              title="${category}: ${count} repositories">
                            <span class="word-text">${category}</span>
                            <span class="word-count">(${count})</span>
                        </span>
                    `;
                }).join('')}
            </div>
        `;
        
        container.innerHTML = html;
        
        // Add click interactions
        const words = container.querySelectorAll('.word-cloud-item');
        words.forEach(word => {
            word.addEventListener('click', () => {
                const category = word.dataset.category;
                this.filters.category = category;
                document.getElementById('category-filter').value = category;
                this.applyFilters();
                
                // Visual feedback
                words.forEach(w => w.classList.remove('selected'));
                word.classList.add('selected');
            });
            
            word.addEventListener('mouseenter', () => {
                word.classList.add('hovered');
            });
            
            word.addEventListener('mouseleave', () => {
                word.classList.remove('hovered');
            });
        });
    }

    applyFilters() {
        this.filteredRepositories = this.repositories.filter(repo => {
            const matchesSearch = !this.filters.search || 
                repo.name.toLowerCase().includes(this.filters.search) ||
                (repo.description && repo.description.toLowerCase().includes(this.filters.search));

            const matchesCategory = !this.filters.category || 
                (repo.categories && repo.categories.includes(this.filters.category));

            const matchesLanguage = !this.filters.language || 
                repo.language === this.filters.language;

            return matchesSearch && matchesCategory && matchesLanguage;
        });

        this.sortRepositories();
        this.renderRepositories();
    }

    sortRepositories() {
        this.filteredRepositories.sort((a, b) => {
            switch (this.filters.sort) {
                case 'stars':
                    return (b.stars || 0) - (a.stars || 0);
                case 'updated':
                    return new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0);
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });
    }

    renderDashboard() {
        this.renderRepositories();
    }

    renderRepositories() {
        const container = document.getElementById('repositories');
        
        if (this.filteredRepositories.length === 0) {
            container.innerHTML = '<div class="no-results">No repositories found matching your criteria.</div>';
            return;
        }

        const html = this.filteredRepositories.map(repo => this.renderRepositoryCard(repo)).join('');
        container.innerHTML = html;
    }

    renderRepositoryCard(repo) {
        const stars = repo.stars ? repo.stars.toLocaleString() : '0';
        const language = repo.language || 'Unknown';
        const description = repo.description || 'No description available';
        const categories = repo.categories || [];
        const lastUpdated = repo.lastUpdated ? this.formatDate(repo.lastUpdated) : 'Unknown';

        const categoriesHtml = categories.map(category => 
            `<span class="category-tag">${category}</span>`
        ).join('');

        return `
            <a href="${repo.url}" target="_blank" class="repo-card">
                <div class="repo-header">
                    <h3 class="repo-name">${repo.name}</h3>
                    <div class="repo-stars">
                        <span>⭐</span>
                        <span>${stars}</span>
                    </div>
                </div>
                <p class="repo-description">${description}</p>
                <div class="repo-footer">
                    <div class="repo-language">
                        <span class="language-dot" style="background-color: ${this.getLanguageColor(language)}"></span>
                        <span>${language}</span>
                    </div>
                    <div class="repo-categories">
                        ${categoriesHtml}
                    </div>
                    <div class="repo-updated">Updated ${lastUpdated}</div>
                </div>
            </a>
        `;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }

    getLanguageColor(language) {
        const colors = {
            'JavaScript': '#f1e05a',
            'TypeScript': '#2b7489',
            'Python': '#3572A5',
            'Java': '#b07219',
            'C++': '#f34b7d',
            'C': '#555555',
            'C#': '#239120',
            'Go': '#00ADD8',
            'Rust': '#dea584',
            'Ruby': '#701516',
            'PHP': '#4F5D95',
            'Swift': '#ffac45',
            'Kotlin': '#F18E33',
            'Dart': '#00B4AB',
            'HTML': '#e34c26',
            'CSS': '#563d7c',
            'Vue': '#2c3e50',
            'Shell': '#89e051',
            'Dockerfile': '#384d54'
        };
        return colors[language] || '#8b949e';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError() {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('error').style.display = 'block';
    }
}

// Categorization logic for repositories
class RepositoryCategorizer {
    static categorize(repo) {
        const categories = [];
        const name = repo.name.toLowerCase();
        const description = (repo.description || '').toLowerCase();
        const topics = repo.topics || [];
        const language = repo.language || '';

        // Web Frameworks
        if (this.matchesKeywords(name, description, topics, [
            'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby',
            'framework', 'frontend', 'ui-library'
        ])) {
            categories.push('Web Frameworks');
        }

        // CLI Tools
        if (this.matchesKeywords(name, description, topics, [
            'cli', 'command-line', 'terminal', 'console', 'tool'
        ]) || name.includes('cli')) {
            categories.push('CLI Tools');
        }

        // DevOps
        if (this.matchesKeywords(name, description, topics, [
            'docker', 'kubernetes', 'k8s', 'ci/cd', 'deployment', 'devops',
            'infrastructure', 'monitoring', 'logging'
        ])) {
            categories.push('DevOps');
        }

        // Learning Resources
        if (this.matchesKeywords(name, description, topics, [
            'tutorial', 'learning', 'course', 'guide', 'examples', 'demo',
            'workshop', 'training', 'book'
        ])) {
            categories.push('Learning Resources');
        }

        // Awesome Lists
        if (name.startsWith('awesome-') || description.includes('curated list')) {
            categories.push('Awesome Lists');
        }

        // Databases
        if (this.matchesKeywords(name, description, topics, [
            'database', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql',
            'redis', 'elasticsearch'
        ])) {
            categories.push('Databases');
        }

        // AI/ML
        if (this.matchesKeywords(name, description, topics, [
            'machine-learning', 'artificial-intelligence', 'neural-network',
            'deep-learning', 'tensorflow', 'pytorch', 'scikit-learn', 'keras',
            'huggingface', 'transformers', 'llm', 'nlp', 'computer-vision'
        ]) || this.matchesWordBoundary(name, description, topics, ['ai', 'ml'])) {
            categories.push('AI/ML');
        }

        // Developer Tools
        if (this.matchesKeywords(name, description, topics, [
            'editor', 'vscode', 'extension', 'productivity', 'developer-tools',
            'development', 'debugging', 'testing'
        ])) {
            categories.push('Developer Tools');
        }

        // Libraries
        if (this.matchesKeywords(name, description, topics, [
            'library', 'utility', 'helper', 'package', 'module'
        ])) {
            categories.push('Libraries');
        }

        // Templates
        if (this.matchesKeywords(name, description, topics, [
            'template', 'boilerplate', 'starter', 'scaffold', 'generator'
        ])) {
            categories.push('Templates');
        }

        // Security
        if (this.matchesKeywords(name, description, topics, [
            'security', 'auth', 'authentication', 'authorization', 'crypto',
            'encryption', 'oauth', 'jwt', 'ssl', 'tls'
        ])) {
            categories.push('Security');
        }

        // Testing
        if (this.matchesKeywords(name, description, topics, [
            'test', 'testing', 'jest', 'mocha', 'cypress', 'selenium',
            'unit-test', 'e2e', 'integration-test'
        ])) {
            categories.push('Testing');
        }

        // Interview & Algorithms
        if (this.matchesKeywords(name, description, topics, [
            'interview', 'interview-prep', 'interview-preparation', 'coding-interview',
            'coding-interviews', 'algorithm', 'algorithms', 'data-structures',
            'computer-science', 'programming-interviews', 'study-plan', 'leetcode',
            'competitive-programming'
        ])) {
            categories.push('Interview & Algorithms');
        }

        // Data & Analytics
        if (this.matchesKeywords(name, description, topics, [
            'analytics', 'data-science', 'data-analysis', 'data-visualization',
            'visualization', 'observability', 'mlops', 'dashboard', 'charts'
        ])) {
            categories.push('Data & Analytics');
        }

        // IoT & Hardware
        if (this.matchesKeywords(name, description, topics, [
            'iot', 'internet-of-things', 'raspberry-pi', 'arduino', 'home-automation',
            'mqtt', 'embedded', 'hardware', 'smart-home'
        ])) {
            categories.push('IoT & Hardware');
        }

        // Infrastructure & Cloud
        if (this.matchesKeywords(name, description, topics, [
            'aws', 'gcp', 'azure', 'cloud', 'infrastructure-as-code', 'terraform',
            'cloudformation', 'networking', 'network', 'dns', 'certificate',
            'cost-optimization'
        ])) {
            categories.push('Infrastructure & Cloud');
        }

        // Don't use programming languages as categories anymore
        // Languages are handled separately in analytics

        return categories.length > 0 ? categories : ['Uncategorized'];
    }

    static matchesKeywords(name, description, topics, keywords) {
        const text = `${name} ${description} ${topics.join(' ')}`.toLowerCase();
        return keywords.some(keyword => text.includes(keyword));
    }

    static matchesWordBoundary(name, description, topics, keywords) {
        const text = `${name} ${description} ${topics.join(' ')}`.toLowerCase();
        return keywords.some(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'i');
            return regex.test(text);
        });
    }
}

// CSS for charts
const chartStyles = `
    .chart-bar {
        margin-bottom: 0.5rem;
    }
    
    .chart-label {
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-bottom: 0.25rem;
    }
    
    .chart-bar-container {
        position: relative;
        background: var(--bg-primary);
        border-radius: 4px;
        height: 24px;
        display: flex;
        align-items: center;
    }
    
    .chart-bar-fill {
        background: var(--accent-color);
        height: 100%;
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    
    .chart-value {
        position: absolute;
        right: 0.5rem;
        font-size: 0.75rem;
        color: var(--text-secondary);
        font-weight: 600;
    }
    
    .no-results {
        text-align: center;
        padding: 4rem;
        color: var(--text-secondary);
        font-size: 1.125rem;
    }
`;

// Add chart styles to the page
const style = document.createElement('style');
style.textContent = chartStyles;
document.head.appendChild(style);

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new StarsDashboard();
});