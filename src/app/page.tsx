import { AppShell } from "./app/_components/AppShell";
import { ChatMessageScreen } from "./app/_components/chat/ChatMessageScreen";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <AppShell>
      <ChatMessageScreen initialMessages={[]} redirectToChatOnFirstMessage />
    </AppShell>
  );
}
