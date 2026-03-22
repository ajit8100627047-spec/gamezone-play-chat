import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CheckCircle2,
  Gamepad2,
  Loader2,
  Target,
  Trophy,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserProfile } from "../backend";
import { useChangeAvatarColor, useGameHistory } from "../hooks/useQueries";

const AVATAR_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
  "#a855f7",
  "#f97316",
  "#84cc16",
  "#06b6d4",
];

function formatDate(ts: bigint): string {
  try {
    const ms = Number(ts / 1_000_000n);
    return new Date(ms).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

const GAME_EMOJIS: Record<string, string> = {
  TicTacToe: "⭕",
  Snake: "🐍",
  MemoryCards: "🃏",
};

interface ProfileProps {
  profile: UserProfile;
}

export default function Profile({ profile }: ProfileProps) {
  const { data: history = [], isLoading: historyLoading } = useGameHistory();
  const { mutateAsync: changeColor, isPending: colorPending } =
    useChangeAvatarColor();
  const [selectedColor, setSelectedColor] = useState(
    profile.avatarColor || "#8b5cf6",
  );

  const gamesPlayed = Number(profile.gamesPlayed);
  const wins = Number(profile.wins);
  const totalScore = Number(profile.totalScore);
  const losses = gamesPlayed - wins;
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  async function handleColorSave() {
    try {
      await changeColor(selectedColor);
      toast.success("Avatar color updated! 🎨");
    } catch {
      toast.error("Failed to update color.");
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        {/* Avatar + Name */}
        <div
          className="md:col-span-1 rounded-2xl p-6 flex flex-col items-center text-center"
          style={{
            background: "oklch(0.105 0.018 285)",
            border: "1px solid oklch(0.20 0.028 285)",
          }}
        >
          <motion.div
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-display font-bold text-white mb-4"
            style={{
              background: selectedColor,
              boxShadow: `0 0 30px ${selectedColor}60`,
            }}
          >
            {profile.username[0]?.toUpperCase()}
          </motion.div>
          <h2 className="font-display text-2xl font-bold">
            {profile.username}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Gamer</p>

          {/* Color Picker */}
          <div className="mt-6 w-full">
            <Label className="text-xs font-display font-semibold tracking-wide text-muted-foreground mb-3 block">
              CHANGE AVATAR COLOR
            </Label>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  data-ocid="profile.select"
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className="w-8 h-8 rounded-full transition-all hover:scale-110 focus:outline-none"
                  style={{
                    background: color,
                    border:
                      selectedColor === color
                        ? "2px solid white"
                        : "2px solid transparent",
                    boxShadow:
                      selectedColor === color ? `0 0 12px ${color}` : "none",
                    transform:
                      selectedColor === color ? "scale(1.2)" : undefined,
                  }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
            <Button
              data-ocid="profile.save_button"
              size="sm"
              onClick={handleColorSave}
              disabled={colorPending || selectedColor === profile.avatarColor}
              className="w-full font-display font-bold text-xs tracking-wide"
              style={{ background: "oklch(0.60 0.22 290)", color: "white" }}
            >
              {colorPending ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : null}
              {colorPending ? "Saving..." : "Save Color"}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-2 gap-4 content-start">
          {[
            {
              icon: Trophy,
              label: "Total Score",
              value: totalScore.toLocaleString(),
              color: "oklch(0.60 0.22 290)",
              glow: "oklch(0.60 0.22 290 / 0.2)",
            },
            {
              icon: Gamepad2,
              label: "Games Played",
              value: gamesPlayed.toString(),
              color: "oklch(0.70 0.15 210)",
              glow: "oklch(0.70 0.15 210 / 0.2)",
            },
            {
              icon: CheckCircle2,
              label: "Wins",
              value: wins.toString(),
              color: "oklch(0.68 0.15 168)",
              glow: "oklch(0.68 0.15 168 / 0.2)",
            },
            {
              icon: Target,
              label: "Win Rate",
              value: `${winRate}%`,
              color: "oklch(0.85 0.18 80)",
              glow: "oklch(0.85 0.18 80 / 0.2)",
            },
          ].map(({ icon: Icon, label, value, color, glow }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="rounded-xl p-5"
              style={{
                background: "oklch(0.105 0.018 285)",
                border: `1px solid ${color}30`,
                boxShadow: `0 0 20px ${glow}`,
              }}
            >
              <Icon className="w-6 h-6 mb-2" style={{ color }} />
              <div
                className="font-display text-2xl font-bold"
                style={{ color }}
              >
                {value}
              </div>
              <div className="text-muted-foreground text-sm">{label}</div>
            </motion.div>
          ))}
          {/* Losses */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-xl p-5"
            style={{
              background: "oklch(0.105 0.018 285)",
              border: "1px solid oklch(0.577 0.245 27.325 / 0.3)",
            }}
          >
            <XCircle
              className="w-6 h-6 mb-2"
              style={{ color: "oklch(0.577 0.245 27.325)" }}
            />
            <div
              className="font-display text-2xl font-bold"
              style={{ color: "oklch(0.577 0.245 27.325)" }}
            >
              {losses}
            </div>
            <div className="text-muted-foreground text-sm">Losses</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Game History */}
      <div>
        <h2
          className="font-display text-xl font-bold mb-4"
          style={{ color: "oklch(0.70 0.15 210)" }}
        >
          📜 GAME HISTORY
        </h2>
        {historyLoading ? (
          <div
            data-ocid="profile.loading_state"
            className="flex justify-center py-10"
          >
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: "oklch(0.60 0.22 290)" }}
            />
          </div>
        ) : history.length === 0 ? (
          <div
            data-ocid="profile.empty_state"
            className="text-center py-10 rounded-xl"
            style={{
              background: "oklch(0.105 0.018 285)",
              border: "1px solid oklch(0.20 0.028 285)",
            }}
          >
            <Gamepad2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground">
              No games played yet. Start playing!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.slice(0, 10).map((game, i) => (
              <motion.div
                key={`${game.gameName}-${game.timestamp}-${i}`}
                data-ocid={`profile.item.${i + 1}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 rounded-xl px-4 py-3"
                style={{
                  background: "oklch(0.105 0.018 285)",
                  border: `1px solid ${game.won ? "oklch(0.68 0.15 168 / 0.3)" : "oklch(0.20 0.028 285)"}`,
                }}
              >
                <span className="text-2xl">
                  {GAME_EMOJIS[game.gameName] ?? "🎮"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-display font-semibold text-sm">
                    {game.gameName}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {formatDate(game.timestamp)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className="font-display font-bold"
                    style={{
                      color: game.won
                        ? "oklch(0.68 0.15 168)"
                        : "oklch(0.577 0.245 27.325)",
                    }}
                  >
                    {game.won ? "WON" : "LOST"}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {Number(game.score)} pts
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
