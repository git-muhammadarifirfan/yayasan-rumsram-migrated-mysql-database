"use client";

import ReactMarkdown from "react-markdown";

export function Markdown({ value }: { value?: string | null }) {
  const v = value?.trim() ?? "";
  if (!v) return null;

  return (
    <div className="md-content">
      <ReactMarkdown>{v}</ReactMarkdown>
    </div>
  );
}
