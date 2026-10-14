"use client";

import { useState } from "react";
import { Activity, Zap } from "lucide-react";

interface StepNode {
  title: string;
  role: string;
  detail: string;
  tech: string;
}

interface ArchitectureFlow {
  id: string;
  name: string;
  category: string;
  description: string;
  metric: string;
  steps: StepNode[];
}

const FLOWS: ArchitectureFlow[] = [
  {
    id: "multi-agent",
    name: "Multi-Agent Consensus Graph",
    category: "Agentic AI Architecture",
    description:
      "A stateful agent graph where specialized worker agents plan, execute tool actions, cross-examine intermediate outputs, and verify hallucinations before committing changes.",
    metric: "35% Latency Reduction • 0.00 Hallucination Drift",
    steps: [
      {
        title: "01. Intent Router",
        role: "Safety & Schema Boundary",
        detail: "Classifies user intent, injects system instructions, and assigns execution budget.",
        tech: "LangChain / LangGraph",
      },
      {
        title: "02. Parallel Planners",
        role: "Decomposition Loop",
        detail: "Splits complex requests into isolated, parallel sub-tasks with dependency graphs.",
        tech: "Python AsyncIO",
      },
      {
        title: "03. Tool Invocation",
        role: "Deterministic Execution",
        detail: "Autonomous execution of external REST APIs, Git actions, and database queries.",
        tech: "FastAPI / Docker",
      },
      {
        title: "04. Critic Verification",
        role: "Adversarial Evaluation",
        detail: "Cross-checks facts against ground truth context to catch logic gaps before return.",
        tech: "Ragas / DeepEval",
      },
    ],
  },
  {
    id: "rag-pipeline",
    name: "High-Signal Enterprise RAG",
    category: "Knowledge Retrieval",
    description:
      "A hybrid retrieval architecture combining dense vector embeddings with BM25 lexical indexing and cross-encoder re-ranking for ultra-precise enterprise context retrieval.",
    metric: "25% Error Reduction • Sub-400ms Retrieval",
    steps: [
      {
        title: "01. Document Ingestion",
        role: "AST & Metadata Enrichment",
        detail: "Extracts text from unstructured PDFs, Git repositories, and Markdown logs.",
        tech: "Gittxt / Unstructured",
      },
      {
        title: "02. Semantic Chunking",
        role: "Boundary Preservation",
        detail: "Chunks content based on conceptual semantic blocks rather than arbitrary character splits.",
        tech: "Python / Tiktoken",
      },
      {
        title: "03. Hybrid Vector Store",
        role: "Dual Index Query",
        detail: "Queries Pinecone vector space combined with BM25 lexical token matching.",
        tech: "Pinecone / pgvector",
      },
      {
        title: "04. Cross-Encoder Re-rank",
        role: "Signal Maximizer",
        detail: "Re-ranks top 20 candidates down to top 4 highest-signal passages for generation.",
        tech: "Cohere / BGE Re-ranker",
      },
    ],
  },
  {
    id: "ollama-scout",
    name: "Hardware-Aware Local LLM Profiling",
    category: "Hardware & Model Telemetry",
    description:
      "The architectural core behind Ollama Scout: probing real GPU VRAM and CPU unified memory to mathematically match open-weight LLMs without Out-Of-Memory crashes.",
    metric: "Sub-Second Hardware Scan • Zero OOM Crashes",
    steps: [
      {
        title: "01. Hardware Prober",
        role: "VRAM & Topology Scan",
        detail: "Inspects CUDA, Apple Silicon Metal unified memory, and available host RAM in real time.",
        tech: "NVIDIA NVML / OS Syscall",
      },
      {
        title: "02. Quantization Match",
        role: "Memory Budget Sizing",
        detail: "Computes KV-cache overhead + weights for Q4_K_M, Q5, and FP16 parameter sizes.",
        tech: "Ollama Scout Engine",
      },
      {
        title: "03. Task-Based Filter",
        role: "Capability Grouping",
        detail: "Ranks candidate models by coding, reasoning, conversational, or vision benchmarks.",
        tech: "Hugging Face / OpenLLM",
      },
      {
        title: "04. Local Daemon Serve",
        role: "Zero-OOM Execution",
        detail: "Triggers optimal model pulls with pinned context windows matching memory limits.",
        tech: "Ollama Daemon CLI",
      },
    ],
  },
];

export function ArchitectureVisualizer() {
  const [activeFlowId, setActiveFlowId] = useState<string>("multi-agent");
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(0);

  const activeFlow = FLOWS.find((f) => f.id === activeFlowId) ?? FLOWS[0];
  const activeStep = activeFlow.steps[selectedStepIndex] ?? activeFlow.steps[0];

  return (
    <section className="py-20 border-t border-neutral-200/80 dark:border-white/10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono mb-3">
              <Activity className="w-3.5 h-3.5 text-red-500" />
              <span>{"// ARCHITECTURE SCHEMATICS"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Systems Engineering in Action
            </h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
            Click through real architectural blueprints implemented across Sandy&apos;s enterprise roles and open-source tools.
          </p>
        </div>

        {/* Blueprint Container */}
        <div className="rounded-3xl border border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/90 backdrop-blur-xl shadow-lg dark:shadow-2xl overflow-hidden">
          {/* Architecture Switcher Tabs */}
          <div className="flex flex-wrap items-center justify-between border-b border-neutral-200/80 dark:border-white/10 p-3 sm:p-4 bg-neutral-50/70 dark:bg-white/5 gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {FLOWS.map((flow) => {
                const active = flow.id === activeFlowId;
                return (
                  <button
                    key={flow.id}
                    id={`arch-tab-${flow.id}`}
                    onClick={() => {
                      setActiveFlowId(flow.id);
                      setSelectedStepIndex(0);
                    }}
                    type="button"
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                      active
                        ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-sm font-semibold"
                        : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200/60 dark:hover:bg-white/10"
                    }`}
                  >
                    {flow.name}
                  </button>
                );
              })}
            </div>
            <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 px-3 py-1 rounded-lg border border-neutral-200/60 dark:border-white/5 bg-white/70 dark:bg-white/5 hidden md:inline-block">
              {activeFlow.category}
            </span>
          </div>

          {/* Blueprint Canvas Body */}
          <div className="p-6 sm:p-8 space-y-8">
            {/* Top Flow Overview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-200/70 dark:border-white/5">
              <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-2xl leading-relaxed">
                {activeFlow.description}
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-medium shrink-0">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>{activeFlow.metric}</span>
              </div>
            </div>

            {/* Interactive Step Nodes Pipeline */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeFlow.steps.map((step, idx) => {
                const selected = idx === selectedStepIndex;
                return (
                  <button
                    key={idx}
                    id={`step-node-${activeFlow.id}-${idx}`}
                    onClick={() => setSelectedStepIndex(idx)}
                    type="button"
                    className={`relative text-left p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between min-h-[140px] ${
                      selected
                        ? "border-red-500/80 bg-red-500/5 dark:bg-red-500/10 shadow-md shadow-red-500/10 scale-[1.02]"
                        : "border-neutral-200/80 dark:border-white/10 bg-neutral-50/50 dark:bg-white/5 hover:border-neutral-400 dark:hover:border-white/20"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] font-mono font-semibold ${selected ? "text-red-700 dark:text-red-400" : "text-neutral-400 dark:text-neutral-500"}`}>
                          {step.title}
                        </span>
                        {selected && (
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-neutral-900 dark:text-white leading-tight mb-1">
                        {step.role}
                      </h4>
                    </div>

                    <div className="pt-3 border-t border-neutral-200/50 dark:border-white/5">
                      <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        {step.tech}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Step Deep Dive Card */}
            <div className="p-5 sm:p-6 rounded-2xl border border-red-500/25 bg-gradient-to-r from-red-500/8 via-neutral-100/40 dark:via-white/5 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono uppercase tracking-wider text-red-700 dark:text-red-400 font-medium">
                  Active Stage Implementation
                </span>
                <p className="text-sm sm:text-base font-semibold text-neutral-900 dark:text-white">
                  {activeStep.detail}
                </p>
              </div>
              <div className="px-3.5 py-1.5 rounded-lg border border-neutral-300 dark:border-white/10 bg-white dark:bg-black/40 text-xs font-mono text-neutral-700 dark:text-neutral-300 shrink-0">
                Stack: {activeStep.tech}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
