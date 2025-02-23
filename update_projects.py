import requests
import os

# GitHub username and token (token provided by GitHub Actions)
USERNAME = "sandy-sp"  # Replace with your GitHub username
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# API headers for authentication
headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

# Fetch all repositories
try:
    repos_response = requests.get(f"https://api.github.com/users/{USERNAME}/repos", headers=headers)
    repos_response.raise_for_status()
    repos = repos_response.json()
except requests.RequestException as e:
    print(f"Error fetching repositories: {e}")
    repos = []

# Generate the projects list in Markdown
projects_list = "## Projects\n"
for repo in repos:
    name = repo["name"]
    description = repo["description"] or "No description provided"
    url = repo["html_url"]
    projects_list += f"- **[{name}]({url})**: {description}\n"

# Update README.md
with open("README.md", "r") as file:
    content = file.read()

# Replace the projects section between markers
start_marker = "## Projects\n"
end_marker = "\n\n"  # Assumes projects section ends with double newline
start_idx = content.find(start_marker)
end_idx = content.find(end_marker, start_idx + len(start_marker)) if start_idx != -1 else -1

if start_idx != -1 and end_idx != -1:
    updated_content = content[:start_idx] + projects_list + content[end_idx:]
else:
    # If no projects section exists, append it
    updated_content = content + "\n" + projects_list

with open("README.md", "w") as file:
    file.write(updated_content)

print("Projects section updated successfully!")