import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageSquare, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { UserProfile } from "../backend";
import { useRecentMessages, useSendMessage } from "../hooks/useQueries";

function formatTime(ts: bigint): string {
  try {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

interface ChatPanelProps {
  profile: UserProfile;
}

export default function ChatPanel({ profile }: ChatPanelProps) {
  const { data: messages = [] } = useRecentMessages();
  const { mutateAsync: sendMsg, isPending } = useSendMessage();
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const msgCount = messages.length;

  useEffect(() => {
    if (msgCount >= 0) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [msgCount]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    try {
      await sendMsg(trimmed);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid oklch(0.20 0.028 285)" }}
      >
        <MessageSquare
          className="w-4 h-4"
          style={{ color: "oklch(0.70 0.15 210)" }}
        />
        <span className="font-display font-bold text-sm tracking-wide">
          LIVE CHAT
        </span>
        <div
          className="ml-auto w-2 h-2 rounded-full animate-pulse"
          style={{ background: "oklch(0.68 0.15 168)" }}
          title="Live"
        />
      </div>

      {/* Messages */}
      <div
        data-ocid="chat.panel"
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3 scrollbar-gaming"
      >
        {messages.length === 0 ? (
          <div
            data-ocid="chat.empty_state"
            className="text-center text-muted-foreground/50 text-sm mt-8"
          >
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No messages yet.</p>
            <p className="text-xs mt-1">Say hi! 👋</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((msg, i) => {
              const isMe = msg.sender === profile.username;
              return (
                <motion.div
                  key={`${msg.sender}-${String(msg.timestamp)}-${i}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  data-ocid={`chat.item.${i + 1}`}
                  className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold text-white flex-shrink-0 mt-0.5"
                    style={{
                      background: isMe
                        ? profile.avatarColor || "#8b5cf6"
                        : "oklch(0.70 0.15 210)",
                    }}
                  >
                    {msg.sender[0]?.toUpperCase()}
                  </div>
                  <div
                    className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <div className="flex items-baseline gap-1 mb-0.5">
                      <span
                        className="text-xs font-display font-semibold"
                        style={{
                          color: isMe
                            ? "oklch(0.60 0.22 290)"
                            : "oklch(0.70 0.15 210)",
                        }}
                      >
                        {isMe ? "You" : msg.sender}
                      </span>
                      <span className="text-[10px] text-muted-foreground/50">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <div
                      className="rounded-xl px-3 py-2 text-sm break-words"
                      style={{
                        background: isMe
                          ? "oklch(0.60 0.22 290 / 0.2)"
                          : "oklch(0.14 0.022 285)",
                        border: `1px solid ${
                          isMe
                            ? "oklch(0.60 0.22 290 / 0.3)"
                            : "oklch(0.20 0.028 285)"
                        }`,
                      }}
                    >
                      {msg.content}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        className="flex gap-2 px-3 py-3 flex-shrink-0"
        style={{ borderTop: "1px solid oklch(0.20 0.028 285)" }}
      >
        <Input
          data-ocid="chat.input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 bg-input border-border text-sm h-9"
          disabled={isPending}
        />
        <Button
          data-ocid="chat.submit_button"
          size="icon"
          onClick={handleSend}
          disabled={isPending || !text.trim()}
          className="h-9 w-9 flex-shrink-0"
          style={{ background: "oklch(0.60 0.22 290)", color: "white" }}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
