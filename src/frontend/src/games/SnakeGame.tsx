import { Button } from "@/components/ui/button";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Play,
  RefreshCw,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRecordGameResult } from "../hooks/useQueries";

const GRID = 20;
const CELL = 20;
const CANVAS_SIZE = GRID * CELL;
const TICK_MS = 120;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };

function rand(): Pos {
  return {
    x: Math.floor(Math.random() * GRID),
    y: Math.floor(Math.random() * GRID),
  };
}

function posEq(a: Pos, b: Pos) {
  return a.x === b.x && a.y === b.y;
}

function spawnFood(snake: Pos[]): Pos {
  let food: Pos;
  do {
    food = rand();
  } while (snake.some((s) => posEq(s, food)));
  return food;
}

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef({
    snake: [{ x: 10, y: 10 }] as Pos[],
    dir: "RIGHT" as Dir,
    nextDir: "RIGHT" as Dir,
    food: { x: 15, y: 10 } as Pos,
    score: 0,
    running: false,
    dead: false,
  });
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "running" | "dead">(
    "idle",
  );
  const [resultRecorded, setResultRecorded] = useState(false);
  const { mutateAsync: record } = useRecordGameResult();

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { snake, food } = stateRef.current;

    // Background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Grid dots
    ctx.fillStyle = "rgba(139,92,246,0.08)";
    for (let x = 0; x < GRID; x++) {
      for (let y = 0; y < GRID; y++) {
        ctx.beginPath();
        ctx.arc(x * CELL + CELL / 2, y * CELL + CELL / 2, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Food
    ctx.shadowColor = "#10b981";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.roundRect(food.x * CELL + 3, food.y * CELL + 3, CELL - 6, CELL - 6, 4);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Snake
    snake.forEach((seg, i) => {
      const isHead = i === 0;
      const alpha = isHead
        ? 1
        : 0.6 + (0.4 * (snake.length - i)) / snake.length;
      ctx.shadowColor = isHead ? "#8b5cf6" : "transparent";
      ctx.shadowBlur = isHead ? 12 : 0;
      ctx.fillStyle = isHead
        ? `rgba(139,92,246,${alpha})`
        : `rgba(99,102,241,${alpha})`;
      ctx.beginPath();
      ctx.roundRect(
        seg.x * CELL + 1,
        seg.y * CELL + 1,
        CELL - 2,
        CELL - 2,
        isHead ? 6 : 3,
      );
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  }, []);

  const tick = useCallback(() => {
    const s = stateRef.current;
    if (!s.running) return;

    s.dir = s.nextDir;
    const head = s.snake[0];
    const next: Pos = {
      x:
        (head.x + (s.dir === "RIGHT" ? 1 : s.dir === "LEFT" ? -1 : 0) + GRID) %
        GRID,
      y:
        (head.y + (s.dir === "DOWN" ? 1 : s.dir === "UP" ? -1 : 0) + GRID) %
        GRID,
    };

    // Self-collision
    if (s.snake.some((seg) => posEq(seg, next))) {
      s.running = false;
      s.dead = true;
      setGameState("dead");
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const ate = posEq(next, s.food);
    s.snake = [next, ...(ate ? s.snake : s.snake.slice(0, -1))];
    if (ate) {
      s.score += 10;
      s.food = spawnFood(s.snake);
      setDisplayScore(s.score);
    }
    draw();
  }, [draw]);

  // Handle game over
  useEffect(() => {
    if (gameState !== "dead" || resultRecorded) return;
    const finalScore = stateRef.current.score;
    setResultRecorded(true);
    draw();
    toast.error(`💀 Game Over! Score: ${finalScore}`);
    record({
      gameName: "Snake",
      score: BigInt(finalScore),
      won: finalScore > 0,
      timestamp: BigInt(Date.now()) * 1_000_000n,
    }).catch(() => {});
  }, [gameState, record, draw, resultRecorded]);

  // Keyboard
  useEffect(() => {
    const DIR_MAP: Record<string, Dir> = {
      ArrowUp: "UP",
      ArrowDown: "DOWN",
      ArrowLeft: "LEFT",
      ArrowRight: "RIGHT",
      w: "UP",
      s: "DOWN",
      a: "LEFT",
      d: "RIGHT",
    };
    const OPPOSITE: Record<Dir, Dir> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };

    function handleKey(e: KeyboardEvent) {
      const newDir = DIR_MAP[e.key];
      if (!newDir) return;
      e.preventDefault();
      const s = stateRef.current;
      if (newDir !== OPPOSITE[s.dir]) s.nextDir = newDir;
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  function startGame() {
    if (timerRef.current) clearInterval(timerRef.current);
    const initSnake = [{ x: 10, y: 10 }];
    stateRef.current = {
      snake: initSnake,
      dir: "RIGHT",
      nextDir: "RIGHT",
      food: spawnFood(initSnake),
      score: 0,
      running: true,
      dead: false,
    };
    setDisplayScore(0);
    setGameState("running");
    setResultRecorded(false);
    timerRef.current = setInterval(tick, TICK_MS);
    draw();
  }

  useEffect(() => {
    draw();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [draw]);

  function setDir(d: Dir) {
    const OPPOSITE: Record<Dir, Dir> = {
      UP: "DOWN",
      DOWN: "UP",
      LEFT: "RIGHT",
      RIGHT: "LEFT",
    };
    const s = stateRef.current;
    if (d !== OPPOSITE[s.dir]) s.nextDir = d;
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
            <h1 className="font-display text-3xl font-bold">Snake</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Use arrow keys or on-screen buttons
            </p>
          </div>
          <div
            className="px-4 py-2 rounded-xl font-display font-bold text-xl"
            style={{
              background: "oklch(0.68 0.15 168 / 0.15)",
              color: "oklch(0.68 0.15 168)",
              border: "1px solid oklch(0.68 0.15 168 / 0.4)",
            }}
          >
            {displayScore}
          </div>
        </div>

        {/* Canvas */}
        <div
          className="relative rounded-2xl overflow-hidden mb-6"
          style={{
            border: "2px solid oklch(0.60 0.22 290 / 0.4)",
            boxShadow: "0 0 30px oklch(0.60 0.22 290 / 0.15)",
          }}
        >
          <canvas
            data-ocid="snake.canvas_target"
            ref={canvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="block w-full"
            style={{ imageRendering: "pixelated", aspectRatio: "1" }}
          />
          {gameState !== "running" && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center"
              style={{ background: "rgba(10,10,15,0.85)" }}
            >
              {gameState === "dead" ? (
                <>
                  <p
                    className="font-display text-2xl font-bold mb-2"
                    style={{ color: "oklch(0.577 0.245 27.325)" }}
                  >
                    💀 GAME OVER
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Final Score:{" "}
                    <span className="font-bold text-foreground">
                      {displayScore}
                    </span>
                  </p>
                  <Button
                    data-ocid="snake.primary_button"
                    onClick={startGame}
                    className="font-display font-bold"
                    style={{ background: "oklch(0.68 0.15 168)" }}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" /> Play Again
                  </Button>
                </>
              ) : (
                <>
                  <p className="font-display text-4xl mb-2">🐍</p>
                  <p
                    className="font-display text-2xl font-bold mb-4"
                    style={{ color: "oklch(0.68 0.15 168)" }}
                  >
                    SNAKE
                  </p>
                  <Button
                    data-ocid="snake.button"
                    onClick={startGame}
                    className="font-display font-bold px-8"
                    style={{
                      background:
                        "linear-gradient(135deg, oklch(0.68 0.15 168), oklch(0.60 0.12 168))",
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" /> Start Game
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* On-screen controls */}
        <div className="grid grid-cols-3 gap-2 max-w-[160px] mx-auto">
          <div />
          <Button
            data-ocid="snake.secondary_button"
            variant="outline"
            size="icon"
            onClick={() => setDir("UP")}
            className="border-border"
          >
            <ChevronUp className="w-5 h-5" />
          </Button>
          <div />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDir("LEFT")}
            className="border-border"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDir("DOWN")}
            className="border-border"
          >
            <ChevronDown className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDir("RIGHT")}
            className="border-border"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
