import Text "mo:core/Text";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Data Types
  type UserProfile = {
    username : Text;
    avatarColor : Text;
    totalScore : Int;
    gamesPlayed : Int;
    wins : Int;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.username, p2.username);
    };

    public func compareByScore(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Int.compare(p2.totalScore, p1.totalScore);
    };
  };

  // Data Structures
  type ChatMessage = {
    sender : Text;
    content : Text;
    timestamp : Time.Time;
  };

  module ChatMessage {
    public func compareByTime(a : ChatMessage, b : ChatMessage) : Order.Order {
      Int.compare(b.timestamp, a.timestamp);
    };
  };

  // Game Result Type
  type GameResult = {
    gameName : Text;
    score : Int;
    won : Bool;
    timestamp : Time.Time;
  };

  // Initialization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let userProfiles = Map.empty<Principal, UserProfile>();

  let chatMessages = List.empty<ChatMessage>();

  // Maps users to their lists of game results
  let gameResults = Map.empty<Principal, List.List<GameResult>>();

  // User Profile Functions
  public shared ({ caller }) func createProfile(username : Text, avatarColor : Text) : async () {
    if (userProfiles.containsKey(caller)) {
      Runtime.trap("Profile already exists");
    };
    let profile : UserProfile = {
      username;
      avatarColor;
      totalScore = 0;
      gamesPlayed = 0;
      wins = 0;
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query func getUserProfile(user : Principal) : async ?UserProfile {
    userProfiles.get(user);
  };

  public shared ({ caller }) func changeAvatarColor(color : Text) : async () {
    switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) {
        let updatedProfile : UserProfile = {
          username = profile.username;
          avatarColor = color;
          totalScore = profile.totalScore;
          gamesPlayed = profile.gamesPlayed;
          wins = profile.wins;
        };
        userProfiles.add(caller, updatedProfile);
      };
    };
  };

  // Chat Functions
  public shared ({ caller }) func sendMessage(content : Text) : async () {
    let username = getUsername(caller);
    let message : ChatMessage = {
      sender = username;
      content;
      timestamp = Time.now();
    };

    chatMessages.add(message);

    // Maintain only last 50 messages
    if (chatMessages.size() > 50) {
      ignore chatMessages.removeLast();
    };
  };

  public query func getRecentMessages() : async [ChatMessage] {
    chatMessages.toArray().sort(ChatMessage.compareByTime);
  };

  // Game Functions
  public shared ({ caller }) func recordGameResult(gameResult : GameResult) : async () {
    let profile = switch (userProfiles.get(caller)) {
      case (null) { Runtime.trap("Profile not found") };
      case (?profile) { profile };
    };

    let updatedProfile : UserProfile = {
      username = profile.username;
      avatarColor = profile.avatarColor;
      totalScore = profile.totalScore + gameResult.score;
      gamesPlayed = profile.gamesPlayed + 1;
      wins = profile.wins + (if (gameResult.won) { 1 } else { 0 });
    };
    userProfiles.add(caller, updatedProfile);

    // Add to user's game history
    let resultsList = switch (gameResults.get(caller)) {
      case (null) { List.empty<GameResult>() };
      case (?list) { list };
    };
    resultsList.add(gameResult);

    // Keep only the last 50 game results
    if (resultsList.size() > 50) {
      ignore resultsList.removeLast();
    };

    gameResults.add(caller, resultsList);
  };

  public query ({ caller }) func getUserGameHistory() : async [GameResult] {
    switch (gameResults.get(caller)) {
      case (null) { [] };
      case (?resultsList) {
        resultsList.toArray();
      };
    };
  };

  // Leaderboard
  public query func getLeaderboard() : async [UserProfile] {
    userProfiles.values().toArray().sort(UserProfile.compareByScore).sliceToArray(0, 10);
  };

  // Helper function to get username from caller principal
  func getUsername(caller : Principal) : Text {
    switch (userProfiles.get(caller)) {
      case (null) { "Anonymous" };
      case (?profile) { profile.username };
    };
  };
};
