import requests
import os
import time
from collections import Counter

# GitHub username and token (token provided by GitHub Actions)
USERNAME = "sandy-sp"  # Replace with your GitHub username
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# API headers for authentication
headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/json"
}

# Fetch all repositories
repos_response = requests.get(f"https://api.github.com/users/{USERNAME}/repos", headers=headers)
repos = repos_response.json()

# Collect languages and topics
languages = []
topics = []
for repo in repos:
    if repo["language"]:
        languages.append(repo["language"])
    # Construct the topics URL
    topics_url = f"https://api.github.com/repos/{repo['owner']['login']}/{repo['name']}/topics"
    time.sleep(1)  # Delay to avoid rate limiting
    try:
        topics_response = requests.get(topics_url, headers=headers)
        topics_response.raise_for_status()  # Raise an exception for bad status codes
        topics.extend(topics_response.json()["names"])
    except requests.RequestException as e:
        print(f"Error fetching topics for {repo['name']}: {e}")
        continue

# Count languages and select most frequent ones (e.g., top 5)
language_counts = Counter(languages)
top_languages = [lang for lang, _ in language_counts.most_common(5)]

# Define a mapping of topics to skills (customize based on your repositories)
skill_mapping = {
    "machine-learning": "AI",
    "artificial-intelligence": "AI",
    "llm": "LLMs",
    "large-language-models": "LLMs",
    "data-visualization": "Data Visualization",
    "open-source": "Open Source",
    "web-development": "HTML5"
}
relevant_topics = set()
for topic in topics:
    if topic in skill_mapping:
        relevant_topics.add(skill_mapping[topic])

# Combine languages and topics into a skills list
skills = set(top_languages) | relevant_topics

# Define badge styles (color and logo per skill)
badge_configs = {
    "Python": {"color": "3776AB", "logo": "python"},
    "AI": {"color": "FF6F61", "logo": "artificial-intelligence"},
    "LLMs": {"color": "4ECDC4", "logo": "data-science"},
    "Data Visualization": {"color": "1F77B4", "logo": "tableau"},
    "Open Source": {"color": "F05032", "logo": "git"},
    "HTML5": {"color": "E34F26", "logo": "html5"},
    # Add more languages/topics as needed
    "JavaScript": {"color": "F7DF1E", "logo": "javascript"},
    "CSS": {"color": "1572B6", "logo": "css3"}
}

# Generate badges for each skill
badges = []
for skill in skills:
    config = badge_configs.get(skill, {"color": "gray", "logo": skill.lower()})  # Default for unmapped skills
    badge_url = f"https://img.shields.io/badge/{skill}-{config['color']}?style=flat-square&logo={config['logo']}&logoColor=white"
    badges.append(f'<img src="{badge_url}" alt="{skill}">')

# Create the new skills section
new_skills_section = (
    "## Skills\n"
    "<p align=\"center\">\n" +
    "  " + " ".join(badges) + "\n"
    "</p>\n"
)

# Update README.md
with open("README.md", "r") as file:
    content = file.read()

# Replace the skills section between markers
start_marker = "## Skills\n"
end_marker = "\n\n"  # Assumes skills section ends with double newline
start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx + len(start_marker)) if start_idx != -1 else -1

if start_idx != -1 and end_idx != -1:
    updated_content = content[:start_idx] + new_skills_section + content[end_idx:]
else:
    # If no skills section exists, append it
    updated_content = content + "\n" + new_skills_section

with open("README.md", "w") as file:
    file.write(updated_content)

print("Skills section updated successfully!")