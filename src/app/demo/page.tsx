import type { Metadata } from "next";
import { ChatWorkspace } from "@/components/chat/chat-workspace";

export const metadata: Metadata = {
  title: "Astraea — Interactive demo",
  description:
    "Explore the Astraea workspace without an account. Responses are simulated locally; no external AI provider or production data is used.",
};

export default function DemoPage() {
  // Explicit preview mode bypasses repository reads and writes, not account authentication.
  return <ChatWorkspace email={null} isPreview />;
}
