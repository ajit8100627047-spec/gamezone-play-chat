import { Button } from "@/components/ui/button";
import {
  Gamepad2,
  Home,
  LogOut,
  MessageSquare,
  Trophy,
  User,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { UserProfile } from "../backend";
import MemoryCards from "../games/MemoryCards";
import SnakeGame from "../games/SnakeGame";
import TicTacToe from "../games/TicTacToe";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import Leaderboard from "../pages/Leaderboard";
import Lobby from "../pages/Lobby";
import Profile from "../pages/Profile";
import ChatPanel from "./Chat";

interface LayoutProps {
  profile: UserProfile;
  currentPage: string;
  setCurrentPage: (p: string) => void;
}

const NAV_ITEMS = [
  { id: "lobby", icon: Home, label: "Lobby" },
  { id: "tictactoe", icon: Gamepad2, label: "Tic-Tac-Toe" },
  { id: "snake", icon: Gamepad2, label: "Snake" },
  { id: "memory", icon: Gamepad2, label: "Memory" },
  { id: "leaderboard", icon: Trophy, label: "Leaderboard" },
  { id: "profile", icon: User, label: "Profile" },
];

function AvatarCircle({
  profile,
  size = 40,
}: { profile: UserProfile; size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-display font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: profile.avatarColor || "#8b5cf6",
        boxShadow: `0 0 12px ${profile.avatarColor || "#8b5cf6"}60`,
        fontSize: size * 0.4,
      }}
    >
      {profile.username[0]?.toUpperCase()}
    </div>
  );
}

function PageContent({
  currentPage,
  setCurrentPage,
  profile,
}: {
  currentPage: string;
  setCurrentPage: (p: string) => void;
  profile: UserProfile;
}) {
  switch (currentPage) {
    case "lobby":
      return <Lobby profile={profile} setCurrentPage={setCurrentPage} />;
    case "tictactoe":
      return <TicTacToe />;
    case "snake":
      return <SnakeGame />;
    case "memory":
      return <MemoryCards />;
    case "leaderboard":
      return <Leaderboard profile={profile} />;
    case "profile":
      return <Profile profile={profile} />;
    default:
      return <Lobby profile={profile} setCurrentPage={setCurrentPage} />;
  }
}

export default function Layout({
  profile,
  currentPage,
  setCurrentPage,
}: LayoutProps) {
  const { clear } = useInternetIdentity();
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className="w-20 flex flex-col items-center py-6 gap-2 flex-shrink-0 z-20"
        style={{
          background: "oklch(0.085 0.015 285)",
          borderRight: "1px solid oklch(0.20 0.028 285)",
        }}
      >
        {/* Logo */}
        <div className="mb-4">
          <img
            src="/assets/generated/gamezone-logo-transparent.dim_80x80.png"
            alt="GameZone"
            className="w-10 h-10"
          />
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1 w-full px-2">
          {NAV_ITEMS.map(({ id, icon: Icon, label }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                type="button"
                data-ocid={`nav.${id}.link`}
                onClick={() => setCurrentPage(id)}
                className="relative w-full flex flex-col items-center gap-1 py-3 rounded-xl transition-all hover:scale-105 group"
                style={{
                  background: active
                    ? "oklch(0.60 0.22 290 / 0.15)"
                    : "transparent",
                  border: active
                    ? "1px solid oklch(0.60 0.22 290 / 0.4)"
                    : "1px solid transparent",
                }}
                title={label}
              >
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ background: "oklch(0.60 0.22 290)" }}
                  />
                )}
                <Icon
                  className="w-5 h-5 transition-colors"
                  style={{
                    color: active
                      ? "oklch(0.60 0.22 290)"
                      : "oklch(0.55 0.02 285)",
                  }}
                />
                <span
                  className="text-[9px] font-display font-semibold tracking-wide transition-colors"
                  style={{
                    color: active
                      ? "oklch(0.60 0.22 290)"
                      : "oklch(0.55 0.02 285)",
                  }}
                >
                  {label.slice(0, 6)}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Avatar + Logout */}
        <div className="flex flex-col items-center gap-3 mt-auto">
          <button
            type="button"
            data-ocid="nav.profile.toggle"
            onClick={() => setCurrentPage("profile")}
            className="hover:scale-110 transition-transform"
            title={profile.username}
          >
            <AvatarCircle profile={profile} size={36} />
          </button>
          <Button
            data-ocid="nav.logout.button"
            variant="ghost"
            size="icon"
            onClick={() => clear()}
            className="w-9 h-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col min-w-0">
        {/* Top bar (mobile chat toggle) */}
        <div
          className="flex items-center justify-between px-4 py-3 lg:hidden flex-shrink-0"
          style={{ borderBottom: "1px solid oklch(0.20 0.028 285)" }}
        >
          <span
            className="font-display font-bold text-sm"
            style={{ color: "oklch(0.60 0.22 290)" }}
          >
            {NAV_ITEMS.find((n) => n.id === currentPage)?.label ?? "GameZone"}
          </span>
          <Button
            data-ocid="nav.chat.toggle"
            variant="ghost"
            size="icon"
            onClick={() => setChatOpen(!chatOpen)}
            className="text-muted-foreground"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-gaming">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="h-full"
            >
              <PageContent
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                profile={profile}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Chat Panel - Desktop always visible, Mobile overlay */}
      <div
        className="hidden lg:flex w-80 flex-shrink-0"
        style={{ borderLeft: "1px solid oklch(0.20 0.028 285)" }}
      >
        <ChatPanel profile={profile} />
      </div>

      {/* Mobile Chat Overlay */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm z-50 lg:hidden"
            style={{
              background: "oklch(0.085 0.015 285)",
              borderLeft: "1px solid oklch(0.20 0.028 285)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid oklch(0.20 0.028 285)" }}
            >
              <span className="font-display font-bold">Live Chat</span>
              <Button
                data-ocid="chat.close_button"
                variant="ghost"
                size="icon"
                onClick={() => setChatOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ChatPanel profile={profile} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
