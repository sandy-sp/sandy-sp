<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=20&duration=2800&pause=1000&color=4ECDC4&center=true&vCenter=true&width=800&lines=Hey+there!+I'm+Sandeep+Paidipati+%F0%9F%91%8B;AI+Developer+%7C+Open-Source+Builder+%7C+LLM+Enthusiast" alt="Animated Header" />
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/sandeep-paidipati">
    <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="https://buymeacoffee.com/sandeep.paidipati">
    <img src="https://img.shields.io/badge/Buy_Me_A_Coffee-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black" alt="Buy Me Coffee">
  </a>
  <a href="https://github.com/sandy-sp?tab=repositories">
    <img src="https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fapi.github.com%2Fusers%2Fsandy-sp&query=%24.public_repos&label=Repositories&color=brightgreen&logo=github&style=for-the-badge" alt="Repositories">
  </a>
</p>

---

I'm an **AI-Driven Developer** passionate about building innovative solutions with **Generative AI** and **Large Language Models (LLMs)**. Originally a web designer, I've transitioned to AI development through self-directed learning and now focus on creating impactful open-source projects. I specialize in data visualization, real-world problem-solving, and collaboration on meaningful projects.

---

## 🚀 Featured Projects

<!-- Auto-updating Project Grid -->
<div align="center">
  <a href="https://github.com/sandy-sp/gittxt">
    <img src="https://github-readme-stats.vercel.app/api/pin/?username=sandy-sp&repo=gittxt&theme=dark&show_owner=true" alt="gittxt" width="49%">
  </a>
  <a href="https://github.com/sandy-sp/metadata-cleaner">
    <img src="https://github-readme-stats.vercel.app/api/pin/?username=sandy-sp&repo=metadata-cleaner&theme=dark&show_owner=true" alt="metadata-cleaner" width="49%">
  </a>
</div>

---

## 📊 GitHub Analytics

<div align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=sandy-sp&show_icons=true&theme=dark" alt="GitHub Stats" width="48%">
  <img src="https://github-readme-streak-stats.herokuapp.com/?user=sandy-sp&theme=dark" alt="GitHub Streak" width="50.5%">
  <img src = "https://github-readme-activity-graph.vercel.app/graph?username=sandy-sp&theme=merko"/>
</div>

---

## ✨ Visitor Counter

<p align="center">
  <img src="https://profile-counter.glitch.me/sandy-sp/count.svg" alt="Visitor Count">
  <br>
  <em>Thanks for visiting! If you find my work useful, consider supporting me with a coffee ☕</em>
</p>
<p align="center"> <a href="https://buymeacoffee.com/sandeep.paidipati"> <img src="https://img.shields.io/badge/Support_My_Work-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=black"> </a> </p>

---

## Skills
<p align="center">
  <img src="https://img.shields.io/badge/Open%20Source-F05032?style=flat-square&logo=git&logoColor=white" alt="Open Source">
  <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/LLMs-4ECDC4?style=flat-square&logo=data-science&logoColor=white" alt="LLMs">
  <img src="https://img.shields.io/badge/LLMs-4ECDC4?style=flat-square&logo=data-science&logoColor=white" alt="LLMs"> <img src="https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"> <img src="https://img.shields.io/badge/Open Source-F05032?style=flat-square&logo=git&logoColor=white" alt="Open Source">
</p>









<!-- Dynamic Skills from Repositories -->
<div align="center">
  <h3>Languages Across My Repositories</h3>
  <div id="skills-container"></div>
</div>

<script>
  // This script will fetch your repositories and extract languages
  async function loadSkills() {
    const username = "sandy-sp"; // Replace with your GitHub username
    const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`);
    const repos = await reposResponse.json();
    
    // Count languages across all repositories
    const languageCounts = {};
    for (const repo of repos) {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
    }

    // Create language badges
    const skillsContainer = document.getElementById("skills-container");
    skillsContainer.innerHTML = Object.entries(languageCounts)
      .sort(([,a], [,b]) => b - a) // Sort by count descending
      .map(([language, count]) => `
        <img src="https://img.shields.io/badge/${encodeURIComponent(language)}-${count}-blue?style=flat-square" alt="${language}">
      `)
      .join("");
  }

  // Load skills when page loads
  window.onload = loadSkills;
</script>


---

## 🛠️ Tech Stack

### 🤖 AI/ML
![PyTorch](https://img.shields.io/badge/PyTorch-EE4C2C?style=flat&logo=pytorch&logoColor=white)
![HuggingFace](https://img.shields.io/badge/HuggingFace-FFD21E?style=flat&logo=huggingface&logoColor=black)
![LangChain](https://img.shields.io/badge/LangChain-00A67D?style=flat&logo=langchain&logoColor=white)

### 💻 Development
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=flat&logo=fastapi&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat&logo=docker&logoColor=white)

### 🧰 Tools
![Git](https://img.shields.io/badge/Git-F05032?style=flat&logo=git&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat&logo=githubactions&logoColor=white)
![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat&logo=linux&logoColor=black)


