import { Crown, Loader2, Trophy } from "lucide-react";
import { motion } from "motion/react";
import type { UserProfile } from "../backend";
import { useLeaderboard } from "../hooks/useQueries";

const RANK_COLORS = [
  "oklch(0.85 0.18 80)", // gold
  "oklch(0.75 0.05 250)", // silver
  "oklch(0.62 0.10 50)", // bronze
];

const RANK_EMOJIS = ["🥇", "🥈", "🥉"];

interface LeaderboardProps {
  profile: UserProfile;
}

export default function Leaderboard({ profile }: LeaderboardProps) {
  const { data: players = [], isLoading } = useLeaderboard();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center gap-3 mb-8"
      >
        <Crown className="w-8 h-8" style={{ color: "oklch(0.85 0.18 80)" }} />
        <div>
          <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">
            Top 10 players by total score
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <div
          data-ocid="leaderboard.loading_state"
          className="flex items-center justify-center py-20"
        >
          <Loader2
            className="w-8 h-8 animate-spin"
            style={{ color: "oklch(0.60 0.22 290)" }}
          />
        </div>
      ) : players.length === 0 ? (
        <div data-ocid="leaderboard.empty_state" className="text-center py-20">
          <Trophy className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground">No players yet. Be the first!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {players.map((player, i) => {
            const isMe = player.username === profile.username;
            const rank = i + 1;
            const rankColor = RANK_COLORS[i] ?? "oklch(0.55 0.02 285)";
            const winRate =
              Number(player.gamesPlayed) > 0
                ? Math.round(
                    (Number(player.wins) / Number(player.gamesPlayed)) * 100,
                  )
                : 0;

            return (
              <motion.div
                key={player.username}
                data-ocid={`leaderboard.item.${rank}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-xl px-4 py-3 transition-all"
                style={{
                  background: isMe
                    ? "oklch(0.60 0.22 290 / 0.1)"
                    : "oklch(0.105 0.018 285)",
                  border: isMe
                    ? "1px solid oklch(0.60 0.22 290 / 0.5)"
                    : "1px solid oklch(0.20 0.028 285)",
                  boxShadow: isMe
                    ? "0 0 20px oklch(0.60 0.22 290 / 0.15)"
                    : undefined,
                }}
              >
                {/* Rank */}
                <div
                  className="w-10 h-10 flex items-center justify-center flex-shrink-0 font-display font-bold text-lg"
                  style={{ color: rankColor }}
                >
                  {RANK_EMOJIS[i] ?? `#${rank}`}
                </div>

                {/* Avatar */}
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-bold text-white flex-shrink-0"
                  style={{
                    background: player.avatarColor || "#8b5cf6",
                    boxShadow: `0 0 10px ${player.avatarColor || "#8b5cf6"}50`,
                  }}
                >
                  {player.username[0]?.toUpperCase()}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold truncate">
                      {player.username}
                    </span>
                    {isMe && (
                      <span
                        className="text-[10px] font-display font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: "oklch(0.60 0.22 290 / 0.2)",
                          color: "oklch(0.60 0.22 290)",
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {Number(player.gamesPlayed)} games • {winRate}% wins
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <div
                    className="font-display font-bold text-lg"
                    style={{ color: rankColor }}
                  >
                    {Number(player.totalScore).toLocaleString()}
                  </div>
                  <div className="text-muted-foreground text-xs">points</div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
