"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const darkMode = theme === "dark";

  return (
    <div className="theme-toggle-shell">
      <label className="rolling-switch rolling-switch--compact">
        <input
          className="rolling-switch__input"
          type="checkbox"
          role="switch"
          aria-label="Toggle dark mode"
          checked={darkMode}
          onChange={toggle}
        />
        <svg className="rolling-switch__icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M15.1,14.9c-3-0.5-5.5-3-6-6C8.8,7.1,9.1,5.4,9.9,4c0.4-0.8-0.4-1.7-1.2-1.4C4.6,4,1.8,7.9,2,12.5c0.2,5.1,4.4,9.3,9.5,9.5c4.5,0.2,8.5-2.6,9.9-6.6c0.3-0.8-0.6-1.7-1.4-1.2C18.6,14.9,16.9,15.2,15.1,14.9z"
          />
        </svg>
        <svg className="rolling-switch__icon rolling-switch__icon--right" viewBox="0 0 24 24" aria-hidden="true">
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="17" x2="12" y2="20" transform="rotate(0,12,12)" />
            <line x1="12" y1="17" x2="12" y2="20" transform="rotate(45,12,12)" />
            <line x1="12" y1="17" x2="12" y2="20" transform="rotate(90,12,12)" />
            <line x1="12" y1="17" x2="12" y2="20" transform="rotate(135,12,12)" />
          </g>
          <circle fill="currentColor" cx="12" cy="12" r="5" />
        </svg>
        <span className="rolling-switch__inner" />
      </label>
    </div>
  );
}
