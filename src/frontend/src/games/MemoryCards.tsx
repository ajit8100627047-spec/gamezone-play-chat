import { Button } from "@/components/ui/button";
import { Hash, RefreshCw, Timer } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRecordGameResult } from "../hooks/useQueries";

const EMOJIS = ["🎮", "🎯", "🎲", "🎸", "🎵", "🏆", "🌟", "🚀"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function buildDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  return pairs
    .sort(() => Math.random() - 0.5)
    .map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false }));
}

export default function MemoryCards() {
  const [cards, setCards] = useState<Card[]>(buildDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [won, setWon] = useState(false);
  const [resultRecorded, setResultRecorded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { mutateAsync: record } = useRecordGameResult();

  // Timer
  useEffect(() => {
    if (running && !won) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running, won]);

  // Check win
  useEffect(() => {
    if (!running || won) return;
    if (cards.every((c) => c.matched)) {
      setWon(true);
      setRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [cards, running, won]);

  // Record result when won
  useEffect(() => {
    if (!won || resultRecorded) return;
    setResultRecorded(true);
    const pts = Math.max(100, 1000 - moves * 10 - seconds * 2);
    toast.success(`🎉 You matched all cards! +${pts} points`);
    record({
      gameName: "MemoryCards",
      score: BigInt(pts),
      won: true,
      timestamp: BigInt(Date.now()) * 1_000_000n,
    }).catch(() => {});
  }, [won, moves, seconds, record, resultRecorded]);

  function handleFlip(id: number) {
    const card = cards.find((c) => c.id === id);
    if (!card || card.flipped || card.matched || selected.length >= 2) return;

    if (!running) setRunning(true);

    const newCards = cards.map((c) =>
      c.id === id ? { ...c, flipped: true } : c,
    );
    setCards(newCards);

    const newSelected = [...selected, id];
    setSelected(newSelected);

    if (newSelected.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = newSelected.map(
        (sid) => newCards.find((c) => c.id === sid)!,
      );
      if (a.emoji === b.emoji) {
        // Match!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newSelected.includes(c.id) ? { ...c, matched: true } : c,
            ),
          );
          setSelected([]);
        }, 400);
      } else {
        // No match - flip back
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              newSelected.includes(c.id) ? { ...c, flipped: false } : c,
            ),
          );
          setSelected([]);
        }, 900);
      }
    }
  }

  function resetGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    setCards(buildDeck());
    setSelected([]);
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setWon(false);
    setResultRecorded(false);
  }

  const matchedCount = cards.filter((c) => c.matched).length / 2;
  const pts = Math.max(100, 1000 - moves * 10 - seconds * 2);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold">Memory Cards</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Match all 8 pairs to win
            </p>
          </div>
          <Button
            data-ocid="memory.button"
            variant="outline"
            size="icon"
            onClick={resetGame}
            className="border-border hover:border-primary"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            {
              icon: Hash,
              label: "Moves",
              value: moves,
              color: "oklch(0.60 0.22 290)",
            },
            {
              icon: Timer,
              label: "Time",
              value: `${seconds}s`,
              color: "oklch(0.70 0.15 210)",
            },
            {
              icon: () => <span className="text-sm">🃏</span>,
              label: "Matched",
              value: `${matchedCount}/8`,
              color: "oklch(0.68 0.15 168)",
            },
          ].map(({ icon: Icon, label, value, color }) => (
            <div
              key={label}
              className="text-center rounded-xl py-3 px-2"
              style={{
                background: "oklch(0.105 0.018 285)",
                border: `1px solid ${color}30`,
              }}
            >
              <Icon className="w-4 h-4 mx-auto mb-1" style={{ color }} />
              <div className="font-display text-xl font-bold" style={{ color }}>
                {value}
              </div>
              <div className="text-muted-foreground text-xs">{label}</div>
            </div>
          ))}
        </div>

        {/* Card Grid */}
        <div
          data-ocid="memory.canvas_target"
          className="grid grid-cols-4 gap-3 mb-6"
        >
          {cards.map((card, i) => (
            <motion.div
              key={card.id}
              data-ocid={`memory.item.${i + 1}`}
              onClick={() => handleFlip(card.id)}
              className="aspect-square cursor-pointer"
              style={{ perspective: "600px" }}
              whileHover={{ scale: !card.flipped && !card.matched ? 1.04 : 1 }}
              whileTap={{ scale: !card.flipped && !card.matched ? 0.96 : 1 }}
            >
              <motion.div
                animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                transition={{ duration: 0.35, type: "spring", stiffness: 200 }}
                style={{
                  transformStyle: "preserve-3d",
                  width: "100%",
                  height: "100%",
                  position: "relative",
                }}
              >
                {/* Back */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl text-xl"
                  style={{
                    backfaceVisibility: "hidden",
                    background: "oklch(0.105 0.018 285)",
                    border: "2px solid oklch(0.60 0.22 290 / 0.3)",
                  }}
                >
                  <span className="text-2xl opacity-60">🎴</span>
                </div>
                {/* Front */}
                <div
                  className="absolute inset-0 flex items-center justify-center rounded-xl text-3xl"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: card.matched
                      ? "oklch(0.68 0.15 168 / 0.15)"
                      : "oklch(0.14 0.022 285)",
                    border: card.matched
                      ? "2px solid oklch(0.68 0.15 168 / 0.6)"
                      : "2px solid oklch(0.70 0.15 210 / 0.5)",
                    boxShadow: card.matched
                      ? "0 0 15px oklch(0.68 0.15 168 / 0.3)"
                      : undefined,
                  }}
                >
                  {card.emoji}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Win state */}
        <AnimatePresence>
          {won && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              data-ocid="memory.success_state"
              className="text-center p-6 rounded-2xl mb-4"
              style={{
                background: "oklch(0.68 0.15 168 / 0.1)",
                border: "2px solid oklch(0.68 0.15 168 / 0.5)",
                boxShadow: "0 0 30px oklch(0.68 0.15 168 / 0.2)",
              }}
            >
              <p className="text-4xl mb-2">🎉</p>
              <p
                className="font-display text-2xl font-bold mb-1"
                style={{ color: "oklch(0.68 0.15 168)" }}
              >
                You Won!
              </p>
              <p className="text-muted-foreground mb-1">
                {moves} moves in {seconds}s
              </p>
              <p
                className="font-display font-bold text-lg"
                style={{ color: "oklch(0.85 0.18 80)" }}
              >
                +{pts} points
              </p>
              <Button
                data-ocid="memory.primary_button"
                onClick={resetGame}
                className="mt-4 font-display font-bold"
                style={{ background: "oklch(0.68 0.15 168)" }}
              >
                Play Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {!running && !won && (
          <p className="text-center text-muted-foreground/60 text-sm">
            Click any card to start the timer!
          </p>
        )}
      </motion.div>
    </div>
  );
}
