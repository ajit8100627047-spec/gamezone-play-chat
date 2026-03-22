import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Brain, RefreshCw } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useRecordGameResult } from "../hooks/useQueries";

type Cell = "X" | "O" | null;
type Board = Cell[];

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const CELL_KEYS = ["c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"];

function checkWinner(board: Board): { winner: Cell; line: number[] | null } {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  return { winner: null, line: null };
}

function isBoardFull(board: Board): boolean {
  return board.every((c) => c !== null);
}

function minimax(board: Board, isMax: boolean, depth: number): number {
  const { winner } = checkWinner(board);
  if (winner === "O") return 10 - depth;
  if (winner === "X") return depth - 10;
  if (isBoardFull(board)) return 0;

  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    const next = [...board];
    next[i] = isMax ? "O" : "X";
    scores.push(minimax(next, !isMax, depth + 1));
  }
  return isMax ? Math.max(...scores) : Math.min(...scores);
}

function getBestMove(board: Board): number {
  let best = Number.NEGATIVE_INFINITY;
  let move = -1;
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    const next = [...board];
    next[i] = "O";
    const score = minimax(next, false, 0);
    if (score > best) {
      best = score;
      move = i;
    }
  }
  return move;
}

function getEasyMove(board: Board): number {
  const empty = board
    .map((v, i) => (v === null ? i : -1))
    .filter((i) => i >= 0);
  if (Math.random() < 0.5)
    return empty[Math.floor(Math.random() * empty.length)];
  return getBestMove(board);
}

export default function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [isHardMode, setIsHardMode] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState({ wins: 0, losses: 0, draws: 0 });
  const [resultRecorded, setResultRecorded] = useState(false);
  const { mutateAsync: record } = useRecordGameResult();

  const { winner, line: winLine } = checkWinner(board);
  const isDraw = !winner && isBoardFull(board);

  const recordResult = useCallback(
    async (won: boolean, pts: number) => {
      if (resultRecorded) return;
      setResultRecorded(true);
      try {
        await record({
          gameName: "TicTacToe",
          score: BigInt(pts),
          won,
          timestamp: BigInt(Date.now()) * 1_000_000n,
        });
      } catch {
        /* ignore */
      }
    },
    [record, resultRecorded],
  );

  async function handleClick(i: number) {
    if (board[i] || winner || isDraw || isAiThinking || gameOver) return;

    const newBoard = [...board];
    newBoard[i] = "X";
    setBoard(newBoard);

    const { winner: w1 } = checkWinner(newBoard);
    if (w1 === "X") {
      setGameOver(true);
      setScore((s) => ({ ...s, wins: s.wins + 1 }));
      toast.success("🎉 You win! +100 points");
      await recordResult(true, 100);
      return;
    }
    if (isBoardFull(newBoard)) {
      setGameOver(true);
      setScore((s) => ({ ...s, draws: s.draws + 1 }));
      toast("🤝 Draw! +10 points");
      await recordResult(false, 10);
      return;
    }

    setIsAiThinking(true);
    await new Promise((r) => setTimeout(r, 400));

    const aiMove = isHardMode ? getBestMove(newBoard) : getEasyMove(newBoard);
    if (aiMove === -1) {
      setIsAiThinking(false);
      return;
    }

    const aiBoard = [...newBoard];
    aiBoard[aiMove] = "O";
    setBoard(aiBoard);
    setIsAiThinking(false);

    const { winner: w2 } = checkWinner(aiBoard);
    if (w2 === "O") {
      setGameOver(true);
      setScore((s) => ({ ...s, losses: s.losses + 1 }));
      toast.error("💀 AI wins! +0 points");
      await recordResult(false, 0);
    } else if (isBoardFull(aiBoard)) {
      setGameOver(true);
      setScore((s) => ({ ...s, draws: s.draws + 1 }));
      toast("🤝 Draw! +10 points");
      await recordResult(false, 10);
    }
  }

  function resetGame() {
    setBoard(Array(9).fill(null));
    setGameOver(false);
    setResultRecorded(false);
  }

  return (
    <div className="p-6 max-w-lg mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-3xl font-bold">Tic-Tac-Toe</h1>
            <p className="text-muted-foreground text-sm mt-1">
              You are <span style={{ color: "oklch(0.70 0.15 210)" }}>X</span>,
              AI is <span style={{ color: "oklch(0.60 0.22 290)" }}>O</span>
            </p>
          </div>
          <Button
            data-ocid="tictactoe.button"
            variant="outline"
            size="icon"
            onClick={resetGame}
            className="border-border hover:border-primary"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Mode Toggle */}
        <div
          className="flex items-center gap-3 mb-6 p-3 rounded-xl"
          style={{
            background: "oklch(0.105 0.018 285)",
            border: "1px solid oklch(0.20 0.028 285)",
          }}
        >
          <Brain
            className="w-4 h-4"
            style={{ color: "oklch(0.60 0.22 290)" }}
          />
          <Label
            htmlFor="hard-mode"
            className="font-display text-sm cursor-pointer flex-1"
          >
            AI Difficulty:{" "}
            <span style={{ color: "oklch(0.60 0.22 290)" }}>
              {isHardMode ? "UNBEATABLE" : "EASY"}
            </span>
          </Label>
          <Switch
            id="hard-mode"
            data-ocid="tictactoe.switch"
            checked={isHardMode}
            onCheckedChange={(v) => {
              setIsHardMode(v);
              resetGame();
            }}
          />
        </div>

        {/* Score */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Wins", value: score.wins, color: "oklch(0.68 0.15 168)" },
            {
              label: "Draws",
              value: score.draws,
              color: "oklch(0.70 0.15 210)",
            },
            {
              label: "Losses",
              value: score.losses,
              color: "oklch(0.577 0.245 27.325)",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="text-center rounded-xl py-3"
              style={{
                background: "oklch(0.105 0.018 285)",
                border: `1px solid ${color}30`,
              }}
            >
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

        {/* Status */}
        <AnimatePresence mode="wait">
          <motion.div
            key={
              winner
                ? "won"
                : isDraw
                  ? "draw"
                  : isAiThinking
                    ? "thinking"
                    : "playing"
            }
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center mb-4 h-8"
          >
            {winner === "X" && (
              <p
                className="font-display font-bold text-lg"
                style={{ color: "oklch(0.68 0.15 168)" }}
              >
                🎉 You Win!
              </p>
            )}
            {winner === "O" && (
              <p
                className="font-display font-bold text-lg"
                style={{ color: "oklch(0.577 0.245 27.325)" }}
              >
                💀 AI Wins!
              </p>
            )}
            {isDraw && (
              <p
                className="font-display font-bold text-lg"
                style={{ color: "oklch(0.70 0.15 210)" }}
              >
                🤝 Draw!
              </p>
            )}
            {isAiThinking && (
              <p className="font-display text-sm text-muted-foreground animate-pulse">
                🤔 AI is thinking...
              </p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Board */}
        <div
          data-ocid="tictactoe.canvas_target"
          className="grid grid-cols-3 gap-3 mb-6"
        >
          {board.map((cell, i) => {
            const isWinCell = winLine?.includes(i);
            return (
              <motion.button
                key={CELL_KEYS[i]}
                type="button"
                data-ocid={`tictactoe.item.${i + 1}`}
                onClick={() => handleClick(i)}
                whileHover={!cell && !winner && !isDraw ? { scale: 1.05 } : {}}
                whileTap={!cell && !winner && !isDraw ? { scale: 0.95 } : {}}
                className="aspect-square flex items-center justify-center rounded-xl text-4xl font-display font-bold transition-all"
                style={{
                  background: isWinCell
                    ? winner === "X"
                      ? "oklch(0.68 0.15 168 / 0.2)"
                      : "oklch(0.60 0.22 290 / 0.2)"
                    : "oklch(0.105 0.018 285)",
                  border: isWinCell
                    ? `2px solid ${winner === "X" ? "oklch(0.68 0.15 168)" : "oklch(0.60 0.22 290)"}`
                    : "2px solid oklch(0.20 0.028 285)",
                  boxShadow: isWinCell
                    ? `0 0 20px ${winner === "X" ? "oklch(0.68 0.15 168 / 0.4)" : "oklch(0.60 0.22 290 / 0.4)"}`
                    : undefined,
                  cursor:
                    cell || winner || isDraw || isAiThinking
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                <AnimatePresence>
                  {cell && (
                    <motion.span
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0 }}
                      style={{
                        color:
                          cell === "X"
                            ? "oklch(0.70 0.15 210)"
                            : "oklch(0.60 0.22 290)",
                      }}
                    >
                      {cell}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </div>

        {(winner || isDraw) && (
          <Button
            data-ocid="tictactoe.primary_button"
            onClick={resetGame}
            className="w-full font-display font-bold tracking-wider"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.60 0.22 290), oklch(0.55 0.20 260))",
            }}
          >
            Play Again
          </Button>
        )}
      </motion.div>
    </div>
  );
}
