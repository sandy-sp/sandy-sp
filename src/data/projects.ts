export interface Project {
  id: string;
  title: string;
  /** One line for index rows. */
  summary: string;
  /** Short type label shown in mono (PyPI, App, CLI...). */
  kind: string;
  category: "AI & LLM" | "Developer Tools" | "Data & Analytics";
  description: string;
  /** What it does, in concrete terms. */
  features: string[];
  /** Why it is built the way it is. */
  notes?: string;
  technologies: string[];
  githubUrl: string;
  packageUrl?: string;
  installCommand?: string;
  featured: boolean;
}

export const PROJECTS: Project[] = [
  {
    id: "gittxt",
    title: "Gittxt",
    summary: "Turns a Git repository into clean, token-aware LLM context.",
    kind: "PyPI",
    category: "AI & LLM",
    description:
      "A command-line tool that pulls the text files out of a repository, filters out noise, and packs what's left into a structure an LLM can actually use. I built it because pasting a codebase into a chat window by hand was slow and lossy.",
    features: [
      "Filters by file type, size and a .gittxtignore file, so binaries and vendored code stay out",
      "Packs context to cut token count by up to 80% while keeping the repository's structure readable",
      "Runs as a CLI, a FastAPI service or a Streamlit app, with zip export",
    ],
    notes:
      "Caches fetched repositories locally so repeated runs are fast and work offline. Output is token-counted so you know whether it fits a model's context window before you send it.",
    technologies: ["Python", "AsyncIO", "FastAPI", "Streamlit", "Docker"],
    githubUrl: "https://github.com/sandy-sp/gittxt",
    packageUrl: "https://pypi.org/project/gittxt/",
    installCommand: "pip install gittxt",
    featured: true,
  },
  {
    id: "ollama-scout",
    title: "ollama-scout",
    summary: "Reads your hardware and tells you which local models will run.",
    kind: "PyPI",
    category: "AI & LLM",
    description:
      "A CLI that scans GPU VRAM, CPU and system RAM, then recommends Ollama models that fit, grouped by what you want to do: coding, chat, reasoning or vision. It saves the trial-and-error of pulling a 30GB model only to watch it run out of memory.",
    features: [
      "Detects NVIDIA, AMD and Apple Silicon memory, including unified memory",
      "Sizes recommendations by quantization and use case",
      "Guided interactive mode for beginners, plain flags for scripting",
    ],
    notes: "Recommendations come from the memory the machine actually has, not from a model's advertised size.",
    technologies: ["Python", "Ollama", "CLI", "Hardware telemetry"],
    githubUrl: "https://github.com/sandy-sp/ollama-scout",
    packageUrl: "https://pypi.org/project/ollama-scout/",
    installCommand: "pipx install ollama-scout",
    featured: true,
  },
  {
    id: "audionomy",
    title: "Audionomy",
    summary: "Curate, inspect and export audio datasets for speech models.",
    kind: "App",
    category: "Data & Analytics",
    description:
      "A dataset manager for people training speech models. Load recordings, look at waveforms and mel spectrograms, fix metadata, normalize and chunk audio, then export in formats Hugging Face and PyTorch read directly.",
    features: [
      "Waveform and mel-spectrogram views for spotting clipping, silence and noise",
      "Batch normalization, chunking and metadata editing",
      "Exports compatible with Hugging Face datasets and PyTorch loaders",
    ],
    notes: "Signal processing runs in a Python backend (Librosa); the React front end stays responsive on large batches.",
    technologies: ["Python", "FastAPI", "Librosa", "React", "Docker"],
    githubUrl: "https://github.com/sandy-sp/audionomy",
    featured: true,
  },
  {
    id: "chat-audit",
    title: "ChatAudit",
    summary: "Rebuilds and scores your exported ChatGPT history, locally.",
    kind: "Tool",
    category: "AI & LLM",
    description:
      "ChatGPT exports store conversations as branching trees that are hard to read. ChatAudit reconstructs the active thread of each conversation, scores how worth keeping it is, and produces a cleanup report. Nothing leaves your machine.",
    features: [
      "Reconstructs the active path through branched conversations",
      "Classifies chats as keep, archive or safe to delete",
      "Local-only processing with no telemetry",
    ],
    technologies: ["Python", "FastAPI", "JSON"],
    githubUrl: "https://github.com/sandy-sp/ChatAudit",
    featured: true,
  },
  {
    id: "linkedin-post-studio",
    title: "LinkedIn Post Studio",
    summary: "Converts Markdown drafts into LinkedIn-safe formatted posts.",
    kind: "Web app",
    category: "Developer Tools",
    description:
      "LinkedIn strips Markdown, so pasted drafts lose their formatting. This studio converts bold, italic, code and lists into Unicode equivalents and previews the post as it will appear on desktop and mobile, including where the “see more” cut falls.",
    features: [
      "Markdown to Unicode conversion for bold, italic, code and bullets",
      "Desktop and mobile feed previews with the fold marked",
      "Live character, hashtag and mention counts",
    ],
    technologies: ["TypeScript", "React", "Next.js", "Tailwind CSS"],
    githubUrl: "https://github.com/sandy-sp/linkedin-post-studio",
    featured: true,
  },
  {
    id: "ytgrid",
    title: "YTGrid",
    summary: "Queue-driven YouTube playback automation with a CLI and REST API.",
    kind: "Service",
    category: "Developer Tools",
    description:
      "An automation service that runs headless browser playback sessions from a task queue, with the same controls exposed through a CLI and a REST API. Status streams over WebSockets.",
    features: [
      "Celery and Redis task queue for concurrent sessions",
      "Health checks and automatic recovery for stalled sessions",
      "OpenAPI docs and a WebSocket status feed",
    ],
    technologies: ["Python", "FastAPI", "Celery", "Redis", "Selenium", "Docker"],
    githubUrl: "https://github.com/sandy-sp/ytgrid",
    featured: false,
  },
  {
    id: "metadata-cleaner",
    title: "Metadata Cleaner",
    summary: "Strips hidden metadata from images, documents, audio and video.",
    kind: "CLI",
    category: "Developer Tools",
    description:
      "A CLI for inspecting and removing metadata before files are shared or used as training data: GPS coordinates, camera serials, author names and editing history.",
    features: [
      "Images (JPG, PNG, WEBP), documents (PDF, DOCX), audio and MP4/MKV video",
      "Recursive batch processing of folders",
      "Inspect mode to see what would be removed first",
    ],
    technologies: ["Python", "CLI"],
    githubUrl: "https://github.com/sandy-sp/metadata-cleaner",
    featured: false,
  },
  {
    id: "ai-reply-index",
    title: "AI Reply Index",
    summary: "A versioned record of prompts and how different models answered.",
    kind: "Repo",
    category: "AI & LLM",
    description:
      "A repository format for logging prompts, system instructions and settings alongside model responses, so changes in behavior across model releases can be compared over time.",
    features: [
      "A consistent schema for prompts, parameters and responses",
      "Side-by-side comparisons across GPT, Claude and Gemini releases",
      "Plain Markdown, versioned with Git",
    ],
    technologies: ["Python", "Markdown", "Git"],
    githubUrl: "https://github.com/sandy-sp/ai-reply-index",
    featured: false,
  },
  {
    id: "art-of-data-analysis",
    title: "Art of Data Analysis",
    summary: "Interactive dashboards on live earthquake and weather data.",
    kind: "Dashboards",
    category: "Data & Analytics",
    description:
      "A set of Streamlit dashboards built on live USGS earthquake and Open-Meteo weather feeds, written to practice turning raw public APIs into readable visual stories.",
    features: [
      "Global seismic event maps from the USGS feed",
      "Weather comparisons and anomaly views from Open-Meteo",
      "Time-series filters on Pandas and GeoPandas pipelines",
    ],
    technologies: ["Python", "Streamlit", "Plotly", "GeoPandas", "Folium"],
    githubUrl: "https://github.com/sandy-sp/art-of-data-analysis",
    featured: false,
  },
];

export function getProject(id: string) {
  return PROJECTS.find((p) => p.id === id);
}
