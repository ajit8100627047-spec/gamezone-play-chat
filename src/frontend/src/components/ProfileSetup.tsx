import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Gamepad2, Palette, User } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useCreateProfile } from "../hooks/useQueries";

const AVATAR_COLORS = [
  "#8b5cf6",
  "#06b6d4",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#3b82f6",
  "#14b8a6",
];

export default function ProfileSetup() {
  const [username, setUsername] = useState("");
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState("");
  const { mutateAsync, isPending } = useCreateProfile();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) {
      setError("Username required");
      return;
    }
    if (trimmed.length < 3) {
      setError("At least 3 characters");
      return;
    }
    if (trimmed.length > 20) {
      setError("Max 20 characters");
      return;
    }
    setError("");
    try {
      await mutateAsync({ username: trimmed, avatarColor });
      toast.success("Welcome to GameZone! 🎮");
    } catch {
      toast.error("Failed to create profile. Try again.");
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden px-4">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.60 0.22 290 / 0.3) 1px, transparent 1px), linear-gradient(90deg, oklch(0.60 0.22 290 / 0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <div
        className="absolute top-1/3 left-1/3 w-72 h-72 rounded-full blur-3xl opacity-15"
        style={{ background: "oklch(0.60 0.22 290)" }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
        style={{
          background: "oklch(0.105 0.018 285)",
          border: "1px solid oklch(0.20 0.028 285)",
          borderRadius: "1.25rem",
        }}
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <Gamepad2
              className="w-12 h-12 mx-auto mb-3"
              style={{ color: "oklch(0.60 0.22 290)" }}
            />
            <h2 className="font-display text-3xl font-bold">
              Create Your Profile
            </h2>
            <p className="text-muted-foreground mt-2">
              Set up your gaming identity
            </p>
          </div>

          {/* Avatar preview */}
          <div className="flex justify-center mb-8">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-display font-bold text-white"
              style={{
                background: avatarColor,
                boxShadow: `0 0 30px ${avatarColor}60`,
              }}
            >
              {username ? (
                username[0].toUpperCase()
              ) : (
                <User className="w-10 h-10" />
              )}
            </motion.div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label
                htmlFor="username"
                className="font-display font-semibold text-sm tracking-wide mb-2 block"
              >
                GAMER TAG
              </Label>
              <Input
                id="username"
                data-ocid="setup.input"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError("");
                }}
                placeholder="Enter your gamer tag..."
                maxLength={20}
                className="bg-input border-border text-foreground placeholder:text-muted-foreground/50 focus:border-primary h-12 text-lg"
              />
              {error && (
                <p
                  data-ocid="setup.error_state"
                  className="text-destructive text-sm mt-1"
                >
                  {error}
                </p>
              )}
            </div>

            <div>
              <Label className="font-display font-semibold text-sm tracking-wide mb-3 block">
                <Palette className="inline w-4 h-4 mr-1" /> AVATAR COLOR
              </Label>
              <div className="grid grid-cols-8 gap-2">
                {AVATAR_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    data-ocid="setup.select"
                    onClick={() => setAvatarColor(color)}
                    className="w-10 h-10 rounded-full transition-all hover:scale-110 focus:outline-none"
                    style={{
                      background: color,
                      boxShadow:
                        avatarColor === color ? `0 0 15px ${color}` : "none",
                      transform:
                        avatarColor === color ? "scale(1.2)" : undefined,
                      border:
                        avatarColor === color
                          ? "2px solid white"
                          : "2px solid transparent",
                    }}
                    aria-label={`Select color ${color}`}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              data-ocid="setup.submit_button"
              disabled={isPending}
              className="w-full h-12 font-display font-bold text-lg tracking-wider glow-purple transition-all hover:scale-[1.02]"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.60 0.22 290), oklch(0.55 0.20 260))",
              }}
            >
              {isPending ? "Creating..." : "Enter the Arena 🎮"}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
