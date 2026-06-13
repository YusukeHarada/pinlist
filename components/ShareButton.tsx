"use client";

import { useState } from "react";

type Props = {
  listId: string;
};

export default function ShareButton({ listId }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = `${location.origin}/list/${listId}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: "行きたい場所リスト", url });
      } catch (e) {
        if (e instanceof Error && e.name === "AbortError") return;
        throw e;
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 transition active:bg-gray-200 dark:active:bg-gray-600"
    >
      {copied ? "コピーしました！" : "🔗 共有"}
    </button>
  );
}
