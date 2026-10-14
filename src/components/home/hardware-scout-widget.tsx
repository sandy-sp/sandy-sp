"use client";

import { useState, useMemo } from "react";
import {
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Terminal,
  Sparkles,
} from "lucide-react";
import { SpotlightCard } from "@/components/shared/spotlight-card";

interface HardwareOption {
  id: string;
  name: string;
  platform: "Apple Silicon" | "NVIDIA CUDA" | "System RAM";
  vramGB: number;
  usableVramGB: number;
}

interface ModelCandidate {
  id: string;
  name: string;
  paramsB: number;
  layers: number;
  heads: number;
  hiddenDim: number;
  recommendedTask: string;
}

interface QuantOption {
  id: string;
  label: string;
  bitsPerWeight: number;
  description: string;
}

const HARDWARE_PRESETS: HardwareOption[] = [
  { id: "m3-max", name: "Apple M3/M4 Max", platform: "Apple Silicon", vramGB: 36, usableVramGB: 28 },
  { id: "rtx-4090", name: "NVIDIA RTX 4090", platform: "NVIDIA CUDA", vramGB: 24, usableVramGB: 23.2 },
  { id: "m2-pro", name: "Apple M2/M3 Pro", platform: "Apple Silicon", vramGB: 18, usableVramGB: 14 },
  { id: "rtx-4080", name: "NVIDIA RTX 4080", platform: "NVIDIA CUDA", vramGB: 16, usableVramGB: 15.2 },
  { id: "rtx-3060", name: "NVIDIA RTX 3060", platform: "NVIDIA CUDA", vramGB: 12, usableVramGB: 11.2 },
  { id: "mac-air", name: "Apple Mac Air (16GB)", platform: "Apple Silicon", vramGB: 16, usableVramGB: 11.5 },
];

const MODEL_PRESETS: ModelCandidate[] = [
  {
    id: "qwen-coder-32b",
    name: "Qwen 2.5 Coder 32B",
    paramsB: 32.5,
    layers: 64,
    heads: 40,
    hiddenDim: 5120,
    recommendedTask: "Autonomous Coding & Tool Calling",
  },
  {
    id: "deepseek-r1-14b",
    name: "DeepSeek R1 Distill 14B",
    paramsB: 14.8,
    layers: 48,
    heads: 40,
    hiddenDim: 5120,
    recommendedTask: "Complex Math & Chain-of-Thought",
  },
  {
    id: "mistral-small-24b",
    name: "Mistral Small 24B",
    paramsB: 24.0,
    layers: 56,
    heads: 32,
    hiddenDim: 4096,
    recommendedTask: "Multi-Agent Orchestration & RAG",
  },
  {
    id: "llama-3-3-70b",
    name: "Llama 3.3 70B",
    paramsB: 70.6,
    layers: 80,
    heads: 64,
    hiddenDim: 8192,
    recommendedTask: "Frontier General Reasoning",
  },
];

const QUANTS: QuantOption[] = [
  { id: "q4_k_m", label: "Q4_K_M (4-bit)", bitsPerWeight: 4.5, description: "Optimal throughput / quality ratio" },
  { id: "q5_k_m", label: "Q5_K_M (5-bit)", bitsPerWeight: 5.5, description: "Enhanced reasoning fidelity" },
  { id: "q8_0", label: "Q8_0 (8-bit)", bitsPerWeight: 8.5, description: "Near FP16 unquantized parity" },
];

const CONTEXT_OPTIONS = [4096, 8192, 16384, 32768];

export function HardwareScoutWidget() {
  const [selectedHardwareId, setSelectedHardwareId] = useState<string>("rtx-4090");
  const [selectedModelId, setSelectedModelId] = useState<string>("qwen-coder-32b");
  const [selectedQuantId, setSelectedQuantId] = useState<string>("q4_k_m");
  const [contextTokens, setContextTokens] = useState<number>(8192);
  const [copiedCmd, setCopiedCmd] = useState(false);

  const hardware = HARDWARE_PRESETS.find((h) => h.id === selectedHardwareId) || HARDWARE_PRESETS[0];
  const model = MODEL_PRESETS.find((m) => m.id === selectedModelId) || MODEL_PRESETS[0];
  const quant = QUANTS.find((q) => q.id === selectedQuantId) || QUANTS[0];

  // Mathematical Memory Footprint Calculations:
  // 1. Model Weights Size (GB): (params * bitsPerWeight) / 8 * 1.08 overhead
  // 2. KV-Cache Footprint (GB): 2 * layers * 2 * (heads * head_dim) * context_tokens * 2 bytes (FP16 KV) / 10^9
  // 3. Runtime Engine / CUDA buffer overhead: ~1.2 GB
  const calculation = useMemo(() => {
    const weightsGB = (model.paramsB * quant.bitsPerWeight) / 8 * 1.06;
    const kvCacheGB = (2 * model.layers * model.hiddenDim * contextTokens * 2) / (1024 * 1024 * 1024);
    const runtimeOverheadGB = 1.1;
    const totalRequiredGB = weightsGB + kvCacheGB + runtimeOverheadGB;

    const availableGB = hardware.usableVramGB;
    const memoryPercent = Math.min(100, Math.round((totalRequiredGB / availableGB) * 100));

    let status: "fits" | "partial" | "oom";
    let statusLabel: string;
    let statusDesc: string;

    if (totalRequiredGB <= availableGB * 0.95) {
      status = "fits";
      statusLabel = "100% VRAM / Metal Accelerated";
      statusDesc = "Optimal. Zero disk swap, peak generation tokens/sec.";
    } else if (totalRequiredGB <= availableGB * 1.35) {
      status = "partial";
      statusLabel = "Spills to Unified/Host RAM";
      statusDesc = "Runs with latency penalty (~3-5x slower generation).";
    } else {
      status = "oom";
      statusLabel = "Kernel OOM Crash Predicted";
      statusDesc = "Insufficient VRAM. Ollama daemon will kill process.";
    }

    return {
      weightsGB: weightsGB.toFixed(1),
      kvCacheGB: kvCacheGB.toFixed(1),
      totalRequiredGB: totalRequiredGB.toFixed(1),
      memoryPercent,
      availableGB,
      status,
      statusLabel,
      statusDesc,
    };
  }, [hardware, model, quant, contextTokens]);

  const ollamaRunCmd = `ollama run ${model.id.replace(/-[0-9]+b$/, "")}:${model.paramsB < 20 ? "14b" : model.paramsB < 40 ? "32b" : "70b"}-${quant.id.replace("_", "-")}`;

  const copyCommand = () => {
    navigator.clipboard.writeText(ollamaRunCmd);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <section id="hardware-scout" className="py-20 border-t border-neutral-200/80 dark:border-white/10 relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 text-xs font-mono mb-3">
              <Cpu className="w-3.5 h-3.5 text-red-500" />
              <span>{"// LIVE HARDWARE TELEMETRY"}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Ollama Scout: VRAM &amp; Quantization Simulator
            </h2>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 max-w-md">
            Test the real mathematical engine powering Sandy&apos;s PyPI tool. Select your GPU and candidate LLM to prevent Out-Of-Memory crashes before pulling gigabytes.
          </p>
        </div>

        {/* Main Interactive Sandbox Card */}
        <SpotlightCard className="border-neutral-200/90 dark:border-white/10 bg-white/90 dark:bg-[#0e0f14]/90 backdrop-blur-xl shadow-xl p-6 sm:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Control Panel */}
            <div className="lg:col-span-7 space-y-6">
              {/* Hardware Selection */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                  1. Target GPU / Hardware Platform
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HARDWARE_PRESETS.map((hw) => {
                    const active = hw.id === selectedHardwareId;
                    return (
                      <button
                        key={hw.id}
                        type="button"
                        id={`btn-hw-${hw.id}`}
                        onClick={() => setSelectedHardwareId(hw.id)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          active
                            ? "border-red-500 bg-red-500/10 text-zinc-900 dark:text-white font-semibold shadow-sm"
                            : "border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-white/20"
                        }`}
                      >
                        <div className="text-xs font-semibold truncate">{hw.name}</div>
                        <div className="text-[11px] font-mono text-red-700 dark:text-red-400 mt-0.5">
                          {hw.vramGB} GB VRAM
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Model Candidate Selection */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
                  2. Open-Weight Foundation Model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {MODEL_PRESETS.map((m) => {
                    const active = m.id === selectedModelId;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        id={`btn-model-${m.id}`}
                        onClick={() => setSelectedModelId(m.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          active
                            ? "border-red-500 bg-red-500/10 text-zinc-900 dark:text-white font-semibold shadow-sm"
                            : "border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-white/20"
                        }`}
                      >
                        <div className="text-xs font-bold">{m.name}</div>
                        <div className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                          {m.recommendedTask}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quantization & Context Length */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                    3. Quantization Level
                  </label>
                  <div className="space-y-1.5">
                    {QUANTS.map((q) => {
                      const active = q.id === selectedQuantId;
                      return (
                        <button
                          key={q.id}
                          type="button"
                          id={`btn-quant-${q.id}`}
                          onClick={() => setSelectedQuantId(q.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all ${
                            active
                              ? "border-red-500 bg-red-500/10 text-zinc-900 dark:text-white font-semibold"
                              : "border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5"
                          }`}
                        >
                          <span>{q.label}</span>
                          <span className="text-[10px] font-mono text-neutral-400">{q.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                    4. Context Window (Tokens)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {CONTEXT_OPTIONS.map((tokens) => {
                      const active = tokens === contextTokens;
                      return (
                        <button
                          key={tokens}
                          type="button"
                          id={`btn-ctx-${tokens}`}
                          onClick={() => setContextTokens(tokens)}
                          className={`py-2 px-2.5 rounded-lg border text-xs font-mono transition-all text-center ${
                            active
                              ? "border-red-500 bg-red-500/15 text-red-700 dark:text-red-300 font-bold"
                              : "border-neutral-200 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5"
                          }`}
                        >
                          {tokens >= 1024 ? `${tokens / 1024}k` : tokens} Tokens
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono mt-2">
                    KV-cache scales dynamically with batch &amp; context depth.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Mathematical Telemetry Gauge & Realtime Verdict */}
            <div className="lg:col-span-5 rounded-2xl border border-neutral-200/90 dark:border-white/10 bg-neutral-50/80 dark:bg-[#07080c] p-6 space-y-6">
              {/* Verdict Banner */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  calculation.status === "fits"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : calculation.status === "partial"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300"
                }`}
              >
                {calculation.status === "fits" && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                )}
                {calculation.status === "partial" && (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                )}
                {calculation.status === "oom" && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="text-xs font-mono font-bold uppercase tracking-wider">
                    {calculation.statusLabel}
                  </div>
                  <div className="text-xs opacity-90 mt-0.5 leading-relaxed">
                    {calculation.statusDesc}
                  </div>
                </div>
              </div>

              {/* Memory Allocation Meter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-neutral-500 dark:text-neutral-400">VRAM Budget Utilization</span>
                  <span className="font-bold text-neutral-900 dark:text-white">
                    {calculation.totalRequiredGB} GB / {calculation.availableGB} GB
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-3 bg-neutral-200 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      calculation.status === "fits"
                        ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                        : calculation.status === "partial"
                        ? "bg-gradient-to-r from-amber-500 to-orange-500"
                        : "bg-gradient-to-r from-rose-500 to-red-600"
                    }`}
                    style={{ width: `${Math.min(100, (Number(calculation.totalRequiredGB) / calculation.availableGB) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Footprint Breakdown */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-neutral-200 dark:border-white/10">
                <div className="p-2.5 rounded-lg bg-white/70 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5">
                  <span className="text-neutral-400 block text-[10px]">Model Weights</span>
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">
                    {calculation.weightsGB} GB
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-white/70 dark:bg-white/5 border border-neutral-200/60 dark:border-white/5">
                  <span className="text-neutral-400 block text-[10px]">KV Cache ({contextTokens / 1024}k)</span>
                  <span className="font-bold text-neutral-900 dark:text-white text-sm">
                    {calculation.kvCacheGB} GB
                  </span>
                </div>
              </div>

              {/* Generated One-Click CLI Launch Command */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 dark:text-neutral-500 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-red-500" />
                  <span>Exact Ollama Launch Command</span>
                </span>
                <div className="flex items-center justify-between p-2.5 rounded-xl border border-neutral-200 dark:border-white/10 bg-neutral-100/90 dark:bg-black/50 text-xs font-mono text-neutral-800 dark:text-neutral-200">
                  <span className="truncate pr-2">{ollamaRunCmd}</span>
                  <button
                    onClick={copyCommand}
                    type="button"
                    className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-white/10 text-neutral-500 hover:text-red-500 transition-colors shrink-0"
                    title="Copy command"
                  >
                    {copiedCmd ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* PyPI Tool Callout */}
              <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between text-xs font-mono text-red-800 dark:text-red-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  <span>pipx install ollama-scout</span>
                </span>
                <span className="text-[10px] text-neutral-500">Auto-Hardware Prober</span>
              </div>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </section>
  );
}
