<div align="center">
  <img src="assets/parsecio_dark.png" alt="Parsecio" width="200" height="auto">
  
  **A modern, self-updating dashboard for your GitHub starred repositories**
  
  [![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://parsecio.com)
  [![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-Automated-blue)](https://github.com/ejacobhayes/parsecio/actions)
  [![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

  [🌟 **Website**](https://parsecio.com) | [📚 **Documentation**](#-features) | [🚀 **Quick Start**](#-quick-start)
</div>

---

## ✨ Features

### 🎯 **Smart Organization**
- **Automatic categorization** of repositories based on topics, languages, and keywords
- **10+ predefined categories**: Web Frameworks, CLI Tools, DevOps, AI/ML, and more
- **Real-time filtering** by category, language, and star count
- **Full-text search** across repository names and descriptions

### 🎨 **Beautiful Design**
- **Dark mode by default** with optional light mode toggle
- **GitHub-inspired** modern, clean interface
- **Fully responsive** design that works on all devices
- **Smooth animations** and hover effects
- **Grid and list view** options

### 📊 **Insightful Analytics**
- **Language distribution** charts showing your tech stack preferences
- **Category breakdown** of your starred repositories
- **Repository statistics** including total stars, languages, and categories
- **Visual charts** built with vanilla JavaScript (no external dependencies)

### 🤖 **Zero Maintenance**
- **Automatic weekly updates** via GitHub Actions
- **Self-hosted** on GitHub Pages with custom domain support
- **No backend required** - completely static site
- **Zero external dependencies** - everything is self-contained

---

## 🚀 Quick Start

### 1. Fork This Repository
Click the "Fork" button in the top right corner of this repository.

### 2. Enable GitHub Pages
1. Go to your forked repository's **Settings** tab
2. Navigate to **Pages** section
3. Select **Deploy from a branch** → **main** → **/ (root)**
4. Your dashboard will be available at `https://yourusername.github.io/parsecio`

### 3. Configure Custom Domain (Optional)
1. Update the `CNAME` file with your domain name
2. Configure DNS A records to point to GitHub Pages IPs:
   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

### 4. Customize (Optional)
- Replace `assets/parsecio.png` and `assets/parsecio_icon.png` with your own branding
- Update the footer link in `index.html`
- Modify categories in `script.js` to match your preferences

---

## 📁 Project Structure

```
parsecio/
├── index.html              # Main dashboard page
├── styles.css              # Complete styling (dark/light modes)
├── script.js               # Dashboard logic and categorization
├── assets/
│   ├── parsecio.png        # Main logo
│   └── parsecio_icon.png   # Favicon
├── data/
│   └── starred.json        # Generated repository data
├── .github/
│   └── workflows/
│       └── update-stars.yml # Auto-update workflow
└── CNAME                   # Custom domain configuration
```

---

## 🔧 How It Works

### Automatic Data Collection
The GitHub Action runs weekly (every Sunday at 6 AM UTC) and:
1. **Fetches** all your starred repositories via GitHub API
2. **Analyzes** each repository's topics, language, and description
3. **Categorizes** repositories using intelligent keyword matching
4. **Generates** enriched JSON data with analytics
5. **Commits** the updated data back to the repository

### Smart Categorization
Repositories are automatically categorized based on:
- **Repository topics/tags** (e.g., `react`, `cli`, `machine-learning`)
- **Primary programming language** (JavaScript, Python, Go, etc.)
- **Description keywords** (framework, library, tool, etc.)
- **Naming patterns** (e.g., `awesome-*` → "Awesome Lists")

### Example Categories
- 🌐 **Web Frameworks** (React, Vue, Angular)
- 🛠️ **CLI Tools** (Command-line utilities)
- 🚀 **DevOps** (Docker, Kubernetes, CI/CD)
- 🤖 **AI/ML** (TensorFlow, PyTorch, ML projects)
- 📚 **Learning Resources** (Tutorials, courses, guides)
- 📋 **Awesome Lists** (Curated resource collections)
- 🗄️ **Databases** (SQL, NoSQL, data stores)
- 🔧 **Developer Tools** (Editors, productivity tools)

---

## 🎨 Customization

### Branding
Replace the logo files in the `assets/` folder:
- `parsecio.png` - Main logo (recommended: 200x200px)
- `parsecio_icon.png` - Favicon (recommended: 32x32px)

### Categories
Edit the categorization logic in `script.js`:
```javascript
// Add your own categories
if (this.matchesKeywords(name, description, topics, [
  'your-keyword', 'another-keyword'
])) {
  categories.push('Your Category');
}
```

### Styling
The entire design is controlled by CSS custom properties in `styles.css`:
```css
:root {
  --accent-color: #58a6ff;  /* Change accent color */
  --bg-primary: #0d1117;    /* Change background */
  /* ... more variables */
}
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Use **vanilla JavaScript** (no build process required)
- Follow **semantic HTML5** practices
- Ensure **mobile-first responsive design**
- Include **accessibility features** (ARIA labels, keyboard navigation)
- Test in both **dark and light modes**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🌟 Show Your Support

If you find Parsecio useful, please consider:
- ⭐ **Starring** this repository
- 🐛 **Reporting** any issues you encounter
- 💡 **Suggesting** new features or improvements
- 📢 **Sharing** with other developers

---

<div align="center">
  <p>Built with ❤️ by <a href="https://github.com/ejacobhayes">ejacobhayes</a></p>
  <p>Powered by <a href="https://pages.github.com/">GitHub Pages</a> and <a href="https://github.com/features/actions">GitHub Actions</a></p>
</div>