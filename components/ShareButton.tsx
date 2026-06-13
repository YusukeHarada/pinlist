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
      await navigator.share({ title: "行きたい場所リスト", url });
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="rounded-full bg-gray-100 px-3 py-1.5 text-sm text-gray-600 transition active:bg-gray-200"
    >
      {copied ? "コピーしました！" : "🔗 共有"}
    </button>
  );
}
