"use client";

import { useState } from "react";

export default function Home() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <p className="text-6xl font-mono">{count}</p>
      <button
        onClick={() => setCount((c) => c + 1)}
        className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
      >
        Increment
      </button>
    </div>
  );
}