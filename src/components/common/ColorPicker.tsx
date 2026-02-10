"use client";

import { useState, useRef, useEffect } from "react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => Promise<void>;
}

const PRESET_COLORS = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308",
  "#84cc16", "#22c55e", "#10b981", "#14b8a6",
  "#06b6d4", "#0ea5e9", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#d946ef", "#ec4899",
  "#f43f5e", "#64748b",
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleColorSelect = async (color: string) => {
    if (color === value) {
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      await onChange(color);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to save color:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSaving}
        className="w-8 h-8 rounded-lg border-2 border-slate-200 hover:border-slate-400 transition-colors disabled:opacity-50"
        style={{ backgroundColor: value }}
        title="Click to change color"
      />
      
      {isOpen && (
        <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg border border-slate-100">
          <div className="grid grid-cols-6 gap-2">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => handleColorSelect(color)}
                className={`w-6 h-6 rounded-md transition-transform hover:scale-110 ${
                  color === value ? "ring-2 ring-offset-2 ring-blue-600" : ""
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
