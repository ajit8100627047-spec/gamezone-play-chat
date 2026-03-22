import { Button } from "@/components/ui/button";
import { Star, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile } from "../backend";

interface LobbyProps {
  profile: UserProfile;
  setCurrentPage: (p: string) => void;
}

const GAMES = [
  {
    id: "tictactoe",
    emoji: "⭕",
    name: "Tic-Tac-Toe",
    desc: "Classic 3×3 grid. Challenge our unbeatable AI — can you win?",
    color: "oklch(0.60 0.22 290)",
    glow: "glow-purple",
    players: "1 vs AI",
    difficulty: "Hard",
  },
  {
    id: "snake",
    emoji: "🐍",
    name: "Snake",
    desc: "Eat food, grow longer, don't hit the walls or yourself!",
    color: "oklch(0.68 0.15 168)",
    glow: "glow-green",
    players: "Solo",
    difficulty: "Medium",
  },
  {
    id: "memory",
    emoji: "🃏",
    name: "Memory Cards",
    desc: "Flip and match 8 pairs of cards. Test your memory!",
    color: "oklch(0.70 0.15 210)",
    glow: "glow-cyan",
    players: "Solo",
    difficulty: "Easy",
  },
];

export default function Lobby({ profile, setCurrentPage }: LobbyProps) {
  const totalScore = Number(profile.totalScore);
  const gamesPlayed = Number(profile.gamesPlayed);
  const wins = Number(profile.wins);
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl p-6 mb-8"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.105 0.018 285), oklch(0.12 0.025 285))",
          border: "1px solid oklch(0.60 0.22 290 / 0.3)",
          boxShadow: "0 0 40px oklch(0.60 0.22 290 / 0.1)",
        }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "linear-gradient(45deg, oklch(0.60 0.22 290) 25%, transparent 25%), linear-gradient(-45deg, oklch(0.60 0.22 290) 25%, transparent 25%)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap
                className="w-5 h-5"
                style={{ color: "oklch(0.60 0.22 290)" }}
              />
              <span className="text-muted-foreground text-sm font-display tracking-wider uppercase">
                Welcome back
              </span>
            </div>
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              {profile.username}
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              {gamesPlayed === 0
                ? "Ready to play your first game?"
                : `${gamesPlayed} games played • ${winRate}% win rate`}
            </p>
          </div>
          <div className="flex gap-4">
            {[
              {
                icon: Trophy,
                label: "Score",
                value: totalScore.toLocaleString(),
                color: "oklch(0.60 0.22 290)",
              },
              {
                icon: Star,
                label: "Wins",
                value: wins.toString(),
                color: "oklch(0.68 0.15 168)",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div
                key={label}
                className="text-center p-3 rounded-xl"
                style={{
                  background: "oklch(0.065 0.012 285)",
                  border: `1px solid ${color}30`,
                }}
              >
                <Icon className="w-5 h-5 mx-auto mb-1" style={{ color }} />
                <div
                  className="font-display text-2xl font-bold"
                  style={{ color }}
                >
                  {value}
                </div>
                <div className="text-muted-foreground text-xs">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Game Cards */}
      <h2
        className="font-display text-xl font-bold mb-4 tracking-wide"
        style={{ color: "oklch(0.70 0.15 210)" }}
      >
        🎮 CHOOSE YOUR GAME
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="group rounded-2xl p-5 cursor-pointer transition-all"
            style={{
              background: "oklch(0.105 0.018 285)",
              border: `1px solid ${game.color}30`,
            }}
          >
            <div className="relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl blur-xl"
                style={{ background: game.color, opacity: 0.05 }}
              />
              <div className="text-5xl mb-3 animate-float">{game.emoji}</div>
              <h3
                className="font-display text-xl font-bold mb-2"
                style={{ color: game.color }}
              >
                {game.name}
              </h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                {game.desc}
              </p>
              <div className="flex gap-2 mb-4">
                <span
                  className="text-xs font-display font-semibold px-2 py-1 rounded-full"
                  style={{
                    background: `${game.color}20`,
                    color: game.color,
                    border: `1px solid ${game.color}40`,
                  }}
                >
                  {game.players}
                </span>
                <span
                  className="text-xs font-display font-semibold px-2 py-1 rounded-full"
                  style={{
                    background: "oklch(0.14 0.022 285)",
                    color: "oklch(0.55 0.02 285)",
                    border: "1px solid oklch(0.20 0.028 285)",
                  }}
                >
                  {game.difficulty}
                </span>
              </div>
              <Button
                data-ocid={`lobby.${game.id}.button`}
                onClick={() => setCurrentPage(game.id)}
                className="w-full font-display font-bold tracking-wider transition-all group-hover:scale-[1.02]"
                style={{
                  background: `linear-gradient(135deg, ${game.color}, ${game.color}cc)`,
                  boxShadow: `0 4px 20px ${game.color}30`,
                }}
              >
                PLAY NOW
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-muted-foreground/40 text-xs">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-muted-foreground/70 transition-colors"
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
