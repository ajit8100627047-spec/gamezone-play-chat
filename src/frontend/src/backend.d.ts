import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface ChatMessage {
    content: string;
    sender: string;
    timestamp: Time;
}
export type Time = bigint;
export interface GameResult {
    won: boolean;
    score: bigint;
    timestamp: Time;
    gameName: string;
}
export interface UserProfile {
    username: string;
    gamesPlayed: bigint;
    wins: bigint;
    totalScore: bigint;
    avatarColor: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    changeAvatarColor(color: string): Promise<void>;
    createProfile(username: string, avatarColor: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getLeaderboard(): Promise<Array<UserProfile>>;
    getRecentMessages(): Promise<Array<ChatMessage>>;
    getUserGameHistory(): Promise<Array<GameResult>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    recordGameResult(gameResult: GameResult): Promise<void>;
    sendMessage(content: string): Promise<void>;
}
