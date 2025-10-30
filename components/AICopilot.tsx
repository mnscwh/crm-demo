"use client";
import { useState } from "react";
import { SendHorizonal } from "lucide-react";

type Msg = {
  role: "user" | "ai";
  content: string;
};

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newUser: Msg = { role: "user", content: input };
    setMessages((prev) => [...prev, newUser]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-general", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: newUser.content }),
      });
      const data = await res.json();
      const reply: Msg = {
        role: "ai",
        content: data.answer || "Недостатньо даних.",
      };
      setMessages((prev) => [...prev, reply]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "⚠️ Помилка з’єднання з AI (демо режим)." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white/85 backdrop-blur-md border-l border-slate-200 shadow-2xl transition-all duration-500 flex flex-col ${
        open ? "w-96" : "w-10"
      }`}
    >
      <div className="flex items-center justify-between p-3">
        {open && <h2 className="font-semibold text-indigo-700">AI Copilot</h2>}
        <button
          onClick={() => setOpen(!open)}
          className="text-slate-600 hover:text-indigo-600 text-lg"
        >
          {open ? "→" : "←"}
        </button>
      </div>

      {open && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 text-sm">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-2 rounded-xl ${
                m.role === "user"
                  ? "bg-indigo-100 text-right"
                  : "bg-slate-100 text-left"
              }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <div className="text-xs text-slate-400 text-center py-2 animate-pulse">
              AI обробляє запит…
            </div>
          )}
        </div>
      )}

      {open && (
        <div className="border-t p-2 flex">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ваш запит..."
            className="flex-1 border rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-400 outline-none"
          />
          <button
            onClick={sendMessage}
            className="ml-2 text-indigo-600 hover:text-indigo-800"
          >
            <SendHorizonal size={20} />
          </button>
        </div>
      )}
    </div>
  );
}