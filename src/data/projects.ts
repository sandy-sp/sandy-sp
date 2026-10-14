export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  category: "AI & LLM" | "Developer Tools" | "Data & Analytics";
  technologies: string[];
  features: string[];
  githubUrl: string;
  demoUrl?: string;
  installCommand?: string;
  badge?: string;
  featured: boolean;
  architectureNotes?: string;
}

export const PROJECTS: Project[] = [
  {
    id: "gittxt",
    title: "Gittxt",
    tagline: "AI-Ready Git Repository Extractor & Token Optimizer",
    description:
      "A published PyPI CLI utility designed to fetch, parse, and structure text-based files from Git repositories, optimizing them for seamless, high-density ingestion into LLM context windows (Claude 3.5 Sonnet, GPT-4o, Gemini).",
    category: "AI & LLM",
    technologies: ["Python", "AsyncIO", "FastAPI", "Streamlit", "PyPI", "Docker", "LLM Context"],
    features: [
      "Repository-to-prompt packing with smart AST/file filtering and .gittxtignore support",
      "Compresses repository contexts by up to 80% while retaining structural semantics",
      "FastAPI and Streamlit plugin architecture for flexible deployment and dataset delivery",
    ],
    githubUrl: "https://github.com/sandy-sp/gittxt",
    demoUrl: "https://pypi.org/project/gittxt/",
    installCommand: "pip install gittxt",
    badge: "PyPI Package",
    featured: true,
    architectureNotes: "Published on PyPI. Supports offline caching, zip exports, and token-aware context window structuring.",
  },
  {
    id: "ollama-scout",
    title: "ollama-scout",
    tagline: "Hardware-Aware Local LLM Recommender & Hardware Benchmarker",
    description:
      "A Python CLI tool that scans your local GPU VRAM, CPU architecture, and system RAM, then recommends perfectly sized Ollama models grouped by practical use cases, complete with interactive guided selection.",
    category: "AI & LLM",
    technologies: ["Python", "Ollama", "Hardware Telemetry", "CLI", "PyPI", "PyTorch"],
    features: [
      "Sub-second scanning of NVIDIA/Apple Silicon/AMD GPU memory and unified RAM",
      "Context-aware model sizing: coding, chat, reasoning, and vision capabilities",
      "Dual mode: beginner-friendly interactive terminal wizard and power-user CLI flags",
    ],
    githubUrl: "https://github.com/sandy-sp/ollama-scout",
    demoUrl: "https://pypi.org/project/ollama-scout/",
    installCommand: "pipx install ollama-scout",
    badge: "PyPI Package",
    featured: true,
    architectureNotes: "Automates local LLM deployment decisions based on real hardware constraints, preventing Out-Of-Memory kernel panics.",
  },
  {
    id: "audionomy",
    title: "Audionomy",
    tagline: "Autonomous Audio Dataset Management & Spectral Visualization Engine",
    description:
      "An end-to-end dataset curation and visualization platform built specifically for AI speech researchers and machine learning developers to manage, inspect, annotate, and export audio training datasets.",
    category: "Data & Analytics",
    technologies: ["Python", "FastAPI", "Librosa", "Audio ML", "React", "Docker", "Spectral Analysis"],
    features: [
      "Real-time spectral analysis, Mel-spectrogram rendering, and acoustic waveform inspection",
      "Automated audio normalization, dynamic chunking, and metadata curation pipelines",
      "Seamless dataset batch export formats compatible with Hugging Face and PyTorch",
    ],
    githubUrl: "https://github.com/sandy-sp/audionomy",
    badge: "Dataset Engineering",
    featured: true,
    architectureNotes: "Bridges audio signal processing algorithms with modern web UI to simplify high-volume speech AI dataset preparation.",
  },
  {
    id: "linkedin-post-studio",
    title: "LinkedIn Post Studio",
    tagline: "AI-Draft to LinkedIn-Safe Formatting & Unicode Publishing Studio",
    description:
      "A specialized writing studio that bridges AI-generated Markdown drafts with LinkedIn's strict plain-text engine. Converts Markdown into LinkedIn-safe Unicode typography with real-time desktop & mobile feed previews.",
    category: "Developer Tools",
    technologies: ["TypeScript", "React", "Next.js", "Unicode Parsing", "Tailwind CSS", "UI/UX"],
    features: [
      "Smart Markdown paste parsing: handles bold, italic, code, and bullet styles via Unicode glyphs",
      "Accurate LinkedIn desktop & mobile post collapse preview (detects '...see more' cutoff)",
      "Real-time character, word, hashtag, and mention compliance telemetry",
    ],
    githubUrl: "https://github.com/sandy-sp/linkedin-post-studio",
    badge: "Content Tooling",
    featured: false,
    architectureNotes: "Eliminates broken Markdown syntax when pasting AI outputs into social networks.",
  },
  {
    id: "ytgrid",
    title: "YTGrid",
    tagline: "Scalable Hybrid CLI + REST API YouTube Automation Engine",
    description:
      "A containerized automation platform delivering programmatic streaming playback control, continuous telemetry tracking, and task queue orchestration through a unified dual CLI and REST API architecture.",
    category: "Developer Tools",
    technologies: ["Python", "FastAPI", "Celery", "Selenium", "Redis", "Docker", "WebSockets"],
    features: [
      "Containerized microservice architecture ready for single-node or Docker cluster deployment",
      "Real-time stream health monitoring, auto-recovery loops, and automated session queues",
      "Full OpenAPI / Swagger interactive control documentation with WebSocket status feeds",
    ],
    githubUrl: "https://github.com/sandy-sp/ytgrid",
    badge: "Docker Ready",
    featured: false,
    architectureNotes: "Engineered with Celery and Redis to reliably execute concurrent headless video automation workloads.",
  },
  {
    id: "chat-audit",
    title: "ChatAudit",
    tagline: "Local-First ChatGPT Export Tree Reconstructor & Privacy Analyzer",
    description:
      "A privacy-focused analyzer for exported ChatGPT conversations. Reconstructs complex branched message tree hierarchies, scores conversation retention value, and generates actionable cleanup reports without uploading data.",
    category: "AI & LLM",
    technologies: ["Python", "FastAPI", "JSON Processing", "Data Privacy", "Local-First Architecture"],
    features: [
      "Reconstructs active threads across complex non-linear conversation branch mappings",
      "Algorithmic value scoring: classifies chats into keep, archive, or safe-to-delete",
      "Zero-telemetry design guarantees 100% data privacy with strictly local processing",
    ],
    githubUrl: "https://github.com/sandy-sp/ChatAudit",
    badge: "Privacy & Governance",
    featured: false,
    architectureNotes: "Solves enterprise data retention and personal data hygiene challenges for heavy LLM users.",
  },
  {
    id: "metadata-cleaner",
    title: "Metadata Cleaner",
    tagline: "Multi-Format Privacy & EXIF Forensics Scrubbing CLI",
    description:
      "A cross-platform security utility designed to inspect, edit, and recursively sanitize hidden metadata across images (JPG, PNG, WEBP), documents (PDF, DOCX), audio, and video containers before downstream ingestion.",
    category: "Developer Tools",
    technologies: ["Python", "Security", "EXIF Forensics", "CLI Architecture", "Data Governance"],
    features: [
      "Deep recursive scrubbing of GPS coordinates, camera hardware serials, and author signatures",
      "Comprehensive format support across documents, images, audio, and MP4/MKV video files",
      "Zero data leak guarantee with localized file stream handling and batch processing",
    ],
    githubUrl: "https://github.com/sandy-sp/metadata-cleaner",
    badge: "Security & Compliance",
    featured: false,
    architectureNotes: "Critical utility for data compliance and sanitizing sensitive datasets before fine-tuning or public release.",
  },
  {
    id: "ai-reply-index",
    title: "AI Reply Index & Benchmarks",
    tagline: "Prompt Versioning, Model Evaluation & Hallucination Benchmark Catalog",
    description:
      "A community-driven, version-controlled repository framework designed to log, categorize, and systematically evaluate AI prompts and model response variance across GPT-4, Claude, and Gemini releases.",
    category: "AI & LLM",
    technologies: ["Python", "Prompt Engineering", "Evaluation Frameworks", "GitOps", "Markdown"],
    features: [
      "Standardized schema for tracking prompt iterations, system instructions, and temperature tuning",
      "Comparative output evaluations to quantify hallucination frequency and signal fidelity",
      "Zero-overhead open-source repository design with clean markdown taxonomy",
    ],
    githubUrl: "https://github.com/sandy-sp/ai-reply-index",
    badge: "Evaluation Framework",
    featured: false,
    architectureNotes: "Provides a reproducible benchmark record for prompt optimization and model regression testing.",
  },
  {
    id: "art-of-data-analysis",
    title: "Art of Data Analysis",
    tagline: "Geospatial Seismic Visualizer & Meteorological Telemetry Dashboards",
    description:
      "An open-source codebase rendering high-density geospatial and environmental datasets into narrative-driven, interactive dashboards using live USGS and Open-Meteo telemetry feeds.",
    category: "Data & Analytics",
    technologies: ["Python", "Streamlit", "Plotly", "GeoPandas", "Folium", "Open-Meteo API", "Pandas"],
    features: [
      "Real-time ingestion and choropleth mapping of global USGS seismic events",
      "Meteorological atmospheric differential plots and severe weather anomaly detection",
      "Interactive time-series filters with high-performance Pandas and GeoPandas pipelines",
    ],
    githubUrl: "https://github.com/sandy-sp/art-of-data-analysis",
    badge: "Geospatial Telemetry",
    featured: false,
    architectureNotes: "Demonstrates advanced data visualization capabilities turning raw geospatial APIs into executive-ready dashboards.",
  },
];
