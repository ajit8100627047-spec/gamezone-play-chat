import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ChatMessage, GameResult, UserProfile } from "../backend";
import { useActor } from "./useActor";

export function useProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      username,
      avatarColor,
    }: { username: string; avatarColor: string }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createProfile(username, avatarColor);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}

export function useLeaderboard() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getLeaderboard();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30_000,
  });
}

export function useRecentMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecentMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 3_000,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.sendMessage(content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useGameHistory() {
  const { actor, isFetching } = useActor();
  return useQuery<GameResult[]>({
    queryKey: ["gameHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserGameHistory();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRecordGameResult() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (result: GameResult) => {
      if (!actor) throw new Error("Not connected");
      return actor.recordGameResult(result);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["profile"] });
      qc.invalidateQueries({ queryKey: ["gameHistory"] });
      qc.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

export function useChangeAvatarColor() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (color: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.changeAvatarColor(color);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profile"] }),
  });
}
