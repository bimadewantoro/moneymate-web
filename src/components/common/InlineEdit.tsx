"use client";

import { useState, useRef, useEffect } from "react";

interface InlineEditProps {
  value: string;
  onSave: (value: string) => Promise<void>;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}

export function InlineEdit({
  value,
  onSave,
  className = "",
  inputClassName = "",
  placeholder = "Enter value...",
}: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(value);
  }, [value]);

  const handleSave = async () => {
    if (editValue.trim() === value) {
      setIsEditing(false);
      return;
    }

    if (!editValue.trim()) {
      setEditValue(value);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(editValue.trim());
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      setEditValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setEditValue(value);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        placeholder={placeholder}
        className={`px-2 py-1 border border-indigo-500 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${inputClassName}`}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded-md transition-colors ${className}`}
      title="Click to edit"
    >
      {value || placeholder}
    </span>
  );
}
