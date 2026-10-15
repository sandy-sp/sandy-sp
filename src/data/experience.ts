// Source of truth: Master Resume (Red-Book/Hunt/Job Hunt/Master Resume), July 2026.

export type Place = {
  city: string;
  country: "India" | "United States";
  lat: number;
  lon: number;
};

export const PLACES = {
  newDelhi: { city: "New Delhi", country: "India", lat: 28.61, lon: 77.21 },
  hyderabad: { city: "Hyderabad", country: "India", lat: 17.39, lon: 78.49 },
  visakhapatnam: { city: "Visakhapatnam", country: "India", lat: 17.69, lon: 83.22 },
  cleveland: { city: "Cleveland, OH", country: "United States", lat: 41.5, lon: -81.69 },
  newYork: { city: "New York, NY", country: "United States", lat: 40.71, lon: -74.01 },
  columbus: { city: "Columbus, OH", country: "United States", lat: 39.96, lon: -83.0 },
  irving: { city: "Irving, TX", country: "United States", lat: 32.81, lon: -96.95 },
} satisfies Record<string, Place>;

export interface JourneyEntry {
  id: string;
  kind: "work" | "education";
  title: string;
  org: string;
  place: Place;
  /** Waypoints the globe route passes through on the way here (not pinned). */
  via?: { lat: number; lon: number }[];
  remote?: boolean;
  /** Display period. */
  period: string;
  /** Year shown on the timeline rail. */
  year: string;
  current?: boolean;
  summary: string;
  highlights: string[];
  skills: string[];
}

/** Chronological, oldest first: the order the journey globe travels. */
export const JOURNEY: JourneyEntry[] = [
  {
    id: "ignou",
    kind: "education",
    title: "BA, Psychology",
    org: "Indira Gandhi National Open University",
    place: PLACES.newDelhi,
    period: "Graduated March 2016",
    year: "2016",
    summary:
      "A distance-learning degree I studied alongside engineering. Cognitive psychology, decision-making and mental models. It still shapes how I design tools people work alongside, especially where a human reviews what a model produced.",
    highlights: [],
    skills: ["Cognitive psychology", "Behavioral research", "Mental models"],
  },
  {
    id: "andhra",
    kind: "education",
    title: "BE, Electrical & Electronics Engineering",
    org: "Andhra University",
    place: PLACES.visakhapatnam,
    period: "Graduated November 2017",
    year: "2017",
    summary:
      "Circuits, signal processing and systems theory. Finished while interning at Avico, and the reason I think about software as systems with inputs, feedback and failure modes.",
    highlights: [],
    skills: ["Signal processing", "Systems theory", "Computational mathematics"],
  },
  {
    id: "avico",
    kind: "work",
    title: "Intern → Software Tester → Software Developer",
    org: "Avico Software Solutions",
    place: PLACES.hyderabad,
    period: "June 2016 – November 2018",
    year: "2016–18",
    summary:
      "Where my career started. I joined as an intern in my final semester of engineering and stayed on after graduating: testing enterprise software first, then writing it as a developer from March 2018.",
    highlights: [
      "Built test automation frameworks with Selenium WebDriver and Python, cutting manual testing effort by 30%.",
      "Automated UI and API test suites, improving defect detection by 20%.",
      "Set up CI/CD with Jenkins and GitLab CI and containerized services with Docker.",
      "Developed REST APIs and backend components in Python and Java; tuned PostgreSQL, Oracle and MongoDB queries.",
    ],
    skills: ["Python", "Java", "Selenium", "JMeter", "Jenkins", "Docker", "PostgreSQL", "AWS"],
  },
  {
    id: "einstein-brains",
    kind: "work",
    title: "Web Designer / Creative Technologist",
    org: "Einstein Brains Group of Companies",
    place: PLACES.hyderabad,
    period: "December 2018 – February 2020",
    year: "2018",
    summary: "Designed and built marketing sites and interfaces, from wireframes to production front ends.",
    highlights: [
      "Designed and launched responsive landing pages and web interfaces, improving engagement by 10%.",
      "Produced wireframes, prototypes and mockups in Adobe XD, Illustrator and Photoshop before engineering hand-off.",
      "Integrated sites with Salesforce, HubSpot, Zoho CRM, Shopify and Magento.",
      "Ran cross-browser and accessibility (WCAG) testing across desktop and mobile.",
    ],
    skills: ["UI/UX", "HTML/CSS", "JavaScript", "Adobe CC", "CRM integration", "WCAG"],
  },
  {
    id: "rubixq",
    kind: "work",
    title: "Full Stack Developer",
    org: "RubixQ Game Solutions",
    place: PLACES.hyderabad,
    period: "March 2020 – April 2022",
    year: "2020",
    summary: "Full-stack work on games, e-learning and client web apps, including 3D assets made in Blender.",
    highlights: [
      "Shipped 15+ web applications end to end with a 95% on-time delivery rate.",
      "Built an online multiplayer game platform and a gamified e-learning platform.",
      "Created reusable UI components across React, Angular and Vue, speeding up development by 30%.",
      "Deployed on AWS, Azure and GCP with Docker and Kubernetes; built REST and GraphQL APIs in Django and Node.js.",
    ],
    skills: ["React", "Node.js", "Django", "GraphQL", "Blender", "Docker", "Kubernetes"],
  },
  {
    id: "csu",
    kind: "education",
    title: "Master of Information Systems",
    org: "Cleveland State University",
    place: PLACES.cleveland,
    // India to Ohio the way the flight went: over Europe, then the Atlantic.
    via: [
      { lat: 41.0, lon: 29.0 },
      { lat: 48.5, lon: 2.3 },
      { lat: 50.0, lon: -35.0 },
    ],
    period: "August 2022 – December 2024",
    year: "2022",
    summary:
      "Moved to the US for graduate school: enterprise systems, data governance, analytics and applied machine learning. Ahuja Endowment Scholarship recipient.",
    highlights: ["Ahuja Endowment Scholarship recipient."],
    skills: ["Systems architecture", "Data governance", "Applied ML", "Analytics"],
  },
  {
    id: "independent",
    kind: "work",
    title: "Independent AI Developer",
    org: "Freelance & open source",
    place: PLACES.cleveland,
    period: "January 2023 – March 2025",
    year: "2023",
    summary:
      "Built RAG systems and automations for small businesses while publishing my own open-source tools.",
    highlights: [
      "Deployed RAG systems for several clients on ChromaDB, Pinecone and Qdrant, reducing hallucinations by 25%.",
      "Fine-tuned open-source LLMs with LoRA on domain data, improving answer accuracy by 20%.",
      "Automated document and social workflows with AutoGen, CrewAI and n8n, cutting manual effort by 30%.",
      "Published Gittxt and built Metadata Cleaner and YTGrid.",
    ],
    skills: ["RAG", "LoRA", "LangChain", "AutoGen", "CrewAI", "FastAPI", "Docker"],
  },
  {
    id: "bright-mind",
    kind: "work",
    title: "AI Web Developer",
    org: "Bright Mind Enrichment & Schooling",
    place: PLACES.newYork,
    remote: true,
    period: "April 2025 – August 2025",
    year: "2025",
    summary: "Added LLM content pipelines, a semantic search chatbot and automation to a nonprofit education site.",
    highlights: [
      "Built a content scheduler on Claude 3.5 Sonnet and GPT-4o, cutting content creation time by 50%.",
      "Reduced hallucinations by 25% with chain-of-thought prompting and strict output validation.",
      "Built a semantic search chatbot over internal documents.",
      "Routed AI drafts through a human review step before anything was published.",
    ],
    skills: ["LLMs", "Prompt engineering", "Semantic search", "FastAPI", "Python"],
  },
  {
    id: "magnifying-minds",
    kind: "work",
    title: "AI Technology Manager",
    org: "Magnifying Minds",
    place: PLACES.columbus,
    remote: true,
    period: "September 2025 – February 2026",
    year: "2025",
    summary: "Led AI and automation for a nonprofit: an internal knowledge base, content workflows and the infrastructure under them.",
    highlights: [
      "Built an internal RAG knowledge base on GCP, improving retrieval accuracy for leadership by 20%.",
      "Designed content automation with human-in-the-loop review, reducing manual overhead by 30%.",
      "Built n8n workflows connecting AI agents to outreach and donor tools.",
      "Advised leadership on AI use cases and mentored staff on adoption.",
    ],
    skills: ["RAG", "GCP", "n8n", "Python", "Human-in-the-loop"],
  },
  {
    id: "orbisq",
    kind: "work",
    title: "AI Automation Engineer / AI Solutions Architect",
    org: "OrbisQ Inc",
    place: PLACES.irving,
    remote: true,
    period: "February 2026 – present",
    year: "2026",
    current: true,
    summary: "Building generative AI and multi-agent systems for enterprise clients on Azure OpenAI and AWS Bedrock.",
    highlights: [
      "Built multi-agent automation with LangChain and LlamaIndex, reducing manual task latency by 35%.",
      "Engineered RAG pipelines on Pinecone with Azure OpenAI and AWS Bedrock.",
      "Built FastAPI services that put LLM features into customer-facing apps.",
      "Set up CI/CD with GitHub Actions and Ragas/DeepEval evaluation; deployed on Docker and Kubernetes.",
    ],
    skills: ["Azure OpenAI", "AWS Bedrock", "LangChain", "LlamaIndex", "Pinecone", "FastAPI", "Kubernetes", "Ragas"],
  },
];

export interface Certification {
  title: string;
  issuer: string;
  date: string;
  group: "Cloud" | "Anthropic" | "Google" | "Machine learning" | "HackerRank";
  verifyUrl?: string;
}

export const CERTIFICATIONS: Certification[] = [
  { title: "AWS Certified AI Practitioner", issuer: "Amazon Web Services", date: "March 2026", group: "Cloud", verifyUrl: "https://aws.amazon.com/verification" },
  { title: "Claude Code in Action", issuer: "Anthropic", date: "May 2026", group: "Anthropic", verifyUrl: "https://verify.skilljar.com/c/cocw6wmtdnip" },
  { title: "Claude Code 101", issuer: "Anthropic", date: "May 2026", group: "Anthropic", verifyUrl: "https://verify.skilljar.com/c/zgcviboyzdka" },
  { title: "Claude 101", issuer: "Anthropic", date: "May 2026", group: "Anthropic", verifyUrl: "https://verify.skilljar.com/c/gk4kq2qxxehz" },
  { title: "Introduction to Claude Cowork", issuer: "Anthropic", date: "May 2026", group: "Anthropic", verifyUrl: "https://verify.skilljar.com/c/4qspb9krnrn8" },
  { title: "AI Fluency: Framework & Foundations", issuer: "Anthropic", date: "May 2026", group: "Anthropic", verifyUrl: "https://verify.skilljar.com/c/e397yw4f5xqe" },
  { title: "AI Fluency for Educators", issuer: "Anthropic", date: "May 2026", group: "Anthropic", verifyUrl: "https://verify.skilljar.com/c/x6btcgt286py" },
  { title: "AI Fluency for Students", issuer: "Anthropic", date: "May 2026", group: "Anthropic", verifyUrl: "https://verify.skilljar.com/c/geubiveckwj4" },
  { title: "AI for Brainstorming and Planning", issuer: "Google · Coursera", date: "May 2026", group: "Google", verifyUrl: "https://coursera.org/verify/Z4ITZSP3P5G8" },
  { title: "AI Fundamentals", issuer: "Google · Coursera", date: "April 2026", group: "Google", verifyUrl: "https://coursera.org/verify/KMZ6ACY84VPH" },
  { title: "Introduction to AI", issuer: "Google · Coursera", date: "May 2025", group: "Google", verifyUrl: "https://coursera.org/verify/WRNSJDLPR8UQ" },
  { title: "Start Writing Prompts like a Pro", issuer: "Google · Coursera", date: "May 2025", group: "Google", verifyUrl: "https://coursera.org/verify/M08IN9LP4KMT" },
  { title: "Machine Learning Specialization", issuer: "DeepLearning.AI · Stanford", date: "May 2025", group: "Machine learning" },
  { title: "SQL (Advanced, Intermediate, Basic)", issuer: "HackerRank", date: "January 2025", group: "HackerRank" },
  { title: "Python (Basic)", issuer: "HackerRank", date: "January 2025", group: "HackerRank" },
];

export interface SkillCategory {
  title: string;
  skills: string[];
}

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    title: "Generative AI & agents",
    skills: [
      "Multi-agent orchestration: LangChain, LangGraph, AutoGen, CrewAI",
      "RAG and vector databases: Pinecone, ChromaDB, Qdrant, pgvector",
      "Evaluation: Ragas, DeepEval",
      "Prompt engineering: chain-of-thought, few-shot, ReAct",
      "Fine-tuning with LoRA; local models with Ollama and vLLM",
      "Model APIs: Azure OpenAI, AWS Bedrock, Anthropic, Hugging Face",
    ],
  },
  {
    title: "Backend & data",
    skills: [
      "Python: FastAPI, AsyncIO, Celery, Django, Streamlit",
      "Node.js, Express and TypeScript",
      "PostgreSQL, MongoDB, Redis",
      "REST, GraphQL and WebSocket APIs",
      "Workflow automation: n8n, Zapier, Make",
    ],
  },
  {
    title: "Cloud & MLOps",
    skills: [
      "Docker and Kubernetes",
      "AWS: Bedrock, SageMaker, EC2, S3",
      "GCP: Vertex AI, Cloud Run",
      "CI/CD: GitHub Actions, GitLab CI, Jenkins",
      "Linux and shell scripting",
    ],
  },
  {
    title: "Front end & design",
    skills: [
      "TypeScript, React and Next.js",
      "Tailwind CSS and design systems",
      "WebGL, Three.js and GSAP",
      "Data visualization: Plotly, Streamlit, GeoPandas",
      "Figma, Adobe Creative Cloud and Blender",
    ],
  },
];
