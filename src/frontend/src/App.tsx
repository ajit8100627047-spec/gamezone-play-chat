import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Gamepad2, Zap } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import Layout from "./components/Layout";
import ProfileSetup from "./components/ProfileSetup";
import { useActor } from "./hooks/useActor";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useProfile } from "./hooks/useQueries";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1 } },
});

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="w-16 h-16 mx-auto mb-4"
        >
          <Gamepad2 className="w-16 h-16 text-primary" />
        </motion.div>
        <p className="text-muted-foreground font-display text-lg tracking-widest uppercase">
          Loading GameZone...
        </p>
      </div>
    </div>
  );
}

function LandingPage() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.60 0.22 290 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.60 0.22 290 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* Glow orbs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
        style={{ background: "oklch(0.60 0.22 290)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-3xl opacity-15"
        style={{ background: "oklch(0.70 0.15 210)" }}
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 text-center px-6 max-w-2xl"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="mb-8"
        >
          <img
            src="/assets/generated/gamezone-logo-transparent.dim_80x80.png"
            alt="GameZone"
            className="w-24 h-24 mx-auto mb-4"
          />
        </motion.div>

        <h1
          className="font-display text-6xl md:text-8xl font-bold mb-4 text-glow-purple"
          style={{ color: "oklch(0.60 0.22 290)" }}
        >
          GAME<span style={{ color: "oklch(0.70 0.15 210)" }}>ZONE</span>
        </h1>
        <p className="text-muted-foreground text-xl mb-3 font-body">
          खेलो, जीतो, बातें करो — एक साथ!
        </p>
        <p className="text-muted-foreground/60 text-sm mb-10 font-body">
          Play Tic-Tac-Toe, Snake &amp; Memory Cards • Chat live • Top the
          leaderboard
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            data-ocid="landing.primary_button"
            onClick={() => login()}
            disabled={isLoggingIn}
            size="lg"
            className="relative text-lg px-10 py-6 font-display font-bold tracking-wider glow-purple transition-all hover:scale-105"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.60 0.22 290), oklch(0.55 0.20 260))",
              border: "1px solid oklch(0.60 0.22 290 / 0.5)",
            }}
          >
            <Zap className="mr-2 h-5 w-5" />
            {isLoggingIn ? "Connecting..." : "Play Now — Login"}
          </Button>
        </div>

        <div className="mt-16 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: "🎮", label: "3 Games", sub: "TicTacToe, Snake, Memory" },
            { icon: "💬", label: "Live Chat", sub: "Talk with players" },
            { icon: "🏆", label: "Leaderboard", sub: "Compete for the top" },
          ].map((f) => (
            <div
              key={f.label}
              className="p-4 rounded-xl"
              style={{
                background: "oklch(0.105 0.018 285)",
                border: "1px solid oklch(0.20 0.028 285)",
              }}
            >
              <div className="text-3xl mb-2">{f.icon}</div>
              <div className="font-display font-bold text-sm">{f.label}</div>
              <div className="text-muted-foreground text-xs mt-1">{f.sub}</div>
            </div>
          ))}
        </div>
      </motion.div>

      <footer className="absolute bottom-6 text-muted-foreground/50 text-xs">
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}

function AppInner() {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const { data: profile, isLoading: profileLoading } = useProfile();
  const [currentPage, setCurrentPage] = useState("lobby");

  if (isInitializing || (identity && actorFetching)) {
    return <LoadingScreen />;
  }

  if (!identity) {
    return <LandingPage />;
  }

  if (profileLoading) {
    return <LoadingScreen />;
  }

  if (!profile) {
    return <ProfileSetup />;
  }

  return (
    <AnimatePresence mode="wait">
      <Layout
        key="main"
        profile={profile}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
      <Toaster position="top-right" theme="dark" />
    </QueryClientProvider>
  );
}
