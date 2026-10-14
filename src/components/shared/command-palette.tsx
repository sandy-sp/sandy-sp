"use client";

import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Terminal,
  Sparkles,
  ExternalLink,
  Sun,
  Moon,
  Check,
  FolderGit2,
  Compass,
  UserCheck,
  X,
  Cpu,
  Mail,
} from "lucide-react";
import { useTheme } from "./theme-provider";

interface CommandItem {
  id: string;
  category: "Navigation" | "Flagship Tools" | "Developer Actions" | "Profiles";
  title: string;
  subtitle?: string;
  icon: typeof Search;
  shortcut?: string;
  action: () => void;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { theme, toggle } = useTheme();

  const copyToClipboard = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
      setOpen(false);
    }, 1200);
  }, []);

  const commands: CommandItem[] = useMemo(
    () => [
      // Navigation
      {
        id: "nav-home",
        category: "Navigation",
        title: "Go to Home",
        subtitle: "Overview, telemetry & interactive schematics",
        icon: Compass,
        shortcut: "G H",
        action: () => {
          router.push("/");
          setOpen(false);
        },
      },
      {
        id: "nav-projects",
        category: "Navigation",
        title: "Open Source Projects",
        subtitle: "9+ packages, CLI tools & GitHub repos",
        icon: FolderGit2,
        shortcut: "G P",
        action: () => {
          router.push("/open-source-projects");
          setOpen(false);
        },
      },
      {
        id: "nav-journey",
        category: "Navigation",
        title: "Career Journey & Experience",
        subtitle: "Systems engineering, psychology & MIS Ahuja Scholar",
        icon: UserCheck,
        shortcut: "G J",
        action: () => {
          router.push("/journey");
          setOpen(false);
        },
      },
      {
        id: "nav-skills",
        category: "Navigation",
        title: "Technical Skills & Taxonomy",
        subtitle: "AI/ML, distributed systems, cloud & frontend architecture",
        icon: Cpu,
        shortcut: "G S",
        action: () => {
          router.push("/skills");
          setOpen(false);
        },
      },

      // Flagship Tools
      {
        id: "tool-ollama-scout",
        category: "Flagship Tools",
        title: "Ollama Scout VRAM Prober",
        subtitle: "Local hardware profiling & mathematical model matching",
        icon: Cpu,
        shortcut: "VRAM",
        action: () => {
          router.push("/#hardware-scout");
          setOpen(false);
        },
      },
      {
        id: "tool-gittxt",
        category: "Flagship Tools",
        title: "Gittxt Context Engine",
        subtitle: "Convert repositories into high-signal LLM prompt payloads",
        icon: Terminal,
        shortcut: "PyPI",
        action: () => {
          router.push("/open-source-projects#proj-gittxt");
          setOpen(false);
        },
      },
      {
        id: "tool-audionomy",
        category: "Flagship Tools",
        title: "Audionomy Pipeline",
        subtitle: "Autonomous music generation with Bark & Audiocraft",
        icon: Sparkles,
        shortcut: "Audio",
        action: () => {
          router.push("/open-source-projects#proj-audionomy");
          setOpen(false);
        },
      },

      {
        id: "act-send-email",
        category: "Developer Actions",
        title: "Send Direct Email",
        subtitle: "Reach out for AI architecture & engineering roles",
        icon: Mail,
        shortcut: "Email",
        action: () => {
          window.location.href = "mailto:sandeep.paidipati@gmail.com";
          setOpen(false);
        },
      },
      {
        id: "act-copy-gittxt",
        category: "Developer Actions",
        title: "Copy: pip install gittxt",
        subtitle: "Install the Git repository to LLM context compiler",
        icon: Terminal,
        shortcut: "pip",
        action: () => copyToClipboard("pip install gittxt", "Command copied!"),
      },
      {
        id: "act-copy-scout",
        category: "Developer Actions",
        title: "Copy: pipx install ollama-scout",
        subtitle: "Install the hardware telemetry & VRAM optimizer",
        icon: Terminal,
        shortcut: "pipx",
        action: () => copyToClipboard("pipx install ollama-scout", "Command copied!"),
      },
      {
        id: "act-toggle-theme",
        category: "Developer Actions",
        title: `Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`,
        subtitle: "Toggle clean linen light vs crimson obsidian theme",
        icon: theme === "dark" ? Sun : Moon,
        shortcut: "T",
        action: () => {
          toggle();
          setOpen(false);
        },
      },

      // External Profiles
      {
        id: "prof-github",
        category: "Profiles",
        title: "GitHub Profile",
        subtitle: "github.com/sandy-sp (9+ open repositories)",
        icon: ExternalLink,
        shortcut: "GH",
        action: () => {
          window.open("https://github.com/sandy-sp", "_blank", "noopener,noreferrer");
          setOpen(false);
        },
      },
      {
        id: "prof-linkedin",
        category: "Profiles",
        title: "LinkedIn Profile",
        subtitle: "linkedin.com/in/sandy-sp/",
        icon: ExternalLink,
        shortcut: "IN",
        action: () => {
          window.open("https://www.linkedin.com/in/sandy-sp/", "_blank", "noopener,noreferrer");
          setOpen(false);
        },
      },
    ],
    [router, theme, toggle, copyToClipboard]
  );

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Global keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !prev;
        });
      } else if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setQuery("");
      setSelectedIndex(0);
      setOpen(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", handleCustomOpen);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", handleCustomOpen);
    };
  }, [open]);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Keyboard navigation within list
  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filteredCommands[selectedIndex];
      if (target) {
        target.action();
      }
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      id="command-palette-modal"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-28 px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div className="w-full max-w-xl rounded-2xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#0e0f14] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-neutral-200 dark:border-white/10">
          <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command, project, or tool..."
            className="w-full bg-transparent text-sm sm:text-base font-normal text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-white mr-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-white/10 rounded-md">
            ESC
          </kbd>
        </div>

        {/* Feedback Banner if copied */}
        {copiedText && (
          <div className="px-4 py-2 bg-emerald-500/10 border-b border-emerald-500/20 text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span>{copiedText}</span>
          </div>
        )}

        {/* Results List */}
        <div
          ref={listRef}
          className="max-h-80 sm:max-h-96 overflow-y-auto p-2 divide-y divide-neutral-100 dark:divide-white/5"
        >
          {filteredCommands.length === 0 ? (
            <div className="py-10 text-center text-xs font-mono text-neutral-400 dark:text-neutral-500">
              No matching actions or tools found.
            </div>
          ) : (
            filteredCommands.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  id={`cmd-item-${item.id}`}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  type="button"
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-red-500/10 text-red-900 dark:text-red-200 font-medium"
                      : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/70 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isSelected
                          ? "border-red-500/40 bg-red-500/10 text-red-600 dark:text-red-400"
                          : "border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-neutral-400"
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold truncate">
                        {item.title}
                      </div>
                      {item.subtitle && (
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate font-mono">
                          {item.subtitle}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.shortcut && (
                    <span className="shrink-0 ml-2 px-2 py-0.5 text-[10px] font-mono rounded-md border border-neutral-200 dark:border-white/10 text-neutral-400 dark:text-neutral-500">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-neutral-50/70 dark:bg-white/5 border-t border-neutral-200/80 dark:border-white/10 flex items-center justify-between text-[11px] font-mono text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>Sandy // AI Solutions Specialist</span>
        </div>
      </div>
    </div>
  );
}
