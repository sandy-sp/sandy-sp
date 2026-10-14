export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  current?: boolean;
  type: "ai-enterprise" | "software-engineering" | "education";
  description: string;
  highlights: string[];
  skills: string[];
}

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: "orbisq",
    role: "AI Automation Engineer / AI Solutions Architect",
    company: "OrbisQ Inc",
    location: "Irving, TX (Remote)",
    period: "February 2026 – Present",
    current: true,
    type: "ai-enterprise",
    description:
      "Architecting enterprise-scale Generative AI solutions and autonomous multi-agent pipelines leveraging Azure OpenAI, AWS Bedrock, and advanced RAG architectures. Building high-throughput API microservices and automated MLOps pipelines.",
    highlights: [
      "Engineered production RAG pipelines with Pinecone vector databases and Azure OpenAI, achieving context-aware retrieval across enterprise datasets.",
      "Architected multi-agent automation frameworks using Python, LangChain, and LlamaIndex to coordinate complex workflows, reducing task latency by 35%.",
      "Built high-throughput RESTful APIs using Python and FastAPI, optimizing request/response concurrency for low-latency streaming user interactions.",
      "Implemented comprehensive MLOps practices using Docker and Kubernetes, integrating AI evaluation harnesses (Ragas, DeepEval) to catch hallucinations before release.",
    ],
    skills: ["Azure OpenAI", "AWS Bedrock", "LangChain", "LlamaIndex", "Pinecone", "FastAPI", "Docker", "Kubernetes", "Ragas", "DeepEval", "MLOps"],
  },
  {
    id: "magnifying-minds",
    role: "AI Solutions Architect & Technology Director",
    company: "Magnifying Minds",
    location: "Columbus, OH (Remote)",
    period: "December 2024 – January 2026",
    type: "ai-enterprise",
    description:
      "Directed the end-to-end design and deployment of custom AI automation infrastructure and knowledge retrieval systems, bridging organizational data with generative AI capabilities.",
    highlights: [
      "Architected and deployed a custom internal RAG knowledge base utilizing vector embeddings, improving technical data retrieval accuracy by 20%.",
      "Designed AI-driven content automation pipelines in Python with human-in-the-loop review guardrails, reducing administrative overhead by 30%.",
      "Orchestrated complex workflows by connecting n8n automation and direct messaging tools with third-party enterprise APIs.",
      "Scaled cloud AI infrastructure on Google Cloud Platform (GCP) ensuring seamless data orchestration and 99.9% system uptime.",
    ],
    skills: ["Python", "RAG", "Vector Databases", "GCP", "n8n Automation", "Human-in-the-loop", "API Orchestration", "Predictive Analytics"],
  },
  {
    id: "bright-mind",
    role: "AI Web Developer",
    company: "Bright Mind Enrichment & Schooling",
    location: "New York, NY (Remote)",
    period: "April 2025 – August 2025",
    type: "ai-enterprise",
    description:
      "Built production AI content generation pipelines and semantic search chatbots utilizing state-of-the-art multimodal models, reducing manual authoring effort while maintaining high factual fidelity.",
    highlights: [
      "Engineered an automated educational content pipeline integrating multimodal LLMs (Claude 3.5 Sonnet, GPT-4o), reducing content creation time by 50%.",
      "Reduced AI hallucination rates by 25% by implementing Chain-of-Thought (CoT) prompt engineering frameworks and strict schema validation layers.",
      "Built a semantic search chatbot for internal knowledge discovery by generating dense vector embeddings from unstructured documents.",
      "Developed high-performance RESTful APIs with Python and FastAPI to support real-time data ingestion and web interaction widgets.",
    ],
    skills: ["Claude 3.5 Sonnet", "GPT-4o", "Chain-of-Thought", "FastAPI", "Semantic Search", "Prompt Engineering", "Python", "Vector Embeddings"],
  },
  {
    id: "independent-ai",
    role: "Open Source Creator & Independent AI Specialist",
    company: "Independent Projects",
    location: "United States",
    period: "January 2023 – Present",
    current: true,
    type: "ai-enterprise",
    description:
      "Creating and maintaining published developer tools, local-first LLM utilities, and data curation platforms (Gittxt, Ollama Scout, Audionomy, ChatAudit, YTGrid).",
    highlights: [
      "Published Gittxt on PyPI: CLI tool converting repositories into token-optimized LLM context bundles with 80% token compression.",
      "Created Ollama Scout on PyPI: automated hardware scanner for GPU VRAM and RAM to recommend optimal local LLMs.",
      "Developed Audionomy: audio dataset management tool with spectral analysis and waveform visualization for speech AI researchers.",
      "Built ChatAudit and Metadata Cleaner: local-first privacy utilities for parsing conversation trees and scrubbing multimedia EXIF data.",
    ],
    skills: ["PyPI Packages", "FastAPI", "CLI Architecture", "Ollama", "Audio ML", "Streamlit", "Docker", "AsyncIO", "Privacy Engineering"],
  },
  {
    id: "masters-csu",
    role: "Master of Information Systems (MIS)",
    company: "Cleveland State University",
    location: "Cleveland, OH",
    period: "August 2022 – December 2024",
    type: "education",
    description:
      "Advanced graduate study in enterprise systems architecture, data governance, predictive analytics, and applied artificial intelligence. Awarded the prestigious Ahuja Endowment Scholarship.",
    highlights: [
      "Ahuja Endowment Scholarship Recipient for academic excellence in information systems.",
      "Conducted specialized applied research in machine learning, LLM context structuring, and enterprise systems scalability.",
      "Mastered data governance, enterprise cloud architectures, and database management principles.",
    ],
    skills: ["Systems Architecture", "Enterprise Information Systems", "Data Governance", "Applied ML", "Data Analytics"],
  },
  {
    id: "rubixq",
    role: "Full Stack Developer",
    company: "RubixQ Game Solutions India Pvt. Ltd.",
    location: "Visakhapatnam, India",
    period: "March 2020 – April 2022",
    type: "software-engineering",
    description:
      "Built real-time web applications and high-concurrency backend services for an interactive online multiplayer gaming platform.",
    highlights: [
      "Developed responsive, dynamic client applications using React.js with modular component state synchronization.",
      "Engineered backend RESTful and WebSocket microservices in Node.js and Express handling high volumes of simultaneous sessions.",
      "Managed relational (PostgreSQL) and document (MongoDB) databases, containerizing application services with Docker on AWS.",
    ],
    skills: ["React.js", "Node.js", "Express.js", "MongoDB", "PostgreSQL", "WebSockets", "Docker", "AWS"],
  },
  {
    id: "einstein-brains",
    role: "Web Designer & Frontend Engineer",
    company: "Einstein Brains Group of Companies",
    location: "Visakhapatnam, India",
    period: "December 2018 – February 2020",
    type: "software-engineering",
    description:
      "Crafted visually compelling, accessible digital web experiences and design systems, optimizing user engagement and brand presentation.",
    highlights: [
      "Designed and coded responsive web interfaces using modern HTML5, CSS3, JavaScript, and design tools.",
      "Streamlined frontend performance, search engine optimization (SEO), and responsive mobile parity across client web portals.",
      "Collaborated with brand directors to translate design wireframes into pixel-perfect web implementations.",
    ],
    skills: ["UI/UX Design", "HTML5/CSS3", "JavaScript", "Adobe Creative Suite", "Figma", "SEO", "Responsive Web Design"],
  },
  {
    id: "avico",
    role: "Software Developer & QA Engineer",
    company: "Avico Software Solutions Pvt. Ltd.",
    location: "Hyderabad, India",
    period: "June 2016 – November 2018",
    type: "software-engineering",
    description:
      "Developed enterprise software modules in Java and engineered automated testing pipelines to ensure high code quality and zero-regression deployments.",
    highlights: [
      "Developed backend enterprise modules utilizing Java, the Spring Framework, and relational SQL databases.",
      "Engineered automated test suites using Selenium WebDriver and JUnit, significantly accelerating testing release cycles.",
      "Integrated continuous automated test builds into Jenkins CI/CD deployment pipelines on Linux environments.",
    ],
    skills: ["Java", "Spring Framework", "SQL", "Selenium", "JUnit", "Jenkins CI/CD", "Linux"],
  },
  {
    id: "bachelor-andhra",
    role: "Bachelor of Engineering (BE) in Electrical & Electronics",
    company: "Andhra University",
    location: "Visakhapatnam, India",
    period: "Graduated November 2017",
    type: "education",
    description:
      "Core engineering degree covering computational mathematics, electrical circuits, signal processing, and systems theory.",
    highlights: [
      "Rigorous technical training in signal processing, computational circuits, and mathematical problem solving.",
      "Self-directed transition into software engineering, automated scripting, and algorithmic programming.",
    ],
    skills: ["Systems Engineering", "Signal Processing", "Circuit Theory", "Computational Mathematics"],
  },
  {
    id: "bachelor-ignou",
    role: "Bachelor of Arts (BA) in Psychology",
    company: "Indira Gandhi National Open University (IGNOU)",
    location: "New Delhi, India",
    period: "Graduated March 2016",
    type: "education",
    description:
      "Focused study of cognitive psychology, human behavior, decision-making dynamics, and mental models—providing a unique foundation for designing human-AI collaboration systems.",
    highlights: [
      "Studied cognitive frameworks, user perception, and behavioral decision mechanics.",
      "Informs human-in-the-loop AI interfaces, prompt engineering empathy, and intuitive human-agent collaboration.",
    ],
    skills: ["Cognitive Psychology", "Human-Computer Interaction", "Behavioral Dynamics", "Mental Models"],
  },
];

export interface Certification {
  title: string;
  issuer: string;
  category: string;
  badge?: string;
}

export const CERTIFICATIONS: Certification[] = [
  {
    title: "AWS Certified AI Practitioner (AIF-C01)",
    issuer: "Amazon Web Services (AWS)",
    category: "Cloud & AI Architecture",
    badge: "Official AWS Credential",
  },
  {
    title: "Machine Learning Specialization",
    issuer: "DeepLearning.AI & Stanford University",
    category: "Machine Learning & GenAI",
    badge: "Stanford Online",
  },
  {
    title: "Introduction to Artificial Intelligence",
    issuer: "Google / Coursera",
    category: "Machine Learning & GenAI",
  },
  {
    title: "Start Writing Prompts like a Pro",
    issuer: "Google / Coursera",
    category: "Prompt Engineering",
  },
  {
    title: "SQL (Advanced & Intermediate)",
    issuer: "HackerRank",
    category: "Databases & Systems",
    badge: "Verified Skill",
  },
  {
    title: "Python (Proficiency)",
    issuer: "HackerRank",
    category: "Programming",
    badge: "Verified Skill",
  },
];

export interface SkillCategory {
  title: string;
  icon: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Generative AI & Agentic Systems",
    icon: "Bot",
    skills: [
      "Multi-Agent Orchestration (LangChain, LangGraph, AutoGen, CrewAI)",
      "Retrieval-Augmented Generation (RAG) & Vector Databases (Pinecone, ChromaDB)",
      "Model Evaluation & Hallucination Audits (Ragas, DeepEval)",
      "Advanced Prompt Engineering (Chain-of-Thought, Few-Shot, ReAct)",
      "Local LLM Deployment & Hardware Profiling (Ollama, vLLM)",
      "Model APIs (Azure OpenAI, AWS Bedrock, Claude 3.5, GPT-4o, Hugging Face)",
    ],
  },
  {
    title: "Backend & Systems Architecture",
    icon: "Server",
    skills: [
      "Python (FastAPI, AsyncIO, Celery, Streamlit)",
      "Node.js, Express & TypeScript",
      "PostgreSQL, pgvector, MongoDB & Redis Caching",
      "Streaming Response APIs & WebSockets",
      "RESTful API Design & OpenAPI Documentation",
      "High-Throughput Microservice Architecture",
    ],
  },
  {
    title: "Cloud, DevOps & MLOps",
    icon: "Cloud",
    skills: [
      "Docker Containerization & Kubernetes",
      "AWS (Bedrock, SageMaker, EC2, S3, ECS)",
      "Google Cloud Platform (GCP Vertex AI, Cloud Run)",
      "CI/CD Pipelines (GitHub Actions, Jenkins)",
      "n8n Automation & API Integration",
      "Linux Systems Administration & Shell Scripting",
    ],
  },
  {
    title: "Frontend, Visualization & UX",
    icon: "Layout",
    skills: [
      "TypeScript & Modern JavaScript (ESNext)",
      "React.js & Next.js (App Router, Server Components)",
      "Tailwind CSS & Editorial Design Systems",
      "Data Visualization (Plotly, Streamlit, GeoPandas, Canvas)",
      "Framer Motion & Micro-interactions",
      "Human-Centered AI Interface Design",
    ],
  },
];
