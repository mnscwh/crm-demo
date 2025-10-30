// app/dashboard/chats/page.tsx  (раздел Чати — отдельный)
"use client";
import { AICopilot } from "@/components/AICopilot";

export default function ChatsPage() {
  return (
    <div className="animate-fadeIn">
      <AICopilot />
    </div>
  );
}